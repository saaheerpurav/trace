import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 8787);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
app.use(express.json({ limit: "5mb" }));
const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const questionLibrary = {
  welcome: {
    text: "Hi Maya. What is your washer doing?",
    audio: "/audio/trace-welcome.mp3",
  },
  error_code: {
    text: "Are you seeing any error codes on the display?",
    audio: "/audio/trace-error-code.mp3",
  },
  water_remaining: {
    text: "Is there water left inside the drum?",
    audio: "/audio/trace-water-remaining.mp3",
  },
  unusual_sound: {
    text: "Do you hear any unusual humming or grinding sounds?",
    audio: "/audio/trace-unusual-sound.mp3",
  },
  upload_photo: {
    text: "Please upload a clear photo of the lower drain filter area.",
    audio: "/audio/trace-upload-photo.mp3",
  },
  ready: {
    text: "Thank you. I have enough information to prepare your service request.",
    audio: "/audio/trace-ready.mp3",
  },
};

const baseCase = () => ({
  status: "product_required",
  productVerified: false,
  intakeStep: 0,
  product: { name: "Washing machine" },
  customer: {
    name: "Maya",
    phone: process.env.DEMO_WHATSAPP_TO || "+91 98••• ••210",
  },
  evidence: [],
  conversation: {
    currentPrompt: questionLibrary.welcome.text,
    currentAudio: questionLibrary.welcome.audio,
    source: "openai",
    history: [{ role: "assistant", content: questionLibrary.welcome.text }],
  },
  agents: [],
  diagnosis: null,
  dispatch: null,
  serviceJob: null,
  technicianJob: null,
  message: null,
});
let activeCase = baseCase();

const agentResults = [
  ["Customer answers", "Customer symptoms reviewed"],
  ["Technician instructions", "Inspection sequence prepared"],
  ["Service request", "Request details prepared"],
];

const completeDiagnosis = () => {
  const evidenceText = activeCase.evidence
    .filter((item) => !item.skipped)
    .map((item) => item.value)
    .join(" ")
    .toLowerCase();
  const observations = [];
  if (/water|drain/.test(evidenceText))
    observations.push("Customer reports water remaining or a drain problem");
  if (/humm?ing|buzz|noise|sound/.test(evidenceText))
    observations.push("An unusual sound was reported during the drain cycle");
  const errorCode = activeCase.evidence.find(
    (item) => item.type === "error_code" && !item.skipped,
  );
  if (errorCode) observations.push(`Display response: ${errorCode.value}`);
  if (activeCase.evidence.some((item) => item.type === "image" && !item.skipped))
    observations.push("A filter-area photo is available for inspection");
  activeCase.diagnosis = {
    fault: activeCase.evidence.some((item) => !item.skipped)
      ? "Likely drain blockage"
      : "Inspection required",
    evidence: activeCase.evidence
      .filter((item) => !item.skipped)
      .map((item) => item.value),
    observations:
      observations.length > 0
        ? observations
        : ["Customer evidence requires an on-site inspection"],
    serviceGuidance:
      "For standing water or drain noise, inspect the filter and drain path before testing the pump.",
  };
  activeCase.dispatch = { technician: null, slot: null, confirmed: false };
  activeCase.status = "repair_ready";
};

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "trace-api" }),
);
app.get("/api/case", (_req, res) => res.json(activeCase));
app.post("/api/case/reset", (_req, res) => {
  activeCase = baseCase();
  res.json(activeCase);
});

app.post("/api/products/resolve", async (req, res) => {
  const serial = String(req.body?.serial || "")
    .trim()
    .toUpperCase();
  if (!serial) return res.status(400).json({ error: "Enter a serial number" });
  if (activeCase.productVerified && activeCase.product.serial === serial)
    return res.json(activeCase);
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (serial !== "DEMO-WASHER-01")
    return res
      .status(404)
      .json({
        error: "Serial number not found. Use DEMO-WASHER-01 for this demo.",
      });
  activeCase.productVerified = true;
  activeCase.status = "intake";
  activeCase.product.serial = serial;
  res.json(activeCase);
});

app.post("/api/intake/advance", (req, res) => {
  if (!activeCase.productVerified)
    return res
      .status(409)
      .json({ error: "Enter the product serial number first" });
  const steps = [
    { type: "voice", value: req.body?.value || "Voice response recorded" },
    {
      type: "error_code",
      value: req.body?.value || "Error-code response recorded",
    },
    {
      type: "image",
      value: req.body?.fileName || "Image uploaded",
      imageUrl: req.body?.imageData || null,
    },
  ];
  const item = steps[Math.min(activeCase.intakeStep, steps.length - 1)];
  if (!activeCase.evidence.some((e) => e.type === item.type))
    activeCase.evidence.push(item);
  activeCase.intakeStep = Math.min(3, activeCase.intakeStep + 1);
  if (activeCase.intakeStep === 3) {
    activeCase.status = "ready_to_diagnose";
    activeCase.conversation.currentPrompt = questionLibrary.ready.text;
    activeCase.conversation.currentAudio = questionLibrary.ready.audio;
    activeCase.conversation.history.push({
      role: "assistant",
      content: activeCase.conversation.currentPrompt,
    });
  }
  res.json(activeCase);
});

app.post("/api/intake/skip", (req, res) => {
  if (!activeCase.productVerified)
    return res
      .status(409)
      .json({ error: "Enter the product serial number first" });
  const types = ["voice", "error_code", "image"];
  const type = types[Math.min(activeCase.intakeStep, types.length - 1)];
  if (!activeCase.evidence.some((e) => e.type === type))
    activeCase.evidence.push({
      type,
      value: "Skipped for demo",
      skipped: true,
    });
  activeCase.intakeStep = Math.min(3, activeCase.intakeStep + 1);
  if (activeCase.intakeStep === 1) {
    activeCase.conversation.currentPrompt = questionLibrary.error_code.text;
    activeCase.conversation.currentAudio = questionLibrary.error_code.audio;
    activeCase.conversation.history.push({
      role: "assistant",
      content: activeCase.conversation.currentPrompt,
    });
  }
  if (activeCase.intakeStep === 2) {
    activeCase.conversation.currentPrompt = questionLibrary.upload_photo.text;
    activeCase.conversation.currentAudio = questionLibrary.upload_photo.audio;
    activeCase.conversation.history.push({
      role: "assistant",
      content: activeCase.conversation.currentPrompt,
    });
  }
  if (activeCase.intakeStep === 3) {
    activeCase.status = "ready_to_diagnose";
    activeCase.conversation.currentPrompt = questionLibrary.ready.text;
    activeCase.conversation.currentAudio = questionLibrary.ready.audio;
    activeCase.conversation.history.push({
      role: "assistant",
      content: activeCase.conversation.currentPrompt,
    });
  }
  res.json(activeCase);
});

app.post("/api/ai/respond", async (req, res) => {
  if (!activeCase.productVerified)
    return res
      .status(409)
      .json({ error: "Enter the product serial number first" });
  if (activeCase.intakeStep > 1)
    return res.status(409).json({ error: "Voice intake is already complete" });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    return res.status(503).json({ error: "OpenAI is not configured" });
  const userText = String(req.body?.text || "").trim();
  if (!userText)
    return res.status(400).json({ error: "No speech was captured" });
  const stage = activeCase.intakeStep;
  let allowedQuestionIds =
    stage === 0
      ? ["error_code", "water_remaining", "unusual_sound"]
      : ["upload_photo"];
  if (stage === 0) {
    if (/\b(error|code|e\d{1,3})\b/i.test(userText))
      allowedQuestionIds = allowedQuestionIds.filter(
        (id) => id !== "error_code",
      );
    if (/\b(water|drum|inside|standing)\b/i.test(userText))
      allowedQuestionIds = allowedQuestionIds.filter(
        (id) => id !== "water_remaining",
      );
    if (/\b(sound|noise|humm?ing|grind|rattle|buzz)\b/i.test(userText))
      allowedQuestionIds = allowedQuestionIds.filter(
        (id) => id !== "unusual_sound",
      );
    if (allowedQuestionIds.length === 0) allowedQuestionIds = ["error_code"];
  }
  const instructions =
    stage === 0
      ? "You are Trace, an appliance-support intake agent. Select the single most useful missing follow-up. Do not ask for information the customer already provided."
      : "You are Trace, an appliance-support intake agent. The next required intake action is a drain-filter photo.";
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CONVERSATION_MODEL || "gpt-4o-mini",
        instructions,
        input: [
          ...activeCase.conversation.history,
          { role: "user", content: userText },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "next_intake_question",
            strict: true,
            schema: {
              type: "object",
              properties: {
                questionId: { type: "string", enum: allowedQuestionIds },
              },
              required: ["questionId"],
              additionalProperties: false,
            },
          },
        },
        max_output_tokens: 80,
        store: false,
      }),
    });
    if (!response.ok)
      return res
        .status(502)
        .json({ error: "OpenAI conversation request failed" });
    const result = await response.json();
    const outputText = result.output
      ?.flatMap((item) => item.content || [])
      .find((item) => item.type === "output_text")
      ?.text?.trim();
    const questionId = outputText
      ? JSON.parse(outputText).questionId
      : undefined;
    const selectedQuestion = questionLibrary[questionId];
    if (!selectedQuestion)
      return res
        .status(502)
        .json({ error: "OpenAI returned no conversation response" });
    const evidenceType = stage === 0 ? "voice" : "error_code";
    if (!activeCase.evidence.some((item) => item.type === evidenceType))
      activeCase.evidence.push({ type: evidenceType, value: userText });
    activeCase.intakeStep = stage + 1;
    activeCase.conversation.history.push(
      { role: "user", content: userText },
      { role: "assistant", content: selectedQuestion.text },
    );
    activeCase.conversation.currentPrompt = selectedQuestion.text;
    activeCase.conversation.currentAudio = selectedQuestion.audio;
    activeCase.conversation.source = "openai";
    res.json(activeCase);
  } catch {
    res.status(502).json({ error: "Could not reach OpenAI" });
  }
});

app.post("/api/ai/speech", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    return res.status(503).json({ error: "OpenAI is not configured" });
  const input = String(req.body?.text || "")
    .trim()
    .slice(0, 500);
  if (!input) return res.status(400).json({ error: "No speech text provided" });
  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
        voice: "coral",
        input,
        instructions:
          "Speak warmly and clearly as an Indian customer-support assistant. Use a calm, helpful pace.",
      }),
    });
    if (!response.ok)
      return res.status(502).json({ error: "OpenAI speech request failed" });
    res.type("audio/mpeg").send(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.status(502).json({ error: "Could not reach OpenAI speech" });
  }
});

app.post("/api/diagnose", async (_req, res) => {
  if (activeCase.intakeStep < 3)
    return res.status(409).json({ error: "Complete intake first" });
  activeCase.status = "diagnosing";
  activeCase.agents = agentResults.map(([name, result], index) => ({
    name,
    result,
    order: index + 1,
  }));
  completeDiagnosis();
  res.json(activeCase);
});

app.post("/api/diagnose/start", (_req, res) => {
  if (activeCase.intakeStep < 3)
    return res.status(409).json({ error: "Complete intake first" });
  activeCase.status = "diagnosing";
  activeCase.agents = [];
  activeCase.diagnosis = null;
  activeCase.dispatch = null;
  res.json(activeCase);
});

app.post("/api/diagnose/next", async (_req, res) => {
  if (activeCase.status !== "diagnosing")
    return res.status(409).json({ error: "Diagnosis is not running" });
  await new Promise((resolve) => setTimeout(resolve, 650));
  const index = activeCase.agents.length;
  if (index < agentResults.length) {
    const [name, result] = agentResults[index];
    activeCase.agents.push({ name, result, order: index + 1 });
  }
  if (activeCase.agents.length === agentResults.length) completeDiagnosis();
  res.json(activeCase);
});

app.post("/api/dispatch", async (_req, res) => {
  if (!activeCase.dispatch)
    return res.status(409).json({ error: "Run diagnosis first" });
  const domain = String(process.env.FRESHWORKS_DOMAIN || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const key = process.env.FRESHWORKS_API_KEY;
  const email = process.env.FRESHWORKS_REQUESTER_EMAIL;
  if (domain && key && email) {
    const description = `
      <h2>Service request</h2>
      <p><strong>Product:</strong> ${escapeHtml(activeCase.product.name)}</p>
      <p><strong>Possible issue:</strong> ${escapeHtml(activeCase.diagnosis.fault)}</p>
      <h3>Why Trace suggested this</h3>
      <ul>
        ${activeCase.diagnosis.observations
          .map((observation) => `<li>${escapeHtml(observation)}</li>`)
          .join("")}
      </ul>
      <h3>Customer inputs</h3>
      <ul>
        ${activeCase.evidence
          .map(
            (item) =>
              `<li><strong>${escapeHtml(item.type === "error_code" ? "Error code" : item.type === "image" ? "Photo" : "Voice report")}:</strong> ${escapeHtml(item.skipped ? "Skipped" : item.value)}</li>`,
          )
          .join("")}
      </ul>
      <h3>Service guidance</h3>
      <p>${escapeHtml(activeCase.diagnosis.serviceGuidance)}</p>
    `.trim();
    const response = await fetch(`https://${domain}/api/v2/tickets`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:X`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        subject: `Service request - ${activeCase.product.name}`,
        description,
        status: 2,
        priority: 1,
      }),
    });
    if (!response.ok)
      return res
        .status(502)
        .json({
          error: "Freshdesk ticket creation failed",
          detail: await response.text(),
        });
    const ticket = await response.json();
    activeCase.serviceJob = {
      provider: "freshdesk",
      id: ticket.id,
      url: `https://${domain}/a/tickets/${ticket.id}`,
      createdAt: new Date().toISOString(),
    };
  } else {
    activeCase.serviceJob = {
      provider: "local",
      createdAt: new Date().toISOString(),
    };
  }
  activeCase.status = "service_job_created";
  activeCase.dispatch.confirmed = true;
  activeCase.dispatch.technician = { name: "Arjun Mehta" };
  activeCase.technicianJob = { status: "ready", technician: "Arjun Mehta" };
  res.json(activeCase);
});

app.post("/api/technician/progress", async (req, res) => {
  if (!activeCase.technicianJob)
    return res.status(409).json({ error: "No technician job is available" });
  if (activeCase.technicianJob.status === "ready") {
    activeCase.technicianJob.status = "in_progress";
    return res.json(activeCase);
  }
  if (activeCase.technicianJob.status === "in_progress") {
    const allowedFindings = [
      "Blocked drain filter",
      "Drain hose obstruction",
      "Drain pump fault",
      "Different issue",
    ];
    const finding = String(req.body?.finding || "");
    if (!allowedFindings.includes(finding))
      return res.status(400).json({ error: "Select the confirmed finding" });
    const comparison =
      finding === "Blocked drain filter"
        ? "Trace assessment confirmed"
        : "Technician finding refined the assessment";
    if (activeCase.serviceJob?.provider === "freshdesk") {
      const domain = String(process.env.FRESHWORKS_DOMAIN || "")
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      const key = process.env.FRESHWORKS_API_KEY;
      const noteResponse = await fetch(
        `https://${domain}/api/v2/tickets/${activeCase.serviceJob.id}/notes`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${key}:X`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: `<h3>Technician confirmation</h3><p><strong>Confirmed finding:</strong> ${escapeHtml(finding)}</p><p>${escapeHtml(comparison)}</p>`,
            private: true,
          }),
        },
      );
      if (!noteResponse.ok)
        return res.status(502).json({
          error: "Freshdesk confirmation note failed",
          detail: await noteResponse.text(),
        });
      const response = await fetch(
        `https://${domain}/api/v2/tickets/${activeCase.serviceJob.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Basic ${Buffer.from(`${key}:X`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: 4 }),
        },
      );
      if (!response.ok)
        return res
          .status(502)
          .json({
            error: "Freshdesk ticket update failed",
            detail: await response.text(),
          });
    }
    activeCase.technicianJob.confirmedFinding = finding;
    activeCase.technicianJob.comparison = comparison;
    activeCase.technicianJob.status = "completed";
    activeCase.status = "completed";
  }
  res.json(activeCase);
});

app.post("/api/messages/whatsapp", async (req, res) => {
  if (!activeCase.dispatch)
    return res.status(409).json({ error: "No appointment to send" });
  const technician = activeCase.technicianJob?.technician || "Arjun Mehta";
  const ticket =
    activeCase.serviceJob?.provider === "freshdesk"
      ? `Freshdesk ticket #${activeCase.serviceJob.id}: ${activeCase.serviceJob.url}`
      : "Your service request has been recorded.";
  const body = `Your service request has been created. ${ticket} Technician ${technician} will visit. Appointment time will be shared shortly.`;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = req.body?.to || process.env.DEMO_WHATSAPP_TO;
  let delivery = "simulated";
  let messageId = `SM_DEMO_${Date.now()}`;
  if (sid && token && from && to) {
    const form = new URLSearchParams({
      From: `whatsapp:${from}`,
      To: `whatsapp:${to}`,
      Body: body,
    });
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form,
      },
    );
    if (!response.ok)
      return res
        .status(502)
        .json({
          error: "Twilio rejected the message",
          detail: await response.text(),
        });
    const sent = await response.json();
    delivery = "twilio";
    messageId = sent.sid;
  }
  activeCase.message = {
    id: messageId,
    delivery,
    body,
    sentAt: new Date().toISOString(),
  };
  res.json(activeCase.message);
});

app.get("/api/job/export", (_req, res) => {
  if (!activeCase.diagnosis) return res.status(404).send("No repair-ready job");
  const text = [
    "TRACE SERVICE BRIEF",
    "",
    activeCase.product.name,
    `Possible issue: ${activeCase.diagnosis.fault}`,
    "",
    "Suggested checks:",
    "1. Disconnect power and water",
    "2. Inspect the drain filter",
    "3. Inspect the pump only if required",
    "4. Confirm the fault before replacing any part",
    "5. Run a drain-cycle test",
  ].join("\n");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="trace-service-brief.txt"',
  );
  res.type("text/plain").send(text);
});

app.use(express.static(path.join(root, "dist")));
app.use((_req, res) => res.sendFile(path.join(root, "dist", "index.html")));

if (!process.env.VERCEL) {
  app.listen(port, "127.0.0.1", () =>
    console.log(`Trace API running at http://127.0.0.1:${port}`),
  );
}

export default app;
