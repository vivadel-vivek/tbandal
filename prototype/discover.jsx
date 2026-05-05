/* eslint-disable */
// =====================================================================
// DISCOVER — recommendations + blind tasting
// =====================================================================
const { Eyebrow: DE, Button: DB, RatingScore: DRS, TeaCard: DTC, TeaTypeTag: DTT,
        AvatarChip: DAC, RadarChart: DRC, TeaStain: DTS } = window.UI;
const { TEAS: DT, FLAVOR_AXES: DFA, CONTRIBUTORS: DCB } = window.AppData;
const { Container: DCT, SectionHeader: DSH } = window.Pages;
const { useState: duS, useMemo: duM } = React;

const compositeD = (tea) => {
  const out = {};
  for (const ax of DFA) out[ax.key] = (tea.flavor.vivek[ax.key] + tea.flavor.james[ax.key] + tea.flavor.members[ax.key]) / 3;
  return out;
};

const overlap = (a, b) => {
  let i = 0, u = 0;
  for (const ax of DFA) {
    i += Math.min(a[ax.key], b[ax.key]);
    u += Math.max(a[ax.key], b[ax.key]);
  }
  return u ? i / u : 0;
};

function Discover({ member, onSelect, onMember, radarStyle, density, isBlindFor = () => false, onBlindStart }) {
  const [mode, setMode] = duS("recommend"); // recommend | different | blind

  // build a target profile based on member's aligned contributor + ratings
  const targetProfile = duM(() => {
    const seed = DT[0].flavor[member.aligned];
    const out = { ...seed };
    // weighted by member ratings (use highest-rated teas as additional pull)
    member.ratings.forEach(r => {
      const t = DT.find(x => x.slug === r.slug);
      if (!t) return;
      const w = r.rating / 10;
      const prof = compositeD(t);
      for (const ax of DFA) out[ax.key] = out[ax.key] * (1 - 0.15 * w) + prof[ax.key] * 0.15 * w;
    });
    return out;
  }, [member]);

  // ranked teas
  const ranked = duM(() => {
    return DT.map(t => ({ t, score: overlap(compositeD(t), targetProfile) }))
      .sort((a, b) => b.score - a.score);
  }, [targetProfile]);

  const recommended = ranked.slice(0, 3);
  const different = [...ranked].reverse().slice(0, 3);

  return (
    <main>
      <DCT>
        <div style={{ padding: "48px 0 24px", position: "relative" }}>
          <DTS size={360} color="#722F37" opacity={0.1} style={{ position: "absolute", top: 0, right: -80, pointerEvents: "none" }} />
          <DE>Discover</DE>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 16px", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
            <span style={{ fontStyle: "italic" }}>What should</span> we brew next?
          </h1>
          <p style={{ maxWidth: 600, color: "var(--warm-700)", fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
            Aligned with <strong style={{ color: DCB[member.aligned].color }}>{DCB[member.aligned].name}'s</strong> palate, then refined by your {member.ratings.length} ratings. Pick a mode below.
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[
            { key: "recommend", label: "Likely matches", desc: "High overlap with what you like" },
            { key: "different", label: "Try something different", desc: "Unfamiliar shapes — broaden your palate" },
            { key: "blind", label: "Blind tasting", desc: "Rate first, read reviews after" },
          ].map(m => {
            const active = mode === m.key;
            return (
              <button key={m.key} onClick={() => setMode(m.key)} style={{
                flex: 1, padding: "20px 22px", borderRadius: "var(--r-xl)",
                border: active ? "2px solid var(--burgundy)" : "1px solid var(--warm-300)",
                background: active ? "var(--bg-elevated)" : "transparent",
                cursor: "pointer", textAlign: "left",
                boxShadow: active ? "var(--shadow-card)" : "none",
                transition: "all var(--dur) var(--ease-smooth)",
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: active ? "var(--burgundy)" : "var(--forest)", fontWeight: 500, marginBottom: 8, fontStyle: "italic", lineHeight: 1.2 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: "var(--warm-600)", lineHeight: 1.4 }}>{m.desc}</div>
              </button>
            );
          })}
        </div>

        {mode === "recommend" && (
          <RecommendPanel recommended={recommended} target={targetProfile} member={member}
            radarStyle={radarStyle} isBlindFor={isBlindFor} onSelect={onSelect} />
        )}
        {mode === "different" && (
          <DifferentPanel teas={different} target={targetProfile} member={member}
            radarStyle={radarStyle} isBlindFor={isBlindFor} onSelect={onSelect} />
        )}
        {mode === "blind" && (
          <BlindPanel teas={ranked.slice(0, 4)} onSelect={onSelect} onBlindStart={onBlindStart} />
        )}
      </DCT>
    </main>
  );
}

function RecommendPanel({ recommended, target, member, radarStyle, isBlindFor, onSelect }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, alignItems: "flex-start" }}>
        {/* radar showing overlap */}
        <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)", position: "sticky", top: 96 }}>
          <DE>Your target profile</DE>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--forest)", fontWeight: 500, margin: "6px 0 14px" }}>Where your palate sits</h3>
          <DRC profiles={[
            { values: target, color: "var(--burgundy)" },
            { values: compositeD(recommended[0].t), color: "var(--gold-dark)" },
          ]} style={radarStyle} size={320} />
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--warm-200)", fontSize: 11 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--warm-700)", fontWeight: 600 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--burgundy)" }} />You</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--warm-700)", fontWeight: 600 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--gold-dark)" }} />Top match</span>
          </div>
        </div>

        <div>
          <DE color="var(--gold-dark)">Top matches · ranked by overlap</DE>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--burgundy)", fontWeight: 500, margin: "6px 0 24px", letterSpacing: "-0.01em" }}>You'll likely love these.</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {recommended.map(({ t, score }, i) => (
              <RecRow key={t.slug} tea={t} score={score} rank={i + 1} hideReviews={isBlindFor(t.slug)} onSelect={onSelect} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecRow({ tea, score, rank, hideReviews, onSelect }) {
  const avg = window.AppData.teaAvg(tea);
  return (
    <article onClick={() => onSelect(tea)} style={{
      background: "var(--bg-elevated)", borderRadius: "var(--r-xl)",
      padding: 18, boxShadow: "var(--shadow-card)",
      border: "1px solid rgba(212,196,160,0.3)",
      display: "grid", gridTemplateColumns: "auto 100px 1fr auto", gap: 18, alignItems: "center",
      cursor: "pointer", transition: "all var(--dur) var(--ease-smooth)",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-elevated)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "var(--gold)", fontWeight: 500, fontStyle: "italic", lineHeight: 1, width: 40, textAlign: "center" }}>{rank}</div>
      <div style={{ width: 100, height: 100, borderRadius: "var(--r-lg)", background: tea.gradient, flexShrink: 0 }} />
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
          <DTT type={tea.type} small />
          <span style={{ fontSize: 11, color: "var(--warm-500)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>{tea.region}</span>
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--burgundy)", fontWeight: 500, margin: "0 0 6px", letterSpacing: "-0.01em" }}>{tea.name}</h3>
        <p style={{ fontSize: 13, color: "var(--warm-700)", lineHeight: 1.5, margin: 0, maxWidth: 460 }}>{tea.summary.slice(0, 110)}…</p>
      </div>
      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
        <div style={{ background: "var(--gold)", color: "var(--forest)", padding: "8px 16px", borderRadius: "var(--r-pill)", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-sans)" }}>
          {Math.round(score * 100)}% match
        </div>
        {!hideReviews && <DRS value={avg} />}
        <span style={{ fontSize: 11, color: "var(--warm-500)", fontFamily: "ui-monospace,monospace" }}>${tea.price.toFixed(2)}/g</span>
      </div>
    </article>
  );
}

function DifferentPanel({ teas, target, radarStyle, isBlindFor = () => false, onSelect }) {
  return (
    <div>
      <div style={{ background: "var(--cream)", borderRadius: "var(--r-xl)", padding: "20px 24px", marginBottom: 28, border: "1px dashed var(--warm-300)" }}>
        <DE>Why try different?</DE>
        <p style={{ fontSize: 14, color: "var(--warm-700)", margin: "6px 0 0", lineHeight: 1.55 }}>
          These teas sit furthest from your current profile. They might not become favorites, but they widen the map. Tea is a long road — drink things that surprise you.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {teas.map(({ t, score }) => (
          <div key={t.slug} style={{ position: "relative" }}>
            <DTC tea={t} hideReviews={isBlindFor(t.slug)} onClick={() => onSelect(t)} />
            <span style={{ position: "absolute", top: -8, right: 12, background: "var(--sage)", color: "var(--cream)", padding: "3px 10px", borderRadius: "var(--r-pill)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", boxShadow: "var(--shadow-card)" }}>New territory · {Math.round((1 - score) * 100)}% novel</span>
            {/* mini radar */}
            <div style={{ marginTop: 12, padding: 14, background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)" }}>
              <DE color="var(--warm-500)" style={{ fontSize: 9 }}>You vs this tea</DE>
              <DRC profiles={[
                { values: target, color: "var(--burgundy)" },
                { values: compositeD(t), color: "var(--sage)" },
              ]} style={radarStyle} size={180} showLabels={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlindPanel({ teas, onSelect, onBlindStart }) {
  return (
    <div>
      <div style={{ background: "var(--burgundy)", color: "var(--cream)", borderRadius: "var(--r-xl)", padding: "32px 36px", marginBottom: 32, position: "relative", overflow: "hidden" }}>
        <DTS size={400} color="#C4A35A" opacity={0.18} style={{ position: "absolute", top: -100, right: -80, pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 600 }}>
          <DE color="rgba(250,247,242,0.7)">Blind tasting</DE>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 44, color: "var(--cream)", fontWeight: 500, margin: "10px 0 14px", letterSpacing: "-0.01em", lineHeight: 1.05, fontStyle: "italic" }}>Rate it before you read it.</h2>
          <p style={{ fontSize: 16, color: "rgba(250,247,242,0.85)", lineHeight: 1.6, margin: 0 }}>
            We hide our reviews, ratings, and even the radar until after you log your own. Brewing parameters and origin stay visible — that's what you'd see on the back of the tin.
          </p>
        </div>
      </div>
      <DE>Pick a tea to taste blind</DE>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginTop: 16 }}>
        {teas.map((entry) => {
          const t = entry.t || entry;
          return (
            <article key={t.slug} onClick={() => onBlindStart(t)} style={{
              background: "var(--bg-elevated)", borderRadius: "var(--r-xl)",
              boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)",
              overflow: "hidden", cursor: "pointer",
              transition: "all var(--dur) var(--ease-smooth)",
              display: "grid", gridTemplateColumns: "140px 1fr",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-elevated)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ background: t.gradient, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(45,58,46,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "rgba(250,247,242,0.9)", fontWeight: 500, fontStyle: "italic" }}>?</span>
                </div>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <DTT type={t.type} small />
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--burgundy)", fontWeight: 500, margin: "6px 0 4px", letterSpacing: "-0.01em" }}>{t.name}</h3>
                <p style={{ fontSize: 12, color: "var(--warm-600)", margin: "0 0 10px" }}>{t.region} · {t.year} · {t.elev}m</p>
                <div style={{ fontSize: 11, color: "var(--warm-500)", fontFamily: "ui-monospace,monospace" }}>
                  {t.brewing.style} · {t.brewing.ratio} · {t.brewing.temp}
                </div>
                <DB variant="primary" size="sm" style={{ marginTop: 12 }}>Start blind tasting →</DB>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

window.Discover = Discover;
