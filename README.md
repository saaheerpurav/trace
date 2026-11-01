# Trace

Trace is a full-stack hackathon prototype for AI-assisted pre-dispatch appliance diagnosis. It turns a serial-number product lookup and customer evidence into a technician-ready Freshworks job before a technician travels.

See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for the product overview, current implementation boundaries, and proposed academic extensions. The broader platform specification describes intended capabilities, not a list of verified live integrations.

## Run locally

```bash
npm install
npm run dev
```

This starts the React client on `http://localhost:5173` and the Express API on `http://127.0.0.1:8787`. For the intended demo flow:

1. In **Customer**, enter the demo serial `DEMO-WASHER-01` and continue.
2. Provide two voice responses and upload any image as the filter-area evidence.
3. Submit the evidence. The customer stays in **Customer** while Trace visibly prepares the request, creates the Freshdesk ticket, and prepares the WhatsApp update.
4. Manually switch to **Technician**, start the prepared job, watch the guided inspection advance, and complete it. A live Freshdesk ticket is resolved when the technician completes the job.

## Integration boundaries

The Express API owns case state and exposes working endpoints for intake, diagnosis, dispatch, export, and messaging. Copy `.env.example` to `.env` or provide the variables through your host environment to enable live adapters without embedding secrets:

- Freshworks Agent Studio and Freshdesk for orchestration and case state
- Microsoft Foundry Voice Live and real-time text-to-speech avatar for guided intake (UI adapter prepared; credentials required for live WebRTC)
- Twilio Programmable Messaging for WhatsApp notifications (automatically sends live when the four Twilio variables are configured)
- Inventory, warranty, scheduling, and service-knowledge tools through MCP

Without credentials, WhatsApp runs in an explicitly labelled local simulation so the complete demo remains repeatable.

### Freshworks setup

Create a `.env` file from `.env.example` and set:

```text
FRESHWORKS_DOMAIN=your-domain.freshdesk.com
FRESHWORKS_API_KEY=your-api-key
FRESHWORKS_REQUESTER_EMAIL=demo-customer@example.com
```

Restart `npm run dev`. **Create Freshdesk ticket** will then call `POST /api/v2/tickets`, display the real ticket number returned by Freshdesk, and link to that ticket. If these values are absent, the UI explicitly reports that the job remained local.

## API

- `GET /api/case` — current shared case state
- `POST /api/products/resolve` — look up a product by serial number
- `POST /api/intake/advance` — persist customer evidence
- `POST /api/diagnose` — run the diagnostic workflow
- `POST /api/dispatch` — confirm technician dispatch
- `POST /api/messages/whatsapp` — send through Twilio or the demo adapter
- `GET /api/job/export` — download the technician brief
- `POST /api/case/reset` — restore the demo case
