import time
import math
import statistics
from typing import Dict, List, Any

class BaselineEngine:
    def __init__(self, baseline_duration_sec: int = 180):
        # Rule 3: Mandatory baseline window (3-5 minutes)
        self.baseline_duration_sec = baseline_duration_sec
        self.start_time = None
        self.cues: Dict[str, List[float]] = {}
        self.baseline_stats: Dict[str, Dict[str, float]] = {}
        self.is_baseline_complete = False

    def start(self):
        self.start_time = time.time()
        
    def add_data_point(self, cue_name: str, value: float):
        """Records data points during the baseline window."""
        if self.is_baseline_complete:
            return
            
        if self.start_time is None:
            self.start()
            
        # Check if baseline period is over
        if time.time() - self.start_time >= self.baseline_duration_sec:
            self.compute_baseline()
            return
            
        if cue_name not in self.cues:
            self.cues[cue_name] = []
        self.cues[cue_name].append(value)
        
    def compute_baseline(self):
        """Calculates mean and standard deviation for the baseline."""
        for cue, values in self.cues.items():
            if len(values) > 1:
                self.baseline_stats[cue] = {
                    "mean": float(statistics.mean(values)),
                    "std": float(statistics.stdev(values))
                }
            elif len(values) == 1:
                self.baseline_stats[cue] = {"mean": float(values[0]), "std": 0.0}
        self.is_baseline_complete = True
        
    def get_deviation_probability(self, cue_name: str, current_value: float) -> Dict[str, Any]:
        """
        Rule 3: Probabilistic outputs only.
        Calculates deviation from baseline and returns a probability mapping.
        """
        if not self.is_baseline_complete or cue_name not in self.baseline_stats:
            return {"probability": None, "confidence_interval": None, "status": "baselining", "raw": current_value}
            
        mean = self.baseline_stats[cue_name]["mean"]
        std = self.baseline_stats[cue_name]["std"]
        
        if std == 0:
            return {"probability": 0.5, "confidence_interval": [0.45, 0.55], "status": "active", "raw": current_value}
            
        # Z-score represents deviation magnitude
        z_score = abs(current_value - mean) / std
        
        # Convert z-score to a probability (using standard normal CDF)
        # Represents the probability that this reading is an outlier compared to baseline
        prob = 0.5 * (1 + math.erf(z_score / math.sqrt(2)))
        
        return {
            "probability": round(prob, 3),
            "confidence_interval": [round(max(0.0, prob - 0.05), 3), round(min(1.0, prob + 0.05), 3)],
            "status": "active",
            "raw_deviation": round(current_value - mean, 3)
        }
