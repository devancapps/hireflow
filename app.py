"""
HireFlow — Flask Application
ProService New Hire Packet Automation Prototype
"""

import os
import uuid
import json
import base64
import traceback

from flask import Flask, request, jsonify, render_template, send_from_directory
from dotenv import load_dotenv
from pdf2image import convert_from_path
from PIL import Image
import anthropic
from io import BytesIO

from validator import validate_extraction, build_prismhr_payload, generate_missing_info_email, load_client_codes

# Use absolute paths so uploads work regardless of CWD
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── Load environment ───────────────────────────────────────────────────
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "hireflow-dev-secret")
app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads")
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH", 20971520))

# Ensure uploads directory exists
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Anthropic client
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ─── Expected Forms for Completeness Check ──────────────────────────────

EXPECTED_FORMS = {
    "Employment Form & Agreement": {"min_page": 2, "max_page": 4, "required": True},
    "Form I-9": {"min_page": 5, "max_page": 6, "required": True},
    "Federal W-4": {"min_page": 9, "max_page": 12, "required": True},
    "State HW-4": {"min_page": 13, "max_page": 14, "required": True},
    "Direct Deposit Authorization": {"required": False},
    "Health Care Waiver (HC-5)": {"required": False},
}
EXPECTED_MIN_PAGES = 8
EXPECTED_TYPICAL_PAGES = 12

# ─── In-memory store for processed packets ──────────────────────────────
processed_packets = {}


def save_packet_to_disk(upload_id, data):
    """Persist packet data to a JSON file alongside the PDF."""
    json_path = os.path.join(app.config["UPLOAD_FOLDER"], f"{upload_id}.json")
    with open(json_path, "w") as f:
        json.dump(data, f)


def load_packet_from_disk(upload_id):
    """Load packet data from disk if not in memory."""
    if upload_id in processed_packets:
        return processed_packets[upload_id]
    json_path = os.path.join(app.config["UPLOAD_FOLDER"], f"{upload_id}.json")
    if os.path.exists(json_path):
        with open(json_path, "r") as f:
            data = json.load(f)
        processed_packets[upload_id] = data  # Re-cache in memory
        return data
    return None


# ─── Routes ─────────────────────────────────────────────────────────────

@app.route("/")
def dashboard():
    """Packet dashboard screen."""
    return render_template("dashboard.html")


@app.route("/upload")
def index():
    """Upload screen."""
    return render_template("index.html")


@app.route("/review/<upload_id>")
def review(upload_id):
    """Review + validation screen."""
    return render_template("review.html", upload_id=upload_id)


@app.route("/uploads/<filename>")
def serve_pdf(filename):
    """Serve uploaded PDF files for the viewer."""
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.route("/process", methods=["POST"])
def process_packet():
    """Upload PDF, run extraction + quality + completeness."""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Only PDF files are accepted"}), 400

        # Save the uploaded PDF
        upload_id = str(uuid.uuid4())
        filename = f"{upload_id}.pdf"
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        # Step 1: Completeness check (page count)
        completeness = check_completeness(filepath)

        # Step 2: Convert PDF to images for Claude Vision
        images = convert_pdf_to_images(filepath)

        # Step 3: Run quality scoring on pages
        quality = score_quality(images)

        # Step 4: Run AI extraction
        extracted = extract_with_claude(images)

        # Step 5: Validate against client codes
        client_codes = load_client_codes()
        validated = validate_extraction(extracted, client_codes)

        # Store result
        result = {
            "upload_id": upload_id,
            "filename": filename,
            "original_filename": file.filename,
            "completeness": completeness,
            "quality": quality,
            "extracted": extracted,
            "validated": validated,
        }
        processed_packets[upload_id] = result
        save_packet_to_disk(upload_id, result)

        return jsonify({
            "success": True,
            "upload_id": upload_id,
            "completeness": completeness,
            "quality": quality,
            "validated": validated,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/packet/<upload_id>")
def get_packet(upload_id):
    """Get stored packet data (checks memory first, then disk)."""
    packet = load_packet_from_disk(upload_id)
    if not packet:
        return jsonify({"error": "Packet not found"}), 404
    return jsonify({
        "success": True,
        "upload_id": upload_id,
        "filename": packet["filename"],
        "original_filename": packet["original_filename"],
        "completeness": packet["completeness"],
        "quality": packet["quality"],
        "validated": packet["validated"],
    })


@app.route("/generate-email", methods=["POST"])
def generate_email():
    """Generate missing-info email draft."""
    try:
        data = request.json
        upload_id = data.get("upload_id")

        packet = load_packet_from_disk(upload_id) if upload_id else None
        if not packet:
            return jsonify({"error": "Packet not found"}), 404

        validated = packet["validated"]

        # Check if user sent updated validated data
        if "validated" in data:
            validated = data["validated"]

        email = generate_missing_info_email(validated)
        return jsonify({"success": True, "email": email})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/submit", methods=["POST"])
def submit_to_prismhr():
    """Build mock PrismHR payload."""
    try:
        data = request.json
        upload_id = data.get("upload_id")

        packet = load_packet_from_disk(upload_id) if upload_id else None
        if not packet:
            return jsonify({"error": "Packet not found"}), 404

        validated = packet["validated"]

        # Check if user sent updated validated data
        if "validated" in data:
            validated = data["validated"]

        client_codes = load_client_codes()
        payload = build_prismhr_payload(validated, client_codes)

        # Mock response
        ssn = payload["newHireEmployee"][0].get("ssn", "000-00-0000")
        mock_response = {
            "errorCode": "0",
            "errorMessage": "",
            "importResult": {
                "importBatchId": f"BATCH-{uuid.uuid4().hex[:8].upper()}",
                "importError": [],
                "importedHire": [{
                    "ssn": ssn,
                    "firstName": payload["newHireEmployee"][0].get("firstName"),
                    "lastName": payload["newHireEmployee"][0].get("lastName"),
                    "validFlag": True,
                }]
            }
        }

        commit_response = {
            "errorCode": "0",
            "errorMessage": "",
            "commitResult": {
                "commitError": [],
                "committedHire": [{
                    "ssn": ssn,
                    "employeeId": f"EMP-{uuid.uuid4().hex[:5].upper()}"
                }]
            }
        }

        return jsonify({
            "success": True,
            "payload": payload,
            "mockImportResponse": mock_response,
            "mockCommitResponse": commit_response,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/update-field", methods=["POST"])
def update_field():
    """Update a single field in the validated data (from reviewer edits)."""
    try:
        data = request.json
        upload_id = data.get("upload_id")
        field_name = data.get("field")
        new_value = data.get("value")

        packet = load_packet_from_disk(upload_id) if upload_id else None
        if not packet:
            return jsonify({"error": "Packet not found"}), 404

        validated = packet["validated"]["validated"]

        if field_name in validated and isinstance(validated[field_name], dict):
            validated[field_name]["value"] = new_value
            validated[field_name]["status"] = "valid"
            validated[field_name]["message"] = f"Manually corrected to: {new_value}"

        # Re-run submission check
        from validator import REQUIRED_FIELDS
        blocking = []
        for rf in REQUIRED_FIELDS:
            field_result = validated.get(rf, {})
            if isinstance(field_result, dict):
                status = field_result.get("status")
                if status in ("missing", "invalid"):
                    blocking.append(rf)

        packet["validated"]["summary"]["blocking_fields"] = blocking
        packet["validated"]["summary"]["can_submit"] = len(blocking) == 0
        save_packet_to_disk(upload_id, packet)

        return jsonify({"success": True, "can_submit": len(blocking) == 0})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ─── Helper Functions ───────────────────────────────────────────────────

def check_completeness(filepath):
    """Check packet completeness based on page count."""
    try:
        images = convert_from_path(filepath, dpi=72, first_page=1, last_page=1)
        # Get total page count by converting all (low DPI for speed)
        all_images = convert_from_path(filepath, dpi=72)
        page_count = len(all_images)
    except Exception:
        page_count = 0

    if page_count >= EXPECTED_TYPICAL_PAGES:
        status = "complete"
        message = f"{page_count} pages detected. Packet appears complete."
        warning = None
    elif page_count >= EXPECTED_MIN_PAGES:
        status = "possibly_incomplete"
        message = f"{page_count} pages detected. Expected ~{EXPECTED_TYPICAL_PAGES}."
        warning = "Packet may be missing optional forms. Review carefully."
    else:
        status = "too_short"
        message = f"Only {page_count} pages detected. Expected at least {EXPECTED_MIN_PAGES}."
        warning = "Packet may be missing required forms. Verify before proceeding."

    return {
        "page_count": page_count,
        "status": status,
        "message": message,
        "warning": warning,
    }


def convert_pdf_to_images(filepath, dpi=150):
    """Convert PDF pages to base64-encoded JPEG images."""
    pil_images = convert_from_path(filepath, dpi=dpi)
    images = []
    for i, img in enumerate(pil_images):
        buffer = BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        images.append({
            "page": i + 1,
            "base64": b64,
            "width": img.width,
            "height": img.height,
        })
    return images


def score_quality(images):
    """Score scan quality using Claude Vision."""
    try:
        # Sample up to 4 pages for quality scoring (to save API calls)
        sample_indices = []
        total = len(images)
        if total <= 4:
            sample_indices = list(range(total))
        else:
            # First, middle pages, last
            sample_indices = [0, total // 3, 2 * total // 3, total - 1]

        page_scores = []
        worst_pages = []

        for idx in sample_indices:
            img = images[idx]
            try:
                response = client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=500,
                    messages=[{
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": img["base64"],
                                }
                            },
                            {
                                "type": "text",
                                "text": """Analyze this page image for scan/photo quality. Score each dimension 1-5:
- sharpness: Is text crisp and legible? (1=very blurry, 5=perfectly sharp)
- lighting: Is the page evenly lit? (1=heavy shadows/glare, 5=uniform lighting)
- skew: Is the page straight? (1=severely rotated/angled, 5=perfectly straight)
- coverage: Are all page edges visible? (1=significant cropping, 5=full page visible)

Return JSON only:
{
  "sharpness": <1-5>,
  "lighting": <1-5>,
  "skew": <1-5>,
  "coverage": <1-5>,
  "overall": <1-5>,
  "issues": ["list of specific problems found"],
  "recommendation": "one sentence action if overall < 4, else null"
}"""
                            }
                        ]
                    }]
                )
                text = response.content[0].text.strip()
                # Try to parse JSON from the response
                if "```" in text:
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                    text = text.strip()
                score = json.loads(text)
                score["page"] = img["page"]
                page_scores.append(score)

                if score.get("overall", 5) < 4:
                    worst_pages.append(score)
            except Exception as e:
                # If quality scoring fails for a page, use defaults
                page_scores.append({
                    "page": img["page"],
                    "sharpness": 4,
                    "lighting": 4,
                    "skew": 4,
                    "coverage": 4,
                    "overall": 4.0,
                    "issues": [],
                    "recommendation": None,
                    "error": str(e),
                })

        # Calculate overall average
        if page_scores:
            avg_overall = round(sum(s.get("overall", 4) for s in page_scores) / len(page_scores), 1)
        else:
            avg_overall = 4.0

        return {
            "overall_score": avg_overall,
            "page_scores": page_scores,
            "worst_pages": sorted(worst_pages, key=lambda x: x.get("overall", 5)),
            "pages_sampled": len(sample_indices),
            "total_pages": len(images),
        }

    except Exception as e:
        return {
            "overall_score": 4.0,
            "page_scores": [],
            "worst_pages": [],
            "error": str(e),
        }


def extract_with_claude(images):
    """Extract employee data from scanned pages using Claude Vision."""
    # Build the content array with all page images
    content = []
    for img in images:
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/jpeg",
                "data": img["base64"],
            }
        })

    extraction_prompt = """You are extracting employee data from a scanned new hire packet for a company called
Jordan's Surf Shack (client ID: 15650). These are handwritten forms.

Extract ALL of the following fields. For any field you cannot read clearly or find,
set the value to null and explain in the confidence_notes.

Return ONLY valid JSON matching this exact schema:

{
  "employee": {
    "firstName": string | null,
    "lastName": string | null,
    "middleInitial": string | null,
    "ssn": string | null,
    "dateOfBirth": string | null,
    "gender": string | null,
    "email": string | null,
    "phone": string | null,
    "mobilePhone": string | null,
    "addressLine1": string | null,
    "addressLine2": string | null,
    "city": string | null,
    "state": string | null,
    "zip": string | null,
    "mailingAddressLine1": string | null,
    "mailingCity": string | null,
    "mailingState": string | null,
    "mailingZip": string | null,
    "emergencyContactName": string | null,
    "emergencyContactPhone": string | null,
    "emergencyContactRelation": string | null
  },
  "employment": {
    "origHireDate": string | null,
    "lastHireDate": string | null,
    "peoStartDate": string | null,
    "jobTitleRaw": string | null,
    "payMethod": string | null,
    "payRate": string | null,
    "payRatePeriod": string | null,
    "employeeTypRaw": string | null,
    "locationRaw": string | null,
    "standardHours": string | null
  },
  "w4": {
    "filingStatus": string | null,
    "allowances": string | null,
    "additionalWithholding": string | null
  },
  "directDeposit": {
    "present": boolean,
    "bankName": string | null,
    "routingNumber": string | null,
    "accountNumber": string | null,
    "accountType": string | null,
    "paymentMethod": string | null
  },
  "confidence": {
    "overall": number,
    "fields": {
      "firstName": number,
      "lastName": number,
      "ssn": number,
      "dateOfBirth": number,
      "origHireDate": number,
      "jobTitleRaw": number,
      "locationRaw": number,
      "payRate": number
    },
    "notes": string | null
  }
}

Important rules:
- Dates should be YYYY-MM-DD format
- SSN should include dashes (xxx-xx-xxxx)
- Gender should be M, F, X, D, or U
- payMethod should be H (hourly), S (salary), or C (commission)
- For confidence scores, use 0.0 to 1.0 where 1.0 is perfectly clear
- If the direct deposit form is filled out, set present to true
- Read EVERY page carefully — data is spread across multiple forms"""

    content.append({
        "type": "text",
        "text": extraction_prompt
    })

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": content
            }]
        )

        text = response.content[0].text.strip()

        # Parse JSON from response
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        extracted = json.loads(text)
        return calibrate_confidence(extracted)

    except json.JSONDecodeError as e:
        # Retry with simplified prompt
        print(f"JSON parse error on first attempt: {e}")
        print(f"Raw response: {text[:500]}")
        try:
            return retry_extraction(content)
        except Exception:
            return get_empty_extraction("Failed to parse AI response")

    except Exception as e:
        print(f"Extraction error: {e}")
        traceback.print_exc()
        return get_empty_extraction(str(e))


def retry_extraction(content):
    """Retry extraction with a simpler prompt."""
    # Replace the last text element with a simpler prompt
    simplified_content = content[:-1]  # Remove old prompt
    simplified_content.append({
        "type": "text",
        "text": """Extract employee data from these scanned forms. Return ONLY valid JSON with these fields:
{
  "employee": {"firstName": null, "lastName": null, "middleInitial": null, "ssn": null, "dateOfBirth": null, "gender": null, "email": null, "phone": null, "mobilePhone": null, "addressLine1": null, "addressLine2": null, "city": null, "state": null, "zip": null, "mailingAddressLine1": null, "mailingCity": null, "mailingState": null, "mailingZip": null, "emergencyContactName": null, "emergencyContactPhone": null, "emergencyContactRelation": null},
  "employment": {"origHireDate": null, "lastHireDate": null, "peoStartDate": null, "jobTitleRaw": null, "payMethod": null, "payRate": null, "payRatePeriod": null, "employeeTypRaw": null, "locationRaw": null, "standardHours": null},
  "w4": {"filingStatus": null, "allowances": null, "additionalWithholding": null},
  "directDeposit": {"present": false, "bankName": null, "routingNumber": null, "accountNumber": null, "accountType": null, "paymentMethod": null},
  "confidence": {"overall": 0.5, "fields": {"firstName": 0.5, "lastName": 0.5, "ssn": 0.5, "dateOfBirth": 0.5, "origHireDate": 0.5, "jobTitleRaw": 0.5, "locationRaw": 0.5, "payRate": 0.5}, "notes": null}
}
Fill in values from the forms. Dates as YYYY-MM-DD. SSN with dashes. Return ONLY JSON."""
    })

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{"role": "user", "content": simplified_content}]
    )

    text = response.content[0].text.strip()
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    return calibrate_confidence(json.loads(text))


# ─── Confidence Calibration ──────────────────────────────────────────────

# Fields where extraction errors carry high business risk (wrong digit = failed
# PrismHR submission, compliance issue). These get a penalty multiplier.
HIGH_RISK_FIELDS = {"ssn", "routingNumber", "accountNumber", "dateOfBirth"}

CONFIDENCE_CAP = 0.95          # No field should ever claim 100%
HIGH_RISK_PENALTY = 0.85       # Multiply high-risk fields by this


def calibrate_confidence(extracted):
    """Post-process confidence scores: cap at 95% and penalize high-risk fields."""
    confidence = extracted.get("confidence")
    if not confidence:
        return extracted

    fields = confidence.get("fields", {})
    for field_name, score in fields.items():
        if not isinstance(score, (int, float)):
            continue
        # Cap at 95%
        score = min(score, CONFIDENCE_CAP)
        # Apply penalty for high-risk numeric fields
        if field_name in HIGH_RISK_FIELDS:
            score = round(score * HIGH_RISK_PENALTY, 2)
        fields[field_name] = score

    # Recalculate overall as average of field scores
    if fields:
        confidence["overall"] = round(sum(fields.values()) / len(fields), 2)

    return extracted


def get_empty_extraction(error_msg):
    """Return an empty extraction structure with error info."""
    return {
        "employee": {
            "firstName": None, "lastName": None, "middleInitial": None,
            "ssn": None, "dateOfBirth": None, "gender": None,
            "email": None, "phone": None, "mobilePhone": None,
            "addressLine1": None, "addressLine2": None,
            "city": None, "state": None, "zip": None,
            "mailingAddressLine1": None, "mailingCity": None,
            "mailingState": None, "mailingZip": None,
            "emergencyContactName": None, "emergencyContactPhone": None,
            "emergencyContactRelation": None,
        },
        "employment": {
            "origHireDate": None, "lastHireDate": None, "peoStartDate": None,
            "jobTitleRaw": None, "payMethod": None, "payRate": None,
            "payRatePeriod": None, "employeeTypRaw": None,
            "locationRaw": None, "standardHours": None,
        },
        "w4": {
            "filingStatus": None, "allowances": None,
            "additionalWithholding": None,
        },
        "directDeposit": {
            "present": False, "bankName": None, "routingNumber": None,
            "accountNumber": None, "accountType": None, "paymentMethod": None,
        },
        "confidence": {
            "overall": 0.0,
            "fields": {},
            "notes": f"Extraction failed: {error_msg}",
        },
    }


# ─── Run ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(debug=True, port=port)
