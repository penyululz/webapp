import { useEffect, useState } from "react";
import { BrandLogo, ThemeIcon } from "./Branding";
import WhisperXStudio from "./WhisperXStudio";

const whisperxApiUrl = import.meta.env.VITE_WHISPERX_API_URL || "http://localhost:3020";

function WhisperXPage() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("hub-theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("hub-theme", theme);

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", theme === "dark" ? "#050505" : "#fafafa");
    }
  }, [theme]);

  return (
    <>
      <div className="background-media" aria-hidden="true"></div>
      <div className="background-overlay" aria-hidden="true"></div>
      <div className="ambient ambient--left" aria-hidden="true"></div>
      <div className="ambient ambient--right" aria-hidden="true"></div>

      <header className="topbar">
        <div className="topbar__inner">
          <a className="brand" href="/#dashboard">
            <BrandLogo theme={theme} />
            <span className="sr-only">Webapp Hub</span>
          </a>

          <div className="nav-pill">
            <a className="nav-link is-active" href="/whisperx.html">WhisperX</a>
            <a className="nav-link" href="/#dashboard">Dashboard</a>
            <a className="nav-link" href="/#home">Home</a>
          </div>

          <button
            className="theme-toggle"
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          >
            <ThemeIcon theme={theme} />
            <span className="sr-only">
              {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            </span>
          </button>
        </div>
      </header>

      <main className="standalone-page">
        <section className="standalone-hero">
          <div className="section-kicker">
            <span className="section-kicker__line"></span>
            <span>Transcription app</span>
          </div>

          <div className="standalone-heading">
            <div className="app-logo app-logo--large">
              <img src="/app-logos/whisperx.svg" alt="" />
            </div>
            <div>
              <h1 className="standalone-title">WhisperX Studio</h1>
              <p className="hero__text">
                A dedicated transcription web app for uploads, presets, and output generation,
                backed by your local WhisperX API.
              </p>
            </div>
          </div>

          <div className="standalone-meta">
            <div className="detail">
              <span className="meta-label">App URL</span>
              <span className="meta-value mono">/whisperx.html</span>
            </div>
            <div className="detail">
              <span className="meta-label">API target</span>
              <span className="meta-value mono">{whisperxApiUrl}</span>
            </div>
            <div className="detail">
              <span className="meta-label">Runtime</span>
              <span className="meta-value">CPU-first local Docker API</span>
            </div>
          </div>
        </section>

        <section className="standalone-shell">
          <WhisperXStudio apiUrl={whisperxApiUrl} />
        </section>
      </main>
    </>
  );
}

export default WhisperXPage;
