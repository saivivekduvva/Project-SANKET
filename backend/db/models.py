from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db.database import Base
import datetime

class Officer(Base):
    __tablename__ = "officers"
    id = Column(Integer, primary_key=True, index=True)
    badge_number = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String)

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    pseudonym = Column(String) # Explicitly not using real names for privacy if possible
    # DPDP Act: Subject rights & metadata
    data_retention_until = Column(DateTime)
    
class ConsentRecord(Base):
    __tablename__ = "consent_records"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    consent_given = Column(Boolean, default=False)
    document_hash = Column(String) # Hash of the signed consent form or thumb impression
    preferred_language = Column(String)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(Integer, primary_key=True, index=True)
    officer_id = Column(Integer, ForeignKey("officers.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    consent_id = Column(Integer, ForeignKey("consent_records.id"))
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    session_key = Column(String) 
    fallback_mode_active = Column(Boolean, default=False)
    vulnerability_triggered = Column(Boolean, default=False)
    
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String)
    event_type = Column(String)
    user_id = Column(String)
    payload = Column(Text)
    previous_hash = Column(String)
    hash = Column(String, unique=True, index=True)
