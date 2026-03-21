const puppeteer = require('puppeteer-core');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = '/Users/devancapps/Desktop/interview-prep/Behavioral-Story-Bank.pdf';

// ── Helpers ───────────────────────────────────────────────────────────────────
function storyCard(num, title, prompt, competency, color, situation, task, action, result, tip = '') {
  return `
  <div class="story-card">
    <div class="story-header" style="background:${color}">
      <div class="story-num">${num}</div>
      <div class="story-titles">
        <div class="story-title">${title}</div>
        <div class="story-competency">${competency}</div>
      </div>
    </div>
    <div class="story-prompt">"${prompt}"</div>
    <div class="star-grid">
      <div class="star-block situation">
        <div class="star-label"><span class="star-letter">S</span> Situation</div>
        <div class="star-body">${situation}</div>
      </div>
      <div class="star-block task">
        <div class="star-label"><span class="star-letter">T</span> Task</div>
        <div class="star-body">${task}</div>
      </div>
      <div class="star-block action">
        <div class="star-label"><span class="star-letter">A</span> Action</div>
        <div class="star-body">${action}</div>
      </div>
      <div class="star-block result">
        <div class="star-label"><span class="star-letter">R</span> Result</div>
        <div class="star-body">${result}</div>
      </div>
    </div>
    ${tip ? `<div class="delivery-tip"><span class="tip-icon">⚡</span><div><strong>Delivery tip:</strong> ${tip}</div></div>` : ''}
  </div>`;
}

// ── Stories ───────────────────────────────────────────────────────────────────
const stories = [
  storyCard(1,
    'Discovery → Translating Ambiguity into Requirements',
    'Tell me about a time you took a vague business problem and turned it into a clear product requirement.',
    'Discovery  ·  Requirements  ·  Stakeholder Alignment',
    '#1F3864',
    'At Sendero, we were brought in by a mid-size financial services firm to modernize their operational reporting. The ask from the business sponsor was genuinely vague: <em>"We need better visibility into our operations."</em> No specifics, no scope, no success criteria.',
    'Turn that into a defined product requirement we could actually build against — not interpret on behalf of the client, but surface what they actually needed through structured discovery.',
    `I ran four discovery sessions over two weeks:<br><br>
    1. Executive sponsor: <em>"What decisions are you making today without the data you need?"</em><br>
    2–3. Operational team: <em>"Where do you go to find information right now? What's the worst part of your Tuesday morning?"</em><br>
    4. IT team: what data was actually available vs. what people thought was available.<br><br>
    The pattern: the ops team was spending <strong>3–4 hours every Monday morning</strong> pulling data from 6 systems and building a manual Excel report. The "better visibility" request was really "stop making us do this every Monday." The requirement became specific: a real-time dashboard aggregating those 6 sources with automated weekly snapshots.`,
    `Shipped the dashboard in an 8-week sprint. The Monday report process dropped from 3–4 hours to under 30 minutes. More importantly, the executive sponsor went from "I need better visibility" to being able to tell me exactly which metrics she tracked and why. That clarity only existed because we did the discovery properly.`,
    'Connect to HireFlow: "I did the same thing here — I didn\'t just build a PDF reader. I understood the actual problem (manual data entry into PrismHR) and designed the tool around eliminating that specific bottleneck."'
  ),

  storyCard(2,
    'AI/Automation Product with Business Impact',
    'Walk me through your experience shipping an AI-powered product.',
    'AI Product Judgment  ·  Technical Depth  ·  Business Outcomes',
    '#2E75B6',
    'At Sendero, I led a product workstream for an IBM watsonx GenAI implementation at a large insurance client. They had a backlog of thousands of unstructured policy exception requests per quarter — each requiring a human analyst to read, categorize, and route. The queue was growing faster than they could hire.',
    'Define what the AI should do, what it shouldn\'t do, and what success looks like. I was the product lead responsible for requirements and acceptance criteria.',
    `The most important decision: <strong>scope the AI to triage and categorize, not decide.</strong> AI reads each request, extracts key variables, classifies into one of 12 routing categories, flags high-risk cases for senior review. A human still makes every final call.<br><br>
    I had to defend this human-in-loop design to leadership who wanted full automation. My argument: we needed 90 days of side-by-side operation — AI recommendation alongside human decision — to measure accuracy before trusting it to route independently. They agreed.<br><br>
    After 90 days, accuracy on standard exception types was <strong>94%</strong>. We then expanded automation to those categories and kept human review for edge cases.`,
    `Analyst handling time on standard cases dropped <strong>60%</strong>. Queue cleared within a quarter. The 90-day accuracy data gave us evidence to propose expanding AI scope to a second exception type in the follow-on phase.`,
    'Note the parallel to HireFlow: same philosophy — AI extracts and triages, human confirms before submission. Build trust through demonstrated accuracy before expanding automation. This is a principle I apply consistently.'
  ),

  storyCard(3,
    'Building Internal Tools Operational Teams Actually Use',
    'Tell me about a product you built that internal teams actually use.',
    'Internal Tooling  ·  User Research  ·  Adoption',
    '#375623',
    'At F45 Training, I was Product Operations Manager for a global franchise network of 1,700+ studios. Studio owners were making operational decisions — staffing, scheduling, promotional spend — without reliable data. Corporate had data but it lived in multiple systems and only surfaced in quarterly reports already 90 days stale.',
    'Build an internal analytics platform giving studio owners real-time visibility into their own performance: attendance trends, membership churn, class fill rates, revenue per class.',
    `Started with user research — interviewed 12 studio owners across three cohorts (new, mid-growth, established). Key finding: <strong>studio owners are on the gym floor all day, not at a desk. They check their phones between classes.</strong> The tool needed to be mobile-first and scannable in 30 seconds, not a desktop dashboard.<br><br>
    I wrote the requirements with that constraint as the design principle. Worked with engineering to build a responsive dashboard leading with three KPIs (today's attendance, this-week's churn alerts, this-month's revenue vs. target). Phased rollout to 50 studios with a feedback loop before network release.`,
    `Within 6 months, <strong>78% of active studio owners were logging in weekly</strong>. Churn alerts — flagging members whose attendance had dropped below a threshold — were credited by several owners with saving memberships they would otherwise have lost. Corporate ops adopted the platform for their own studio health monitoring.`,
    '"What makes internal tools succeed: user research before wireframes, not after. Design for how users actually work, not how you wish they worked."'
  ),

  storyCard(4,
    'Cross-Functional Collaboration Under a Deadline',
    'Tell me about working with engineers when priorities were competing.',
    'Cross-functional Leadership  ·  Trade-off Navigation  ·  Delivery',
    '#7B2C8A',
    'At F45, mid-sprint on a major platform update — a new class booking flow for a significant portion of our member base — corporate announced an all-hands initiative: ship a promotional campaign feature for a global activation event happening in 6 weeks. Two engineering sub-teams, both at capacity.',
    'Navigate competing priorities without blowing up either delivery. I was the product owner for both workstreams.',
    `First move: a joint prioritization session with both engineering leads, UX designer, and the marketing stakeholder. I laid out both timelines on a whiteboard and asked everyone to surface dependencies before I tried to solve anything.<br><br>
    What emerged: the campaign feature had one hard dependency — an email trigger. The rest could ship in v1.5 post-event. The booking flow had one regression risk: a shared component both teams were touching.<br><br>
    The path became clear: <strong>freeze the shared component for two weeks</strong> (booking team completes), campaign team builds around it, then shared component opens again. I got written sign-off from both engineering leads and the marketing stakeholder. When scope pressure came from marketing in week 4, I could point to the agreed scope from week 1.`,
    `Booking flow shipped on schedule. Campaign feature shipped with core functionality for the global activation. v1.5 features shipped three weeks post-event. No team had to crunch.`,
    '"I didn\'t \'prioritize\' by choosing sides. I facilitated the conversation that surfaced real constraints, then found the path that served both teams. That\'s the product owner\'s job."'
  ),

  storyCard(5,
    'KPIs, Metrics, and Data-Driven Decisions',
    'How do you define and measure whether a product is working?',
    'Metrics  ·  Data Literacy  ·  Product Judgment',
    '#C55A11',
    'At F45, six months after launching the studio analytics platform, there was internal debate about whether it was actually driving behavior change or just being used as a vanity dashboard. Leadership wanted to know if we should invest in expanding it.',
    'Build the measurement framework that could answer that question honestly — not just "are people logging in" but "is it changing what they do?"',
    `Defined three metric tiers:<br><br>
    <strong>Engagement metrics:</strong> weekly active users, session depth, feature adoption. Tells us if people are using it.<br><br>
    <strong>Behavior metrics:</strong> Did studio owners who used churn alerts have lower churn rates than those who didn't? Did studios checking fill rates weekly show better fill rate trends? This required a <strong>90-day cohort analysis</strong> — heavy users vs. light vs. non-users.<br><br>
    <strong>Business outcome metrics:</strong> retention rate, revenue per studio, membership growth. The lagging indicators.`,
    `The 90-day cohort data: studios where the owner logged in 3+ times per week had <strong>12% lower member churn</strong> than non-user studios. Correlation, not causation — but strong enough signal to present to leadership as evidence of impact.<br><br>
    Leadership approved a Phase 2 investment: predictive churn modeling (flagging at-risk members before they churn).`,
    '"Good metrics have three layers: are people using it (engagement)? Is it changing behavior (leading indicators)? Is the business better off (outcomes)? If engagement is high but behavior isn\'t changing, you have a nice dashboard, not a product."'
  ),

  storyCard(6,
    'Prioritization Under Constraints',
    'Tell me about a time you had to say no to a stakeholder request.',
    'Stakeholder Management  ·  Strategic Clarity  ·  Scope',
    '#1F3864',
    'At F45 during aggressive global expansion, the franchise development team came to me with a request: build a "franchise prospectus" feature in the studio platform — a module that would generate PDF prospectus documents for potential new franchise owners, pulling live performance data. The request came in Q3 when my team was mid-sprint on the member-facing app refresh tied to a marketing campaign launch.',
    'Handle this request without derailing the active roadmap and without dismissing a legitimate business need from a senior stakeholder.',
    `I took the meeting seriously, not defensively. Asked the franchise development lead to walk me through the use case: how many prospectus documents per month? What was the current process? What was actually broken?<br><br>
    Turns out: <strong>8–10 documents per month</strong>, each taking 2–3 hours of manual data compilation. Real pain. But the solution they requested — a full platform feature — was significantly heavier than the problem warranted.<br><br>
    I proposed an alternative: <strong>a lightweight data export template</strong> that pulled the relevant studio metrics into a structured CSV they could plug into their existing prospectus template. 20-minute integration. I could build it as a 2-day side project without touching the main roadmap. The full feature goes on the backlog for Q1 when capacity is available.`,
    `Franchise development got a working solution in 2 days. The member app shipped on schedule. The full feature shipped in Q1 with much better-defined requirements because the interim solution helped them understand exactly what they actually needed from a platform version.`,
    '"Saying no" isn\'t the right frame. I\'m responsible for the roadmap AND for helping stakeholders solve their problems. The job is to find the right solution at the right time.'
  ),

  storyCard(7,
    'Learning from Failure',
    'Tell me about a product decision you\'d make differently in hindsight.',
    'Self-Awareness  ·  Growth Mindset  ·  Intellectual Honesty',
    '#C00000',
    'At F45, I led the requirements and rollout for a new class scheduling tool for studio owners. Significant improvement — more flexibility, better conflict detection, cleaner UI. Engineering built it well. We shipped on time.',
    'I did not do enough user testing before the rollout. I had done discovery interviews, written thorough requirements, and reviewed wireframes. What I skipped: a structured UAT round with actual studio owners in staging before go-live. My reasoning: the old system was genuinely broken, owners were frustrated, speed felt justified.',
    `Two days after rollout, support tickets started coming in. The new tool had a workflow change — technically correct and cleaner by design — that broke a habitual process a large segment of owners had built with the old system. They\'d built their Monday morning routine around a specific sequence of clicks, and the new tool changed that sequence.<br><br>
    Not wrong, just different. But <strong>"different" for operational users who\'ve built habits is a real cost.</strong><br><br>
    We spent two weeks on an emergency patch, a support escalation campaign, and a communication effort explaining the workflow change.`,
    `Speed of delivery is not the same as speed of value. A two-week UAT round with 10 studio owners in staging would have caught the workflow issue before go-live. The two weeks we spent on incident response was the same cost — but with significantly more user pain and trust damage.<br><br>
    Since then, I've built UAT as a non-negotiable into every roadmap I own. For HireFlow, I tested the review workflow with sample packets specifically to catch workflow assumptions before presenting it. That habit comes directly from this experience.`,
    'Be honest and specific. Don\'t hedge. The best "what I\'d do differently" answers own the error clearly and show the specific behavioral change that resulted. That\'s what makes it credible.'
  ),
];

// ── Closing line ──────────────────────────────────────────────────────────────
const closingLine = `
<div class="closing-section">
  <div class="closing-header">Universal Closing Line</div>
  <p class="closing-sub">Use this to connect any behavioral answer back to why you're here</p>
  <div class="closing-quote">
    "That experience is part of why I'm here. I want to be in a product role where I can apply what I learned in consulting — the discovery discipline, the cross-functional work, the AI implementation experience — to a single product that I can own from prototype to production. HireFlow is the prototype. This role is the production version."
  </div>
</div>`;

// ── Quick-ref table ───────────────────────────────────────────────────────────
const quickRef = `
<div class="quickref-section">
  <div class="quickref-header">Story Quick-Reference</div>
  <p class="quickref-sub">Scan this the morning of the interview to prime each story in memory</p>
  <table class="ref-table">
    <thead>
      <tr>
        <th style="width:5%">#</th>
        <th style="width:25%">Story</th>
        <th style="width:35%">Source</th>
        <th style="width:35%">Competency</th>
      </tr>
    </thead>
    <tbody>
      ${[
        ['1','Discovery → Requirements','Sendero — financial services ops reporting','Discovery, ambiguity, requirements'],
        ['2','AI/Automation Product','Sendero — IBM watsonx insurance exceptions','AI judgment, business impact'],
        ['3','Internal Tools Adoption','F45 — studio analytics platform','Operational tooling, user research'],
        ['4','Cross-Functional Deadline','F45 — competing sprint priorities','Collaboration, trade-offs, delivery'],
        ['5','KPIs & Metrics','F45 — analytics platform measurement','Data literacy, outcome metrics'],
        ['6','Prioritization / Saying No','F45 — franchise prospectus request','Stakeholder management, scope'],
        ['7','Learning from Failure','F45 — scheduling tool UAT skip','Self-awareness, growth mindset'],
      ].map(([n,s,src,comp],i) => `
        <tr class="${i%2===0?'even':'odd'}">
          <td class="ref-num">${n}</td>
          <td class="ref-story">${s}</td>
          <td class="ref-source">${src}</td>
          <td class="ref-comp">${comp}</td>
        </tr>`).join('')}
    </tbody>
  </table>
</div>`;

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11pt;
    color: #1a1a2e;
    background: #fff;
    line-height: 1.6;
  }

  /* Cover */
  .cover {
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #1F3864 0%, #375623 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 3rem;
    text-align: center;
    page-break-after: always;
  }
  .cover-eyebrow { font-size: 10pt; font-weight: 600; letter-spacing: 3px; color: #E2EFDA; text-transform: uppercase; margin-bottom: 1.5rem; }
  .cover-title { font-size: 48pt; font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 0.5rem; }
  .cover-subtitle { font-size: 22pt; font-weight: 500; color: #BDD7EE; margin-bottom: 2rem; }
  .cover-divider { width: 80px; height: 4px; background: #E2EFDA; margin: 1.5rem auto; border-radius: 2px; }
  .cover-meta { font-size: 12pt; color: #EBF3FB; margin-bottom: 2rem; }
  .cover-tags { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-bottom: 2rem; }
  .cover-tag { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 0.35rem 1rem; border-radius: 999px; font-size: 9pt; font-weight: 500; }
  .cover-guide { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem 2rem; max-width: 580px; text-align: left; }
  .cover-guide h3 { color: #E2EFDA; font-size: 10pt; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.75rem; }
  .cover-guide li { color: #EBF3FB; font-size: 10pt; margin-bottom: 0.4rem; list-style: none; padding-left: 1.2rem; position: relative; }
  .cover-guide li::before { content: '→'; position: absolute; left: 0; color: #E2EFDA; }

  /* Story card */
  .story-card {
    margin-bottom: 3rem;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #e0e6ef;
    box-shadow: 0 3px 12px rgba(0,0,0,0.08);
    page-break-inside: avoid;
  }
  .story-header {
    display: flex;
    align-items: stretch;
    min-height: 80px;
  }
  .story-num {
    font-size: 32pt;
    font-weight: 800;
    color: rgba(255,255,255,0.3);
    background: rgba(0,0,0,0.12);
    width: 72px;
    min-width: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .story-titles { padding: 1rem 1.5rem; }
  .story-title { font-size: 15pt; font-weight: 700; color: #fff; line-height: 1.2; }
  .story-competency { font-size: 9pt; color: rgba(255,255,255,0.7); margin-top: 0.2rem; letter-spacing: 0.5px; }

  .story-prompt {
    background: #F5F7FA;
    border-bottom: 1px solid #e0e6ef;
    padding: 0.75rem 1.2rem;
    font-size: 10pt;
    font-style: italic;
    color: #595959;
  }

  /* STAR grid */
  .star-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
  .star-block {
    padding: 1rem 1.2rem;
    border: 0.5px solid #e8eef5;
  }
  .star-block.situation { background: #EBF3FB; }
  .star-block.task      { background: #F0F4F8; }
  .star-block.action    { background: #FAFCFF; }
  .star-block.result    { background: #E2EFDA; }

  .star-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
    font-size: 10pt;
    color: #1F3864;
  }
  .star-letter {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #1F3864;
    color: #fff;
    font-size: 10pt;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .star-block.situation .star-letter { background: #2E75B6; }
  .star-block.task      .star-letter { background: #7B2C8A; }
  .star-block.action    .star-letter { background: #C55A11; }
  .star-block.result    .star-letter { background: #375623; }

  .star-body { font-size: 10pt; color: #1a1a2e; line-height: 1.65; }
  .star-body strong { color: #1F3864; }
  .star-body em { font-style: normal; font-weight: 600; color: #2E75B6; }

  .delivery-tip {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    background: #FFF8E1;
    border-top: 2px solid #F0A000;
    padding: 0.75rem 1.2rem;
    font-size: 9.5pt;
    color: #7B5800;
    line-height: 1.55;
  }
  .tip-icon { font-size: 12pt; flex-shrink: 0; }

  /* Closing */
  .closing-section { margin: 3rem 0 2rem; page-break-before: always; }
  .closing-header { font-size: 18pt; font-weight: 800; color: #1F3864; margin-bottom: 0.3rem; }
  .closing-sub { font-size: 10pt; color: #595959; font-style: italic; margin-bottom: 1.2rem; }
  .closing-quote {
    background: #E2EFDA;
    border-left: 6px solid #375623;
    padding: 1.2rem 1.5rem;
    font-size: 12pt;
    font-style: italic;
    color: #375623;
    font-weight: 600;
    border-radius: 0 8px 8px 0;
    line-height: 1.7;
  }

  /* Quick ref */
  .quickref-section { margin-top: 2.5rem; }
  .quickref-header { font-size: 18pt; font-weight: 800; color: #1F3864; margin-bottom: 0.3rem; }
  .quickref-sub { font-size: 10pt; color: #595959; font-style: italic; margin-bottom: 1.2rem; }
  .ref-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  .ref-table thead tr { background: #1F3864; color: #fff; }
  .ref-table th { padding: 0.6rem 0.8rem; font-weight: 600; text-align: left; }
  .ref-table tr.even { background: #EBF3FB; }
  .ref-table tr.odd  { background: #fff; }
  .ref-table td { padding: 0.5rem 0.8rem; border: 1px solid #e0e6ef; }
  .ref-num { font-weight: 800; color: #1F3864; text-align: center; }
  .ref-story { font-weight: 600; color: #1F3864; }
  .ref-source { color: #595959; }
  .ref-comp { color: #2E75B6; }

  @page {
    size: letter;
    margin: 0.75in 0.85in;
    @bottom-center { content: counter(page); font-size: 8pt; color: #aaa; }
  }
  @media print {
    .story-card { break-inside: avoid; }
  }
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>HireFlow Behavioral Story Bank</title>
<style>${css}</style>
</head>
<body>

<div class="cover">
  <div class="cover-eyebrow">ProService Hawaii · APM Interview Prep</div>
  <div class="cover-title">HireFlow</div>
  <div class="cover-subtitle">Behavioral Story Bank</div>
  <div class="cover-divider"></div>
  <div class="cover-meta">Stage 4 Final Round &nbsp;·&nbsp; Devan Capps &nbsp;·&nbsp; March 2026</div>
  <div class="cover-tags">
    <span class="cover-tag">7 STAR Stories</span>
    <span class="cover-tag">Sendero Consulting</span>
    <span class="cover-tag">F45 Training</span>
    <span class="cover-tag">APM Competencies</span>
  </div>
  <div class="cover-guide">
    <h3>How to use this doc</h3>
    <ul>
      <li>STAR = Situation → Task → Action → Result</li>
      <li>Best answers are 90–120 seconds — start tight, let them pull more</li>
      <li>Connect every story back to how it applies to this role at ProService</li>
      <li>Each story has a Delivery Tip — read it, then let it go in the room</li>
    </ul>
  </div>
</div>

${stories.join('\n')}

${closingLine}
${quickRef}

</body>
</html>`;

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
  console.log('Done: Behavioral-Story-Bank.pdf');
})();
