import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, Any

class VisionPipeline:
    def __init__(self):
        try:
            # Initialize MediaPipe Face Mesh for Gaze and Head Pose
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                max_num_faces=1,
                refine_landmarks=True, # Critical for Iris/Gaze tracking
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            
            # Initialize MediaPipe Pose for Body Posture
            self.mp_pose = mp.solutions.pose
            self.pose = self.mp_pose.Pose(
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self.use_dummy = False
        except AttributeError:
            # Handle Windows environments where mediapipe wheels drop the legacy solutions API
            print("Warning: MediaPipe legacy solutions API not found. Using dummy cues for POC testing.")
            self.use_dummy = True

    def process_frame(self, frame: np.ndarray) -> Dict[str, float]:
        """
        Extracts behavioral cues from a single video frame.
        Returns raw scalars per Rule 3 (no composite deception scores).
        """
        if self.use_dummy:
            # Return plausible mock data so the BaselineEngine can be tested
            return {
                "gaze_horizontal_ratio": 0.48 + np.random.normal(0, 0.02),
                "head_pitch": 15.0 + np.random.normal(0, 2.0),
                "shoulder_asymmetry": 0.05 + np.random.normal(0, 0.01)
            }
            
        results_dict = {}
        
        # Convert the BGR image to RGB
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # 1. Process Face Mesh (Gaze, Head Pose)
        face_results = self.face_mesh.process(image_rgb)
        if face_results.multi_face_landmarks:
            landmarks = face_results.multi_face_landmarks[0].landmark
            
            # Simplified Gaze Proxy: Distance between iris center and eye corner
            # Left Eye: 33 (outer corner), 133 (inner corner), 468 (iris center)
            left_eye_width = abs(landmarks[133].x - landmarks[33].x)
            iris_offset = abs(landmarks[468].x - landmarks[33].x)
            gaze_ratio = iris_offset / left_eye_width if left_eye_width > 0 else 0.5
            results_dict["gaze_horizontal_ratio"] = gaze_ratio
            
            # Simplified Head Pose Proxy (Pitch/Yaw)
            nose_tip = landmarks[1]
            chin = landmarks[152]
            head_pitch = nose_tip.y - chin.y # Basic proxy for nod
            results_dict["head_pitch"] = head_pitch

        # 2. Process Body Pose (Postural Shifts)
        pose_results = self.pose.process(image_rgb)
        if pose_results.pose_landmarks:
            landmarks = pose_results.pose_landmarks.landmark
            
            # Shoulder asymmetry (proxy for lean/shift)
            left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
            shoulder_tilt = abs(left_shoulder.y - right_shoulder.y)
            results_dict["shoulder_asymmetry"] = shoulder_tilt
            
        return results_dict
