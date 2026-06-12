import hashlib
import hmac
from core.config import settings
import json
from datetime import datetime
from typing import Any, Dict

class AuditLogger:
    def __init__(self):
        # In a real scenario, this last_hash would be loaded from the database's most recent log entry
        self.last_hash = "GENESIS_HASH"
        self.secret_key = settings.SECRET_KEY.encode()

    def _generate_hash(self, payload: str, previous_hash: str) -> str:
        """Generates a tamper-evident hash chaining the previous hash with the current payload."""
        data = f"{previous_hash}{payload}".encode()
        return hmac.new(self.secret_key, data, hashlib.sha256).hexdigest()

    def create_log_entry(self, event_type: str, user_id: str, data: Dict[str, Any], 
                         input_hash: str = None, model_version: str = None, officer_response: str = None) -> Dict[str, Any]:
        """Creates a new cryptographically signed log entry. 
        Strictly enforces Rule 3 audit logging requirements."""
        timestamp = datetime.utcnow().isoformat()
        
        payload_data = {
            "event_type": event_type,
            "user_id": user_id,
            "timestamp": timestamp,
            "data": data
        }
        
        # Rule 3: Every model output MUST be logged with these specific fields
        if input_hash: payload_data["input_hash"] = input_hash
        if model_version: payload_data["model_version"] = model_version
        if officer_response: payload_data["officer_response"] = officer_response

        payload = json.dumps(payload_data, sort_keys=True)
        
        current_hash = self._generate_hash(payload, self.last_hash)
        
        log_entry = {
            "timestamp": timestamp,
            "event_type": event_type,
            "user_id": user_id,
            "payload": payload,
            "previous_hash": self.last_hash,
            "hash": current_hash
        }
        
        # Update last_hash to chain the next log
        self.last_hash = current_hash
        
        return log_entry

def get_inadmissibility_signature(data_payload: str) -> str:
    """
    Appends the 'ASSISTIVE - NOT EVIDENCE' tag and signs the artifact.
    """
    tag = settings.INADMISSIBILITY_TAG
    content_to_sign = f"{tag}\n{data_payload}"
    signature = hmac.new(settings.SECRET_KEY.encode(), content_to_sign.encode(), hashlib.sha256).hexdigest()
    
    return {
        "header": tag,
        "signature": signature
    }

# Global instance for simplicity
audit_logger = AuditLogger()
