import { useEffect, useRef, useState } from "react";
import { createApps } from "./apps";
import { BrandLogo, ThemeIcon } from "./Branding";

const filters = [
  { id: "all", label: "All projects" },
  { id: "ready", label: "Runnable now" },
  { id: "setup", label: "Needs setup" },
  { id: "source", label: "Source only" }
];

const pages = [
  { id: "home", label: "Home" },
  { id: "dashboard", label: "Dashboard" },
  { id: "workspace", label: "Workspace" }
];

const sectionContent = {
  ready: {
    title: "Ready To Use",
    copy: "Apps you can open now."
  },
  setup: {
    title: "Needs Setup",
    copy: "Projects that still need setup."
  },
  source: {
    title: "Workspace Repos",
    copy: "Code projects in this workspace."
  }
};

const statusOrder = { ready: 0, setup: 1, source: 2 };
const apps = createApps(import.meta.env);

function resolvePage(hashValue) {
  const nextPage = hashValue.replace("#", "").trim();
  return pages.some((page) => page.id === nextPage) ? nextPage : "home";
}

function getStatusLabel(app) {
  if (app.status === "ready") {
    return "Runnable";
  }

  if (app.status === "setup") {
    return "Setup";
  }

  return "Source";
}

function getLiveLabel(status) {
  if (status === "online") {
    return "Live";
  }

  if (status === "offline") {
    return "Offline";
  }

  if (status === "private") {
    return "Private";
  }

  return "Checking";
}

function getPortalModeLabel(mode) {
  if (mode === "embed") {
    return "Embedded preview";
  }

  if (mode === "external") {
    return "Open in new tab";
  }

  if (mode === "source") {
    return "Source workspace";
  }

  if (mode === "studio") {
    return "Built-in studio";
  }

  return "Placeholder";
}

function getAccessLabel(access) {
  if (access === "protected") {
    return "Protected";
  }

  if (access === "public") {
    return "Public demo";
  }

  return "Source only";
}

function getUrlTagLabel(url) {
  if (!url) {
    return "No local URL yet";
  }

  try {
    const parsed = new URL(url);
    return parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname;
  } catch (error) {
    return url;
  }
}

function AppLogo({ app, size = "normal", theme = "dark" }) {
  const brandSrc =
    theme === "light"
      ? "/brand/logo-light-compact.svg"
      : "/brand/logo-dark-compact.svg";

    return (
      <div className={`app-logo app-logo--${size} app-logo--${app.id} ${app.useHubBrand ? "app-logo--hubbrand" : ""}`}>
        {app.useHubBrand ? (
          <img className="app-logo__brandmark" src={brandSrc} alt="" loading="lazy" />
        ) : app.logo ? (
        <img src={app.logo} alt="" loading="lazy" />
      ) : (
        <span>{app.name.slice(0, 2)}</span>
      )}
    </div>
  );
}

function App() {
  const adminLoginUrl = import.meta.env.VITE_ADMIN_LOGIN_URL || "";
  const heroVideoRef = useRef(null);
  const [theme, setTheme] = useState("dark");
  const [activePage, setActivePage] = useState(() => resolvePage(window.location.hash));
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [serviceStatus, setServiceStatus] = useState({});
  const [selectedAppId, setSelectedAppId] = useState(apps[0].id);
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);

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

  useEffect(() => {
    if (activePage !== "home") {
      return;
    }

    const video = heroVideoRef.current;
    if (!video) {
      return;
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }, [activePage, theme]);

  useEffect(() => {
    function handleHashChange() {
      setActivePage(resolvePage(window.location.hash));
    }

    window.addEventListener("hashchange", handleHashChange);

    if (!window.location.hash) {
      window.history.replaceState(null, "", "#home");
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkServices() {
      const readyApps = apps.filter((app) => app.status === "ready" && (app.statusUrl || app.url));
      const nextStatus = {};

      for (const app of readyApps) {
        const statusTarget = app.statusUrl || app.url;

        try {
          await fetch(statusTarget, {
            method: "GET",
            mode: "no-cors",
            cache: "no-store"
          });
          nextStatus[app.name] = "online";
        } catch (error) {
          nextStatus[app.name] = "offline";
        }
      }

      if (!cancelled) {
        setServiceStatus(nextStatus);
      }
    }

    checkServices();
    const intervalId = window.setInterval(checkServices, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const visibleApps = apps
    .filter((app) => {
      const matchesFilter = activeFilter === "all" ? true : app.status === activeFilter;
      const haystack = [
        app.name,
        app.category,
        app.kind,
        app.summary,
        app.note,
        app.folder,
        app.onboarding.statusHeadline,
        ...app.onboarding.checklist,
        ...app.onboarding.credentials.map((credential) => credential.label)
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((left, right) => {
      return statusOrder[left.status] - statusOrder[right.status];
    });

  useEffect(() => {
    if (!visibleApps.length) {
      return;
    }

    const selectedIsVisible = visibleApps.some((app) => app.id === selectedAppId);
    if (!selectedIsVisible) {
      setSelectedAppId(visibleApps[0].id);
    }
  }, [selectedAppId, visibleApps]);

  const featuredApp =
    visibleApps.find((app) => app.id === selectedAppId) ||
    apps.find((app) => app.id === selectedAppId) ||
    visibleApps[0] ||
    apps[0];

  const readyApps = apps.filter((app) => app.status === "ready");
  const publiclyLinkedReadyApps = readyApps.filter((app) => app.links.length > 0);
  const setupApps = apps.filter((app) => app.status === "setup");
  const sourceApps = apps.filter((app) => app.status === "source");
  const liveNow = readyApps.filter((app) => serviceStatus[app.name] === "online").length;
  const workspaceApps = [...setupApps, ...sourceApps];
  const readyAppsForHome = [...publiclyLinkedReadyApps].sort((left, right) => {
    const leftStatus = serviceStatus[left.name] === "online" ? 0 : 1;
    const rightStatus = serviceStatus[right.name] === "online" ? 0 : 1;

    if (leftStatus !== rightStatus) {
      return leftStatus - rightStatus;
    }

    return left.name.localeCompare(right.name);
  });
  const homeCarouselApps = readyAppsForHome.length ? readyAppsForHome : readyApps.filter((app) => app.links.length > 0);
  const homeFeaturedApp =
    homeCarouselApps[featuredSlideIndex % Math.max(homeCarouselApps.length, 1)] || featuredApp;
  const homeFeaturedApps = readyAppsForHome;

  const groupedApps = ["ready", "setup", "source"]
    .map((status) => ({
      status,
      ...sectionContent[status],
      items: visibleApps.filter((app) => app.status === status)
    }))
    .filter((group) => group.items.length > 0);

  const stats = [
    { label: "Projects tracked", value: apps.length },
    { label: "Runnable now", value: readyApps.length },
    { label: "Needs setup", value: setupApps.length },
    { label: "Source repos", value: sourceApps.length }
  ];

  useEffect(() => {
    if (homeCarouselApps.length <= 1) {
      setFeaturedSlideIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setFeaturedSlideIndex((current) => (current + 1) % homeCarouselApps.length);
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [homeCarouselApps.length]);

  function goToPage(pageId) {
    window.location.hash = pageId;
  }

  function renderLandingPage() {
    return (
      <>
        <section className="hero hero--landing" id="home">
          <div className="hero-media" aria-hidden="true">
            <video
              ref={heroVideoRef}
              key={theme}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/hub-assets/hero-wallpaper.jpg"
              disableRemotePlayback
              className="hero-media__video"
            >
              <source
                src={
                  theme === "dark"
                    ? "/hub-assets/hero-background-dark.mp4"
                    : "/hub-assets/hero-background-light.mp4"
                }
                type="video/mp4"
              />
            </video>
          </div>
          <div className="hero-media__overlay" aria-hidden="true"></div>
          <div className="hero__inner">
            <div className="hero__copy">
              <div className="section-kicker">
                <span className="section-kicker__line"></span>
                <span>Application portfolio</span>
              </div>

              <h1 className="hero__title">
                ONE
                <br />
                <span>CENTRAL HUB</span>
                <br />
                CLEANER FLOW
              </h1>

              <p className="hero__text">
                A cleaner front page for launching your local apps fast.
              </p>

              <div className="hero__actions">
                <button className="button button--primary" type="button" onClick={() => goToPage("dashboard")}>
                  Open Dashboard
                </button>
                <button className="button button--secondary" type="button" onClick={() => goToPage("workspace")}>
                  View Workspace
                </button>
                {adminLoginUrl ? (
                  <a className="button button--secondary" href={adminLoginUrl} target="_blank" rel="noreferrer">
                    Admin Login
                  </a>
                ) : null}
              </div>
            </div>

            <aside className="hero__panel">
              <div className="status-chip">
                <span className="status-chip__dot"></span>
                <span>{liveNow} of {publiclyLinkedReadyApps.length} public apps responding right now</span>
              </div>

              <div className="hero__stats">
                {stats.map((stat) => (
                  <article className="stat" key={stat.label}>
                    <span className="stat__value">{stat.value}</span>
                    <span className="stat__label">{stat.label}</span>
                  </article>
                ))}
              </div>

              <div className="hero__meta">
                <div>
                  <span className="meta-label">Root folder</span>
                  <span className="meta-value mono">F:\webapp</span>
                </div>
                <div>
                  <span className="meta-label">Frontend stack</span>
                  <span className="meta-value">React 18 + Vite 6</span>
                </div>
                <div>
                  <span className="meta-label">Featured app</span>
                  <span className="meta-value">{homeFeaturedApp.name}</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <div className="home-flow">
          <section className="home-section home-section--feature">
            <div className="home-section__heading">
              <div>
                <p className="section-label">Featured Tool</p>
                <h2 className="home-section__title">A cleaner launch surface for the apps you use most.</h2>
              </div>
              <p className="home-section__copy">
                The homepage stays lightweight. Open the app directly here, then use the Dashboard when you need previews and filtering.
              </p>
            </div>

            <article className="feature-surface">
              <div className="feature-surface__copy">
                <div className="title-with-logo">
                  <AppLogo app={homeFeaturedApp} size="large" theme={theme} />
                  <div>
                    <h3>{homeFeaturedApp.name}</h3>
                    <p className="feature-surface__summary">{homeFeaturedApp.summary}</p>
                  </div>
                </div>

                <div className="feature-surface__meta">
                  <span className="tag">{homeFeaturedApp.category}</span>
                  <span className="tag">{getUrlTagLabel(homeFeaturedApp.url)}</span>
                  <span className="tag">{getAccessLabel(homeFeaturedApp.access)}</span>
                  <span className={`card-status card-status--${homeFeaturedApp.status}`}>
                    {getStatusLabel(homeFeaturedApp)}
                  </span>
                  {homeFeaturedApp.status === "ready" ? (
                    <span className={`live-status live-status--${serviceStatus[homeFeaturedApp.name] || "checking"}`}>
                      {getLiveLabel(serviceStatus[homeFeaturedApp.name])}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="feature-surface__actions">
                {homeFeaturedApp.links[0] ? (
                  <a
                    className="button button--primary"
                    href={homeFeaturedApp.links[0].href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {homeFeaturedApp.links[0].label}
                  </a>
                ) : null}
                <button className="button button--secondary" type="button" onClick={() => goToPage("dashboard")}>
                  Open Dashboard
                </button>
              </div>

              {homeCarouselApps.length > 1 ? (
                <div className="carousel-dots" aria-label="Featured apps">
                  {homeCarouselApps.map((app, index) => (
                    <button
                      key={app.id}
                      className={`carousel-dot ${index === featuredSlideIndex ? "is-active" : ""}`}
                      type="button"
                      aria-label={`Show ${app.name}`}
                      onClick={() => setFeaturedSlideIndex(index)}
                    />
                  ))}
                </div>
              ) : null}
            </article>
          </section>

          <section className="home-section home-section--quick">
            <div className="home-section__heading">
              <div>
                <p className="section-label">Quick Launch</p>
                <h2 className="home-section__title">All runnable apps in one place.</h2>
              </div>
              <p className="home-section__copy">
                Static shortcuts for the tools already wired into your local workspace.
              </p>
            </div>

            <div className="quick-grid">
              {homeFeaturedApps.map((app) => (
                <a
                  className="quick-card"
                  href={app.links[0]?.href || "#"}
                  key={app.id}
                  target={app.links[0] ? "_blank" : undefined}
                  rel={app.links[0] ? "noreferrer" : undefined}
                >
                  <div className="quick-card__top">
                    <AppLogo app={app} size="small" theme={theme} />
                    <div className="quick-card__body">
                      <strong>{app.name}</strong>
                      <p className="card-note">{getUrlTagLabel(app.url)}</p>
                    </div>
                  </div>
                  <div className="quick-card__meta">
                    <span className="tag">{getAccessLabel(app.access)}</span>
                    <span className={`live-status live-status--${serviceStatus[app.name] || "checking"}`}>
                      {getLiveLabel(serviceStatus[app.name])}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </>
    );
  }

  function renderDashboardPage() {
    return (
      <section className="apps-section" id="dashboard">
        <div className="section-heading">
          <div>
            <p className="section-label">Operational View</p>
            <h2>Dashboard</h2>
          </div>
          <p className="section-copy">
            Open and preview apps from one place.
          </p>
        </div>

        <div className="controls">
          <label className="search search--dashboard">
            <span className="sr-only">Search apps</span>
            <input
              type="search"
              placeholder="Immich, WordPress, PDF, notes..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="filters">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-chip ${filter.id === activeFilter ? "is-active" : ""}`}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {featuredApp ? (
          <section className="spotlight">
            <div className="spotlight__header">
              <div>
                <div className="title-with-logo">
                  <AppLogo app={featuredApp} size="large" theme={theme} />
                  <h3>{featuredApp.name}</h3>
                </div>
              </div>
              <div className="spotlight__status">
                <span className={`card-status card-status--${featuredApp.status}`}>
                  {getStatusLabel(featuredApp)}
                </span>
                {featuredApp.status === "ready" ? (
                  <span className={`live-status live-status--${serviceStatus[featuredApp.name] || "checking"}`}>
                    {getLiveLabel(serviceStatus[featuredApp.name])}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="spotlight__grid">
              <article className="preview-panel">
                <div className="preview-panel__top">
                  <div>
                    <span className="meta-label">URL</span>
                    <span className="meta-value">{getUrlTagLabel(featuredApp.portal.embedUrl || featuredApp.url)}</span>
                  </div>
                  <div className="preview-actions">
                    {featuredApp.links.map((link) => (
                      <a
                        className={`button ${link.primary ? "button--primary" : "button--secondary"}`}
                        href={link.href}
                        key={`${featuredApp.id}-${link.label}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="preview-shell">
                  <div className="preview-shell__bar">
                    <span className="preview-shell__dot"></span>
                    <span className="preview-shell__dot"></span>
                    <span className="preview-shell__dot"></span>
                    <span className="preview-shell__url mono">
                      {featuredApp.portal.embedUrl || featuredApp.url || "No web URL available"}
                    </span>
                  </div>

                  {featuredApp.portal.supportsEmbed && featuredApp.portal.embedUrl ? (
                    <iframe
                      className="app-frame"
                      src={featuredApp.portal.embedUrl}
                      title={`${featuredApp.name} embedded preview`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    ></iframe>
                  ) : (
                    <div className="preview-fallback">
                      <span className="preview-badge">{getPortalModeLabel(featuredApp.portal.mode)}</span>
                      <h4>Preview fallback</h4>
                      <p className="preview-note">
                        {featuredApp.links.length
                          ? "Use the main action button above to open the real app."
                          : "This app is not publicly linked in this deployment. Use a private route like Tailscale or add a public URL for it."}
                      </p>
                    </div>
                  )}
                </div>
              </article>

                <aside className="details-panel">
                  <div className="details-panel__section">
                    <span className="meta-label">Overview</span>
                    <h4>{featuredApp.summary}</h4>
                  </div>

                  <div className="detail-grid">
                    <div className="detail">
                      <span className="meta-label">URL</span>
                      <span className="meta-value mono">{featuredApp.url || "No direct URL yet"}</span>
                    </div>
                    <div className="detail">
                      <span className="meta-label">Category</span>
                      <span className="meta-value">{featuredApp.category}</span>
                    </div>
                    <div className="detail">
                      <span className="meta-label">Access</span>
                      <span className="meta-value">{getAccessLabel(featuredApp.access)}</span>
                    </div>
                    <div className="detail">
                      <span className="meta-label">Type</span>
                      <span className="meta-value">
                        {featuredApp.kind}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="meta-label">Stack</span>
                      <div className="tag-row">
                        {featuredApp.stack.map((item) => (
                          <span className="tag" key={`${featuredApp.id}-${item}`}>{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
              </aside>
            </div>
          </section>
        ) : null}

        <div className="grouped-sections">
          {groupedApps.length ? (
            groupedApps.map((group) => (
              <section className="app-group" key={group.status}>
                <div className="group-header">
                  <div>
                    <p className="section-label">{group.items.length} items</p>
                    <h3>{group.title}</h3>
                  </div>
                  <span className="group-copy">{group.copy}</span>
                </div>

                <div className="cards">
                  {group.items.map((app) => (
                    <article
                      className={`app-card ${app.id === featuredApp.id ? "is-selected" : ""}`}
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                    >
                      <div className="card-top">
                        <div className="title-with-logo title-with-logo--compact card-heading">
                          <AppLogo app={app} size="small" theme={theme} />
                          <div>
                            <h3 className="card-title">{app.name}</h3>
                            <span className="card-eyebrow">{app.kind}</span>
                          </div>
                        </div>
                        <div className="card-status-stack">
                          <span className={`card-status card-status--${app.status}`}>
                            {getStatusLabel(app)}
                          </span>
                          {app.status === "ready" ? (
                            <span
                              className={`live-status live-status--${
                                app.links.length ? serviceStatus[app.name] || "checking" : "private"
                              }`}
                            >
                              {getLiveLabel(app.links.length ? serviceStatus[app.name] : "private")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="card-summary">{app.summary}</p>

                      <div className="tag-row">
                        <span className="tag">{app.category}</span>
                        <span className="tag">{getUrlTagLabel(app.url)}</span>
                        <span className="tag">{getAccessLabel(app.access)}</span>
                      </div>

                      <div className="action-row">
                        {app.links.length ? (
                          app.links.map((link) => (
                            <a
                              className={`button ${link.primary ? "button--primary" : "button--secondary"}`}
                              href={link.href}
                              key={`${app.id}-${link.label}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {link.label}
                            </a>
                          ))
                        ) : (
                          <span className="button button--secondary" aria-disabled="true">
                            No direct web URL yet
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="empty-state">
              No projects match that search yet. Try a different keyword or switch the filter.
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderWorkspacePage() {
    return (
      <section className="workspace-section" id="workspace">
        <div className="section-heading">
          <div>
            <p className="section-label">Deployment Notes</p>
            <h2>Workspace</h2>
          </div>
          <p className="section-copy">
            Setup notes and source projects live here instead of on the landing page.
          </p>
        </div>

        <div className="workspace-grid">
          <article className="info-card">
            <span className="meta-label">Local</span>
            <p>
              Run `npm install` once, then `npm run dev` to start the portal at `http://localhost:5173`.
            </p>
          </article>

          <article className="info-card">
            <span className="meta-label">Cloudflare</span>
            <p>
              Host the public frontend on Cloudflare Workers static assets, expose local services with Cloudflare Tunnel, and protect the real apps with Cloudflare Access.
            </p>
          </article>

          <article className="info-card">
            <span className="meta-label">Admin access</span>
            <p>
              Keep the public hub open, then put the real services behind an admin login so only you or approved reviewers can reach them.
            </p>
          </article>
        </div>

        <div className="grouped-sections">
          <section className="app-group">
            <div className="group-header">
              <div>
                <p className="section-label">{workspaceApps.length} items</p>
                <h3>Setup And Source Projects</h3>
              </div>
              <p className="section-copy">
                Supporting projects and source repos.
              </p>
            </div>

            <div className="cards">
              {workspaceApps.map((app) => (
                <article className="app-card" key={app.id}>
                  <div className="card-top">
                    <span className="card-type">{app.kind}</span>
                    <span className={`card-status card-status--${app.status}`}>
                      {getStatusLabel(app)}
                    </span>
                  </div>

                  <h3 className="card-title">{app.name}</h3>
                  <p className="card-summary">{app.summary}</p>

                  <div className="tag-row">
                    <span className="tag">{app.category}</span>
                    <span className="tag">{getPortalModeLabel(app.portal.mode)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    );
  }

  return (
    <div className={`app-shell app-shell--${theme}`}>
      <div className="background-media" aria-hidden="true"></div>
      <div className="background-overlay" aria-hidden="true"></div>

      <header className="topbar">
        <div className="topbar__inner">
          <button className="brand" type="button" onClick={() => goToPage("home")}>
            <BrandLogo theme={theme} />
            <span className="sr-only">Webapp Hub</span>
          </button>

          <nav className="nav-pill" aria-label="Primary">
            {pages.map((page) => (
              <button
                key={page.id}
                className={`nav-link ${activePage === page.id ? "is-active" : ""}`}
                type="button"
                onClick={() => goToPage(page.id)}
              >
                {page.label}
              </button>
            ))}
          </nav>

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

      <main>
        {activePage === "home" ? renderLandingPage() : null}
        {activePage === "dashboard" ? renderDashboardPage() : null}
        {activePage === "workspace" ? renderWorkspacePage() : null}
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand-group">
            <div className="site-footer__brand">
              <BrandLogo theme={theme} />
              <div>
                <strong>Webapp Hub</strong>
                <span>Personal app launcher and local workspace.</span>
              </div>
            </div>

            <div className="site-footer__credit">
              <strong>Created by Mohamad Faris Danial</strong>
              <div className="site-footer__meta-links">
                <a
                  className="site-footer__text-link"
                  href="https://portfolio-nine-sandy-ysts5ij3xd.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                >
                  Portfolio
                </a>
                <a
                  className="site-footer__text-link"
                  href="https://github.com/penyululz"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                <a
                  className="site-footer__text-link"
                  href="https://www.linkedin.com/in/mohamad-faris-danial-abdul-malek-497246294"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="site-footer__links">
            <button type="button" className="site-footer__link" onClick={() => goToPage("home")}>
              Home
            </button>
            <button type="button" className="site-footer__link" onClick={() => goToPage("dashboard")}>
              Dashboard
            </button>
            <button type="button" className="site-footer__link" onClick={() => goToPage("workspace")}>
              Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
