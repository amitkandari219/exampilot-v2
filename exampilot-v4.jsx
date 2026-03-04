import { useState } from "react";

const C = {
  bg: "#0B1120", sf: "#131C31", cd: "#182036", bd: "#1E2D4A",
  ac: "#3ECFB4", ad: "rgba(62,207,180,0.12)",
  wn: "#F59E42", wd: "rgba(245,158,66,0.12)",
  dn: "#EF4444", dd: "rgba(239,68,68,0.10)",
  tx: "#E8ECF4", td: "#7B8BA5", tm: "#4A5568",
  gn: "#34D399", gd: "rgba(52,211,153,0.12)",
  pp: "#A78BFA", pd: "rgba(167,139,250,0.12)",
  or: "#F97316",
};

const pill = (bg, c) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color: c });
const card = { background: C.cd, borderRadius: 16, border: `1px solid ${C.bd}`, padding: 18, marginBottom: 14 };
const sec = { fontSize: 12, fontWeight: 700, color: C.td, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 };
const mbox = (c, bg) => ({ background: bg, borderRadius: 14, padding: "14px 16px", flex: 1, minWidth: 0, border: `1px solid ${c}22` });

function Bar({ p, c = C.ac, h = 6, l }) {
  return (
    <div>
      {l && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: C.td }}>{l}</span>
        <span style={{ fontSize: 12, color: c, fontWeight: 600 }}>{p}%</span>
      </div>}
      <div style={{ background: C.bd, borderRadius: h, height: h, width: "100%" }}>
        <div style={{ background: c, borderRadius: h, height: h, width: `${Math.min(p, 100)}%`, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function Note({ children }) {
  return (
    <div style={{ background: "#1A1A2E", border: "1px dashed #334155", borderRadius: 12, padding: 16, marginTop: 20, fontSize: 12, color: "#94A3B8", lineHeight: 1.75 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: 1.5, marginBottom: 8 }}>💡 DESIGN RATIONALE</div>
      {children}
    </div>
  );
}

function Tip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: 4 }}>
      <span onClick={(e) => { e.stopPropagation(); setShow(!show); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 8, background: C.bd, color: C.td, fontSize: 9, fontWeight: 700, cursor: "pointer" }}>?</span>
      {show && (
        <div style={{ position: "absolute", bottom: 22, left: -80, width: 200, background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 10, padding: 10, fontSize: 11, color: C.td, lineHeight: 1.5, zIndex: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          {text}
          <div onClick={(e) => { e.stopPropagation(); setShow(false); }} style={{ color: C.ac, marginTop: 6, cursor: "pointer", fontSize: 10 }}>Got it</div>
        </div>
      )}
    </span>
  );
}

// ════════════════════════════════════════════════════════
// QUICK LOG MODAL
// ════════════════════════════════════════════════════════
function QuickLog({ show, onClose }) {
  const [subject, setSubject] = useState(null);
  const [mins, setMins] = useState(60);
  const [logged, setLogged] = useState(false);
  const subjects = ["Polity", "History", "Geography", "Economics", "Science", "Environment", "Ethics", "CSAT", "Current Affairs", "Answer Writing"];
  if (!show) return null;
  if (logged) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.cd, borderRadius: 20, padding: 32, maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.gn, marginBottom: 8 }}>Logged!</div>
        <div style={{ fontSize: 13, color: C.td, marginBottom: 20 }}>{mins} min of {subject} added to today</div>
        <div onClick={() => { setLogged(false); setSubject(null); onClose(); }} style={{ color: C.ac, fontSize: 13, cursor: "pointer" }}>Close</div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: C.cd, borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", maxWidth: 460, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.tx }}>Quick Log</div>
          <div onClick={onClose} style={{ color: C.td, cursor: "pointer", fontSize: 18 }}>✕</div>
        </div>
        <div style={{ fontSize: 12, color: C.td, marginBottom: 14 }}>Studied outside the app? Log it in 10 seconds.</div>
        <div style={sec}>Subject</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {subjects.map(s => (
            <div key={s} onClick={() => setSubject(s)} style={{ background: subject === s ? C.ac + "22" : C.sf, border: `1px solid ${subject === s ? C.ac : C.bd}`, borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 500, color: subject === s ? C.ac : C.tx, cursor: "pointer" }}>{s}</div>
          ))}
        </div>
        <div style={sec}>Duration</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.ac }}>{mins}</div>
          <div style={{ fontSize: 14, color: C.td }}>minutes</div>
        </div>
        <input type="range" min="15" max="180" step="15" value={mins} onChange={e => setMins(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.ac, marginBottom: 4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.tm, marginBottom: 20 }}><span>15m</span><span>3 hrs</span></div>
        <div style={{ background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: C.tm, marginBottom: 20 }}>+ Add specific topic (optional)</div>
        <div onClick={() => subject && setLogged(true)} style={{ background: subject ? C.ac : C.bd, color: subject ? C.bg : C.tm, fontWeight: 700, fontSize: 14, padding: "14px", borderRadius: 14, textAlign: "center", cursor: subject ? "pointer" : "default", opacity: subject ? 1 : 0.5 }}>Log Study Session</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// ONBOARDING
// ════════════════════════════════════════════════════════
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState({ attempt: 1 });
  const steps = [
    { q: "Which attempt is this?", sub: "No judgment. 2nd and 3rd attempts clear more often than 1st.", key: "attempt", options: [
      { label: "1st Attempt", desc: "Fresh start — we'll build from zero", val: 1 },
      { label: "2nd Attempt", desc: "You know the game. Let's sharpen.", val: 2 },
      { label: "3rd+ Attempt", desc: "Aggressive mode. No wasted days.", val: 3 },
    ]},
    { q: "Are you a working professional?", sub: "This changes your daily capacity and weekend loading", options: [
      { label: "Full-time preparation", desc: "6+ hrs available daily" },
      { label: "Working + preparing", desc: "Limited weekday hours, heavy weekends" },
    ]},
    { q: "Which Prelims cycle are you targeting?", sub: "This decides everything — pace, revision depth, risk tolerance", options: [
      { label: "This year (2026)" }, { label: "Next year (2027)" }, { label: "Not sure yet", desc: "We'll plan for the nearest cycle" },
    ]},
    { q: "How do you prefer to study?", sub: "Neither is wrong. This shapes how we build your weekly plan.", options: [
      { label: "One subject at a time", desc: "Finish Polity → then Geography → then Economics" },
      { label: "Mix subjects daily", desc: "Study 2-3 subjects each day for variety" },
    ]},
    { q: "How many hours can you realistically study daily?", sub: "Be honest. Not aspirational. You can always increase later.", slider: true },
    { q: "Which 3 GS subjects feel weakest right now?", sub: "Tap 3. This seeds your revision priority from day one.", chips: true,
      options: ["Indian Polity", "Economics", "Geography", "Ancient History", "Modern History", "Art & Culture", "Science & Tech", "Environment", "Ethics", "CSAT"],
    },
  ];
  const s = steps[step];
  const chipSel = sel.chips || [];

  return (
    <div style={{ padding: "30px 0 20px" }}>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 30 }}>
        {steps.map((_, i) => <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i <= step ? C.ac : C.bd, transition: "all 0.3s" }} />)}
      </div>
      <span style={pill(C.ad, C.ac)}>UPSC CSE</span>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.tx, marginBottom: 8, marginTop: 16, lineHeight: 1.3 }}>{s.q}</div>
      <div style={{ fontSize: 13, color: C.td, marginBottom: 24 }}>{s.sub}</div>

      {!s.chips && !s.slider && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {s.options.map((o, i) => (
            <div key={i} onClick={() => {
              if (s.key) setSel({ ...sel, [s.key]: o.val });
              setStep(Math.min(step + 1, steps.length - 1));
            }} style={{ background: C.cd, border: `1.5px solid ${C.bd}`, borderRadius: 14, padding: "16px 20px", cursor: "pointer" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.tx }}>{o.label}</div>
              {o.desc && <div style={{ fontSize: 12, color: C.td, marginTop: 4 }}>{o.desc}</div>}
            </div>
          ))}
        </div>
      )}
      {s.slider && (
        <div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: C.ac }}>{sel.hours || 6}</div>
            <div style={{ fontSize: 16, color: C.td, alignSelf: "flex-end", marginLeft: 8, marginBottom: 8 }}>hrs/day</div>
          </div>
          <input type="range" min="2" max="12" step="0.5" value={sel.hours || 6} onChange={e => setSel({ ...sel, hours: parseFloat(e.target.value) })} style={{ width: "100%", accentColor: C.ac, marginBottom: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.tm }}><span>2 hrs</span><span>12 hrs</span></div>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <div onClick={() => setStep(step + 1)} style={{ display: "inline-block", background: C.ac, color: C.bg, fontWeight: 700, fontSize: 14, padding: "12px 36px", borderRadius: 12, cursor: "pointer" }}>Continue →</div>
          </div>
        </div>
      )}
      {s.chips && (
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {s.options.map((o, i) => {
              const on = chipSel.includes(i);
              return <div key={i} onClick={() => {
                let n = [...chipSel]; if (on) n = n.filter(x => x !== i); else if (n.length < 3) n.push(i);
                setSel({ ...sel, chips: n });
              }} style={{ background: on ? C.ac + "22" : C.cd, border: `1.5px solid ${on ? C.ac : C.bd}`, borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 500, color: on ? C.ac : C.tx, cursor: "pointer" }}>{o}</div>;
            })}
          </div>
          <div style={{ fontSize: 12, color: C.td, marginTop: 12 }}>{chipSel.length}/3 selected</div>
          {chipSel.length === 3 && (
            <div onClick={() => onComplete(sel)} style={{ marginTop: 24, background: C.ac, color: C.bg, fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 14, textAlign: "center", cursor: "pointer" }}>
              Generate My UPSC Plan →
            </div>
          )}
        </div>
      )}
      <Note>
        <b>6 screens, UPSC-specific.</b> Attempt # drives F1 strategy (1st→Balanced, 3rd→Aggressive). Study approach shapes F8 planner (sequential vs mixed). "Realistically" prevents aspirational hour targets. Chips seed F9 Weakness Radar. Then: "Plan is ready." Zero more setup.
      </Note>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// DASHBOARD — first-week aware, mode-adaptive
// ════════════════════════════════════════════════════════
function Dashboard({ examMode, daysUsed, onNavigate }) {
  const isMains = examMode === "mains";
  const isFirst = daysUsed <= 7;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 14, color: C.td }}>Good morning</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.tx, marginTop: 2 }}>Prelims in <span style={{ color: C.ac }}>127 days</span></div>
        </div>
        <span style={pill(isMains ? C.pp + "22" : C.ad, isMains ? C.pp : C.ac)}>{isMains ? "MAINS" : "PRELIMS"}</span>
      </div>

      {/* First-time card — day 1-3 only */}
      {daysUsed <= 3 && (
        <div style={{ ...card, border: `1px solid ${C.ac}44`, background: C.ad }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ac, marginBottom: 6 }}>Welcome to ExamPilot</div>
          <div style={{ fontSize: 12, color: C.tx, lineHeight: 1.6 }}>For the next few days, just focus on the "Start Here" card below. Tap it, study, mark done. Metrics, readiness scores, and revision will fill in as you build history.</div>
        </div>
      )}

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${C.ac}18 0%, ${C.cd} 60%)`, borderRadius: 18, border: `1.5px solid ${C.ac}33`, padding: 22, marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.ac, letterSpacing: 1.5, marginBottom: 10 }}>START HERE</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, marginBottom: 4 }}>Indian Polity — Fundamental Rights</div>
        <div style={{ fontSize: 13, color: C.td, marginBottom: 14 }}>
          New topic · ~90 min · High PYQ weight
          <Tip text="PYQ = Previous Year Questions. Topics asked more often in past exams are prioritized. This topic appeared 8 times in the last 10 years." />
        </div>
        <div onClick={() => onNavigate && onNavigate("plan")} style={{ display: "inline-flex", background: C.ac, color: C.bg, fontWeight: 700, fontSize: 14, padding: "10px 28px", borderRadius: 12, cursor: "pointer" }}>▶ Start Studying</div>
        <div style={{ fontSize: 10, color: C.tm, marginTop: 6 }}>→ Opens Planner & starts timer</div>
      </div>

      {/* 5 Metrics */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={mbox(C.ac, C.ad)}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.ac }}>3.5</div>
          <div style={{ fontSize: 11, color: C.td }}>hrs today</div>
          <div style={{ fontSize: 10, color: C.tm }}>of 6 target</div>
        </div>
        <div style={mbox(C.gn, C.gd)}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.gn }}>3/5</div>
          <div style={{ fontSize: 11, color: C.td }}>tasks done</div>
        </div>
        {isMains ? (
          <div style={mbox(C.pp, C.pd)}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.pp }}>3</div>
            <div style={{ fontSize: 11, color: C.td }}>answers today</div>
            <div style={{ fontSize: 10, color: C.tm }}>12 this week</div>
          </div>
        ) : (
          <div style={mbox(C.pp, C.pd)}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.pp }}>12</div>
            <div style={{ fontSize: 11, color: C.td }}>day streak</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={mbox(C.wn, C.wd)}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.wn }}>4</div>
          <div style={{ fontSize: 11, color: C.td }}>revisions due <Tip text="Topics starting to fade from memory. A quick 20-min revision brings them back." /></div>
        </div>
        <div style={mbox(C.ac, C.ad)}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.ac }}>68</div>
          <div style={{ fontSize: 11, color: C.td }}>momentum</div>
          <div style={{ fontSize: 10, color: C.tm }}>7-day score</div>
        </div>
      </div>

      {/* Mains split */}
      {isMains && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 8 }}>This Week's Focus Split</div>
          <div style={{ display: "flex", gap: 2, height: 22, borderRadius: 6, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ width: "65%", background: C.ac, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.bg }}>Prelims 65%</div>
            <div style={{ width: "35%", background: C.pp, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.bg }}>Mains 35%</div>
          </div>
          <div style={{ fontSize: 11, color: C.td }}>Answer writing: 12 this week · Weakest paper: GS2</div>
        </div>
      )}

      {/* Readiness — hidden first week */}
      {!isFirst && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.tx }}>Exam Readiness <Tip text="Composite score: coverage, confidence, consistency, speed, and weakness handling." /></span>
            <span style={{ fontSize: 26, fontWeight: 800, color: C.ac }}>65<span style={{ fontSize: 14, color: C.td }}>/100</span></span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Bar p={42} l="Coverage" c={C.wn} /><Bar p={71} l="Confidence" c={C.ac} /><Bar p={55} l="Consistency" c={C.gn} /><Bar p={78} l="Velocity" c={C.pp} /><Bar p={62} l="Weakness" c={C.dn} />
          </div>
        </div>
      )}

      {/* Backlog — hidden day 1 */}
      {daysUsed > 1 && (
        <div style={{ ...card, border: `1px solid ${C.wn}33`, background: C.wd, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.wn }}>2 items rolled over</div>
            <div style={{ fontSize: 11, color: C.td }}>from yesterday — tap to adjust</div>
          </div>
          <div style={{ fontSize: 12, color: C.wn, fontWeight: 600, cursor: "pointer" }}>Adjust →</div>
        </div>
      )}

      <Note>
        <b>V4 fixes:</b> Welcome card (day 1-3) says "just follow Start Here." Readiness score hidden first week — no meaning without data. Backlog hidden day 1. Answer writing replaces streak in Mains mode. Prelims/Mains split bar for veterans.
      </Note>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// PLANNER — with logged-outside-app card
// ════════════════════════════════════════════════════════
function Planner({ daysUsed }) {
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const tasks = [
    { sub: "Indian Polity", top: "Fundamental Rights (Art 12-35)", t: 90, tag: "NEW", tc: C.ac, done: true },
    { sub: "Geography", top: "Monsoon Mechanism", t: 60, tag: "REVISION", tc: C.pp, done: true },
    { sub: "Economics", top: "Balance of Payments", t: 75, tag: "NEW", tc: C.ac, done: false },
    { sub: "Modern History", top: "1857 Revolt — Causes", t: 45, tag: "DECAY", tc: C.dn, done: false },
    { sub: "Current Affairs", top: "Daily CA reading + notes", t: 45, tag: "DAILY", tc: C.wn, done: false },
  ];
  const total = tasks.reduce((s, t) => s + t.t, 0);
  const done = tasks.filter(t => t.done).reduce((s, t) => s + t.t, 0);

  return (
    <div>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.tx }}>Today's Plan</span>
          <span style={{ fontSize: 13, color: C.td }}>{(total / 60).toFixed(1)} hrs / 6 hrs</span>
        </div>
        <Bar p={Math.round((total / 360) * 100)} c={total > 420 ? C.dn : C.ac} />
        <div style={{ fontSize: 11, color: C.tm, marginTop: 6 }}>{((360 - total) / 60).toFixed(1)} hrs buffer remaining</div>
      </div>

      {tasks.map((t, i) => (
        <div key={i} style={{ ...card, opacity: t.done ? 0.5 : 1, borderLeft: `3px solid ${t.done ? C.tm : t.tc}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={pill(t.done ? C.tm + "33" : t.tc + "22", t.done ? C.tm : t.tc)}>{t.tag}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.done ? C.tm : C.tx }}>{t.sub}</span>
              {t.tag === "DECAY" && <Tip text="This topic is fading from memory. Our algorithm detected you're at risk of forgetting it. A quick revision now saves a full re-study later." />}
            </div>
            <div style={{ fontSize: 12, color: C.td, textDecoration: t.done ? "line-through" : "none" }}>{t.top}</div>
          </div>
          <div style={{ textAlign: "right", minWidth: 65 }}>
            {/* Timer active state */}
            {activeTimer === i && !t.done ? (
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: paused ? C.wn : C.ac, fontFamily: "monospace" }}>
                  {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 9, color: C.td }}>{t.t - Math.floor(elapsed / 60)} min left</div>
                <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "flex-end" }}>
                  <span onClick={() => setPaused(!paused)} style={{ fontSize: 10, color: paused ? C.ac : C.wn, background: paused ? C.ad : C.wd, borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}>{paused ? "▶" : "⏸"}</span>
                  <span onClick={() => { setActiveTimer(null); setElapsed(0); setPaused(false); }} style={{ fontSize: 10, color: C.dn, background: C.dd, borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}>■</span>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.done ? C.tm : C.tx }}>{t.t} min</div>
                {!t.done && <div onClick={() => { setActiveTimer(i); setElapsed(0); setPaused(false); }} style={{ fontSize: 11, color: C.ac, cursor: "pointer", marginTop: 4 }}>▶ Start</div>}
                {t.done && <div style={{ fontSize: 11, color: C.gn }}>✓ Done</div>}
              </>
            )}
          </div>
        </div>
      ))}

      {/* Quick-logged session card */}
      {daysUsed > 3 && (
        <div style={{ ...card, borderLeft: `3px solid ${C.gn}`, opacity: 0.7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={pill(C.gd, C.gn)}>LOGGED</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.tx }}>Economics</span>
          </div>
          <div style={{ fontSize: 12, color: C.td }}>Logged via Quick Log · 60 min · Balance of Payments</div>
          <div style={{ fontSize: 10, color: C.gn, marginTop: 4 }}>✓ Counts toward today's hours and updates subject coverage</div>
        </div>
      )}

      {/* Progress */}
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1 }}><Bar p={Math.round((done / total) * 100)} c={C.gn} /></div>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.gn }}>{tasks.filter(t => t.done).length}/{tasks.length}</span>
      </div>

      <Note>
        <b>V4 fix:</b> Quick-logged sessions now appear as a LOGGED card in the planner. Timer state shows elapsed/remaining time with pause/stop controls — only one timer active at a time. Shows the subject, duration, and confirms it counts toward hours + coverage. No disconnect between Quick Log and planner view.
      </Note>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// SYLLABUS — first-week aware
// ════════════════════════════════════════════════════════
function Syllabus({ daysUsed }) {
  const [exp, setExp] = useState("polity");
  const isFirst = daysUsed <= 7;
  const subs = [
    { id: "polity", n: "Indian Polity", p: isFirst ? 0 : 58, c: C.ac, topics: [
      { n: "Preamble & Salient Features", s: "exam_ready", pyq: 4, r: "Fresh" },
      { n: "Fundamental Rights (Art 12-35)", s: "moderate", pyq: 8, r: "Fading" },
      { n: "DPSP & Fundamental Duties", s: "first_pass", pyq: 5, r: "Stale" },
      { n: "Union Executive", s: "weak", pyq: 6, r: "Decayed" },
      { n: "Parliament", s: "untouched", pyq: 7, r: null },
      { n: "Judiciary", s: "untouched", pyq: 9, r: null },
    ]},
    { id: "history", n: "Modern History", p: isFirst ? 0 : 34, c: C.wn, topics: [] },
    { id: "geo", n: "Geography", p: isFirst ? 0 : 41, c: C.gn, topics: [] },
    { id: "eco", n: "Economics", p: isFirst ? 0 : 22, c: C.dn, topics: [] },
    { id: "sci", n: "Science & Tech", p: isFirst ? 0 : 18, c: C.pp, topics: [] },
    { id: "env", n: "Environment", p: isFirst ? 0 : 45, c: C.ac, topics: [] },
    { id: "csat", n: "CSAT", p: isFirst ? 0 : 60, c: C.gn, topics: [] },
  ];
  const sCfg = { exam_ready: { l: "Exam Ready", c: C.gn, b: C.gd }, moderate: { l: "Moderate", c: C.ac, b: C.ad }, first_pass: { l: "First Pass", c: C.wn, b: C.wd }, weak: { l: "Weak", c: C.dn, b: C.dd }, untouched: { l: "Untouched", c: C.tm, b: `${C.tm}22` } };
  const rC = { Fresh: C.gn, Fading: C.wn, Stale: C.or, Decayed: C.dn };

  return (
    <div>
      {isFirst && (
        <div style={{ ...card, border: `1px solid ${C.ac}33`, background: C.ad }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ac, marginBottom: 6 }}>Getting Started</div>
          <div style={{ fontSize: 12, color: C.tx, lineHeight: 1.6 }}>Your progress appears here as you study. Follow the daily plan — each completed session updates these numbers automatically. After a few sessions, you'll see your first percentages.</div>
        </div>
      )}
      <div style={{ fontSize: 13, color: C.td, marginBottom: 16 }}>
        Weighted by PYQ importance
        <Tip text="A topic asked 9 times in past exams counts more toward completion than one asked twice." />
      </div>
      {subs.map(s => (
        <div key={s.id} style={{ marginBottom: 10 }}>
          <div onClick={() => setExp(exp === s.id ? null : s.id)} style={{ ...card, marginBottom: 0, cursor: "pointer", borderLeft: `3px solid ${s.c}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.tx }}>{s.n}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!isFirst && <><div style={{ width: 70 }}><Bar p={s.p} c={s.c} h={5} /></div><span style={{ fontSize: 14, fontWeight: 700, color: s.c, minWidth: 34, textAlign: "right" }}>{s.p}%</span></>}
              {isFirst && <span style={{ fontSize: 12, color: C.tm }}>Not started</span>}
              <span style={{ color: C.td, fontSize: 12 }}>{exp === s.id ? "▾" : "▸"}</span>
            </div>
          </div>
          {exp === s.id && s.topics.length > 0 && !isFirst && (
            <div style={{ background: C.sf, borderRadius: "0 0 16px 16px", padding: "6px 14px", border: `1px solid ${C.bd}`, borderTop: "none" }}>
              {s.topics.map((t, i) => {
                const cfg = sCfg[t.s];
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 2px", borderBottom: i < s.topics.length - 1 ? `1px solid ${C.bd}` : "none" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: C.tx, fontWeight: 500 }}>{t.n}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                        <span style={pill(cfg.b, cfg.c)}>{cfg.l}</span>
                        {t.r && <span style={{ fontSize: 10, color: rC[t.r], fontWeight: 600 }}>↻ {t.r}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: C.td }}>PYQ</div>
                      <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                        {[...Array(5)].map((_, j) => <div key={j} style={{ width: 6, height: 6, borderRadius: 3, background: j < Math.ceil(t.pyq / 2) ? s.c : C.bd }} />)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// FULL SYLLABUS — locked for freshers < 14 days
// ════════════════════════════════════════════════════════
function FullSyllabus({ daysUsed }) {
  const [expPaper, setExpPaper] = useState(null);
  const [expSub, setExpSub] = useState(null);
  const [filter, setFilter] = useState("all");
  const locked = daysUsed < 14;
  const filters = [{ id: "all", l: "All", c: C.ac }, { id: "untouched", l: "Untouched", c: C.tm }, { id: "needs_revision", l: "Needs Revision", c: C.wn }, { id: "weak", l: "Weak", c: C.dn }, { id: "exam_ready", l: "Exam Ready", c: C.gn }];
  const papers = [
    { id: "gs1", name: "GS Paper I", desc: "History, Geography, Society", pct: 38, c: C.wn, subjects: [
      { id: "mh", name: "Modern History", pct: 42, c: C.wn, td: 14, tt: 33, topics: [
        { n: "1857 Revolt — Causes & Impact", s: "moderate", pyq: 6, co: "Feb 18", lr: "Feb 25", nr: "Mar 8", fsrs: "Fading", notes: [{ type: "text", v: "Focus on regional spread" }, { type: "link", v: "Spectrum Ch.5, pg 78-92" }] },
        { n: "Social Reform Movements", s: "exam_ready", pyq: 5, co: "Jan 12", lr: "Feb 28", nr: "Mar 20", fsrs: "Fresh", notes: [{ type: "text", v: "Mnemonic: RAM-DIS" }] },
        { n: "Gandhi & Mass Movements", s: "first_pass", pyq: 8, co: "Mar 1", lr: null, nr: "Mar 10", fsrs: "Stale", notes: [{ type: "text", v: "NCM→CDM→QIM timeline" }, { type: "link", v: "Bipin Chandra Ch.12-15" }] },
        { n: "Governor Generals", s: "weak", pyq: 4, co: "Feb 5", lr: null, nr: "Overdue", fsrs: "Decayed", notes: [{ type: "text", v: "Chronology problem — make table" }] },
        { n: "Tribal Movements", s: "untouched", pyq: 3, co: null, lr: null, nr: null, fsrs: null, notes: [] },
        { n: "Revolutionary Movements", s: "untouched", pyq: 4, co: null, lr: null, nr: null, fsrs: null, notes: [] },
      ]},
      { id: "am", name: "Ancient & Medieval", pct: 28, c: C.dn, td: 8, tt: 28, topics: [] },
      { id: "ac", name: "Art & Culture", pct: 35, c: C.wn, td: 7, tt: 20, topics: [] },
      { id: "ge", name: "Geography", pct: 41, c: C.wn, td: 18, tt: 44, topics: [] },
      { id: "so", name: "Indian Society", pct: 55, c: C.ac, td: 11, tt: 20, topics: [] },
    ]},
    { id: "gs2", name: "GS Paper II", desc: "Polity, IR, Governance", pct: 52, c: C.ac, subjects: [
      { id: "po", name: "Indian Polity", pct: 58, c: C.ac, td: 22, tt: 38, topics: [] },
      { id: "go", name: "Governance", pct: 40, c: C.wn, td: 8, tt: 20, topics: [] },
      { id: "ir", name: "International Relations", pct: 45, c: C.wn, td: 9, tt: 20, topics: [] },
    ]},
    { id: "gs3", name: "GS Paper III", desc: "Economy, S&T, Environment", pct: 30, c: C.dn, subjects: [
      { id: "ec", name: "Indian Economy", pct: 22, c: C.dn, td: 9, tt: 40, topics: [] },
      { id: "sc", name: "Science & Tech", pct: 18, c: C.dn, td: 5, tt: 28, topics: [] },
      { id: "en", name: "Environment", pct: 45, c: C.wn, td: 14, tt: 31, topics: [] },
    ]},
    { id: "gs4", name: "GS Paper IV", desc: "Ethics, Integrity, Aptitude", pct: 25, c: C.dn, subjects: [
      { id: "et", name: "Ethics Theory", pct: 30, c: C.dn, td: 6, tt: 20, topics: [] },
      { id: "cs", name: "Case Studies", pct: 20, c: C.dn, td: 4, tt: 20, topics: [] },
    ]},
  ];
  const sCfg = { exam_ready: { l: "Exam Ready", c: C.gn, b: C.gd }, moderate: { l: "Moderate", c: C.ac, b: C.ad }, first_pass: { l: "First Pass", c: C.wn, b: C.wd }, weak: { l: "Weak", c: C.dn, b: C.dd }, untouched: { l: "Untouched", c: C.tm, b: `${C.tm}22` } };
  const rC = { Fresh: C.gn, Fading: C.wn, Stale: C.or, Decayed: C.dn };
  const totalT = papers.reduce((s, p) => s + p.subjects.reduce((s2, sub) => s2 + sub.tt, 0), 0);
  const doneT = papers.reduce((s, p) => s + p.subjects.reduce((s2, sub) => s2 + sub.td, 0), 0);

  if (locked) return (
    <div>
      <div style={{ ...card, border: `1px solid ${C.pp}33`, background: C.pd, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.pp, marginBottom: 6 }}>Full Syllabus unlocks in {14 - daysUsed} days</div>
        <div style={{ fontSize: 12, color: C.td, lineHeight: 1.6 }}>Seeing 466 topics in week 1 causes anxiety, not motivation. Focus on your daily plan — it's built from this syllabus anyway.</div>
      </div>
      <Note><b>Progressive disclosure:</b> This screen hides for freshers until day 14. Veterans (2nd/3rd attempt) see it from day 1.</Note>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.tx, marginBottom: 4 }}>UPSC CSE — Full Syllabus</div>
        <div style={{ fontSize: 13, color: C.td }}>{doneT} of {totalT} topics · Weighted by PYQ</div>
        <div style={{ marginTop: 10 }}><Bar p={Math.round((doneT / totalT) * 100)} c={C.ac} h={8} /></div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto" }}>
        {filters.map(f => <button key={f.id} onClick={() => setFilter(f.id)} style={{ background: filter === f.id ? f.c + "22" : "transparent", color: filter === f.id ? f.c : C.td, border: `1px solid ${filter === f.id ? f.c + "55" : C.bd}`, borderRadius: 16, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{f.l}</button>)}
      </div>
      {papers.map(p => (
        <div key={p.id} style={{ marginBottom: 14 }}>
          <div onClick={() => { setExpPaper(expPaper === p.id ? null : p.id); setExpSub(null); }} style={{ background: expPaper === p.id ? `${p.c}11` : C.cd, border: `1px solid ${expPaper === p.id ? p.c + "44" : C.bd}`, borderRadius: expPaper === p.id ? "16px 16px 0 0" : 16, padding: "16px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 15, fontWeight: 700, color: C.tx }}>{p.name}</div><div style={{ fontSize: 11, color: C.td, marginTop: 2 }}>{p.desc}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 55 }}><Bar p={p.pct} c={p.c} h={5} /></div>
              <span style={{ fontSize: 15, fontWeight: 800, color: p.c }}>{p.pct}%</span>
              <span style={{ color: C.td }}>{expPaper === p.id ? "▾" : "▸"}</span>
            </div>
          </div>
          {expPaper === p.id && (
            <div style={{ background: C.sf, border: `1px solid ${C.bd}`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "8px 12px" }}>
              {p.subjects.map((sub, si) => (
                <div key={sub.id}>
                  <div onClick={() => setExpSub(expSub === sub.id ? null : sub.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 6px", cursor: "pointer", borderBottom: expSub !== sub.id && si < p.subjects.length - 1 ? `1px solid ${C.bd}` : "none" }}>
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>{sub.name}</div><div style={{ fontSize: 11, color: C.td }}>{sub.td}/{sub.tt}</div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 45 }}><Bar p={sub.pct} c={sub.c} h={4} /></div><span style={{ fontSize: 13, fontWeight: 700, color: sub.c }}>{sub.pct}%</span><span style={{ color: C.td, fontSize: 11 }}>{expSub === sub.id ? "▾" : "▸"}</span></div>
                  </div>
                  {expSub === sub.id && sub.topics.length > 0 && (
                    <div style={{ padding: "4px 0 8px" }}>
                      {sub.topics.filter(t => { if (filter === "all") return true; if (filter === "untouched") return t.s === "untouched"; if (filter === "needs_revision") return t.fsrs === "Fading" || t.fsrs === "Stale" || t.fsrs === "Decayed"; if (filter === "weak") return t.s === "weak"; if (filter === "exam_ready") return t.s === "exam_ready"; return true; }).map((t, ti) => {
                        const cfg = sCfg[t.s];
                        return (
                          <div key={ti} style={{ background: C.cd, border: `1px solid ${C.bd}`, borderLeft: `3px solid ${cfg.c}`, borderRadius: 12, padding: 14, marginBottom: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 4 }}>{t.n}</div>
                            <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                              <span style={pill(cfg.b, cfg.c)}>{cfg.l}</span>
                              {t.fsrs && <span style={{ fontSize: 10, fontWeight: 600, color: rC[t.fsrs] }}>↻ {t.fsrs}</span>}
                              <span style={{ fontSize: 10, color: C.td }}>PYQ: {t.pyq}</span>
                            </div>
                            {t.co ? (
                              <div style={{ background: C.sf, borderRadius: 8, padding: "8px 10px", fontSize: 11, lineHeight: 1.9 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.td }}>Covered</span><span style={{ color: C.tx, fontWeight: 500 }}>{t.co}</span></div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.td }}>Last revised</span><span style={{ color: t.lr ? C.tx : C.dn, fontWeight: 500 }}>{t.lr || "Never"}</span></div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.td }}>Next revision</span><span style={{ color: t.nr === "Overdue" ? C.dn : C.ac, fontWeight: 600 }}>{t.nr}</span></div>
                                {t.notes?.length > 0 && (
                                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.bd}` }}>
                                    {t.notes.map((n, ni) => <div key={ni} style={{ marginBottom: 3 }}>{n.type === "text" ? <span style={{ color: C.wn, fontStyle: "italic" }}>📝 {n.v}</span> : <span style={{ color: C.pp }}>📎 {n.v}</span>}</div>)}
                                    <div style={{ color: C.ac, fontSize: 10, marginTop: 4, cursor: "pointer" }}>+ Add note or link</div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={{ background: C.sf, borderRadius: 8, padding: 10, textAlign: "center" }}><span style={{ fontSize: 12, color: C.tm }}>Not started yet</span></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {expSub === sub.id && sub.topics.length === 0 && <div style={{ padding: "8px 6px 12px", fontSize: 12, color: C.tm, fontStyle: "italic" }}>{sub.tt} topics — expand in full app</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// REVISION HUB
// ════════════════════════════════════════════════════════
function Revision() {
  const due = [
    { top: "Fundamental Rights", sub: "Polity", u: "Fading", c: C.wn },
    { top: "Monsoon Mechanism", sub: "Geography", u: "Stale", c: C.or },
    { top: "1857 Revolt — Causes", sub: "History", u: "Decayed", c: C.dn },
    { top: "Balance of Payments", sub: "Economics", u: "Fading", c: C.wn },
  ];
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={mbox(C.dn, C.dd)}><div style={{ fontSize: 28, fontWeight: 800, color: C.dn }}>4</div><div style={{ fontSize: 11, color: C.td }}>Due today</div></div>
        <div style={mbox(C.wn, C.wd)}><div style={{ fontSize: 28, fontWeight: 800, color: C.wn }}>7</div><div style={{ fontSize: 11, color: C.td }}>This week</div></div>
        <div style={mbox(C.gn, C.gd)}><div style={{ fontSize: 28, fontWeight: 800, color: C.gn }}>82%</div><div style={{ fontSize: 11, color: C.td }}>Retention</div></div>
      </div>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
          <span style={sec}>Memory Health</span>
          <Tip text="We track how well you remember each topic. 'Fresh' = solid. 'Decayed' = likely forgotten, needs revision." />
        </div>
        <div style={{ display: "flex", gap: 2, height: 26, borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
          {[{ w: "35%", c: C.gn, l: "Fresh 35%" }, { w: "25%", c: C.wn, l: "Fading 25%" }, { w: "22%", c: C.or, l: "Stale 22%" }, { w: "18%", c: C.dn, l: "Decayed 18%" }].map((s, i) => (
            <div key={i} style={{ width: s.w, background: s.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: i === 3 ? "#fff" : C.bg }}>{s.l}</div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.td }}>142 topics · Predicted <b style={{ color: C.gn }}>82% retention</b> on exam day</div>
      </div>
      <div style={sec}>Revise Today</div>
      {due.map((t, i) => (
        <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `3px solid ${t.c}` }}>
          <div><div style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>{t.top}</div><div style={{ fontSize: 11, color: C.td }}>{t.sub}</div></div>
          <span style={pill(t.c + "22", t.c)}>{t.u}</span>
        </div>
      ))}
      <div style={{ ...sec, marginTop: 8 }}>Coming Up</div>
      {[{ top: "Preamble", sub: "Polity", d: "3 days", c: C.gn }, { top: "Ocean Currents", sub: "Geo", d: "5 days", c: C.ac }].map((t, i) => (
        <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.6 }}>
          <div><div style={{ fontSize: 13, color: C.tx }}>{t.top}</div><div style={{ fontSize: 11, color: C.td }}>{t.sub}</div></div>
          <span style={{ fontSize: 12, color: t.c }}>in {t.d}</span>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// MOCKS — with Log New Test
// ════════════════════════════════════════════════════════
function Mocks() {
  const [showAdd, setShowAdd] = useState(false);
  const tests = [
    { name: "Prelims Sectional — GS1", date: "Feb 28", score: 47, total: 100, pct: 47 },
    { name: "Full Mock Prelims #3", date: "Feb 22", score: 82, total: 200, pct: 41 },
    { name: "Prelims Sectional — GS3", date: "Feb 15", score: 52, total: 100, pct: 52 },
    { name: "Full Mock Prelims #2", date: "Feb 8", score: 90, total: 200, pct: 45 },
    { name: "Full Mock Prelims #1", date: "Jan 25", score: 68, total: 200, pct: 34 },
  ];
  const subAcc = [{ s: "Polity", pct: 72, c: C.gn }, { s: "Environment", pct: 65, c: C.ac }, { s: "Geography", pct: 58, c: C.ac }, { s: "History", pct: 45, c: C.wn }, { s: "Economics", pct: 32, c: C.dn }, { s: "Science", pct: 28, c: C.dn }];
  const mistakes = [{ topic: "Balance of Payments", sub: "Economics", times: 4, c: C.dn }, { topic: "Governor Generals chronology", sub: "History", times: 3, c: C.dn }, { topic: "Jet Streams vs Westerlies", sub: "Geography", times: 3, c: C.wn }];

  return (
    <div>
      {/* Log New Test */}
      {!showAdd ? (
        <div onClick={() => setShowAdd(true)} style={{ ...card, border: `1px dashed ${C.ac}55`, background: "transparent", textAlign: "center", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 18, color: C.ac }}>+</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ac }}>Log New Mock Test</span>
        </div>
      ) : (
        <div style={{ ...card, border: `1px solid ${C.ac}44` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.tx }}>Log Mock Test</span>
            <span onClick={() => setShowAdd(false)} style={{ color: C.td, cursor: "pointer" }}>✕</span>
          </div>
          <div style={{ background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: C.tm, marginBottom: 10 }}>Test name (e.g. Full Mock #4)</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: C.tm }}>Your score</div>
            <div style={{ flex: 1, background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: C.tm }}>Out of</div>
          </div>
          <div style={sec}>Subject-wise (optional)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {["Polity", "History", "Geo", "Eco", "Sci", "Env"].map(s => (
              <div key={s} style={{ background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 8, padding: "6px 10px", fontSize: 11, color: C.tm }}>{s}: __/__</div>
            ))}
          </div>
          <div onClick={() => setShowAdd(false)} style={{ background: C.ac, color: C.bg, fontWeight: 700, fontSize: 13, padding: "10px", borderRadius: 12, textAlign: "center", cursor: "pointer" }}>Save Test</div>
        </div>
      )}

      {/* Score trend */}
      <div style={card}>
        <div style={sec}>Score Trend</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 100, marginBottom: 10 }}>
          {tests.slice().reverse().map((t, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: t.pct >= 45 ? C.gn : t.pct >= 35 ? C.wn : C.dn, marginBottom: 4 }}>{t.pct}%</div>
              <div style={{ width: "100%", maxWidth: 32, height: `${(t.pct / 60) * 80}px`, background: t.pct >= 45 ? C.gn : t.pct >= 35 ? C.wn : C.dn, borderRadius: "6px 6px 0 0" }} />
              <div style={{ fontSize: 8, color: C.tm, marginTop: 4 }}>{t.date.split(" ")[0]}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.gn, fontWeight: 600 }}>↑ Trending up: 34% → 47% over 5 tests</div>
      </div>

      {/* Subject accuracy */}
      <div style={card}>
        <div style={sec}>Subject-wise Accuracy</div>
        {subAcc.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 75, fontSize: 12, color: C.tx, fontWeight: 500 }}>{s.s}</div>
            <div style={{ flex: 1 }}><Bar p={s.pct} c={s.c} h={8} /></div>
          </div>
        ))}
      </div>

      {/* Repeated mistakes */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
          <span style={sec}>Repeated Mistakes</span>
          <Tip text="Topics you keep getting wrong across tests. These need targeted PYQ practice, not just re-reading." />
        </div>
        {mistakes.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < mistakes.length - 1 ? `1px solid ${C.bd}` : "none" }}>
            <div><div style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>{m.topic}</div><div style={{ fontSize: 11, color: C.td }}>{m.sub}</div></div>
            <span style={pill(m.c + "22", m.c)}>Wrong {m.times}x</span>
          </div>
        ))}
        <div style={{ fontSize: 11, color: C.td, marginTop: 10 }}>💡 Auto-flagged for intensive revision next week</div>
      </div>

      {/* Recent tests list */}
      <div style={sec}>Recent Tests</div>
      {tests.map((t, i) => (
        <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>{t.name}</div><div style={{ fontSize: 11, color: C.td }}>{t.date}</div></div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.pct >= 45 ? C.gn : t.pct >= 35 ? C.wn : C.dn }}>{t.score}/{t.total}</div>
            <div style={{ fontSize: 11, color: C.td }}>{t.pct}%</div>
          </div>
        </div>
      ))}
      <Note><b>V4 fix:</b> "Log New Mock" button at top — enter test name, score, optional subject breakdown. Closes the input loop that was completely missing.</Note>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// WEEK PLAN — with task move/defer, first-week tentative
// ════════════════════════════════════════════════════════
function WeekPlan({ examMode, daysUsed }) {
  const [activeWeek, setActiveWeek] = useState("current");
  const [expDay, setExpDay] = useState(null);
  const [movePicker, setMovePicker] = useState(null); // { dayIdx, taskIdx }
  const isMains = examMode === "mains";
  const isFirst = daysUsed <= 7;

  const fullWeek = [
    { day: "Mon, Mar 3", hrs: 6, st: "today", tasks: [
      { sub: "Polity", top: "Fundamental Rights", t: 90, tag: "NEW", tc: C.ac },
      { sub: "Geography", top: "Monsoon Mechanism", t: 60, tag: "REV", tc: C.pp },
      { sub: "Economics", top: "Balance of Payments", t: 75, tag: "NEW", tc: C.ac },
      { sub: "History", top: "1857 Revolt", t: 45, tag: "DECAY", tc: C.dn },
      { sub: "CA", top: "Daily reading", t: 45, tag: "CA", tc: C.wn },
    ]},
    { day: "Tue, Mar 4", hrs: 6, st: "up", tasks: [
      { sub: "Polity", top: "DPSP & Duties", t: 90, tag: "NEW", tc: C.ac },
      { sub: "Economics", top: "Fiscal Policy", t: 75, tag: "NEW", tc: C.ac },
      { sub: "Environment", top: "Biodiversity Hotspots", t: 60, tag: "REV", tc: C.pp },
      ...(isMains ? [{ sub: "Ans Writing", top: "GS2 — Governance Q", t: 45, tag: "MAINS", tc: C.pp }] : []),
      { sub: "CA", top: "Daily reading", t: 45, tag: "CA", tc: C.wn },
    ]},
    { day: "Wed, Mar 5", hrs: 5.5, st: "up", tasks: [
      { sub: "History", top: "Social Reform Movements", t: 75, tag: "REV", tc: C.pp },
      { sub: "Science", top: "Space Tech — ISRO", t: 90, tag: "NEW", tc: C.ac },
      ...(isMains ? [{ sub: "Ans Writing", top: "GS1 — History Q", t: 45, tag: "MAINS", tc: C.pp }] : []),
      { sub: "CA", top: "Daily reading", t: 45, tag: "CA", tc: C.wn },
    ]},
    { day: "Thu, Mar 6", hrs: 5, st: "up", tasks: [
      { sub: "Geography", top: "Jet Streams", t: 75, tag: "NEW", tc: C.ac },
      { sub: "Economics", top: "Banking System", t: 60, tag: "NEW", tc: C.ac },
      { sub: "Ethics", top: "Thinkers — Kant & Mill", t: 60, tag: "NEW", tc: C.ac },
      { sub: "CA", top: "Daily reading", t: 45, tag: "CA", tc: C.wn },
    ]},
    { day: "Fri, Mar 7", hrs: 5.5, st: "up", tasks: [
      { sub: "Polity", top: "Parliament — Sessions", t: 90, tag: "NEW", tc: C.ac },
      { sub: "History", top: "Gandhi — NCM, CDM", t: 60, tag: "DECAY", tc: C.dn },
      ...(isMains ? [{ sub: "Ans Writing", top: "GS3 — Economy Q", t: 45, tag: "MAINS", tc: C.pp }] : []),
      { sub: "CA", top: "Daily reading", t: 45, tag: "CA", tc: C.wn },
    ]},
    { day: "Sat, Mar 8", hrs: 7, st: "up", tasks: [
      { sub: "Mock", top: "Prelims Sectional — GS1", t: 120, tag: "TEST", tc: C.gn },
      { sub: "Economics", top: "BoP + Forex", t: 75, tag: "REV", tc: C.pp },
      { sub: "CA", top: "Weekly consolidation", t: 60, tag: "CA", tc: C.wn },
    ]},
    { day: "Sun, Mar 9", hrs: 3.5, st: "up", tasks: [
      { sub: "Revision", top: "Week's weak topics", t: 90, tag: "REV", tc: C.pp },
      { sub: "Review", top: "Reflect + plan next week", t: 30, tag: "PLAN", tc: C.ac },
      { sub: "CA", top: "Daily reading", t: 45, tag: "CA", tc: C.wn },
    ]},
  ];

  // First week: only 3 days planned, rest says "we're learning your rhythm"
  const firstWeekDays = [
    ...fullWeek.slice(0, 3),
    { day: "Thu – Sun", hrs: 0, st: "learning", tasks: [{ sub: "Adjusting", top: "We're learning your study rhythm. These days will auto-plan from week 2.", t: 0, tag: "AUTO", tc: C.td }] },
  ];

  const currentDays = isFirst ? firstWeekDays : fullWeek;

  const nextWeek = {
    days: [
      { day: "Mon, Mar 10", hrs: 6, st: "up", tasks: [
        { sub: "Polity", top: "Judiciary", t: 90, tag: "NEW", tc: C.ac },
        { sub: "Geography", top: "Oceanography", t: 75, tag: "NEW", tc: C.ac },
        { sub: "Economics", top: "Monetary Policy", t: 60, tag: "NEW", tc: C.ac },
        { sub: "CA", top: "Daily reading", t: 45, tag: "CA", tc: C.wn },
      ]},
      { day: "Tue, Mar 11", hrs: 6, st: "up", tasks: [
        { sub: "History", top: "Revolutionary Movements", t: 90, tag: "NEW", tc: C.ac },
        { sub: "Science", top: "Nuclear Tech", t: 60, tag: "NEW", tc: C.ac },
        { sub: "Polity", top: "Fundamental Rights", t: 45, tag: "DECAY", tc: C.dn },
        { sub: "CA", top: "Daily reading", t: 45, tag: "CA", tc: C.wn },
      ]},
      { day: "Wed – Sun", hrs: 28, st: "auto", tasks: [{ sub: "Auto", top: "Adjusts based on this week's progress", t: 0, tag: "AUTO", tc: C.td }] },
    ],
  };

  const days = activeWeek === "current" ? currentDays : nextWeek.days;
  const allTasks = days.flatMap(d => d.tasks).filter(t => t.t > 0);
  const totalMins = allTasks.reduce((s, t) => s + t.t, 0) || 1;
  const byTag = {}; allTasks.forEach(t => { byTag[t.tag] = (byTag[t.tag] || 0) + t.t; });
  const totalHrs = days.reduce((s, d) => s + d.hrs, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["current", "next"].map(w => (
          <button key={w} onClick={() => { setActiveWeek(w); setExpDay(null); }} style={{ flex: 1, background: activeWeek === w ? C.ac : "transparent", color: activeWeek === w ? C.bg : C.td, border: activeWeek === w ? "none" : `1px solid ${C.bd}`, borderRadius: 12, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {w === "current" ? "This Week" : "Next Week"}
          </button>
        ))}
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.tx }}>{activeWeek === "current" ? "Mar 3 – Mar 9" : "Mar 10 – Mar 16"}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.ac }}>{totalHrs}<span style={{ fontSize: 12, color: C.td }}>/42 hrs</span></div>
        </div>
        <Bar p={Math.round((totalHrs / 42) * 100)} c={C.ac} h={6} />
        {totalMins > 1 && (
          <div style={{ display: "flex", gap: 2, height: 20, borderRadius: 4, overflow: "hidden", marginTop: 12 }}>
            {[{ l: "NEW", c: C.ac, w: byTag["NEW"] || 0 }, { l: "REV", c: C.pp, w: (byTag["REV"] || 0) + (byTag["DECAY"] || 0) }, { l: "CA", c: C.wn, w: byTag["CA"] || 0 }, { l: "TEST", c: C.gn, w: byTag["TEST"] || 0 }, ...(isMains ? [{ l: "MAINS", c: "#8B5CF6", w: byTag["MAINS"] || 0 }] : [])].filter(s => s.w > 0).map((s, i) => (
              <div key={i} style={{ width: `${(s.w / totalMins) * 100}%`, background: s.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.bg, minWidth: 20 }}>{s.l}</div>
            ))}
          </div>
        )}
      </div>

      {/* First week notice */}
      {isFirst && activeWeek === "current" && (
        <div style={{ ...card, border: `1px solid ${C.pp}33`, background: C.pd }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.pp, marginBottom: 4 }}>Your first week is tentative</div>
          <div style={{ fontSize: 11, color: C.td, lineHeight: 1.6 }}>We've planned 3 days to start. The rest adjusts as we learn your rhythm. Full 7-day plans begin from week 2.</div>
        </div>
      )}

      {/* Days */}
      {days.map((d, di) => (
        <div key={di} style={{ marginBottom: 6 }}>
          <div onClick={() => setExpDay(expDay === di ? null : di)} style={{
            ...card, marginBottom: 0, cursor: "pointer",
            borderLeft: `3px solid ${d.st === "today" ? C.ac : d.st === "learning" || d.st === "auto" ? C.td : C.bd}`,
            background: d.st === "today" ? `${C.ac}08` : C.cd,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>{d.day}</span>
                  {d.st === "today" && <span style={pill(C.ad, C.ac)}>TODAY</span>}
                  {(d.st === "auto" || d.st === "learning") && <span style={pill(`${C.td}22`, C.td)}>{isFirst ? "LEARNING" : "AUTO"}</span>}
                </div>
                <div style={{ fontSize: 11, color: C.td, marginTop: 2 }}>{d.tasks.length} tasks{d.hrs > 0 ? ` · ${d.hrs} hrs` : ""}</div>
              </div>
              <span style={{ color: C.td, fontSize: 12 }}>{expDay === di ? "▾" : "▸"}</span>
            </div>
          </div>
          {expDay === di && (
            <div style={{ background: C.sf, border: `1px solid ${C.bd}`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "6px 10px" }}>
              {d.tasks.map((t, ti) => (
                <div key={ti} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px", borderBottom: ti < d.tasks.length - 1 ? `1px solid ${C.bd}` : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={pill(t.tc + "22", t.tc)}>{t.tag}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.tx }}>{t.sub}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.td, marginTop: 2, marginLeft: 2 }}>{t.top}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {t.t > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: C.td }}>{t.t}m</span>}
                    {t.t > 0 && (
                      <div style={{ display: "flex", gap: 3, position: "relative" }}>
                        <span onClick={() => setMovePicker(movePicker?.dayIdx === di && movePicker?.taskIdx === ti ? null : { dayIdx: di, taskIdx: ti })} style={{ fontSize: 9, color: C.td, background: C.bd, borderRadius: 4, padding: "2px 5px", cursor: "pointer" }}>Move</span>
                        <span style={{ fontSize: 9, color: C.wn, background: C.wd, borderRadius: 4, padding: "2px 5px", cursor: "pointer" }}>Defer</span>
                        {movePicker?.dayIdx === di && movePicker?.taskIdx === ti && (
                          <div style={{ position: "absolute", top: -32, right: 0, display: "flex", gap: 2, background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 8, padding: 4, zIndex: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dayI) => (
                              <span key={day} onClick={() => setMovePicker(null)} style={{ fontSize: 9, fontWeight: 600, padding: "3px 5px", borderRadius: 4, cursor: "pointer", background: dayI === di ? C.ac + "22" : "transparent", color: dayI === di ? C.ac : dayI < di ? C.tm : C.td }}>{day}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <Note><b>V4 fixes:</b> First week shows only 3 planned days + "learning your rhythm" placeholder. Task-level Move (opens day picker — past days grayed out) and Defer buttons. Mains-tagged answer writing tasks in week view.</Note>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// WEEKLY REVIEW — coverage vs understanding gaps
// ════════════════════════════════════════════════════════
function Weekly({ daysUsed }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hrs = [5.5, 6, 4, 6.5, 3, 7, 5];
  const mx = Math.max(...hrs);
  const isFresh = daysUsed < 21;

  return (
    <div>
      <div style={{ fontSize: 14, color: C.td, marginBottom: 18 }}>Week of Feb 24 – Mar 2</div>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, marginBottom: 10 }}>
          {days.map((d, i) => (
            <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "100%", maxWidth: 28, height: `${(hrs[i] / mx) * 80}px`, background: hrs[i] >= 5 ? C.ac : hrs[i] >= 3 ? C.wn : C.dn, borderRadius: "6px 6px 0 0" }} />
              <div style={{ fontSize: 10, color: C.td, marginTop: 4 }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: C.td }}>Total: 37 hrs</span>
          <span style={{ fontSize: 12, color: C.ac }}>Avg: 5.3/day</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={mbox(C.gn, C.gd)}><div style={{ fontSize: 20, fontWeight: 800, color: C.gn }}>18/24</div><div style={{ fontSize: 11, color: C.td }}>Tasks</div></div>
        <div style={mbox(C.pp, C.pd)}><div style={{ fontSize: 20, fontWeight: 800, color: C.pp }}>12</div><div style={{ fontSize: 11, color: C.td }}>Revised</div></div>
        <div style={mbox(C.ac, C.ad)}><div style={{ fontSize: 20, fontWeight: 800, color: C.ac }}>+3%</div><div style={{ fontSize: 11, color: C.td }}>Readiness</div></div>
      </div>

      {/* Adaptive reflection */}
      <div style={card}>
        <div style={sec}>{isFresh ? "Quick Check-in" : "Weekly Reflection"}</div>
        {(isFresh
          ? ["Did you mostly follow the daily plan?", "One subject that felt manageable?", "Any topic you want to revisit?"]
          : ["What felt easy this week?", "Where did you get stuck?", "One thing to change next week?"]
        ).map((q, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: C.tx, fontWeight: 500, marginBottom: 6 }}>{q}</div>
            <div style={{ background: C.sf, border: `1px solid ${C.bd}`, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: C.tm, minHeight: 36 }}>Tap to write...</div>
          </div>
        ))}
      </div>

      {/* Smarter recommendation — coverage vs understanding */}
      <div style={{ ...card, border: `1px solid ${C.ac}33`, background: C.ad }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ac, marginBottom: 8 }}>Recalibration Engine</div>
        <div style={{ fontSize: 12, color: C.tx, lineHeight: 1.7 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ ...pill(C.dd, C.dn), flexShrink: 0, marginTop: 2 }}>Coverage gap</span>
            <span>Economics at 22% — shift 2 Polity sessions to Economics. Polity is at 58%, well ahead.</span>
          </div>
          {!isFresh && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ ...pill(C.wd, C.wn), flexShrink: 0, marginTop: 2 }}>Understanding</span>
              <span>Geography accuracy dropped to 42% in last mock despite 41% coverage. Try PYQs from Climatology — re-reading notes isn't enough.</span>
            </div>
          )}
        </div>
      </div>

      <Note><b>V4 fix:</b> Recalibration now tags suggestions as "Coverage gap" vs "Understanding gap." Freshers see simpler reflection prompts. Veterans get mock-data-informed recommendations.</Note>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// LOW DAY MODE
// ════════════════════════════════════════════════════════
function LowDay({ onNavigate }) {
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${C.pd} 0%, ${C.cd} 70%)`, borderRadius: 18, padding: 28, textAlign: "center", marginBottom: 20, border: `1px solid ${C.pp}33` }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🌊</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.tx, marginBottom: 6 }}>Low energy day? That's okay.</div>
        <div style={{ fontSize: 13, color: C.td, lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>Every topper had off days. The goal isn't 6 hours — it's staying in the game.</div>
      </div>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.tx }}>Minimum Viable Day</span>
          <span style={pill(C.pd, C.pp)}>~2 hrs</span>
        </div>
        {[{ task: "Revise 1 fading topic", time: "30 min", icon: "↻" }, { task: "Read current affairs", time: "30 min", icon: "📰" }, { task: "1 PYQ set — any subject", time: "45 min", icon: "📝" }].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.bd}` : "none" }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <div style={{ flex: 1, fontSize: 13, color: C.tx }}>{t.task}</div>
            <span style={{ fontSize: 12, color: C.td }}>{t.time}</span>
          </div>
        ))}
      </div>
      <div style={card}>
        <div style={sec}>Hidden Today</div>
        <div style={{ fontSize: 12, color: C.td, lineHeight: 1.9 }}>
          {["✗ Full task list → 3 essentials only", "✗ Readiness score → rest day", "✗ Backlog → zero guilt", "✗ Streak → grace day, won't break", "✗ Velocity → rest is part of the plan"].map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 10 }}><span onClick={() => onNavigate && onNavigate("dash")} style={{ fontSize: 12, color: C.ac, cursor: "pointer" }}>Feeling better? → Switch to full mode</span></div>
      <div style={{ fontSize: 10, color: C.tm, textAlign: "center", marginTop: 4 }}>Returns to Dashboard with full plan — Low Day is a view, not a mode</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// RANKER MODE
// ════════════════════════════════════════════════════════
function Ranker() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 22 }}>🔥</span>
        <div><div style={{ fontSize: 16, fontWeight: 800, color: C.tx }}>Ranker Mode</div><div style={{ fontSize: 12, color: C.td }}>8+ hrs/day · Top 100 target</div></div>
      </div>
      <div style={card}>
        <div style={sec}>Velocity Intelligence</div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={mbox(C.ac, C.ad)}><div style={{ fontSize: 18, fontWeight: 800, color: C.ac }}>3.2</div><div style={{ fontSize: 10, color: C.td }}>topics/day</div></div>
          <div style={mbox(C.gn, C.gd)}><div style={{ fontSize: 18, fontWeight: 800, color: C.gn }}>Aug 12</div><div style={{ fontSize: 10, color: C.td }}>projected</div></div>
          <div style={mbox(C.wn, C.wd)}><div style={{ fontSize: 18, fontWeight: 800, color: C.wn }}>+0.4</div><div style={{ fontSize: 10, color: C.td }}>for July</div></div>
        </div>
      </div>
      <div style={card}>
        <div style={sec}>Weakness Radar</div>
        {[{ s: "Economics", sc: 22, t: "Critical", c: C.dn }, { s: "Science", sc: 28, t: "Critical", c: C.dn }, { s: "History", sc: 38, t: "Vulnerable", c: C.wn }, { s: "Geography", sc: 52, t: "Developing", c: C.ac }].map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 75, fontSize: 12, color: C.tx }}>{w.s}</div>
            <div style={{ flex: 1 }}><Bar p={w.sc} c={w.c} h={8} /></div>
            <span style={{ ...pill(w.c + "22", w.c), minWidth: 65, textAlign: "center" }}>{w.t}</span>
          </div>
        ))}
      </div>
      <div style={card}>
        <div style={sec}>What-If Simulator</div>
        <div style={{ fontSize: 12, color: C.td, marginBottom: 12 }}>"If I go 6→8 hrs and prioritize Economics..."</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={mbox(C.gn, C.gd)}><div style={{ fontSize: 12, fontWeight: 700, color: C.gn }}>Readiness: 65→78</div></div>
          <div style={mbox(C.ac, C.ad)}><div style={{ fontSize: 12, fontWeight: 700, color: C.ac }}>Done: Jul 28</div></div>
        </div>
        <div style={{ background: C.sf, borderRadius: 10, padding: 10, fontSize: 11, color: C.td, lineHeight: 1.7, marginBottom: 6 }}>
          <div>Economics: 22% → 48% (+26%)</div>
          <div>Polity: 58% → 58% (paused 2 weeks)</div>
          <div>Mock projected: 47% → 55%</div>
        </div>
        <div style={{ fontSize: 11, color: C.wn }}>⚠ Burnout risk HIGH above 9 hrs/day</div>
      </div>
      <div style={card}>
        <div style={sec}>Answer Writing (Mains)</div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={mbox(C.pp, C.pd)}><div style={{ fontSize: 18, fontWeight: 800, color: C.pp }}>47</div><div style={{ fontSize: 10, color: C.td }}>total</div></div>
          <div style={mbox(C.ac, C.ad)}><div style={{ fontSize: 18, fontWeight: 800, color: C.ac }}>GS2</div><div style={{ fontSize: 10, color: C.td }}>weakest</div></div>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: C.td }}>GS1: 14 · GS2: 8 · GS3: 15 · GS4: 10</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// SETTINGS — V4 redesign
// ════════════════════════════════════════════════════════
function Settings({ examMode, setExamMode, attempt, daysUsed }) {
  const strategy = attempt >= 3 ? "Aggressive" : attempt === 2 ? "Balanced+" : "Balanced";
  const badges = [
    { n: "7-Day Streak", icon: "🔥", earned: true },
    { n: "First Mock", icon: "📝", earned: true },
    { n: "100 Topics", icon: "📚", earned: true },
    { n: "Night Owl", icon: "🦉", earned: true },
    { n: "Revision Master", icon: "🔄", earned: false },
    { n: "Full Syllabus", icon: "🎯", earned: false },
    { n: "Mock 50%+", icon: "⭐", earned: false },
    { n: "30-Day Streak", icon: "💎", earned: false },
  ];
  return (
    <div>
      {/* Profile */}
      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.tx, marginBottom: 4 }}>Amit</div>
        <div style={{ fontSize: 12, color: C.td, marginBottom: 8 }}>amit@example.com</div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={mbox(C.ac, C.ad)}><div style={{ fontSize: 18, fontWeight: 800, color: C.ac }}>{127}</div><div style={{ fontSize: 10, color: C.td }}>days left</div></div>
          <div style={mbox(C.pp, C.pd)}><div style={{ fontSize: 18, fontWeight: 800, color: C.pp }}>Day {daysUsed}</div><div style={{ fontSize: 10, color: C.td }}>of prep</div></div>
        </div>
      </div>

      {/* Exam Mode */}
      <div style={card}>
        <div style={sec}>Exam Mode</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["prelims", "mains", "post_prelims"].map(m => (
            <div key={m} onClick={() => setExamMode(m === "post_prelims" ? "mains" : m)} style={{
              flex: 1, textAlign: "center", padding: "10px 6px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: examMode === m ? (m === "prelims" ? C.ad : C.pd) : C.sf,
              color: examMode === m ? (m === "prelims" ? C.ac : C.pp) : C.td,
              border: `1px solid ${examMode === m ? (m === "prelims" ? C.ac + "44" : C.pp + "44") : C.bd}`,
            }}>{m === "post_prelims" ? "Post-Prelims" : m.charAt(0).toUpperCase() + m.slice(1)}</div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.td, marginTop: 8 }}>Switching mode regenerates tomorrow's plan and adjusts subject priorities.</div>
      </div>

      {/* Study Preference */}
      <div style={card}>
        <div style={sec}>Study Preference</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ l: "Sequential", d: "One subject at a time" }, { l: "Mixed", d: "2-3 subjects daily" }].map((o, i) => (
            <div key={i} style={{ flex: 1, background: i === 1 ? C.ad : C.sf, border: `1px solid ${i === 1 ? C.ac + "44" : C.bd}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: i === 1 ? C.ac : C.tx }}>{o.l}</div>
              <div style={{ fontSize: 11, color: C.td, marginTop: 2 }}>{o.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Hours */}
      <div style={card}>
        <div style={sec}>Daily Target</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.ac }}>6</div>
          <div style={{ fontSize: 13, color: C.td }}>hrs / day</div>
        </div>
        <input type="range" min="2" max="12" step="0.5" value={6} readOnly style={{ width: "100%", accentColor: C.ac, marginTop: 8 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.tm }}><span>2 hrs</span><span>12 hrs</span></div>
      </div>

      {/* Achievements */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={sec}>Achievements</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.pp }}>Level 8</span>
            <span style={{ fontSize: 11, color: C.td }}>· 2,450 XP</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <div style={mbox(C.wn, C.wd)}><div style={{ fontSize: 20, fontWeight: 800, color: C.wn }}>12</div><div style={{ fontSize: 10, color: C.td }}>day streak</div></div>
          <div style={mbox(C.gn, C.gd)}><div style={{ fontSize: 20, fontWeight: 800, color: C.gn }}>4/8</div><div style={{ fontSize: 10, color: C.td }}>badges</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {badges.map((b, i) => (
            <div key={i} style={{ textAlign: "center", padding: 8, borderRadius: 10, background: b.earned ? C.sf : `${C.tm}11`, border: `1px solid ${b.earned ? C.bd : "transparent"}`, opacity: b.earned ? 1 : 0.4 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{b.icon}</div>
              <div style={{ fontSize: 9, color: b.earned ? C.tx : C.tm, fontWeight: 500 }}>{b.n}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy (read-only) */}
      <div style={card}>
        <div style={sec}>Strategy Mode</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={pill(C.ad, C.ac)}>{strategy}</span>
          <span style={{ fontSize: 12, color: C.td }}>Auto-calculated</span>
        </div>
        <div style={{ fontSize: 11, color: C.tm, lineHeight: 1.6 }}>Based on your attempt ({attempt === 1 ? "1st" : attempt === 2 ? "2nd" : "3rd+"}), daily hours (6), and schedule (full-time). This adjusts automatically — no manual override needed.</div>
      </div>

      {/* Actions */}
      <div style={card}>
        {[
          { l: "Redo Onboarding", d: "Start fresh with new preferences", c: C.wn },
          { l: "Notifications", d: "Daily reminders, weekly review alerts", c: C.ac },
          { l: "About ExamPilot", d: "Version 4.0", c: C.td },
          { l: "Logout", d: "", c: C.dn },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 3 ? `1px solid ${C.bd}` : "none", cursor: "pointer" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: item.c }}>{item.l}</div>
              {item.d && <div style={{ fontSize: 11, color: C.tm, marginTop: 2 }}>{item.d}</div>}
            </div>
            <span style={{ color: C.td }}>▸</span>
          </div>
        ))}
      </div>

      <Note>
        <b>V4 changes from V2 Settings:</b> Removed 12 parameter sliders (auto-managed). Removed manual strategy mode switcher. Added Achievements section (badges + XP moved here from dashboard). Strategy mode now read-only with explanation. Study preference (sequential/mixed) visible and editable.
      </Note>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════
const allScreens = [
  { id: "onboard", l: "Onboarding", d: 0, dv: 0 },
  { id: "dash", l: "Dashboard", d: 0, dv: 0 },
  { id: "plan", l: "Planner", d: 0, dv: 0 },
  { id: "weekplan", l: "Week Plan", d: 0, dv: 0 },
  { id: "syll", l: "Syllabus", d: 0, dv: 0 },
  { id: "rev", l: "Revision", d: 3, dv: 0 },
  { id: "full", l: "Full Syllabus", d: 14, dv: 0 },
  { id: "mocks", l: "Mocks", d: 7, dv: 0 },
  { id: "week", l: "Review", d: 7, dv: 0 },
  { id: "low", l: "Low Day", d: 7, dv: 3 },
  { id: "rank", l: "Ranker", d: 30, dv: 0 },
  { id: "settings", l: "Settings", d: 0, dv: 0 },
];

export default function App() {
  const [active, setActive] = useState("dash");
  const [showLog, setShowLog] = useState(false);
  const [daysUsed, setDaysUsed] = useState(45);
  const [examMode, setExamMode] = useState("prelims");
  const [attempt, setAttempt] = useState(1);

  const vet = attempt >= 2;
  const visible = allScreens.filter(s => daysUsed >= (vet ? s.dv : s.d));

  const handleComplete = (data) => { if (data?.attempt) setAttempt(data.attempt); setActive("dash"); };

  const screen = () => {
    switch (active) {
      case "onboard": return <Onboarding onComplete={handleComplete} />;
      case "dash": return <Dashboard examMode={examMode} daysUsed={daysUsed} onNavigate={setActive} />;
      case "plan": return <Planner daysUsed={daysUsed} />;
      case "weekplan": return <WeekPlan examMode={examMode} daysUsed={daysUsed} />;
      case "syll": return <Syllabus daysUsed={daysUsed} />;
      case "full": return <FullSyllabus daysUsed={daysUsed} />;
      case "rev": return <Revision />;
      case "mocks": return <Mocks />;
      case "week": return <Weekly daysUsed={daysUsed} />;
      case "low": return <LowDay onNavigate={setActive} />;
      case "rank": return <Ranker />;
      case "settings": return <Settings examMode={examMode} setExamMode={setExamMode} attempt={attempt} daysUsed={daysUsed} />;
      default: return <Dashboard examMode={examMode} daysUsed={daysUsed} />;
    }
  };

  return (
    <div style={{ fontFamily: `'Segoe UI', system-ui, sans-serif`, background: C.bg, minHeight: "100vh", color: C.tx }}>
      {/* DEMO CONTROLS */}
      <div style={{ background: "#0D0D1A", borderBottom: `1px solid #F97316`, padding: "8px 16px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.or, letterSpacing: 1.2, marginBottom: 6 }}>⚙ DEMO CONTROLS — NOT PART OF APP</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.td }}>Day:</span>
            {[1, 7, 21, 45].map(d => <button key={d} onClick={() => setDaysUsed(d)} style={{ background: daysUsed === d ? C.ac : "transparent", color: daysUsed === d ? C.bg : C.td, border: `1px solid ${daysUsed === d ? C.ac : C.bd}`, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{d}</button>)}
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.td }}>Attempt:</span>
            {[1, 2, 3].map(a => <button key={a} onClick={() => setAttempt(a)} style={{ background: attempt === a ? C.pp : "transparent", color: attempt === a ? C.bg : C.td, border: `1px solid ${attempt === a ? C.pp : C.bd}`, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{a === 3 ? "3+" : a}</button>)}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["prelims", "mains"].map(m => <button key={m} onClick={() => setExamMode(m)} style={{ background: examMode === m ? (m === "mains" ? C.pp : C.ac) : "transparent", color: examMode === m ? C.bg : C.td, border: `1px solid ${examMode === m ? "transparent" : C.bd}`, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer", textTransform: "uppercase" }}>{m}</button>)}
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ display: "flex", gap: 6, padding: "10px 14px 8px", overflowX: "auto", borderBottom: `1px solid ${C.bd}`, position: "sticky", top: 0, background: C.bg, zIndex: 10 }}>
        {visible.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)} style={{ background: active === s.id ? C.ac : "transparent", color: active === s.id ? C.bg : C.td, border: active === s.id ? "none" : `1px solid ${C.bd}`, borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            {s.l}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 460, margin: "0 auto", paddingBottom: 80 }}>{screen()}</div>

      {/* Quick Log FAB */}
      <div onClick={() => setShowLog(true)} style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, background: C.ac, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 20px ${C.ac}44`, zIndex: 50 }}>+</div>
      <div style={{ position: "fixed", bottom: 28, right: 88, fontSize: 11, color: C.td, background: C.cd, border: `1px solid ${C.bd}`, padding: "5px 10px", borderRadius: 8, zIndex: 50 }}>Quick Log</div>

      <QuickLog show={showLog} onClose={() => setShowLog(false)} />
    </div>
  );
}
