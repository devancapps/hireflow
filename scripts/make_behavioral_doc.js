const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, ShadingType, WidthType,
  Table, TableRow, TableCell, PageNumber, Footer, LevelFormat
} = require('docx');
const fs = require('fs');

// ── helpers ──────────────────────────────────────────────────────────────────
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text, size: 20, font: 'Arial', ...opts })]
  });
}
function label(text, color = '1F3864') {
  return new Paragraph({
    spacing: { before: 160, after: 40 },
    children: [new TextRun({ text, bold: true, size: 22, font: 'Arial', color })]
  });
}
function tip(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    shading: { fill: 'FFF2CC', type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'F0A000', space: 6 } },
    indent: { left: 240 },
    children: [new TextRun({ text: `\u26A0\uFE0F  Delivery tip: ${text}`, size: 18, font: 'Arial', italics: true, color: '7B5800' })]
  });
}
function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 1 } },
    children: []
  });
}
function pageBreak() { return new Paragraph({ pageBreakBefore: true, children: [] }); }

function storyHeader(num, title, prompt, competency) {
  return [
    pageBreak(),
    new Paragraph({
      spacing: { before: 0, after: 0 },
      shading: { fill: '1F3864', type: ShadingType.CLEAR },
      children: [
        new TextRun({ text: `  Story ${num}  `, size: 36, bold: true, font: 'Arial', color: 'FFFFFF' }),
        new TextRun({ text: `  ${title}`, size: 24, bold: true, font: 'Arial', color: 'BDD7EE' })
      ]
    }),
    new Paragraph({
      spacing: { before: 0, after: 12 },
      shading: { fill: '2E75B6', type: ShadingType.CLEAR },
      children: [new TextRun({ text: `  Competency: ${competency}`, size: 18, font: 'Arial', color: 'FFFFFF', italics: true })]
    }),
    new Paragraph({
      spacing: { before: 0, after: 200 },
      shading: { fill: 'EBF3FB', type: ShadingType.CLEAR },
      children: [new TextRun({ text: `  Prompt: "${prompt}"`, size: 18, font: 'Arial', color: '1F3864', italics: true })]
    })
  ];
}

// ── CONTENT ───────────────────────────────────────────────────────────────────
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
    children: [new TextRun({ text: 'Behavioral Story Bank', size: 36, font: 'Arial', color: '2E75B6' })]
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
  new Paragraph({ spacing: { before: 240, after: 80 }, children: [new TextRun({ text: 'How to use this document', bold: true, size: 24, font: 'Arial', color: '1F3864' })] }),
  body('The second half of Stage 4 (~20-25 min) will be behavioral questions about your background. Jordan and Mikaela want to see that your past experience translates directly into the APM role at ProService.'),
  body('Each story uses the STAR format: Situation \u2192 Task \u2192 Action \u2192 Result. The best answers are 90-120 seconds. Go longer only if they ask follow-up questions \u2014 start tight and let them pull the details.'),
  body(''),
  new Paragraph({ spacing: { before: 80, after: 40 }, children: [new TextRun({ text: 'The 7 stories:', bold: true, size: 22, font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, numbering: { reference: 'numbers', level: 0 }, children: [new TextRun({ text: 'Discovery \u2192 Translating ambiguous problems into product requirements', size: 20, font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, numbering: { reference: 'numbers', level: 0 }, children: [new TextRun({ text: 'AI/Automation product with real business impact', size: 20, font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, numbering: { reference: 'numbers', level: 0 }, children: [new TextRun({ text: 'Building internal tools for operational users', size: 20, font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, numbering: { reference: 'numbers', level: 0 }, children: [new TextRun({ text: 'Cross-functional collaboration under a deadline', size: 20, font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, numbering: { reference: 'numbers', level: 0 }, children: [new TextRun({ text: 'KPIs, metrics, and data-driven decisions', size: 20, font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, numbering: { reference: 'numbers', level: 0 }, children: [new TextRun({ text: 'Prioritization under constraints', size: 20, font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 0, after: 40 }, numbering: { reference: 'numbers', level: 0 }, children: [new TextRun({ text: 'Handling failure / learning from a mistake', size: 20, font: 'Arial' })] }),
  divider()
);

// ──────────────────────────────────────────────────────────────────────────────
// STORY 1 — Discovery / translating ambiguity
// ──────────────────────────────────────────────────────────────────────────────
children.push(...storyHeader(1,
  'Discovery: Ambiguity to Requirements',
  'Tell me about a time you took a vague business problem and turned it into a clear product requirement.',
  'Discovery \u2022 Requirements \u2022 Stakeholder alignment'
));
children.push(
  label('SITUATION'),
  body('At Sendero, we were brought in by a mid-size financial services firm to modernize their operational reporting. The ask from the business sponsor was genuinely vague: "We need better visibility into our operations." No specifics, no scope, no success criteria. Leadership was frustrated but couldn\u2019t articulate exactly what they needed.'),
  label('TASK'),
  body('My job as product lead was to turn that into a defined product requirement we could actually build against \u2014 not interpret on behalf of the client, but surface what they actually needed through structured discovery.'),
  label('ACTION'),
  body('I ran four discovery sessions over two weeks. One with the executive sponsor (what decisions are you making today without the data you need?), two with the operational team actually doing the work (where do you go to find information right now? what\u2019s the worst part of your Tuesday morning?), and one with the IT team to understand what data was actually available vs. what people thought was available.'),
  body('The pattern that emerged: the operations team was spending 3-4 hours every Monday morning pulling data from 6 different systems and building a manual Excel report for their weekly ops review. The "better visibility" request was really "stop making us do this every Monday." The product requirement became specific: a real-time dashboard that aggregated those 6 data sources with automated weekly snapshots and distribution.'),
  label('RESULT'),
  body('We shipped the dashboard in an 8-week sprint. The Monday report process dropped from 3-4 hours to under 30 minutes for final review. More importantly, the executive sponsor went from "I need better visibility" to being able to tell me exactly which metrics she was tracking and why. That clarity only existed because we did the discovery properly.'),
  tip('This maps directly to HireFlow: I did the same thing here. I didn\u2019t just build a PDF reader \u2014 I understood the actual problem (manual data entry into PrismHR) and designed the tool around eliminating that specific bottleneck.'),
  divider()
);

// ──────────────────────────────────────────────────────────────────────────────
// STORY 2 — AI/automation product with business impact
// ──────────────────────────────────────────────────────────────────────────────
children.push(...storyHeader(2,
  'AI/Automation Product with Business Impact',
  'Walk me through your experience shipping an AI-powered product.',
  'AI product judgment \u2022 Technical depth \u2022 Business outcomes'
));
children.push(
  label('SITUATION'),
  body('At Sendero, I led a product workstream for an IBM watsonx GenAI implementation at a large insurance client. They had a backlog of unstructured policy exception requests \u2014 thousands of emails per quarter from agents asking for manual review of claims outside standard guidelines. Each one required a human analyst to read, categorize, and route. The queue was growing faster than they could hire.'),
  label('TASK'),
  body('Define what the AI component should actually do, what it shouldn\u2019t do, and what success looks like. I was the product lead responsible for the requirements and the acceptance criteria, working with IBM\u2019s technical team on the implementation.'),
  label('ACTION'),
  body('The first and most important decision: we scoped the AI to triage and categorize, not decide. The AI would read each exception request, extract the key variables (policy type, exception type, dollar amount, prior exception history), classify it into one of 12 routing categories, and flag high-risk cases for senior analyst review. A human still made the final call on every exception.'),
  body('That human-in-loop design was deliberate and I had to defend it to the client\u2019s leadership who wanted full automation. My argument: the AI\u2019s accuracy on novel exception types was unknown. We needed 90 days of side-by-side operation \u2014 AI recommendation alongside the human decision \u2014 to measure accuracy before trusting it to route independently. They agreed.'),
  body('After 90 days, the AI\u2019s categorization accuracy on standard exception types was 94%. We then expanded automation to those categories and kept human review for the edge cases. That phased approach built trust that would have been destroyed by a day-one wrong routing.'),
  label('RESULT'),
  body('Analyst handling time on standard cases dropped 60%. The queue was cleared within a quarter. The 90-day accuracy data also gave us the evidence to propose expanding the AI scope to a second exception type in the follow-on phase.'),
  tip('You\u2019ll notice the parallel to HireFlow: same philosophy. AI does the extraction and triage, human confirms before submission. Build trust through demonstrated accuracy before expanding automation. This is a product principle I apply consistently, not just a demo decision.'),
  divider()
);

// ──────────────────────────────────────────────────────────────────────────────
// STORY 3 — Internal tools for operational users
// ──────────────────────────────────────────────────────────────────────────────
children.push(...storyHeader(3,
  'Building Internal Tools Operational Teams Actually Use',
  'Tell me about a product you built that internal teams actually use.',
  'Internal tooling \u2022 User research \u2022 Adoption'
));
children.push(
  label('SITUATION'),
  body('At F45 Training, I was Product Operations Manager for a global franchise network of 1,700+ studios. One of the persistent problems: studio owners were making operational decisions \u2014 staffing, class scheduling, promotional spend \u2014 without reliable data. Corporate had data, but it lived in multiple systems and only surfaced in quarterly reports that were already 90 days stale by the time owners saw them.'),
  label('TASK'),
  body('Build an internal analytics platform that gave studio owners real-time visibility into their own performance metrics: attendance trends, membership churn, class fill rates, revenue per class.'),
  label('ACTION'),
  body('I started with a user research round. Interviewed 12 studio owners across three cohorts (new, mid-growth, established) to understand what decisions they were making, what information they wished they had, and critically \u2014 what format they would actually use. The finding: studio owners are on the gym floor all day, not at a desk. They check their phones between classes. The tool needed to be mobile-first and scannable in 30 seconds, not a desktop analytics dashboard.'),
  body('I wrote the requirements with that constraint as the design principle. Worked with the engineering team to build a responsive dashboard that led with three KPIs (today\u2019s attendance, this-week\u2019s churn alerts, this-month\u2019s revenue vs. target). Detailed drill-downs existed but weren\u2019t the entry point. Launch was a phased rollout to 50 studios with a feedback loop before full network release.'),
  label('RESULT'),
  body('Within 6 months, 78% of active studio owners were logging in at least weekly. Churn alerts \u2014 which flagged members whose attendance had dropped below a threshold \u2014 were credited by several studio owners with saving memberships they would otherwise have lost. The corporate operations team also adopted the platform for their own studio health monitoring.'),
  tip('Frame the "what makes internal tools succeed" principle: user research before wireframes, not after. And design for how users actually work, not how you wish they worked.'),
  divider()
);

// ──────────────────────────────────────────────────────────────────────────────
// STORY 4 — Cross-functional collaboration under deadline
// ──────────────────────────────────────────────────────────────────────────────
children.push(...storyHeader(4,
  'Cross-Functional Collaboration Under a Deadline',
  'Tell me about working with engineers when priorities were competing.',
  'Cross-functional leadership \u2022 Trade-off navigation \u2022 Delivery'
));
children.push(
  label('SITUATION'),
  body('At F45, we were mid-sprint on a major platform update \u2014 a new class booking flow that a significant portion of our member base used daily. Three weeks before go-live, corporate announced an all-hands initiative: we had to ship a promotional campaign feature for a global activation event happening in 6 weeks. Two different engineering sub-teams, both at capacity, both needing product resources.'),
  label('TASK'),
  body('Navigate the competing priorities without blowing up either delivery. I was the product owner for both workstreams.'),
  label('ACTION'),
  body('First move: a joint prioritization session with both engineering leads, the UX designer, and the marketing stakeholder driving the campaign feature. I laid out both timelines on a whiteboard and asked everyone to surface dependencies before I tried to solve anything.'),
  body('What emerged: the campaign feature had one hard dependency \u2014 an email trigger tied to member action. The rest of the feature could ship in a v1.5 after the event. The booking flow had one regression risk: a shared component that both teams were touching. By explicitly surfacing those two constraints, the path became clear: freeze the shared component for two weeks (booking team completes their work), campaign team builds around it, then shared component opens up again.'),
  body('I wrote up the decision and got written sign-off from both engineering leads and the marketing stakeholder before proceeding. That documentation was important \u2014 when scope pressure came from marketing in week 4, I could point to the agreed scope from week 1.'),
  label('RESULT'),
  body('Booking flow shipped on schedule. Campaign feature shipped with its core functionality in time for the global activation. The v1.5 features shipped three weeks post-event as planned. No team had to crunch.'),
  tip('The key point: I didn\u2019t "prioritize" by choosing sides. I facilitated the conversation that surfaced the real constraints, then found the path that served both teams. That\u2019s the product owner\u2019s job.'),
  divider()
);

// ──────────────────────────────────────────────────────────────────────────────
// STORY 5 — KPIs and data-driven decisions
// ──────────────────────────────────────────────────────────────────────────────
children.push(...storyHeader(5,
  'KPIs, Metrics, and Data-Driven Decisions',
  'How do you define and measure whether a product is working?',
  'Metrics \u2022 Data literacy \u2022 Product judgment'
));
children.push(
  label('SITUATION'),
  body('At F45, six months after we launched the studio analytics platform, there was internal debate about whether it was actually driving behavior change or just being used as a vanity dashboard. Leadership wanted to know if we should invest in expanding it.'),
  label('TASK'),
  body('Build the measurement framework that could answer that question honestly \u2014 not just "are people logging in" but "is it changing what they do?"'),
  label('ACTION'),
  body('I defined three metric tiers. Engagement metrics: weekly active users, session depth (did they click past the top-line KPIs), and feature adoption by metric type. These told us if people were using it.'),
  body('Behavior metrics: did studio owners who used the churn alert feature (attendance drop alerts) have lower churn rates than those who didn\u2019t? Did studios that checked class fill rates weekly have higher fill rate trends? This required a cohort analysis \u2014 heavy users vs. light users vs. non-users \u2014 that our data team ran over 90 days.'),
  body('Business outcome metrics: retention rate, revenue per studio, membership growth. The lagging indicators that would only move if the behavior metrics were moving in the right direction.'),
  body('The 90-day cohort data showed: studios where the owner was logging in 3+ times per week had 12% lower member churn than studios where the owner was a non-user. That correlation wasn\u2019t causal proof, but it was strong enough signal that we presented it to leadership as evidence of impact.'),
  label('RESULT'),
  body('Leadership approved a Phase 2 investment to add predictive churn modeling (flagging members at-risk before they churned, not after). That feature was directionally validated by the Phase 1 data.'),
  tip('The principle to articulate: good metrics have three layers. Are people using it (engagement)? Is it changing behavior (leading indicators)? Is the business better off (outcomes)? If engagement is high but behavior isn\u2019t changing, you have a nice dashboard, not a product.'),
  divider()
);

// ──────────────────────────────────────────────────────────────────────────────
// STORY 6 — Prioritization under constraints
// ──────────────────────────────────────────────────────────────────────────────
children.push(...storyHeader(6,
  'Prioritization Under Constraints',
  'Tell me about a time you had to say no to a stakeholder request.',
  'Prioritization \u2022 Stakeholder management \u2022 Strategic clarity'
));
children.push(
  label('SITUATION'),
  body('At F45, during a period of aggressive global expansion, the franchise development team came to me with a request: build a "franchise prospectus" feature in the studio platform \u2014 a module that would let corporate generate PDF prospectus documents for potential new franchise owners, pulling live performance data from existing studios.'),
  body('The request came in Q3, when my team was mid-sprint on the member-facing app refresh that had been on the roadmap for 18 months and was tied to a marketing campaign launch.'),
  label('TASK'),
  body('Decide how to handle this request without derailing the active roadmap and without dismissing a legitimate business need from a senior stakeholder.'),
  label('ACTION'),
  body('I took the meeting seriously, not defensively. I asked the franchise development lead to walk me through the use case in detail: how many prospectus documents did they generate per month, what was the current process, and what specifically about the current process was broken.'),
  body('Turns out: they were generating about 8-10 documents per month, each taking 2-3 hours of manual data compilation from separate reports. Real pain. But the solution they requested (a full platform feature) was significantly heavier than the problem warranted.'),
  body('I proposed an alternative: a lightweight data export template that could pull the relevant studio metrics into a structured CSV, which they could plug into their existing prospectus template with a 20-minute integration. I could build that as a 2-day side project without touching the main roadmap. The full feature could go on the backlog for Q1 when capacity was available.'),
  label('RESULT'),
  body('The franchise development team got a working solution in 2 days. The member app shipped on schedule. The full feature made it to Q1 of the following year, with much better-defined requirements because the interim solution had helped them understand exactly what they actually needed from the platform version.'),
  tip('"Saying no" isn\u2019t the right frame. The better frame is: I\u2019m the product owner, which means I\u2019m responsible for the roadmap AND for helping stakeholders solve their problems. The job is to find the right solution at the right time, not to gate-keep.'),
  divider()
);

// ──────────────────────────────────────────────────────────────────────────────
// STORY 7 — Learning from failure
// ──────────────────────────────────────────────────────────────────────────────
children.push(...storyHeader(7,
  'Learning from Failure / What I\'d Do Differently',
  'Tell me about a product decision you\'d make differently in hindsight.',
  'Self-awareness \u2022 Growth mindset \u2022 Intellectual honesty'
));
children.push(
  label('SITUATION'),
  body('At F45, early in my tenure, I led the requirements and rollout for a new class scheduling tool for studio owners. It was a significant platform improvement \u2014 more flexibility, better conflict detection, cleaner UI. Engineering built it well. We shipped it on time.'),
  label('TASK / THE MISTAKE'),
  body('I did not do enough user testing before the rollout. I had done the discovery interviews, written thorough requirements, and reviewed wireframes. What I skipped: a structured UAT (user acceptance testing) round with actual studio owners in a staging environment before go-live.'),
  body('My reasoning at the time: the old system was genuinely broken and owners were frustrated with it. Speed felt justified. I was confident in the requirements.'),
  label('WHAT HAPPENED'),
  body('Two days after rollout, we started getting support tickets. The new tool had a workflow change \u2014 one that was technically correct and cleaner by design \u2014 that broke a habitual process a large segment of owners had developed with the old system. They\u2019d built their Monday morning routine around a specific sequence of clicks, and the new tool changed that sequence. Not wrong, just different. But "different" for operational users who\u2019ve built habits is a real cost.'),
  body('We spent two weeks on an emergency patch, a support escalation campaign, and a communication effort explaining the workflow change. It was avoidable.'),
  label('WHAT I LEARNED'),
  body('Speed of delivery is not the same as speed of value. A two-week UAT round with 10 studio owners in staging would have caught the workflow issue before go-live. The two weeks we spent on incident response was the same cost, but with significantly more user pain and trust damage.'),
  body('Since then, I\u2019ve built UAT as a non-negotiable into every roadmap I own. For HireFlow, I tested the review workflow with the sample packets specifically to catch workflow assumptions before presenting it. That habit comes directly from this experience.'),
  tip('Be honest and specific about the mistake. Don\u2019t hedge. The best "what I\u2019d do differently" answers own the error clearly and show the specific behavioral change that resulted. That\u2019s what makes it credible.')
);

// Closing cheat sheet
children.push(
  pageBreak(),
  new Paragraph({
    spacing: { before: 480, after: 240 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Story Quick-Reference', bold: true, size: 36, font: 'Arial', color: '1F3864' })]
  }),
  new Paragraph({
    spacing: { before: 0, after: 360 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Scan this before the interview to prime each story in memory', size: 20, font: 'Arial', color: '595959', italics: true })]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [480, 2400, 3000, 3480],
    rows: [
      new TableRow({
        children: [
          ['#', 'Story', 'Source', 'Competency'].map((h, i) => new TableCell({
            width: { size: [480, 2400, 3000, 3480][i], type: WidthType.DXA },
            shading: { fill: '1F3864', type: ShadingType.CLEAR },
            borders: { top: { style: BorderStyle.SINGLE, size: 1, color: '1F3864' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: '1F3864' }, left: { style: BorderStyle.SINGLE, size: 1, color: '1F3864' }, right: { style: BorderStyle.SINGLE, size: 1, color: '1F3864' } },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: 'Arial', color: 'FFFFFF' })] })]
          }))
        ]
      }),
      ...[
        ['1', 'Discovery \u2192 Requirements', 'Sendero \u2014 financial services ops reporting', 'Discovery, ambiguity handling'],
        ['2', 'AI/Automation Product', 'Sendero \u2014 IBM watsonx insurance exceptions', 'AI judgment, business impact'],
        ['3', 'Internal Tools Adoption', 'F45 \u2014 studio analytics platform', 'Operational tooling, user research'],
        ['4', 'Cross-Functional Deadline', 'F45 \u2014 competing sprint priorities', 'Collaboration, trade-offs'],
        ['5', 'KPIs & Metrics', 'F45 \u2014 analytics platform measurement', 'Data literacy, outcome metrics'],
        ['6', 'Prioritization / Saying No', 'F45 \u2014 franchise prospectus request', 'Stakeholder management'],
        ['7', 'Learning from Failure', 'F45 \u2014 scheduling tool rollout', 'Self-awareness, growth mindset'],
      ].map(([num, story, source, comp], i) =>
        new TableRow({
          children: [
            [num, story, source, comp].map((val, j) => new TableCell({
              width: { size: [480, 2400, 3000, 3480][j], type: WidthType.DXA },
              shading: { fill: i % 2 === 0 ? 'EBF3FB' : 'FFFFFF', type: ShadingType.CLEAR },
              borders: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: val, size: 18, font: 'Arial' })] })]
            }))
          ]
        })
      )
    ]
  }),
  new Paragraph({ spacing: { before: 360, after: 80 }, children: [new TextRun({ text: 'Universal closing line for behavioral questions:', bold: true, size: 22, font: 'Arial', color: '1F3864' })] }),
  new Paragraph({
    spacing: { before: 80, after: 80 },
    shading: { fill: 'E2EFDA', type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 16, color: '375623', space: 8 } },
    indent: { left: 240 },
    children: [new TextRun({ text: '"That experience is part of why I\u2019m here. I want to be in a product role where I can apply what I learned in consulting \u2014 the discovery discipline, the cross-functional work, the AI implementation experience \u2014 to a single product that I can own from prototype to production. HireFlow is the prototype. This role is the production version."', size: 22, font: 'Arial', italics: true, color: '375623' })]
  })
);

// ── BUILD ─────────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'numbers',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 20 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: 'Arial', color: '1F3864' }, paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } }
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'HireFlow Interview Prep \u2014 Behavioral Story Bank \u00B7 Devan Capps \u00B7 Page ', size: 16, font: 'Arial', color: '767676' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Arial', color: '767676' }),
          ]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/Users/devancapps/hireflow/Behavioral-Story-Bank.docx', buf);
  console.log('Done: Behavioral-Story-Bank.docx');
});
