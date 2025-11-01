from flask import Flask
import tensorflow as tf
from groq import Groq
import os
import cloudinary
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")
client = Groq(api_key=GROQ_API_KEY)

# Load the SavedModel
model_path = "app/lsm_model3"
loaded_model = tf.saved_model.load(model_path)

# Create a callable wrapper that mimics TFSMLayer behavior
# This allows the model to be called directly like model(input_tensor)
class SavedModelWrapper:
    def __init__(self, saved_model, signature_name="serving_default"):
        self._model = saved_model
        self._signature_name = signature_name
        # Try to get the signature, or use the model directly
        if hasattr(saved_model, 'signatures') and signature_name in saved_model.signatures:
            self._call_fn = saved_model.signatures[signature_name]
        elif hasattr(saved_model, signature_name):
            self._call_fn = getattr(saved_model, signature_name)
        else:
            # Fallback: use the model directly if it's callable
            self._call_fn = saved_model
    
    def __call__(self, inputs):
        """Make the wrapper callable like TFSMLayer"""
        if callable(self._call_fn):
            return self._call_fn(inputs)
        return self._model(inputs)

model = SavedModelWrapper(loaded_model, "serving_default")

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
if not all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]):
    raise ValueError("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables are required")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = "123"

    from .audio_bp import audio_bp
    app.register_blueprint(audio_bp, url_prefix='/api')

    return app