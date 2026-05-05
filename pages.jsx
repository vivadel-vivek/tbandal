/* eslint-disable */
// =====================================================================
// PAGES — Home, Library, Vendors, VendorDetail, BlogIndex, BlogPost,
//         About, MemberProfile, Discover (incl. Blind Tasting)
// =====================================================================
const { Eyebrow, Button, RatingScore, StarRow, TeaTypeTag, FlavorBadge,
        AvatarChip, RadarChart, MouthfeelGrid, TeaCard, TeaStain } = window.UI;
const { TEAS, VENDORS, POSTS, FLAVOR_AXES, CONTRIBUTORS } = window.AppData;
const { useState: uS, useMemo: uM, useEffect: uE } = React;

// Container helper
const Container = ({ children, max = 1180, style }) => (
  <div style={{ maxWidth: max, margin: "0 auto", padding: "0 40px", ...style }}>{children}</div>
);

// ===================== HOME =====================
function Home({ onNav, onSelect, density, isBlindFor = () => false }) {
  const hideReviews = false; // legacy; per-tea handled below
  const featured = TEAS[0]; // gaba shen
  const recent = TEAS.slice(1, 4);
  const latestPost = POSTS[0];
  return (
    <main>
      {/* Hero */}
      <section style={{ position: "relative", padding: "72px 0 56px", overflow: "hidden" }}>
        <TeaStain size={420} color="#C4A35A" opacity={0.15} style={{ position: "absolute", top: -80, right: -100, pointerEvents: "none" }} />
        <TeaStain size={260} color="#722F37" opacity={0.08} style={{ position: "absolute", bottom: -40, left: -60, pointerEvents: "none" }} />
        <Container>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 56, alignItems: "center" }}>
            <div>
              <Eyebrow>A two-person tea journal · est. 2024</Eyebrow>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 76, color: "var(--burgundy)", fontWeight: 500, margin: "16px 0 20px", lineHeight: 1.02, letterSpacing: "-0.02em" }}>
                <span style={{ fontStyle: "italic" }}>Two buds,</span><br />
                a leaf, and a long<br />afternoon to brew it.
              </h1>
              <p style={{ fontSize: 18, color: "var(--warm-700)", maxWidth: 540, lineHeight: 1.6, marginBottom: 28 }}>
                Vivek and James review tea — single-origin, vendor-sourced, and everything between. Twelve flavor axes, dual ratings, and brewing parameters that actually got the cup we describe.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <Button variant="primary" size="lg" onClick={() => onNav("discover-teas")}>Browse the library</Button>
                <Button variant="secondary" size="lg" onClick={() => onNav("recommendations")}>Discover by flavor</Button>
              </div>
              <div style={{ display: "flex", gap: 32, marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--warm-200)" }}>
                <Stat n={TEAS.length + 38} label="Teas reviewed" />
                <Stat n={POSTS.length + 24} label="Tasting essays" />
                <Stat n={VENDORS.length + 9} label="Vendors covered" />
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{
                aspectRatio: "4/5", borderRadius: "var(--r-2xl)",
                background: featured.gradient,
                boxShadow: "var(--shadow-elevated)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.45) 100%)" }} />
                <div style={{ position: "absolute", left: 28, right: 28, bottom: 24, color: "var(--cream)" }}>
                  <Eyebrow color="rgba(250,247,242,0.8)">Today's pour · {featured.region}</Eyebrow>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--cream)", fontWeight: 500, margin: "6px 0 6px", fontStyle: "italic", letterSpacing: "-0.01em" }}>{featured.name}</h3>
                  <p style={{ fontSize: 13, color: "rgba(250,247,242,0.85)", margin: 0 }}>{featured.year} · {featured.elev}m</p>
                </div>
                <button onClick={() => onSelect(featured)} style={{
                  position: "absolute", top: 20, right: 20,
                  background: "rgba(250,247,242,0.95)",
                  border: "none", borderRadius: "var(--r-pill)",
                  padding: "8px 14px", fontFamily: "var(--font-sans)",
                  fontSize: 12, fontWeight: 700, color: "var(--burgundy)",
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                }}>Read review →</button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Recent reviews */}
      <section style={{ padding: "40px 0" }}>
        <Container>
          <SectionHeader eyebrow="Recently brewed" title="What's been in the gaiwan" link="See all" onLink={() => onNav("discover-teas")} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {recent.map(t => <TeaCard key={t.slug} tea={t} density={density} hideReviews={isBlindFor(t.slug)} onClick={() => onSelect(t)} />)}
          </div>
        </Container>
      </section>

      {/* Two contributors */}
      <section style={{ padding: "56px 0", background: "var(--cream)" }}>
        <Container>
          <SectionHeader eyebrow="Two palates" title="Different mouths, one cup" link="About us" onLink={() => onNav("about")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[CONTRIBUTORS.vivek, CONTRIBUTORS.james].map(c => (
              <div key={c.key} style={{
                background: "var(--white)", borderRadius: "var(--r-xl)",
                padding: 28, boxShadow: "var(--shadow-card)",
                border: "1px solid rgba(212,196,160,0.3)",
                display: "flex", gap: 20,
              }}>
                <AvatarChip who={c.key} size={64} />
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--burgundy)", fontWeight: 500, margin: "0 0 4px", fontStyle: "italic" }}>{c.name}</h3>
                  <Eyebrow color="var(--warm-500)">{c.palate}</Eyebrow>
                  <p style={{ fontSize: 14, color: "var(--warm-700)", lineHeight: 1.6, margin: "10px 0 0" }}>{c.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Latest from the journal */}
      <section style={{ padding: "56px 0" }}>
        <Container>
          <SectionHeader eyebrow="From the journal" title="Brewing notes & long reads" link="All posts" onLink={() => onNav("blog")} />
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
            <article onClick={() => onNav("blog-post")} style={{ background: "var(--white)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)", cursor: "pointer", display: "flex", flexDirection: "column" }}>
              <div style={{ aspectRatio: "16/8", background: latestPost.grad }} />
              <div style={{ padding: "24px 28px 28px" }}>
                <Eyebrow color="var(--sage-dark)">{latestPost.cat} · {latestPost.readTime} min</Eyebrow>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 10px", lineHeight: 1.1, letterSpacing: "-0.01em" }}>{latestPost.title}</h3>
                <p style={{ fontSize: 15, color: "var(--warm-700)", lineHeight: 1.6, margin: "0 0 14px" }}>{latestPost.excerpt}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AvatarChip who={latestPost.author.toLowerCase()} size={24} />
                  <span style={{ fontSize: 12, color: "var(--warm-600)" }}>{latestPost.author} · {latestPost.date}</span>
                </div>
              </div>
            </article>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {POSTS.slice(1, 4).map(p => (
                <article key={p.slug} style={{ background: "var(--white)", borderRadius: "var(--r-lg)", padding: "16px 20px", boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)", cursor: "pointer", display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "var(--r-md)", background: p.grad, flexShrink: 0 }} />
                  <div>
                    <Eyebrow color="var(--sage-dark)" style={{ fontSize: 9 }}>{p.cat}</Eyebrow>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--burgundy)", fontWeight: 500, margin: "4px 0 4px", lineHeight: 1.2 }}>{p.title}</h4>
                    <span style={{ fontSize: 11, color: "var(--warm-500)" }}>{p.author} · {p.date}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--burgundy)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.01em" }}>{n}</div>
      <div style={{ fontSize: 11, color: "var(--warm-500)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, link, onLink }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid var(--warm-200)" }}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--forest)", fontWeight: 500, margin: "6px 0 0", letterSpacing: "-0.01em" }}>{title}</h2>
      </div>
      {link && <a onClick={onLink} style={{ fontSize: 13, fontWeight: 700, color: "var(--burgundy)", cursor: "pointer", letterSpacing: "0.04em" }}>{link} →</a>}
    </div>
  );
}

// ===================== LIBRARY (Discover › Teas) =====================
function Library({ onSelect, density, onBack, isBlindFor = () => false }) {
  const [type, setType] = uS("All");
  const [region, setRegion] = uS("All");
  const [sort, setSort] = uS("rating");

  const types = ["All", "Green", "White", "Oolong", "Black", "Pu'er"];
  const regions = ["All", ...new Set(TEAS.map(t => t.country))];

  let filtered = TEAS.filter(t => (type === "All" || t.type === type) && (region === "All" || t.country === region));
  if (sort === "rating") filtered = [...filtered].sort((a,b) => window.AppData.teaAvg(b) - window.AppData.teaAvg(a));
  if (sort === "price") filtered = [...filtered].sort((a,b) => a.price - b.price);
  if (sort === "elev") filtered = [...filtered].sort((a,b) => b.elev - a.elev);

  return (
    <main style={{ position: "relative" }}>
      <Container>
        {onBack && (
          <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--warm-600)", fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer", margin: "32px 0 0", display: "inline-flex", alignItems: "center", gap: 6 }}>← Discover</button>
        )}
        <div style={{ padding: onBack ? "12px 0 32px" : "48px 0 32px" }}>
          <Eyebrow>Discover · Teas</Eyebrow>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 16px", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
            <span style={{ fontStyle: "italic" }}>Every leaf,</span> recorded.
          </h1>
          <p style={{ maxWidth: 560, color: "var(--warm-700)", fontSize: 16, marginBottom: 32 }}>
            A working catalogue of {TEAS.length}+ teas we've brewed, with notes from gongfu sessions, vendor pointers, and the occasional confession of a bad pour.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32, alignItems: "flex-start" }}>
          {/* Filter sidebar */}
          <aside style={{
            background: "var(--bg-elevated)",
            borderRadius: "var(--r-xl)", padding: 22,
            border: "1px solid rgba(212,196,160,0.3)",
            boxShadow: "var(--shadow-card)",
            position: "sticky", top: 96,
          }}>
            <FilterGroup label="Type" options={types} value={type} onChange={setType} />
            <FilterGroup label="Origin" options={regions} value={region} onChange={setRegion} />
            <div style={{ marginTop: 18 }}>
              <Eyebrow color="var(--warm-500)">Vendor</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                {VENDORS.map(v => (
                  <label key={v.slug} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--warm-700)", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: "var(--burgundy)" }} />
                    {v.name}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <Eyebrow color="var(--warm-500)">Elevation</Eyebrow>
              <div style={{ marginTop: 12 }}>
                <input type="range" min="0" max="3000" defaultValue="3000" style={{ width: "100%", accentColor: "var(--burgundy)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--warm-500)", marginTop: 4 }}>
                  <span>0m</span><span>3000m+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: "var(--warm-600)" }}>{filtered.length} teas</span>
              <div style={{ display: "flex", gap: 6 }}>
                {[["rating","Highest rated"],["price","Price"],["elev","Elevation"]].map(([k,l]) => (
                  <button key={k} onClick={() => setSort(k)} style={{
                    padding: "6px 12px", borderRadius: "var(--r-pill)",
                    border: sort===k ? "1.5px solid var(--burgundy)" : "1px solid var(--warm-300)",
                    background: sort===k ? "var(--burgundy-muted)" : "transparent",
                    color: sort===k ? "var(--burgundy)" : "var(--forest)",
                    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: density === "compact" ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: 20 }}>
              {filtered.map(t => <TeaCard key={t.slug} tea={t} density={density} hideReviews={isBlindFor(t.slug)} onClick={() => onSelect(t)} />)}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Eyebrow color="var(--warm-500)">{label}</Eyebrow>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} style={{
            padding: "5px 11px", borderRadius: "var(--r-pill)",
            border: value === o ? "1.5px solid var(--burgundy)" : "1px solid var(--warm-300)",
            background: value === o ? "var(--burgundy)" : "transparent",
            color: value === o ? "var(--cream)" : "var(--forest)",
            fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>{o}</button>
        ))}
      </div>
    </div>
  );
}

// ===================== VENDORS =====================
function Vendors({ onSelect, onSelectVendor }) {
  return (
    <main>
      <Container>
        <div style={{ padding: "48px 0 32px" }}>
          <Eyebrow>Vendors we trust</Eyebrow>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 16px", letterSpacing: "-0.01em" }}>The shops behind the cup.</h1>
          <p style={{ maxWidth: 580, color: "var(--warm-700)", fontSize: 16, marginBottom: 32 }}>
            Vendors we've bought from, brewed from, and quietly returned to. Affiliate links, where they exist, are tagged — we only link to people we'd recommend.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {VENDORS.map(v => (
            <div key={v.slug} onClick={() => onSelectVendor(v)} style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 28, boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)", display: "flex", gap: 20, cursor: "pointer", transition: "all var(--dur) var(--ease-smooth)" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-elevated)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ width: 84, height: 84, borderRadius: "var(--r-lg)", background: v.swatch, flexShrink: 0, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32, color: "var(--cream)", fontWeight: 500 }}>{v.name[0]}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--burgundy)", fontWeight: 500, margin: 0 }}>{v.name}</h3>
                  <StarRow value={v.rating} />
                </div>
                <Eyebrow color="var(--warm-500)">{v.city} · {v.teaCount} teas · est. {v.founded}</Eyebrow>
                <p style={{ fontSize: 14, color: "var(--warm-700)", lineHeight: 1.55, margin: "10px 0 14px" }}>{v.tagline}</p>
                <Button variant="secondary" size="sm">Visit shop ↗</Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}

function VendorDetail({ vendor, onSelect, onBack, isBlindFor = () => false }) {
  const teas = TEAS.filter(t => t.vendor === vendor.name);
  return (
    <main>
      <Container>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--warm-600)", fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer", margin: "32px 0 16px", display: "inline-flex", alignItems: "center", gap: 6 }}>← All vendors</button>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "flex-start" }}>
          <div>
            <Eyebrow>{vendor.city} · est. {vendor.founded}</Eyebrow>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 16px", letterSpacing: "-0.01em" }}>{vendor.name}</h1>
            <p style={{ fontSize: 18, color: "var(--warm-700)", lineHeight: 1.65, marginBottom: 16 }}>{vendor.tagline}</p>
            <p style={{ fontSize: 15, color: "var(--warm-700)", lineHeight: 1.65, marginBottom: 24 }}>{vendor.body}</p>
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="primary">Visit shop ↗</Button>
              <Button variant="secondary">All teas ({vendor.teaCount})</Button>
            </div>
            <div style={{ display: "flex", gap: 32, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--warm-200)" }}>
              <Stat n={vendor.teaCount} label="Teas catalogued" />
              <Stat n={teas.length} label="We've reviewed" />
              <Stat n={vendor.rating + ".0"} label="Our rating" />
            </div>
          </div>
          <div style={{ aspectRatio: "1/1", borderRadius: "var(--r-2xl)", background: vendor.swatch, boxShadow: "var(--shadow-elevated)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 120, color: "rgba(250,247,242,0.85)", fontWeight: 500 }}>{vendor.name[0]}</div>
          </div>
        </div>
        <div style={{ marginTop: 56 }}>
          <SectionHeader eyebrow="From this vendor" title="Teas we've brewed" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {teas.map(t => <TeaCard key={t.slug} tea={t} hideReviews={isBlindFor(t.slug)} onClick={() => onSelect(t)} />)}
          </div>
        </div>
        <div style={{ background: "var(--cream)", padding: "20px 24px", borderRadius: "var(--r-xl)", marginTop: 40, border: "1px dashed var(--warm-300)", fontSize: 12, color: "var(--warm-600)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--forest)" }}>Affiliate disclosure:</strong> outbound links to {vendor.name} are tracked through our /go/ redirect system. We earn a small commission on referrals; this never influences which teas appear in the library.
        </div>
      </Container>
    </main>
  );
}

// ===================== BLOG =====================
function BlogIndex({ onPost }) {
  return (
    <main>
      <Container max={1080}>
        <div style={{ padding: "48px 0 32px" }}>
          <Eyebrow>Journal</Eyebrow>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 16px", letterSpacing: "-0.01em", fontStyle: "italic" }}>Recently brewed.</h1>
          <p style={{ maxWidth: 580, color: "var(--warm-700)", fontSize: 16, marginBottom: 32 }}>
            Long reads, brewing notes, and vendor spotlights. Two of us writing, one cup at a time.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {["All", "Brewing", "Culture", "Origin", "Vendor Spotlight"].map((c, i) => (
            <button key={c} style={{
              padding: "6px 14px", borderRadius: "var(--r-pill)",
              border: i === 0 ? "1.5px solid var(--burgundy)" : "1px solid var(--warm-300)",
              background: i === 0 ? "var(--burgundy)" : "transparent",
              color: i === 0 ? "var(--cream)" : "var(--forest)",
              fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>{c}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {POSTS.map((p, i) => (
            <article key={p.slug} onClick={() => onPost(p)} style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)", cursor: "pointer", gridColumn: i === 0 ? "span 2" : "span 1" }}>
              <div style={{ aspectRatio: i === 0 ? "16/6" : "16/9", background: p.grad }} />
              <div style={{ padding: "20px 24px 24px" }}>
                <Eyebrow color="var(--sage-dark)">{p.cat} · {p.readTime} min</Eyebrow>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: i === 0 ? 36 : 26, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 10px", lineHeight: 1.15, letterSpacing: "-0.01em" }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: "var(--warm-700)", lineHeight: 1.6, margin: "0 0 14px" }}>{p.excerpt}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AvatarChip who={p.author.toLowerCase()} size={22} />
                  <span style={{ fontSize: 12, color: "var(--warm-500)" }}>{p.author} · {p.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </main>
  );
}

function BlogPost({ post, onBack, onSelect }) {
  const p = post || POSTS[0];
  const related = (p.related || []).map(s => TEAS.find(t => t.slug === s)).filter(Boolean);
  return (
    <main>
      <Container max={760}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--warm-600)", fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer", margin: "32px 0 16px", display: "inline-flex", alignItems: "center", gap: 6 }}>← Back to journal</button>
        <Eyebrow color="var(--sage-dark)">{p.cat} · {p.readTime} min read</Eyebrow>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, margin: "12px 0 20px", letterSpacing: "-0.01em", lineHeight: 1.05 }}>{p.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <AvatarChip who={p.author.toLowerCase()} size={36} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--forest)" }}>{p.author}</div>
            <div style={{ fontSize: 12, color: "var(--warm-500)" }}>{p.date}</div>
          </div>
        </div>
      </Container>
      <Container max={920}>
        <div style={{ aspectRatio: "16/7", background: p.grad, borderRadius: "var(--r-2xl)", boxShadow: "var(--shadow-elevated)", marginBottom: 40 }} />
      </Container>
      <Container max={680}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--forest)", lineHeight: 1.7 }}>
          <p style={{ fontSize: 22, fontStyle: "italic", color: "var(--warm-700)", marginBottom: 24, borderLeft: "2px solid var(--gold)", paddingLeft: 20 }}>
            {p.excerpt}
          </p>
          <p style={{ marginBottom: 20 }}>The first cup is a handshake. You're checking the leaves are awake, that the water is right, that your kettle hasn't done something strange. Almost nothing about a tea is decided in the first thirty seconds.</p>
          <p style={{ marginBottom: 20 }}>The second steep is where the conversation starts. By then the leaves have unfurled fully — they've stopped offering their <em>surface</em> and started offering their <em>shape</em>. The tannins arrive but haven't taken over. The aromatics, which on the first pour are still mostly bound up in the dry leaf, finally come loose into the cup.</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--burgundy)", fontWeight: 500, margin: "36px 0 16px", letterSpacing: "-0.01em" }}>Reading the leaves</h2>
          <p style={{ marginBottom: 20 }}>If your second steep is bitter — actually bitter, not "strong" — it usually means the first was too short. The leaves are still hungry. Add three or four seconds, drop your temperature one notch.</p>
          <p style={{ marginBottom: 20 }}>If your second steep is thinner than your first, you've over-extracted on the front end. Pour faster, or use less leaf next time.</p>
          <p style={{ marginBottom: 20 }}>If the second steep is the best one of the session — congratulations. That's where the tea is, and you've found it. Save the third for someone you like.</p>
        </div>
        {related.length > 0 && (
          <div style={{ marginTop: 56, paddingTop: 32, borderTop: "1px solid var(--warm-200)" }}>
            <Eyebrow>Teas referenced in this post</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 16 }}>
              {related.map(t => <TeaCard key={t.slug} tea={t} density="compact" onClick={() => onSelect(t)} />)}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}

// ===================== ABOUT =====================
function About({ onNav }) {
  return (
    <main>
      <Container max={920}>
        <div style={{ padding: "56px 0 24px", position: "relative" }}>
          <TeaStain size={300} color="#8B9A7D" opacity={0.18} style={{ position: "absolute", top: 20, right: -60, pointerEvents: "none" }} />
          <Eyebrow>About</Eyebrow>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 72, color: "var(--burgundy)", fontWeight: 500, margin: "12px 0 24px", letterSpacing: "-0.02em", lineHeight: 1.02 }}>
            <span style={{ fontStyle: "italic" }}>Two friends,</span><br />a lot of teaware,<br />and stubborn opinions.
          </h1>
          <p style={{ fontSize: 18, color: "var(--warm-700)", lineHeight: 1.65, maxWidth: 620, marginBottom: 24 }}>
            We started this site because we kept losing our notes. A shared spreadsheet became a database, the database wanted a frontend, and somewhere along the way it became a public record of two people learning how to drink tea more carefully.
          </p>
          <p style={{ fontSize: 16, color: "var(--warm-700)", lineHeight: 1.65, maxWidth: 620 }}>
            Every review here came from a real session, with real water, in real teaware we own. Brewing parameters are recorded so the cup we describe is the cup you can make.
          </p>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 48 }}>
          {[CONTRIBUTORS.vivek, CONTRIBUTORS.james].map(c => (
            <div key={c.key} style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 32, boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                <AvatarChip who={c.key} size={72} />
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--burgundy)", fontWeight: 500, margin: 0, fontStyle: "italic" }}>{c.name}</h3>
                  <Eyebrow color="var(--warm-500)">{c.palate}</Eyebrow>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--warm-700)", lineHeight: 1.65, margin: "0 0 16px" }}>{c.bio}</p>
              <p style={{ fontSize: 14, color: "var(--warm-700)", lineHeight: 1.65, margin: 0 }}>
                {c.key === "vivek"
                  ? "Drinks shen pu'er every morning. Has opinions about water TDS that are stronger than anyone needs them to be."
                  : "Comes to tea from coffee. Believes that the ritual matters at least as much as the cup."}
              </p>
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--warm-200)", display: "flex", gap: 18 }}>
                <Stat n={Math.floor(Math.random() * 30) + 80} label="Teas reviewed" />
                <Stat n={Math.floor(Math.random() * 50) + 200} label="Sessions logged" />
              </div>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 64, padding: "40px 0", borderTop: "1px solid var(--warm-200)" }}>
          <Eyebrow>How we rate</Eyebrow>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 20px", letterSpacing: "-0.01em" }}>Twelve axes, two palates, one composite.</h2>
          <p style={{ fontSize: 16, color: "var(--warm-700)", lineHeight: 1.65, maxWidth: 680, marginBottom: 24 }}>
            Each tea gets a flavor profile across twelve axes — floral, fruity, sweet, honey, nutty, roasted, woody, earthy, mineral, marine, vegetal, spicy. Both of us rate independently, then members add their own. The result is a composite radar that's more honest than any single palate could be.
          </p>
          <Button variant="primary" onClick={() => onNav("discover-teas")}>Start exploring →</Button>
        </section>
      </Container>
    </main>
  );
}

// ===================== MEMBER PROFILE =====================
function MemberProfile({ member, setMember, radarStyle, onNav, onSelect, reblind }) {
  const myProfile = uM(() => {
    const aligned = CONTRIBUTORS[member.aligned];
    // start from aligned contributor, slightly drift based on rated teas
    const seed = TEAS[0].flavor[member.aligned];
    const result = {};
    for (const ax of FLAVOR_AXES) {
      result[ax.key] = Math.max(0, Math.min(10, (seed[ax.key] + (member.ratings.length * 0.1) + (Math.random() - 0.5) * 0.5)));
    }
    return result;
  }, [member]);

  return (
    <main>
      <Container>
        <div style={{ padding: "48px 0 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div>
            <Eyebrow>Your profile</Eyebrow>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 12px", letterSpacing: "-0.01em" }}>
              <span style={{ fontStyle: "italic" }}>Hello,</span> {member.name}.
            </h1>
            <p style={{ fontSize: 16, color: "var(--warm-700)", maxWidth: 580, marginBottom: 8 }}>
              Your palate is currently aligned with <strong style={{ color: CONTRIBUTORS[member.aligned].color }}>{CONTRIBUTORS[member.aligned].name}</strong>'s. As you rate teas, your profile drifts toward your own preferences and we recommend better matches.
            </p>
          </div>
          <Button variant="secondary" onClick={() => onNav("member-settings")}>Settings →</Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40, alignItems: "flex-start" }}>
          {/* Profile radar */}
          <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 32, boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)" }}>
            <Eyebrow>Your flavor map</Eyebrow>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--forest)", fontWeight: 500, margin: "6px 0 20px" }}>What you tend to like</h3>
            <RadarChart
              profiles={[
                { values: myProfile, color: "var(--burgundy)" },
                { values: TEAS[0].flavor[member.aligned], color: CONTRIBUTORS[member.aligned].color },
              ]}
              style={radarStyle}
              size={420}
            />
            <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--warm-200)" }}>
              <LegendDot color="var(--burgundy)" label={`${member.name}'s palate`} />
              <LegendDot color={CONTRIBUTORS[member.aligned].color} label={`Aligned: ${CONTRIBUTORS[member.aligned].name}`} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)" }}>
              <Eyebrow>Realign your palate</Eyebrow>
              <p style={{ fontSize: 13, color: "var(--warm-600)", margin: "8px 0 14px" }}>Pick a starting point. We use this only until you've rated a few teas of your own.</p>
              <div style={{ display: "flex", gap: 10 }}>
                {[CONTRIBUTORS.vivek, CONTRIBUTORS.james].map(c => (
                  <button key={c.key} onClick={() => setMember({ ...member, aligned: c.key })} style={{
                    flex: 1, padding: 14, borderRadius: "var(--r-lg)",
                    border: member.aligned === c.key ? `2px solid ${c.color}` : "1px solid var(--warm-300)",
                    background: member.aligned === c.key ? c.color + "12" : "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                  }}>
                    <AvatarChip who={c.key} size={36} />
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--burgundy)", fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--warm-600)" }}>{c.palate}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 24, boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)" }}>
              <Eyebrow>Your ratings</Eyebrow>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "8px 0 16px" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "var(--burgundy)", fontWeight: 500 }}>{member.ratings.length}</span>
                <span style={{ fontSize: 13, color: "var(--warm-600)" }}>teas rated · {Math.max(0, 5 - member.ratings.length)} more to drift independent</span>
              </div>
              {member.ratings.length === 0 ? (
                <div style={{ padding: 16, background: "var(--cream)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--warm-700)", lineHeight: 1.5 }}>
                  No ratings yet. Browse the library and rate a few teas to start shaping your profile.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {member.ratings.slice(0, 4).map(r => {
                    const t = TEAS.find(x => x.slug === r.slug);
                    return t && (
                      <div key={r.slug} onClick={() => onSelect(t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, borderRadius: "var(--r-md)", cursor: "pointer" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", background: t.gradient, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--burgundy)", fontWeight: 500 }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: "var(--warm-500)" }}>{t.region}</div>
                        </div>
                        <RatingScore value={r.rating} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Button variant="primary" size="lg" onClick={() => onNav("recommendations")}>Get recommendations →</Button>
          </div>
        </div>
      </Container>
    </main>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--warm-700)", fontWeight: 600 }}>
      <span style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
      {label}
    </span>
  );
}

// ===================== DISCOVER HUB =====================
function DiscoverHub({ onNav, onSelect }) {
  const teaCount = TEAS.length;
  const vendorCount = VENDORS.length;
  const cards = [
    {
      key: "discover-teas",
      eyebrow: "The library",
      title: "Teas",
      desc: "Every tea we've brewed, filtered by type, origin, vendor, and flavor. The full catalogue, with notes you can act on.",
      stat: `${teaCount} tea${teaCount === 1 ? "" : "s"} catalogued`,
      grad: "linear-gradient(135deg,#A8B49C 0%,#5A7A4D 100%)",
      mark: "茶",
    },
    {
      key: "discover-vendors",
      eyebrow: "The atlas",
      title: "Vendors",
      desc: "An atlas of shops we trust — grouped by continent, with their specialties and the teas of theirs we've reviewed.",
      stat: `${vendorCount} vendor${vendorCount === 1 ? "" : "s"} mapped`,
      grad: "linear-gradient(135deg,#D4B06A 0%,#A67A4D 100%)",
      mark: "店",
    },
    {
      key: "discover-glossary",
      eyebrow: "The reference",
      title: "Glossary",
      desc: "Tea types, brewing methods, vessels, flavor terms, and mouthfeel — each entry with a plain-language explanation and the deeper detail behind it.",
      stat: "Coming next",
      grad: "linear-gradient(135deg,#8A9BA8 0%,#5A6B7A 100%)",
      mark: "辞",
      disabled: true,
    },
  ];

  return (
    <main>
      <Container>
        <div style={{ padding: "56px 0 32px", position: "relative" }}>
          <TeaStain size={320} color="#C4A35A" opacity={0.14} style={{ position: "absolute", top: 0, right: -80, pointerEvents: "none" }} />
          <Eyebrow>Discover</Eyebrow>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 72, color: "var(--burgundy)", fontWeight: 500, margin: "12px 0 20px", letterSpacing: "-0.02em", lineHeight: 1.02 }}>
            <span style={{ fontStyle: "italic" }}>Find your way in.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--warm-700)", maxWidth: 640, lineHeight: 1.6, margin: 0 }}>
            Three doors into the same room. Pick the leaves, the people who sourced them, or the words we use to describe what's in the cup.
          </p>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, paddingBottom: 64 }}>
          {cards.map(card => (
            <article
              key={card.key}
              onClick={() => !card.disabled && onNav(card.key)}
              style={{
                background: "var(--bg-elevated)",
                borderRadius: "var(--r-2xl)",
                border: "1px solid rgba(212,196,160,0.4)",
                overflow: "hidden",
                cursor: card.disabled ? "default" : "pointer",
                opacity: card.disabled ? 0.72 : 1,
                boxShadow: "var(--shadow-card)",
                transition: "all var(--dur) var(--ease-smooth)",
                display: "flex", flexDirection: "column",
              }}
              onMouseEnter={e => {
                if (card.disabled) return;
                e.currentTarget.style.boxShadow = "var(--shadow-elevated)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                aspectRatio: "5/4",
                background: card.grad,
                position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.25) 100%)" }} />
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 140,
                  color: "rgba(250,247,242,0.9)",
                  fontWeight: 500,
                  fontStyle: "italic",
                  letterSpacing: "-0.04em",
                  position: "relative",
                  textShadow: "0 4px 24px rgba(0,0,0,0.18)",
                }}>{card.mark}</span>
                {card.disabled && (
                  <span style={{
                    position: "absolute", top: 14, right: 14,
                    background: "rgba(250,247,242,0.95)",
                    color: "var(--warm-600)",
                    padding: "5px 12px", borderRadius: "var(--r-pill)",
                    fontFamily: "var(--font-sans)",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                  }}>Coming next</span>
                )}
              </div>
              <div style={{ padding: "22px 24px 26px", flex: 1, display: "flex", flexDirection: "column" }}>
                <Eyebrow>{card.eyebrow}</Eyebrow>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 10px", letterSpacing: "-0.01em" }}>{card.title}</h2>
                <p style={{ fontSize: 14, color: "var(--warm-700)", lineHeight: 1.6, margin: "0 0 16px", flex: 1 }}>{card.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--warm-200)" }}>
                  <span style={{ fontSize: 11, color: "var(--warm-500)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>{card.stat}</span>
                  {!card.disabled && <span style={{ fontSize: 13, fontWeight: 700, color: "var(--burgundy)" }}>Open →</span>}
                </div>
              </div>
            </article>
          ))}
        </section>
      </Container>
    </main>
  );
}

// ===================== DISCOVER · VENDOR DIRECTORY (atlas) =====================
function DiscoverVendors({ onSelect, onSelectVendor, onBack }) {
  // group vendors by continent → country
  const grouped = uM(() => {
    const byContinent = {};
    for (const v of VENDORS) {
      const cont = v.continent || "Other";
      if (!byContinent[cont]) byContinent[cont] = {};
      const country = v.country || "Other";
      if (!byContinent[cont][country]) byContinent[cont][country] = [];
      byContinent[cont][country].push(v);
    }
    return byContinent;
  }, []);

  // continent display order
  const continentOrder = ["Asia", "North America", "Europe", "South America", "Africa", "Oceania", "Other"];
  const continents = Object.keys(grouped).sort(
    (a, b) => continentOrder.indexOf(a) - continentOrder.indexOf(b)
  );

  return (
    <main>
      <Container>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--warm-600)", fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer", margin: "32px 0 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>← Discover</button>
        <div style={{ padding: "8px 0 32px", position: "relative" }}>
          <Eyebrow>Discover · Vendors</Eyebrow>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 16px", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
            <span style={{ fontStyle: "italic" }}>An atlas of shops</span> we trust.
          </h1>
          <p style={{ fontSize: 16, color: "var(--warm-700)", lineHeight: 1.65, maxWidth: 640, margin: 0 }}>
            Vendors grouped by continent and country, with the teas of theirs we've reviewed. Outbound links are tracked through our affiliate redirect; we only list shops we'd recommend.
          </p>
        </div>

        {/* sticky continent index */}
        <div style={{
          position: "sticky", top: 84, zIndex: 5,
          background: "var(--bg)", paddingTop: 8, paddingBottom: 12,
          marginBottom: 16, borderBottom: "1px solid var(--warm-200)",
          display: "flex", gap: 8, flexWrap: "wrap",
        }}>
          {continents.map(c => (
            <a key={c} href={`#cont-${c.replace(/\s+/g, "-")}`} style={{
              padding: "5px 12px", borderRadius: "var(--r-pill)",
              border: "1px solid var(--warm-300)",
              fontSize: 11, fontWeight: 700, color: "var(--forest)",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>{c}</a>
          ))}
        </div>

        {continents.map(cont => {
          const countries = Object.keys(grouped[cont]).sort();
          return (
            <section key={cont} id={`cont-${cont.replace(/\s+/g, "-")}`} style={{ paddingTop: 32, paddingBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24, paddingBottom: 14, borderBottom: "2px solid var(--burgundy-muted)" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 44, color: "var(--burgundy)", fontWeight: 500, margin: 0, letterSpacing: "-0.01em", fontStyle: "italic" }}>{cont}</h2>
                <span style={{ fontSize: 11, color: "var(--warm-500)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
                  {countries.reduce((n, c) => n + grouped[cont][c].length, 0)} vendor{countries.reduce((n, c) => n + grouped[cont][c].length, 0) === 1 ? "" : "s"}
                </span>
              </div>

              {countries.map(country => {
                const vs = grouped[cont][country];
                return (
                  <div key={country} style={{ marginBottom: 36 }}>
                    <Eyebrow>{country}</Eyebrow>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 14 }}>
                      {vs.map(v => {
                        const teas = TEAS.filter(t => t.vendor === v.name);
                        return (
                          <article
                            key={v.slug}
                            onClick={() => onSelectVendor(v)}
                            style={{
                              background: "var(--bg-elevated)",
                              borderRadius: "var(--r-xl)",
                              border: "1px solid rgba(212,196,160,0.35)",
                              boxShadow: "var(--shadow-card)",
                              padding: 22, cursor: "pointer",
                              transition: "all var(--dur) var(--ease-smooth)",
                              display: "flex", flexDirection: "column", gap: 16,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-elevated)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}
                          >
                            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                              <div style={{
                                width: 64, height: 64, borderRadius: "var(--r-md)", background: v.swatch, flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 30,
                                color: "var(--cream)", fontWeight: 500,
                              }}>{v.name[0]}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--burgundy)", fontWeight: 500, margin: "0 0 4px", letterSpacing: "-0.01em" }}>{v.name}</h3>
                                <Eyebrow color="var(--warm-500)">{v.city} · est. {v.founded}</Eyebrow>
                              </div>
                              <div style={{ flexShrink: 0 }}><StarRow value={v.rating} /></div>
                            </div>
                            <p style={{ fontSize: 13, color: "var(--warm-700)", lineHeight: 1.55, margin: 0 }}>{v.tagline}</p>
                            {v.specialties && v.specialties.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {v.specialties.map(s => (
                                  <span key={s} style={{
                                    padding: "3px 9px", borderRadius: "var(--r-pill)",
                                    background: "var(--warm-200)",
                                    color: "var(--warm-700)",
                                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                                  }}>{s}</span>
                                ))}
                              </div>
                            )}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--warm-200)" }}>
                              <span style={{ fontSize: 11, color: "var(--warm-500)", letterSpacing: "0.06em", fontWeight: 700 }}>
                                {teas.length} reviewed · {v.teaCount} catalogued
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--burgundy)" }}>Open profile →</span>
                            </div>
                            {teas.length > 0 && (
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {teas.slice(0, 4).map(t => (
                                  <button
                                    key={t.slug}
                                    onClick={(e) => { e.stopPropagation(); onSelect(t); }}
                                    style={{
                                      padding: "5px 10px", borderRadius: "var(--r-pill)",
                                      border: `1px solid ${t.swatch}66`,
                                      background: t.swatch + "1a",
                                      color: "var(--forest)",
                                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                                      fontFamily: "var(--font-sans)",
                                    }}
                                  >{t.name}</button>
                                ))}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}

        <div style={{ background: "var(--cream)", padding: "20px 24px", borderRadius: "var(--r-xl)", marginTop: 24, marginBottom: 32, border: "1px dashed var(--warm-300)", fontSize: 12, color: "var(--warm-600)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--forest)" }}>Affiliate disclosure:</strong> outbound links to vendors are tracked through our /go/ redirect system. We earn a small commission on referrals; this never influences which vendors appear in the atlas.
        </div>
      </Container>
    </main>
  );
}

// ===================== DISCOVER · GLOSSARY (placeholder for Phase 2) =====================
function Glossary({ onBack }) {
  return (
    <main>
      <Container max={920}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--warm-600)", fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer", margin: "32px 0 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>← Discover</button>
        <div style={{ padding: "8px 0 32px" }}>
          <Eyebrow>Discover · Glossary</Eyebrow>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 16px", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
            <span style={{ fontStyle: "italic" }}>The words</span> for what's in the cup.
          </h1>
          <p style={{ fontSize: 16, color: "var(--warm-700)", lineHeight: 1.65, maxWidth: 620, margin: "0 0 32px" }}>
            Tea types, brewing methods, vessels, flavor terms, and mouthfeel — every entry written twice. A plain-language line about why it matters, then the technical and historical detail underneath.
          </p>
        </div>

        <div style={{
          background: "var(--bg-elevated)",
          borderRadius: "var(--r-2xl)",
          border: "1px dashed var(--warm-300)",
          padding: "48px 32px",
          textAlign: "center",
        }}>
          <div style={{
            display: "inline-block",
            padding: "5px 14px",
            borderRadius: "var(--r-pill)",
            background: "var(--burgundy-muted)",
            color: "var(--burgundy)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
            marginBottom: 16,
          }}>Coming next · Phase 2</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--forest)", fontWeight: 500, margin: "0 0 12px", letterSpacing: "-0.01em" }}>Five sections, side by side</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: "16px auto 0", maxWidth: 480, textAlign: "left" }}>
            {[
              ["Tea Types", "Green, white, oolong, black, pu'er sheng/shou, yellow, hei cha…"],
              ["Brewing Methods", "Gongfu, western, grandpa, cold-brew…"],
              ["Brewing Vessels", "Gaiwan, yixing, kyusu, hohin, shiboridashi…"],
              ["Flavor Terms", "Every flavor on the 12-axis radar — defined."],
              ["Mouthfeel", "Astringent, oily, full-bodied, huigan, qi, drying…"],
            ].map(([t, d]) => (
              <li key={t} style={{ padding: "12px 0", borderBottom: "1px solid var(--warm-200)", display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--burgundy)", fontWeight: 500, flexShrink: 0 }}>{t}</span>
                <span style={{ fontSize: 12, color: "var(--warm-600)", textAlign: "right" }}>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </main>
  );
}

// ===================== MEMBER SETTINGS =====================
function MemberSettings({ member, setMember, onNav, onSelect, reblind }) {
  const s = member.settings || {};
  const setSetting = (key, val) => setMember(m => ({ ...m, settings: { ...m.settings, [key]: val } }));
  const setNotif = (key, val) => setMember(m => ({
    ...m,
    settings: { ...m.settings, notifications: { ...m.settings?.notifications, [key]: val } },
  }));

  const blindCount = (s.tastedTeas || []).length;
  const tastedTeas = (s.tastedTeas || []).map(slug => TEAS.find(t => t.slug === slug)).filter(Boolean);

  return (
    <main>
      <Container max={920}>
        <button onClick={() => onNav("member")} style={{ background: "transparent", border: "none", color: "var(--warm-600)", fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer", margin: "32px 0 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>← Back to your profile</button>

        <div style={{ padding: "8px 0 32px" }}>
          <Eyebrow>Member · Settings</Eyebrow>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 12px", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
            <span style={{ fontStyle: "italic" }}>Your settings.</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--warm-700)", maxWidth: 620, lineHeight: 1.6, margin: 0 }}>
            How the site looks to you, what arrives in your inbox, and the names you go by here.
          </p>
        </div>

        {/* IDENTITY */}
        <SettingsCard title="Identity" eyebrow="Who you are">
          <SettingsField label="Display name" hint="Shown next to your reviews and journal entries.">
            <input value={s.displayName || ""} onChange={e => setSetting("displayName", e.target.value)}
              placeholder={member.name || "You"}
              style={settingsInput} />
          </SettingsField>
          <SettingsField label="Email" hint="Used for sign-in and notifications. We never share it.">
            <input type="email" value={s.email || ""} onChange={e => setSetting("email", e.target.value)}
              placeholder="you@example.com"
              style={settingsInput} />
          </SettingsField>
          <SettingsField label="Contributor handle" hint="Optional — leave blank unless you've been invited as a contributor.">
            <input value={s.contributorHandle || ""} onChange={e => setSetting("contributorHandle", e.target.value)}
              placeholder="e.g. @kira"
              style={settingsInput} />
          </SettingsField>
        </SettingsCard>

        {/* NOTIFICATIONS */}
        <SettingsCard title="Notifications" eyebrow="What lands in your inbox">
          <SettingsToggle label="Weekly digest" sub="Friday roundup of new reviews and journal entries."
            value={!!s.notifications?.weeklyDigest} onChange={v => setNotif("weeklyDigest", v)} />
          <SettingsToggle label="New tea alerts" sub="When a tea you might like (based on your palate) gets reviewed."
            value={!!s.notifications?.newTeas} onChange={v => setNotif("newTeas", v)} />
          <SettingsToggle label="Sample-send opportunities" sub="Vivek and James occasionally have spare grams of teas they're reviewing."
            value={!!s.notifications?.sampleRequests} onChange={v => setNotif("sampleRequests", v)} />
          <SettingsToggle label="Replies to your reviews" sub="When another member or contributor responds."
            value={!!s.notifications?.replies} onChange={v => setNotif("replies", v)} />
        </SettingsCard>

        {/* DISPLAY */}
        <SettingsCard title="Display options" eyebrow="How the site looks to you">
          <SettingsField label="Radar mode" hint="How flavor profiles are shown to you across the site.">
            <RadioCardGroup
              value={s.flavorMode || "advanced"}
              onChange={v => setSetting("flavorMode", v)}
              options={[
                { value: "blind",    title: "Blind",    sub: "Hide reviews & ratings until you've tasted." },
                { value: "basic",    title: "Simple",   sub: "Six lay-term axes on a 5-point scale — gentlest entry." },
                { value: "advanced", title: "Advanced", sub: "Twelve sommelier axes on a 10-point scale." },
              ]}
            />
          </SettingsField>
          <SettingsToggle label="Show all radars overlaid by default"
            sub="On tea detail pages, show Vivek + James + Members at once instead of one tab at a time."
            value={!!s.composite}
            onChange={v => setSetting("composite", v)} />
          <SettingsField label="Theme" hint="Override the site's background. Auto follows whatever the site default is.">
            <RadioCardGroup
              value={s.theme || "auto"}
              onChange={v => setSetting("theme", v)}
              options={[
                { value: "auto",      title: "Auto",      sub: "Follow site default." },
                { value: "parchment", title: "Parchment", sub: "Warm off-white, our default." },
                { value: "cream",     title: "Cream",     sub: "A touch lighter, easier on bright screens." },
                { value: "dark",      title: "Dark",      sub: "Burgundy on near-black for late sessions." },
              ]}
            />
          </SettingsField>
        </SettingsCard>

        {/* UNBLINDED TEAS */}
        {(s.flavorMode === "blind" || blindCount > 0) && (
          <SettingsCard title="Un-blinded teas" eyebrow={`${blindCount} ${blindCount === 1 ? "tea" : "teas"} you've revealed`}>
            <p style={{ fontSize: 13, color: "var(--warm-600)", lineHeight: 1.6, margin: "0 0 16px" }}>
              In Blind mode we hide reviews until you tap "I've tasted this." These teas are no longer hidden for you. Re-blind any of them if you'd like to be surprised again.
            </p>
            {tastedTeas.length === 0 ? (
              <div style={{ padding: 16, background: "var(--cream)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--warm-700)" }}>
                Nothing un-blinded yet. As you reveal teas in Blind mode they'll appear here.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {tastedTeas.map(t => (
                  <div key={t.slug} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "8px 12px", borderRadius: "var(--r-md)",
                    background: "var(--cream)",
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", background: t.gradient, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <button onClick={() => onSelect(t)} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--burgundy)", fontWeight: 500 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "var(--warm-500)" }}>{t.region}</div>
                      </button>
                    </div>
                    <button onClick={() => reblind && reblind(t.slug)} style={{
                      background: "transparent", border: "1px solid var(--warm-300)",
                      padding: "5px 12px", borderRadius: "var(--r-pill)",
                      fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
                      color: "var(--warm-700)", cursor: "pointer", letterSpacing: "0.04em",
                    }}>Re-blind</button>
                  </div>
                ))}
              </div>
            )}
          </SettingsCard>
        )}

        {/* ACCOUNT */}
        <SettingsCard title="Account" eyebrow="Sign-out & data">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={() => alert("Sign-out is wired up in Phase 6 (auth).")}>Sign out</Button>
            <Button variant="ghost" style={{ color: "var(--burgundy)" }} onClick={() => alert("Account deletion lands with the backend.")}>Delete account…</Button>
          </div>
        </SettingsCard>

        <div style={{ padding: "32px 0 64px", textAlign: "center", fontSize: 12, color: "var(--warm-500)" }}>
          Settings save automatically as you change them.
        </div>
      </Container>
    </main>
  );
}

const settingsInput = {
  width: "100%",
  padding: "10px 14px",
  fontFamily: "var(--font-sans)", fontSize: 14,
  background: "var(--cream)", border: "1px solid var(--warm-200)",
  borderRadius: "var(--r-md)", color: "var(--forest)", outline: "none",
};

function SettingsCard({ title, eyebrow, children }) {
  return (
    <section style={{
      background: "var(--bg-elevated)",
      borderRadius: "var(--r-xl)",
      border: "1px solid rgba(212,196,160,0.35)",
      boxShadow: "var(--shadow-card)",
      padding: 28, marginBottom: 20,
    }}>
      <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--warm-200)" }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--burgundy)", fontWeight: 500, margin: "6px 0 0", letterSpacing: "-0.01em" }}>{title}</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
    </section>
  );
}

function SettingsField({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--forest)", marginBottom: 4, letterSpacing: "0.04em" }}>{label}</label>
      {hint && <div style={{ fontSize: 12, color: "var(--warm-600)", margin: "0 0 8px", lineHeight: 1.5 }}>{hint}</div>}
      {children}
    </div>
  );
}

function SettingsToggle({ label, sub, value, onChange }) {
  return (
    <label style={{ display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer" }}>
      <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
        style={{ marginTop: 3, accentColor: "var(--burgundy)", width: 16, height: 16, cursor: "pointer" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--forest)" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--warm-600)", marginTop: 2, lineHeight: 1.5 }}>{sub}</div>}
      </div>
    </label>
  );
}

function RadioCardGroup({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            textAlign: "left", padding: "12px 14px",
            borderRadius: "var(--r-md)",
            border: active ? "2px solid var(--burgundy)" : "1px solid var(--warm-300)",
            background: active ? "var(--burgundy-muted)" : "transparent",
            color: "var(--forest)", cursor: "pointer",
            fontFamily: "var(--font-sans)",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: "50%",
              border: active ? "5px solid var(--burgundy)" : "2px solid var(--warm-300)",
              background: active ? "var(--cream)" : "transparent",
              flexShrink: 0, marginTop: 3,
              boxSizing: "border-box",
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{o.title}</div>
              {o.sub && <div style={{ fontSize: 12, color: "var(--warm-600)", marginTop: 2, lineHeight: 1.5 }}>{o.sub}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

window.Pages = { Home, Library, Vendors, VendorDetail, BlogIndex, BlogPost, About, MemberProfile, MemberSettings, DiscoverHub, DiscoverVendors, Glossary, Container, SectionHeader, Stat };
