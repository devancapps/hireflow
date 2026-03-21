"""
HireFlow Validation Engine
Validates extracted employee data against client-specific PrismHR codes.
"""

import json
import os
import re

# ─── Code Mapping Tables ───────────────────────────────────────────────

JOB_CODE_MAP = {
    "instructor": "IN",
    "surf instructor": "IN",
    "retail worker": "RW",
    "retail": "RW",
    "retail associate": "RW",
    "sales associate": "RW",
    "cashier": "RW",
    "owner": "OW",
    "manager": "OW",
}

LOCATION_MAP = {
    "beach": "2",
    "beach location": "2",
    "beach loc": "2",
    "retail": "1",
    "retail location": "1",
    "retail loc": "1",
    "store": "1",
    "shop": "1",
}

BENEFIT_GROUP_MAP = {
    "OW": "OWNER",
    "IN": "PRIMARY",
    "RW": "PRIMARY",
}

PAY_METHOD_MAP = {
    "hourly": "H",
    "hour": "H",
    "h": "H",
    "salary": "S",
    "salaried": "S",
    "s": "S",
    "commission": "C",
    "c": "C",
}

EMPLOYEE_TYPE_MAP = {
    "full time": "FT",
    "full-time": "FT",
    "fulltime": "FT",
    "ft": "FT",
    "part time": "PT",
    "part-time": "PT",
    "parttime": "PT",
    "pt": "PT",
    "casual": "CA",
    "ca": "CA",
}

EMPLOYEE_STATUS_MAP = {
    "active": "A",
    "a": "A",
    "terminated": "T",
    "t": "T",
    "on leave": "L",
    "leave": "L",
    "l": "L",
}

GENDER_MAP = {
    "male": "M",
    "m": "M",
    "female": "F",
    "f": "F",
    "non-binary": "X",
    "nonbinary": "X",
    "x": "X",
    "declined": "D",
    "d": "D",
    "unknown": "U",
    "u": "U",
}

FILING_STATUS_MAP = {
    "single": "S",
    "single or married filing separately": "S",
    "s": "S",
    "ss": "S",
    "married": "M",
    "married filing jointly": "M",
    "married filing jointly or qualifying surviving spouse": "M",
    "m": "M",
    "mj": "M",
    "head of household": "H",
    "h": "H",
}

# ─── Required fields that block submission if missing/invalid ──────────

REQUIRED_FIELDS = [
    "firstName", "lastName", "ssn", "origHireDate", "lastHireDate",
    "peoStartDate", "jobCode", "workLocationCode", "employeeStatusCode",
    "standardHours"
]


def load_client_codes(filepath=None):
    """Load client codes from JSON file."""
    if filepath is None:
        filepath = os.path.join(os.path.dirname(__file__), "data", "client_codes.json")
    with open(filepath, "r") as f:
        return json.load(f)


def _normalize(value):
    """Normalize a string value for matching."""
    if value is None:
        return None
    return str(value).strip().lower()


def _make_field_result(value, status, raw=None, message=None):
    """Create a standardized field validation result."""
    return {
        "value": value,
        "status": status,
        "raw": raw,
        "message": message,
    }


def validate_extraction(extracted_data, client_codes=None):
    """
    Validate extracted employee data against client codes.
    Returns a validated result with status per field.
    """
    if client_codes is None:
        client_codes = load_client_codes()

    employee = extracted_data.get("employee", {})
    employment = extracted_data.get("employment", {})
    w4 = extracted_data.get("w4", {})
    direct_deposit = extracted_data.get("directDeposit", {})
    confidence = extracted_data.get("confidence", {})
    field_confidence = confidence.get("fields", {})

    validated = {}
    summary = {"missing": [], "invalid": [], "inferred": [], "auto_assigned": [], "valid": []}

    # ─── Build valid code sets ──────────────────────────────────────────
    valid_job_codes = {item["code"] for item in client_codes.get("jobCodes", [])}
    valid_locations = {item["code"] for item in client_codes.get("locations", [])}
    valid_pay_groups = {item["code"] for item in client_codes.get("payGroups", [])}
    valid_benefit_groups = {item["code"] for item in client_codes.get("benefitGroups", [])}
    valid_emp_types = {item["code"] for item in client_codes.get("employeeTypes", [])}
    valid_emp_statuses = {item["code"] for item in client_codes.get("employeeStatuses", [])}

    # ─── Employee Personal Fields ───────────────────────────────────────

    # First Name
    val = employee.get("firstName")
    if val:
        validated["firstName"] = _make_field_result(val, "valid", val, "Extracted from form")
        summary["valid"].append("firstName")
    else:
        validated["firstName"] = _make_field_result(None, "missing", None, "First name not found on form")
        summary["missing"].append("firstName")

    # Last Name
    val = employee.get("lastName")
    if val:
        validated["lastName"] = _make_field_result(val, "valid", val, "Extracted from form")
        summary["valid"].append("lastName")
    else:
        validated["lastName"] = _make_field_result(None, "missing", None, "Last name not found on form")
        summary["missing"].append("lastName")

    # Middle Initial
    val = employee.get("middleInitial")
    validated["middleInitial"] = _make_field_result(
        val, "valid" if val else "missing", val,
        "Extracted from form" if val else "Middle initial not found"
    )
    if val:
        summary["valid"].append("middleInitial")

    # SSN
    val = employee.get("ssn")
    if val:
        # Clean SSN format
        clean_ssn = re.sub(r"[^\d]", "", str(val))
        if len(clean_ssn) == 9:
            formatted_ssn = f"{clean_ssn[:3]}-{clean_ssn[3:5]}-{clean_ssn[5:]}"
            validated["ssn"] = _make_field_result(formatted_ssn, "valid", val, "SSN extracted and formatted")
            summary["valid"].append("ssn")
        else:
            validated["ssn"] = _make_field_result(val, "invalid", val, f"SSN has {len(clean_ssn)} digits, expected 9")
            summary["invalid"].append("ssn")
    else:
        validated["ssn"] = _make_field_result(None, "missing", None, "SSN not found on form")
        summary["missing"].append("ssn")

    # Date of Birth
    val = employee.get("dateOfBirth")
    if val:
        validated["dateOfBirth"] = _make_field_result(val, "valid", val, "Extracted from form")
        summary["valid"].append("dateOfBirth")
    else:
        validated["dateOfBirth"] = _make_field_result(None, "missing", None, "Date of birth not found")
        summary["missing"].append("dateOfBirth")

    # Gender
    val = employee.get("gender")
    if val:
        norm = _normalize(val)
        mapped = GENDER_MAP.get(norm, val.upper() if len(val) == 1 else None)
        if mapped and mapped in {"M", "F", "X", "D", "U"}:
            validated["gender"] = _make_field_result(mapped, "valid", val, f"Mapped from '{val}' -> {mapped}")
            summary["valid"].append("gender")
        else:
            validated["gender"] = _make_field_result(val, "invalid", val, f"Unrecognized gender value: {val}")
            summary["invalid"].append("gender")
    else:
        validated["gender"] = _make_field_result(None, "missing", None, "Gender not found on form")
        summary["missing"].append("gender")

    # Email
    val = employee.get("email")
    validated["email"] = _make_field_result(
        val, "valid" if val else "missing", val,
        "Extracted from form" if val else "Email not found"
    )
    if val:
        summary["valid"].append("email")

    # Phone
    val = employee.get("phone")
    validated["phone"] = _make_field_result(
        val, "valid" if val else "missing", val,
        "Extracted from form" if val else "Phone not found"
    )
    if val:
        summary["valid"].append("phone")

    # Mobile Phone
    val = employee.get("mobilePhone")
    validated["mobilePhone"] = _make_field_result(
        val, "valid" if val else "missing", val,
        "Extracted from form" if val else "Mobile phone not provided"
    )
    if val:
        summary["valid"].append("mobilePhone")

    # Address fields
    for field_name in ["addressLine1", "addressLine2", "city", "state", "zip"]:
        val = employee.get(field_name)
        validated[field_name] = _make_field_result(
            val, "valid" if val else "missing", val,
            "Extracted from form" if val else f"{field_name} not found"
        )
        if val:
            summary["valid"].append(field_name)

    # Mailing address fields (optional)
    for field_name in ["mailingAddressLine1", "mailingCity", "mailingState", "mailingZip"]:
        val = employee.get(field_name)
        validated[field_name] = _make_field_result(
            val, "valid" if val else "missing", val,
            "Extracted from form" if val else "Same as residence or not provided"
        )
        if val:
            summary["valid"].append(field_name)

    # Emergency contact (optional but important)
    val = employee.get("emergencyContactName")
    validated["emergencyContactName"] = _make_field_result(
        val, "valid" if val else "missing", val,
        "Extracted from form" if val else "Emergency contact name not found"
    )
    if val:
        summary["valid"].append("emergencyContactName")

    val = employee.get("emergencyContactPhone")
    validated["emergencyContactPhone"] = _make_field_result(
        val, "valid" if val else "missing", val,
        "Extracted from form" if val else "Emergency contact phone not found"
    )
    if val:
        summary["valid"].append("emergencyContactPhone")

    val = employee.get("emergencyContactRelation")
    validated["emergencyContactRelation"] = _make_field_result(
        val, "valid" if val else "missing", val,
        "Extracted from form" if val else "Emergency contact relationship not found"
    )
    if val:
        summary["valid"].append("emergencyContactRelation")

    # ─── Employment Fields ──────────────────────────────────────────────

    # Hire Dates
    for date_field in ["origHireDate", "lastHireDate", "peoStartDate"]:
        val = employment.get(date_field)
        if val:
            validated[date_field] = _make_field_result(val, "valid", val, "Extracted from form")
            summary["valid"].append(date_field)
        else:
            # Try to infer lastHireDate and peoStartDate from origHireDate
            if date_field in ("lastHireDate", "peoStartDate") and employment.get("origHireDate"):
                inferred = employment["origHireDate"]
                validated[date_field] = _make_field_result(
                    inferred, "inferred", None,
                    f"Inferred from origHireDate ({inferred}) — same for new hires"
                )
                summary["inferred"].append(date_field)
            else:
                validated[date_field] = _make_field_result(None, "missing", None, f"{date_field} not found on form")
                summary["missing"].append(date_field)

    # Job Code
    raw_job = employment.get("jobTitleRaw")
    if raw_job:
        norm = _normalize(raw_job)
        mapped = JOB_CODE_MAP.get(norm)
        if mapped and mapped in valid_job_codes:
            validated["jobCode"] = _make_field_result(
                mapped, "valid", raw_job,
                f"Mapped from '{raw_job}' -> {mapped}"
            )
            summary["valid"].append("jobCode")
        elif not mapped:
            # Try partial matching
            for key, code in JOB_CODE_MAP.items():
                if key in norm or norm in key:
                    mapped = code
                    break
            if mapped and mapped in valid_job_codes:
                validated["jobCode"] = _make_field_result(
                    mapped, "inferred", raw_job,
                    f"Inferred from '{raw_job}' -> {mapped} (fuzzy match)"
                )
                summary["inferred"].append("jobCode")
            else:
                validated["jobCode"] = _make_field_result(
                    raw_job, "invalid", raw_job,
                    f"Job title '{raw_job}' doesn't match any valid code: {', '.join(valid_job_codes)}"
                )
                summary["invalid"].append("jobCode")
        else:
            validated["jobCode"] = _make_field_result(
                mapped, "valid", raw_job,
                f"Mapped from '{raw_job}' -> {mapped}"
            )
            summary["valid"].append("jobCode")
    else:
        validated["jobCode"] = _make_field_result(None, "missing", None, "Job title not found on form")
        summary["missing"].append("jobCode")

    # Work Location Code
    raw_loc = employment.get("locationRaw")
    if raw_loc:
        norm = _normalize(raw_loc)
        mapped = LOCATION_MAP.get(norm)
        if not mapped:
            # Try partial match
            for key, code in LOCATION_MAP.items():
                if key in norm or norm in key:
                    mapped = code
                    break
        if mapped and mapped in valid_locations:
            validated["workLocationCode"] = _make_field_result(
                mapped, "inferred", raw_loc,
                f"Inferred from '{raw_loc}' -> Location {mapped}"
            )
            summary["inferred"].append("workLocationCode")
        elif raw_loc in valid_locations:
            validated["workLocationCode"] = _make_field_result(
                raw_loc, "valid", raw_loc,
                f"Location code '{raw_loc}' is valid"
            )
            summary["valid"].append("workLocationCode")
        else:
            validated["workLocationCode"] = _make_field_result(
                raw_loc, "invalid", raw_loc,
                f"Location '{raw_loc}' doesn't match any valid code: {', '.join(valid_locations)}"
            )
            summary["invalid"].append("workLocationCode")
    else:
        validated["workLocationCode"] = _make_field_result(
            None, "missing", None, "Location not found on form"
        )
        summary["missing"].append("workLocationCode")

    # Pay Group — auto-assign if only one option
    if len(client_codes.get("payGroups", [])) == 1:
        pay_group = client_codes["payGroups"][0]["code"]
        validated["payGroupCode"] = _make_field_result(
            pay_group, "auto_assigned", None,
            f"Auto-assigned — only one pay group available: {pay_group}"
        )
        summary["auto_assigned"].append("payGroupCode")
    else:
        validated["payGroupCode"] = _make_field_result(
            None, "missing", None, "Pay group code could not be determined"
        )
        summary["missing"].append("payGroupCode")

    # Benefit Group — infer from job code
    job_code_value = validated.get("jobCode", {}).get("value")
    if job_code_value and job_code_value in BENEFIT_GROUP_MAP:
        bg = BENEFIT_GROUP_MAP[job_code_value]
        if bg in valid_benefit_groups:
            validated["benefitGroupCode"] = _make_field_result(
                bg, "inferred", None,
                f"Inferred from job code {job_code_value} -> {bg}"
            )
            summary["inferred"].append("benefitGroupCode")
        else:
            validated["benefitGroupCode"] = _make_field_result(
                bg, "invalid", None,
                f"Inferred benefit group '{bg}' not valid for this client"
            )
            summary["invalid"].append("benefitGroupCode")
    else:
        validated["benefitGroupCode"] = _make_field_result(
            None, "missing", None, "Benefit group could not be determined"
        )
        summary["missing"].append("benefitGroupCode")

    # Pay Method
    raw_pay_method = employment.get("payMethod")
    if raw_pay_method:
        norm = _normalize(raw_pay_method)
        mapped = PAY_METHOD_MAP.get(norm, raw_pay_method.upper() if len(raw_pay_method) == 1 else None)
        if mapped and mapped in {"H", "S", "C", "D"}:
            validated["payMethod"] = _make_field_result(
                mapped, "valid", raw_pay_method,
                f"Mapped from '{raw_pay_method}' -> {mapped}"
            )
            summary["valid"].append("payMethod")
        else:
            validated["payMethod"] = _make_field_result(
                raw_pay_method, "invalid", raw_pay_method,
                f"Pay method '{raw_pay_method}' not recognized"
            )
            summary["invalid"].append("payMethod")
    else:
        validated["payMethod"] = _make_field_result(None, "missing", None, "Pay method not found")
        summary["missing"].append("payMethod")

    # Pay Rate
    raw_pay_rate = employment.get("payRate")
    if raw_pay_rate:
        # Clean to numeric
        clean_rate = re.sub(r"[^\d.]", "", str(raw_pay_rate))
        try:
            rate_val = float(clean_rate)
            formatted_rate = f"{rate_val:.4f}"
            validated["payRate"] = _make_field_result(
                formatted_rate, "valid", raw_pay_rate,
                f"Pay rate: ${rate_val:,.2f}"
            )
            summary["valid"].append("payRate")
        except (ValueError, TypeError):
            validated["payRate"] = _make_field_result(
                raw_pay_rate, "invalid", raw_pay_rate,
                f"Could not parse pay rate: {raw_pay_rate}"
            )
            summary["invalid"].append("payRate")
    else:
        validated["payRate"] = _make_field_result(None, "missing", None, "Pay rate not found")
        summary["missing"].append("payRate")

    # Pay Rate Period
    raw_period = employment.get("payRatePeriod")
    validated["payRatePeriod"] = _make_field_result(
        raw_period, "valid" if raw_period else "missing", raw_period,
        f"Pay period: {raw_period}" if raw_period else "Pay rate period not found"
    )
    if raw_period:
        summary["valid"].append("payRatePeriod")

    # Employee Type
    raw_type = employment.get("employeeTypRaw")
    if raw_type:
        norm = _normalize(raw_type)
        mapped = EMPLOYEE_TYPE_MAP.get(norm)
        if mapped and mapped in valid_emp_types:
            validated["employeeTypeCode"] = _make_field_result(
                mapped, "valid", raw_type,
                f"Mapped from '{raw_type}' -> {mapped}"
            )
            summary["valid"].append("employeeTypeCode")
        else:
            validated["employeeTypeCode"] = _make_field_result(
                raw_type, "invalid", raw_type,
                f"Employee type '{raw_type}' not recognized"
            )
            summary["invalid"].append("employeeTypeCode")
    else:
        validated["employeeTypeCode"] = _make_field_result(
            None, "missing", None, "Employee type not found on form"
        )
        summary["missing"].append("employeeTypeCode")

    # Employee Status — all new hires are Active
    validated["employeeStatusCode"] = _make_field_result(
        "A", "auto_assigned", None,
        "Auto-assigned — all new hires are Active"
    )
    summary["auto_assigned"].append("employeeStatusCode")

    # Standard Hours
    raw_hours = employment.get("standardHours")
    if raw_hours:
        try:
            hours_val = float(re.sub(r"[^\d.]", "", str(raw_hours)))
            formatted_hours = f"{hours_val:.2f}"
            validated["standardHours"] = _make_field_result(
                formatted_hours, "valid", raw_hours,
                f"Standard hours: {formatted_hours}"
            )
            summary["valid"].append("standardHours")
        except (ValueError, TypeError):
            validated["standardHours"] = _make_field_result(
                raw_hours, "invalid", raw_hours,
                f"Could not parse standard hours: {raw_hours}"
            )
            summary["invalid"].append("standardHours")
    else:
        # Infer from employee type
        emp_type_val = validated.get("employeeTypeCode", {}).get("value")
        if emp_type_val == "FT":
            validated["standardHours"] = _make_field_result(
                "40.00", "inferred", None,
                "Inferred 40.00 hours from Full Time status"
            )
            summary["inferred"].append("standardHours")
        elif emp_type_val == "PT":
            validated["standardHours"] = _make_field_result(
                "20.00", "inferred", None,
                "Inferred 20.00 hours from Part Time status — please verify"
            )
            summary["inferred"].append("standardHours")
        else:
            validated["standardHours"] = _make_field_result(
                None, "missing", None, "Standard hours not found on form"
            )
            summary["missing"].append("standardHours")

    # ─── W-4 / Tax Fields ───────────────────────────────────────────────

    # Filing Status
    raw_filing = w4.get("filingStatus")
    if raw_filing:
        norm = _normalize(raw_filing)
        mapped = FILING_STATUS_MAP.get(norm, raw_filing.upper() if len(raw_filing) <= 2 else None)
        if mapped and mapped in {"S", "M", "H", "SS", "MJ"}:
            # Normalize to single-char for display
            display = {"SS": "S", "MJ": "M"}.get(mapped, mapped)
            validated["filingStatus"] = _make_field_result(
                display, "valid", raw_filing,
                f"Filing status: {raw_filing} -> {display}"
            )
            summary["valid"].append("filingStatus")
        else:
            validated["filingStatus"] = _make_field_result(
                raw_filing, "invalid", raw_filing,
                f"Filing status '{raw_filing}' not recognized"
            )
            summary["invalid"].append("filingStatus")
    else:
        validated["filingStatus"] = _make_field_result(None, "missing", None, "Filing status not found")
        summary["missing"].append("filingStatus")

    # Allowances
    val = w4.get("allowances")
    validated["allowances"] = _make_field_result(
        val, "valid" if val is not None else "missing", val,
        f"Allowances: {val}" if val is not None else "Allowances not found"
    )
    if val is not None:
        summary["valid"].append("allowances")

    # Additional Withholding
    val = w4.get("additionalWithholding")
    validated["additionalWithholding"] = _make_field_result(
        val, "valid" if val else "missing", val,
        f"Additional withholding: {val}" if val else "No additional withholding specified"
    )
    if val:
        summary["valid"].append("additionalWithholding")

    # ─── Direct Deposit ─────────────────────────────────────────────────

    dd_present = direct_deposit.get("present", False)
    if dd_present:
        validated["directDeposit"] = {
            "present": True,
            "bankName": _make_field_result(
                direct_deposit.get("bankName"), "valid" if direct_deposit.get("bankName") else "missing",
                direct_deposit.get("bankName"), None
            ),
            "routingNumber": _make_field_result(
                direct_deposit.get("routingNumber"), "valid" if direct_deposit.get("routingNumber") else "missing",
                direct_deposit.get("routingNumber"), None
            ),
            "accountNumber": _make_field_result(
                direct_deposit.get("accountNumber"), "valid" if direct_deposit.get("accountNumber") else "missing",
                direct_deposit.get("accountNumber"), None
            ),
            "accountType": _make_field_result(
                direct_deposit.get("accountType"), "valid" if direct_deposit.get("accountType") else "missing",
                direct_deposit.get("accountType"), None
            ),
            "paymentMethod": _make_field_result("direct_deposit", "valid", None, "Direct deposit form provided"),
        }
        summary["valid"].append("directDeposit")
    else:
        validated["directDeposit"] = {
            "present": False,
            "paymentMethod": _make_field_result(
                "paper_check", "valid", None, "No direct deposit form — defaults to paper check"
            ),
        }
        summary["valid"].append("directDeposit")

    # ─── Add confidence scores to validated fields ──────────────────────

    # Cap: no field should ever show 100% — AI extraction always has uncertainty
    CONFIDENCE_CAP = 0.95

    # High-risk fields get an additional penalty to encourage manual review
    # (cost of error is higher for these fields)
    HIGH_RISK_FIELDS = {
        "ssn", "dateOfBirth",
        "dd_routingNumber", "dd_accountNumber",
    }
    HIGH_RISK_MULTIPLIER = 0.85

    # Map Claude's raw field names to validated field names where they differ
    CONFIDENCE_KEY_MAP = {
        "jobTitleRaw": "jobCode",
        "locationRaw": "workLocationCode",
    }

    for field_name, conf_score in field_confidence.items():
        mapped_name = CONFIDENCE_KEY_MAP.get(field_name, field_name)
        if mapped_name in validated and isinstance(validated[mapped_name], dict) and "value" in validated[mapped_name]:
            # Apply confidence cap — never show 100%
            capped = min(conf_score, CONFIDENCE_CAP)
            # Apply high-risk penalty for sensitive fields
            if mapped_name in HIGH_RISK_FIELDS:
                capped = round(capped * HIGH_RISK_MULTIPLIER, 2)
            validated[mapped_name]["confidence"] = capped

    # ─── Summary counts ────────────────────────────────────────────────

    # Check which required fields are blocking
    blocking_fields = []
    for rf in REQUIRED_FIELDS:
        field_result = validated.get(rf, {})
        if isinstance(field_result, dict):
            status = field_result.get("status")
            if status in ("missing", "invalid"):
                blocking_fields.append(rf)

    summary["counts"] = {
        "valid": len(summary["valid"]),
        "inferred": len(summary["inferred"]),
        "auto_assigned": len(summary["auto_assigned"]),
        "missing": len(summary["missing"]),
        "invalid": len(summary["invalid"]),
    }
    summary["blocking_fields"] = blocking_fields
    summary["can_submit"] = len(blocking_fields) == 0

    return {
        "validated": validated,
        "summary": summary,
        "confidence": confidence,
        "clientId": client_codes.get("clientId"),
        "clientName": client_codes.get("clientName"),
    }


def build_prismhr_payload(validated_data, client_codes=None):
    """
    Build the mock PrismHR importEmployees JSON payload from validated data.
    """
    if client_codes is None:
        client_codes = load_client_codes()

    v = validated_data.get("validated", {})

    def get_val(field_name):
        """Extract the value from a validated field."""
        field = v.get(field_name, {})
        if isinstance(field, dict) and "value" in field:
            return field["value"]
        return None

    # Build the employee record
    employee = {
        "firstName": get_val("firstName"),
        "lastName": get_val("lastName"),
        "middleInitial": get_val("middleInitial"),
        "ssn": get_val("ssn"),
        "birthDate": get_val("dateOfBirth"),
        "gender": get_val("gender"),
        "addressLine1": get_val("addressLine1"),
        "city": get_val("city"),
        "stateCode": get_val("state"),
        "zipCode": get_val("zip"),
        "homePhone": get_val("phone"),
        "mobilePhone": get_val("mobilePhone"),
        "emailAddress": get_val("email"),
        "emergContactName": get_val("emergencyContactName"),
        "emergContactPhone": get_val("emergencyContactPhone"),
        "emergContactRelation": get_val("emergencyContactRelation"),
        "workLocationCode": get_val("workLocationCode"),
        "jobCode": get_val("jobCode"),
        "payGroup": get_val("payGroupCode"),
        "benefitsGroup": get_val("benefitGroupCode"),
        "origHireDate": get_val("origHireDate"),
        "lastHireDate": get_val("lastHireDate"),
        "peoStartDate": get_val("peoStartDate"),
        "employeeStatusCode": get_val("employeeStatusCode"),
        "employeeTypeCode": get_val("employeeTypeCode"),
        "payMethod": get_val("payMethod"),
        "payRate": get_val("payRate"),
        "standardHours": get_val("standardHours"),
    }

    # Add mailing address if different
    mail_addr = get_val("mailingAddressLine1")
    if mail_addr:
        employee["mailAddressLine1"] = mail_addr
        employee["mailCity"] = get_val("mailingCity")
        employee["mailState"] = get_val("mailingState")
        employee["mailZip"] = get_val("mailingZip")
    else:
        # Use residence address as mailing
        employee["mailAddressLine1"] = get_val("addressLine1")
        employee["mailCity"] = get_val("city")
        employee["mailState"] = get_val("state")
        employee["mailZip"] = get_val("zip")

    # Add W-4 data
    filing_status = get_val("filingStatus")
    if filing_status:
        fed_status_map = {"S": "SS", "M": "MJ", "H": "H"}
        employee["fedFileStatus"] = fed_status_map.get(filing_status, filing_status)
    employee["fedAllowances"] = get_val("allowances") or "0"

    # Remove None values
    employee = {k: v for k, v in employee.items() if v is not None}

    payload = {
        "sessionId": "MOCK_SESSION_12345",
        "clientId": client_codes.get("clientId", "15650"),
        "translationTable": "",
        "useGlobalNewHire": False,
        "ignoreNewHireOptionalFields": False,
        "newHireEmployee": [employee],
    }

    return payload


def generate_missing_info_email(validated_data, employee_name=None):
    """
    Generate a missing-info email draft based on missing/invalid fields.
    """
    v = validated_data.get("validated", {})
    summary = validated_data.get("summary", {})

    missing_items = []

    for field_name in summary.get("missing", []) + summary.get("invalid", []):
        field = v.get(field_name, {})
        if isinstance(field, dict):
            status = field.get("status", "")
            raw = field.get("raw", "")
            message = field.get("message", "")

            if status == "missing":
                missing_items.append({
                    "field": _field_label(field_name),
                    "issue": message or f"{_field_label(field_name)} was not found on the form"
                })
            elif status == "invalid":
                missing_items.append({
                    "field": _field_label(field_name),
                    "issue": message or f"Value '{raw}' is not valid for {_field_label(field_name)}"
                })

    if not missing_items:
        return {
            "needed": False,
            "message": "No missing fields - packet is complete!",
            "subject": None,
            "body": None,
        }

    # Build name from validated data
    first = v.get("firstName", {}).get("value", "[First Name]") or "[First Name]"
    last = v.get("lastName", {}).get("value", "[Last Name]") or "[Last Name]"
    start_date = v.get("peoStartDate", {}).get("value", "[Start Date]") or "[Start Date]"
    client_name = validated_data.get("clientName", "Jordan's Surf Shack")

    subject = f"Action Required: Missing Information for {first} {last} New Hire Packet"

    bullet_list = "\n".join([f"  - {item['field']}: {item['issue']}" for item in missing_items])

    body = f"""Hi {client_name} Team,

We received the new hire packet for {first} {last} (Start Date: {start_date}) and need a few clarifications before we can complete the setup in our system.

Please provide the following:

{bullet_list}

Please reply to this email with the requested information at your earliest convenience. If you have any questions, please contact your ProService Service Team.

Thank you,
ProService Hawaii"""

    return {
        "needed": True,
        "message": f"{len(missing_items)} field(s) need clarification",
        "subject": subject,
        "body": body,
        "missing_count": len(missing_items),
        "items": missing_items,
    }


def _field_label(field_name):
    """Convert camelCase field name to a human-readable label."""
    labels = {
        "firstName": "First Name",
        "lastName": "Last Name",
        "middleInitial": "Middle Initial",
        "ssn": "Social Security Number",
        "dateOfBirth": "Date of Birth",
        "gender": "Gender",
        "email": "Email Address",
        "phone": "Phone Number",
        "mobilePhone": "Mobile Phone",
        "addressLine1": "Street Address",
        "addressLine2": "Address Line 2",
        "city": "City",
        "state": "State",
        "zip": "ZIP Code",
        "mailingAddressLine1": "Mailing Address",
        "mailingCity": "Mailing City",
        "mailingState": "Mailing State",
        "mailingZip": "Mailing ZIP",
        "emergencyContactName": "Emergency Contact Name",
        "emergencyContactPhone": "Emergency Contact Phone",
        "emergencyContactRelation": "Emergency Contact Relationship",
        "origHireDate": "Original Hire Date",
        "lastHireDate": "Last Hire Date",
        "peoStartDate": "PEO Start Date",
        "jobCode": "Job Code / Position",
        "workLocationCode": "Work Location",
        "payGroupCode": "Pay Group",
        "benefitGroupCode": "Benefit Group",
        "payMethod": "Pay Method",
        "payRate": "Pay Rate",
        "payRatePeriod": "Pay Rate Period",
        "employeeTypeCode": "Employee Type",
        "employeeStatusCode": "Employee Status",
        "standardHours": "Standard Hours",
        "filingStatus": "W-4 Filing Status",
        "allowances": "W-4 Allowances",
        "additionalWithholding": "Additional Withholding",
        "directDeposit": "Direct Deposit",
    }
    return labels.get(field_name, field_name)
