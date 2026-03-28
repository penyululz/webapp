import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import whisperx
from whisperx.diarize import DiarizationPipeline


APP = FastAPI(title="WhisperX Local API", version="1.0.0")
APP.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app = APP

OUTPUT_DIR = Path(os.environ.get("WHISPERX_OUTPUT_DIR", "/app/outputs"))
MODEL_DIR = Path(os.environ.get("WHISPERX_MODEL_DIR", "/app/models"))
DEFAULT_DEVICE = os.environ.get("WHISPERX_DEVICE", "cpu")
DEFAULT_COMPUTE_TYPE = os.environ.get("WHISPERX_COMPUTE_TYPE", "int8")
DEFAULT_MODEL = os.environ.get("WHISPERX_DEFAULT_MODEL", "small")
HF_TOKEN = os.environ.get("WHISPERX_HF_TOKEN", "").strip()

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_CACHE: dict[tuple[str, str, str], Any] = {}
ALIGN_CACHE: dict[tuple[str, str], tuple[Any, Any]] = {}


def subtitle_timestamp(seconds: float, for_vtt: bool) -> str:
    total_milliseconds = max(0, int(round(seconds * 1000)))
    hours, remainder = divmod(total_milliseconds, 3600000)
    minutes, remainder = divmod(remainder, 60000)
    secs, milliseconds = divmod(remainder, 1000)
    separator = "." if for_vtt else ","
    return f"{hours:02}:{minutes:02}:{secs:02}{separator}{milliseconds:03}"


def render_subtitle(segments: list[dict[str, Any]], fmt: str) -> str:
    is_vtt = fmt == "vtt"
    lines = ["WEBVTT", ""] if is_vtt else []

    for index, segment in enumerate(segments, start=1):
        start = subtitle_timestamp(float(segment.get("start", 0)), is_vtt)
        end = subtitle_timestamp(float(segment.get("end", 0)), is_vtt)
        text = str(segment.get("text", "")).strip()

        if not is_vtt:
            lines.append(str(index))
        lines.append(f"{start} --> {end}")
        lines.append(text)
        lines.append("")

    return "\n".join(lines).strip() + "\n"


def flatten_text(segments: list[dict[str, Any]]) -> str:
    return "\n".join(str(segment.get("text", "")).strip() for segment in segments if segment.get("text"))


def get_model(model_name: str, device: str, compute_type: str):
    key = (model_name, device, compute_type)
    if key not in MODEL_CACHE:
        MODEL_CACHE[key] = whisperx.load_model(
            model_name,
            device,
            compute_type=compute_type,
            download_root=str(MODEL_DIR),
        )
    return MODEL_CACHE[key]


def get_align_model(language_code: str, device: str):
    key = (language_code, device)
    if key not in ALIGN_CACHE:
        ALIGN_CACHE[key] = whisperx.load_align_model(language_code=language_code, device=device)
    return ALIGN_CACHE[key]


@APP.get("/")
def root() -> dict[str, Any]:
    return {
        "name": "WhisperX Local API",
        "status": "ok",
        "device": DEFAULT_DEVICE,
        "computeType": DEFAULT_COMPUTE_TYPE,
        "defaultModel": DEFAULT_MODEL,
        "docs": "/docs",
    }


@APP.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@APP.post("/transcriptions")
async def create_transcription(
    file: UploadFile = File(...),
    language: str = Form("auto"),
    model: str = Form(DEFAULT_MODEL),
    device: str = Form(DEFAULT_DEVICE),
    diarize: bool = Form(False),
    alignment: bool = Form(True),
    output: str = Form("srt"),
) -> dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing uploaded file name.")

    suffix = Path(file.filename).suffix or ".bin"
    created_at = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    job_slug = Path(file.filename).stem.replace(" ", "-")
    output_stem = f"{job_slug}-{created_at}"
    request_device = DEFAULT_DEVICE if device in {"", "auto"} else device
    compute_type = DEFAULT_COMPUTE_TYPE

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_path = Path(temp_file.name)
        temp_file.write(await file.read())

    try:
        audio = whisperx.load_audio(str(temp_path))
        whisper_model = get_model(model or DEFAULT_MODEL, request_device, compute_type)

        transcribe_options: dict[str, Any] = {}
        if language and language != "auto":
            transcribe_options["language"] = language

        result = whisper_model.transcribe(audio, batch_size=4, **transcribe_options)

        if alignment:
            align_model, metadata = get_align_model(result["language"], request_device)
            result = whisperx.align(
                result["segments"],
                align_model,
                metadata,
                audio,
                request_device,
                return_char_alignments=False,
            )
        else:
            result = {
                "segments": result["segments"],
                "language": result["language"],
            }

        warnings: list[str] = []
        if diarize:
            if not HF_TOKEN:
                warnings.append("Diarization requested, but WHISPERX_HF_TOKEN is not configured.")
            else:
                diarize_model = DiarizationPipeline(token=HF_TOKEN, device=request_device)
                diarize_segments = diarize_model(audio)
                result = whisperx.assign_word_speakers(diarize_segments, result)

        segments = result["segments"]
        output_format = output.lower()
        output_path = OUTPUT_DIR / f"{output_stem}.{output_format}"

        if output_format == "json":
            output_text = json.dumps(result, indent=2)
        elif output_format == "txt":
            output_text = flatten_text(segments)
        elif output_format in {"srt", "vtt"}:
            output_text = render_subtitle(segments, output_format)
        else:
            raise HTTPException(status_code=400, detail="Unsupported output format.")

        output_path.write_text(output_text, encoding="utf-8")

        return {
            "status": "ok",
            "fileName": file.filename,
            "language": result.get("language"),
            "segments": segments,
            "outputFormat": output_format,
            "outputFile": str(output_path),
            "warnings": warnings,
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    finally:
        if temp_path.exists():
            temp_path.unlink()


@APP.get("/outputs/{file_name}", response_class=PlainTextResponse)
def read_output(file_name: str) -> str:
    file_path = OUTPUT_DIR / file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Output file not found.")
    return file_path.read_text(encoding="utf-8")
