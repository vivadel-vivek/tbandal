/* eslint-disable */
// =====================================================================
// REVIEW MODAL — user rates a tea
// Basic mode: 6 axes (0-5) + 0-5 score · Advanced mode: 12 axes (0-10) + 0-10 score
// Internally everything is normalized to the 12-axis 0-10 scale so
// downstream consumers (radar, recommender) don't need to care.
// =====================================================================
const { Eyebrow: RME, Button: RMB, RadarChart: RMRC } = window.UI;
const { FLAVOR_AXES: RMFA, BASIC_AXES: RMBA, rollUpProfile: RMRoll } = window.AppData;
const { useState: rmuS } = React;

function ReviewModal({ tea, onClose, onSubmit, initial, defaultFlavorMode = "advanced" }) {
  // Score is always stored as 0-10 internally
  const [score, setScore] = rmuS(initial?.rating || 7.5);
  const [body, setBody] = rmuS(initial?.body || "");
  const [session, setSession] = rmuS(initial?.session || "");
  // Profile is always stored as 12 axes × 0-10
  const baseProfile = initial?.profile || (tea ? Object.fromEntries(RMFA.map(a => [a.key, 4])) : {});
  const [profile, setProfile] = rmuS(baseProfile);
  const [mode, setMode] = rmuS(initial?.scale || defaultFlavorMode);
  const isBasic = mode === "basic";

  if (!tea) return null;

  const setAxis = (key, v) => setProfile(p => ({ ...p, [key]: Number(v) }));
  // In basic mode, setting one of the 6 axes updates both constituent advanced
  // axes to value × 2 so the internal 0-10 representation stays correct.
  const setBasicAxis = (basicKey, v5) => {
    const ax = RMBA.find(a => a.key === basicKey);
    if (!ax) return;
    const v10 = Number(v5) * 2;
    setProfile(p => {
      const next = { ...p };
      for (const k of ax.members) next[k] = v10;
      return next;
    });
  };

  // Rolled-up basic view of the profile for the basic-mode sliders & radar
  const basicProfile = RMRoll(profile);

  const handleSubmit = () => {
    onSubmit({
      rating: Number(score),
      body: body.trim() || "(no notes)",
      session: session.trim(),
      profile,
      scale: mode, // "basic" | "advanced" — preserved for display
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(31,26,24,0.55)",
      zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "5vh 20px", overflowY: "auto",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-elevated)", borderRadius: "var(--r-2xl)",
        boxShadow: "var(--shadow-elevated)",
        maxWidth: 880, width: "100%",
        border: "1px solid rgba(212,196,160,0.4)",
        position: "relative",
      }}>
        {/* Header */}
        <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid var(--warm-200)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <RME>Add your review</RME>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--burgundy)", fontWeight: 500, margin: "6px 0 4px", letterSpacing: "-0.01em", fontStyle: "italic" }}>{tea.name}</h2>
            <div style={{ fontSize: 13, color: "var(--warm-600)" }}>{tea.region} · {tea.year}</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
            <ModeToggle mode={mode} onChange={setMode} />
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--cream)", border: "1px solid var(--warm-200)",
              cursor: "pointer", color: "var(--warm-700)", fontSize: 18, lineHeight: 1,
            }}>×</button>
          </div>
        </div>

        <div style={{ padding: "24px 32px 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          {/* LEFT: score + body + brewing */}
          <div>
            <RME>Overall score</RME>
            {isBasic ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "8px 0 12px" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, lineHeight: 1 }}>{(Number(score) / 2).toFixed(1)}</span>
                  <span style={{ fontSize: 14, color: "var(--warm-500)" }}>/ 5</span>
                </div>
                <input type="range" min="0.5" max="5" step="0.5" value={Number(score) / 2}
                  onChange={e => setScore(Number(e.target.value) * 2)}
                  style={{ width: "100%", accentColor: "var(--burgundy)", marginBottom: 8 }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--warm-500)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, marginBottom: 24 }}>
                  <span>Hint</span><span>Balanced</span><span>Dominant</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "8px 0 12px" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, lineHeight: 1 }}>{Number(score).toFixed(1)}</span>
                  <span style={{ fontSize: 14, color: "var(--warm-500)" }}>/ 10</span>
                </div>
                <input type="range" min="1" max="10" step="0.1" value={score} onChange={e => setScore(e.target.value)}
                  style={{ width: "100%", accentColor: "var(--burgundy)", marginBottom: 24 }} />
              </>
            )}

            <div style={{ marginBottom: 18 }}>
              <RME>Notes</RME>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
                placeholder={isBasic ? "What did you taste? Anything stand out?" : "What did you taste? How did it evolve? What does it remind you of?"}
                style={{
                  width: "100%", marginTop: 8, padding: "12px 14px",
                  fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic",
                  background: "var(--cream)", border: "1px solid var(--warm-200)",
                  borderRadius: "var(--r-md)", color: "var(--forest)", resize: "vertical",
                  lineHeight: 1.5, outline: "none",
                }} />
            </div>

            <div>
              <RME>Brewing (optional)</RME>
              <input value={session} onChange={e => setSession(e.target.value)}
                placeholder="e.g. 5g · 100ml gaiwan · 95°C"
                style={{
                  width: "100%", marginTop: 8, padding: "10px 14px",
                  fontFamily: "ui-monospace, monospace", fontSize: 13,
                  background: "var(--cream)", border: "1px solid var(--warm-200)",
                  borderRadius: "var(--r-md)", color: "var(--forest)",
                  outline: "none",
                }} />
            </div>
          </div>

          {/* RIGHT: flavor profile */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
              <RME>{isBasic ? "Flavor profile · 6 simple axes" : "Flavor profile · 12 axes"}</RME>
              <span style={{ fontSize: 11, color: "var(--warm-500)" }}>{isBasic ? "0–5" : "0–10"}</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <RMRC
                profiles={[{ values: isBasic ? basicProfile : profile, color: "var(--burgundy)" }]}
                axes={isBasic ? RMBA : RMFA}
                style="fill"
                size={240}
              />
            </div>
            {isBasic ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {RMBA.map(ax => {
                  const v5 = Math.round((basicProfile[ax.key] || 0) / 2);
                  return (
                    <div key={ax.key}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ minWidth: 70, fontSize: 12, color: "var(--forest)", fontWeight: 700 }}>{ax.label}</div>
                        <input type="range" min="0" max="5" step="1" value={v5}
                          onChange={e => setBasicAxis(ax.key, e.target.value)}
                          style={{ flex: 1, accentColor: ax.color }} />
                        <div style={{ minWidth: 18, fontSize: 11, color: "var(--warm-600)", textAlign: "right", fontFamily: "ui-monospace,monospace", fontWeight: 600 }}>{v5}/5</div>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--warm-600)", marginLeft: 78, marginTop: 2, lineHeight: 1.4, fontStyle: "italic" }}>{ax.lay}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                {RMFA.map(ax => (
                  <div key={ax.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ minWidth: 64, fontSize: 11, color: "var(--forest)", fontWeight: 600 }}>{ax.label}</div>
                    <input type="range" min="0" max="10" step="1" value={profile[ax.key]}
                      onChange={e => setAxis(ax.key, e.target.value)}
                      style={{ flex: 1, accentColor: ax.color }} />
                    <div style={{ minWidth: 14, fontSize: 11, color: "var(--warm-500)", textAlign: "right", fontFamily: "ui-monospace,monospace" }}>{profile[ax.key]}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "18px 32px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderTop: "1px solid var(--warm-200)", marginTop: 8 }}>
          <span style={{ fontSize: 12, color: "var(--warm-500)" }}>Your rating refines your flavor map and Discover suggestions.</span>
          <div style={{ display: "flex", gap: 10 }}>
            <RMB variant="secondary" onClick={onClose}>Cancel</RMB>
            <RMB variant="primary" onClick={handleSubmit}>Save review</RMB>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }) {
  const opts = [
    { key: "basic",    label: "Basic",    sub: "5-pt" },
    { key: "advanced", label: "Advanced", sub: "10-pt" },
  ];
  return (
    <div style={{
      display: "inline-flex",
      padding: 3,
      background: "var(--cream)",
      borderRadius: "var(--r-pill)",
      border: "1px solid var(--warm-200)",
      gap: 2,
    }}>
      {opts.map(o => {
        const active = mode === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            aria-pressed={active}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--r-pill)",
              border: "none",
              background: active ? "var(--burgundy)" : "transparent",
              color: active ? "var(--cream)" : "var(--forest)",
              fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 11,
              cursor: "pointer", letterSpacing: "0.04em",
              display: "inline-flex", alignItems: "center", gap: 6,
              transition: "all var(--dur) var(--ease-smooth)",
            }}
          >
            {o.label}
            <span style={{ fontSize: 9, opacity: active ? 0.85 : 0.55, fontWeight: 500 }}>{o.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

window.ReviewModal = ReviewModal;
