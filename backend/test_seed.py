import os
from db.database import engine
from db import models
from sqlalchemy.orm import sessionmaker

def seed():
    # 1. Recreate DB to apply new schema changes (roles, session_key, etc.)
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    # 2. Seed Data
    officer = models.Officer(badge_number="IO-1234", name="Test Officer", role="IO")
    subject = models.Subject(pseudonym="Subject A")
    db.add(officer)
    db.add(subject)
    db.commit()

    consent = models.ConsentRecord(
        subject_id=subject.id, 
        consent_given=True, 
        document_hash="dummy_signed_hash_8f9c", 
        preferred_language="English"
    )
    db.add(consent)
    db.commit()

    session = models.InterviewSession(
        officer_id=officer.id, 
        subject_id=subject.id, 
        consent_id=consent.id, 
        session_key="simulated_tpm_key_abc123",
        fallback_mode_active=False, # We gave consent
        vulnerability_triggered=False # Subject is fine
    )
    db.add(session)
    db.commit()

    print(f"Database Successfully Re-seeded!")
    print(f"----> USE session_id={session.id} FOR YOUR TESTS <----")
    db.close()

if __name__ == "__main__":
    seed()
