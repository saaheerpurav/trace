import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Camera,
  Check,
  Download,
  MessageCircle,
  Mic,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import "./styles.css";
import "./scanner.css";
import "./readable.css";
import "./experience.css";
import "./command-center.css";
import "./perspectives.css";
import "./start.css";
import "./integrations.css";
import "./technician-evidence.css";
import "./voice.css";
import "./agentic.css";
import "./adaptive-inspection.css";
import "./flow-polish.css";

const api = async (url, options) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok)
    throw new Error(
      (await response.json().catch(() => ({}))).error || "Request failed",
    );
  return response.headers.get("content-type")?.includes("json")
    ? response.json()
    : response.text();
};

const voiceClips = [
  "/audio/trace-welcome.mp3",
  "/audio/trace-error-code.mp3",
  "/audio/trace-water-remaining.mp3",
  "/audio/trace-unusual-sound.mp3",
  "/audio/trace-upload-photo.mp3",
  "/audio/trace-ready.mp3",
];

function Brand() {
  return (
    <div className="brand">
      <div className="mark">
        <i />
        <i />
        <i />
      </div>
      <b>trace</b>
    </div>
  );
}

function AppHeader({ view, setView, reset, hasNewJob }) {
  return (
    <header className="app-header">
      <Brand />
      <nav className="view-switch" aria-label="Demo perspective">
        <button
          className={view === "customer" ? "active" : ""}
          onClick={() => setView("customer")}
        >
          <MessageCircle /> Customer
        </button>
        <button
          className={view === "technician" ? "active" : ""}
          onClick={() => setView("technician")}
        >
          <Wrench /> Technician
          {hasNewJob && <span className="new-job-badge">1 new job</span>}
        </button>
      </nav>
      <button className="ghost reset-demo" onClick={reset}>
        <RefreshCw /> Restart demo
      </button>
    </header>
  );
}

function ProductStrip({ data }) {
  return (
    <div className="product-strip">
      <div className="appliance">
        <Search />
      </div>
      <div>
        <b>{data.product.name}</b>
        <span>Serial number: {data.product.serial}</span>
      </div>
    </div>
  );
}

function CustomerStart({ onStart }) {
  return (
    <main className="customer-start">
      <section className="start-hero">
        <div className="start-copy">
          <span className="entry-kicker">AI-assisted appliance support</span>
          <h1>
            Get the right help
            <br />
            <em>before the visit.</em>
          </h1>
          <p>
            Identify your appliance, explain the problem, and send a
            technician-ready request.
          </p>
          <button className="primary" onClick={onStart}>
            Start customer intake <ArrowRight />
          </button>
        </div>
        <div className="start-visual" aria-hidden="true">
          <div className="start-orbit orbit-one" />
          <div className="start-orbit orbit-two" />
          <div className="start-core">
            <Sparkles />
          </div>
          <div className="start-step step-one">
            <span>1</span>
            <b>Find product</b>
          </div>
          <div className="start-step step-two">
            <span>2</span>
            <b>Share evidence</b>
          </div>
          <div className="start-step step-three">
            <Check />
            <b>Request ready</b>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductEntry({ resolveProduct, busy }) {
  const [serial, setSerial] = useState("DEMO-WASHER-01");
  return (
    <main className="lookup-page">
      <section className="lookup-card">
        <div className="lookup-symbol">
          <Search />
        </div>
        <span className="entry-kicker">Customer support</span>
        <h1>Find your product</h1>
        <p>Enter the serial number printed on the appliance.</p>
        <form
          className="serial-form"
          onSubmit={(event) => {
            event.preventDefault();
            resolveProduct(serial);
          }}
        >
          <label htmlFor="serial">Serial number</label>
          <div>
            <input
              id="serial"
              value={serial}
              onChange={(event) => setSerial(event.target.value)}
              autoComplete="off"
              autoFocus
            />
            <button
              className="primary"
              disabled={busy || !serial.trim()}
              type="submit"
            >
              {busy ? (
                <>
                  <RefreshCw className="spin" /> Finding product
                </>
              ) : (
                <>
                  Continue <ArrowRight />
                </>
              )}
            </button>
          </div>
          <small>Use DEMO-WASHER-01 for the demo</small>
        </form>
      </section>
    </main>
  );
}

function ProductReveal({ data, onContinue }) {
  return (
    <main className="reveal-page">
      <section className="product-reveal">
        <div className="reveal-copy">
          <div className="found-check">
            <Check />
          </div>
          <span className="entry-kicker">Product found</span>
          <h1>{data.product.name}</h1>
          <p>Serial number: {data.product.serial}</p>
          <button className="primary" onClick={onContinue}>
            Get help with this product <ArrowRight />
          </button>
        </div>
        <div className="reveal-visual">
          <div className="reveal-glow" />
          <img src="/washing-machine.png" alt="Front-loading washing machine" />
        </div>
      </section>
    </main>
  );
}

function EvidenceIntake({
  data,
  advance,
  respond,
  skipEvidence,
  submit,
  busy,
}) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);
  const initialSpeechPlayed = useRef(false);
  const step = data.intakeStep;
  const prompt =
    data.conversation?.currentPrompt || "Hi Maya. What is your washer doing?";
  const speak = async (audioPath) => {
    setSpeaking(true);
    try {
      audioRef.current?.pause();
      const audio = new Audio(audioPath);
      audioRef.current = audio;
      await new Promise((resolve, reject) => {
        audio.onended = resolve;
        audio.onerror = reject;
        audio.play().catch(reject);
      });
    } finally {
      setSpeaking(false);
    }
  };
  useEffect(() => {
    if (initialSpeechPlayed.current) return;
    initialSpeechPlayed.current = true;
    speak(data.conversation?.currentAudio || voiceClips[0]).catch(() => {});
  }, []);
  const answer = async (text) => {
    const next = await respond(text);
    if (next?.conversation?.currentAudio)
      speak(next.conversation.currentAudio).catch(() => {});
  };
  const skip = async () => {
    const next = await skipEvidence();
    if (next?.conversation?.currentAudio)
      speak(next.conversation.currentAudio).catch(() => {});
  };
  const listen = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onresult = (event) => answer(event.results[0][0].transcript);
      recognition.onerror = () => setListening(false);
      recognition.start();
    } else {
      setListening(true);
      setTimeout(() => {
        setListening(false);
        answer("The washer will not drain and is making a humming sound.");
      }, 700);
    }
  };
  const uploadPhoto = (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const next = await advance({
        fileName: file.name,
        imageData: reader.result,
      });
      if (next?.conversation?.currentAudio)
        speak(next.conversation.currentAudio).catch(() => {});
    };
    reader.readAsDataURL(file);
  };
  return (
    <main>
      <ProductStrip data={data} />
      <section className="intake-grid">
        <div className={`avatar-card ${speaking ? "speaking" : ""}`}>
          <div className="avatar-scene">
            <div className="halo" />
            <div className="person">
              <div className="hair" />
              <div className="face">
                <i />
                <i />
                <b />
              </div>
              <div className="body" />
            </div>
          </div>
          <div className="prompt" aria-live="polite">
            <h2>“{prompt}”</h2>
          </div>
          {step < 2 && (
            <div className="intake-actions">
              <button
                className={`mic ${listening ? "listening" : ""}`}
                disabled={busy || listening}
                onClick={listen}
              >
                <Mic />
                {listening
                  ? "Listening…"
                  : busy
                    ? "Thinking…"
                    : step === 0
                      ? "Answer by voice"
                      : "Answer follow-up"}
              </button>
              <button
                className="skip-step"
                disabled={busy || listening}
                onClick={skip}
              >
                Skip for demo <ArrowRight />
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="intake-actions">
              <label className="upload">
                <Camera /> Upload filter photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    event.target.files?.[0] &&
                    uploadPhoto(event.target.files[0])
                  }
                />
              </label>
              <button className="skip-step" disabled={busy} onClick={skip}>
                Skip for demo <ArrowRight />
              </button>
            </div>
          )}
          {step === 3 && (
            <button className="primary finish" disabled={busy} onClick={submit}>
              {busy ? (
                <>
                  <RefreshCw className="spin" /> Preparing request
                </>
              ) : (
                <>
                  Submit service request <ArrowRight />
                </>
              )}
            </button>
          )}
        </div>
        <div className="evidence-card">
          <h2>{step}/3 inputs completed</h2>
          {[
            ["Voice", "voice"],
            ["Error code", "error_code"],
            ["Photo", "image"],
          ].map(([name, type], index) => {
            const saved = data.evidence.find((item) => item.type === type);
            return (
              <div
                className={`evidence ${step > index ? (saved?.skipped ? "skipped" : "done") : step === index ? "current" : ""}`}
                key={name}
              >
                <span>
                  {step > index ? saved?.skipped ? "—" : <Check /> : index + 1}
                </span>
                <div>
                  <b>{name}</b>
                  <p>
                    {step > index
                      ? saved?.skipped
                        ? "Skipped for demo"
                        : saved?.value
                      : step === index
                        ? "Waiting now"
                        : "Not requested yet"}
                  </p>
                </div>
              </div>
            );
          })}
          <div className="safety">
            <ShieldCheck />
            <span>
              <b>Safety note</b>
              <p>Disconnect power before inspection.</p>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

const workflowNames = [
  "Reviewing customer answers",
  "Preparing technician instructions",
  "Creating service request",
];

function CustomerProcessing({ data }) {
  const count = Math.min(data.agents.length, workflowNames.length);
  return (
    <main className="processing-page">
      <section className="processing-card">
        <div className="processing-orbit">
          <span />
          <Sparkles />
        </div>
        <span className="processing-kicker">Trace is working</span>
        <h1>Preparing your service request</h1>
        <p>Your information is being turned into a technician-ready job.</p>
        <div className="processing-progress">
          <i
            style={{
              width: `${Math.max(10, (count / workflowNames.length) * 100)}%`,
            }}
          />
        </div>
        <div className="processing-steps">
          {workflowNames.map((name, index) => (
            <div
              className={
                index < count ? "done" : index === count ? "active" : ""
              }
              key={name}
            >
              <span>
                {index < count ? (
                  <Check />
                ) : index === count ? (
                  <RefreshCw className="spin" />
                ) : (
                  index + 1
                )}
              </span>
              <b>{name}</b>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function CustomerConfirmation({ data }) {
  const freshdeskLive = data.serviceJob?.provider === "freshdesk";
  const notified = Boolean(data.message);
  const completed = data.status === "completed";
  if (completed) {
    return (
      <main className="confirmation-page">
        <section className="confirmation-card customer-complete-card">
          <div className="success-rings">
            <span />
            <span />
            <div><Check /></div>
          </div>
          <span className="entry-kicker">Service completed</span>
          <h1>Your washer service is complete.</h1>
          <p>
            Arjun Mehta confirmed: <b>{data.technicianJob?.confirmedFinding}</b>
          </p>
          <div className="customer-complete-summary">
            <span><Check /></span>
            <div>
              <b>Service record updated</b>
              <small>
                {freshdeskLive
                  ? `Freshdesk ticket #${data.serviceJob.id} contains the confirmed result.`
                  : "The confirmed technician result has been recorded."}
              </small>
            </div>
          </div>
          {freshdeskLive && (
            <a
              className="primary confirmation-ticket-link"
              href={data.serviceJob.url}
              target="_blank"
              rel="noreferrer"
            >
              View service record <ArrowRight />
            </a>
          )}
        </section>
      </main>
    );
  }
  return (
    <main className="confirmation-page">
      <section className="confirmation-card integration-confirmation">
        <div className="success-rings">
          <span />
          <span />
          <div>
            <Check />
          </div>
        </div>
        <span className="entry-kicker">Request submitted</span>
        <h1>Your service request is ready.</h1>
        <p>The technician now has the product details and customer evidence.</p>
        <div className="request-receipts">
          <div>
            <span><Check /></span>
            <p>
              <b>
                {freshdeskLive
                  ? `Freshdesk ticket #${data.serviceJob.id} created`
                  : "Service request created"}
              </b>
              <small>The technician can open the complete customer record.</small>
            </p>
          </div>
          <div>
            <span><Wrench /></span>
            <p>
              <b>Arjun Mehta assigned</b>
              <small>Product details and customer evidence are ready.</small>
            </p>
          </div>
          {notified && (
            <div>
              <span><MessageCircle /></span>
              <p>
                <b>Customer notified</b>
                <small>Service details were sent successfully.</small>
              </p>
            </div>
          )}
        </div>
        {freshdeskLive && (
          <a
            className="primary confirmation-ticket-link"
            href={data.serviceJob.url}
            target="_blank"
            rel="noreferrer"
          >
            Open Freshdesk ticket <ArrowRight />
          </a>
        )}
      </section>
    </main>
  );
}

function CustomerView({
  data,
  started,
  onStart,
  resolveProduct,
  advance,
  respond,
  skipEvidence,
  submit,
  busy,
}) {
  const [helpStarted, setHelpStarted] = useState(data.intakeStep > 0);
  if (!started && !data.productVerified)
    return <CustomerStart onStart={onStart} />;
  if (!data.productVerified)
    return <ProductEntry resolveProduct={resolveProduct} busy={busy} />;
  if (
    ["diagnosing", "repair_ready"].includes(data.status) ||
    (busy && data.intakeStep === 3)
  )
    return <CustomerProcessing data={data} />;
  if (["service_job_created", "completed"].includes(data.status))
    return <CustomerConfirmation data={data} />;
  if (!helpStarted)
    return (
      <ProductReveal data={data} onContinue={() => setHelpStarted(true)} />
    );
  return (
    <EvidenceIntake
      data={data}
      advance={advance}
      respond={respond}
      skipEvidence={skipEvidence}
      submit={submit}
      busy={busy}
    />
  );
}

const initialInspectionPlan = [
  {
    id: "isolate",
    label: "Disconnect power and water",
    question: "Is the appliance safely disconnected?",
  },
  {
    id: "filter",
    label: "Inspect the drain filter",
    question: "What did you find in the drain filter?",
  },
  {
    id: "hose",
    label: "Inspect the drain hose",
    question: "Is the drain hose obstructed?",
  },
  {
    id: "pump",
    label: "Test the drain pump",
    question: "Does the pump operate correctly?",
  },
  {
    id: "test",
    label: "Run a drain-cycle test",
    question: "Did the washer drain successfully?",
  },
];
const findingOptions = [
  "Blocked drain filter",
  "Drain hose obstruction",
  "Drain pump fault",
  "Different issue",
];

function TechnicianView({ data, progressTechnician, busy }) {
  const state = data.technicianJob?.status;
  const [inspectionPlan, setInspectionPlan] = useState(initialInspectionPlan);
  const [completedChecks, setCompletedChecks] = useState(
    state === "completed" ? initialInspectionPlan.length : 0,
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionPhase, setCompletionPhase] = useState(0);
  const [showFinding, setShowFinding] = useState(false);
  const [findingCandidate, setFindingCandidate] = useState(null);
  const [replanMessage, setReplanMessage] = useState("");
  const [replanChanges, setReplanChanges] = useState(null);

  useEffect(() => {
    if (state !== "completed") return undefined;
    setCompletedChecks(inspectionPlan.length);
    setShowCelebration(true);
    setCompletionPhase(1);
    const second = setTimeout(() => setCompletionPhase(2), 650);
    const third = setTimeout(() => setCompletionPhase(3), 1300);
    const close = setTimeout(() => setShowCelebration(false), 3300);
    return () => {
      clearTimeout(second);
      clearTimeout(third);
      clearTimeout(close);
    };
  }, [state]);

  if (!data.technicianJob)
    return (
      <main className="technician-page">
        <div className="empty technician-empty">
          <div className="empty-icon">
            <Wrench />
          </div>
          <h2>No service job yet</h2>
          <p>
            Submit the customer request first, then switch back to this view.
          </p>
        </div>
      </main>
    );

  const allChecksDone = completedChecks === inspectionPlan.length;
  const currentStep = inspectionPlan[completedChecks];
  const decisionOptions = {
    isolate: [{ label: "Power disconnected", result: "next" }],
    filter: [
      { label: "Blockage found", result: "filter_blocked" },
      { label: "Filter is clear", result: "next" },
    ],
    clear_filter: [{ label: "Filter cleared", result: "next" }],
    hose: [
      { label: "Obstruction found", result: "hose_blocked" },
      { label: "Hose is clear", result: "next" },
    ],
    clear_hose: [{ label: "Hose cleared", result: "next" }],
    pump: [
      { label: "Pump fault found", result: "pump_fault" },
      { label: "Pump is working", result: "next" },
    ],
    test: [
      { label: "Drain cycle passed", result: "test_passed" },
      { label: "Still not draining", result: "different" },
    ],
  };
  const recordInspectionResult = (result) => {
    setReplanMessage("");
    setReplanChanges(null);
    if (result === "filter_blocked") {
      setFindingCandidate("Blocked drain filter");
      setInspectionPlan([
        initialInspectionPlan[0],
        initialInspectionPlan[1],
        {
          id: "clear_filter",
          label: "Clear and refit the drain filter",
          question: "Has the filter been cleared and refitted?",
        },
        initialInspectionPlan[4],
      ]);
      setCompletedChecks(2);
      setReplanMessage(
        "Blockage confirmed. Trace removed the hose and pump checks and moved directly to cleaning and drain testing.",
      );
      setReplanChanges({
        removed: ["Inspect drain hose", "Test drain pump"],
        next: ["Clear and refit drain filter", "Run drain-cycle test"],
      });
      return;
    }
    if (result === "hose_blocked") {
      setFindingCandidate("Drain hose obstruction");
      setInspectionPlan([
        initialInspectionPlan[0],
        initialInspectionPlan[1],
        initialInspectionPlan[2],
        {
          id: "clear_hose",
          label: "Clear and reconnect the drain hose",
          question: "Has the hose been cleared and reconnected?",
        },
        initialInspectionPlan[4],
      ]);
      setCompletedChecks(3);
      setReplanMessage(
        "Hose obstruction confirmed. Trace replaced the pump check with clearing the hose and testing the drain cycle.",
      );
      setReplanChanges({
        removed: ["Test drain pump"],
        next: ["Clear and reconnect drain hose", "Run drain-cycle test"],
      });
      return;
    }
    if (result === "pump_fault") {
      setFindingCandidate("Drain pump fault");
      setCompletedChecks((value) => value + 1);
      setReplanMessage(
        "Pump fault recorded. Trace moved directly to the verification test.",
      );
      return;
    }
    if (result === "different") setFindingCandidate("Different issue");
    setCompletedChecks((value) => Math.min(inspectionPlan.length, value + 1));
  };
  const handleProgress = async () => {
    if (state === "ready") {
      setCompletedChecks(0);
      await progressTechnician();
      return;
    }
    if (state === "in_progress" && allChecksDone) setShowFinding(true);
  };
  const confirmFinding = async (finding) => {
    const next = await progressTechnician(finding);
    if (next?.technicianJob?.status === "completed") setShowFinding(false);
  };
  return (
    <main className="technician-page">
      {showFinding && (
        <div className="finding-overlay">
          <section className="finding-dialog">
            <span className="entry-kicker">Close the feedback loop</span>
            <h2>What did you find?</h2>
            <p>The confirmed result will be added to the Freshdesk ticket.</p>
            <div>
              {findingOptions.map((finding) => (
                <button
                  key={finding}
                  className={finding === findingCandidate ? "suggested" : ""}
                  disabled={busy}
                  onClick={() => confirmFinding(finding)}
                >
                  <span>
                    {busy ? <RefreshCw className="spin" /> : <Wrench />}
                  </span>
                  <b>
                    {finding}
                    {finding === findingCandidate && (
                      <small>Trace suggestion</small>
                    )}
                  </b>
                  <ArrowRight />
                </button>
              ))}
            </div>
            <button
              className="finding-cancel"
              onClick={() => setShowFinding(false)}
            >
              Cancel
            </button>
          </section>
        </div>
      )}
      {showCelebration && (
        <div className="completion-overlay" role="status" aria-live="polite">
          <section>
            <div className="completion-mark"><Check /></div>
            <span className="entry-kicker">Service complete</span>
            <h2>Everything is up to date.</h2>
            <div className="completion-sequence">
              {[
                "Finding confirmed",
                data.serviceJob?.provider === "freshdesk"
                  ? "Freshdesk ticket updated"
                  : "Service record updated",
                "Job marked complete",
              ].map((label, index) => (
                <div
                  className={completionPhase > index ? "done" : ""}
                  key={label}
                >
                  <span>{completionPhase > index ? <Check /> : index + 1}</span>
                  <b>{label}</b>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
      <div className="job-top">
        <div>
          <span className="entry-kicker">Technician workspace</span>
          <h1>{data.diagnosis?.fault || "Inspection required"}</h1>
          <p>
            {data.product.name} · {data.product.serial}
          </p>
          <div className="assigned-tech">
            <Wrench /> Assigned to{" "}
            <b>{data.technicianJob.technician || "Arjun Mehta"}</b>
          </div>
        </div>
        <div>
          <a className="ghost" href="/api/job/export" download>
            <Download /> Export brief
          </a>
          {data.serviceJob?.provider === "freshdesk" && (
            <a
              className="primary"
              href={data.serviceJob.url}
              target="_blank"
              rel="noreferrer"
            >
              Open in Freshdesk <ArrowRight />
            </a>
          )}
        </div>
      </div>
      <section className={`active-job ${state}`}>
        <div className="job-status-visual">
          <div className="tool-pulse">
            <Wrench />
          </div>
          <span>
            {state === "ready"
              ? "Ready to begin"
              : state === "in_progress"
                ? "Service visit in progress"
                : "Service completed"}
          </span>
          <h2>
            {state === "ready"
              ? "Start the guided inspection"
              : state === "in_progress"
                ? `${completedChecks} of ${inspectionPlan.length} checks completed`
                : "All checks are complete"}
          </h2>
          <div className="job-progress">
            <i
              style={{
                width:
                  state === "ready"
                    ? "0%"
                    : `${(completedChecks / inspectionPlan.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <button
          className={`primary job-action ${state === "completed" ? "completed" : ""}`}
          disabled={
            busy ||
            state === "completed" ||
            (state === "in_progress" && !allChecksDone)
          }
          onClick={handleProgress}
        >
          {busy ? (
            <>
              <RefreshCw className="spin" /> Updating
            </>
          ) : state === "ready" ? (
            <>
              Start job <ArrowRight />
            </>
          ) : state === "in_progress" ? (
            allChecksDone ? (
              <>
                Complete job <Check />
              </>
            ) : (
              <>Complete checks first</>
            )
          ) : (
            <>
              <Check /> Job completed
            </>
          )}
        </button>
      </section>
      {state === "completed" && (
        <section className="finding-result">
          <div>
            <Check />
          </div>
          <span>
            <small>Confirmed on site</small>
            <h2>{data.technicianJob.confirmedFinding}</h2>
            <p>{data.technicianJob.comparison} · Added to Freshdesk</p>
          </span>
        </section>
      )}
      <section className="trace-reasoning">
        <div className="reasoning-heading">
          <span>
            <Sparkles /> Trace assessment
          </span>
          <h2>Why Trace suggested this</h2>
          <p>Customer evidence was matched against the service guidance.</p>
        </div>
        <div className="reasoning-observations">
          {(data.diagnosis?.observations || []).map((observation) => (
            <div key={observation}>
              <Check />
              <span>{observation}</span>
            </div>
          ))}
        </div>
        <aside>
          <b>Service guidance</b>
          <p>{data.diagnosis?.serviceGuidance}</p>
        </aside>
      </section>
      <div className="technician-grid">
        <section className="guided-checks">
          <h2>Guided inspection</h2>
          <p>Report what you find and Trace will adapt the remaining plan.</p>
          {replanMessage && (
            <>
              <aside className="replan-message">
                <Sparkles />
                <b>{replanMessage}</b>
              </aside>
              {replanChanges && (
                <div className="plan-change" aria-live="polite">
                  <section>
                    <span>Removed from plan</span>
                    {replanChanges.removed.map((item) => (
                      <p key={item}><X /> {item}</p>
                    ))}
                  </section>
                  <ArrowRight className="plan-change-arrow" />
                  <section>
                    <span>Now next</span>
                    {replanChanges.next.map((item) => (
                      <p key={item}><Check /> {item}</p>
                    ))}
                  </section>
                </div>
              )}
            </>
          )}
          {state === "in_progress" && currentStep && (
            <aside className="inspection-decision">
              <span>Trace asks</span>
              <h3>{currentStep.question}</h3>
              <div>
                {(decisionOptions[currentStep.id] || []).map((option) => (
                  <button
                    key={option.result}
                    onClick={() => recordInspectionResult(option.result)}
                  >
                    {option.label} <ArrowRight />
                  </button>
                ))}
              </div>
            </aside>
          )}
          {inspectionPlan.map((step, index) => {
            const done = index < completedChecks;
            const current =
              state === "in_progress" && index === completedChecks;
            return (
              <div
                className={done ? "done" : current ? "current" : ""}
                key={step.id}
              >
                <span>
                  {done ? (
                    <Check />
                  ) : current ? (
                    <RefreshCw className="spin" />
                  ) : (
                    index + 1
                  )}
                </span>
                <b>{step.label}</b>
                <small>
                  {done ? "Complete" : current ? "Checking now" : "Waiting"}
                </small>
              </div>
            );
          })}
        </section>
        <aside className="customer-evidence">
          <h2>Customer evidence</h2>
          <p>Collected before dispatch</p>
          {data.evidence.map((item) =>
            item.type === "image" && !item.skipped ? (
              <div className="evidence-photo-block" key={item.type}>
                <img
                  src={item.imageUrl || "/sample-filter-evidence.png"}
                  alt="Customer-uploaded drain filter evidence"
                />
                <small>{item.value}</small>
              </div>
            ) : (
              <div key={item.type}>
                <span>{item.skipped ? "—" : <Check />}</span>
                <div>
                  <b>
                    {item.type === "error_code"
                      ? "Error code"
                      : item.type === "image"
                        ? "Photo"
                        : "Voice report"}
                  </b>
                  <p>{item.skipped ? "Skipped for demo" : item.value}</p>
                </div>
              </div>
            ),
          )}
        </aside>
      </div>
    </main>
  );
}

function App() {
  const [view, setView] = useState("customer");
  const [customerStarted, setCustomerStarted] = useState(false);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [technicianJobSeen, setTechnicianJobSeen] = useState(false);
  const diagnosisStarted = useRef(false);
  const action = async (fn) => {
    setBusy(true);
    setError("");
    try {
      const next = await fn();
      setData(next);
      return next;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    voiceClips.forEach((source) => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = source;
      audio.load();
    });
  }, []);

  useEffect(() => {
    action(async () => {
      const current = await api("/api/case");
      const serial = new URLSearchParams(window.location.search).get("serial");
      if (serial && !current.productVerified)
        return api("/api/products/resolve", {
          method: "POST",
          body: JSON.stringify({ serial }),
        });
      return current;
    });
  }, []);

  const reset = () =>
    action(async () => {
      setView("customer");
      setCustomerStarted(false);
      setTechnicianJobSeen(false);
      diagnosisStarted.current = false;
      window.history.replaceState({}, "", window.location.pathname);
      return api("/api/case/reset", { method: "POST" });
    });
  const advance = (input) =>
    action(() =>
      api("/api/intake/advance", {
        method: "POST",
        body: JSON.stringify(input || {}),
      }),
    );
  const respond = (text) =>
    action(() =>
      api("/api/ai/respond", {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    );
  const skipEvidence = () =>
    action(() => api("/api/intake/skip", { method: "POST", body: "{}" }));
  const resolveProduct = (serial) => {
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?serial=${encodeURIComponent(serial)}`,
    );
    return action(() =>
      api("/api/products/resolve", {
        method: "POST",
        body: JSON.stringify({ serial }),
      }),
    );
  };
  const diagnose = async () => {
    if (diagnosisStarted.current) return;
    diagnosisStarted.current = true;
    setBusy(true);
    setError("");
    try {
      let next = await api("/api/diagnose/start", {
        method: "POST",
        body: "{}",
      });
      setData(next);
      for (let index = 0; index < workflowNames.length; index += 1) {
        next = await api("/api/diagnose/next", { method: "POST", body: "{}" });
        setData(next);
      }
      next = await api("/api/dispatch", { method: "POST", body: "{}" });
      setData(next);
      setTechnicianJobSeen(false);
      await api("/api/messages/whatsapp", { method: "POST", body: "{}" });
      setData(await api("/api/case"));
    } catch (err) {
      setError(err.message);
      diagnosisStarted.current = false;
    } finally {
      setBusy(false);
    }
  };
  const progressTechnician = (finding) =>
    action(() =>
      api("/api/technician/progress", {
        method: "POST",
        body: JSON.stringify(finding ? { finding } : {}),
      }),
    );

  if (!data)
    return (
      <div className="loading">
        <RefreshCw className="spin" /> Connecting to Trace…
      </div>
    );
  return (
    <div className="app">
      <AppHeader
        view={view}
        setView={(nextView) => {
          setView(nextView);
          if (nextView === "technician") setTechnicianJobSeen(true);
        }}
        reset={reset}
        hasNewJob={Boolean(data.technicianJob) && !technicianJobSeen}
      />
      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError("")}>
            <X />
          </button>
        </div>
      )}
      {view === "customer" ? (
        <CustomerView
          data={data}
          started={customerStarted}
          onStart={() => setCustomerStarted(true)}
          resolveProduct={resolveProduct}
          advance={advance}
          respond={respond}
          skipEvidence={skipEvidence}
          submit={diagnose}
          busy={busy}
        />
      ) : (
        <TechnicianView
          data={data}
          progressTechnician={progressTechnician}
          busy={busy}
        />
      )}
    </div>
  );
}

const reactRoot =
  globalThis.__TRACE_REACT_ROOT__ ||
  createRoot(document.getElementById("root"));
globalThis.__TRACE_REACT_ROOT__ = reactRoot;
reactRoot.render(<App />);
