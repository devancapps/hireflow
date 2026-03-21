const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'HireFlow Study Guide';
pres.author = 'Devan Capps';

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  navy:    '1F3864',
  blue:    '2E75B6',
  ltblue:  'BDD7EE',
  sky:     'EBF3FB',
  green:   '375623',
  ltgreen: 'E2EFDA',
  amber:   'F0A000',
  ltamber: 'FFF2CC',
  red:     'C00000',
  white:   'FFFFFF',
  offwhite:'F5F7FA',
  gray:    '595959',
  ltgray:  'CCCCCC',
  darkgray:'363636',
};

// ── Layout helpers ────────────────────────────────────────────────────────────
// Slide: 10" x 5.625"

function headerBar(slide, title, subtitle) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: C.navy }, line: { color: C.navy } });
  slide.addText(title, { x: 0.35, y: 0.08, w: 9.3, h: 0.55, fontSize: 28, bold: true, color: C.white, fontFace: 'Arial', margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.35, y: 0.62, w: 9.3, h: 0.38, fontSize: 14, color: C.ltblue, fontFace: 'Arial', italics: true, margin: 0 });
  }
}

function footerBar(slide, note) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.35, w: 10, h: 0.275, fill: { color: C.navy }, line: { color: C.navy } });
  slide.addText(note || 'HireFlow Study Guide  ·  Devan Capps  ·  ProService APM Interview Prep', {
    x: 0.2, y: 5.36, w: 9.6, h: 0.24, fontSize: 9, color: C.ltblue, fontFace: 'Arial', align: 'center', margin: 0
  });
}

function bodyText(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, { x, y, w, h, fontSize: opts.size || 13, color: opts.color || C.darkgray, fontFace: 'Arial', valign: 'top', ...opts });
}

function bulletBlock(slide, items, x, y, w, h, opts = {}) {
  const runs = items.map((item, i) => ({
    text: item,
    options: { bullet: true, breakLine: i < items.length - 1 }
  }));
  slide.addText(runs, { x, y, w, h, fontSize: opts.size || 12, color: opts.color || C.darkgray, fontFace: 'Arial', valign: 'top', ...opts });
}

function sectionLabel(slide, text, x, y, color) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.5, h: 0.28, fill: { color: color || C.blue }, line: { color: color || C.blue } });
  slide.addText(text, { x: x + 0.05, y: y + 0.01, w: 1.4, h: 0.26, fontSize: 9, bold: true, color: C.white, fontFace: 'Arial', align: 'center', margin: 0 });
}

function calloutBox(slide, text, x, y, w, h, bgColor, borderColor, textColor) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: bgColor || C.ltamber }, line: { color: borderColor || C.amber, width: 1.5 } });
  slide.addText(text, { x: x + 0.1, y: y + 0.05, w: w - 0.2, h: h - 0.1, fontSize: 11, color: textColor || C.darkgray, fontFace: 'Arial', italics: true, valign: 'top' });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE SLIDE
// ══════════════════════════════════════════════════════════════════════════════
let s = pres.addSlide();
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.navy }, line: { color: C.navy } });
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 3.8, w: 10, h: 1.825, fill: { color: C.blue }, line: { color: C.blue } });
s.addText('HireFlow', { x: 0.5, y: 0.5, w: 9, h: 1.5, fontSize: 72, bold: true, color: C.white, fontFace: 'Arial', align: 'center', margin: 0 });
s.addText('Technical Study Guide', { x: 0.5, y: 1.9, w: 9, h: 0.7, fontSize: 36, color: C.ltblue, fontFace: 'Arial', align: 'center', margin: 0 });
s.addText('Stage 4 Final Round Prep  ·  ProService Hawaii APM', { x: 0.5, y: 2.7, w: 9, h: 0.4, fontSize: 18, color: C.ltblue, fontFace: 'Arial', align: 'center', italics: true, margin: 0 });
s.addText('Devan Capps  ·  March 2026', { x: 0.5, y: 3.9, w: 9, h: 0.35, fontSize: 16, color: C.white, fontFace: 'Arial', align: 'center', margin: 0 });
s.addText('Review this deck the morning of your interview. Every technical claim you made in the Stage 3 demo is covered here.', { x: 0.5, y: 4.35, w: 9, h: 0.7, fontSize: 13, color: C.ltblue, fontFace: 'Arial', align: 'center', italics: true, margin: 0 });

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — THE PROBLEM HIREFLOW SOLVES
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'The Problem HireFlow Solves', 'ProService Hawaii new hire onboarding workflow');
s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.25, w: 9.4, h: 0.6, fill: { color: C.sky }, line: { color: C.ltblue } });
s.addText('Every new hire at a ProService client company requires a paper packet to be completed, scanned, and submitted. A data entry coordinator then manually keys every field into PrismHR.', { x: 0.4, y: 1.3, w: 9.2, h: 0.5, fontSize: 12, color: C.navy, fontFace: 'Arial', valign: 'middle' });

// 5-step manual process
const steps = ['Client completes\nhandwritten packet', 'Scans & emails\nPDF to ProService', 'Coordinator reads\npacket manually', 'Keys every field\ninto PrismHR', 'Verifies codes &\nsubmits record'];
const stepsX = [0.25, 2.25, 4.25, 6.25, 8.25];
steps.forEach((step, i) => {
  s.addShape(pres.shapes.RECTANGLE, { x: stepsX[i], y: 2.0, w: 1.7, h: 1.1, fill: { color: C.blue }, line: { color: C.navy } });
  s.addText(step, { x: stepsX[i] + 0.05, y: 2.05, w: 1.6, h: 1.0, fontSize: 11, bold: true, color: C.white, fontFace: 'Arial', align: 'center', valign: 'middle' });
  if (i < 4) s.addText('\u25B6', { x: stepsX[i] + 1.72, y: 2.35, w: 0.5, h: 0.4, fontSize: 18, color: C.navy, fontFace: 'Arial', align: 'center' });
});

s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.25, w: 9.4, h: 1.1, fill: { color: 'FDECEA' }, line: { color: C.red } });
s.addText('Pain points', { x: 0.45, y: 3.3, w: 2, h: 0.3, fontSize: 12, bold: true, color: C.red, fontFace: 'Arial' });
bulletBlock(s, ['45-60 min per packet for manual data entry', 'High error rate from transcription mistakes', 'Delays in employee onboarding when data entry backs up', 'No validation that entered codes match PrismHR\u2019s valid code set'], 0.45, 3.6, 9.1, 0.7, { size: 11 });
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — WHAT HIREFLOW DOES (SOLUTION OVERVIEW)
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'What HireFlow Does', 'AI-powered extraction, validation, and review for new hire packets');
const solSteps = ['Upload PDF', 'Quality\nCheck', 'AI\nExtraction', 'Validation\nEngine', 'Human\nReview', 'Submit to\nPrismHR'];
const solColors = [C.blue, C.blue, C.navy, C.navy, C.green, C.green];
const solX = [0.1, 1.75, 3.4, 5.05, 6.7, 8.35];
solSteps.forEach((step, i) => {
  s.addShape(pres.shapes.RECTANGLE, { x: solX[i], y: 1.3, w: 1.5, h: 0.95, fill: { color: solColors[i] }, line: { color: C.navy } });
  s.addText(step, { x: solX[i] + 0.05, y: 1.35, w: 1.4, h: 0.85, fontSize: 11, bold: true, color: C.white, fontFace: 'Arial', align: 'center', valign: 'middle' });
  if (i < 5) s.addText('\u25B6', { x: solX[i] + 1.52, y: 1.6, w: 0.2, h: 0.4, fontSize: 14, color: C.navy, fontFace: 'Arial', align: 'center' });
});

s.addText('Key capabilities', { x: 0.35, y: 2.45, w: 9, h: 0.3, fontSize: 13, bold: true, color: C.navy, fontFace: 'Arial' });
const caps = [
  ['Claude Vision AI', 'Reads handwritten forms with spatial + semantic context. Far superior to Tesseract OCR on variable handwriting.'],
  ['Scan Quality Scoring', '4 sample pages scored on sharpness, lighting, skew, coverage. Flags bad pages before extraction runs.'],
  ['5-Status Validation', 'Every field gets a status: valid / missing / invalid / inferred / auto_assigned. Drives review UX.'],
  ['Human-in-Loop Review', 'Split panel: original PDF left, extracted fields right. Inline editing. Submit only when reviewer approves.'],
];
caps.forEach(([title, desc], i) => {
  const cx = i < 2 ? 0.35 : 5.15;
  const cy = 2.8 + (i % 2) * 0.9;
  s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 4.5, h: 0.75, fill: { color: C.sky }, line: { color: C.ltblue } });
  s.addText(title, { x: cx + 0.1, y: cy + 0.04, w: 4.3, h: 0.28, fontSize: 11, bold: true, color: C.navy, fontFace: 'Arial', margin: 0 });
  s.addText(desc, { x: cx + 0.1, y: cy + 0.33, w: 4.3, h: 0.38, fontSize: 9.5, color: C.gray, fontFace: 'Arial', valign: 'top', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — TECH STACK
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Tech Stack', 'Every technology choice is a deliberate decision — know the why');
const stack = [
  ['Backend', 'Python 3.9 + Flask', 'Processing logic is all Python (pdf2image, Pillow, Anthropic SDK). Flask keeps everything in one language with minimal infrastructure overhead.'],
  ['AI / OCR', 'Anthropic Claude Sonnet (Vision)\nclaude-sonnet-4-20250514', 'Multimodal: reads base64-encoded JPEG images. Spatial + semantic understanding far exceeds Tesseract on handwritten forms.'],
  ['PDF Processing', 'pdf2image + Pillow + poppler', 'Converts PDF pages to JPEG images at 150 DPI. poppler is the underlying C library. Images are passed to Claude Vision.'],
  ['PDF Viewer', 'PDF.js 3.11 (Mozilla CDN)', 'Canvas-based rendering in-browser. Gives full control over split-panel layout. Custom PDFViewer class handles zoom, navigation, concurrency guard.'],
  ['Frontend', 'HTML5, CSS3, Vanilla JS', 'No framework — prototype scope. Dashboard, upload, and review screens each have dedicated templates and JS modules.'],
  ['Data Store', 'In-memory dict + JSON sidecar', 'Processed packets live in memory during session. JSON file per upload_id provides persistence across server restarts. No database needed for prototype.'],
];
stack.forEach(([layer, tech, why], i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = col === 0 ? 0.2 : 5.15;
  const y = 1.25 + row * 1.35;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.6, h: 1.2, fill: { color: C.sky }, line: { color: C.ltblue } });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h: 1.2, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText(layer, { x: x + 0.14, y: y + 0.05, w: 4.3, h: 0.22, fontSize: 9, bold: true, color: C.blue, fontFace: 'Arial', margin: 0 });
  s.addText(tech, { x: x + 0.14, y: y + 0.27, w: 4.3, h: 0.36, fontSize: 11, bold: true, color: C.navy, fontFace: 'Arial', margin: 0 });
  s.addText(why, { x: x + 0.14, y: y + 0.63, w: 4.3, h: 0.52, fontSize: 9, color: C.gray, fontFace: 'Arial', valign: 'top', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — 6-STEP PROCESSING PIPELINE (DETAILED)
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, '6-Step Processing Pipeline', 'What happens from upload click to validated data — know every step cold');
const pipeline = [
  ['1', 'Upload', 'POST /process\nMIME + size validation\nSave to uploads/ as UUID'],
  ['2', 'Completeness\nCheck', 'Count PDF pages\nCompare to expected 8-12\nWarn if outside range'],
  ['3', 'PDF \u2192 Images', 'pdf2image + poppler\n150 DPI JPEG\n1 image per page'],
  ['4', 'Quality\nScoring', 'Claude Vision\n4 sampled pages\nScore sharpness/lighting/skew'],
  ['5', 'AI\nExtraction', 'Claude Vision (all pages)\nOne multimodal call\nJSON schema output'],
  ['6', 'Validation', 'validator.py\n5-status per field\nBlocking check'],
];
const pipeX = [0.08, 1.75, 3.42, 5.09, 6.76, 8.43];
pipeline.forEach(([num, title, detail], i) => {
  const isAI = i >= 4;
  const isCheck = i >= 1 && i <= 3;
  const bg = i === 0 ? C.blue : isAI ? C.navy : C.blue;
  s.addShape(pres.shapes.RECTANGLE, { x: pipeX[i], y: 1.25, w: 1.52, h: 0.7, fill: { color: bg }, line: { color: C.navy } });
  s.addText(`${num}. ${title}`, { x: pipeX[i] + 0.04, y: 1.28, w: 1.44, h: 0.64, fontSize: 11, bold: true, color: C.white, fontFace: 'Arial', align: 'center', valign: 'middle' });
  if (i < 5) s.addText('\u25B6', { x: pipeX[i] + 1.53, y: 1.48, w: 0.19, h: 0.3, fontSize: 12, color: C.navy, fontFace: 'Arial', align: 'center' });
  s.addShape(pres.shapes.RECTANGLE, { x: pipeX[i], y: 2.0, w: 1.52, h: 1.4, fill: { color: C.offwhite }, line: { color: C.ltgray } });
  s.addText(detail, { x: pipeX[i] + 0.06, y: 2.05, w: 1.4, h: 1.3, fontSize: 9, color: C.gray, fontFace: 'Arial', valign: 'top' });
});
calloutBox(s, '\u26A0\uFE0F  Fail fast: completeness + quality checks run BEFORE the expensive Claude extraction call. Bad packet = no wasted API cost.', 0.2, 3.55, 9.6, 0.5, C.ltamber, C.amber);
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — CLAUDE VISION INTEGRATION
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Claude Vision Integration', 'How the AI extraction actually works under the hood');
s.addText('The Extraction Call', { x: 0.3, y: 1.2, w: 4.5, h: 0.3, fontSize: 13, bold: true, color: C.navy, fontFace: 'Arial' });
bulletBlock(s, [
  'Model: claude-sonnet-4-20250514',
  'Input: all PDF pages as base64-encoded JPEG images in one call',
  'Why one call: context continuity — name on p.1 helps Claude interpret p.8 signature',
  'Output: structured JSON matching a defined schema',
  'Prompt includes: field definitions, expected formats, confidence score request',
], 0.3, 1.55, 4.4, 2.1, { size: 11 });

s.addText('Error Handling', { x: 5.1, y: 1.2, w: 4.5, h: 0.3, fontSize: 13, bold: true, color: C.navy, fontFace: 'Arial' });
bulletBlock(s, [
  'If json.loads() fails: call retry_extraction()',
  'Retry uses simplified prompt: "Return ONLY the JSON, no other text"',
  'If retry fails: 500 error with user message to rescan',
  'Confidence scores: Claude self-assesses per field (0.0\u20131.0)',
  'Scores can be wrong \u2014 human review is the safety net',
], 5.1, 1.55, 4.4, 2.1, { size: 11 });

s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 3.75, w: 9.6, h: 0.8, fill: { color: C.sky }, line: { color: C.ltblue } });
s.addText('Why Claude Vision vs. Tesseract OCR', { x: 0.35, y: 3.8, w: 9.3, h: 0.25, fontSize: 12, bold: true, color: C.navy, fontFace: 'Arial', margin: 0 });
s.addText('Tesseract uses glyph pattern matching \u2014 optimized for clean printed text. Claude reads spatially and semantically: it understands that "Taylor" in the "First Name" box is the first name, even with messy handwriting. The tradeoff is cost ($2-5/packet) and latency (30-60 sec) vs. near-zero for Tesseract.', { x: 0.35, y: 4.05, w: 9.3, h: 0.45, fontSize: 10, color: C.gray, fontFace: 'Arial', valign: 'top', margin: 0 });
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — VALIDATION ENGINE + 5 STATUSES
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Validation Engine — 5-Status System', 'Every field gets a status. Know what each one means and how it\u2019s set.');
const statuses = [
  ['VALID', C.green, 'FFFFFF', 'Extracted value maps directly to a known code or passes format validation.\nExample: "Instructor" \u2192 job code "IN"'],
  ['MISSING', C.red, 'FFFFFF', 'Field was null or not found. If field is in REQUIRED_FIELDS list, blocks submission.\nExample: standardHours not on form'],
  ['INVALID', 'C55A11', 'FFFFFF', 'Value was extracted but doesn\u2019t match any valid code after both fuzzy passes.\nExample: job title that matches nothing in JOB_CODE_MAP'],
  ['INFERRED', 'ED7D31', 'FFFFFF', 'Fuzzy match succeeded (substring containment) but not exact.\nExample: "dept = beach" \u2192 Location 2. Confidence ~0.8. Flagged for review.'],
  ['AUTO\nASSIGNED', C.blue, 'FFFFFF', 'System assigned without form input \u2014 only one valid option or always the same for new hires.\nExample: payGroupCode = BI5-SAT (only pay group). employeeStatusCode = A (always Active).'],
];
statuses.forEach(([status, bg, fg, desc], i) => {
  const y = 1.2 + i * 0.83;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y, w: 1.6, h: 0.7, fill: { color: bg }, line: { color: C.navy } });
  s.addText(status, { x: 0.22, y: y + 0.05, w: 1.56, h: 0.6, fontSize: 13, bold: true, color: fg, fontFace: 'Arial', align: 'center', valign: 'middle', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 1.85, y, w: 7.95, h: 0.7, fill: { color: C.sky }, line: { color: C.ltblue } });
  s.addText(desc, { x: 1.95, y: y + 0.04, w: 7.8, h: 0.62, fontSize: 10, color: C.gray, fontFace: 'Arial', valign: 'top', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — FUZZY MATCHING LOGIC
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Code Mapping + Fuzzy Matching', 'Two-pass strategy for job titles and location codes');
s.addText('Pass 1: Exact Dictionary Lookup', { x: 0.3, y: 1.2, w: 4.5, h: 0.3, fontSize: 14, bold: true, color: C.navy, fontFace: 'Arial' });
s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.55, w: 4.5, h: 2.1, fill: { color: C.sky }, line: { color: C.ltblue } });
bulletBlock(s, [
  'JOB_CODE_MAP in validator.py',
  '"instructor" \u2192 "IN"',
  '"owner" \u2192 "OW"',
  '"retail worker" \u2192 "RW"',
  'Case-insensitive match',
  'Returns status: "valid" on hit',
], 0.4, 1.6, 4.3, 2.0, { size: 11, color: C.darkgray });

s.addText('Pass 2: Substring Containment', { x: 5.1, y: 1.2, w: 4.5, h: 0.3, fontSize: 14, bold: true, color: C.navy, fontFace: 'Arial' });
s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.55, w: 4.5, h: 2.1, fill: { color: C.sky }, line: { color: C.ltblue } });
bulletBlock(s, [
  'Runs if Pass 1 misses',
  'Check: does raw value contain a known description?',
  'Check: does known description contain raw value?',
  '"dept = beach" contains "beach" \u2192 Location 2',
  'Returns status: "inferred", confidence 0.8',
  'Falls through both \u2192 status: "invalid"',
], 5.2, 1.6, 4.3, 2.0, { size: 11, color: C.darkgray });

calloutBox(s, '\u26A0\uFE0F  Real example from Taylor Swift packet: Claude returned "dept = beach" for location. Substring match on "beach" \u2192 Location code "2" (Beach Location). Status = inferred. Reviewer sees yellow badge and can confirm or override.', 0.2, 3.75, 9.6, 0.55, C.ltamber, C.amber);
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — API ROUTES REFERENCE
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'API Routes Reference', 'All 9 Flask routes — know the method, path, and what each one does');
const routes = [
  ['GET', '/', 'Dashboard (home screen) — lists packets by client, status filter'],
  ['GET', '/upload', 'Upload form — drag-and-drop PDF, animated 5-step progress overlay'],
  ['POST', '/process', 'Main pipeline — runs all 6 steps, returns redirect to /review/<id>'],
  ['GET', '/review/<upload_id>', 'Review screen — loads from memory or disk JSON sidecar'],
  ['GET', '/api/packet/<upload_id>', 'JSON API — returns full packet data for AJAX calls'],
  ['POST', '/update-field', 'Inline field edit — updates field in memory + JSON sidecar'],
  ['POST', '/generate-email', 'Builds missing-info email draft from missing field list'],
  ['POST', '/submit', 'Generates mock PrismHR importEmployees payload'],
  ['GET', '/uploads/<filename>', 'Serves PDF file for PDF.js viewer'],
];
routes.forEach(([method, path, desc], i) => {
  const y = 1.2 + i * 0.46;
  const methodColor = method === 'GET' ? '375623' : '1F3864';
  s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y, w: 0.65, h: 0.37, fill: { color: methodColor }, line: { color: methodColor } });
  s.addText(method, { x: 0.22, y: y + 0.02, w: 0.61, h: 0.33, fontSize: 10, bold: true, color: C.white, fontFace: 'Courier New', align: 'center', valign: 'middle', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.9, y, w: 2.9, h: 0.37, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText(path, { x: 0.95, y: y + 0.02, w: 2.8, h: 0.33, fontSize: 10, color: C.ltblue, fontFace: 'Courier New', valign: 'middle', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 3.85, y, w: 5.95, h: 0.37, fill: { color: C.offwhite }, line: { color: C.ltgray } });
  s.addText(desc, { x: 3.95, y: y + 0.03, w: 5.8, h: 0.31, fontSize: 10, color: C.gray, fontFace: 'Arial', valign: 'middle', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — REVIEW SCREEN LAYOUT
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Review Screen Layout', 'Split-panel UI — know what lives in each panel and why');
// Left panel
s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 1.2, w: 4.5, h: 3.8, fill: { color: C.sky }, line: { color: C.ltblue, width: 2 } });
s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 1.2, w: 4.5, h: 0.4, fill: { color: C.navy }, line: { color: C.navy } });
s.addText('LEFT PANEL — Original PDF', { x: 0.3, y: 1.24, w: 4.3, h: 0.32, fontSize: 11, bold: true, color: C.white, fontFace: 'Arial', margin: 0 });
bulletBlock(s, [
  'PDF.js renders original scan in browser canvas',
  'Custom toolbar: zoom in/out, fit-width, fit-page',
  'Page navigation with keyboard (← →) and buttons',
  'Concurrency guard prevents overlapping renders',
  'Purpose: reviewer never loses sight of source document',
], 0.3, 1.65, 4.3, 2.2, { size: 10 });
// Right panel
s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.2, w: 4.7, h: 3.8, fill: { color: C.sky }, line: { color: C.ltblue, width: 2 } });
s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.2, w: 4.7, h: 0.4, fill: { color: C.navy }, line: { color: C.navy } });
s.addText('RIGHT PANEL — Extracted Data', { x: 5.2, y: 1.24, w: 4.5, h: 0.32, fontSize: 11, bold: true, color: C.white, fontFace: 'Arial', margin: 0 });
bulletBlock(s, [
  'Quality score banner (1-5 per page)',
  'Completeness banner (page count vs. expected)',
  'Collapsible field sections: Personal, Employment, W-4, Direct Deposit',
  'Each field shows: label, value, status badge, confidence %',
  'Low-confidence fields highlighted yellow',
  'Missing/invalid fields highlighted red',
  'Inline editing via /update-field endpoint',
  'Summary box: valid/missing counts + blocking alert',
  'Action buttons: Generate Email, Submit to PrismHR',
], 5.2, 1.65, 4.5, 3.3, { size: 9.5 });
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — DATA PERSISTENCE STRATEGY
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Data Persistence Strategy', 'In-memory + disk JSON sidecar — why no database (and what replaces it in production)');
s.addText('Prototype persistence model', { x: 0.3, y: 1.2, w: 9.4, h: 0.3, fontSize: 13, bold: true, color: C.navy, fontFace: 'Arial' });
s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 1.55, w: 4.5, h: 2.3, fill: { color: C.sky }, line: { color: C.ltblue } });
s.addText('In-Memory Dict (processed_packets)', { x: 0.3, y: 1.6, w: 4.3, h: 0.3, fontSize: 12, bold: true, color: C.navy, fontFace: 'Arial' });
bulletBlock(s, ['Keyed by upload_id (UUID)', 'Hot path: no disk I/O for active session', 'Lost on server restart', 'Python dict — no concurrency safety'], 0.3, 1.95, 4.3, 1.8, { size: 11 });

s.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.55, w: 4.7, h: 2.3, fill: { color: C.sky }, line: { color: C.ltblue } });
s.addText('JSON Sidecar File (uploads/{uuid}.json)', { x: 5.2, y: 1.6, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: C.navy, fontFace: 'Arial' });
bulletBlock(s, ['Written after each processing run', 'Read on /review if not in memory', 'Survives server restart', 'Not queryable — no cross-packet search'], 5.2, 1.95, 4.5, 1.8, { size: 11 });

s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 4.0, w: 9.6, h: 0.75, fill: { color: C.ltgreen }, line: { color: C.green } });
s.addText('Production replacement:', { x: 0.35, y: 4.05, w: 2.5, h: 0.25, fontSize: 11, bold: true, color: C.green, fontFace: 'Arial' });
s.addText('PostgreSQL (or Firestore) packets table: stores status, client_id, reviewer_id, extracted fields, submission history, audit log. Redis cache for hot-path reads. In-memory dict removed entirely.', { x: 0.35, y: 4.3, w: 9.3, h: 0.4, fontSize: 10, color: C.gray, fontFace: 'Arial', valign: 'top' });
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — PRISMHR MOCK PAYLOAD
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'PrismHR Mock Payload', 'The importEmployees API schema — what gets submitted and what replaces the mock in production');
s.addText('Mock payload structure (from build_prismhr_payload() in validator.py)', { x: 0.3, y: 1.2, w: 9.4, h: 0.3, fontSize: 12, bold: true, color: C.navy, fontFace: 'Arial' });
s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 1.55, w: 4.5, h: 3.4, fill: { color: '1E1E1E' }, line: { color: C.ltgray } });
s.addText([
  { text: '{\n', options: { color: C.white } },
  { text: '  "importEmployees": [{\n', options: { color: C.ltblue } },
  { text: '    "clientId": ', options: { color: 'CE9178' } },
  { text: '"15650",\n', options: { color: '9CDCFE' } },
  { text: '    "firstName": ', options: { color: 'CE9178' } },
  { text: '"Taylor",\n', options: { color: '9CDCFE' } },
  { text: '    "jobCode": ', options: { color: 'CE9178' } },
  { text: '"IN",\n', options: { color: '9CDCFE' } },
  { text: '    "workLocationCode": ', options: { color: 'CE9178' } },
  { text: '"2",\n', options: { color: '9CDCFE' } },
  { text: '    "payRate": ', options: { color: 'CE9178' } },
  { text: '"30.0000",\n', options: { color: '9CDCFE' } },
  { text: '    "payGroupCode": ', options: { color: 'CE9178' } },
  { text: '"BI5-SAT",\n', options: { color: '9CDCFE' } },
  { text: '    "filingStatus": ', options: { color: 'CE9178' } },
  { text: '"S",\n', options: { color: '9CDCFE' } },
  { text: '    "routingNumber": ', options: { color: 'CE9178' } },
  { text: '"321380315"\n', options: { color: '9CDCFE' } },
  { text: '  }]\n}', options: { color: C.ltblue } },
], { x: 0.3, y: 1.6, w: 4.3, h: 3.3, fontSize: 9.5, fontFace: 'Courier New', valign: 'top', margin: 0 });

s.addText('In production this replaces with:', { x: 5.1, y: 1.55, w: 4.7, h: 0.3, fontSize: 12, bold: true, color: C.navy, fontFace: 'Arial' });
bulletBlock(s, [
  'POST to PrismHR importEmployees endpoint',
  'Response: transaction ID logged against packet record',
  'Then: commitEmployees to finalize the record',
  'updateW4 for filing status / allowances',
  'updateDirectDeposit for routing/account',
  'Confirmation modal before any live submission',
  'One-way action: no easy undo on PrismHR side',
], 5.1, 1.9, 4.7, 3.1, { size: 11 });
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — KEY ARCHITECTURAL DECISIONS
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Key Architectural Decisions', 'Every "why" question maps to a deliberate tradeoff');
const decisions = [
  ['All pages in\none API call', 'Context continuity. Claude uses name from p.1 to interpret p.8 signature. Separate calls lose cross-page context.', 'Higher token cost per call. Acceptable for prototype; production might use hybrid approach for very long packets.'],
  ['Human review\nbefore submit', 'Payroll data stakes. Wrong SSN or pay rate has real downstream consequences. Build trust through demonstrated accuracy before expanding automation.', 'Slower than full automation. Intentional — run in parallel for 90 days, then introduce auto-submit threshold for high-confidence packets.'],
  ['JSON file\nsidecar (no DB)', 'Minimum viable persistence for prototype scope. No DB setup, no schema, survives server restart.', 'No querying, no concurrency safety. Production replaces with Postgres + Redis cache.'],
  ['4-page quality\nsampling', 'Cost/speed optimization. Covers page 1 + 3 evenly spaced. Catching bad scans before extraction is cheaper than running extraction twice.', 'Could miss a bad middle page. Acceptable tradeoff at prototype scale.'],
];
decisions.forEach(([decision, why, tradeoff], i) => {
  const y = 1.2 + i * 1.02;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y, w: 2.0, h: 0.88, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText(decision, { x: 0.25, y: y + 0.05, w: 1.9, h: 0.78, fontSize: 11, bold: true, color: C.white, fontFace: 'Arial', align: 'center', valign: 'middle', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 2.25, y, w: 3.6, h: 0.88, fill: { color: C.ltgreen }, line: { color: C.green } });
  s.addText('\u2714 WHY: ' + why, { x: 2.35, y: y + 0.05, w: 3.45, h: 0.78, fontSize: 9.5, color: '375623', fontFace: 'Arial', valign: 'top', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.9, y, w: 3.9, h: 0.88, fill: { color: C.ltamber }, line: { color: C.amber } });
  s.addText('\u26A0 TRADEOFF: ' + tradeoff, { x: 6.0, y: y + 0.05, w: 3.75, h: 0.78, fontSize: 9.5, color: '7B5800', fontFace: 'Arial', valign: 'top', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 14 — SECURITY GAPS (prototype → production)
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Security: Prototype Gaps & Production Fixes', 'Own these directly — they\u2019re expected and fixable');
const secItems = [
  ['SSN in plaintext', 'Stored in JSON file + displayed in review UI', 'Encrypt at rest (AES-256). Mask display (XXX-XX-XXXX, reveal on demand). Access log every view.'],
  ['No authentication', 'Anyone who reaches the URL can upload + view PII', 'RBAC with ProService employee accounts. Roles: uploader, reviewer, admin.'],
  ['API key in .env file', 'Anthropic key committed to filesystem', 'Secrets manager (AWS Secrets Manager / Vault). Never in source control.'],
  ['No audit trail', 'Field edits silently update in-memory data', 'Append-only audit_log table: who changed what field, from/to values, timestamp.'],
  ['Minimal file validation', 'MIME type + size check only', 'Deep file inspection, antivirus scanning, quarantine before processing.'],
];
secItems.forEach(([gap, problem, fix], i) => {
  const y = 1.2 + i * 0.84;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y, w: 2.1, h: 0.7, fill: { color: C.red }, line: { color: C.red } });
  s.addText(gap, { x: 0.25, y: y + 0.04, w: 2.0, h: 0.62, fontSize: 10, bold: true, color: C.white, fontFace: 'Arial', align: 'center', valign: 'middle', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 2.35, y, w: 3.2, h: 0.7, fill: { color: 'FDECEA' }, line: { color: C.red } });
  s.addText(problem, { x: 2.45, y: y + 0.05, w: 3.05, h: 0.6, fontSize: 9.5, color: C.darkgray, fontFace: 'Arial', valign: 'top', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.6, y, w: 4.2, h: 0.7, fill: { color: C.ltgreen }, line: { color: C.green } });
  s.addText('\u2714 ' + fix, { x: 5.7, y: y + 0.05, w: 4.05, h: 0.6, fontSize: 9.5, color: '375623', fontFace: 'Arial', valign: 'top', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 15 — PRODUCTION ARCHITECTURE
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Production Architecture', 'How the prototype evolves to handle 50 clients + 500 packets/month');
s.addText('Prototype (now)', { x: 0.2, y: 1.2, w: 4.3, h: 0.3, fontSize: 13, bold: true, color: C.navy, fontFace: 'Arial' });
bulletBlock(s, [
  'Synchronous processing (upload blocks until done)',
  '~30-60 sec wait in the browser',
  'Single client (Jordan\'s Surf Shack)',
  'JSON file persistence',
  'Single-user, no auth',
], 0.2, 1.55, 4.4, 2.2, { size: 11 });

s.addText('Production (next version)', { x: 5.15, y: 1.2, w: 4.6, h: 0.3, fontSize: 13, bold: true, color: C.green, fontFace: 'Arial' });
bulletBlock(s, [
  'Async task queue (Celery + SQS or Cloud Tasks)',
  'Upload returns job_id immediately',
  'Worker processes in background',
  'Dashboard polls or WebSocket for status update',
  'PostgreSQL + Redis cache',
  'Multi-tenant: client_id on every record',
  'Role-based auth: uploader / reviewer / admin',
], 5.15, 1.55, 4.6, 2.4, { size: 11 });

calloutBox(s, 'Key product outcome of async: coordinators batch-upload all Monday packets \u2192 come back Tuesday and review completed extractions. Decouples upload from processing. That\u2019s the user experience win, not just the architecture win.', 0.2, 4.05, 9.6, 0.65, C.sky, C.blue, C.navy);
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 16 — WHAT I'D BUILD NEXT (PRIORITIZED ROADMAP)
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'What I\'d Build Next', 'Prioritized roadmap with reasoning — memorize this order');
const roadmap = [
  ['1', 'Real PrismHR API\nIntegration', C.red, 'The literal purpose of the tool. importEmployees, updateW4, updateDirectDeposit. Without this it\u2019s a review tool, not automation.'],
  ['2', 'Auth + RBAC', C.red, 'Can\u2019t give coordinators access to SSNs without login. Prerequisite for any production deployment.'],
  ['3', 'Async Processing\nQueue', 'C55A11', 'Synchronous 60-sec blocks don\u2019t scale. Queue decouples upload from processing. Required for real volume.'],
  ['4', 'Auto-Submit\nThreshold', C.blue, 'After 90 days accuracy data: packets where all fields are valid confidence >0.95 auto-submit. This is where ROI compounds.'],
  ['5', 'Multi-Client\nConfig', C.navy, 'Scale beyond Jordan\u2019s Surf Shack. Each client gets own code config. Form-level detection per client template.'],
  ['6', 'Audit Trail +\nCompliance Reporting', C.gray, 'Required for PII at production scale. Every edit logged with attribution. Compliance dashboard.'],
];
roadmap.forEach(([num, title, color, desc], i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = col === 0 ? 0.2 : 5.15;
  const y = 1.2 + row * 1.38;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.5, h: 1.2, fill: { color }, line: { color } });
  s.addText(num, { x: x + 0.04, y: y + 0.4, w: 0.42, h: 0.4, fontSize: 20, bold: true, color: C.white, fontFace: 'Arial', align: 'center', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.55, y, w: 4.25, h: 1.2, fill: { color: C.sky }, line: { color: C.ltblue } });
  s.addText(title, { x: x + 0.65, y: y + 0.05, w: 4.05, h: 0.45, fontSize: 12, bold: true, color: C.navy, fontFace: 'Arial', margin: 0 });
  s.addText(desc, { x: x + 0.65, y: y + 0.5, w: 4.05, h: 0.65, fontSize: 9.5, color: C.gray, fontFace: 'Arial', valign: 'top', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 17 — KEY NUMBERS CHEAT SHEET
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Key Numbers to Memorize', 'Have these on the tip of your tongue — they show technical depth');
const numbers = [
  ['150 DPI', 'PDF conversion resolution'],
  ['4 pages', 'Quality scoring sample size'],
  ['30-60 sec', 'Processing time per packet'],
  ['8-12 pages', 'Expected packet length (completeness check)'],
  ['9 fields', 'REQUIRED_FIELDS that block submission'],
  ['0.0 - 1.0', 'Confidence score range (Claude self-assessment)'],
  ['5 statuses', 'valid / missing / invalid / inferred / auto_assigned'],
  ['9 routes', 'Total Flask API routes'],
  ['2 passes', 'Fuzzy matching strategy (exact dict + substring)'],
  ['client 15650', "Jordan's Surf Shack client ID"],
  ['3 job codes', 'OW (Owner), IN (Instructor), RW (Retail Worker)'],
  ['2 locations', '1 = Retail, 2 = Beach'],
  ['BI5-SAT', 'Pay group code (Bi-weekly, Friday)'],
  ['UUID', 'Upload ID format (Python uuid4)'],
  ['claude-sonnet-4-20250514', 'Model used for Vision extraction'],
];
numbers.forEach(([num, label], i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.2 + col * 3.27;
  const y = 1.2 + row * 1.05;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 3.1, h: 0.9, fill: { color: i % 2 === 0 ? C.sky : 'F0F4F8' }, line: { color: C.ltblue } });
  s.addText(num, { x: x + 0.1, y: y + 0.04, w: 2.9, h: 0.42, fontSize: 16, bold: true, color: C.navy, fontFace: 'Courier New', margin: 0 });
  s.addText(label, { x: x + 0.1, y: y + 0.48, w: 2.9, h: 0.36, fontSize: 10, color: C.gray, fontFace: 'Arial', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 18 — ANTICIPATED PROBE QUESTIONS + QUICK ANSWERS
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Anticipated Probe Questions', 'The questions most likely to come — with one-line anchor answers');
const probeQA = [
  ['"Why Claude Vision vs. Tesseract?"', 'Handwriting needs spatial + semantic understanding. Tesseract is glyph matching; Claude reads context.'],
  ['"How does fuzzy matching work?"', 'Two passes: exact dict lookup first, then substring containment. Falls through to "invalid" if both miss.'],
  ['"Why human-in-loop vs. full auto?"', 'Payroll stakes + trust building. Auto-submit after 90-day accuracy track record, not day one.'],
  ['"Why no database?"', 'Minimum viable persistence for prototype scope. Production replaces with Postgres + Redis.'],
  ['"What security problems exist?"', 'SSN plaintext, no auth, API key in .env, no audit trail. All known, all standard production fixes.'],
  ['"What\u2019s blocking submission in the Taylor Swift packet?"', 'standardHours is missing. It\u2019s in REQUIRED_FIELDS. can_submit: false.'],
  ['"How would getClientCodes work in production?"', 'Live API call at start of /process, replaces client_codes.json. Response cached 24hr per client.'],
  ['"What would you build next?"', '1) Real PrismHR API, 2) Auth+RBAC, 3) Async queue, 4) Auto-submit threshold, 5) Multi-client.'],
  ['"Where did product decisions come from vs. AI?"', 'Claude Code handled implementation. I directed what to build, how it works, and every "why."'],
  ['"Why did you keep it a prototype?"', 'Right scope for the problem: prove concept, show full vision. Production adds persistence, auth, async.'],
];
probeQA.forEach(([q, a], i) => {
  const y = 1.18 + i * 0.43;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y, w: 4.5, h: 0.37, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText(q, { x: 0.3, y: y + 0.02, w: 4.35, h: 0.33, fontSize: 9.5, color: C.ltblue, fontFace: 'Arial', italics: true, valign: 'middle', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 4.75, y, w: 5.05, h: 0.37, fill: { color: C.sky }, line: { color: C.ltblue } });
  s.addText(a, { x: 4.85, y: y + 0.02, w: 4.9, h: 0.33, fontSize: 9.5, color: C.darkgray, fontFace: 'Arial', valign: 'middle', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 19 — BEHAVIORAL STORIES QUICK REF
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Behavioral Stories Quick Reference', '7 STAR stories mapped to APM competencies');
const stories = [
  ['1', 'Discovery \u2192 Requirements', 'Sendero: financial services ops reporting. Vague "better visibility" \u2192 specific Monday report automation.', 'Discovery \u00B7 Ambiguity'],
  ['2', 'AI/Automation Product', 'Sendero: IBM watsonx insurance exceptions. Human-in-loop design, 90-day accuracy run, 94% accuracy, 60% time reduction.', 'AI judgment \u00B7 Business impact'],
  ['3', 'Internal Tools Adoption', 'F45: studio analytics platform. Mobile-first design from user research. 78% WAU in 6 months.', 'Operational tooling \u00B7 Research'],
  ['4', 'Cross-Functional Deadline', 'F45: competing sprint priorities. Surfaced dependencies, froze shared component, both teams shipped.', 'Collaboration \u00B7 Trade-offs'],
  ['5', 'KPIs & Metrics', 'F45: 3-tier measurement framework. 12% lower churn in heavy-user cohort. Phase 2 approved.', 'Data literacy \u00B7 Outcomes'],
  ['6', 'Prioritization / Saying No', 'F45: franchise prospectus request. Lightweight export in 2 days vs. full feature. Both needs served.', 'Stakeholder management'],
  ['7', 'Learning from Failure', 'F45: scheduling tool rollout. Skipped UAT. Workflow habit disruption. Built UAT as non-negotiable since.', 'Self-awareness \u00B7 Growth'],
];
stories.forEach(([num, title, detail, comp], i) => {
  const y = 1.2 + i * 0.62;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y, w: 0.4, h: 0.52, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText(num, { x: 0.22, y: y + 0.1, w: 0.36, h: 0.32, fontSize: 14, bold: true, color: C.white, fontFace: 'Arial', align: 'center', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.65, y, w: 9.15, h: 0.52, fill: { color: i % 2 === 0 ? C.sky : C.offwhite }, line: { color: C.ltblue } });
  s.addText(title, { x: 0.75, y: y + 0.03, w: 2.6, h: 0.22, fontSize: 11, bold: true, color: C.navy, fontFace: 'Arial', margin: 0 });
  s.addText(comp, { x: 0.75, y: y + 0.27, w: 2.6, h: 0.2, fontSize: 9, color: C.blue, fontFace: 'Arial', italics: true, margin: 0 });
  s.addText(detail, { x: 3.4, y: y + 0.04, w: 6.35, h: 0.44, fontSize: 9.5, color: C.gray, fontFace: 'Arial', valign: 'middle', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 20 — 30/60/90 DAY PLAN
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, '30 / 60 / 90 Day Plan', 'If they ask: what would your first 90 days look like?');
const plan = [
  ['Days 1-30', C.blue, 'LEARN THE REAL WORKFLOW', [
    'Shadow HR coordinators processing actual packets',
    'Map the full data flow: client \u2192 ProService \u2192 PrismHR',
    'Understand failure modes not visible from the outside',
    'Identify highest-volume bottlenecks (not assumed ones)',
    'Meet the PrismHR API team and understand integration constraints',
  ]],
  ['Days 31-60', C.navy, 'DEFINE THE REAL MVP', [
    'Write product requirements based on month-1 learnings',
    'Align with engineering on v1 scope: PrismHR API + auth + async',
    'Size the build: story points, sprint plan',
    'Run design sprint for updated review UI',
    'Set v1 go-live criteria and success metrics',
  ]],
  ['Days 61-90', C.green, 'FIRST PRODUCTION MILESTONE', [
    'Working integration in staging with real PrismHR API',
    'Pilot with small group of HR coordinators on real packets',
    'Collect first accuracy data: extraction vs. human correction rate',
    'Report to Jordan: what worked, what needs iteration',
    'Draft v2 roadmap based on pilot learnings',
  ]],
];
plan.forEach(([period, color, title, bullets], i) => {
  const x = 0.2 + i * 3.27;
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 3.1, h: 0.55, fill: { color }, line: { color } });
  s.addText(period, { x: x + 0.1, y: 1.24, w: 2.9, h: 0.47, fontSize: 16, bold: true, color: C.white, fontFace: 'Arial', align: 'center', valign: 'middle', margin: 0 });
  s.addText(title, { x: x + 0.05, y: 1.8, w: 3.0, h: 0.3, fontSize: 11, bold: true, color, fontFace: 'Arial', align: 'center', margin: 0 });
  bullets.forEach((b, j) => {
    const by = 2.15 + j * 0.58;
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.05, y: by, w: 3.0, h: 0.5, fill: { color: C.sky }, line: { color: C.ltblue } });
    s.addText(b, { x: x + 0.15, y: by + 0.05, w: 2.8, h: 0.4, fontSize: 9.5, color: C.darkgray, fontFace: 'Arial', valign: 'middle', margin: 0 });
  });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 21 — WHY PROSERVICE, WHY NOW
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Why This Role. Why ProService. Why Now.', 'Have a crisp, genuine answer to each of these');
s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 1.2, w: 9.6, h: 1.4, fill: { color: C.sky }, line: { color: C.ltblue } });
s.addText('Why this problem is interesting to me:', { x: 0.35, y: 1.26, w: 9.3, h: 0.3, fontSize: 12, bold: true, color: C.navy, fontFace: 'Arial' });
s.addText('AI on high-stakes operational workflows \u2014 where data is messy, consequences are real, and users are not technical \u2014 is genuinely hard. Most AI demos show clean data and forgiving use cases. New hire packet extraction is the opposite. That\u2019s the interesting version of the problem.', { x: 0.35, y: 1.56, w: 9.3, h: 0.95, fontSize: 11, color: C.gray, fontFace: 'Arial', valign: 'top' });

s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 2.7, w: 9.6, h: 1.2, fill: { color: C.sky }, line: { color: C.ltblue } });
s.addText('Why ProService specifically:', { x: 0.35, y: 2.76, w: 9.3, h: 0.3, fontSize: 12, bold: true, color: C.navy, fontFace: 'Arial' });
s.addText('Real users. Real pain. Leadership (Jordan and Mikaela) clearly willing to invest in internal technology \u2014 the demo process itself told me that. I want to be in a company that thinks product-first about operational problems, not one that treats internal tools as an afterthought.', { x: 0.35, y: 3.06, w: 9.3, h: 0.78, fontSize: 11, color: C.gray, fontFace: 'Arial', valign: 'top' });

s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y: 4.0, w: 9.6, h: 1.1, fill: { color: C.ltgreen }, line: { color: C.green } });
s.addText('The line that lands:', { x: 0.35, y: 4.06, w: 9.3, h: 0.25, fontSize: 12, bold: true, color: C.green, fontFace: 'Arial' });
s.addText('"I built HireFlow in two weeks because the problem was interesting enough to make me want to build it. That\u2019s the best signal I know for fit. HireFlow is the prototype. This role is the production version."', { x: 0.35, y: 4.3, w: 9.3, h: 0.72, fontSize: 12, color: C.green, fontFace: 'Arial', italics: true, bold: true, valign: 'top' });
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 22 — INTERVIEW STRATEGY + TIPS
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Interview Strategy', 'How to show up in the room');
const tips = [
  ['Answer length', 'Lead with the direct answer. Then one supporting detail. 60-90 seconds per answer. Let them pull more detail.'],
  ['Technical questions', 'Draw a mental diagram as you speak. It helps you stay precise and slows you down naturally.'],
  ['If caught off-guard', '"That\u2019s a great question" + 2-second pause + answer. Never rush into an uncertain answer.'],
  ['Own all tradeoffs', 'Never apologize for prototype shortcuts. "I deliberately chose X because Y." Every decision is intentional.'],
  ['Dashboard question', 'The dashboard is hardcoded mock data \u2014 own it. "I made a deliberate tradeoff to show full product vision without building a production data layer."'],
  ['AI-assisted development', '"Claude Code accelerated implementation. Product thinking \u2014 what to build and why \u2014 was mine entirely."'],
  ['Missing features', '"That\u2019s on the production roadmap at position [X] because [reason it comes after what precedes it]."'],
  ['Behavioral questions', 'STAR format. 90-120 seconds. Connect every story back to how it applies to this role at ProService.'],
  ['Closing', 'Have 2-3 genuine questions ready. Best ones show you\u2019ve thought about the product beyond what they\u2019ve shown you.'],
];
tips.forEach(([topic, content], i) => {
  const y = 1.18 + i * 0.5;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y, w: 2.2, h: 0.42, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText(topic, { x: 0.25, y: y + 0.03, w: 2.1, h: 0.36, fontSize: 10, bold: true, color: C.ltblue, fontFace: 'Arial', valign: 'middle', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 2.45, y, w: 7.35, h: 0.42, fill: { color: i % 2 === 0 ? C.sky : C.offwhite }, line: { color: C.ltblue } });
  s.addText(content, { x: 2.55, y: y + 0.03, w: 7.2, h: 0.36, fontSize: 10, color: C.darkgray, fontFace: 'Arial', valign: 'middle', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 23 — QUESTIONS TO ASK THEM
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
headerBar(s, 'Questions to Ask Jordan & Mikaela', 'Ask 2-3 at the end. These show you\u2019ve thought beyond the demo.');
const questions = [
  ['On the product problem', '"Beyond new hire packets \u2014 are there other onboarding workflows at ProService where document-heavy manual data entry is the bottleneck?"'],
  ['On the team', '"Who would be my primary engineering partner on this? What\u2019s their experience with AI/ML integrations?"'],
  ['On the PrismHR integration', '"How much API access does ProService currently have to PrismHR\u2019s importEmployees endpoint? Is there an existing integration layer or would this be net-new?"'],
  ['On success', '"If this product is working well 12 months from now, what does that look like from where you sit \u2014 what metric or behavior change would tell you it\u2019s succeeded?"'],
  ['On the role scope', '"Is this APM role expected to own the product roadmap end-to-end, or is there a senior PM I\u2019d be partnering with on prioritization?"'],
  ['On their current process', '"What does the current new hire packet workflow look like today for your highest-volume client? How many packets per week?"'],
];
questions.forEach(([context, q], i) => {
  const y = 1.2 + i * 0.72;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.2, y, w: 2.0, h: 0.6, fill: { color: C.blue }, line: { color: C.navy } });
  s.addText(context, { x: 0.25, y: y + 0.05, w: 1.9, h: 0.5, fontSize: 9.5, bold: true, color: C.white, fontFace: 'Arial', valign: 'middle', align: 'center', margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 2.25, y, w: 7.55, h: 0.6, fill: { color: C.sky }, line: { color: C.ltblue } });
  s.addText(q, { x: 2.35, y: y + 0.06, w: 7.35, h: 0.48, fontSize: 10, color: C.darkgray, fontFace: 'Arial', italics: true, valign: 'middle', margin: 0 });
});
footerBar(s);

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 24 — CLOSING / GOOD LUCK
// ══════════════════════════════════════════════════════════════════════════════
s = pres.addSlide();
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.navy }, line: { color: C.navy } });
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 3.5, w: 10, h: 2.125, fill: { color: C.blue }, line: { color: C.blue } });
s.addText('You know this.', { x: 0.5, y: 0.6, w: 9, h: 1.2, fontSize: 64, bold: true, color: C.white, fontFace: 'Arial', align: 'center', margin: 0 });
s.addText('You built it.', { x: 0.5, y: 1.7, w: 9, h: 0.8, fontSize: 40, color: C.ltblue, fontFace: 'Arial', align: 'center', margin: 0 });
s.addText('Trust your decisions. Every choice was deliberate.', { x: 0.5, y: 2.65, w: 9, h: 0.5, fontSize: 18, color: C.ltblue, fontFace: 'Arial', align: 'center', italics: true, margin: 0 });
s.addText('Lead every answer with the direct point. Stay technical but accessible.', { x: 0.5, y: 3.6, w: 9, h: 0.4, fontSize: 14, color: C.white, fontFace: 'Arial', align: 'center', margin: 0 });
s.addText('Own every tradeoff. Connect everything back to the business outcome.', { x: 0.5, y: 4.0, w: 9, h: 0.4, fontSize: 14, color: C.white, fontFace: 'Arial', align: 'center', margin: 0 });
s.addText('HireFlow is the prototype. This role is the production version.', { x: 0.5, y: 4.5, w: 9, h: 0.7, fontSize: 16, bold: true, color: C.ltblue, fontFace: 'Arial', align: 'center', italics: true, margin: 0 });

// ── WRITE FILE ────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: '/Users/devancapps/hireflow/HireFlow-Study-Guide.pptx' })
  .then(() => console.log('Done: HireFlow-Study-Guide.pptx'));
