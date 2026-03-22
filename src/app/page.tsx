"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./landing.css";

/* ── FAQ data ── */
const FAQ_ITEMS = [
  {
    q: "Where does the ad data come from?",
    a: "Genie OS is powered by the Foreplay API, which indexes over 100 million ads across Facebook, Instagram, TikTok, YouTube, LinkedIn, and Google. Data is refreshed continuously so you always see current, live campaigns.",
  },
  {
    q: 'How does the "Proven Winner" badge work?',
    a: "Badges are fully data-driven based on how long an ad has been running. Brands don't waste money on ads that don't convert, so longevity is the best proxy for performance. Proven Winner = 30+ days, Strong Signal = 14–30 days, Early Traction = 7–14 days.",
  },
  {
    q: "Can I track specific competitors?",
    a: "Yes — search any brand in the Knowledge Base, add them as a competitor, and their full ad feed appears on your dashboard sorted by longevity. Track unlimited brands, filter by platform, niche, or minimum running days.",
  },
  {
    q: "How does the AI generation work?",
    a: "Set up your brand context once — voice, audience, USPs, colours — in the Knowledge Base. When you generate from a winning ad, the AI uses both the reference ad's strategy and your brand context to produce on-brand copy, angles, and hooks ready to brief your creative team.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — you can sign up and start discovering ads, track up to 2 competitors, and run a limited number of AI analyses completely free. No credit card required.",
  },
];

/* ── Logo SVG icon ── */
function LogoIcon({
  size = 34,
  radius = 10,
}: {
  size?: number;
  radius?: number;
}) {
  return (
    <div
      className="logo-mark"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2.3"
        strokeLinecap="round"
        style={{ width: size * 0.55, height: size * 0.55 }}
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

/* ── Star rating ── */
function Stars() {
  return (
    <div className="proof-stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="star">
          ★
        </span>
      ))}
    </div>
  );
}

/* ── Feature list item ── */
function FeatureItem({
  bg,
  icon,
  title,
  desc,
}: {
  bg: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="feature-item">
      <div className="fi-icon" style={{ background: bg }}>
        {icon}
      </div>
      <div className="fi-text">
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.style.boxShadow =
          window.scrollY > 16 ? "0 4px 24px rgba(0,0,0,0.07)" : "none";
      }
    };
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 },
    );
    document
      .querySelectorAll(".feature-row, .workflow-card, .proof-card, .stat-box")
      .forEach((el) => {
        const h = el as HTMLElement;
        h.style.opacity = "0";
        h.style.transform = "translateY(24px)";
        h.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        observer.observe(h);
      });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const goToDashboard = () => router.push("/knowledge-base");
  const toggleFaq = (i: number) =>
    setOpenFaq((prev) => (prev === i ? null : i));

  return (
    <div className="lp-root">
      {/* NAV */}
      <nav ref={navRef} id="main-nav">
        <div className="nav-logo">
          <LogoIcon />
          Genie OS
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">How it works</a>
          <a href="#testimonials">Reviews</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-cta">
          {/* <span className="nav-login" onClick={goToDashboard}>Log in</span> */}
          <button className="btn-primary btn-sm" onClick={goToDashboard}>
            Try It Free ✨
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="container">
          <div className="hero-badge">
            <span className="eyebrow purple">
              ✦ The Complete Ad Intelligence Platform
            </span>
          </div>
          <h1>
            The complete
            <br />
            <span className="grad">
              <span className="serif">winning ad</span>
            </span>
            <br />
            workflow.
          </h1>
          <p className="hero-sub">
            Save ads from anywhere. Track every competitor move. Analyze what
            makes them win — then generate better versions with AI.
            <br />All in one place.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={goToDashboard}>
              Start for free ✨
            </button>
          </div>
          <div className="hero-trust">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            No credit card · Free to start · 100M+ ads indexed
          </div>

          {/* Hero screen mockup */}
          <div className="hero-visual">
            <div className="float-card card-1">
              <div
                className="fc-icon"
                style={{ background: "#EDE9FB", fontSize: 20 }}
              >
                🔬
              </div>
              <div>
                <div className="fc-num">1,847</div>
                <div className="fc-sub">Ads analyzed</div>
              </div>
            </div>
            <div className="float-card card-2">
              <div
                className="fc-icon"
                style={{ background: "#FDE8F3", fontSize: 20 }}
              >
                ⚡
              </div>
              <div>
                <div className="fc-title">Hook score: 9.2</div>
                <div className="fc-sub">Top performing ad</div>
              </div>
            </div>
            <div className="float-card card-3">
              <div
                className="fc-icon"
                style={{ background: "#D1FAE5", fontSize: 20 }}
              >
                ✨
              </div>
              <div>
                <div className="fc-title">312 variations</div>
                <div className="fc-sub">generated this month</div>
              </div>
            </div>

            <div className="hero-screen">
              <div className="screen-bar">
                <div className="dot dot-r" />
                <div className="dot dot-y" />
                <div className="dot dot-g" />
                <div className="screen-url">app.genieos.co/analytics</div>
              </div>
              <div className="screen-body">
                {/* Sidebar */}
                <div className="mock-sb">
                  <div className="msb-logo">
                    <div className="msb-icon" />
                    <span className="msb-brand">Genie OS</span>
                  </div>
                  <div className="msb-section-label">WORKSPACE</div>
                  <div className="msb-nav">
                    <div className="msb-dot" />
                    Branding
                  </div>
                  <div className="msb-nav">
                    <div className="msb-dot" />
                    Discover
                    <span className="msb-badge">100M+</span>
                  </div>
                  <div className="msb-nav">
                    <div className="msb-dot" />
                    Analyze
                  </div>
                  <div className="msb-nav">
                    <div className="msb-dot" />
                    Generate
                    <span className="msb-badge">AI</span>
                  </div>
                  <div className="msb-section-label">INTELLIGENCE</div>
                  <div className="msb-nav active">
                    <div className="msb-dot" />
                    Analytics
                  </div>
                  <div className="msb-nav">
                    <div className="msb-dot" />
                    Openclaw
                  </div>
                </div>
                {/* Main */}
                <div className="mock-main">
                  <div className="mock-topbar">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          background: "#F3F0FF",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#0F0D14",
                        }}
                      >
                        Analytics
                      </span>
                      <span style={{ fontSize: 9, color: "#9B97AA" }}>
                        Performance &amp; trends
                      </span>
                    </div>
                    <div
                      style={{ marginLeft: "auto", display: "flex", gap: 5 }}
                    >
                      {[
                        {
                          n: "3",
                          l: "competitors",
                          bg: "#fff",
                          bc: "#E8E5DF",
                          nc: "#0F0D14",
                          dc: "#9B97AA",
                          db: "#9B97AA",
                        },
                        {
                          n: "24",
                          l: "analysed",
                          bg: "#fff",
                          bc: "#E8E5DF",
                          nc: "#0F0D14",
                          dc: "#9B97AA",
                          db: "#9B97AA",
                        },
                        {
                          n: "12",
                          l: "variations",
                          bg: "#EDE9FB",
                          bc: "rgba(124,58,237,0.2)",
                          nc: "#7C3AED",
                          dc: "#7C3AED",
                          db: "#7C3AED",
                        },
                      ].map(({ n, l, bg, bc, nc, dc, db }) => (
                        <div
                          key={l}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            background: bg,
                            border: `1px solid ${bc}`,
                            borderRadius: 7,
                            padding: "3px 8px",
                          }}
                        >
                          <div
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: db,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{ fontSize: 9, fontWeight: 700, color: nc }}
                          >
                            {n}
                          </span>
                          <span style={{ fontSize: 8, color: dc }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="mock-content"
                    style={{ padding: "12px 14px" }}
                  >
                    {/* KPI cards */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      {[
                        {
                          label: "Competitors Tracked",
                          val: "24",
                          vc: "#0F0D14",
                          trend: "+4 this week",
                        },
                        {
                          label: "Ads Analyzed",
                          val: "1,847",
                          vc: "#0F0D14",
                          trend: "+312 today",
                        },
                        {
                          label: "Ads Generated",
                          val: "312",
                          vc: "#7C3AED",
                          trend: "+18 this week",
                        },
                        {
                          label: "Generation Cost",
                          val: "$482",
                          vc: "#0F0D14",
                          sub: "$1.54 per ad avg",
                        },
                      ].map((k) => (
                        <div
                          key={k.label}
                          style={{
                            background: "#fff",
                            border: "1px solid #E8E5DF",
                            borderRadius: 10,
                            padding: "10px 12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 8,
                              color: "#9B97AA",
                              marginBottom: 4,
                            }}
                          >
                            {k.label}
                          </div>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              color: k.vc,
                              lineHeight: 1,
                            }}
                          >
                            {k.val}
                          </div>
                          {k.trend && (
                            <div
                              style={{
                                fontSize: 7,
                                color: "#10B981",
                                marginTop: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <svg
                                width="7"
                                height="7"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                              </svg>
                              {k.trend}
                            </div>
                          )}
                          {k.sub && (
                            <div
                              style={{
                                fontSize: 7,
                                color: "#9B97AA",
                                marginTop: 3,
                              }}
                            >
                              {k.sub}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Chart + top ads */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 168px",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          background: "#fff",
                          border: "1px solid #E8E5DF",
                          borderRadius: 10,
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#0F0D14",
                            marginBottom: 8,
                          }}
                        >
                          Generation Performance
                        </div>
                        <svg
                          width="100%"
                          height="90"
                          viewBox="0 0 300 90"
                          preserveAspectRatio="none"
                          style={{ display: "block" }}
                        >
                          <defs>
                            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="0%"
                                stopColor="#7C3AED"
                                stopOpacity="0.25"
                              />
                              <stop
                                offset="100%"
                                stopColor="#7C3AED"
                                stopOpacity="0.02"
                              />
                            </linearGradient>
                          </defs>
                          <line
                            x1="0"
                            y1="22"
                            x2="300"
                            y2="22"
                            stroke="#F0EDE8"
                            strokeWidth="1"
                          />
                          <line
                            x1="0"
                            y1="44"
                            x2="300"
                            y2="44"
                            stroke="#F0EDE8"
                            strokeWidth="1"
                          />
                          <line
                            x1="0"
                            y1="66"
                            x2="300"
                            y2="66"
                            stroke="#F0EDE8"
                            strokeWidth="1"
                          />
                          <path
                            d="M0,72 C20,68 40,55 60,50 C80,45 100,58 120,48 C140,38 160,25 180,20 C200,15 220,28 240,22 C260,16 280,18 300,12 L300,90 L0,90 Z"
                            fill="url(#ag)"
                          />
                          <path
                            d="M0,72 C20,68 40,55 60,50 C80,45 100,58 120,48 C140,38 160,25 180,20 C200,15 220,28 240,22 C260,16 280,18 300,12"
                            fill="none"
                            stroke="#7C3AED"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <circle cx="300" cy="12" r="3" fill="#7C3AED" />
                        </svg>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 4,
                          }}
                        >
                          {["Jan", "Mar", "May", "Jul", "Sep", "Now"].map(
                            (m) => (
                              <span
                                key={m}
                                style={{ fontSize: 7, color: "#9B97AA" }}
                              >
                                {m}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          background: "#fff",
                          border: "1px solid #E8E5DF",
                          borderRadius: 10,
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#0F0D14",
                            marginBottom: 8,
                          }}
                        >
                          Top Analyzed Ads
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {[
                            {
                              img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=60&q=70&auto=format&fit=crop",
                              bg: "#EDE9FB",
                              score: "9.2",
                              sc: "#10B981",
                            },
                            {
                              img: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=60&q=70&auto=format&fit=crop",
                              bg: "#FDE8F3",
                              score: "8.7",
                              sc: "#F59E0B",
                            },
                            {
                              img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&q=70&auto=format&fit=crop",
                              bg: "#D1FAE5",
                              score: "8.1",
                              sc: "#10B981",
                            },
                            {
                              img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=60&q=70&auto=format&fit=crop",
                              bg: "#E0F2FE",
                              score: "7.9",
                              sc: "#0EA5E9",
                            },
                          ].map((ad, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  background: ad.bg,
                                  flexShrink: 0,
                                  overflow: "hidden",
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={ad.img}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  alt=""
                                />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    height: 5,
                                    borderRadius: 3,
                                    background: "#E8E5DF",
                                    width: "90%",
                                    marginBottom: 3,
                                  }}
                                />
                                <div
                                  style={{
                                    height: 5,
                                    borderRadius: 3,
                                    background: "#E8E5DF",
                                    width: "60%",
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  fontSize: 8,
                                  fontWeight: 700,
                                  color: ad.sc,
                                }}
                              >
                                {ad.score}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO STRIP */}
      {/* <section className="logos-strip">
        <div className="container">
          <p className="logos-label">Works with ads running on</p>
          <div className="logos-row">
            {[
              { name: "Facebook", bg: "#1877F2" },
              { name: "Instagram", bg: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)" },
              { name: "TikTok", bg: "#FF0050" },
              { name: "YouTube", bg: "#FF0000" },
              { name: "Google", bg: "#4285F4" },
              { name: "LinkedIn", bg: "#0A66C2" },
            ].map(({ name, bg }) => (
              <div key={name} className="logo-pill">
                <div className="lp-dot" style={{ background: bg, borderRadius: 6 }} />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* STATS */}
      <section className="section tinted">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="eyebrow purple">By the numbers</span>
            <h2 className="section-h" style={{ marginTop: 12 }}>
              The numbers
              <br />
              <span className="serif">don&apos;t lie.</span>
            </h2>
          </div>
          <div className="stats-row">
            {[
              {
                num: "100M+",
                label: "Ads indexed across 6 platforms, refreshed daily",
              },
              {
                num: "5 min",
                label:
                  "Average time from discovery to a fully briefed creative",
              },
              {
                num: "3×",
                label:
                  "Faster creative iteration for growth teams using Genie OS",
              },
              {
                num: "30+",
                label: "Competitors you can track simultaneously, in real time",
              },
            ].map(({ num, label }) => (
              <div key={num} className="stat-box">
                <div className="stat-num">{num}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE 1: DISCOVER */}
      <section className="section" id="features">
        <div className="container">
          <div className="feature-row">
            <div className="feature-copy">
              <div className="section-label">
                <span className="eyebrow purple">🔍 Discover</span>
              </div>
              <h2 className="section-h">
                Save ads from
                <br />
                <span className="grad">
                  <span className="serif">anywhere, to everywhere.</span>
                </span>
              </h2>
              <p className="section-p">
                Search the world&apos;s largest ad library. Filter by niche,
                platform, and running duration to pinpoint ads that are actually
                making money right now.
              </p>
              <div className="feature-list">
                <FeatureItem
                  bg="#EDE9FB"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="2.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  }
                  title="100M+ ads indexed in real time"
                  desc="Across Facebook, Instagram, TikTok, YouTube, LinkedIn & Google."
                />
                <FeatureItem
                  bg="#FDE8F3"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#EC4899"
                      strokeWidth="2.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  }
                  title="Filter by longevity — not just recency"
                  desc="Ads running 30, 60, 90+ days = ads that convert. Find them instantly."
                />
                <FeatureItem
                  bg="#D1FAE5"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  }
                  title="Recent searches always at your fingertips"
                  desc="Saved search history with one-click restore of all your filters."
                />
              </div>
            </div>
            <div className="photo-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80&auto=format&fit=crop"
                alt="Discover winning ads"
              />
              <div className="top-right photo-badge">
                <span className="pb-emoji">🏆</span>
                <div>
                  <div className="pb-num">2,847</div>
                  <div className="pb-label">Winning ads found</div>
                </div>
              </div>
              <div className="bottom-left photo-badge">
                <div>
                  <div
                    className="pb-num"
                    style={{ fontSize: 15, color: "#10B981" }}
                  >
                    45+ days running
                  </div>
                  <div className="pb-label">Proven performers only</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 2: TRACK */}
      <section className="section purple-tint">
        <div className="container">
          <div className="feature-row flip">
            <div className="feature-copy">
              <div className="section-label">
                <span className="eyebrow pink">👀 Track</span>
              </div>
              <h2 className="section-h">
                Automatically
                <br />
                track{" "}
                <span className="grad">
                  <span className="serif">competitors.</span>
                </span>
              </h2>
              <p className="section-p">
                Add any brand and instantly see every ad they&apos;re running,
                sorted by what&apos;s been live the longest. Know what&apos;s
                working before they scale it.
              </p>
              <div className="feature-list">
                <FeatureItem
                  bg="#EDE9FB"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="2.5"
                    >
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  }
                  title="Unlimited competitor tracking"
                  desc="Add any brand from the Foreplay database — get their full ad feed instantly."
                />
                <FeatureItem
                  bg="#FDE8F3"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#EC4899"
                      strokeWidth="2.5"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  }
                  title="Live feed sorted by longevity"
                  desc="The ads at the top are the ones running longest — highest signal of what's converting."
                />
                <FeatureItem
                  bg="#D1FAE5"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  }
                  title="Filter by platform, niche & format"
                  desc="Slice their feed to only show video on TikTok, or carousel on Facebook."
                />
              </div>
            </div>
            <div className="photo-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&auto=format&fit=crop"
                alt="Track competitors"
              />
              <div className="top-right photo-badge">
                <span className="pb-emoji">📊</span>
                <div>
                  <div className="pb-num">12 brands</div>
                  <div className="pb-label">tracked simultaneously</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 3: ANALYZE */}
      <section className="section">
        <div className="container">
          <div className="feature-row">
            <div className="feature-copy">
              <div className="section-label">
                <span className="eyebrow green">⚡ Analyze</span>
              </div>
              <h2 className="section-h">
                The smartest
                <br />
                <span className="grad-green">
                  <span className="serif">ad search engine</span>
                </span>
                <br />
                you&apos;ve ever used.
              </h2>
              <p className="section-p">
                Openclaw AI breaks down why ads win — hook strength, copy angle,
                offer clarity, emotional triggers — and scores them so you know
                exactly what to replicate.
              </p>
              <div className="feature-list">
                <FeatureItem
                  bg="#D1FAE5"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  }
                  title="Hook strength analysis"
                  desc="Know in seconds whether an ad's opening 3 seconds would stop the scroll."
                />
                <FeatureItem
                  bg="#EDE9FB"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="2.5"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  }
                  title="Full copy & offer breakdown"
                  desc="Every claim, CTA, and emotional trigger surfaced and explained."
                />
                <FeatureItem
                  bg="#FDE8F3"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#EC4899"
                      strokeWidth="2.5"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  }
                  title="Overall performance score"
                  desc="A single 0–10 score across hook, copy, offer clarity, and visual execution."
                />
              </div>
            </div>
            <div className="photo-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop"
                alt="AI analysis"
              />
              <div className="top-right photo-badge">
                <span className="pb-emoji">🧠</span>
                <div>
                  <div className="pb-num" style={{ color: "#10B981" }}>
                    9.2 / 10
                  </div>
                  <div className="pb-label">Hook strength score</div>
                </div>
              </div>
              <div className="bottom-left photo-badge">
                <div>
                  <div className="pb-num" style={{ fontSize: 14 }}>
                    AI-powered breakdown
                  </div>
                  <div className="pb-label">Copy · Offer · Emotion · CTA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 4: GENERATE */}
      <section className="section pink-tint">
        <div className="container">
          <div className="feature-row flip">
            <div className="feature-copy">
              <div className="section-label">
                <span className="eyebrow pink">✨ Generate</span>
              </div>
              <h2 className="section-h">
                Go from concept
                <br />
                to launched{" "}
                <span className="grad">
                  <span className="serif">faster.</span>
                </span>
              </h2>
              <p className="section-p">
                Take any winning ad, add your brand context, and let the AI
                generate multiple on-brand variations ready to brief your
                creative team. No blank page. Ever.
              </p>
              <div className="feature-list">
                <FeatureItem
                  bg="#FDE8F3"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#EC4899"
                      strokeWidth="2.5"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  }
                  title="Brand-aware generation"
                  desc="Set your voice, audience, and USPs once. Every variation is on-brand by default."
                />
                <FeatureItem
                  bg="#EDE9FB"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="2.5"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  }
                  title="Multiple angles at once"
                  desc="Generate 3–5 variations with different hooks, offers, and emotional angles."
                />
                <FeatureItem
                  bg="#D1FAE5"
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  }
                  title="Brief-ready output"
                  desc="Copy, angle, and hook — structured for your creative team to run with immediately."
                />
              </div>
            </div>
            <div className="photo-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&auto=format&fit=crop"
                alt="Generate ad variations"
              />
              <div className="top-right photo-badge">
                <span className="pb-emoji">✨</span>
                <div>
                  <div className="pb-num">5 variations</div>
                  <div className="pb-label">generated in 30 seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section tinted" id="workflow">
        <div className="container">
          <div className="center">
            <span className="eyebrow sky">How it works</span>
            <h2 className="section-h" style={{ marginTop: 12 }}>
              Three steps to your
              <br />
              <span className="serif">next winning ad.</span>
            </h2>
            <p className="section-p">
              From a competitor&apos;s running ad to your own ready-to-brief
              creative — in under 5 minutes.
            </p>
          </div>
          <div className="workflow-grid">
            {[
              {
                step: "Step 01",
                icon: "🔍",
                bg: "#EDE9FB",
                num: "01",
                title: "Find a winner",
                desc: "Search 100M+ ads or browse your competitor feed. Filter by longevity — if it's been running 30+ days, it's working.",
              },
              {
                step: "Step 02",
                icon: "🧠",
                bg: "#FDE8F3",
                num: "02",
                title: "Understand why it wins",
                desc: "Openclaw AI breaks it down — hook, copy angle, offer clarity, emotional trigger — with a full scored breakdown in seconds.",
              },
              {
                step: "Step 03",
                icon: "⚡",
                bg: "#D1FAE5",
                num: "03",
                title: "Generate your version",
                desc: "Feed in your brand context and generate on-brand variations ready to brief your creative team — no blank page, no guesswork.",
              },
            ].map(({ step, icon, bg, num, title, desc }) => (
              <div key={num} className="workflow-card">
                <div className="wc-step">{step}</div>
                <div className="wc-icon" style={{ background: bg }}>
                  {icon}
                </div>
                <div className="wc-num">{num}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM / COLLAB */}
      <section className="team-section">
        <div className="container">
          <div className="team-inner">
            <div>
              <span className="eyebrow purple">For the whole team</span>
              <h2 className="section-h" style={{ marginTop: 12 }}>
                Bringing performance &amp;
                <br />
                <span className="serif">creative teams</span>{" "}
                <span className="grad">together.</span>
              </h2>
              <p className="section-p" style={{ marginBottom: 28 }}>
                Genie OS sits at the intersection of performance data and
                creative intuition. Whether you&apos;re a media buyer, creative
                strategist, or brand manager — there&apos;s a workflow for you.
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[
                  {
                    color: "#7C3AED",
                    text: "Media buyers who want to see what's converting",
                  },
                  {
                    color: "#EC4899",
                    text: "Creative strategists who need better briefs faster",
                  },
                  {
                    color: "#10B981",
                    text: "Brand managers tracking the competitive landscape",
                  },
                ].map(({ color, text }) => (
                  <div
                    key={text}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: color,
                        flexShrink: 0,
                      }}
                    />
                    {text}
                  </div>
                ))}
              </div>
            </div>
            <div className="team-photos">
              <div className="team-photo tall">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80&auto=format&fit=crop"
                  alt="Marketer"
                />
                <div className="team-tag">Media Buyer 📊</div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div className="team-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=80&auto=format&fit=crop"
                    alt="Creative team"
                  />
                  <div className="team-tag">Creative Team 🎨</div>
                </div>
                <div className="team-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop"
                    alt="Brand manager"
                  />
                  <div className="team-tag">Brand Manager ✦</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section tinted" id="testimonials">
        <div className="container">
          <div className="center" style={{ marginBottom: 48 }}>
            <span className="eyebrow pink">Real results</span>
            <h2 className="section-h" style={{ marginTop: 12 }}>
              Loved by growth teams
              <br />
              <span className="serif">that move fast.</span> 🚀
            </h2>
          </div>
          <div className="proof-grid">
            {[
              {
                quote:
                  "We cut creative research from 3 hours to 15 minutes. Genie OS is literally the first tab we open every morning. The longevity filter alone is worth it.",
                name: "Sarah K.",
                role: "Head of Growth · DTC Beauty Brand",
                img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&auto=format&fit=crop&crop=face",
              },
              {
                quote:
                  "The AI breakdown is genuinely scary good. It told us exactly why a competitor's ad was outperforming ours — we fixed the hook, ROAS went up 40% in a week.",
                name: "Marcus T.",
                role: "Performance Lead · 8-Figure Shopify Brand",
                img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80&auto=format&fit=crop&crop=face",
              },
              {
                quote:
                  "Finally a tool that shows you what's actually working, not just what's running. My creative briefs used to take a day to write — now it's 20 minutes, tops.",
                name: "Jamie L.",
                role: "Creative Strategist · Fashion E-com",
                img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&auto=format&fit=crop&crop=face",
              },
            ].map(({ quote, name, role, img }) => (
              <div key={name} className="proof-card">
                <Stars />
                <p className="proof-quote">&ldquo;{quote}&rdquo;</p>
                <div className="proof-author">
                  <div className="proof-av">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={name} />
                  </div>
                  <div>
                    <div className="proof-name">{name}</div>
                    <div className="proof-role">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="container">
          <div className="center">
            <span className="eyebrow sky">FAQ</span>
            <h2 className="section-h" style={{ marginTop: 12 }}>
              Got questions?
              <br />
              <span className="serif">We&apos;ve got answers.</span> 👇
            </h2>
          </div>
          <div className="faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`faq-item${openFaq === i ? " open" : ""}`}
              >
                <div className="faq-q" onClick={() => toggleFaq(i)}>
                  <span>{item.q}</span>
                  <div className="faq-toggle">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </div>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-blob cta-blob-1" />
            <div className="cta-blob cta-blob-2" />
            <span
              className="eyebrow"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                marginBottom: 20,
                display: "inline-flex",
              }}
            >
              ✦ Free to start, no card needed
            </span>
            <h2>
              Ready to ship more
              <br />
              <span className="serif">winning ads?</span> ✨
            </h2>
            <p>
              Join performance teams using Genie OS to find, analyze, and
              replicate the ads that are already working in your market.
            </p>
            <div className="cta-actions">
              <button className="btn-white" onClick={goToDashboard}>
                Start for free — it&apos;s on us 🎉
              </button>
            </div>
            <p className="cta-note">
              No credit card · Takes 2 minutes · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-brand-logo">
                <LogoIcon size={28} radius={8} />
                Genie OS
              </div>
              <p>
                The complete winning ad workflow for e-commerce performance
                teams.
              </p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li>
                  <Link href="/discover">Discover</Link>
                </li>
                <li>
                  <Link href="/knowledge-base">Track Competitors</Link>
                </li>
                <li>
                  <Link href="/discover">AI Analysis</Link>
                </li>
                <li>
                  <Link href="/generate">Generate</Link>
                </li>
                <li>
                  <Link href="/analytics">Analytics</Link>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
                <li>
                  <a href="#">Cookie Policy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Genie OS. All rights reserved.</span>
            <div style={{ display: "flex", gap: 20 }}>
              {["Twitter / X", "LinkedIn", "Instagram"].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={{ color: "var(--text-3)", transition: "color .15s" }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = "var(--text)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color = "var(--text-3)")
                  }
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
