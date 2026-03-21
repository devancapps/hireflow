const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = '/Users/devancapps/Desktop/interview-prep/Interview-QA-Prep.pdf';

// ── Color tokens ──────────────────────────────────────────────────────────────
const C = {
  navy:    '#1F3864',
  blue:    '#2E75B6',
  ltblue:  '#BDD7EE',
  sky:     '#EBF3FB',
  green:   '#375623',
  ltgreen: '#E2EFDA',
  amber:   '#F0A000',
  ltamber: '#FFF8E1',
  red:     '#C00000',
  ltred:   '#FDECEA',
  orange:  '#C55A11',
  ltorange:'#FBE5D6',
  purple:  '#6B21A8',
  ltpurple:'#F3E8FF',
  white:   '#FFFFFF',
  offwhite:'#F5F7FA',
  gray:    '#595959',
  ltgray:  '#E8E8E8',
};

// ── HTML helpers ──────────────────────────────────────────────────────────────
function qa(q, a, tip = '') {
  return `
    <div class="qa-block">
      <div class="question-row">
        <span class="q-badge">Q</span>
        <span class="question-text">${q}</span>
      </div>
      <div class="answer-row">
        <span class="a-badge">A</span>
        <div class="answer-text">${a}</div>
      </div>
      ${tip ? `<div class="tip-box"><span class="tip-icon">⚡</span><span class="tip-text">${tip}</span></div>` : ''}
    </div>`;
}

function section(letter, title, subtitle, color, content) {
  return `
    <div class="section-break">
      <div class="section-header" style="background:${color}">
        <div class="section-letter">${letter}</div>
        <div class="section-titles">
          <div class="section-title">${title}</div>
          <div class="section-subtitle">${subtitle}</div>
        </div>
      </div>
      ${content}
    </div>`;
}

function inlineCode(t) { return `<code class="ic">${t}</code>`; }
function em(t) { return `<strong>${t}</strong>`; }
function key(t) { return `<span class="key">${t}</span>`; }

// ── CONTENT ───────────────────────────────────────────────────────────────────

const themes = [
  section('A', 'AI & Technical Design', 'Claude Vision · fuzzy matching · JSON parsing · quality scoring', C.blue, `
    ${qa(
      'Why Claude Vision instead of Tesseract or traditional OCR?',
      `Traditional OCR like Tesseract uses <em>glyph pattern matching</em> — optimized for clean, printed text. Handwritten forms with variable pen pressure, inconsistent letter sizing, and field labels printed alongside handwritten answers have notoriously high error rates with traditional OCR.
      <br><br>
      Claude Vision approaches the page the way a human reader does. It understands <em>spatial context</em> (the word "Taylor" in the "First Name" box is the first name) and <em>semantic context</em> (a field labeled "SSN" should return a number in a specific format). That combination is what makes it significantly more accurate on handwritten forms.
      <br><br>
      The tradeoff: cost (~$2–5/packet) and latency (30–60 sec) vs. near-zero for Tesseract. At 500 packets/month, that's well within the ROI envelope compared to 45–60 min of manual data entry per packet.`,
      'If they push on cost: "At ~500 packets/month, we\'re talking $2–5/packet for AI calls. Compare that to 45–60 minutes of manual entry at a coordinator\'s hourly rate. The math heavily favors automation."'
    )}
    ${qa(
      'How does the fuzzy matching actually work? Walk me through the code-level logic.',
      `<strong>Pass 1 — Exact dictionary lookup.</strong> ${inlineCode('JOB_CODE_MAP')} and ${inlineCode('LOCATION_MAP')} in ${inlineCode('validator.py')} hold hardcoded mappings of common strings Claude might return. Case-insensitive: ${inlineCode('"instructor"')} → ${inlineCode('"IN"')}, ${inlineCode('"owner"')} → ${inlineCode('"OW"')}. Direct hit → status ${key('valid')}.
      <br><br>
      <strong>Pass 2 — Substring containment.</strong> If Pass 1 misses, check whether the raw extracted value contains a known description as a substring, or vice versa. Claude returned ${inlineCode('"dept = beach"')} for location — "beach" is a substring of "Beach Location" → Location code ${inlineCode('"2"')}. Status → ${key('inferred')}, confidence 0.8, flagged for human review.
      <br><br>
      Falls through both passes → status ${key('invalid')}. Reviewer sees red badge and can manually select the correct code.`,
      'They may ask: "what if Claude returns something completely unrecognizable?" → It falls to "invalid." Reviewer sees the raw value and a dropdown to correct it.'
    )}
    ${qa(
      'What happens when Claude returns malformed JSON?',
      `I built ${inlineCode('retry_extraction()')} in ${inlineCode('app.py')}. The main extraction call asks Claude to return a specific JSON schema. If ${inlineCode('json.loads()')} throws, the retry fires with a simplified prompt — more explicit: <em>"Return ONLY the JSON object, no other text."</em>
      <br><br>
      Most malformed responses in testing were Claude adding explanatory prose around the JSON block, not actual JSON errors. The simplified prompt eliminates that.
      <br><br>
      If the retry also fails → 500 error with a user-facing message to re-upload with a cleaner scan.`,
      '"In production I\'d log every failed extraction with the raw Claude response to audit patterns — maybe we\'re consistently failing on a specific form page or handwriting style. That data lets us tune the prompt over time."'
    )}
    ${qa(
      'How do confidence scores work — can they be wrong?',
      `Confidence scores come directly from Claude. The extraction prompt asks Claude to include a per-field confidence (0.0–1.0) for fields where legibility might be in question.
      <br><br>
      <strong>Yes, they can be wrong.</strong> Claude is self-assessing its own reading. In the Taylor Swift packet, DOB got 0.85 — Claude correctly flagged its own uncertainty. But Claude can also be overconfident: 0.95 on a misread value.
      <br><br>
      That's exactly why the human-in-loop review step exists. Confidence scores are a <em>triage signal</em>, not a guarantee. High-confidence fields still need a human glance — they just get less visual emphasis.`,
      '"A more robust system would cross-validate confidence against historical accuracy. If Claude tends to be overconfident on routing numbers, apply a correction factor or always require human verification for that field regardless of score."'
    )}
    ${qa(
      'Why send all pages in one API call instead of page by page?',
      `<strong>Context continuity.</strong> New hire packets are a document, not isolated pages. The employee's name is on page 1. Their hire date may be on page 3. Their W-4 is on page 8. Separate API calls would require reconciling potentially conflicting extractions across 12 responses, and Claude loses the ability to use context from earlier pages to resolve ambiguity on later ones.
      <br><br>
      One call lets Claude treat the packet holistically. "Taylor Swift" on page 1 helps it recognize "T. Swift" as a signature on page 8, not a separate person.
      <br><br>
      Tradeoff: large multimodal payload, higher token cost. In production a hybrid approach — one call for the cover sheet, separate calls per form section — could improve cost efficiency without sacrificing accuracy.`
    )}
    ${qa(
      'Why sample only 4 pages for quality scoring?',
      `<strong>Fail fast, but cheaply.</strong> Quality scoring is a separate Claude Vision call that runs before extraction. Running it on all 12 pages would mean 12 API calls just for quality — doubling latency and cost before extraction even starts.
      <br><br>
      The 4-page sample covers: page 1 (always), then 3 evenly distributed pages. This catches the most common failure patterns: a bad first page, degradation in the middle, and a bad last page.
      <br><br>
      If pages 1, 4, 8, and 12 all score well, the rest are almost certainly fine. Worst pages are surfaced explicitly so the reviewer knows exactly which pages to manually verify.`
    )}`
  ),

  section('B', 'Validation & Business Logic', '5-status system · code mapping · blocking fields · missing info flow', C.navy, `
    ${qa(
      'Walk me through exactly what happens when a required field is missing.',
      `When Claude returns null or empty for a field, the validation engine in ${inlineCode('validator.py')} assigns status ${key('missing')}. Field result: ${inlineCode('{ value: null, status: "missing", message: "Field not found on form" }')}.
      <br><br>
      In the review screen, missing fields get a red badge. But ${em('"missing" alone doesn\'t block submission')} — what matters is whether the field is in the ${inlineCode('REQUIRED_FIELDS')} list (9 fields: firstName, lastName, ssn, origHireDate, lastHireDate, peoStartDate, jobCode, workLocationCode, employeeStatusCode, standardHours).
      <br><br>
      If any REQUIRED_FIELDS are missing → Submit button disabled + blocking alert. The summary shows: "2 missing fields — cannot submit" with the specific field names. Reviewer can: (1) manually fill via inline editing, or (2) click Generate Email to draft a request back to the client.`,
      'Key distinction: missing vs. blocking. mobilePhone is missing but not blocking — it\'s optional. standardHours is missing AND blocking — required by PrismHR\'s importEmployees schema.'
    )}
    ${qa(
      'What\'s the difference between "inferred," "auto_assigned," and "valid"?',
      `<span class="status-badge valid">VALID</span> — Value extracted directly from the form and maps exactly to a known code or passes format validation. "Instructor" → job code "IN."
      <br><br>
      <span class="status-badge inferred">INFERRED</span> — Fuzzy match succeeded (substring containment) but not exact. Confidence lower. "dept = beach" → Location code "2." Flagged for human review because the mapping required interpretation.
      <br><br>
      <span class="status-badge auto">AUTO-ASSIGNED</span> — System assigned without any form input. Either only one valid option exists or the assignment is always the same for new hires. payGroupCode = "BI5-SAT" (only one pay group). employeeStatusCode = "A" (all new hires are Active).
      <br><br>
      The distinction matters for audit trails: in production, log which fields were inferred vs. auto-assigned vs. directly validated so a compliance reviewer can see how each value was sourced.`
    )}
    ${qa(
      'How does the system know what a valid job code or location code is?',
      `Valid codes come from ${inlineCode('data/client_codes.json')} — hardcoded for Jordan's Surf Shack (client ID 15650). Defines all valid options: job codes (OW, IN, RW), locations (1=Retail, 2=Beach), employee types, pay groups, benefit groups, statuses.
      <br><br>
      The validator loads this file at startup and builds lookup maps. Every code validation runs against those maps.
      <br><br>
      <strong>In production:</strong> this JSON is replaced by a live ${inlineCode('getClientCodes')} API call to PrismHR, returning valid codes for whatever client the packet belongs to. The architecture is designed for this swap — the validator just needs a dict of valid codes, it doesn't care if it came from a file or an API.`
    )}
    ${qa(
      'How would you add a new client with different codes?',
      `<strong>Prototype:</strong> create a new JSON file in ${inlineCode('data/')} following the same schema. Validator reads the client ID from packet context and loads the corresponding file.
      <br><br>
      <strong>Production:</strong> pass a different client ID to ${inlineCode('getClientCodes')} — no file changes needed. Client codes cache 24hr per client.
      <br><br>
      The bigger challenge is form variation. Different clients may use slightly different new hire packet templates. The extraction prompt needs testing against each client's format. Manageable engineering effort, but real work.`
    )}
    ${qa(
      'What happens if handwriting is completely illegible?',
      `Claude returns whatever it can read with a low confidence score. In extreme cases: null for the field.
      <br><br>
      Null on a required field → ${key('missing')}, red badge, blocks submission. The reviewer can manually enter the correct value or trigger Generate Email to request a rescan.
      <br><br>
      The quality scoring step is partly designed to catch this <em>proactively</em> — if page 5 scores 2/5 on sharpness, the system flags it before extraction runs and tells the reviewer to consider requesting a rescan. Catching bad scans early saves the extraction API cost.`,
      '"In production I\'d want to track which clients consistently submit low-quality scans and build a client-facing tip sheet or automated reminder before their upload deadline."'
    )}`
  ),

  section('C', 'Product Decisions', 'Why human-in-loop · why Flask · why hardcoded data · why these tech choices', '#7B2C8A', `
    ${qa(
      'Why did you keep the human in the loop instead of fully automating submission?',
      `<strong>Two reasons: accuracy stakes and trust building.</strong>
      <br><br>
      <em>Accuracy stakes:</em> This is payroll data. A wrong SSN, pay rate, or job code has real downstream consequences — wrong W-4 filing status affects tax withholding, wrong pay rate affects the paycheck. AI extraction is very good, but not infallible. When consequences are this high, a human review step is the right call.
      <br><br>
      <em>Trust building:</em> You're introducing AI into a workflow HR coordinators have owned manually for years. One auto-submitted error that reaches PrismHR immediately destroys trust in the tool. But if the human reviewer confirms each submission, they build confidence over time. After 90 days of proven accuracy (say, 99%+ on high-confidence packets) → introduce auto-submit threshold. Start with human-in-loop, build the track record, then selectively automate the easiest cases first.`,
      'This answer demonstrates product maturity — not just "I wanted safety" but a deliberate strategy with a specific path toward more automation.'
    )}
    ${qa(
      'Why is the dashboard data hardcoded instead of pulling from processed uploads?',
      `Honest answer: scope and time. The dashboard was added to show the full packet management workflow vision — multiple clients, status tracking, filtering. Building it with live data would have required a proper persistence layer: database, packet status state machine, client-packet relationship model.
      <br><br>
      I made a deliberate call to use hardcoded mock data for the dashboard so I could show the full product vision without building production infrastructure in a prototype. The upload → review flow is <em>fully live</em>. The dashboard is a design artifact showing where the product goes next.
      <br><br>
      <strong>In production:</strong> dashboard pulls from a database (Postgres or Firestore) with a packets table storing status, client ID, reviewer assignment, extracted data, and submission history.`,
      'Don\'t be defensive. Own it: "I made a deliberate tradeoff to show the full product vision without building infrastructure that wasn\'t core to the prototype\'s purpose." That\'s good product judgment.'
    )}
    ${qa(
      'Why Flask? Why not a modern framework or serverless?',
      `Flask was the pragmatic choice for a Python prototype. The core processing logic — PDF conversion, Claude API calls, validation — is all Python. Flask keeps everything in one language, uses Python's rich ecosystem (pdf2image, Pillow, Anthropic SDK), and moves fast without infrastructure overhead.
      <br><br>
      <strong>Serverless (AWS Lambda) would have added real complexity:</strong> cold starts are problematic for 30–60 sec processing jobs; binary dependencies like poppler are a deployment headache in Lambda layers; large file uploads through API Gateway have size limits requiring S3 staging.
      <br><br>
      For production I'd reconsider — the pipeline is a natural fit for an async task queue. Probably FastAPI or Django with Celery, deployed on a container platform. But that's a significant architecture upgrade that wasn't necessary to prove the concept.`
    )}
    ${qa(
      'Why no database — just JSON files?',
      `Same principle as the Flask choice: minimum viable persistence for a prototype. I needed packet data to survive page loads without re-running the AI extraction. A JSON sidecar file per upload gives me that without standing up a database server.
      <br><br>
      The in-memory dict (${inlineCode('processed_packets')}) handles the hot path — no disk read if the packet is already in memory. The JSON file is the fallback on server restart.
      <br><br>
      The limitations are obvious: no concurrent write safety, no querying across packets, no relational data. Acceptable for a single-user prototype. In production: replace the JSON sidecar with a Postgres write and the in-memory cache with Redis.`
    )}
    ${qa(
      'Why completeness and quality checks before the expensive AI call?',
      `<strong>Fail fast.</strong> If a packet is 4 pages when we expect 8–12, there's no point running a $2–5 Claude extraction call on an incomplete document. Surface the problem immediately.
      <br><br>
      Quality scoring is a smaller AI call (4 pages sampled) that costs less than the full extraction. It gives the reviewer actionable information — "Page 5 has glare, request a rescan" — before we run the expensive call. Catching a bad page early is cheaper than: running full extraction → finding low-confidence values → going back to the client → running extraction again.
      <br><br>
      The order is deliberate: cheap checks first, expensive calls only when the packet is worth processing.`
    )}`
  ),

  section('D', 'Production Readiness', 'Security · PrismHR API · batch architecture · audit trails', C.red, `
    ${qa(
      'What security problems exist with the current prototype?',
      `I want to be direct about these — they're expected in a prototype and fixable in production:
      <br><br>
      <span class="security-badge bad">SSN plaintext</span> Stored in JSON file + displayed in review UI. Production: encrypt at rest (AES-256), mask display (XXX-XX-XXXX), log every reveal.
      <br><br>
      <span class="security-badge bad">No authentication</span> Anyone reaching the URL can upload + view PII. Production: RBAC with ProService employee accounts. Roles: uploader, reviewer, admin.
      <br><br>
      <span class="security-badge bad">API key in .env</span> Anthropic key on the filesystem. Production: secrets manager (AWS Secrets Manager / HashiCorp Vault). Never in source control.
      <br><br>
      <span class="security-badge bad">No audit trail</span> Field edits silently update in-memory data. Production: append-only audit_log table — who changed what, from/to values, timestamp. Never update, never delete.
      <br><br>
      <span class="security-badge bad">Minimal file validation</span> MIME type + size check only. Production: deep file inspection, antivirus, quarantine before processing.`
    )}
    ${qa(
      'How would the getClientCodes API integration work in production?',
      `PrismHR's ${inlineCode('getClientCodes')} endpoint takes a ${inlineCode('clientId')} parameter and returns the complete valid code set for that client.
      <br><br>
      In production, the ${inlineCode('/process')} route calls ${inlineCode('getClientCodes')} at the start of each processing run. The response replaces ${inlineCode('client_codes.json')}. The validation engine receives the same data structure — no changes to validation logic.
      <br><br>
      <strong>Caching opportunity:</strong> client codes don't change often. Cache each client's response with a 24hr TTL. If a client adds a new job code, the cache invalidates overnight.
      <br><br>
      <strong>Auth:</strong> OAuth 2.0 service-to-service credentials in a secrets manager. Token refresh handled transparently by an API client layer.`
    )}
    ${qa(
      'How would you architect batch processing for 50 clients and 500 packets/month?',
      `<strong>The problem:</strong> current architecture processes one packet synchronously. That doesn't scale.
      <br><br>
      <strong>Architecture:</strong> Coordinator uploads → app stores file in S3/GCS, writes job record to DB with status "queued," returns job_id immediately. Background worker (Celery, Cloud Tasks, or SQS + Lambda) picks up the job, runs the pipeline, updates status to "ready_for_review." Dashboard polls or uses WebSocket for status updates.
      <br><br>
      <strong>Multi-tenant:</strong> each packet belongs to a client. Validator loads that client's codes. Client configs live in the database, not flat files.
      <br><br>
      <strong>Cost at scale:</strong> ~$500–2,500/month for Claude Vision at 500 packets/month. Well within ROI envelope vs. manual processing costs.`,
      'Frame it as a product outcome: "The key metric is time-to-ready-for-review. Right now it\'s ~60 seconds synchronous. Async queue decouples upload from processing — coordinators batch-upload Monday packets and review them Tuesday morning."'
    )}
    ${qa(
      'What would a real audit trail look like?',
      `Append-only ${inlineCode('audit_log')} table in Postgres. Every state change gets a timestamped, attributed row:
      <br><br>
      • Packet uploaded — who, when, client, file hash<br>
      • Extraction completed — model version, confidence, processing duration<br>
      • Each field edit — field name, previous value, new value, reviewer ID, timestamp<br>
      • Email generated — who triggered it, which fields were flagged<br>
      • Submitted to PrismHR — who confirmed, transaction ID, timestamp
      <br><br>
      <strong>Never update, never delete.</strong> Serves compliance (prove what was submitted and who approved it), debugging (trace why a field value differs from the form), and continuous improvement (analyze which fields are most frequently corrected to tune the extraction prompt).`
    )}`
  ),

  section('E', "What You'd Build Next", 'Prioritized roadmap — memorize this order and the reasoning', C.green, `
    <div class="roadmap-intro">Memorize this prioritization. This will definitely come up.</div>
    ${qa(
      "What would you build next if this moved to production?",
      `<div class="roadmap-item">
        <span class="roadmap-num" style="background:#C00000">1</span>
        <div><strong>Real PrismHR API Integration</strong><br>This is the literal purpose of the tool. Wire up importEmployees, updateW4, updateDirectDeposit. Without this it's a review tool, not automation.</div>
      </div>
      <div class="roadmap-item">
        <span class="roadmap-num" style="background:#C55A11">2</span>
        <div><strong>Authentication + RBAC</strong><br>Can't give coordinators access to SSNs without proper auth. Prerequisite for any production deployment.</div>
      </div>
      <div class="roadmap-item">
        <span class="roadmap-num" style="background:#2E75B6">3</span>
        <div><strong>Async Processing Queue</strong><br>Synchronous 60-sec processing doesn't scale. Background queue with job status updates. Required for real volume.</div>
      </div>
      <div class="roadmap-item">
        <span class="roadmap-num" style="background:#375623">4</span>
        <div><strong>Confidence-Based Auto-Submit Threshold</strong><br>After 90 days of accuracy data: packets where all required fields are valid + confidence >0.95 auto-submit. This is where ROI compounds.</div>
      </div>
      <div class="roadmap-item">
        <span class="roadmap-num" style="background:#6B21A8">5</span>
        <div><strong>Multi-Client Config + Form Detection</strong><br>Scale beyond Jordan's Surf Shack. Per-client code configs. Form-level detection per client template.</div>
      </div>
      <div class="roadmap-item">
        <span class="roadmap-num" style="background:#595959">6</span>
        <div><strong>Full Audit Trail + Compliance Reporting</strong><br>Required for PII at production scale. Every edit logged with attribution.</div>
      </div>`,
      'End with: "The order is deliberate — I start with what makes it actually work (PrismHR), then safe (auth), then scalable (async), then smart (auto-submit), then broad (multi-client). Each step builds on the last."'
    )}`
  ),

  section('F', 'Process & Role', 'APM fit · 30/60/90 · why ProService · what you\'d do in the role', '#7B5800', `
    ${qa(
      'How did you decide what to build vs. cut?',
      `I started with the outcome: reduce manual effort of entering new hire packet data into PrismHR. Everything I built had to connect to that outcome.
      <br><br>
      The processing pipeline (upload → quality check → extraction → validation → review) is the critical path. Built first, built completely.
      <br><br>
      The dashboard was added at the end as a "show the full product vision" artifact. A dashboard with multiple clients and statuses communicates the broader product direction more powerfully than a single-packet tool.
      <br><br>
      <strong>What I cut:</strong> email delivery (draft only, no SMTP), batch upload, real PrismHR submission. All correctly scoped as "production" features.`
    )}
    ${qa(
      'What would your first 30/60/90 days look like?',
      `<strong>Days 1–30 — Learn the real workflow.</strong> Shadow HR coordinators processing actual packets. Understand where the real pain is. Map the full data flow from client submission to PrismHR record. Identify the highest-volume failure modes.
      <br><br>
      <strong>Days 31–60 — Define the real MVP.</strong> Write product requirements based on month-1 learnings. Align with engineering on v1 scope: PrismHR API + auth + async. Size the build. Start the design sprint.
      <br><br>
      <strong>Days 61–90 — First production milestone.</strong> Working PrismHR integration in staging. Pilot with a small group of HR coordinators on real packets. Collect first accuracy data. Report to Jordan: what worked, what needs iteration. Draft v2 roadmap.`
    )}
    ${qa(
      'You used Claude Code to build this — where did product decisions come from vs. the AI?',
      `Claude Code handled the implementation — writing Flask routes, validation logic, HTML/CSS/JS. What I directed and owned:
      <br><br>
      • The core product concept: AI extraction + human validation as the workflow<br>
      • The 5-status system — distinguishing inferred from auto-assigned from valid was a deliberate product choice about communicating uncertainty to reviewers<br>
      • The UI architecture: split panel, which fields surface first, what quality scoring communicates<br>
      • The demo script: what story to tell, what to emphasize<br>
      • Every "why" behind the decisions you're asking about now
      <br><br>
      Claude Code compressed implementation time. The product thinking — what to build, how it should work, why it's designed this way — was mine.`,
      '"AI-assisted development compresses implementation time dramatically. My value-add is directing what to build and making the judgment calls on how it should work. The coding is faster; the product thinking is still entirely human."'
    )}
    ${qa(
      'Why this role, why ProService, why now?',
      `ProService is solving a problem I find genuinely interesting: AI on a high-stakes operational workflow where data is messy, consequences are real, and users are non-technical. That's the hard version of the AI problem. Most demos show clean data and forgiving use cases. New hire packet extraction is the opposite.
      <br><br>
      The APM role is the right level for where I am. I've been doing product work at Sendero — AI/automation products, discovery, requirements, partnering with engineering. And F45 before that where I owned a product roadmap for a global franchise. I'm ready to own a product from prototype to production inside a single company.
      <br><br>
      The demo process itself told me a lot about the culture — a company that evaluates product candidates by asking them to build something is the kind of company I want to work at.`,
      `End with: <em>"I built HireFlow in two weeks because the problem was interesting enough to make me want to build it. That's the best signal I know for fit."</em>`
    )}`
  ),
];

// ── CHEAT SHEET ───────────────────────────────────────────────────────────────
const cheatSheet = `
  <div class="cheat-header">Quick-Reference Cheat Sheet</div>
  <p class="cheat-sub">Key numbers and facts to have on the tip of your tongue</p>
  <table class="cheat-table">
    ${[
      ['PDF conversion DPI', '150 DPI via pdf2image + poppler'],
      ['Quality scoring sample', '4 pages (page 1 + 3 evenly spaced)'],
      ['Claude model', 'claude-sonnet-4-20250514'],
      ['Processing time', '~30–60 seconds per packet'],
      ['Validation statuses', 'valid · missing · invalid · inferred · auto_assigned'],
      ['REQUIRED_FIELDS count', '9 fields that block submission (incl. standardHours)'],
      ['Client in prototype', "Jordan's Surf Shack, client ID 15650"],
      ['Job codes', 'OW (Owner) · IN (Instructor) · RW (Retail Worker)'],
      ['Location codes', '1 = Retail · 2 = Beach'],
      ['Pay group', 'BI5-SAT (Bi-weekly, pay on Friday)'],
      ['PDF viewer library', 'PDF.js 3.11 (Mozilla CDN), Canvas-based rendering'],
      ['API routes', '9 routes total (3 GET views + 6 action routes)'],
      ['Data persistence', 'In-memory dict + JSON sidecar file per upload'],
      ['Fuzzy matching', 'Two-pass: exact dict → substring containment'],
      ['Retry on bad JSON', 'retry_extraction() with simplified "JSON only" prompt'],
      ['Mock payload API', 'importEmployees (PrismHR schema)'],
    ].map(([k, v], i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td class="cheat-key">${k}</td>
        <td class="cheat-val">${v}</td>
      </tr>`).join('')}
  </table>`;

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11pt;
    color: #1a1a2e;
    background: #fff;
    line-height: 1.6;
  }

  /* ── Cover page ──────────────────── */
  .cover {
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #1F3864 0%, #2E75B6 60%, #4A9FD4 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 3rem;
    text-align: center;
    page-break-after: always;
  }
  .cover-eyebrow {
    font-size: 10pt;
    font-weight: 600;
    letter-spacing: 3px;
    color: #BDD7EE;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }
  .cover-title {
    font-size: 48pt;
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 0.5rem;
  }
  .cover-subtitle {
    font-size: 22pt;
    font-weight: 500;
    color: #BDD7EE;
    margin-bottom: 2rem;
  }
  .cover-divider {
    width: 80px;
    height: 4px;
    background: #BDD7EE;
    margin: 1.5rem auto;
    border-radius: 2px;
  }
  .cover-meta {
    font-size: 12pt;
    color: #EBF3FB;
    margin-bottom: 2.5rem;
  }
  .cover-tags {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .cover-tag {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    color: #fff;
    padding: 0.35rem 1rem;
    border-radius: 999px;
    font-size: 9pt;
    font-weight: 500;
  }
  .cover-howto {
    margin-top: 3rem;
    background: rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 1.5rem 2rem;
    max-width: 600px;
    text-align: left;
  }
  .cover-howto h3 { color: #BDD7EE; font-size: 10pt; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.75rem; }
  .cover-howto li { color: #EBF3FB; font-size: 10pt; margin-bottom: 0.4rem; list-style: none; padding-left: 1.2rem; position: relative; }
  .cover-howto li::before { content: '→'; position: absolute; left: 0; color: #BDD7EE; }

  /* ── Sections ────────────────────── */
  .section-break { page-break-before: always; }

  .section-header {
    display: flex;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }
  .section-letter {
    font-size: 36pt;
    font-weight: 800;
    color: rgba(255,255,255,0.3);
    background: rgba(0,0,0,0.15);
    width: 80px;
    min-width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -1px;
  }
  .section-titles {
    padding: 1rem 1.5rem;
    flex: 1;
  }
  .section-title {
    font-size: 20pt;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
  }
  .section-subtitle {
    font-size: 10pt;
    color: rgba(255,255,255,0.75);
    margin-top: 0.25rem;
    font-style: italic;
  }

  /* ── Q&A blocks ──────────────────── */
  .qa-block {
    margin-bottom: 2rem;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e0e6ef;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .question-row {
    display: flex;
    align-items: flex-start;
    background: #1F3864;
    padding: 0.9rem 1.2rem;
    gap: 0.8rem;
  }
  .q-badge {
    background: #2E75B6;
    color: #fff;
    font-weight: 800;
    font-size: 11pt;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .question-text {
    color: #EBF3FB;
    font-size: 11.5pt;
    font-weight: 600;
    line-height: 1.4;
    padding-top: 2px;
  }
  .answer-row {
    display: flex;
    align-items: flex-start;
    background: #fff;
    padding: 1.1rem 1.2rem;
    gap: 0.8rem;
  }
  .a-badge {
    background: #E2EFDA;
    color: #375623;
    font-weight: 800;
    font-size: 11pt;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .answer-text {
    color: #1a1a2e;
    font-size: 10.5pt;
    line-height: 1.7;
    flex: 1;
  }
  .answer-text strong { color: #1F3864; }
  .answer-text em { color: #2E75B6; font-style: normal; font-weight: 600; }

  .tip-box {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    background: #FFF8E1;
    border-top: 1px solid #F0A000;
    padding: 0.75rem 1.2rem;
  }
  .tip-icon { font-size: 12pt; flex-shrink: 0; }
  .tip-text { font-size: 9.5pt; color: #7B5800; font-style: italic; line-height: 1.55; }

  /* ── Inline code ─────────────────── */
  code.ic {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9pt;
    background: #F0F4F8;
    color: #C00000;
    padding: 1px 5px;
    border-radius: 4px;
    border: 1px solid #dde3ea;
  }

  /* ── Key/badge ───────────────────── */
  .key {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9pt;
    font-weight: 600;
    background: #EBF3FB;
    color: #1F3864;
    padding: 1px 7px;
    border-radius: 4px;
    border: 1px solid #BDD7EE;
  }

  /* ── Status badges ───────────────── */
  .status-badge {
    display: inline-block;
    font-size: 9pt;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 4px;
    letter-spacing: 0.5px;
    margin-right: 0.3rem;
  }
  .status-badge.valid   { background: #E2EFDA; color: #375623; }
  .status-badge.inferred { background: #FBE5D6; color: #C55A11; }
  .status-badge.auto    { background: #EBF3FB; color: #1F3864; }

  /* ── Security badges ─────────────── */
  .security-badge {
    display: inline-block;
    font-size: 8.5pt;
    font-weight: 700;
    padding: 1px 8px;
    border-radius: 4px;
    margin-right: 0.5rem;
  }
  .security-badge.bad { background: #FDECEA; color: #C00000; border: 1px solid #C00000; }

  /* ── Roadmap items ───────────────── */
  .roadmap-intro {
    background: #FFF8E1;
    border-left: 4px solid #F0A000;
    padding: 0.6rem 1rem;
    font-weight: 600;
    font-size: 10pt;
    color: #7B5800;
    margin-bottom: 1rem;
    border-radius: 0 6px 6px 0;
  }
  .roadmap-item {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    background: #F5F7FA;
    border-radius: 6px;
    border: 1px solid #e0e6ef;
  }
  .roadmap-num {
    color: #fff;
    font-weight: 800;
    font-size: 14pt;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* ── Cheat sheet ─────────────────── */
  .cheat-header {
    font-size: 22pt;
    font-weight: 800;
    color: #1F3864;
    text-align: center;
    margin: 2rem 0 0.5rem;
  }
  .cheat-sub {
    text-align: center;
    color: #595959;
    font-style: italic;
    font-size: 10pt;
    margin-bottom: 1.5rem;
  }
  .cheat-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
  }
  .cheat-table tr.even { background: #EBF3FB; }
  .cheat-table tr.odd  { background: #fff; }
  .cheat-key {
    font-weight: 600;
    color: #1F3864;
    padding: 0.55rem 1rem;
    width: 36%;
    border: 1px solid #dde3ea;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9pt;
  }
  .cheat-val {
    color: #1a1a2e;
    padding: 0.55rem 1rem;
    border: 1px solid #dde3ea;
  }

  /* ── Page layout ─────────────────── */
  @page {
    size: letter;
    margin: 0.75in 0.85in;
    @top-right {
      content: "HireFlow Q&A Prep · Devan Capps";
      font-size: 8pt;
      color: #aaa;
    }
    @bottom-center {
      content: counter(page);
      font-size: 8pt;
      color: #aaa;
    }
  }
  @media print {
    .qa-block { break-inside: avoid; }
    .section-header { break-after: avoid; }
  }
`;

// ── FULL HTML ─────────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HireFlow Interview Q&A Prep</title>
<style>${css}</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-eyebrow">ProService Hawaii · APM Interview Prep</div>
  <div class="cover-title">HireFlow</div>
  <div class="cover-subtitle">Prototype Probe Q&amp;A</div>
  <div class="cover-divider"></div>
  <div class="cover-meta">Stage 4 Final Round &nbsp;·&nbsp; Devan Capps &nbsp;·&nbsp; March 2026</div>
  <div class="cover-tags">
    <span class="cover-tag">6 Themes</span>
    <span class="cover-tag">29 Questions</span>
    <span class="cover-tag">Full Polished Answers</span>
    <span class="cover-tag">Interview Tips</span>
    <span class="cover-tag">Cheat Sheet</span>
  </div>
  <div class="cover-howto">
    <h3>How to use this doc</h3>
    <ul>
      <li>Read every answer out loud at least once — hearing yourself matters</li>
      <li>Best answers are 60–90 seconds: lead with the direct point, add one detail</li>
      <li>Never apologize for prototype shortcuts — own every decision</li>
      <li>Use the Cheat Sheet (last page) the morning of your interview</li>
    </ul>
  </div>
</div>

${themes.join('\n')}

<!-- CHEAT SHEET -->
<div style="page-break-before: always;">
  ${cheatSheet}
</div>

</body>
</html>`;

// ── GENERATE PDF ──────────────────────────────────────────────────────────────
(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: OUT,
    format: 'Letter',
    margin: { top: '0.75in', right: '0.85in', bottom: '0.75in', left: '0.85in' },
    printBackground: true,
  });
  await browser.close();
  console.log('Done: Interview-QA-Prep.pdf');
})();
