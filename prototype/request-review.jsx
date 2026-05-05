/* eslint-disable */
// =====================================================================
// REQUEST REVIEW PAGE — ask Vivek/James to review a particular tea.
// Prefilled if entered from a tea page; blank otherwise.
// Options: "I have it & can send" or "Buy here →"
// =====================================================================
const { Eyebrow: RRE, Button: RRB, AvatarChip: RRAC, TeaTypeTag: RRTT } = window.UI;
const { TEAS: RRT, VENDORS: RRV, CONTRIBUTORS: RRC } = window.AppData;
const { Container: RRCT } = window.Pages;
const { useState: rruS } = React;

function RequestReview({ prefill, onBack, onSubmitted }) {
  const [askVivek, setAskVivek] = rruS(true);
  const [askJames, setAskJames] = rruS(true);
  const [teaName, setTeaName] = rruS(prefill?.tea?.name || "");
  const [teaSlug, setTeaSlug] = rruS(prefill?.tea?.slug || "");
  const [vendorName, setVendorName] = rruS(prefill?.tea?.vendor || prefill?.vendor?.name || "");
  const [year, setYear] = rruS(prefill?.tea?.year || "");
  const [region, setRegion] = rruS(prefill?.tea?.region || "");
  const [type, setType] = rruS(prefill?.tea?.type || "");
  const [offerKind, setOfferKind] = rruS("send"); // "send" | "link" | "neither"
  const [purchaseLink, setPurchaseLink] = rruS("");
  const [message, setMessage] = rruS("");
  const [submitted, setSubmitted] = rruS(false);

  const teaOptions = RRT;
  const vendorOptions = RRV;

  const onSubmit = () => {
    setSubmitted(true);
    onSubmitted && onSubmitted({ teaName, vendorName, askVivek, askJames });
  };

  if (submitted) {
    return (
      <main>
        <RRCT max={760}>
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🫖</div>
            <RRE>Request sent</RRE>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--burgundy)", fontWeight: 500, margin: "16px 0 16px", letterSpacing: "-0.01em", fontStyle: "italic" }}>Thanks — we'll brew it.</h1>
            <p style={{ fontSize: 17, color: "var(--warm-700)", lineHeight: 1.65, maxWidth: 540, margin: "0 auto 32px" }}>
              {askVivek && askJames ? "Both of us" : askVivek ? "Vivek" : "James"} will get back to you about <strong style={{ color: "var(--forest)" }}>{teaName}</strong>
              {vendorName && <> from <strong style={{ color: "var(--forest)" }}>{vendorName}</strong></>}
              {" "}within a few days.
              {offerKind === "send" && " We'll reach out about shipping logistics."}
              {offerKind === "link" && " We'll order it from the link you provided."}
            </p>
            <div style={{ display: "inline-flex", gap: 10 }}>
              <RRB variant="primary" onClick={onBack}>Back to library</RRB>
              <RRB variant="secondary" onClick={() => { setSubmitted(false); setTeaName(""); setVendorName(""); setMessage(""); setPurchaseLink(""); }}>Submit another</RRB>
            </div>
          </div>
        </RRCT>
      </main>
    );
  }

  return (
    <main>
      <RRCT max={860}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--warm-600)", fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer", margin: "32px 0 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>← Back</button>

        <div style={{ padding: "8px 0 24px", borderBottom: "1px solid var(--warm-200)", marginBottom: 28 }}>
          <RRE>Request a review</RRE>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--burgundy)", fontWeight: 500, margin: "10px 0 10px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            <span style={{ fontStyle: "italic" }}>Got a tea</span> we should try?
          </h1>
          <p style={{ fontSize: 16, color: "var(--warm-700)", lineHeight: 1.65, maxWidth: 620, margin: 0 }}>
            Tell us what you'd like reviewed. If you have it on hand, we'll cover return shipping. Otherwise drop a purchase link and we'll order a session's worth.
          </p>
        </div>

        {prefill?.tea && (
          <div style={{ background: "var(--cream)", padding: "14px 18px", borderRadius: "var(--r-md)", marginBottom: 24, border: "1px solid var(--warm-200)", display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--warm-700)" }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <span>Prefilled from <strong style={{ color: "var(--forest)" }}>{prefill.tea.name}</strong>. Edit anything below.</span>
          </div>
        )}

        {/* WHO */}
        <Section eyebrow="Who" title="Whose palate would you like?">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[RRC.vivek, RRC.james].map(c => {
              const active = c.key === "vivek" ? askVivek : askJames;
              const toggle = () => c.key === "vivek" ? setAskVivek(v => !v) : setAskJames(v => !v);
              return (
                <button key={c.key} onClick={toggle} style={{
                  background: active ? "var(--bg-elevated)" : "transparent",
                  border: active ? `2px solid ${c.color}` : "1px solid var(--warm-300)",
                  borderRadius: "var(--r-xl)", padding: "16px 18px",
                  cursor: "pointer", textAlign: "left",
                  boxShadow: active ? "var(--shadow-card)" : "none",
                  transition: "all var(--dur) var(--ease-smooth)",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <RRAC who={c.key} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: c.color, fontWeight: 500, fontStyle: "italic", lineHeight: 1.1 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "var(--warm-600)", marginTop: 2 }}>{c.palate || "Tea reviewer"}</div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: active ? c.color : "transparent",
                    border: `2px solid ${active ? c.color : "var(--warm-300)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--cream)", fontSize: 14, fontWeight: 700, flexShrink: 0,
                  }}>{active ? "✓" : ""}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* WHAT */}
        <Section eyebrow="What" title="The tea">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Tea name *" required>
              <input value={teaName} onChange={e => { setTeaName(e.target.value); setTeaSlug(""); }}
                placeholder="e.g. Lao Ban Zhang shou pu'er"
                list="tea-suggestions"
                style={inputStyle} />
              <datalist id="tea-suggestions">
                {teaOptions.map(t => <option key={t.slug} value={t.name} />)}
              </datalist>
            </Field>
            <Field label="Vendor / shop">
              <input value={vendorName} onChange={e => setVendorName(e.target.value)}
                placeholder="e.g. white2tea"
                list="vendor-suggestions"
                style={inputStyle} />
              <datalist id="vendor-suggestions">
                {vendorOptions.map(v => <option key={v.slug} value={v.name} />)}
              </datalist>
            </Field>
            <Field label="Tea type">
              <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
                <option value="">—</option>
                {["Green", "White", "Yellow", "Oolong", "Black", "Pu'er", "Heicha"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Year / harvest">
              <input value={year} onChange={e => setYear(e.target.value)}
                placeholder="e.g. Spring 2024"
                style={inputStyle} />
            </Field>
            <Field label="Region (optional)" full>
              <input value={region} onChange={e => setRegion(e.target.value)}
                placeholder="e.g. Menghai, Yunnan"
                style={inputStyle} />
            </Field>
          </div>
        </Section>

        {/* HOW */}
        <Section eyebrow="How" title="Getting the tea to us">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { key: "send", label: "I can send it", desc: "I have the tea and can ship a sample" },
              { key: "link", label: "Buy here →", desc: "We'll order it from your link" },
              { key: "neither", label: "Just suggesting", desc: "Track it down however you can" },
            ].map(o => {
              const active = offerKind === o.key;
              return (
                <button key={o.key} onClick={() => setOfferKind(o.key)} style={{
                  padding: "14px 16px", borderRadius: "var(--r-xl)",
                  border: active ? "2px solid var(--burgundy)" : "1px solid var(--warm-300)",
                  background: active ? "var(--bg-elevated)" : "transparent",
                  cursor: "pointer", textAlign: "left",
                  boxShadow: active ? "var(--shadow-card)" : "none",
                  transition: "all var(--dur) var(--ease-smooth)",
                }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: active ? "var(--burgundy)" : "var(--forest)", fontWeight: 500, fontStyle: "italic", lineHeight: 1.2, marginBottom: 4 }}>{o.label}</div>
                  <div style={{ fontSize: 12, color: "var(--warm-600)", lineHeight: 1.4 }}>{o.desc}</div>
                </button>
              );
            })}
          </div>

          {offerKind === "send" && (
            <div style={{ background: "var(--cream)", padding: "14px 18px", borderRadius: "var(--r-md)", border: "1px dashed var(--warm-300)", fontSize: 13, color: "var(--warm-700)", lineHeight: 1.55 }}>
              We'll reply with a shipping address and cover return postage. A 5–10g sample is enough for a full session.
            </div>
          )}
          {offerKind === "link" && (
            <Field label="Purchase link *" required>
              <input value={purchaseLink} onChange={e => setPurchaseLink(e.target.value)}
                placeholder="https://..."
                style={inputStyle} />
            </Field>
          )}
        </Section>

        {/* MESSAGE */}
        <Section eyebrow="Optional" title="Anything else?">
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
            placeholder="Why this tea? Any context, brewing tips, or what you'd like us to focus on?"
            style={{ ...inputStyle, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15, lineHeight: 1.55, resize: "vertical" }} />
        </Section>

        {/* SUBMIT */}
        <div style={{ padding: "24px 0 80px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderTop: "1px solid var(--warm-200)", marginTop: 28 }}>
          <div style={{ fontSize: 12, color: "var(--warm-500)" }}>
            We try to respond within a week. Some teas take longer to source.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <RRB variant="secondary" onClick={onBack}>Cancel</RRB>
            <RRB variant="primary"
              onClick={onSubmit}
              disabled={!teaName || (!askVivek && !askJames) || (offerKind === "link" && !purchaseLink)}>
              Send request →
            </RRB>
          </div>
        </div>
      </RRCT>
    </main>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px",
  fontFamily: "var(--font-sans)", fontSize: 14,
  background: "var(--cream)", border: "1px solid var(--warm-200)",
  borderRadius: "var(--r-md)", color: "var(--forest)", outline: "none",
};

function Field({ label, children, full, required }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--warm-500)", fontWeight: 700, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <RRE>{eyebrow}</RRE>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--forest)", fontWeight: 500, margin: "6px 0 0", letterSpacing: "-0.01em" }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

window.RequestReview = RequestReview;
