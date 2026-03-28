import { useMemo, useState } from "react";

const presets = {
  interview: {
    label: "Interview",
    language: "auto",
    model: "large-v3",
    device: "auto",
    diarize: true,
    alignment: true,
    output: "srt"
  },
  podcast: {
    label: "Podcast",
    language: "en",
    model: "medium",
    device: "auto",
    diarize: true,
    alignment: true,
    output: "vtt"
  },
  draft: {
    label: "Fast draft",
    language: "auto",
    model: "small",
    device: "cpu",
    diarize: false,
    alignment: true,
    output: "txt"
  }
};

const defaultSettings = {
  language: "auto",
  model: "medium",
  device: "auto",
  diarize: true,
  alignment: true,
  output: "srt"
};

function formatBytes(bytes) {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = units[0];

  for (let index = 0; index < units.length; index += 1) {
    unit = units[index];
    if (value < 1024 || index === units.length - 1) {
      break;
    }
    value /= 1024;
  }

  return `${value.toFixed(value >= 10 || unit === "B" ? 0 : 1)} ${unit}`;
}

function buildRequestPreview(settings, file) {
  return {
    endpoint: "/transcriptions",
    fileName: file ? file.name : "<selected-file>",
    options: {
      language: settings.language,
      model: settings.model,
      device: settings.device,
      diarize: settings.diarize,
      alignment: settings.alignment,
      output: settings.output
    }
  };
}

function normalizeApiBase(apiUrl) {
  return apiUrl ? apiUrl.replace(/\/$/, "") : "";
}

function WhisperXStudio({ apiUrl }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState([]);
  const [banner, setBanner] = useState("");

  const apiBase = normalizeApiBase(apiUrl);
  const submitUrl = apiBase ? `${apiBase}/transcriptions` : "";
  const hasApiTarget = Boolean(apiBase);
  const requestPreview = useMemo(() => {
    return JSON.stringify(buildRequestPreview(settings, selectedFile), null, 2);
  }, [selectedFile, settings]);

  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value
    }));
  }

  function applyPreset(presetKey) {
    setSettings((current) => ({
      ...current,
      ...presets[presetKey]
    }));
    setBanner(`Preset loaded: ${presets[presetKey].label}`);
  }

  function handleFileSelection(files) {
    const nextFile = files?.[0];
    if (!nextFile) {
      return;
    }

    setSelectedFile(nextFile);
    setBanner(`Loaded ${nextFile.name}`);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setBanner("Select an audio or video file first.");
      return;
    }

    const jobId = `job-${Date.now()}`;
    const baseJob = {
      id: jobId,
      name: selectedFile.name,
      output: settings.output,
      model: settings.model
    };

    if (!hasApiTarget) {
      setQueue((current) => [
        {
          ...baseJob,
          status: "draft",
          detail: "Studio prepared this job, but no WhisperX API is configured yet."
        },
        ...current
      ]);
      setBanner("Job saved as a draft. Add VITE_WHISPERX_API_URL to submit it to a backend.");
      return;
    }

    setQueue((current) => [
      {
        ...baseJob,
          status: "sending",
          detail: `Posting to ${submitUrl}`
      },
      ...current
    ]);

    const payload = new FormData();
    payload.append("file", selectedFile);
    payload.append("language", settings.language);
    payload.append("model", settings.model);
    payload.append("device", settings.device);
    payload.append("diarize", String(settings.diarize));
    payload.append("alignment", String(settings.alignment));
    payload.append("output", settings.output);

    try {
      const response = await fetch(submitUrl, {
        method: "POST",
        body: payload
      });

      const text = await response.text();
      const detail = text || `HTTP ${response.status}`;

      setQueue((current) =>
        current.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: response.ok ? "submitted" : "failed",
                detail
              }
            : job
        )
      );

      setBanner(response.ok ? "Job submitted to the WhisperX API." : "The WhisperX API rejected the job.");
    } catch (error) {
      setQueue((current) =>
        current.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: "failed",
                detail: error instanceof Error ? error.message : "Unknown network error"
              }
            : job
        )
      );
      setBanner("The portal could not reach the WhisperX API.");
    }
  }

  return (
    <div className="whisperx-studio">
      <div className="whisperx-studio__hero">
        <div>
          <span className={`whisperx-chip ${hasApiTarget ? "is-online" : "is-offline"}`}>
            {hasApiTarget ? "API target set" : "UI only"}
          </span>
          <h4>WhisperX Studio</h4>
          <p>
            Upload a recording, choose a transcription preset, and queue a job from the portal.
            When a backend is connected, this panel can post the file directly.
          </p>
        </div>

        <div className="whisperx-endpoint">
          <span className="meta-label">API target</span>
          <span className="meta-value mono">{apiBase || "Set VITE_WHISPERX_API_URL to enable submission"}</span>
        </div>
      </div>

      <div className="whisperx-preset-row">
        {Object.entries(presets).map(([key, preset]) => (
          <button
            key={key}
            className="preset-chip"
            type="button"
            onClick={() => applyPreset(key)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form className="whisperx-grid" onSubmit={handleSubmit}>
        <label
          className={`upload-card ${dragActive ? "is-dragging" : ""}`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            handleFileSelection(event.dataTransfer.files);
          }}
        >
          <input
            className="upload-card__input"
            type="file"
            accept="audio/*,video/*"
            onChange={(event) => handleFileSelection(event.target.files)}
          />
          <span className="meta-label">Input media</span>
          <strong>{selectedFile ? selectedFile.name : "Drop audio or video here"}</strong>
          <span className="card-note">
            {selectedFile
              ? `${formatBytes(selectedFile.size)} | ${selectedFile.type || "Unknown media type"}`
              : "Supports interviews, podcasts, lectures, voice notes, and video clips."}
          </span>
        </label>

        <div className="studio-card">
          <span className="meta-label">Transcription settings</span>
          <div className="studio-fields">
            <label>
              <span>Language</span>
              <select value={settings.language} onChange={(event) => updateSetting("language", event.target.value)}>
                <option value="auto">Auto detect</option>
                <option value="en">English</option>
                <option value="ms">Malay</option>
                <option value="zh">Chinese</option>
              </select>
            </label>

            <label>
              <span>Model</span>
              <select value={settings.model} onChange={(event) => updateSetting("model", event.target.value)}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large-v3">Large v3</option>
              </select>
            </label>

            <label>
              <span>Device</span>
              <select value={settings.device} onChange={(event) => updateSetting("device", event.target.value)}>
                <option value="auto">Auto</option>
                <option value="cuda">GPU</option>
                <option value="cpu">CPU</option>
              </select>
            </label>

            <label>
              <span>Output</span>
              <select value={settings.output} onChange={(event) => updateSetting("output", event.target.value)}>
                <option value="srt">SRT</option>
                <option value="vtt">VTT</option>
                <option value="txt">Plain text</option>
                <option value="json">JSON</option>
              </select>
            </label>
          </div>

          <div className="studio-toggles">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={settings.diarize}
                onChange={(event) => updateSetting("diarize", event.target.checked)}
              />
              <span>Enable speaker diarization</span>
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={settings.alignment}
                onChange={(event) => updateSetting("alignment", event.target.checked)}
              />
              <span>Keep word alignment enabled</span>
            </label>
          </div>
        </div>

        <div className="studio-card">
          <span className="meta-label">Run plan</span>
          <div className="plan-list">
            <div className="plan-item">
              <strong>1. Select source media</strong>
              <span>{selectedFile ? selectedFile.name : "No file selected yet"}</span>
            </div>
            <div className="plan-item">
              <strong>2. Review processing profile</strong>
              <span>{settings.model} on {settings.device} with {settings.output.toUpperCase()} output</span>
            </div>
            <div className="plan-item">
              <strong>3. Submit or save draft</strong>
              <span>{hasApiTarget ? "This will POST to the configured WhisperX API." : "This will save a draft inside the portal only."}</span>
            </div>
          </div>

          <button className="button button--primary whisperx-submit" type="submit">
            {hasApiTarget ? "Submit Transcription Job" : "Save Draft Job"}
          </button>
          {banner ? <p className="whisperx-banner">{banner}</p> : null}
        </div>
      </form>

      <div className="whisperx-lower">
        <div className="studio-card">
          <span className="meta-label">Request preview</span>
          <pre className="code-preview">{requestPreview}</pre>
        </div>

        <div className="studio-card">
          <span className="meta-label">Queue</span>
          {queue.length ? (
            <div className="queue-list">
              {queue.map((job) => (
                <article className="queue-item" key={job.id}>
                  <div className="queue-item__top">
                    <strong>{job.name}</strong>
                    <span className={`queue-status queue-status--${job.status}`}>{job.status}</span>
                  </div>
                  <span className="card-note">{`${job.model} to ${job.output.toUpperCase()}`}</span>
                  <p className="card-note">{job.detail}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="card-note">
              No jobs queued yet. Select a file and submit one from the studio above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WhisperXStudio;
