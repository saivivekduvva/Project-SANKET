import torch

def get_device() -> torch.device:
    """
    Detects if a CUDA-enabled GPU is available and returns the appropriate device.
    Falls back to CPU if unavailable.
    """
    if torch.cuda.is_available():
        print(f"CUDA is available. Using GPU: {torch.cuda.get_device_name(0)}")
        return torch.device("cuda")
    else:
        print("CUDA is not available. Falling back to CPU.")
        return torch.device("cpu")

def get_compute_type() -> str:
    """
    Returns the optimal compute type based on hardware availability.
    """
    if torch.cuda.is_available():
        return "float16" # Optimal for RTX 4050
    return "int8" # Better for CPU
