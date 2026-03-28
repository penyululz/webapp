const apiBase = `${window.location.origin}/api`;
const apiDocsUrl = `${apiBase}/docs`;

const presets = {
  interview: {
    language: "auto",
    model: "large-v3",
    device: "auto",
    diarize: true,
    alignment: true,
    output: "srt"
  },
  podcast: {
    language: "en",
    model: "medium",
    device: "auto",
    diarize: true,
    alignment: true,
    output: "vtt"
  },
  draft: {
    language: "auto",
    model: "small",
    device: "cpu",
    diarize: false,
    alignment: true,
    output: "txt"
  }
};

const themeIcons = {
  dark:
    '<svg class="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"></circle><path d="M12 2.5v2.2"></path><path d="M12 19.3v2.2"></path><path d="m4.93 4.93 1.56 1.56"></path><path d="m17.51 17.51 1.56 1.56"></path><path d="M2.5 12h2.2"></path><path d="M19.3 12h2.2"></path><path d="m4.93 19.07 1.56-1.56"></path><path d="m17.51 6.49 1.56-1.56"></path></svg>',
  light:
    '<svg class="theme-toggle__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 0 1 11.2 3a1 1 0 0 0-1.18-1.18A10.5 10.5 0 1 0 22.18 13.98 1 1 0 0 0 21 12.8Z"></path></svg>'
};

const state = {
  queue: [],
  file: null
};

const form = document.getElementById("whisperxForm");
const mediaFile = document.getElementById("mediaFile");
const fileName = document.getElementById("fileName");
const fileMeta = document.getElementById("fileMeta");
const planFile = document.getElementById("planFile");
const planProfile = document.getElementById("planProfile");
const requestPreview = document.getElementById("requestPreview");
const banner = document.getElementById("banner");
const queueList = document.getElementById("queueList");
const queueEmpty = document.getElementById("queueEmpty");
const uploadCard = document.getElementById("uploadCard");
const apiStatus = document.getElementById("apiStatus");
const apiDocsLink = document.getElementById("apiDocsLink");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

const fields = {
  language: document.getElementById("language"),
  model: document.getElementById("model"),
  device: document.getElementById("device"),
  output: document.getElementById("output"),
  diarize: document.getElementById("diarize"),
  alignment: document.getElementById("alignment")
};

function renderThemeIcon(theme) {
  themeIcon.innerHTML = theme === "dark" ? themeIcons.dark : themeIcons.light;
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", theme === "dark" ? "#050505" : "#fafafa");
  }
}

function loadTheme() {
  const storedTheme = window.localStorage.getItem("hub-theme");
  const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
  document.body.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  renderThemeIcon(theme);
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  document.body.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
  window.localStorage.setItem("hub-theme", nextTheme);
  renderThemeIcon(nextTheme);
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = units[0];

  for (let index = 0; index < units.length; index += 1) {
    unit = units[index];
    if (value < 1024 || index === units.length - 1) break;
    value /= 1024;
  }

  return `${value.toFixed(value >= 10 || unit === "B" ? 0 : 1)} ${unit}`;
}

function getSettings() {
  return {
    language: fields.language.value,
    model: fields.model.value,
    device: fields.device.value,
    output: fields.output.value,
    diarize: fields.diarize.checked,
    alignment: fields.alignment.checked
  };
}

function updatePreview() {
  const settings = getSettings();
  const preview = {
    endpoint: `${apiBase}/transcriptions`,
    fileName: state.file ? state.file.name : "<selected-file>",
    options: settings
  };

  requestPreview.textContent = JSON.stringify(preview, null, 2);
  planFile.textContent = state.file ? state.file.name : "No file selected yet";
  planProfile.textContent = `${settings.model} on ${settings.device} with ${settings.output.toUpperCase()} output`;
}

function setFile(file) {
  state.file = file || null;

  if (!state.file) {
    fileName.textContent = "Drop audio or video here";
    fileMeta.textContent = "Supports interviews, podcasts, lectures, voice notes, and video clips.";
    updatePreview();
    return;
  }

  fileName.textContent = state.file.name;
  fileMeta.textContent = `${formatBytes(state.file.size)} | ${state.file.type || "Unknown media type"}`;
  banner.textContent = `Loaded ${state.file.name}`;
  updatePreview();
}

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) return;

  fields.language.value = preset.language;
  fields.model.value = preset.model;
  fields.device.value = preset.device;
  fields.output.value = preset.output;
  fields.diarize.checked = preset.diarize;
  fields.alignment.checked = preset.alignment;
  banner.textContent = `Preset loaded: ${name}`;
  updatePreview();
}

function renderQueue() {
  queueList.innerHTML = "";
  queueEmpty.style.display = state.queue.length ? "none" : "block";

  state.queue.forEach((job) => {
    const article = document.createElement("article");
    article.className = "queue-item";
    article.innerHTML = `
      <div class="queue-item__top">
        <strong>${job.name}</strong>
        <span class="queue-status queue-status--${job.status}">${job.status}</span>
      </div>
      <span class="card-note">${job.model} to ${job.output.toUpperCase()}</span>
      <p class="card-note">${job.detail}</p>
    `;
    queueList.appendChild(article);
  });
}

function addJob(job) {
  state.queue.unshift(job);
  renderQueue();
}

async function checkHealth() {
  try {
    const response = await fetch(`${apiBase}/health`, { cache: "no-store" });
    if (!response.ok) throw new Error("Health check failed");
    apiStatus.textContent = "API online";
    apiStatus.className = "whisperx-chip is-online";
  } catch (error) {
    apiStatus.textContent = "API offline";
    apiStatus.className = "whisperx-chip is-offline";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!state.file) {
    banner.textContent = "Select an audio or video file first.";
    return;
  }

  const settings = getSettings();
  const jobId = `job-${Date.now()}`;
  addJob({
    id: jobId,
    name: state.file.name,
    output: settings.output,
    model: settings.model,
    status: "sending",
    detail: `Posting to ${apiBase}/transcriptions`
  });

  const payload = new FormData();
  payload.append("file", state.file);
  payload.append("language", settings.language);
  payload.append("model", settings.model);
  payload.append("device", settings.device);
  payload.append("diarize", String(settings.diarize));
  payload.append("alignment", String(settings.alignment));
  payload.append("output", settings.output);

  try {
    const response = await fetch(`${apiBase}/transcriptions`, {
      method: "POST",
      body: payload
    });

    const detail = await response.text();
    state.queue = state.queue.map((job) =>
      job.id === jobId
        ? {
            ...job,
            status: response.ok ? "submitted" : "failed",
            detail: detail || `HTTP ${response.status}`
          }
        : job
    );
    renderQueue();
    banner.textContent = response.ok ? "Job submitted to WhisperX." : "WhisperX rejected the job.";
  } catch (error) {
    state.queue = state.queue.map((job) =>
      job.id === jobId
        ? {
            ...job,
            status: "failed",
            detail: error instanceof Error ? error.message : "Unknown network error"
          }
        : job
    );
    renderQueue();
    banner.textContent = "The app could not reach WhisperX.";
  }
});

mediaFile.addEventListener("change", (event) => {
  setFile(event.target.files && event.target.files[0]);
});

uploadCard.addEventListener("dragenter", () => uploadCard.classList.add("is-dragging"));
uploadCard.addEventListener("dragleave", () => uploadCard.classList.remove("is-dragging"));
uploadCard.addEventListener("dragover", (event) => {
  event.preventDefault();
  uploadCard.classList.add("is-dragging");
});
uploadCard.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadCard.classList.remove("is-dragging");
  const droppedFile = event.dataTransfer.files && event.dataTransfer.files[0];
  setFile(droppedFile);
});

Object.values(fields).forEach((field) => {
  field.addEventListener("change", updatePreview);
});

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

themeToggle.addEventListener("click", toggleTheme);

document.getElementById("apiTarget").textContent = apiBase;
document.getElementById("apiTargetCopy").textContent = apiBase;
apiDocsLink.href = apiDocsUrl;
apiDocsLink.textContent = apiDocsUrl;

loadTheme();
updatePreview();
renderQueue();
checkHealth();
