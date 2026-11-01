# Trace

## Product Overview

Trace is an AI pre-dispatch diagnosis and first-time-fix platform for appliance and equipment manufacturers. It solves a specific and expensive problem: technicians are often dispatched before the exact fault, required expertise, tools, and replacement parts are known. This causes repeat visits, longer downtime, unnecessary travel, and avoidable warranty costs.

After a customer scans the QR code attached to a product, Trace combines the product identity, service history, manuals, error codes, warranty data, and customer-provided voice, image, or video evidence. A coordinated group of agents either resolves the issue remotely or creates a repair-ready Freshworks job containing the probable fault, required parts, safety instructions, warranty decision, and correctly matched technician.

## Core Problem

Traditional service systems are effective at recording tickets and scheduling technicians, but they usually begin with an incomplete complaint such as "the machine is not working." Support agents must manually identify the product, collect evidence, search manuals, check warranty rules, estimate the required parts, and decide which technician to send.

When this diagnosis is incomplete, the technician may arrive without the correct component, tools, expertise, or context. The customer then waits for another appointment while the manufacturer pays for another visit.

Trace focuses on improving four measurable outcomes:

- First-time-fix rate
- Remote resolution rate
- Mean time to repair
- Cost per service case

## Customer Experience

1. The customer scans the QR code attached to the appliance or equipment.
2. A mobile web experience opens without requiring an application download.
3. Trace retrieves the exact model, serial number, warranty, manuals, ownership, and previous service history.
4. The customer describes the fault using text, voice, images, or video.
5. A live female AI avatar asks targeted follow-up questions in the customer's preferred language.
6. Trace correlates the evidence with manuals, known failure patterns, error codes, and previous repairs.
7. Trace guides the customer through safe troubleshooting when remote resolution is possible.
8. If a visit is required, Trace creates a repair-ready Freshworks case instead of a generic ticket.
9. The customer receives the diagnosis, appointment, payment request when applicable, and live updates through WhatsApp.

## Repair-Ready Job

Every dispatched job contains:

- Verified product and customer identity
- Structured fault description and customer evidence
- Ranked probable causes with supporting sources
- Required replacement parts and current availability
- Required technician skills, tools, and safety instructions
- Warranty eligibility and estimated customer charge
- Recommended appointment based on technician and part availability
- Full record of agent decisions and actions

The system clearly separates confirmed information from predictions so technicians know what has been verified and what still requires inspection.

## Technician Experience

Technicians use a dedicated mobile application containing:

- Repair-ready jobs rather than unstructured complaints
- Product, customer, warranty, and service history
- QR scanning to confirm the correct product on arrival
- Probable faults and AI-guided diagnostic steps
- Relevant manuals, diagrams, and similar resolved cases
- Reserved parts and required tools
- Hands-free voice assistance during the repair
- Photo-based repair verification
- Customer signature and job completion workflow

The WhatsApp agent sends assignments and updates, answers operational questions, and allows technicians to report delays or request another part without leaving the conversation.

## Operations Command Center

The website is a visual command center for manufacturers and service operators. Its primary visualization follows every case from evidence collection to diagnosis, preparation, dispatch, and verified repair.

It displays:

- Cases moving through an animated diagnosis and dispatch graph
- Evidence and data used by each specialist agent
- Probable faults, confidence, and supporting sources
- Technician, skill, tool, and parts matching
- Remote resolutions and technician visits avoided
- First-time-fix rate and repeat-visit reduction
- Mean time to repair and service cost savings
- Failure clusters across product models and components
- Predicted spare-parts demand
- Agent decisions, actions, exceptions, and audit trails

Managers can open any case and see what each agent observed, why it made a decision, what action it executed, and whether the final repair confirmed the diagnosis.

## Agent System

Trace uses specialist agents coordinated through one shared case state:

- **Product Passport Agent:** Resolves the QR code to the exact product, ownership, warranty, and service history.
- **Evidence Agent:** Converts voice, images, video, and customer responses into structured symptoms and error signals.
- **Diagnostic Agent:** Ranks probable causes using manuals, known failures, and similar resolved cases.
- **Safety Agent:** Prevents unsafe troubleshooting instructions and identifies cases requiring immediate professional service.
- **Warranty Agent:** Determines coverage, exclusions, and customer charges using the applicable policy.
- **Parts Agent:** Predicts required components, checks inventory, and reserves likely parts.
- **Dispatch Agent:** Matches the job with a technician based on skills, location, availability, tools, and parts.
- **Payment Agent:** Creates and verifies out-of-warranty payment requests.
- **Communication Agent:** Coordinates the Microsoft Foundry real-time avatar, Twilio-powered WhatsApp conversations, reminders, and status updates.
- **Quality Agent:** Compares the predicted fault with repair evidence and verifies job completion.
- **Learning Agent:** Uses confirmed repair outcomes to improve future diagnosis and parts recommendations.

All agents use the same permissions, case state, provenance records, and audit trail. Irreversible or chargeable actions require explicit customer or operator confirmation.

## Freshworks and Sponsor Integration

Freshworks is the operational core rather than a superficial integration:

- **Freshdesk:** Stores customers, conversations, cases, service tasks, and resolution outcomes.
- **Freshservice:** Maintains product assets, QR-linked records, warranties, and associated service history.
- **Freshworks Agent Studio:** Orchestrates the specialist agents, tool calls, handoffs, and workflow actions.
- **Freshworks Developer Platform:** Hosts custom actions and connects Trace to enterprise systems.
- **MCP integrations:** Connect product knowledge, inventory, scheduling, messaging, and payment services.
- **Microsoft Foundry:** Powers the multilingual, real-time text-to-speech avatar and conversational voice experience through Voice Live.
- **Twilio:** Powers two-way WhatsApp messaging, media intake, appointment confirmations, and status notifications.
- **ElevenLabs:** Remains available for optional voice generation experiments and sponsor-track enhancements.
- **Dodo Payments:** Handles customer-approved out-of-warranty diagnosis and repair payments.

## Core Architecture

Every interface connects to the same orchestration layer and shared case state:

```text
Product QR / Mobile Web / Technician App / WhatsApp / AI Avatar
                              |
                       Trace Orchestrator
                              |
 Product | Evidence | Diagnosis | Safety | Warranty | Parts | Dispatch
                              |
 Freshdesk | Freshservice | Manuals | Inventory | Scheduling | Dodo
                              |
                 Shared Case State and Audit Trail
```

## Visual Demonstration

The central demo follows one malfunctioning appliance from an unclear complaint to a verified first-time repair:

1. Scan the product QR code and open its digital passport.
2. Describe the fault and upload a short image or video through the avatar experience.
3. Show evidence flowing into an animated multi-agent diagnosis graph.
4. Display probable causes being ranked against manuals and repair history.
5. Determine whether the issue can be resolved remotely.
6. When a visit is necessary, generate a repair-ready Freshworks case.
7. Verify warranty coverage, reserve the predicted part, and match the correct technician.
8. Generate a Dodo payment request when the repair is not covered.
9. Send appointment details through WhatsApp.
10. Let the technician scan the QR code, follow the prepared repair plan, and submit completion evidence.
11. Show the command center updating the confirmed diagnosis, first-time-fix result, avoided delay, and estimated savings.

## Differentiation

QR asset lookup, ticketing, and technician scheduling already exist. Trace does not position these capabilities as the innovation. Its core value is the intelligence before dispatch.

Trace transforms incomplete customer evidence into a repair-ready job before a technician travels. It connects multimodal diagnosis, product-specific knowledge, warranty reasoning, parts prediction, and skill-based dispatch in one agentic workflow. Existing service systems remain the system of record, while Trace makes each field visit substantially more likely to succeed the first time.

## One-Line Idea

Trace is an AI pre-dispatch diagnosis platform that converts a customer's product QR scan, voice description, and visual evidence into a repair-ready Freshworks job with the probable fault, required parts, warranty decision, and correctly matched technician, reducing repeat visits and increasing first-time-fix rates.
