function createPortalDetails(mode, note, embedUrl) {
  return {
    mode,
    note,
    embedUrl: embedUrl || "",
    supportsEmbed: mode === "embed"
  };
}

export function createApps(env) {
  const isLocalPortal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  function resolveAppUrl(envValue, localValue) {
    if (envValue) {
      return envValue;
    }

    return isLocalPortal ? localValue : "";
  }

  const immichUrl = resolveAppUrl(env.VITE_IMMICH_URL, "http://localhost:2283");
  const seafileUrl = resolveAppUrl(env.VITE_SEAFILE_URL, "http://localhost:8082");
  const stirlingUrl = resolveAppUrl(env.VITE_STIRLING_URL, "http://localhost:8083");
  const wordpressUrl = resolveAppUrl(env.VITE_WORDPRESS_URL, "http://localhost:8084");
  const phpMyAdminUrl = resolveAppUrl(env.VITE_PHPMYADMIN_URL, "http://localhost:8085");
  const standardNotesUrl = resolveAppUrl(env.VITE_STANDARDNOTES_URL, "http://localhost:3007");
  const standardNotesSyncUrl = resolveAppUrl(env.VITE_STANDARDNOTES_SYNC_URL, "http://localhost:3004");
  const whisperxApiUrl = resolveAppUrl(env.VITE_WHISPERX_API_URL, "http://localhost:3020");
  const whisperxStudioUrl = resolveAppUrl(env.VITE_WHISPERX_URL, "http://localhost:3030");

  return [
    {
      id: "immich",
      name: "Immich",
      access: "protected",
      useHubBrand: true,
      logo: "/app-logos/immich.svg",
      status: "ready",
      category: "Media",
      kind: "Docker app",
      folder: "F:\\webapp\\immich-app(done)",
      url: immichUrl,
      links: [
        { label: "Open app", href: immichUrl, primary: true }
      ],
      startCommand: "cd \"F:\\webapp\\immich-app(done)\" && docker compose up -d",
      summary: "Self-hosted photo and video management app.",
      note: "The service needs a minute on first boot while Postgres, machine learning, and import jobs settle.",
      stack: ["Docker Compose", "Postgres", "Redis", "Machine learning"],
      portal: createPortalDetails(
        "external",
        "Immich is better opened in its own tab because the login flow and media UI are not a reliable iframe target from this portal."
      ),
      onboarding: {
        statusHeadline: "First-run account setup",
        checklist: [
          "Open Immich and create the first account in the browser. That first user becomes the admin.",
          "The library path is already wired to ./library inside the project folder.",
          "If the page feels slow right after startup, give the machine-learning and import services another minute."
        ],
        credentials: [
          { label: "Web login", value: "Create your own admin account on first visit" },
          { label: "Database", value: "immich" },
          { label: "DB username", value: "satusky" },
          { label: "DB password", value: "satusky" }
        ]
      }
    },
    {
      id: "seafile",
      name: "Seafile",
      access: "protected",
      useHubBrand: true,
      logo: "/app-logos/seafile.svg",
      status: "ready",
      category: "Storage",
      kind: "Docker app",
      folder: "F:\\webapp\\seafile(done)",
      url: seafileUrl,
      links: [
        { label: "Open app", href: seafileUrl, primary: true }
      ],
      startCommand: "cd \"F:\\webapp\\seafile(done)\" && docker compose up -d",
      summary: "Private file sync and document cloud.",
      note: "This build already has a seeded admin account in docker-compose, so it is ready to sign in.",
      stack: ["Docker Compose", "MariaDB", "Memcached", "Nginx"],
      portal: createPortalDetails(
        "embed",
        "The login screen can be previewed inside the portal. If uploads or auth flows feel cramped, open the full app in a new tab.",
        seafileUrl
      ),
      onboarding: {
        statusHeadline: "Seeded local admin account",
        checklist: [
          "Use the local admin account below for your first login.",
          "After signing in, change the password and replace the placeholder email if this will stay on your machine.",
          "Your compose file maps the service to port 8082."
        ],
        credentials: [
          { label: "Admin email", value: "me@example.com" },
          { label: "Admin password", value: "asecret" },
          { label: "DB root password", value: "faristest" }
        ]
      }
    },
    {
      id: "stirling-pdf",
      name: "Stirling PDF",
      access: "protected",
      useHubBrand: true,
      logo: "/app-logos/stirling.png",
      status: "ready",
      category: "Productivity",
      kind: "Docker app",
      folder: "F:\\webapp\\stirling-pdf(done)",
      url: stirlingUrl,
      links: [
        { label: "Open app", href: stirlingUrl, primary: true }
      ],
      startCommand: "cd \"F:\\webapp\\stirling-pdf(done)\" && docker compose up -d",
      summary: "PDF toolkit for merge, split, OCR, conversion, and cleanup.",
      note: "The current security-enabled run creates a default admin user and asks you to rotate the password on first sign-in.",
      stack: ["Docker Compose", "Spring Boot", "H2", "LibreOffice", "Tesseract"],
      portal: createPortalDetails(
        "external",
        "This service sends X-Frame-Options: DENY, so the portal shows a guided fallback instead of a broken embedded frame."
      ),
      onboarding: {
        statusHeadline: "Security onboarding required",
        checklist: [
          "Open Stirling PDF in a separate tab and sign in with the default admin account below.",
          "The app redirects first-time users to change credentials right away.",
          "If you want iframe previews later, set xFrameOptions to SAMEORIGIN or DISABLED in extraConfigs/settings.yml."
        ],
        credentials: [
          { label: "Default username", value: "admin" },
          { label: "Default password", value: "stirling" },
          { label: "Settings file", value: "F:\\webapp\\stirling-pdf(done)\\extraConfigs\\settings.yml" }
        ]
      }
    },
    {
      id: "wordpress",
      name: "WordPress",
      access: "protected",
      useHubBrand: true,
      logo: "/app-logos/wordpress.svg",
      status: "ready",
      category: "CMS",
      kind: "Docker app",
      folder: "F:\\webapp\\wordpress (done)",
      url: wordpressUrl,
      links: [
        { label: "Open site", href: wordpressUrl, primary: true },
        { label: "Open phpMyAdmin", href: phpMyAdminUrl, primary: false }
      ],
      startCommand: "cd \"F:\\webapp\\wordpress (done)\" && docker compose up -d",
      summary: "CMS project with bundled WordPress files and MariaDB.",
      note: "WordPress is currently on its installation screen, so the next visit should finish site title, admin user, and password setup.",
      stack: ["Docker Compose", "WordPress", "MariaDB", "phpMyAdmin"],
      portal: createPortalDetails(
        "embed",
        "The install and front-end pages can be previewed in the portal. phpMyAdmin is kept as a separate link because it denies framing.",
        wordpressUrl
      ),
      onboarding: {
        statusHeadline: "Finish the first WordPress install",
        checklist: [
          "Open the WordPress site and complete the install wizard to create the real WordPress admin account.",
          "Use phpMyAdmin if you need to inspect or reset the bundled MariaDB data.",
          "The database credentials below come from the local .env file, so rotate them if this machine becomes shared."
        ],
        credentials: [
          { label: "DB name", value: "wordpress" },
          { label: "DB user", value: "satusky" },
          { label: "DB password", value: "faristest" },
          { label: "DB root password", value: "faristest" },
          { label: "phpMyAdmin", value: phpMyAdminUrl }
        ]
      }
    },
    {
      id: "standard-notes",
      name: "Standard Notes",
      access: "protected",
      useHubBrand: true,
      logo: "/app-logos/standardnotes.png",
      status: "ready",
      category: "Notes",
      kind: "Docker app",
      folder: "F:\\webapp\\standardnotes(done)",
      url: standardNotesUrl,
      links: [
        { label: "Open app", href: standardNotesUrl, primary: true }
      ],
      startCommand: "cd \"F:\\webapp\\standardnotes(done)\" && docker compose up -d",
      summary: "Encrypted notes app with a local sync server and a local web client.",
      note: "The local web build is preconfigured to use the local sync server, so account creation stays inside this machine instead of pointing to the public Standard Notes cloud.",
      stack: ["Docker Compose", "Standard Notes server", "Standard Notes web", "MySQL", "Redis", "LocalStack"],
      portal: createPortalDetails(
        "external",
        "Standard Notes can be launched from the portal, but the self-hosted sign-in flow is less brittle in its own tab than in an iframe."
      ),
      onboarding: {
        statusHeadline: "Local notes stack ready",
        checklist: [
          "Open the local web app and create your account there.",
          "The local web client is already wired to the local sync server by default.",
          "Keep the sync server and web app on the same machine for the smoothest local setup."
        ],
        credentials: [
          { label: "Web app", value: standardNotesUrl },
          { label: "Sync server", value: standardNotesSyncUrl },
          { label: "DB user", value: "std_notes_user" },
          { label: "DB password", value: "faristest" }
        ]
      }
    },
    {
      id: "whisperx",
      name: "WhisperX",
      access: "public",
      useHubBrand: true,
      logo: "/app-logos/whisperx.svg",
      status: "ready",
      category: "Transcription",
      kind: "Docker app",
      folder: "F:\\webapp\\whisperX (transcription ready linux)\\whisperX",
      url: whisperxStudioUrl,
      statusUrl: whisperxApiUrl,
      links: whisperxApiUrl
        ? [
            { label: "Open app", href: whisperxStudioUrl, primary: true },
            { label: "Open API docs", href: `${whisperxApiUrl}/docs`, primary: false },
            { label: "Open health", href: `${whisperxApiUrl}/health`, primary: false }
          ]
        : [{ label: "Open app", href: whisperxStudioUrl, primary: true }],
      startCommand: "cd \"F:\\webapp\\whisperX (transcription ready linux)\\whisperX\" && docker compose up -d",
      summary: "A standalone WhisperX transcription web app backed by a local CPU-friendly Docker API.",
      note: "The WhisperX app opens on its own page and posts jobs to the local API. Diarization stays optional until you add a Hugging Face token.",
      stack: ["React app", "WhisperX API", "Docker Compose", "FFmpeg", "CPU first"],
      portal: createPortalDetails(
        "external",
        "WhisperX now opens as its own web app page so it behaves more like the rest of the stack."
      ),
      onboarding: {
        statusHeadline: "Portal studio and local API ready",
        checklist: [
          "Use the built-in studio to upload media and submit jobs from the browser.",
          "The default API runs on CPU with int8 compute, which is slower but safer on this machine.",
          "Add WHISPERX_HF_TOKEN in the compose file later if you want speaker diarization."
        ],
        credentials: []
      }
    },
    {
      id: "go-mail",
      name: "go-mail",
      access: "source",
      logo: "/app-logos/go.svg",
      status: "source",
      category: "Backend",
      kind: "Go source repo",
      folder: "F:\\webapp\\go-mail work on linux",
      url: "",
      links: [],
      startCommand: "cd \"F:\\webapp\\go-mail work on linux\" && go run ./cmd",
      summary: "Go mail library and SMTP tooling source tree, not a browser app.",
      note: "This belongs in the workspace view as source code rather than an embeddable web service.",
      stack: ["Go", "Source repository"],
      portal: createPortalDetails(
        "source",
        "The portal can document and launch source repos, but there is no browser preview until you add a web surface."
      ),
      onboarding: {
        statusHeadline: "Developer workspace",
        checklist: [
          "Run it from the terminal if you want to work on the backend locally.",
          "Add a front-end or admin route later if you want it to behave like the other dashboard apps."
        ],
        credentials: []
      }
    }
  ];
}
