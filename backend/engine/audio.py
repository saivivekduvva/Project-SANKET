from faster_whisper import WhisperModel
import librosa
import numpy as np
from typing import Dict, Any

class AudioPipeline:
    def __init__(self, device: str = "cpu", compute_type: str = "int8"):
        """
        Initializes the faster-whisper ASR model. 
        Using 'small' model per user request to optimize for <=500ms latency on edge hardware.
        """
        # Note: If CUDA is available, we pass device="cuda", compute_type="float16" from gpu.py
        self.model = WhisperModel("small", device=device, compute_type=compute_type)

    def process_audio_chunk(self, audio_data: np.ndarray, sample_rate: int = 16000) -> Dict[str, Any]:
        """
        Processes a raw audio chunk to extract transcript and vocal features.
        """
        results = {}
        
        # 1. ASR (Whisper) - Track 2
        # Use beam_size=1 for greedy decoding to minimize latency
        segments, info = self.model.transcribe(audio_data, beam_size=1)
        transcript = " ".join([segment.text for segment in segments])
        
        results["transcript"] = transcript
        results["language"] = info.language
        results["language_probability"] = info.language_probability
        
        # 2. Vocal Features (Librosa) - Track 1/Acoustic
        # Extract fundamental frequency (F0) as a proxy for pitch/arousal
        # This requires float32 data
        if audio_data.dtype != np.float32:
            audio_data = audio_data.astype(np.float32)
            
        f0, voiced_flag, voiced_probs = librosa.pyin(
            audio_data, 
            fmin=librosa.note_to_hz('C2'), 
            fmax=librosa.note_to_hz('C7'),
            sr=sample_rate
        )
        
        # Calculate mean pitch if voiced segments exist
        valid_f0 = f0[voiced_flag]
        if len(valid_f0) > 0:
            results["mean_pitch_hz"] = float(np.nanmean(valid_f0))
        else:
            results["mean_pitch_hz"] = 0.0
            
        return results
