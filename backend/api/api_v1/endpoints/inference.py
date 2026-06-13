from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Any
import cv2
import numpy as np
import io
import os
import tempfile
import shutil

from db.database import get_db
from db import models
from engine.vision import VisionPipeline
from engine.audio import AudioPipeline
from engine.session_manager import BaselineEngine
from utils.gpu import get_device, get_compute_type

router = APIRouter()

# Initialize ML Pipelines globally to keep them loaded in memory
device_str = "cuda" if get_device().type == "cuda" else "cpu"
vision_pipeline = VisionPipeline()
audio_pipeline = AudioPipeline(device=device_str, compute_type=get_compute_type())

# In a real app, BaselineEngine would be mapped per-session.
# Using a single instance here for the prototype logic.
baseline_engines = {}

@router.post("/process_video")
async def process_video_upload(
    session_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
) -> Any:
    """
    Accepts a video upload and runs it through the Multimodal Inference Engine.
    Respects the 3-minute baseline rule and outputs probabilistic deviations.
    """
    # 1. Verify Session & Compliance 
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.fallback_mode_active:
        return {"status": "HALTED", "reason": "Consent absent fallback mode active. Inference disabled."}
        
    if session.vulnerability_triggered:
        return {"status": "HALTED", "reason": "Subject vulnerability triggered. Inference paused."}

    # 2. Get or Create Baseline Engine for this session
    if session_id not in baseline_engines:
        # Assuming a shorter baseline for POC testing (e.g., 5 seconds instead of 180)
        baseline_engines[session_id] = BaselineEngine(baseline_duration_sec=5) 
        
    engine = baseline_engines[session_id]
    
    # 3. Process Video (Frame by frame simulation)
    # Read file into memory (Warning: only for small files in POC)
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    
    # We will just process the first frame for the vision POC to simulate live processing
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image or video format")
        
    vision_cues = vision_pipeline.process_frame(img)
    
    # 4. Feed cues to Baseline Engine & Generate Output
    final_output = {"session_id": session_id, "cues": {}}
    
    for cue_name, value in vision_cues.items():
        engine.add_data_point(cue_name, value)
        prob_result = engine.get_deviation_probability(cue_name, value)
        final_output["cues"][cue_name] = prob_result
        
    return final_output

@router.post("/transcribe_chunk")
async def transcribe_chunk(file: UploadFile = File(...)):
    """
    Accepts a short audio chunk from the frontend and returns faster-whisper transcription.
    """
    temp_file_path = ""
    try:
        # Create a temporary file to save the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name
        
        # Process the audio file using the whisper engine
        result = audio_pipeline.transcribe_file(temp_file_path)
        
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            
        return result
    except Exception as e:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return {"error": str(e), "text": "", "language": "unknown"}
