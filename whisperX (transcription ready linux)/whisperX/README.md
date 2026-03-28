# WhisperX Local API

This folder now contains a Dockerized WhisperX API for the portal's built-in WhisperX Studio.

Local endpoints:

- API root: `http://localhost:3020`
- Health: `http://localhost:3020/health`
- Swagger docs: `http://localhost:3020/docs`

Notes:

- The default setup runs on CPU with `int8` compute for compatibility.
- Speaker diarization needs a Hugging Face read token in `WHISPERX_HF_TOKEN`.
- Transcription outputs are written to the local `outputs` folder.
