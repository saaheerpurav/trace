# Trace: AI-Assisted Appliance Service

## Overview

Trace connects customer intake, service-request preparation, technician inspection, and case resolution in one shared workflow. Its intended value is to give technicians better context before they visit, rather than starting every repair from an incomplete complaint.

The current repository is a hackathon prototype centred on a washing-machine service scenario. The wider platform described in `TRACE_PLATFORM.md` is a product direction, not a claim that every proposed agent and integration is implemented.

## The Problem

A complaint such as "the machine is not working" does not establish which product is affected, what symptoms were observed, or what the technician should inspect. Incomplete information can lead to additional diagnostic effort and repeat visits.

Trace aims to collect useful evidence before dispatch and carry that context into the technician's work. Reduced repeat visits and faster repairs are intended benefits, not measured outcomes in this repository.

## User Journey

1. A customer identifies the product using its serial number. The documented demonstration uses `DEMO-WASHER-01`.
2. Guided intake collects spoken responses and an uploaded photograph.
3. Trace prepares a service brief from the collected evidence.
4. A configured Freshdesk adapter can create an external ticket and return its identifier/link.
5. A configured Twilio adapter can send a WhatsApp update; without configuration, messaging uses an explicitly labelled simulation.
6. The technician opens the prepared job, follows the inspection experience, and records completion.
7. For a live Freshdesk job, the completion flow can add a note and resolve the ticket.

The customer and technician views share case state. The product is more than a chat interface: it carries information into a service workflow and has adapters for external actions.

## Current Implementation

| Area | What the repository contains |
| --- | --- |
| Interface | React/Vite customer and technician experiences, service progress, evidence collection, and job presentation. |
| Backend | Express endpoints for product lookup, intake, diagnosis progression, service jobs, completion, messaging, and brief export. |
| Model-backed intake | An OpenAI call selects a follow-up question from allowed options using a structured JSON schema. Requires configuration. |
| Voice | An OpenAI speech-generation API path and bundled audio assets. |
| Diagnosis | A bounded demonstration implementation with keyword-derived observations and a largely predetermined drain-blockage result. |
| Agent progression | A fixed list of preparation stages, not an independently planning multi-agent system. |
| Images | Customer image evidence is collected; the diagnosis path records its availability rather than establishing a visual diagnosis. |
| Freshdesk | API code paths for ticket creation and completion updates when configured. |
| WhatsApp | Twilio delivery when configured, otherwise a labelled local simulation. |
| Persistence | A single in-memory active case in the Express process, not durable multi-tenant storage. |
| Deployment | Vercel API adapter and frontend configuration. Deployment configuration alone does not establish production readiness. |

The integration descriptions above reflect inspected code paths. Live credentials and third-party operations were not verified as part of this summary.

## Intended Agentic Development

The stronger product would make evidence determine the next investigation:

- Retrieve relevant product-manual passages and cite them in inspection guidance.
- Extract symptoms and inspect images rather than only noting that an upload exists.
- Maintain competing fault hypotheses instead of returning the same likely fault for most inputs.
- Select a follow-up question or diagnostic check that distinguishes those hypotheses.
- Revise the inspection plan when a technician reports a new finding.
- Use authorised tools for service records, parts checks, and customer communication.
- Stop or escalate when evidence is insufficient, contradictory, or outside the supported scope.
- Verify completion through appropriate evidence instead of treating a generated answer as a repair.

These are proposed improvements, not descriptions of the current fixed diagnosis path. One well-designed tool-using agent is sufficient; the number of named agents is not an achievement by itself.

## Fit for the Semester VI AI Project

The supplied course guidelines call for a meaningful system combining agentic behaviour, prompt engineering, workflow automation, generative AI, and evaluation. Trace provides a relevant foundation:

- Agentic AI: evidence-driven follow-up selection and, after extension, adaptive diagnosis and tool use.
- Prompt engineering: constrained outputs, symptom extraction, retrieved context, abstention, and comparative prompt tests.
- Workflow automation: intake, service-ticket preparation, notifications, technician handoff, and completion.
- Generative AI: customer-language interpretation, service summaries, and proposed multimodal evidence analysis.

The main academic work should strengthen the decision loop and evaluate it, rather than merely add more interfaces or integrations. Confirm that extending an existing hackathon project is permitted by the faculty.

## Suggested Evaluation

Create a labelled set of supported service cases containing multiple faults, incomplete evidence, contradictory reports, and cases requiring professional escalation.

Compare basic prompting, structured prompting, and retrieval-grounded tool-assisted workflows. Measure diagnosis correctness, unnecessary follow-up questions, unsupported claims, correct escalation, and end-to-end workflow completion. Include external-tool failures and duplicate submissions in workflow tests.

No test suite or evaluation results are supplied by this summary. Do not report real-world first-time-fix improvements without corresponding field evidence.

## Technology and Setup

- React, Vite, and JavaScript for the frontend.
- Node.js and Express for the API.
- OpenAI API paths for constrained intake and speech generation.
- Freshdesk and Twilio API adapters.
- QR assets and downloadable technician briefs.

Install dependencies with `npm install` and start the client/API using `npm run dev`. The documented development addresses are `http://localhost:5173` and `http://127.0.0.1:8787`. Build the frontend with `npm run build`.

Use `.env.example` to identify configuration variables. Keep real credentials in local environment configuration, never in committed source. Voice intake requires an OpenAI key; Freshdesk and WhatsApp require their own configured accounts. Do not assume every live feature works without credentials.

## Scope and Safety Boundaries

- The current demonstrated product is a washing-machine service workflow, not universal appliance diagnosis.
- Freshworks Agent Studio, Freshservice, MCP inventory/warranty/scheduling, Foundry avatar, payments, and learning agents appear in the broader plan but should not be presented as verified implementations based on that document alone.
- Do not use this prototype as authoritative guidance for hazardous appliance repairs. Customer instructions need suitable safety restrictions and technician escalation.
- Real customer photographs, contact details, and service records require consent, access control, retention rules, and appropriate handling.
- In-memory single-case state must be replaced before independent real users share a deployment.
- Human confirmation should govern sensitive actions and repair completion. Model confidence is not a safety guarantee.
- Keep simulated outcomes visibly distinct from external API results.

## Related Documents

- `README.md`: local startup and documented demonstration flow.
- `TRACE_PLATFORM.md`: broader platform vision and proposed integrations.
- `DEMO_POSITIONING.md`: presentation narrative, not an implementation checklist.
- `VIDEO_SCRIPT.md`: demonstration/pitch script.

For an accurate description of the current code versus planned functionality, use the implementation boundaries in this summary alongside the source.
