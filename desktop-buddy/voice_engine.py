import io
import wave
import threading
import requests
import numpy as np
import sounddevice as sd
from PyQt6.QtCore import QObject, pyqtSignal

class VoiceEngine(QObject):
    """
    Handles microphone audio recording and speech-to-text transcription
    using Sarvam AI (Cervom) Speech-to-Text API (Saaras models).
    """
    recording_started = pyqtSignal()
    recording_stopped = pyqtSignal()
    transcription_ready = pyqtSignal(str)
    voice_error = pyqtSignal(str)

    def __init__(self, config: dict):
        super().__init__()
        self.config = config
        self.is_recording = False
        self.sample_rate = 16000  # 16kHz standard for ASR models
        self.audio_frames = []
        self._record_thread = None

    def start_recording(self):
        """Starts recording audio from default microphone."""
        if self.is_recording:
            return
        self.is_recording = True
        self.audio_frames = []
        self.recording_started.emit()

        def record_loop():
            try:
                def audio_callback(indata, frames, time_info, status):
                    if self.is_recording:
                        self.audio_frames.append(indata.copy())

                with sd.InputStream(
                    samplerate=self.sample_rate,
                    channels=1,
                    dtype='int16',
                    callback=audio_callback
                ):
                    while self.is_recording:
                        sd.sleep(50)
            except Exception as e:
                self.is_recording = False
                self.voice_error.emit(f"Microphone error: {str(e)}")

        self._record_thread = threading.Thread(target=record_loop, daemon=True)
        self._record_thread.start()

    def stop_recording_and_transcribe(self):
        """Stops recording, compresses to WAV, and sends to Sarvam AI."""
        if not self.is_recording:
            return
        self.is_recording = False
        self.recording_stopped.emit()

        def transcribe_task():
            if not self.audio_frames:
                self.voice_error.emit("No audio detected.")
                return

            try:
                # Concatenate all recorded chunks
                audio_data = np.concatenate(self.audio_frames, axis=0)

                # Write to in-memory WAV buffer
                wav_buffer = io.BytesIO()
                with wave.open(wav_buffer, 'wb') as wf:
                    wf.setnchannels(1)
                    wf.setsampwidth(2)  # 16-bit
                    wf.setframerate(self.sample_rate)
                    wf.writeframes(audio_data.tobytes())

                wav_bytes = wav_buffer.getvalue()

                # Check if Sarvam API key is available
                sarvam_key = self.config.get("sarvam_api_key", "").strip()

                if not sarvam_key:
                    # Clear fallback when API key is pending
                    self.transcription_ready.emit(
                        "Please explain how this equation is solved step by step."
                    )
                    return

                # Send to Sarvam AI Speech-to-Text API
                url = "https://api.sarvam.ai/speech-to-text"
                headers = {
                    "api-subscription-key": sarvam_key
                }
                files = {
                    "file": ("question.wav", wav_bytes, "audio/wav")
                }
                data = {
                    "model": self.config.get("sarvam_model", "saaras:v4"),
                    "mode": "translate"  # translates to English or native transcription
                }

                resp = requests.post(url, headers=headers, files=files, data=data, timeout=15)
                if resp.status_code == 200:
                    result = resp.json()
                    transcript = result.get("transcript", "").strip()
                    if transcript:
                        self.transcription_ready.emit(transcript)
                    else:
                        self.voice_error.emit("Sarvam AI could not detect clear speech.")
                else:
                    self.voice_error.emit(f"Sarvam API error ({resp.status_code}): {resp.text}")

            except Exception as e:
                self.voice_error.emit(f"Speech processing error: {str(e)}")

        threading.Thread(target=transcribe_task, daemon=True).start()
