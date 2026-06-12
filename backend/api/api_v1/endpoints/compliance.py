from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any
from db.database import get_db
from db import models
from core.security import audit_logger, get_inadmissibility_signature

router = APIRouter()

class ConsentRequest(BaseModel):
    subject_id: int
    consent_given: bool
    document_hash: str
    preferred_language: str

@router.post("/consent", status_code=201)
def record_consent(request: ConsentRequest, db: Session = Depends(get_db)) -> Any:
    """
    Records a consent decision. 
    Rule 3: Must capture a written consent record hash before session begins.
    If consent is not given, system must operate in consent-absent fallback mode.
    """
    db_consent = models.ConsentRecord(
        subject_id=request.subject_id,
        consent_given=request.consent_given,
        document_hash=request.document_hash,
        preferred_language=request.preferred_language
    )
    db.add(db_consent)
    db.commit()
    db.refresh(db_consent)

    # Cryptographic Audit Log
    log_entry = audit_logger.create_log_entry(
        event_type="CONSENT_RECORDED",
        user_id="SYSTEM", # Ideally the Officer ID
        data={"consent_id": db_consent.id, "granted": request.consent_given}
    )
    
    db_log = models.AuditLog(**log_entry)
    db.add(db_log)
    db.commit()

    return {"message": "Consent recorded successfully", "consent_id": db_consent.id, "fallback_mode": not request.consent_given}

class ExportRequest(BaseModel):
    session_id: int
    requesting_officer_id: int
    authorizing_officer_id: int # H.3: Two-officer rule for export
    data_payload: str

@router.post("/export")
def export_artifact(request: ExportRequest, db: Session = Depends(get_db)) -> Any:
    """
    Exports data with the mandatory inadmissibility tag and signature.
    Strictly enforces H.3: Two-officer rule for export to portable media.
    """
    if request.requesting_officer_id == request.authorizing_officer_id:
        raise HTTPException(status_code=403, detail="Two distinct officers are required for export authorization.")

    # Fetch session to verify it exists
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    signed_data = get_inadmissibility_signature(request.data_payload)
    
    # Audit log the export with both officers
    log_entry = audit_logger.create_log_entry(
        event_type="ARTIFACT_EXPORTED",
        user_id=str(request.requesting_officer_id), 
        data={
            "session_id": request.session_id, 
            "authorizing_officer_id": request.authorizing_officer_id,
            "signature": signed_data["signature"]
        }
    )
    db_log = models.AuditLog(**log_entry)
    db.add(db_log)
    db.commit()

    return signed_data

class EraseRequest(BaseModel):
    session_id: int
    officer_id: int

@router.post("/erase_session")
def cryptographic_erasure(request: EraseRequest, db: Session = Depends(get_db)) -> Any:
    """
    H.4 Retention and erasure: Cryptographic erasure support for closed cases.
    Destroys the session_key rendering the encrypted artifact unrecoverable.
    """
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Destroy the key
    session.session_key = "DESTROYED_CRYPTOGRAPHICALLY"
    
    log_entry = audit_logger.create_log_entry(
        event_type="CRYPTOGRAPHIC_ERASURE",
        user_id=str(request.officer_id),
        data={"session_id": request.session_id}
    )
    db_log = models.AuditLog(**log_entry)
    
    db.add(db_log)
    db.commit()
    
    return {"message": "Session artifacts cryptographically erased."}
