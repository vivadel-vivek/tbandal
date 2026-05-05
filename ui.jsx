/* eslint-disable */
// =====================================================================
// SHARED COMPONENTS — atoms, chrome, charts
// =====================================================================
const { useState, useEffect, useRef, useMemo } = React;
const { FLAVOR_AXES, CONTRIBUTORS } = window.AppData;

// ---------- Atoms ----------
function Eyebrow({ children, color = "var(--gold-dark)", style }) {
  return (
    <span style={{
      fontSize: 11, fontFamily: "var(--font-sans)",
      letterSpacing: "0.16em", textTransform: "uppercase",
      fontWeight: 700, color, ...style,
    }}>{children}</span>
  );
}

function Button({ children, variant = "primary", size = "default", onClick, style }) {
  const base = {
    fontFamily: "var(--font-sans)", fontWeight: 700, cursor: "pointer",
    border: "none", display: "inline-flex", alignItems: "center", gap: 8,
    transition: "all var(--dur) var(--ease-smooth)",
    borderRadius: "var(--r-pill)", whiteSpace: "nowrap",
  };
  const variants = {
    primary:   { background: "var(--burgundy)", color: "var(--cream)" },
    secondary: { background: "transparent", color: "var(--burgundy)", border: "1.5px solid var(--burgundy)" },
    ghost:     { background: "transparent", color: "var(--forest)", borderRadius: "var(--r-md)" },
    gold:      { background: "var(--gold)", color: "var(--forest)" },
  };
  const sizes = {
    sm:      { padding: "7px 14px", fontSize: 11 },
    default: { padding: "11px 22px", fontSize: 13 },
    lg:      { padding: "14px 28px", fontSize: 15 },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...sizes[size], ...style }}>{children}</button>;
}

function RatingScore({ value = 8.5, max = 10, big = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4, fontFamily: "var(--font-display)", color: "var(--burgundy)" }}>
      <span style={{ fontSize: big ? 56 : 22, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em" }}>{value.toFixed(1)}</span>
      <span style={{ fontSize: big ? 18 : 11, color: "var(--warm-500)", fontFamily: "var(--font-sans)", fontWeight: 600 }}>/{max}</span>
    </span>
  );
}

function StarRow({ value = 4, max = 5, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1, fontSize: size, letterSpacing: 1, lineHeight: 1 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < value ? "var(--gold)" : "var(--warm-200)" }}>★</span>
      ))}
    </span>
  );
}

function TeaTypeTag({ type, small }) {
  const map = {
    Green:  { bg: "rgba(122,154,109,0.18)", fg: "#5A7A4D" },
    White:  { bg: "#E8E5E2",                fg: "#6B6560" },
    Yellow: { bg: "rgba(212,196,122,0.22)", fg: "#A69A3D" },
    Oolong: { bg: "rgba(212,160,122,0.22)", fg: "#A67A4D" },
    Black:  { bg: "rgba(92,64,51,0.18)",    fg: "#5C4033" },
    "Pu'er":{ bg: "rgba(139,115,85,0.2)",   fg: "#6B5335" },
    Herbal: { bg: "rgba(154,122,154,0.18)", fg: "#7A5A7A" },
  };
  const { bg, fg } = map[type] || map.Green;
  return (
    <span style={{
      padding: small ? "3px 9px" : "5px 12px", borderRadius: "var(--r-pill)",
      fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: 0.4,
      background: bg, color: fg, textTransform: "uppercase",
    }}>{type}</span>
  );
}

function FlavorBadge({ axis, intensity }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 12px", borderRadius: "var(--r-pill)",
      background: axis.color + "1f", border: `1px solid ${axis.color}55`,
      fontSize: 12, color: "var(--forest)", fontWeight: 500,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: axis.color }} />
      {axis.label}
      <span style={{ opacity: 0.55, fontSize: 9, letterSpacing: 1, fontFamily: "ui-monospace,monospace" }}>
        {Math.round(intensity)}
      </span>
    </span>
  );
}

function AvatarChip({ who, size = 28 }) {
  const c = CONTRIBUTORS[who];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%",
      background: c.color, color: "var(--cream)",
      fontFamily: "var(--font-display)", fontStyle: "italic",
      fontWeight: 500, fontSize: size * 0.5,
      flexShrink: 0,
    }}>{c.initials}</span>
  );
}

// ---------- Radar Chart ----------
// profiles: array of { who, values: {axis: 0-10}, color, style }
// axes: array of axis configs (defaults to the 12 advanced axes)
// style: 'fill' | 'outline' | 'dotted'
function RadarChart({ profiles, axes = FLAVOR_AXES, size = 360, style = "fill", showLabels = true, showGrid = true }) {
  const cx = size / 2, cy = size / 2;
  // Tighter label-padding for fewer axes (basic radar reads better with less margin)
  const labelPad = axes.length <= 6 ? 38 : 50;
  const r = size / 2 - (showLabels ? labelPad : 16);
  const N = axes.length;
  const angle = (i) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const point = (i, val) => {
    const a = angle(i);
    const rad = (val / 10) * r;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  };
  const polygonPath = (vals) => axes.map((ax, i) => {
    const [x, y] = point(i, vals[ax.key] || 0);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
      {/* grid */}
      {showGrid && [2, 4, 6, 8, 10].map(level => (
        <polygon
          key={level}
          points={axes.map((_, i) => point(i, level).join(",")).join(" ")}
          fill="none"
          stroke="var(--warm-200)"
          strokeWidth={level === 10 ? 1 : 0.6}
          strokeDasharray={level === 10 ? "" : "2,3"}
          opacity={level === 10 ? 0.8 : 0.5}
        />
      ))}
      {/* axes spokes */}
      {showGrid && axes.map((_, i) => {
        const [x, y] = point(i, 10);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--warm-200)" strokeWidth={0.5} opacity={0.5} />;
      })}
      {/* profile shapes */}
      {profiles.map((prof, idx) => {
        const path = polygonPath(prof.values);
        const color = prof.color;
        if (style === "outline") {
          return <path key={idx} d={path} fill={color + "10"} stroke={color} strokeWidth={2} strokeLinejoin="round" />;
        }
        if (style === "dotted") {
          return <path key={idx} d={path} fill="none" stroke={color} strokeWidth={2} strokeDasharray="3,3" strokeLinejoin="round" />;
        }
        // fill (default)
        return (
          <path key={idx} d={path}
            fill={color} fillOpacity={0.18}
            stroke={color} strokeWidth={1.5}
            strokeLinejoin="round" />
        );
      })}
      {/* dots at vertices for primary profile */}
      {profiles[0] && axes.map((ax, i) => {
        const [x, y] = point(i, profiles[0].values[ax.key] || 0);
        return <circle key={i} cx={x} cy={y} r={2.5} fill={profiles[0].color} />;
      })}
      {/* labels */}
      {showLabels && axes.map((ax, i) => {
        const a = angle(i);
        const rad = r + 22;
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad;
        const dotX = cx + Math.cos(a) * (r + 8);
        const dotY = cy + Math.sin(a) * (r + 8);
        const align = Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle";
        // larger label for the simpler 6-axis basic radar
        const fontSize = axes.length <= 6 ? 11 : 10;
        return (
          <g key={ax.key}>
            <circle cx={dotX} cy={dotY} r={3} fill={ax.color} opacity={0.7} />
            <text
              x={x} y={y}
              textAnchor={align}
              dominantBaseline="middle"
              fontFamily="var(--font-sans)"
              fontSize={fontSize}
              fontWeight={600}
              fill="var(--forest)"
              letterSpacing={0.3}
              style={{ textTransform: "uppercase" }}
            >{ax.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Mouthfeel grid (cartesian) ----------
// astringent (x: 0 oily ↔ 10 astringent), bodyFull (y: 0 light ↔ 10 full)
function MouthfeelGrid({ point: pt, points = [], size = 260 }) {
  const ptArr = pt ? [{ ...pt, color: "var(--burgundy)", label: "" }] : points;
  const pad = 36;
  const inner = size - pad * 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {/* outer box */}
      <rect x={pad} y={pad} width={inner} height={inner} fill="none" stroke="var(--warm-200)" strokeWidth={1} />
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map((f, i) => (
        <g key={i} stroke="var(--warm-200)" strokeWidth={0.5} strokeDasharray="2,3" opacity={0.7}>
          <line x1={pad + inner * f} y1={pad} x2={pad + inner * f} y2={pad + inner} />
          <line x1={pad} y1={pad + inner * f} x2={pad + inner} y2={pad + inner * f} />
        </g>
      ))}
      {/* axes labels */}
      <text x={pad} y={pad - 12} fontFamily="var(--font-sans)" fontSize={9} fontWeight={700} fill="var(--warm-500)" letterSpacing="0.14em" style={{ textTransform: "uppercase" }}>Light</text>
      <text x={pad + inner} y={pad - 12} textAnchor="end" fontFamily="var(--font-sans)" fontSize={9} fontWeight={700} fill="var(--warm-500)" letterSpacing="0.14em" style={{ textTransform: "uppercase" }}>Full bodied</text>
      <text x={pad - 8} y={pad + inner + 18} textAnchor="end" fontFamily="var(--font-sans)" fontSize={9} fontWeight={700} fill="var(--warm-500)" letterSpacing="0.14em" style={{ textTransform: "uppercase" }}>Oily</text>
      <text x={pad + inner + 8} y={pad + inner + 18} fontFamily="var(--font-sans)" fontSize={9} fontWeight={700} fill="var(--warm-500)" letterSpacing="0.14em" style={{ textTransform: "uppercase" }}>Astringent</text>
      {/* center divider hint */}
      <line x1={pad + inner / 2} y1={pad} x2={pad + inner / 2} y2={pad + inner} stroke="var(--warm-300)" strokeWidth={0.4} />
      <line x1={pad} y1={pad + inner / 2} x2={pad + inner} y2={pad + inner / 2} stroke="var(--warm-300)" strokeWidth={0.4} />
      {/* points */}
      {ptArr.map((p, i) => {
        const x = pad + (p.astringent / 10) * inner;
        const y = pad + (1 - p.bodyFull / 10) * inner;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={9} fill={p.color} opacity={0.18} />
            <circle cx={x} cy={y} r={5} fill={p.color} stroke="var(--cream)" strokeWidth={1.5} />
            {p.label && (
              <text x={x + 10} y={y + 3} fontFamily="var(--font-sans)" fontSize={10} fontWeight={700} fill={p.color}>{p.label}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Tea card ----------
function TeaCard({ tea, onClick, density = "cozy", showRating = true, hideReviews = false }) {
  const compact = density === "compact";
  return (
    <article onClick={onClick} style={{
      background: "var(--bg-elevated)",
      borderRadius: "var(--r-xl)",
      boxShadow: "var(--shadow-card)",
      border: "1px solid rgba(212,196,160,0.3)",
      overflow: "hidden", cursor: "pointer",
      transition: "all var(--dur) var(--ease-smooth)",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-elevated)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ aspectRatio: compact ? "16/8" : "16/10", background: tea.gradient, position: "relative" }}>
        <div style={{ position: "absolute", top: 12, left: 12 }}><TeaTypeTag type={tea.type} small={compact} /></div>
        {!hideReviews && showRating && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(250,247,242,0.92)",
            backdropFilter: "blur(2px)",
            padding: "4px 10px", borderRadius: "var(--r-pill)",
            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
            color: "var(--burgundy)",
          }}>
            {(((tea.reviews?.vivek?.rating || 0) + (tea.reviews?.james?.rating || 0)) / 2).toFixed(1)}
          </div>
        )}
      </div>
      <div style={{ padding: compact ? "12px 14px 14px" : "16px 18px 18px" }}>
        <Eyebrow>{tea.region}</Eyebrow>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: compact ? 19 : 24, color: "var(--burgundy)", fontWeight: 500, margin: "4px 0 4px", lineHeight: 1.1, letterSpacing: "-0.01em" }}>{tea.name}</h3>
        {!compact && <p style={{ fontSize: 12, color: "var(--warm-600)", margin: 0 }}>{tea.year} · {tea.elev}m · {tea.vendor}</p>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: compact ? 8 : 12, gap: 8 }}>
          {!hideReviews && <StarRow value={Math.round(((tea.reviews?.vivek?.rating || 0) + (tea.reviews?.james?.rating || 0)) / 4)} />}
          <span style={{ fontSize: 12, color: "var(--warm-500)", fontFamily: "ui-monospace,monospace" }}>${tea.price.toFixed(2)}/g</span>
        </div>
      </div>
    </article>
  );
}

// ---------- Chrome ----------
function Header({ active, onNav, member, onMemberClick }) {
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const closeTimer = useRef(null);
  const wrapRef = useRef(null);

  const openDiscover = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setDiscoverOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setDiscoverOpen(false), 140);
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setDiscoverOpen(false); };
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setDiscoverOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const discoverActive = active === "discover-hub" || active === "discover-teas"
    || active === "discover-vendors" || active === "discover-glossary";

  const goDiscover = (key) => {
    setDiscoverOpen(false);
    onNav(key);
  };

  const navBtn = (isActive) => ({
    padding: "8px 14px", borderRadius: "var(--r-pill)",
    border: "none", background: isActive ? "var(--burgundy-muted)" : "transparent",
    color: isActive ? "var(--burgundy)" : "var(--forest)",
    fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, cursor: "pointer",
  });

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 40px", borderBottom: "1px solid var(--warm-200)",
      background: "var(--bg)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onNav("home")}>
        <object data="assets/mark.svg" type="image/svg+xml" style={{ width: 36, height: 36, color: "var(--burgundy)", pointerEvents: "none" }} />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, color: "var(--burgundy)", fontWeight: 500 }}>Two Buds and a Leaf</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--warm-500)", marginTop: 4 }}>Tea Library &amp; Journal</span>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <button onClick={() => onNav("home")} style={navBtn(active === "home")}>Home</button>

        {/* Discover dropdown */}
        <div
          ref={wrapRef}
          onMouseEnter={openDiscover}
          onMouseLeave={scheduleClose}
          style={{ position: "relative" }}
        >
          <button
            onClick={() => discoverOpen ? setDiscoverOpen(false) : (onNav("discover-hub"), setDiscoverOpen(false))}
            onFocus={openDiscover}
            aria-haspopup="true"
            aria-expanded={discoverOpen}
            style={{
              ...navBtn(discoverActive),
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
            Discover
            <span style={{ fontSize: 9, opacity: 0.7, transform: discoverOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform var(--dur) var(--ease-smooth)" }}>▾</span>
          </button>
          {discoverOpen && (
            <div
              role="menu"
              style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0,
                minWidth: 240,
                background: "var(--bg-elevated)",
                borderRadius: "var(--r-lg)",
                border: "1px solid rgba(212,196,160,0.45)",
                boxShadow: "var(--shadow-elevated)",
                padding: 8, zIndex: 60,
              }}>
              {[
                { key: "discover-teas", label: "Teas", desc: "Browse the full library" },
                { key: "discover-vendors", label: "Vendors", desc: "Atlas of shops we trust" },
                { key: "discover-glossary", label: "Glossary", desc: "Terms, types & techniques" },
              ].map(item => (
                <button
                  key={item.key}
                  role="menuitem"
                  onClick={() => goDiscover(item.key)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "10px 12px", borderRadius: "var(--r-md)",
                    background: active === item.key ? "var(--burgundy-muted)" : "transparent",
                    border: "none", cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                  onMouseEnter={e => { if (active !== item.key) e.currentTarget.style.background = "var(--cream)"; }}
                  onMouseLeave={e => { if (active !== item.key) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: active === item.key ? "var(--burgundy)" : "var(--forest)" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "var(--warm-600)", marginTop: 2 }}>{item.desc}</div>
                </button>
              ))}
              <div style={{ borderTop: "1px solid var(--warm-200)", margin: "6px 4px" }} />
              <button
                role="menuitem"
                onClick={() => goDiscover("discover-hub")}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "8px 12px", borderRadius: "var(--r-md)",
                  background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700,
                  color: "var(--burgundy)", letterSpacing: "0.04em",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--cream)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >Discover overview →</button>
            </div>
          )}
        </div>

        <button onClick={() => onNav("blog")} style={navBtn(active === "blog")}>Journal</button>
        <button onClick={() => onNav("about")} style={navBtn(active === "about")}>About</button>

        <button onClick={onMemberClick} style={{
          marginLeft: 12, padding: "5px 12px 5px 5px",
          border: "1px solid var(--warm-300)", borderRadius: "var(--r-pill)",
          background: "var(--bg-elevated)", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 8,
          fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--forest)",
        }}>
          <AvatarChip who={member?.aligned || "vivek"} size={26} />
          {member?.name || "You"}
        </button>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{
      padding: "48px 40px 32px",
      borderTop: "1px solid var(--warm-200)",
      background: "var(--bg)",
      fontFamily: "var(--font-sans)",
      marginTop: 64,
    }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <object data="assets/mark.svg" type="image/svg+xml" style={{ width: 28, height: 28, color: "var(--burgundy)", pointerEvents: "none" }} />
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18, color: "var(--burgundy)", fontWeight: 500 }}>Two Buds and a Leaf</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--warm-600)", maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
            A working catalogue of teas we've brewed, with notes from gongfu sessions, vendor pointers, and the occasional confession of a bad pour.
          </p>
        </div>
        <FooterCol title="Explore" items={["Discover", "Teas", "Vendors", "Glossary", "Journal"]} />
        <FooterCol title="The Site" items={["About", "Contributors", "Methodology", "Newsletter"]} />
        <FooterCol title="Connect" items={["hello@twobudsandaleaf.com", "RSS", "Mastodon"]} />
      </div>
      <div style={{ maxWidth: 1180, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid var(--warm-200)", display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--warm-500)", letterSpacing: "0.04em" }}>
        <span>© 2026 Two Buds and a Leaf · Brewed with care.</span>
        <span>Affiliate disclosure · Privacy</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--warm-500)", marginBottom: 14 }}>{title}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(i => <li key={i}><a style={{ fontSize: 13, color: "var(--warm-700)" }}>{i}</a></li>)}
      </ul>
    </div>
  );
}

// ---------- Tea-stain accent (decorative SVG) ----------
function TeaStain({ size = 200, color = "var(--gold)", opacity = 0.18, style }) {
  return (
    <svg viewBox="0 0 200 200" style={{ width: size, height: size, display: "block", ...style }}>
      <defs>
        <radialGradient id="stainG" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0%" stopColor={color} stopOpacity={opacity * 0.4} />
          <stop offset="60%" stopColor={color} stopOpacity={opacity * 0.95} />
          <stop offset="92%" stopColor={color} stopOpacity={opacity * 0.6} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d="M 100,15 C 142,10 175,40 180,82 C 188,125 165,170 122,182 C 78,193 32,178 22,135 C 12,92 25,42 60,22 C 78,12 88,17 100,15 Z"
        fill="url(#stainG)"
      />
      <ellipse cx="100" cy="100" rx="72" ry="68" fill="none" stroke={color} strokeOpacity={opacity * 1.4} strokeWidth="1.5" />
      <ellipse cx="105" cy="98" rx="58" ry="52" fill="none" stroke={color} strokeOpacity={opacity * 0.9} strokeWidth="0.8" />
    </svg>
  );
}

window.UI = {
  Eyebrow, Button, RatingScore, StarRow, TeaTypeTag, FlavorBadge, AvatarChip,
  RadarChart, MouthfeelGrid, TeaCard, Header, Footer, TeaStain,
};
