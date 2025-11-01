from flask import Flask
from keras.layers import TFSMLayer
from groq import Groq
import os
import cloudinary
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")
client = Groq(api_key=GROQ_API_KEY)

model_path = "app/lsm_model3"
model = TFSMLayer("app/lsm_model3", call_endpoint="serving_default")

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