const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageNumber, LevelFormat
} = require("docx");

// Colors
const C = {
  navy: "1B3A5C",
  teal: "2A7B88",
  amber: "D4820A",
  green: "2D6A4F",
  red: "9B2226",
  purple: "5B4E96",
  blue: "2563EB",
  lightNavy: "E8EFF6",
  lightTeal: "E6F4F1",
  lightAmber: "FFF3E0",
  lightGreen: "E8F5E9",
  lightRed: "FDECEA",
  lightPurple: "F0EDF8",
  lightBlue: "EBF2FF",
  gray: "6B7280",
  darkGray: "374151",
  lightGray: "F3F4F6",
  white: "FFFFFF",
  black: "111827",
};

const noBorder = { style: BorderStyle.NONE, size: 0, color: C.white };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" };
const thinBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function spacer(pts = 120) {
  return new Paragraph({ spacing: { before: pts, after: pts }, children: [] });
}

function storyHeader(num, title, subtitle, color) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [800, 8560],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 800, type: WidthType.DXA },
            borders: noBorders,
            shading: { fill: color, type: ShadingType.CLEAR },
            verticalAlign: "center",
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(num), bold: true, size: 44, color: C.white, font: "Arial" })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 8560, type: WidthType.DXA },
            borders: noBorders,
            shading: { fill: color, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 200, right: 200 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: title, bold: true, size: 28, color: C.white, font: "Arial" })],
              }),
              new Paragraph({
                children: [new TextRun({ text: subtitle, size: 18, color: C.white, font: "Arial", italics: true })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function promptBox(text) {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    indent: { left: 360, right: 360 },
    children: [new TextRun({ text: `\u201C${text}\u201D`, italics: true, size: 22, color: C.darkGray, font: "Arial" })],
  });
}

function starSection(label, labelColor, bgColor, content) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            borders: noBorders,
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: label.charAt(0), bold: true, size: 22, color: C.white, font: "Arial",
                    shading: { fill: labelColor, type: ShadingType.CLEAR } }),
                  new TextRun({ text: `  ${label}`, bold: true, size: 22, color: labelColor, font: "Arial" }),
                ],
              }),
              ...content.map(
                (line) =>
                  new Paragraph({
                    spacing: { after: 60 },
                    children: [new TextRun({ text: line, size: 20, color: C.darkGray, font: "Arial" })],
                  })
              ),
            ],
          }),
        ],
      }),
    ],
  });
}

function deliveryTip(text) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            borders: noBorders,
            shading: { fill: C.lightAmber, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 200, right: 200 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "\u26A1 Delivery Tip: ", bold: true, size: 20, color: C.amber, font: "Arial" }),
                  new TextRun({ text, size: 20, color: C.amber, font: "Arial" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function parallelBox(projectName, text) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 3, color: C.teal },
              bottom: { style: BorderStyle.SINGLE, size: 3, color: C.teal },
              left: { style: BorderStyle.SINGLE, size: 8, color: C.teal },
              right: { style: BorderStyle.SINGLE, size: 3, color: C.teal },
            },
            shading: { fill: C.lightTeal, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: `CURRENT SENDERO PROJECT PARALLEL \u2014 ${projectName}`, bold: true, size: 20, color: C.teal, font: "Arial" }),
                ],
              }),
              new Paragraph({
                children: [new TextRun({ text, size: 20, color: C.darkGray, font: "Arial" })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Story data
const stories = [
  {
    num: 1, title: "Discovery \u2192 Translating Ambiguity into Requirements",
    subtitle: "Discovery \u00B7 Requirements \u00B7 Stakeholder Alignment", color: C.navy,
    prompt: "Tell me about a time you took a vague business problem and turned it into a clear product requirement.",
    situation: [
      "At Sendero, we were brought in by a mid-size financial services firm to modernize their operational reporting. The ask from the business sponsor was genuinely vague: \u201CWe need better visibility into our operations.\u201D No specifics, no scope, no success criteria.",
    ],
    task: [
      "Turn that into a defined product requirement we could actually build against \u2014 not interpret on behalf of the client, but surface what they actually needed through structured discovery.",
    ],
    action: [
      "I ran four discovery sessions over two weeks:",
      "1. Executive sponsor: \u201CWhat decisions are you making today without the data you need?\u201D",
      "2\u20133. Operational team: \u201CWhere do you go to find information right now? What\u2019s the worst part of your Tuesday morning?\u201D",
      "4. IT team: what data was actually available vs. what people thought was available.",
      "",
      "The pattern: the ops team was spending 3\u20134 hours every Monday morning pulling data from 6 systems and building a manual Excel report. The \u201Cbetter visibility\u201D request was really \u201Cstop making us do this every Monday.\u201D The requirement became specific: a real-time dashboard aggregating those 6 sources with automated weekly snapshots.",
    ],
    result: [
      "Shipped the dashboard in an 8-week sprint. The Monday report process dropped from 3\u20134 hours to under 30 minutes. More importantly, the executive sponsor went from \u201CI need better visibility\u201D to being able to tell me exactly which metrics she tracked and why. That clarity only existed because we did the discovery properly.",
    ],
    tip: "Connect to HireFlow: \u201CI did the same thing here \u2014 I didn\u2019t just build a PDF reader. I understood the actual problem (manual data entry into PrismHR) and designed the tool around eliminating that specific bottleneck.\u201D",
    parallel: {
      project: "RMS (Regulatory Management System)",
      text: "I\u2019m doing this exact same thing right now at Sendero. The Oncor regulatory team came to us with \u2018we need to replace our compliance tracking system before SharePoint InfoPath goes end-of-life in July 2026.\u2019 That\u2019s a migration deadline, not a product requirement. Through discovery with compliance officers, case managers, and external attorneys, we translated that into specific functional requirements: case profile generation from PUC docket data, discovery management workflows with question/answer tracking, routine filing profiles with automated deadline notifications, and role-based access separating internal users (RACF/AD auth) from external attorneys (Okta). The vague \u2018replace the system\u2019 became a detailed data model with 15+ tables across Case Management, Discovery Management, Routine Filings, and Service Lists modules.",
    },
  },
  {
    num: 2, title: "AI/Automation Product with Business Impact",
    subtitle: "AI Product Judgment \u00B7 Technical Depth \u00B7 Business Outcomes", color: C.teal,
    prompt: "Walk me through your experience shipping an AI-powered product.",
    situation: [
      "At Sendero, I led a product workstream for an IBM watsonx GenAI implementation at a large insurance client. They had a backlog of thousands of unstructured policy exception requests per quarter \u2014 each requiring a human analyst to read, categorize, and route. The queue was growing faster than they could hire.",
    ],
    task: [
      "Define what the AI should do, what it shouldn\u2019t do, and what success looks like. I was the product lead responsible for requirements and acceptance criteria.",
    ],
    action: [
      "The most important decision: scope the AI to triage and categorize, not decide. AI reads each request, extracts key variables, classifies into one of 12 routing categories, flags high-risk cases for senior review. A human still makes every final call.",
      "",
      "I had to defend this human-in-loop design to leadership who wanted full automation. My argument: we needed 90 days of side-by-side operation \u2014 AI recommendation alongside human decision \u2014 to measure accuracy before trusting it to route independently. They agreed.",
      "",
      "After 90 days, accuracy on standard exception types was 94%. We then expanded automation to those categories and kept human review for edge cases.",
    ],
    result: [
      "Analyst handling time on standard cases dropped 60%. Queue cleared within a quarter. The 90-day accuracy data gave us evidence to propose expanding AI scope to a second exception type in the follow-on phase.",
    ],
    tip: "Note the parallel to HireFlow: same philosophy \u2014 AI extracts and triages, human confirms before submission. Build trust through demonstrated accuracy before expanding automation. This is a principle I apply consistently.",
    parallel: {
      project: "PAID (Payment Acknowledgement & Identification Data)",
      text: "I\u2019m applying this same AI-adjacent thinking on the PAID application at Oncor right now. PAID streamlines deposit management for Oncor\u2019s Misc. Cash Posting department \u2014 they monitor JP Morgan bank transactions and research payment ownership across the enterprise. In Phase 2, I\u2019m defining the reporting requirements: standard reports (deposits per organization, payment type breakdowns, deposits worked by user) and custom reports (deposits 4+ days old with notification counts, deposits with 2+ notifications and no activity). The same principle applies \u2014 automate the data aggregation and surfacing, but keep humans making the ownership and routing decisions. We\u2019re also planning advanced matching capabilities for future phases, where AI could help identify deposit owners automatically \u2014 but we\u2019re building the data foundation first.",
    },
  },
  {
    num: 3, title: "Building Internal Tools Operational Teams Actually Use",
    subtitle: "Internal Tooling \u00B7 User Research \u00B7 Adoption", color: C.green,
    prompt: "Tell me about a product you built that internal teams actually use.",
    situation: [
      "At F45 Training, I was Product Operations Manager for a global franchise network of 1,700+ studios. Studio owners were making operational decisions \u2014 staffing, scheduling, promotional spend \u2014 without reliable data. Corporate had data but it lived in multiple systems and only surfaced in quarterly reports already 90 days stale.",
    ],
    task: [
      "Build an internal analytics platform giving studio owners real-time visibility into their own performance: attendance trends, membership churn, class fill rates, revenue per class.",
    ],
    action: [
      "Started with user research \u2014 interviewed 12 studio owners across three cohorts (new, mid-growth, established). Key finding: studio owners are on the gym floor all day, not at a desk. They check their phones between classes. The tool needed to be mobile-first and scannable in 30 seconds, not a desktop dashboard.",
      "",
      "I wrote the requirements with that constraint as the design principle. Worked with engineering to build a responsive dashboard leading with three KPIs (today\u2019s attendance, this-week\u2019s churn alerts, this-month\u2019s revenue vs. target). Phased rollout to 50 studios with a feedback loop before network release.",
    ],
    result: [
      "Within 6 months, 78% of active studio owners were logging in weekly. Churn alerts \u2014 flagging members whose attendance had dropped below a threshold \u2014 were credited by several owners with saving memberships they would otherwise have lost. Corporate ops adopted the platform for their own studio health monitoring.",
    ],
    tip: "\u201CWhat makes internal tools succeed: user research before wireframes, not after. Design for how users actually work, not how you wish they worked.\u201D",
    parallel: {
      project: "RMS",
      text: "The RMS replacement project is exactly this kind of internal tool challenge. The Oncor regulatory team \u2014 case managers, compliance officers, and external attorneys \u2014 currently use SharePoint InfoPath forms that are going end-of-life. We\u2019re building a modern web application on Angular/NestJS hosted on OpenShift. The key insight from user research: internal users need deep case management functionality (create/update/close profiles, discovery management, document searching), while external attorneys need a lighter-weight version with just case viewing and discovery responses. So we designed two interfaces: RMS Web (full-featured, on-premise OpenShift) and RMS Lite Web (streamlined, hosted on AWS ROSA with Okta auth via Akamai). Same data, different user experiences based on how each group actually works.",
    },
  },
  {
    num: 4, title: "Cross-Functional Collaboration Under a Deadline",
    subtitle: "Cross-functional Leadership \u00B7 Trade-off Navigation \u00B7 Delivery", color: C.purple,
    prompt: "Tell me about working with engineers when priorities were competing.",
    situation: [
      "At F45, mid-sprint on a major platform update \u2014 a new class booking flow for a significant portion of our member base \u2014 corporate announced an all-hands initiative: ship a promotional campaign feature for a global activation event happening in 6 weeks. Two engineering sub-teams, both at capacity.",
    ],
    task: [
      "Navigate competing priorities without blowing up either delivery. I was the product owner for both workstreams.",
    ],
    action: [
      "First move: a joint prioritization session with both engineering leads, UX designer, and the marketing stakeholder. I laid out both timelines on a whiteboard and asked everyone to surface dependencies before I tried to solve anything.",
      "",
      "What emerged: the campaign feature had one hard dependency \u2014 an email trigger. The rest could ship in v1.5 post-event. The booking flow had one regression risk: a shared component both teams were touching.",
      "",
      "The path became clear: freeze the shared component for two weeks (booking team completes), campaign team builds around it, then shared component opens again. I got written sign-off from both engineering leads and the marketing stakeholder. When scope pressure came from marketing in week 4, I could point to the agreed scope from week 1.",
    ],
    result: [
      "Booking flow shipped on schedule. Campaign feature shipped with core functionality for the global activation. v1.5 features shipped three weeks post-event. No team had to crunch.",
    ],
    tip: "\u201CI didn\u2019t \u2018prioritize\u2019 by choosing sides. I facilitated the conversation that surfaced real constraints, then found the path that served both teams. That\u2019s the product owner\u2019s job.\u201D",
    parallel: {
      project: "RMS",
      text: "I\u2019m navigating this same dynamic on the RMS project right now. We have a hard deadline \u2014 SharePoint InfoPath support ends July 14, 2026 \u2014 and multiple workstreams competing for the same development team: the core web frontend (Angular), the NestJS backend API, the Auth Service (Active Directory + Okta integration), the Notification Service, the File Sync Service, and the RMS Lite external-facing app on AWS. I coordinate across Salesforce developers, compliance SMEs, infrastructure teams (OpenShift + AWS ROSA provisioning), and the client\u2019s regulatory stakeholders. We made architectural decisions early to unblock parallel work \u2014 like choosing Okta for external attorney auth so the Lite team could develop independently while the main app team focused on RACF/AD integration.",
    },
  },
  {
    num: 5, title: "KPIs, Metrics, and Data-Driven Decisions",
    subtitle: "Metrics \u00B7 Data Literacy \u00B7 Product Judgment", color: C.amber,
    prompt: "How do you define and measure whether a product is working?",
    situation: [
      "At F45, six months after launching the studio analytics platform, there was internal debate about whether it was actually driving behavior change or just being used as a vanity dashboard. Leadership wanted to know if we should invest in expanding it.",
    ],
    task: [
      "Build the measurement framework that could answer that question honestly \u2014 not just \u201Care people logging in\u201D but \u201Cis it changing what they do?\u201D",
    ],
    action: [
      "Defined three metric tiers:",
      "",
      "Engagement metrics: weekly active users, session depth, feature adoption. Tells us if people are using it.",
      "",
      "Behavior metrics: Did studio owners who used churn alerts have lower churn rates than those who didn\u2019t? Did studios checking fill rates weekly show better fill rate trends? This required a 90-day cohort analysis \u2014 heavy users vs. light vs. non-users.",
      "",
      "Business outcome metrics: retention rate, revenue per studio, membership growth. The lagging indicators.",
    ],
    result: [
      "The 90-day cohort data: studios where the owner logged in 3+ times per week had 12% lower member churn than non-user studios. Correlation, not causation \u2014 but strong enough signal to present to leadership as evidence of impact. Leadership approved a Phase 2 investment: predictive churn modeling (flagging at-risk members before they churn).",
    ],
    tip: "\u201CGood metrics have three layers: are people using it (engagement)? Is it changing behavior (leading indicators)? Is the business better off (outcomes)? If engagement is high but behavior isn\u2019t changing, you have a nice dashboard, not a product.\u201D",
    parallel: {
      project: "PAID Phase 2 Reporting",
      text: "I\u2019m building exactly this kind of measurement framework right now for the PAID application at Oncor. Phase 2 is the reporting module \u2014 I defined the full reporting requirements including Standard Reports (ALL User Report with deposit amounts/dates/customer names contingent on API connection, deposits per organization with count/sum/payment types, payment type breakdowns by invoice vs. OA with counts/amounts/accounting used) and Custom Reports (deposits 4+ days status with notification counts, deposits with 2+ notifications and no activity in History, deposit summary reports integrating with FIM for Payment Detail Report Validations). Each report maps to a specific operational question: \u2018How many deposits is each analyst processing?\u2019 \u2018Which deposits are stuck?\u2019 \u2018Where are the bottlenecks in the MCP department?\u2019 The metrics aren\u2019t vanity \u2014 they directly drive process improvement and resource allocation decisions.",
    },
  },
  {
    num: 6, title: "Prioritization Under Constraints",
    subtitle: "Stakeholder Management \u00B7 Strategic Clarity \u00B7 Scope", color: C.blue,
    prompt: "Tell me about a time you had to say no to a stakeholder request.",
    situation: [
      "At F45 during aggressive global expansion, the franchise development team came to me with a request: build a \u201Cfranchise prospectus\u201D feature in the studio platform \u2014 a module that would generate PDF prospectus documents for potential new franchise owners, pulling live performance data. The request came in Q3 when my team was mid-sprint on the member-facing app refresh tied to a marketing campaign launch.",
    ],
    task: [
      "Handle this request without derailing the active roadmap and without dismissing a legitimate business need from a senior stakeholder.",
    ],
    action: [
      "I took the meeting seriously, not defensively. Asked the franchise development lead to walk me through the use case: how many prospectus documents per month? What was the current process? What was actually broken?",
      "",
      "Turns out: 8\u201310 documents per month, each taking 2\u20133 hours of manual data compilation. Real pain. But the solution they requested \u2014 a full platform feature \u2014 was significantly heavier than the problem warranted.",
      "",
      "I proposed an alternative: a lightweight data export template that pulled the relevant studio metrics into a structured CSV they could plug into their existing prospectus template. 20-minute integration. I could build it as a 2-day side project without touching the main roadmap. The full feature goes on the backlog for Q1 when capacity is available.",
    ],
    result: [
      "Franchise development got a working solution in 2 days. The member app shipped on schedule. The full feature shipped in Q1 with much better-defined requirements because the interim solution helped them understand exactly what they needed from a platform version.",
    ],
    tip: "\u201CSaying no isn\u2019t the right frame. I\u2019m responsible for the roadmap AND for helping stakeholders solve their problems. The job is to find the right solution at the right time.\u201D",
    parallel: {
      project: "RMS",
      text: "On the RMS project, we made a similar scope decision. The client wanted AI-powered features \u2014 an AI Summarizer to create abstracts from PUC docket info, an AI Discovery Assistant to find answers to DMT questions based on prior responses, and AI Intelligent Search. These are genuinely valuable capabilities. But they\u2019re not required for the July 2026 deadline. The core requirement is: replace the InfoPath forms before they stop working. So we explicitly scoped the AI Enabler Service as \u2018not an immediate requirement \u2014 will be enabled in future.\u2019 We prioritized the Case Management Tool, Discovery Management Tool, Routine Filings, and the external attorney access (RMS Lite) \u2014 the features that, if missing, mean the regulatory team literally cannot do their jobs. The AI features go on the roadmap for after go-live.",
    },
  },
  {
    num: 7, title: "Learning from Failure",
    subtitle: "Self-Awareness \u00B7 Growth Mindset \u00B7 Intellectual Honesty", color: C.red,
    prompt: "Tell me about a product decision you\u2019d make differently in hindsight.",
    situation: [
      "At F45, I led the requirements and rollout for a new class scheduling tool for studio owners. Significant improvement \u2014 more flexibility, better conflict detection, cleaner UI. Engineering built it well. We shipped on time.",
    ],
    task: [
      "I did not do enough user testing before the rollout. I had done discovery interviews, written thorough requirements, and reviewed wireframes. What I skipped: a structured UAT round with actual studio owners in staging before go-live. My reasoning: the old system was genuinely broken, owners were frustrated, speed felt justified.",
    ],
    action: [
      "Two days after rollout, support tickets started coming in. The new tool had a workflow change \u2014 technically correct and cleaner by design \u2014 that broke a habitual process a large segment of owners had built with the old system. They\u2019d built their Monday morning routine around a specific sequence of clicks, and the new tool changed that sequence.",
      "",
      "Not wrong, just different. But \u201Cdifferent\u201D for operational users who\u2019ve built habits is a real cost.",
      "",
      "We spent two weeks on an emergency patch, a support escalation campaign, and a communication effort explaining the workflow change.",
    ],
    result: [
      "Speed of delivery is not the same as speed of value. A two-week UAT round with 10 studio owners in staging would have caught the workflow issue before go-live. The two weeks we spent on incident response was the same cost \u2014 but with significantly more user pain and trust damage.",
      "",
      "Since then, I\u2019ve built UAT as a non-negotiable into every roadmap I own. For HireFlow, I tested the review workflow with sample packets specifically to catch workflow assumptions before presenting it. That habit comes directly from this experience.",
    ],
    tip: "Be honest and specific. Don\u2019t hedge. The best \u201Cwhat I\u2019d do differently\u201D answers own the error clearly and show the specific behavioral change that resulted. That\u2019s what makes it credible.",
    parallel: null,
  },
];

// Build document sections
const children = [];

// Title page
children.push(
  spacer(2400),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: "PROSERVICE HAWAII \u00B7 APM INTERVIEW PREP", size: 18, color: C.gray, font: "Arial", characterSpacing: 120 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "HireFlow", bold: true, size: 56, color: C.navy, font: "Arial" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Behavioral Story Bank", size: 36, color: C.teal, font: "Arial" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: "Enhanced with Real Project Experience", size: 24, color: C.amber, font: "Arial", italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 3, color: C.teal, space: 12 } },
    spacing: { before: 300, after: 200 },
    children: [],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Stage 4 Final Round \u00B7 Devan Capps \u00B7 March 2026", size: 22, color: C.gray, font: "Arial" })],
  }),
  spacer(600),
  // How to use box
  new Table({
    width: { size: 7200, type: WidthType.DXA },
    columnWidths: [7200],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 7200, type: WidthType.DXA },
            borders: noBorders,
            shading: { fill: C.lightGray, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 300, right: 300 },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [new TextRun({ text: "HOW TO USE THIS DOC", bold: true, size: 20, color: C.darkGray, font: "Arial", characterSpacing: 60 })],
              }),
              ...[
                "STAR = Situation \u2192 Task \u2192 Action \u2192 Result",
                "Best answers are 90\u2013120 seconds \u2014 start tight, let them pull more",
                "Connect every story back to how it applies to this role at ProService",
                "Each story has a Delivery Tip \u2014 read it, then let it go in the room",
                "NEW: \u201CCurrent Parallel\u201D boxes show how your real Sendero work reinforces each story",
              ].map(
                (t) =>
                  new Paragraph({
                    spacing: { after: 40 },
                    children: [
                      new TextRun({ text: "\u2192 ", size: 20, color: C.teal, font: "Arial" }),
                      new TextRun({ text: t, size: 20, color: C.darkGray, font: "Arial" }),
                    ],
                  })
              ),
            ],
          }),
        ],
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// Stories
for (const s of stories) {
  children.push(
    storyHeader(s.num, s.title, s.subtitle, s.color),
    promptBox(s.prompt),
    starSection("Situation", C.navy, C.lightNavy, s.situation),
    spacer(60),
    starSection("Task", C.teal, C.lightTeal, s.task),
    spacer(60),
    starSection("Action", C.amber, C.lightAmber, s.action),
    spacer(60),
    starSection("Result", C.green, C.lightGreen, s.result),
    spacer(80),
    deliveryTip(s.tip)
  );
  if (s.parallel) {
    children.push(spacer(80), parallelBox(s.parallel.project, s.parallel.text));
  }
  children.push(new Paragraph({ children: [new PageBreak()] }));
}

// Universal Closing Line
children.push(
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: "Universal Closing Line", bold: true, size: 32, color: C.navy, font: "Arial" })],
  }),
  new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: "Use this to connect any behavioral answer back to why you\u2019re here", italics: true, size: 20, color: C.gray, font: "Arial" })],
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 3, color: C.navy },
              bottom: { style: BorderStyle.SINGLE, size: 3, color: C.navy },
              left: { style: BorderStyle.SINGLE, size: 8, color: C.navy },
              right: { style: BorderStyle.SINGLE, size: 3, color: C.navy },
            },
            shading: { fill: C.lightNavy, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "\u201CThat experience is part of why I\u2019m here. I want to be in a product role where I can apply what I learned in consulting \u2014 the discovery discipline, the cross-functional work, the AI implementation experience \u2014 to a single product that I can own from prototype to production. HireFlow is the prototype. This role is the production version.\u201D",
                    italics: true, size: 22, color: C.navy, font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// Quick-Reference Table
children.push(
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: "Story Quick-Reference", bold: true, size: 32, color: C.navy, font: "Arial" })],
  }),
  new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text: "Scan this the morning of the interview to prime each story in memory", italics: true, size: 20, color: C.gray, font: "Arial" })],
  })
);

const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "9CA3AF" };
const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };

const refHeaders = ["#", "Story", "Source", "Current Parallel", "Competency"];
const refWidths = [500, 1800, 2200, 2560, 2300];
const refData = [
  ["1", "Discovery \u2192 Requirements", "Sendero \u2014 financial services ops reporting", "RMS \u2014 regulatory compliance requirements discovery", "Discovery, ambiguity, requirements"],
  ["2", "AI/Automation Product", "Sendero \u2014 IBM watsonx insurance exceptions", "PAID \u2014 automated reporting replacing manual processes", "AI judgment, business impact"],
  ["3", "Internal Tools Adoption", "F45 \u2014 studio analytics platform", "RMS \u2014 dual-interface design for internal/external users", "Operational tooling, user research"],
  ["4", "Cross-Functional Deadline", "F45 \u2014 competing sprint priorities", "RMS \u2014 multi-workstream coordination with hard deadline", "Collaboration, trade-offs, delivery"],
  ["5", "KPIs & Metrics", "F45 \u2014 analytics platform measurement", "PAID Phase 2 \u2014 operational reporting framework", "Data literacy, outcome metrics"],
  ["6", "Prioritization / Saying No", "F45 \u2014 franchise prospectus request", "RMS \u2014 AI features deferred for core compliance deadline", "Stakeholder management, scope"],
  ["7", "Learning from Failure", "F45 \u2014 scheduling tool UAT skip", "(HireFlow \u2014 applied UAT lesson directly)", "Self-awareness, growth mindset"],
];

const makeRefRow = (cells, isHeader) =>
  new TableRow({
    children: cells.map(
      (text, i) =>
        new TableCell({
          width: { size: refWidths[i], type: WidthType.DXA },
          borders: headerBorders,
          shading: isHeader ? { fill: C.navy, type: ShadingType.CLEAR } : { fill: C.white, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  bold: isHeader,
                  size: isHeader ? 18 : 17,
                  color: isHeader ? C.white : C.darkGray,
                  font: "Arial",
                }),
              ],
            }),
          ],
        })
    ),
  });

children.push(
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: refWidths,
    rows: [makeRefRow(refHeaders, true), ...refData.map((r) => makeRefRow(r, false))],
  })
);

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "HireFlow Behavioral Story Bank \u2014 Enhanced", size: 16, color: C.gray, font: "Arial" })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Page ", size: 16, color: C.gray, font: "Arial" }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.gray, font: "Arial" })],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("/Users/devancapps/Desktop/Behavioral-Story-Bank-Enhanced.docx", buffer);
  console.log("Created Behavioral-Story-Bank-Enhanced.docx");
});
