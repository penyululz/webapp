const whisperxUrl = import.meta.env.VITE_WHISPERX_URL || "http://localhost:3030";

if (window.location.href !== whisperxUrl) {
  window.location.replace(whisperxUrl);
}
