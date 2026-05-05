/* eslint-disable */
// =====================================================================
// TEA DETAIL — 3 hero variations + reviews tabs + radar + mouthfeel
// =====================================================================
const { Eyebrow: TE, Button: TB, RatingScore: TRS, StarRow: TSR, TeaTypeTag: TTT,
        FlavorBadge: TFB, AvatarChip: TAC, RadarChart: TRC, MouthfeelGrid: TMG, TeaCard: TTC,
        TeaStain: TST } = window.UI;
const { TEAS: TT, FLAVOR_AXES: TFA, BASIC_AXES: TBA, CONTRIBUTORS: TCB, rollUpProfile: TRoll } = window.AppData;
const { Container: TCT, SectionHeader: TSH } = window.Pages;
const { useState: tuS, useMemo: tuM } = React;

// Composite = avg of the contributors that actually reviewed (drops nulls)
const composite = (tea) => {
  const out = {};
  for (const ax of TFA) {
    const vals = [];
    if (tea.reviews.vivek) vals.push(tea.flavor.vivek[ax.key]);
    if (tea.reviews.james) vals.push(tea.flavor.james[ax.key]);
    vals.push(tea.flavor.members[ax.key]);
    out[ax.key] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return out;
};

// Top-N dominant flavors for description (works for either axis set)
const topFlavors = (vals, axes = TFA) => [...axes].sort((a, b) => (vals[b.key] || 0) - (vals[a.key] || 0)).slice(0, 4).filter(a => vals[a.key] >= 4);

function TeaDetail({ tea, onBack, onSelect, onVendor, onMember,
                    member, setMember, onRequestReview,
                    radarStyle = "fill", heroVariant = "split", showComposite = false,
                    blindMode = false, hideReviews = false,
                    isBlinded = false, memberFlavorMode = "advanced", onUnblind }) {
  const [activeTab, setActiveTab] = tuS("vivek"); // vivek | james | members | you
  const [showRateModal, setShowRateModal] = tuS(false);
  // Per-page Basic/Advanced toggle. When the member's setting is "blind"
  // we still need a value for the toggle UI — fall back to "advanced".
  const initialMode = memberFlavorMode === "blind" ? "advanced" : memberFlavorMode;
  const [flavorMode, setFlavorMode] = tuS(initialMode);
  const isBasic = flavorMode === "basic";
  const radarAxes = isBasic ? TBA : TFA;
  const toRadarValues = (vals) => isBasic ? TRoll(vals) : vals;
  // member-level blind mode (different from the Discover blind-tasting flow)
  const memberBlind = isBlinded && !blindMode;

  // member's rating for THIS tea (if any)
  const memberRating = (member?.ratings || []).find(r => r.slug === tea.slug);
  const hasMember = !!memberRating;

  // augmented review map (with synthetic "you" entry if rated)
  const reviewMap = {
    vivek: tea.reviews.vivek,
    james: tea.reviews.james,
    members: tea.reviews.members,
    you: hasMember ? { rating: memberRating.rating, body: memberRating.body, date: memberRating.date, session: memberRating.session } : null,
  };
  const profileMap = {
    vivek: tea.flavor.vivek,
    james: tea.flavor.james,
    members: tea.flavor.members,
    you: hasMember ? memberRating.profile : null,
  };

  // tabs the user can pick (always 3 + maybe "you")
  const tabOrder = ["vivek", "james", "members"];
  if (hasMember) tabOrder.push("you");
  // if the active tab somehow doesn't exist at all (e.g. "you" before rating), fall back
  const safeTab = tabOrder.includes(activeTab) ? activeTab : "members";
  // review may legitimately be null — empty-state CTA handles that case
  const review = reviewMap[safeTab];
  // profile is populated for vivek/james/members regardless of review status; only "you" can be null
  const profile = profileMap[safeTab];

  // composite uses what we have
  const compProfile = composite(tea);

  // Similar teas — overlap on composite
  const similar = tuM(() => {
    const target = compProfile;
    return TT.filter(t => t.slug !== tea.slug)
      .map(t => {
        const tProf = composite(t);
        let overlap = 0, denom = 0;
        for (const ax of TFA) {
          overlap += Math.min(target[ax.key], tProf[ax.key]);
          denom += Math.max(target[ax.key], tProf[ax.key]);
        }
        return { t, score: denom ? overlap / denom : 0 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [tea]);

  const rawProfilesForRadar = showComposite
    ? [
        { values: tea.flavor.vivek, color: TCB.vivek.color, label: "Vivek" },
        { values: tea.flavor.james, color: TCB.james.color, label: "James" },
        { values: tea.flavor.members, color: "var(--gold-dark)", label: "Members" },
        ...(hasMember ? [{ values: memberRating.profile, color: "var(--forest)", label: "You" }] : []),
      ]
    : [{ values: profile, color: safeTab === "you" ? "var(--forest)" : (TCB[safeTab]?.color || "var(--gold-dark)") }];
  const profilesForRadar = rawProfilesForRadar.map(p => ({ ...p, values: toRadarValues(p.values) }));

  const handleSaveRating = (entry) => {
    setShowRateModal(false);
    setMember(m => {
      const others = (m.ratings || []).filter(r => r.slug !== tea.slug);
      return { ...m, ratings: [...others, { slug: tea.slug, name: tea.name, ...entry }] };
    });
    setActiveTab("you");
  };

  return (
    <main>
      <TCT>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--warm-600)", fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer", margin: "24px 0 8px", display: "inline-flex", alignItems: "center", gap: 6 }}>← Back to teas</button>

        {/* HERO — 3 variants */}
        {heroVariant === "split" && <HeroSplit tea={tea} onVendor={onVendor} hideReviews={hideReviews || blindMode} />}
        {heroVariant === "stain" && <HeroStain tea={tea} onVendor={onVendor} hideReviews={hideReviews || blindMode} />}
        {heroVariant === "editorial" && <HeroEditorial tea={tea} onVendor={onVendor} hideReviews={hideReviews || blindMode} />}

        {/* BLIND TASTING NOTICE — Discover-launched blind flow */}
        {blindMode && (
          <div style={{ margin: "32px 0", padding: "20px 24px", background: "var(--burgundy)", color: "var(--cream)", borderRadius: "var(--r-xl)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, opacity: 0.7, marginBottom: 4 }}>Blind tasting in progress</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontStyle: "italic" }}>Reviews and ratings are hidden until you log yours.</div>
            </div>
            <TB variant="gold" onClick={() => onMember && onMember()}>Rate this tea →</TB>
          </div>
        )}

        {/* MEMBER BLIND MODE — soft banner with un-blind option */}
        {memberBlind && (
          <div style={{
            margin: "32px 0",
            padding: "24px 28px",
            background: "var(--bg-elevated)",
            border: "1px dashed var(--warm-300)",
            borderRadius: "var(--r-xl)",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: "var(--warm-500)", marginBottom: 6 }}>Blind mode · your setting</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--burgundy)", fontStyle: "italic", lineHeight: 1.2 }}>Reviews and ratings are hidden until you've tasted this one.</div>
              <p style={{ fontSize: 13, color: "var(--warm-700)", lineHeight: 1.55, margin: "8px 0 0", maxWidth: 540 }}>
                Origin, brewing, and the radar (when you turn it on) stay visible. If you've already had this tea, reveal the reviews — we'll remember and skip the hide for you next time.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <TB variant="secondary" onClick={() => setShowRateModal(true)}>Rate it first</TB>
              <TB variant="primary" onClick={() => onUnblind && onUnblind()}>I've tasted this →</TB>
            </div>
          </div>
        )}

        {/* THE BIG REVIEW SECTION — tabs */}
        {!blindMode && !memberBlind && (
          <section style={{ marginTop: 56 }}>
            <TSH eyebrow="Reviews" title={hasMember ? "Four palates, one tea" : "Three palates, one tea"} />

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 28, padding: 4, background: "var(--cream)", borderRadius: "var(--r-pill)", width: "fit-content", border: "1px solid var(--warm-200)", flexWrap: "wrap" }}>
              {[
                { key: "vivek", label: "Vivek's Review" },
                { key: "james", label: "James's Review" },
                { key: "members", label: "Member Reviews" },
                ...(hasMember ? [{ key: "you", label: "Your Review" }] : []),
              ].map(t => {
                const has = !!reviewMap[t.key];
                const active = safeTab === t.key;
                const c = TCB[t.key];
                return (
                  <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                    padding: "10px 20px", borderRadius: "var(--r-pill)",
                    border: "none",
                    background: active ? (t.key === "you" ? "var(--forest)" : (c?.color || "var(--burgundy)")) : "transparent",
                    color: active ? "var(--cream)" : (has ? "var(--forest)" : "var(--warm-500)"),
                    fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 8,
                    opacity: has ? 1 : 0.7, fontStyle: has ? "normal" : "italic",
                    transition: "all var(--dur) var(--ease-smooth)",
                  }}>
                    {t.key !== "members" ? <TAC who={t.key} size={20} /> : <span style={{ fontSize: 14 }}>👥</span>}
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 32, alignItems: "flex-start" }}>
              {/* Radar + mouthfeel */}
              <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 28, boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
                  <TE>Flavor profile · {isBasic ? "6 axes (basic)" : "12 axes (advanced)"}</TE>
                  <FlavorModeToggle mode={flavorMode} onChange={setFlavorMode} />
                </div>
                {showComposite && (
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--warm-600)", flexWrap: "wrap", marginBottom: 4 }}>
                    {tea.reviews.vivek && <LD color={TCB.vivek.color} label="Vivek" />}
                    {tea.reviews.james && <LD color={TCB.james.color} label="James" />}
                    <LD color="var(--gold-dark)" label="Members" />
                    {hasMember && <LD color="var(--forest)" label="You" />}
                  </div>
                )}
                <TRC profiles={profilesForRadar} axes={radarAxes} style={radarStyle} size={400} />
                {isBasic && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "var(--warm-600)", lineHeight: 1.5, fontStyle: "italic", textAlign: "center" }}>
                    Six lay-term axes — each combines two of the twelve advanced flavors.
                  </div>
                )}

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--warm-200)" }}>
                  <TE>Mouthfeel</TE>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginTop: 12, alignItems: "center" }}>
                    <TMG point={tea.mouthfeel} size={220} />
                    <div>
                      <div style={{ fontSize: 11, color: "var(--warm-500)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Finish</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {tea.finish.map(f => (
                          <span key={f} style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--forest)", fontStyle: "italic" }}>· {f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review notes */}
              <div>
                {!review ? (
                  <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 32, boxShadow: "var(--shadow-card)", border: "1px dashed var(--warm-300)", textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 14px", background: TCB[safeTab]?.color || "var(--warm-300)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cream)", fontFamily: "var(--font-display)", fontSize: 24, fontStyle: "italic", opacity: 0.6 }}>?</div>
                    <Eyebrow>Not yet reviewed</Eyebrow>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 8px", fontStyle: "italic", lineHeight: 1.15 }}>{TCB[safeTab]?.name} hasn't tried this one yet.</h4>
                    <p style={{ fontSize: 14, color: "var(--warm-700)", lineHeight: 1.55, maxWidth: 360, margin: "0 auto 20px" }}>Want a second opinion? Send a request — if you have the tea, we'll cover return shipping; otherwise drop a purchase link.</p>
                    <TB variant="primary" onClick={() => onRequestReview && onRequestReview(tea, safeTab)}>Request a review →</TB>
                  </div>
                ) : (
                <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 28, boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                      {safeTab === "members"
                        ? <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gold)", color: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>👥</div>
                        : safeTab === "you"
                          ? <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--forest)", color: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 22, fontStyle: "italic", flexShrink: 0 }}>You</div>
                          : <TAC who={safeTab} size={48} />}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: safeTab === "you" ? "var(--forest)" : "var(--burgundy)", fontWeight: 500, fontStyle: "italic", lineHeight: 1.2 }}>
                          {safeTab === "members" ? "Member consensus" : safeTab === "you" ? "Your notes" : `${TCB[safeTab].name}'s notes`}
                        </div>
                        <Eyebrow color="var(--warm-500)">{review.date}</Eyebrow>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {(() => {
                        const userBasic = safeTab === "you" && memberRating?.scale === "basic";
                        return <TRS value={userBasic ? review.rating / 2 : review.rating} max={userBasic ? 5 : 10} big />;
                      })()}
                    </div>
                  </div>

                  <p style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--forest)", lineHeight: 1.65, fontStyle: "italic", marginBottom: 20, paddingLeft: 16, borderLeft: `2px solid ${safeTab === "you" ? "var(--forest)" : "var(--gold)"}` }}>"{review.body}"</p>

                  {review.session && (
                    <div style={{ background: "var(--cream)", padding: "12px 16px", borderRadius: "var(--r-md)", marginBottom: 16, fontSize: 12, color: "var(--warm-700)", fontFamily: "ui-monospace,monospace" }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--warm-500)", marginBottom: 4, fontFamily: "var(--font-sans)", fontWeight: 700 }}>Brewed</div>
                      {review.session}
                    </div>
                  )}

                  {profile && (() => {
                    const displayProfile = toRadarValues(profile);
                    const tops = topFlavors(displayProfile, radarAxes);
                    return tops.length > 0 ? (
                      <div style={{ marginBottom: 16 }}>
                        <Eyebrow color="var(--warm-500)">Top notes (this palate)</Eyebrow>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                          {tops.map(ax => (
                            <TFB key={ax.key} axis={ax} intensity={displayProfile[ax.key]} />
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {safeTab === "members" && review.count && (
                    <div style={{ paddingTop: 16, borderTop: "1px solid var(--warm-200)", display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--warm-700)" }}>
                      <span>Based on {review.count} member ratings</span>
                      <a style={{ color: "var(--burgundy)", fontWeight: 700, cursor: "pointer" }}>See all →</a>
                    </div>
                  )}

                  {safeTab === "you" && (
                    <div style={{ paddingTop: 16, borderTop: "1px solid var(--warm-200)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "var(--warm-700)" }}>
                      <span>Saved to your profile · refines recommendations</span>
                      <button onClick={() => setShowRateModal(true)} style={{ background: "transparent", border: "none", color: "var(--burgundy)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Edit →</button>
                    </div>
                  )}
                </div>
                )}

                {/* Add your rating */}
                {!hasMember && (
                  <div style={{ background: "var(--cream)", borderRadius: "var(--r-xl)", padding: 24, marginTop: 20, border: "1px dashed var(--warm-300)" }}>
                    <Eyebrow>Add your rating</Eyebrow>
                    <p style={{ fontSize: 13, color: "var(--warm-700)", margin: "8px 0 14px" }}>Rate this tea to refine your flavor profile and improve recommendations.</p>
                    <TB variant="primary" onClick={() => setShowRateModal(true)}>Rate this tea →</TB>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ORIGIN & BREWING (Always visible) */}
        <section style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 28, boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)" }}>
            <Eyebrow>Origin & terroir</Eyebrow>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 18px" }}>The journey</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <Detail k="Country" v={tea.country} />
              <Detail k="Region" v={tea.region.split(",")[0]} />
              <Detail k="Elevation" v={`${tea.elev}m`} />
              <Detail k="Harvest" v={tea.harvest} />
              <Detail k="Year" v={tea.year} />
              <Detail k="Age" v={tea.age} />
              <Detail k="Type" v={tea.type} />
              <Detail k="Rarity" v={"●".repeat(tea.rarity) + "○".repeat(5 - tea.rarity)} />
            </div>
          </div>

          <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", padding: 28, boxShadow: "var(--shadow-card)", border: "1px solid rgba(212,196,160,0.3)" }}>
            <Eyebrow>Recommended brewing</Eyebrow>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 18px" }}>How we made it</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
              <BrewingStat k="Style" v={tea.brewing.style} icon="🫖" />
              <BrewingStat k="Ratio" v={tea.brewing.ratio} icon="⚖️" />
              <BrewingStat k="Temp" v={tea.brewing.temp} icon="🌡️" />
              <BrewingStat k="First steep" v={tea.brewing.first} icon="⏱️" />
            </div>
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--warm-200)" }}>
              <div style={{ fontSize: 13, color: "var(--warm-700)", lineHeight: 1.55 }}>
                <strong style={{ color: "var(--forest)" }}>{tea.sessions} sessions logged.</strong> Peak steeps: {tea.peakSteeps.map(n => `#${n}`).join(", ")}. Add 5s per steep after the first; raise temp by 1°C every two rounds.
              </div>
            </div>
          </div>
        </section>

        {/* VENDOR + CTA */}
        <section style={{ marginTop: 32, padding: 32, background: "var(--burgundy)", color: "var(--cream)", borderRadius: "var(--r-xl)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <div>
            <Eyebrow color="rgba(250,247,242,0.7)">Sold by</Eyebrow>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--cream)", fontWeight: 500, margin: "6px 0 6px", fontStyle: "italic" }}>{tea.vendor}</h3>
            <p style={{ fontSize: 14, color: "rgba(250,247,242,0.85)", margin: 0 }}>${tea.price.toFixed(2)}/g · ${(tea.price * 5).toFixed(2)} per 5g session</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <TB variant="gold" size="lg" onClick={onVendor}>Visit {tea.vendor} ↗</TB>
            <TB style={{ background: "transparent", border: "1.5px solid var(--cream)", color: "var(--cream)" }} size="lg">Log a session</TB>
          </div>
        </section>

        {/* SIMILAR TEAS */}
        <section style={{ marginTop: 56 }}>
          <TSH eyebrow="More like this" title="Teas with overlapping profiles" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {similar.map(({ t, score }) => (
              <div key={t.slug} style={{ position: "relative" }}>
                <TTC tea={t} hideReviews={blindMode} onClick={() => onSelect(t)} />
                <span style={{ position: "absolute", top: -8, right: 12, background: "var(--gold)", color: "var(--forest)", padding: "3px 10px", borderRadius: "var(--r-pill)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", boxShadow: "var(--shadow-card)" }}>{Math.round(score * 100)}% match</span>
              </div>
            ))}
          </div>
        </section>
      </TCT>
      {showRateModal && window.ReviewModal && (
        <window.ReviewModal
          tea={tea}
          initial={hasMember ? memberRating : null}
          defaultFlavorMode={flavorMode}
          onClose={() => setShowRateModal(false)}
          onSubmit={handleSaveRating}
        />
      )}
    </main>
  );
}

// ---------- Hero variants ----------
function HeroSplit({ tea, onVendor, hideReviews }) {
  const avg = window.AppData.teaAvg(tea);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, marginTop: 16 }}>
      <div style={{ aspectRatio: "1/1", borderRadius: "var(--r-2xl)", background: tea.gradient, boxShadow: "var(--shadow-elevated)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between" }}>
          <TTT type={tea.type} />
          <span style={{ padding: "5px 12px", borderRadius: "var(--r-pill)", background: "rgba(250,247,242,0.92)", color: "var(--burgundy)", fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>★ Featured</span>
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, color: "var(--cream)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontStyle: "italic", letterSpacing: "-0.01em" }}>{tea.chinese}</div>
        </div>
      </div>
      <div>
        <Eyebrow>{tea.region} · {tea.year}</Eyebrow>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--burgundy)", fontWeight: 500, margin: "8px 0 12px", letterSpacing: "-0.02em", lineHeight: 1.02 }}>{tea.name}</h1>
        {!hideReviews && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <TRS value={avg} big />
            <div style={{ fontSize: 13, color: "var(--warm-600)" }}>
              <div>From <strong style={{ color: "var(--forest)" }}>{tea.vendor}</strong></div>
              <div>{tea.sessions} sessions · {tea.elev}m elevation</div>
            </div>
          </div>
        )}
        <p style={{ fontSize: 17, color: "var(--warm-700)", lineHeight: 1.65, marginBottom: 20 }}>{tea.summary}</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <TB variant="primary">Log a session</TB>
          <TB variant="secondary" onClick={onVendor}>Buy from {tea.vendor} ↗</TB>
        </div>
      </div>
    </div>
  );
}

function HeroStain({ tea, onVendor, hideReviews }) {
  const avg = window.AppData.teaAvg(tea);
  return (
    <div style={{ position: "relative", padding: "48px 0 40px", overflow: "visible" }}>
      <TST size={520} color={tea.swatch} opacity={0.18} style={{ position: "absolute", top: -40, right: -80, pointerEvents: "none" }} />
      <TST size={280} color="#C4A35A" opacity={0.12} style={{ position: "absolute", bottom: -60, left: -100, pointerEvents: "none" }} />
      <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <Eyebrow>{tea.region} · {tea.year}</Eyebrow>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 44, color: "var(--burgundy)", fontStyle: "italic", marginTop: 12, opacity: 0.55, letterSpacing: "-0.01em" }}>{tea.chinese}</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 88, color: "var(--burgundy)", fontWeight: 500, margin: "4px 0 18px", letterSpacing: "-0.03em", lineHeight: 1 }}>{tea.name}</h1>
        {!hideReviews && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "10px 22px", borderRadius: "var(--r-pill)", background: "var(--bg-elevated)", border: "1px solid var(--warm-200)", boxShadow: "var(--shadow-card)", marginBottom: 24 }}>
            <TRS value={avg} />
            <span style={{ height: 18, width: 1, background: "var(--warm-300)" }} />
            <span style={{ fontSize: 13, color: "var(--warm-700)" }}>From <strong style={{ color: "var(--forest)" }}>{tea.vendor}</strong></span>
            <span style={{ height: 18, width: 1, background: "var(--warm-300)" }} />
            <TTT type={tea.type} />
          </div>
        )}
        <p style={{ fontSize: 19, fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--warm-700)", lineHeight: 1.65, maxWidth: 600, margin: "0 auto 28px", textWrap: "balance" }}>"{tea.summary}"</p>
        <div style={{ display: "inline-flex", gap: 10 }}>
          <TB variant="primary" size="lg">Log a session</TB>
          <TB variant="secondary" size="lg" onClick={onVendor}>Buy from {tea.vendor} ↗</TB>
        </div>
        <div style={{ aspectRatio: "16/8", marginTop: 40, borderRadius: "var(--r-2xl)", background: tea.gradient, boxShadow: "var(--shadow-elevated)" }} />
      </div>
    </div>
  );
}

function HeroEditorial({ tea, onVendor, hideReviews }) {
  const avg = window.AppData.teaAvg(tea);
  return (
    <div style={{ marginTop: 16 }}>
      {/* Top eyebrow strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", background: "var(--bg-elevated)", border: "1px solid var(--warm-200)", borderRadius: "var(--r-md)", marginBottom: 20, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: "var(--warm-600)" }}>
        <span style={{ color: "var(--burgundy)" }}>Tea №{String(TT.findIndex(t => t.slug === tea.slug) + 1).padStart(3, "0")}</span>
        <span>·</span>
        <span>{tea.country}</span>
        <span>·</span>
        <span>{tea.year}</span>
        <span style={{ marginLeft: "auto" }}>{tea.harvest}</span>
      </div>

      {/* Big editorial title */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "flex-end", gap: 32, paddingBottom: 24, borderBottom: "2px solid var(--burgundy)" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--gold-dark)", fontStyle: "italic", letterSpacing: "-0.01em" }}>{tea.chinese}</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 96, color: "var(--burgundy)", fontWeight: 500, margin: "0", letterSpacing: "-0.03em", lineHeight: 0.95 }}>{tea.name}</h1>
          <div style={{ marginTop: 14, fontFamily: "var(--font-display)", fontSize: 22, color: "var(--warm-600)", fontStyle: "italic", letterSpacing: "-0.01em" }}>{tea.region}, brewed {tea.brewing.style.toLowerCase()} at {tea.brewing.temp}.</div>
        </div>
        {!hideReviews && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--warm-500)", fontWeight: 700, marginBottom: 6 }}>Composite</div>
            <TRS value={avg} big />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, marginTop: 32 }}>
        <div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--forest)", lineHeight: 1.55, marginBottom: 20, textWrap: "balance" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 56, float: "left", lineHeight: 0.85, color: "var(--burgundy)", marginRight: 8, marginTop: 4, fontWeight: 500 }}>{tea.summary[0]}</span>
            {tea.summary.slice(1)}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <TB variant="primary">Log a session</TB>
            <TB variant="secondary" onClick={onVendor}>Buy from {tea.vendor} ↗</TB>
          </div>
        </div>
        <div style={{ aspectRatio: "3/4", borderRadius: "var(--r-xl)", background: tea.gradient, boxShadow: "var(--shadow-elevated)" }} />
      </div>
    </div>
  );
}

function Detail({ k, v }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--warm-500)", fontWeight: 700 }}>{k}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--burgundy)", fontWeight: 500, marginTop: 4 }}>{v}</div>
    </div>
  );
}

function BrewingStat({ k, v, icon }) {
  return (
    <div style={{ background: "var(--cream)", padding: "14px 16px", borderRadius: "var(--r-md)" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--warm-500)", fontWeight: 700 }}>{k}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--burgundy)", fontWeight: 500, marginTop: 4 }}>{v}</div>
    </div>
  );
}

function LD({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--warm-700)", fontWeight: 600 }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
      {label}
    </span>
  );
}

function FlavorModeToggle({ mode, onChange }) {
  const opts = [
    { key: "basic",    label: "Basic",    sub: "6 axes" },
    { key: "advanced", label: "Advanced", sub: "12 axes" },
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
              padding: "5px 12px",
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

window.TeaDetail = TeaDetail;
