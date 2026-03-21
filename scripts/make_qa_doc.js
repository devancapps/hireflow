const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, ShadingType, WidthType,
  Table, TableRow, TableCell, PageNumber, Footer,
  LevelFormat
} = require('docx');
const fs = require('fs');

// ── helpers ──────────────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 32, font: 'Arial', color: '1F3864' })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text, bold: true, size: 26, font: 'Arial', color: '2E75B6' })]
  });
}

function questionPara(text) {
  return new Paragraph({
    spacing: { before: 240, after: 60 },
    children: [new TextRun({ text: `Q: ${text}`, bold: true, size: 22, font: 'Arial', color: '1F3864' })]
  });
}

function answerLabel() {
  return new Paragraph({
    spacing: { before: 60, after: 40 },
    children: [new TextRun({ text: 'A:', bold: true, size: 22, font: 'Arial', color: '375623' })]
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text, size: 20, font: 'Arial', ...opts })]
  });
}

function tip(text) {
  return new Paragraph({
    spacing: { before: 60, after: 80 },
    shading: { fill: 'FFF2CC', type: ShadingType.CLEAR },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: 'F0A000', space: 6 }
    },
    indent: { left: 240 },
    children: [new TextRun({ text: `\u26A0\uFE0F  Interview Tip: ${text}`, size: 20, font: 'Arial', italics: true, color: '7B5800' })]
  });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 0, after: 40 },
    numbering: { reference: 'bullets', level: 0 },
    children: [new TextRun({ text, size: 20, font: 'Arial', ...opts })]
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 1 } },
    children: []
  });
}

function pageBreak() {
  return new Paragraph({ pageBreakBefore: true, children: [] });
}

function sectionHeader(letter, title, subtitle) {
  return [
    pageBreak(),
    new Paragraph({
      spacing: { before: 0, after: 40 },
      shading: { fill: '1F3864', type: ShadingType.CLEAR },
      children: [
        new TextRun({ text: `  Theme ${letter}  `, size: 36, bold: true, font: 'Arial', color: 'FFFFFF' }),
        new TextRun({ text: `  ${title}`, size: 28, bold: true, font: 'Arial', color: 'BDD7EE' })
      ]
    }),
    new Paragraph({
      spacing: { before: 0, after: 240 },
      shading: { fill: '2E75B6', type: ShadingType.CLEAR },
      children: [new TextRun({ text: `  ${subtitle}`, size: 18, font: 'Arial', color: 'FFFFFF', italics: true })]
    })
  ];
}

// ── DOCUMENT CONTENT ─────────────────────────────────────────────────────────

const children = [];

// Cover
children.push(
  new Paragraph({
    spacing: { before: 1440, after: 120 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'HireFlow Interview Prep', bold: true, size: 52, font: 'Arial', color: '1F3864' })]
  }),
  new Paragraph({
    spacing: { before: 0, after: 120 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Prototype Probe Q&A', size: 36, font: 'Arial', color: '2E75B6' })]
  }),
  new Paragraph({
    spacing: { before: 0, after: 80 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Stage 4 Final Round \u2014 ProService Hawaii APM', size: 24, font: 'Arial', color: '595959' })]
  }),
  new Paragraph({
    spacing: { before: 0, after: 480 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Devan Capps  \u00B7  March 2026', size: 22, font: 'Arial', color: '767676', italics: true })]
  }),
  divider(),
  new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text: 'How to use this document', bold: true, size: 24, font: 'Arial', color: '1F3864' })]
  }),
  body('Stage 4 is a 60-minute conversational interview. Jordan and Mikaela have already seen the full demo. The first ~25 minutes will be them probing specific claims you made in Stage 3. Every question in this document maps directly to something you said or showed. Study these answers until you can say them naturally \u2014 not recite them.'),
  body(''),
  bullet('Read every answer out loud at least once. Hearing yourself say it matters.'),
  bullet('For technical answers, draw a quick diagram in your head as you speak \u2014 it helps you slow down and stay precise.'),
  bullet('The best answers are 60\u201390 seconds. Lead with the direct answer, then add one supporting detail.'),
  bullet('Never apologize for prototype shortcuts \u2014 own every decision. You made a deliberate tradeoff, not a mistake.'),
  bullet('If they go somewhere unexpected, \u201CThat\u2019s a great question\u201D + 2-second pause + answer. Don\u2019t rush.'),
  new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text: 'Six Themes', bold: true, size: 24, font: 'Arial', color: '1F3864' })]
  }),
  bullet('Theme A \u2014 AI & Technical Design (how Claude Vision works, fuzzy matching, JSON parsing)'),
  bullet('Theme B \u2014 Validation & Business Logic (5-status system, code mapping, blocking fields)'),
  bullet('Theme C \u2014 Product Decisions (why human-in-loop, why Flask, why hardcoded data)'),
  bullet('Theme D \u2014 Production Readiness (security, PrismHR API, batch architecture)'),
  bullet('Theme E \u2014 What You\u2019d Build Next (prioritized roadmap with reasoning)'),
  bullet('Theme F \u2014 Process & Role (APM fit, 30/60/90, why ProService)'),
  divider()
);

// ══════════════════════════════════════════════════════════════════════════════
// THEME A — AI & Technical Design
// ══════════════════════════════════════════════════════════════════════════════
children.push(...sectionHeader('A', 'AI & Technical Design', 'How Claude Vision works, fuzzy matching, JSON parsing, quality scoring'));

children.push(
  // Q1
  questionPara('Why Claude Vision instead of Tesseract or traditional OCR?'),
  answerLabel(),
  body('Traditional OCR like Tesseract is optimized for clean, printed text. It uses pattern recognition against a glyph database. Handwritten forms \u2014 especially ones with variable pen pressure, inconsistent letter sizing, and field labels printed alongside handwritten answers \u2014 are notoriously difficult for traditional OCR. The error rate goes up dramatically the moment you have a form where one line says "First Name" in print and the next has a handwritten answer in someone\u2019s casual cursive.'),
  body('Claude Vision approaches the page the way a human reader does. It understands spatial context \u2014 it can see that "Taylor" appears in the box labeled "First Name" even if the handwriting is messy. It also understands semantic context \u2014 it knows a field labeled "SSN" should produce a number in a specific format. That combination of spatial + semantic understanding is what makes it significantly more accurate on handwritten forms than traditional OCR.'),
  body('The tradeoff is cost and latency. Claude Vision is slower (~30-60 seconds per packet) and more expensive per call than Tesseract. For a batch operation at ProService\u2019s volume, you\u2019d want to think carefully about cost per packet. But for the prototype, the accuracy gain completely justified it.'),
  tip('If they push on cost: "At ~500 packets per month, we\u2019re talking maybe $2-5 per packet for the AI calls. Compare that to the 45-60 minutes of manual data entry per packet at a data entry coordinator\u2019s hourly rate. The math heavily favors automation."'),
  divider(),

  // Q2
  questionPara('How does the fuzzy matching actually work? Walk me through the code-level logic.'),
  answerLabel(),
  body('There are two lookups that use fuzzy matching: job titles and location codes. Both use the same two-pass strategy.'),
  body('Pass 1 is an exact dictionary lookup. I have hardcoded maps in validator.py \u2014 JOB_CODE_MAP and LOCATION_MAP \u2014 where keys are common string values Claude might return. For job titles: "instructor" maps to "IN", "owner" maps to "OW", "retail worker" maps to "RW". The match is case-insensitive. If the extracted value exactly matches a key, we return the code immediately with a "valid" status.'),
  body('Pass 2 is substring containment. If the exact lookup fails, I take the raw extracted string and check whether any known description from client_codes.json appears as a substring of it, or whether the raw value appears as a substring of any known description. So if Claude returns "beach department" instead of "Beach Location," the word "beach" is a substring of the Location 2 description, so it matches.'),
  body('In the Taylor Swift packet, Claude returned "dept = beach" for the location field. "beach" as a substring matched "Beach Location" \u2014 that\u2019s why the workLocationCode shows status "inferred" with confidence 0.8 in the validation output. Inferred means we made an educated mapping, not an exact match, so it flags for human review.'),
  tip('They may ask: "what if Claude returns something completely unrecognizable?" Answer: it falls through both passes and lands in the "invalid" bucket. The reviewer sees the raw value, the red badge, and can manually select the correct code from a dropdown on the review screen.'),
  divider(),

  // Q3
  questionPara('What happens when Claude returns malformed JSON?'),
  answerLabel(),
  body('I built a retry mechanism in app.py called retry_extraction(). The main extraction call asks Claude to return a specific JSON schema with fields for employee personal info, employment details, W-4, and direct deposit. I include a schema definition in the prompt to reduce malformed responses.'),
  body('If the JSON parse fails \u2014 json.loads() throws an exception \u2014 retry_extraction() makes a second call with a simplified prompt. The simplified prompt drops some of the nuanced instructions and just asks Claude to return the core required fields. I found in testing that most malformed responses were caused by Claude adding explanatory prose around the JSON block, not actual JSON errors. The retry prompt is more explicit: "Return ONLY the JSON object, no other text."'),
  body('If the retry also fails, the route returns a 500 error with a user-facing message telling the reviewer the extraction failed and suggesting they try re-uploading with a cleaner scan.'),
  tip('This is a good moment to mention: "In a production system I\u2019d log every failed extraction with the raw Claude response so we could audit patterns \u2014 maybe we\u2019re consistently failing on a specific form page or a specific handwriting style. That data would let us tune the prompt over time."'),
  divider(),

  // Q4
  questionPara('How do confidence scores work \u2014 can they be wrong?'),
  answerLabel(),
  body('Confidence scores come directly from Claude. As part of the extraction prompt, I ask Claude to include a confidence score (0.0 to 1.0) for key fields where legibility might be in question. Claude returns these alongside the extracted values in the JSON response.'),
  body('So yes \u2014 they can absolutely be wrong. Claude is making a self-assessment of how confident it is in its own reading. In the Taylor Swift packet, Claude gave the date of birth a 0.85 confidence, which is what triggers the yellow highlight in the review screen. Claude correctly flagged its own uncertainty there.'),
  body('But Claude can also be overconfident. It might give a 0.95 confidence to a misread value. That\u2019s exactly why the human-in-the-loop review step exists \u2014 the confidence scores are a triage signal, not a guarantee. High-confidence fields still need a human to glance at them; they just get less visual emphasis.'),
  tip('Mention this proactively: "A more robust system would cross-validate confidence against historical accuracy. If Claude tends to be overconfident on routing numbers, for example, we\u2019d apply a correction factor or always require human verification for that field regardless of score."'),
  divider(),

  // Q5
  questionPara('Why send all pages in one API call instead of processing page by page?'),
  answerLabel(),
  body('Context continuity. New hire packets aren\u2019t isolated pages \u2014 they\u2019re a document. The employee\u2019s name appears on the first page. Their hire date might be on page 3. Their W-4 is on page 8. If I sent each page as a separate API call, I\u2019d have to reconcile potentially conflicting extractions across 12 separate responses, and I\u2019d lose the ability for Claude to use context from earlier pages to resolve ambiguity on later pages.'),
  body('Sending all pages in one call lets Claude treat the packet holistically. When it sees the name "Taylor Swift" on page 1, that context helps it recognize "T. Swift" as a signature on page 8 rather than a separate person.'),
  body('The tradeoff is token cost and context window size. A 12-page packet at 150 DPI generates 12 JPEG images. That\u2019s a large multimodal payload. For the prototype this is fine. In production, you\u2019d want to evaluate whether a hybrid approach \u2014 one call for the cover sheet to get employee identity, then separate calls for each form section \u2014 gives better cost efficiency without sacrificing accuracy.'),
  divider(),

  // Q6
  questionPara('Why sample only 4 pages for quality scoring instead of checking every page?'),
  answerLabel(),
  body('Cost and speed optimization. Quality scoring is a separate Claude Vision API call that happens before the main extraction call. If I ran quality scoring on all 12 pages, I\u2019d be making 12 API calls just for quality \u2014 that doubles the latency and cost before we even start extracting data.'),
  body('The sampling strategy covers page 1 (always), then three evenly distributed pages across the document. This catches the most common quality failure patterns: a bad first page (user didn\u2019t prepare the scanner), degradation in the middle of the document (poor lighting in the scanning environment), and a bad last page (scanning cut off or rushed).'),
  body('In practice, if pages 1, 4, 8, and 12 all score well, the rest are almost certainly fine. The overall quality score is the average of the sampled pages, and worst pages are surfaced so the reviewer knows exactly which pages to manually verify.'),
);

// ══════════════════════════════════════════════════════════════════════════════
// THEME B — Validation & Business Logic
// ══════════════════════════════════════════════════════════════════════════════
children.push(...sectionHeader('B', 'Validation & Business Logic', 'The 5-status system, code mapping, blocking fields, missing info flow'));

children.push(
  // Q7
  questionPara('Walk me through exactly what happens when a required field is missing.'),
  answerLabel(),
  body('When Claude returns the extraction JSON and a required field is null or empty, the validation engine in validator.py assigns it a status of "missing." The field result object looks like: { value: null, status: "missing", message: "Field not found on form" }.'),
  body('In the review screen, missing fields get a red badge and are visually prominent in their section. The reviewer can see at a glance what\u2019s absent.'),
  body('But "missing" alone doesn\u2019t block submission. What matters is whether the field is in the REQUIRED_FIELDS list. That list has 9 fields \u2014 things like firstName, ssn, jobCode, workLocationCode, standardHours. If any of those are missing, the "Submit to PrismHR" button is disabled and the system generates a blocking alert.'),
  body('The summary at the bottom of the review screen shows a count: "2 missing fields \u2014 cannot submit." It also shows which specific fields are blocking. From there the reviewer has two options: manually fill in the field using inline editing (if they know the value), or click "Generate Email" to draft a request back to the client asking for the missing information.'),
  tip('Key distinction to nail: missing vs. blocking. A missing field like mobilePhone doesn\u2019t block submission \u2014 it\u2019s optional. A missing field like standardHours does block submission because it\u2019s required by PrismHR\u2019s importEmployees API.'),
  divider(),

  // Q8
  questionPara('What\u2019s the difference between "inferred," "auto_assigned," and "valid"?'),
  answerLabel(),
  body('"Valid" means the value was directly extracted from the form and either maps exactly to a known code or passes format validation. Example: Claude reads "Instructor" from the job title field, it maps exactly to code "IN" \u2014 valid.'),
  body('"Inferred" means the system made an educated guess because the extracted value didn\u2019t directly match a known code. The confidence is lower. Example: Claude returns "dept = beach," the fuzzy matcher finds "beach" is a substring of "Beach Location" and assigns code "2." The field is inferred, confidence 0.8, and it\u2019s flagged for human review because the mapping required interpretation.'),
  body('"Auto-assigned" means the system assigned a value without any input from the form \u2014 because there was only one valid option or the assignment is always the same for new hires. Example: payGroupCode is auto-assigned to "BI5-SAT" because Jordan\u2019s Surf Shack only has one pay group. employeeStatusCode is always "A" for new hires. These are shown differently in the UI \u2014 they\u2019re not flagged as errors, but the reviewer can see they were system-generated, not form-extracted.'),
  body('The distinction matters for an audit trail. In a production system, you\u2019d want to log which fields were inferred vs. auto-assigned vs. directly validated so a compliance reviewer can see how each value was sourced.'),
  divider(),

  // Q9
  questionPara('How does the system know what a valid job code or location code is?'),
  answerLabel(),
  body('The valid codes are stored in data/client_codes.json. For the prototype, this file is hardcoded for Jordan\u2019s Surf Shack (client ID 15650). It defines the complete set of valid options for that client: job codes (OW, IN, RW), location codes (1=Retail, 2=Beach), employee types, pay groups, benefit groups, and employee statuses.'),
  body('When the validator runs, it loads this file at startup and builds lookup maps from it. Every code validation check runs against those maps. If an extracted value doesn\u2019t map to anything in the client\u2019s valid code set, it gets flagged as "invalid" or "missing" depending on whether something was extracted at all.'),
  body('In production, this JSON file would be replaced by a live API call to ProService\u2019s internal getClientCodes endpoint, which would return the valid codes for whatever client the packet belongs to. The architecture is intentionally designed to swap that data source in without changing the validation logic \u2014 the validator just needs a dict of valid codes, it doesn\u2019t care whether that dict came from a JSON file or an API response.'),
  divider(),

  // Q10
  questionPara('How would you add a new client with different codes?'),
  answerLabel(),
  body('In the prototype: create a new JSON file in the data/ directory following the same schema as client_codes.json. The validator reads the client ID from the packet context and loads the corresponding file.'),
  body('In production: the getClientCodes API call takes a client ID parameter and returns that client\u2019s specific valid code set. No file changes needed \u2014 just pass a different client ID and the system automatically validates against that client\u2019s codes. This is exactly why I chose to externalize the codes into a data file rather than hardcode them into the validation logic.'),
  body('The bigger challenge with multi-client support is form variation. Different clients might use slightly different new hire packet templates. The AI extraction prompt would need to be tested against each client\u2019s form format to ensure Claude is reading the right fields from the right places. That\u2019s a manageable engineering effort, but it\u2019s real work.'),
  divider(),

  // Q11
  questionPara('What happens if the employee\u2019s handwriting is completely illegible?'),
  answerLabel(),
  body('Claude will do its best and return whatever it can read, along with a low confidence score for illegible fields. In extreme cases, it may return null for a field it simply cannot parse.'),
  body('The system handles this gracefully. A null value from Claude for a required field shows up as "missing" in validation \u2014 red badge, blocks submission. The review screen surfaces it prominently. The reviewer can either manually enter the correct value (if they have a cleaner copy) or trigger the Generate Email flow to request a rescan from the client.'),
  body('The scan quality scoring step is partly designed to catch this proactively. If a page scores 2/5 on sharpness, the system flags it before extraction even runs and tells the reviewer: "Page 5 has significant blur. Consider requesting a rescan before processing." Catching bad scans early saves the AI processing cost.'),
  tip('This is a good moment to mention the feedback loop value: "In production I\u2019d want to track which clients consistently submit low-quality scans and build a client-facing tip sheet or even an automated reminder before their upload deadline."')
);

// ══════════════════════════════════════════════════════════════════════════════
// THEME C — Product Decisions
// ══════════════════════════════════════════════════════════════════════════════
children.push(...sectionHeader('C', 'Product Decisions', 'Why human-in-loop, why Flask, why hardcoded data, why these tech choices'));

children.push(
  // Q12
  questionPara('Why did you keep the human in the loop instead of fully automating submission?'),
  answerLabel(),
  body('Two reasons: accuracy stakes and trust building.'),
  body('On accuracy: this is payroll data. An error in an employee\u2019s SSN, pay rate, or job code has real downstream consequences \u2014 a wrong W-4 filing status affects their tax withholding, a wrong pay rate affects their paycheck. AI extraction is very good, but it\u2019s not infallible. When the consequences of an error are this high, a human review step is the right call, not a limitation.'),
  body('On trust building: you\u2019re introducing AI into a workflow that HR coordinators have owned manually for years. If the system fully auto-submits and makes even one error that reaches PrismHR, you\u2019ve immediately destroyed trust in the tool. But if the human reviewer confirms each submission, they develop confidence in the system over time. Once accuracy is proven \u2014 maybe after 90 days of operation showing 99%+ accuracy on high-confidence packets \u2014 you could introduce an auto-submit threshold: packets where all fields are valid with confidence > 0.95 can submit automatically, flagging only the lower-confidence ones for review.'),
  body('That\u2019s the evolution path. Start with human-in-loop, build the track record, then selectively automate the easiest cases first.'),
  tip('This answer demonstrates product maturity. You\u2019re not just saying "I wanted safety" \u2014 you\u2019re describing a deliberate product strategy with a specific path toward more automation.'),
  divider(),

  // Q13
  questionPara('Why is the dashboard data hardcoded instead of pulling from the processed uploads?'),
  answerLabel(),
  body('Honest answer: scope and time. The dashboard was added as a home screen to show what a full packet management workflow would look like \u2014 multiple clients, status tracking, filtering. Building that with live data from the uploads directory would have required a proper persistence layer: a database, a packet status state machine, a client-packet relationship model.'),
  body('I made a deliberate call to use hardcoded mock data for the dashboard so I could show the full product vision without building a production data layer in a prototype. The upload \u2192 review flow is fully live. The dashboard is a design artifact showing where the product goes next.'),
  body('In production, the dashboard would pull from a database \u2014 probably Postgres or Firestore \u2014 with a packets table that stores each packet\u2019s status, client ID, reviewer assignment, extracted data, and submission history. The frontend would query an API endpoint instead of rendering hardcoded JavaScript objects.'),
  tip('Don\u2019t be defensive about this. Own it: "I made a deliberate tradeoff to show the full product vision without building infrastructure that wasn\u2019t core to the prototype\u2019s purpose." That\u2019s good product judgment, not a shortcut.'),
  divider(),

  // Q14
  questionPara('Why Flask? Why not a modern framework or serverless?'),
  answerLabel(),
  body('Flask was the pragmatic choice for a Python prototype. The core processing logic \u2014 PDF conversion, Claude API calls, validation \u2014 is all Python. Flask let me keep everything in one language, use Python\u2019s rich ecosystem (pdf2image, Pillow, Anthropic SDK), and move fast without infrastructure overhead.'),
  body('A serverless approach like AWS Lambda would have added real complexity: cold starts are problematic for 30-60 second processing jobs, binary dependencies like poppler are a deployment headache in Lambda layers, and managing large file uploads through API Gateway has size limits that would require S3 staging.'),
  body('For a production system I\u2019d reconsider. The processing pipeline is a natural fit for an async task queue \u2014 the user uploads a file, gets a job ID immediately, and the extraction runs in the background with a webhook or polling for status. That\u2019s probably FastAPI or Django with Celery, deployed on a container platform. But that\u2019s a significant architecture upgrade that wasn\u2019t necessary to prove the concept.'),
  divider(),

  // Q15
  questionPara('Why no database \u2014 just JSON files on disk?'),
  answerLabel(),
  body('Same principle as the Flask choice: minimum viable persistence for a prototype. I needed to persist processed packet data across page loads \u2014 so the review page can reload without re-running the AI extraction. A JSON sidecar file per upload gives me that persistence without standing up a database server.'),
  body('The in-memory dict (processed_packets) handles the hot path \u2014 if the packet is already in memory, no disk read needed. The JSON file is the fallback when the server restarts.'),
  body('The limitations are obvious: no concurrent write safety, no querying across packets, no relational data. Those are acceptable for a single-user prototype. In production you replace the JSON sidecar with a proper database write, and the in-memory cache with Redis or a proper caching layer.'),
  divider(),

  // Q16
  questionPara('Why PDF.js instead of a native PDF viewer?'),
  answerLabel(),
  body('PDF.js gives me full control over the viewer within my own UI. I needed a split-panel layout where the PDF is on the left and the extracted data is on the right, both within the same screen. Native PDF viewers (the browser\u2019s built-in PDF rendering or an iframe to a PDF URL) don\u2019t give you the control to embed them cleanly in a custom layout with custom toolbars.'),
  body('PDF.js renders each page onto an HTML5 Canvas element. I can control zoom, navigation, and the toolbar completely. I built the PDFViewer class in pdf-viewer.js to handle the concurrency edge case \u2014 if the user navigates pages rapidly, the rendering queue needs a guard to prevent multiple renders stepping on each other.'),
  body('The tradeoff is that PDF.js is a significant JavaScript library and it\u2019s loaded from the Mozilla CDN. In production you\u2019d want to bundle it locally. But for the prototype the CDN approach is fine.'),
  divider(),

  // Q17
  questionPara('Why completeness and quality checks before the expensive AI call?'),
  answerLabel(),
  body('Fail fast. If a packet is only 4 pages when we expect 8-12, there\u2019s no point running a $2 Claude extraction call on an incomplete document. Surface the problem to the reviewer immediately and let them decide: get a complete rescan, or proceed with what they have.'),
  body('Quality scoring is slightly different \u2014 it\u2019s also an AI call, so it does cost something. But it costs less than the full extraction (4 pages sampled vs. all 12), and it gives the reviewer actionable information: "Page 5 has glare. Request a rescan of that page before this goes to PrismHR." Catching that early is cheaper than running the full extraction, finding low-confidence values on page 5\u2019s fields, going back to the client for a rescan, and running extraction again.'),
  body('The order of operations is deliberate: cheap checks first, expensive calls only when the packet is worth processing.')
);

// ══════════════════════════════════════════════════════════════════════════════
// THEME D — Production Readiness
// ══════════════════════════════════════════════════════════════════════════════
children.push(...sectionHeader('D', 'Production Readiness', 'Security, PrismHR API integration, batch architecture, audit trails'));

children.push(
  // Q18
  questionPara('What security problems exist with the current prototype?'),
  answerLabel(),
  body('Several, and I want to be direct about them because production would need to address every one.'),
  bullet('SSN in plaintext. The SSN is extracted, stored in a JSON file on disk, and displayed in the review screen. In production, SSNs must be encrypted at rest (AES-256 or equivalent) and access-controlled. Display should show masked format (XXX-XX-XXXX with reveal on demand).'),
  bullet('No authentication. Anyone who can reach localhost:5001 can upload a packet and view extracted data. Production needs role-based auth \u2014 at minimum, a login gate with ProService employee accounts.'),
  bullet('File upload validation is minimal. I check MIME type and file size, but not much else. Production needs deeper file validation to prevent malicious uploads.'),
  bullet('API key in .env. The Anthropic API key is stored in a .env file. In production that goes into a secrets manager (AWS Secrets Manager, HashiCorp Vault) and is never committed to source control.'),
  bullet('No audit trail. Every field edit on the review screen calls /update-field and silently updates the in-memory data. Production needs a full audit log: who changed what field, from what value, to what value, at what timestamp.'),
  body('These are known, documented limitations of the prototype. None of them are hard to fix \u2014 they\u2019re standard production hardening steps.'),
  divider(),

  // Q19
  questionPara('How would the getClientCodes API integration actually work in production?'),
  answerLabel(),
  body('PrismHR exposes a getClientCodes endpoint that takes a clientId parameter and returns the complete set of valid codes for that client: job codes, locations, employee types, pay groups, benefit groups, and statuses.'),
  body('In production, the /process route would call getClientCodes with the client ID at the start of each packet processing run. The response replaces what currently comes from client_codes.json. The validation engine receives the same data structure \u2014 a dict of code lists \u2014 so no changes to the validation logic itself.'),
  body('There\u2019s a caching opportunity: client codes don\u2019t change often. You could cache the getClientCodes response for each client with a 24-hour TTL, avoiding a live API call for every packet while still staying relatively fresh. If a client adds a new job code, the cache invalidates overnight.'),
  body('Authentication to PrismHR\u2019s API would use OAuth 2.0 service-to-service credentials managed in a secrets manager. The token refresh logic would be handled transparently by an API client layer, not scattered through the application code.'),
  divider(),

  // Q20
  questionPara('What would replace the mock PrismHR submission?'),
  answerLabel(),
  body('Two real API calls: importEmployees to create the employee record, then optionally commitEmployees to finalize it. For W-4 changes there\u2019s updateW4, and for direct deposit there\u2019s updateDirectDeposit.'),
  body('The mock payload I generate already matches the importEmployees schema \u2014 that was intentional. In production, instead of displaying the JSON in a modal, you\u2019d POST it to the PrismHR importEmployees endpoint. The response includes a transaction ID. You\u2019d store that transaction ID against the packet record so you can audit exactly which PrismHR submission corresponds to which packet.'),
  body('The submit button would change from "generate mock payload" to "confirm and submit to PrismHR" with a clear warning that this action creates a real employee record. One-click undo probably isn\u2019t possible on PrismHR\u2019s side, so the confirmation step matters.'),
  divider(),

  // Q21
  questionPara('How would you architect batch processing for 50 clients and 500 packets per month?'),
  answerLabel(),
  body('The current architecture processes one packet at a time synchronously. That doesn\u2019t scale. For 500 packets per month (roughly 25 per business day), you need an async queue.'),
  body('Architecture: Coordinator uploads a packet \u2192 app receives the file, stores it in S3 or GCS, writes a job record to the database with status "queued," returns a job ID to the user immediately. A background worker (Celery, Cloud Tasks, or SQS + Lambda) picks up the job, runs the processing pipeline, updates the job status to "ready_for_review" when done. The dashboard polls for job status updates or uses a WebSocket for real-time updates.'),
  body('For 50 clients, the validation step needs multi-tenant awareness. Each packet belongs to a client. The validator loads that client\u2019s codes. Client configurations are stored in the database, not flat files.'),
  body('At 500 packets/month, Claude Vision cost is roughly $500-2500/month depending on packet length and model. That\u2019s well within the ROI envelope compared to manual processing costs. But you\u2019d want cost per packet tracked in the system so ops can monitor it.'),
  tip('This is a product + engineering question. Lead with the architecture, but connect it to product outcomes: "The key metric is time-to-ready-for-review. Right now it\u2019s ~60 seconds because it\u2019s synchronous. With an async queue, you decouple upload from processing \u2014 coordinators can batch-upload all Monday packets and review them Tuesday morning."'),
  divider(),

  // Q22
  questionPara('What would a real audit trail look like?'),
  answerLabel(),
  body('Every state change in the system gets a timestamped, attributed log entry. At minimum:'),
  bullet('Packet uploaded \u2014 who, when, client, file hash'),
  bullet('Extraction completed \u2014 model version used, extraction confidence, processing duration'),
  bullet('Each field edit \u2014 field name, previous value, new value, reviewer ID, timestamp'),
  bullet('Email generated \u2014 who triggered it, which fields were flagged, timestamp'),
  bullet('Submitted to PrismHR \u2014 who confirmed, PrismHR transaction ID, timestamp'),
  body('This audit trail serves multiple purposes: compliance (you can prove what data was submitted and who approved it), debugging (you can trace why a field value differs from what was on the form), and continuous improvement (you can analyze which fields are most frequently corrected to improve the extraction prompt).'),
  body('Implementation: append-only audit_log table in Postgres. Never update, never delete. Every operation writes a new row.')
);

// ══════════════════════════════════════════════════════════════════════════════
// THEME E — What You'd Build Next
// ══════════════════════════════════════════════════════════════════════════════
children.push(...sectionHeader('E', 'What You\'d Build Next', 'Prioritized roadmap with reasoning — know this list cold'));

children.push(
  new Paragraph({
    spacing: { before: 120, after: 120 },
    children: [new TextRun({ text: 'Memorize this prioritization and the reasoning behind it. This will come up.', bold: true, size: 22, font: 'Arial', color: 'C00000', italics: true })]
  }),

  questionPara('What would you build next if this moved to production?'),
  answerLabel(),
  body('I\u2019d prioritize in this order, and here\u2019s why each one comes before the next:'),
  new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '1. Real PrismHR API Integration', bold: true, size: 22, font: 'Arial', color: '1F3864' })] }),
  body('This is the literal purpose of the tool. Everything else is meaningless if the final submission still requires manual data entry into PrismHR. Wire up importEmployees, updateW4, and updateDirectDeposit. This converts the prototype from a review tool into an actual automation.'),
  new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '2. Authentication + Role-Based Access', bold: true, size: 22, font: 'Arial', color: '1F3864' })] }),
  body('You can\u2019t give coordinators access to SSNs without proper auth. ProService employees need to log in. Different roles (uploader, reviewer, admin) need different permissions. This is a prerequisite for any production deployment.'),
  new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '3. Async Processing Queue', bold: true, size: 22, font: 'Arial', color: '1F3864' })] }),
  body('Synchronous 60-second processing blocks the user and doesn\u2019t scale. Background queue with job status updates lets coordinators upload and come back when it\u2019s ready. This is the architecture shift that makes the product usable for real volume.'),
  new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '4. Confidence-Based Auto-Submit Threshold', bold: true, size: 22, font: 'Arial', color: '1F3864' })] }),
  body('Once you have 60-90 days of accuracy data, introduce a threshold: packets where all required fields are valid with confidence > 0.95 auto-submit without human review. Route only lower-confidence packets to the review queue. This is where the real time savings compound.'),
  new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '5. Multi-Client Config + Form Detection', bold: true, size: 22, font: 'Arial', color: '1F3864' })] }),
  body('Scale beyond Jordan\u2019s Surf Shack. Each client gets their own code config. The extraction prompt gets tuned per client if their form template varies. Form-level detection identifies which specific forms are present in a packet vs. just counting pages.'),
  new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '6. Full Audit Trail + Compliance Reporting', bold: true, size: 22, font: 'Arial', color: '1F3864' })] }),
  body('Required for any serious production deployment handling employee PII. Every edit, every submission, logged with attribution.'),
  tip('End with: "The order is deliberate \u2014 I start with what makes it actually work (PrismHR integration), then what makes it safe to use (auth), then what makes it scale (async), then what makes it smart (auto-submit), then what makes it broad (multi-client). Each step builds on the last."')
);

// ══════════════════════════════════════════════════════════════════════════════
// THEME F — Process & Role
// ══════════════════════════════════════════════════════════════════════════════
children.push(...sectionHeader('F', 'Process & Role', 'APM fit, 30/60/90, why ProService, what you\'d do in the role'));

children.push(
  // Q24
  questionPara('How did you decide what to build vs. cut?'),
  answerLabel(),
  body('I started with the outcome ProService actually needs: reduce the manual effort of entering new hire packet data into PrismHR. Everything I built had to connect to that outcome.'),
  body('The processing pipeline (upload \u2192 quality check \u2192 extraction \u2192 validation \u2192 review) is the critical path. That\u2019s what I built first and built completely.'),
  body('The dashboard was added at the end as a "show the full product vision" artifact. I knew it would be demo\u2019d to stakeholders, and a dashboard showing multiple clients and statuses communicates the broader product direction more powerfully than a single-packet tool.'),
  body('What I cut: email delivery (the Generate Email button creates a draft but doesn\u2019t send it \u2014 no SMTP integration), batch upload (UI for uploading multiple packets at once), and the real PrismHR submission. All of these were correctly scoped as "production" features, not "prototype" features.'),
  divider(),

  // Q25
  questionPara('Who would the real users of this tool be inside ProService?'),
  answerLabel(),
  body('Primary users: HR coordinators at ProService who currently receive paper or scanned packets from client companies and manually key the data into PrismHR. This tool replaces their data entry workflow.'),
  body('Secondary users: account managers or client success managers who field calls from clients asking "did you get my packet? When will my employee be set up?" The dashboard view gives them real-time status without having to ask the HR team.'),
  body('Tertiary: compliance or operations leadership who need reporting on packet processing volume, accuracy rates, and turnaround times. That\u2019s a future analytics layer.'),
  body('Understanding the primary user \u2014 the HR coordinator \u2014 drove several design decisions. The review screen is designed for speed: the most important fields are at the top, low-confidence fields are highlighted so they don\u2019t have to read everything carefully, and the inline editing is optimized for quick corrections.'),
  divider(),

  // Q26
  questionPara('How would you measure success for this product in production?'),
  answerLabel(),
  body('Three tiers of metrics:'),
  body('Efficiency metrics: average time from packet upload to PrismHR submission (currently this is days; target is hours). Number of coordinator hours saved per month. Packets processed per coordinator per day.'),
  body('Accuracy metrics: field-level accuracy rate (% of extracted fields that didn\u2019t require human correction). Error rate post-submission (fields that were wrong and caused a PrismHR rejection or required correction after the fact). These matter more than the efficiency metrics \u2014 a fast wrong answer is worse than a slow right one.'),
  body('Business impact: reduction in onboarding delays (time from offer acceptance to employee setup in PrismHR). Client satisfaction scores. These are the metrics leadership actually cares about.'),
  tip('Frame it as: "I\u2019d want a leading indicator (accuracy), a lagging indicator (time savings), and a business outcome indicator (onboarding speed). If accuracy is high but time savings are low, the bottleneck is somewhere else in the workflow. If time savings are high but business outcome is flat, we\u2019ve optimized the wrong thing."'),
  divider(),

  // Q27
  questionPara('You used Claude Code to build this \u2014 where did the product decisions come from versus the AI?'),
  answerLabel(),
  body('Claude Code handled the implementation \u2014 writing the Flask routes, the validation logic, the HTML/CSS/JS for the frontend. What I directed and owned:'),
  bullet('The core product concept: AI extraction + human validation as the workflow, not full automation'),
  bullet('The 5-status validation system \u2014 the decision to distinguish inferred from auto-assigned from valid was a deliberate product choice about how to communicate uncertainty to reviewers'),
  bullet('The UI architecture: split panel, which fields surface at the top, what the quality scoring display should communicate'),
  bullet('The demo script: what story to tell, what to emphasize, what to skip'),
  bullet('Every "why" behind the decisions you\u2019re asking about now'),
  body('Claude Code accelerated the execution. The product thinking \u2014 what to build, how it should work, why it\u2019s designed this way \u2014 was mine. The prototype took ~12-15 hours of focused work that would have taken 3-4x longer without AI assistance.'),
  tip('This is a nuanced answer and they may probe it. The honest version: "AI-assisted development compresses implementation time dramatically. My value-add is directing what to build and making the judgment calls on how it should work. The coding is faster; the product thinking is still entirely human."'),
  divider(),

  // Q28
  questionPara('What would your first 30/60/90 days in this APM role look like?'),
  answerLabel(),
  new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: 'Days 1-30: Learn the real workflow', bold: true, size: 22, font: 'Arial' })] }),
  body('Shadow HR coordinators processing actual new hire packets. Understand where the real pain is \u2014 not what I inferred from the prototype, but what slows them down daily. Map the full data flow from client submission to PrismHR record. Identify the highest-volume failure modes.'),
  new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: 'Days 31-60: Define the real MVP', bold: true, size: 22, font: 'Arial' })] }),
  body('Based on what I learned in month 1, write the product requirements for the first production version. This almost certainly means: real PrismHR API integration, authentication, async processing. Run these by engineering to size them. Get alignment on what ships in v1 vs. what waits for v2. Start the design sprint.'),
  new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: 'Days 61-90: First production milestone', bold: true, size: 22, font: 'Arial' })] }),
  body('Have a working internal prototype with real PrismHR integration in a staging environment. Run it with a small group of HR coordinators on real packets. Collect accuracy data. Define the go-live criteria. Report first metrics to Jordan and leadership.'),
  divider(),

  // Q29
  questionPara('Why this role, why ProService, why now?'),
  answerLabel(),
  body('ProService is solving a problem I find genuinely interesting: how do you apply AI to a high-volume, high-stakes operational workflow where the data is messy, the consequences of errors are real, and the users are not technical? That\u2019s a harder problem than most AI demos show. HireFlow is my answer to that question in prototype form.'),
  body('The APM role at a company this size is the right level for where I am. I\u2019ve been doing product work at Sendero \u2014 consulting on AI/automation products, doing discovery, writing requirements, partnering with engineering \u2014 and F45 before that where I owned a product roadmap for a global franchise network. I\u2019m ready to own a product from the ground up inside a single company, not as a consultant, and see it through to production.'),
  body('ProService has real users, real pain, and a leadership team (I\u2019m looking at Jordan and you) that\u2019s clearly willing to invest in internal technology. The demo process itself \u2014 being asked to build something and then being evaluated on it \u2014 told me a lot about the culture. I want to work somewhere that thinks that way.'),
  tip('End warm, not rehearsed: "I built HireFlow in two weeks because the problem was interesting enough to make me want to build it. That\u2019s the best signal I know for fit."')
);

// Closing page
children.push(
  pageBreak(),
  new Paragraph({
    spacing: { before: 480, after: 240 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Quick-Reference Cheat Sheet', bold: true, size: 36, font: 'Arial', color: '1F3864' })]
  }),
  new Paragraph({
    spacing: { before: 0, after: 360 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Key numbers and facts to have top of mind walking into the interview', size: 20, font: 'Arial', color: '595959', italics: true })]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3600, 5760],
    rows: [
      ...([
        ['PDF conversion DPI', '150 DPI via pdf2image + poppler'],
        ['Quality scoring sample', '4 pages sampled (pages 1, then 3 evenly spaced)'],
        ['Claude model used', 'claude-sonnet-4-20250514 (Vision)'],
        ['Packet processing time', '~30-60 seconds per packet'],
        ['Validation statuses', 'valid, missing, invalid, inferred, auto_assigned'],
        ['REQUIRED_FIELDS count', '9 fields that block submission (incl. standardHours)'],
        ['Client in prototype', "Jordan's Surf Shack, client ID 15650"],
        ['Job codes', 'OW (Owner), IN (Instructor), RW (Retail Worker)'],
        ['Location codes', '1 = Retail, 2 = Beach'],
        ['Pay group', 'BI5-SAT (Bi-weekly, pay on Friday)'],
        ['PDF viewer library', 'PDF.js 3.11 (Mozilla CDN), Canvas-based rendering'],
        ['API routes count', '9 routes (GET /, /upload, /review; POST /process, /generate-email, /submit, /update-field; GET /api/packet, /uploads)'],
        ['Data persistence', 'In-memory dict + JSON sidecar file per upload'],
        ['Fuzzy matching', 'Two-pass: exact dict lookup → substring containment'],
        ['Retry on bad JSON', 'retry_extraction() with simplified prompt'],
        ['Mock payload API', 'importEmployees (PrismHR schema)'],
      ].map(([label, value], i) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3600, type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? 'EBF3FB' : 'FFFFFF', type: ShadingType.CLEAR },
              borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, font: 'Arial' })] })]
            }),
            new TableCell({
              width: { size: 5760, type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? 'EBF3FB' : 'FFFFFF', type: ShadingType.CLEAR },
              borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: value, size: 18, font: 'Arial' })] })]
            })
          ]
        })
      ))
    ]
  })
);

// ── BUILD DOCUMENT ────────────────────────────────────────────────────────────

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 20 } }
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: '1F3864' },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'HireFlow Interview Prep \u00B7 Devan Capps \u00B7 Page ', size: 16, font: 'Arial', color: '767676' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Arial', color: '767676' }),
            new TextRun({ text: ' of ', size: 16, font: 'Arial', color: '767676' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: 'Arial', color: '767676' })
          ]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/Users/devancapps/hireflow/Interview-QA-Prep.docx', buffer);
  console.log('Done: Interview-QA-Prep.docx');
});
