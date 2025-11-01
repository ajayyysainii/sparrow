import os
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
# Set matplotlib backend before importing pyplot to avoid GUI warnings
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import librosa.display
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
import librosa
from fpdf import FPDF
from groq import Groq
from groq import AuthenticationError, APIStatusError, APIConnectionError
import re
import json
from datetime import datetime
from app import client, model

label_mapping = {
    0: "Healthy",
    1: "Laryngitis",
    2: "Vocal Polyp"
}

vggish_model_url = "https://tfhub.dev/google/vggish/1"
try:
    print("Loading VGGish model...")
    vggish_model = hub.load(vggish_model_url)
    print("VGGish model loaded successfully")
except Exception as e:
    print(f"Warning: Error loading VGGish model: {e}")
    vggish_model = None

def extract_audio_features(file_path, max_length=128):
    """Extract VGGish embeddings with proper resampling to 16kHz"""
    try:
        if vggish_model is None:
            raise RuntimeError("VGGish model is not loaded. Please check model initialization.")
        
        print("1 - Reading file")
        # Load audio at 16kHz (VGGish requirement)
        y, sr = librosa.load(file_path, sr=16000, mono=True)
        print(f"2 - Loaded audio: sample_rate={sr}, duration={len(y)/sr:.2f}s")
        
        # Normalize to [-1, 1] range
        max_val = np.max(np.abs(y))
        if max_val > 0:
            y = y / max_val
        print("3 - Normalized waveform")
        
        # Convert to tensorflow tensor
        waveform = tf.constant(y, dtype=tf.float32)
        print(f"4 - Converted to tensor with shape: {waveform.shape}")
        
        print("5 - Passing to VGGish model...")
        print("5.1 - Ensuring TensorFlow eager execution is enabled...")
        # Ensure we're in eager execution mode
        if not tf.executing_eagerly():
            tf.config.run_functions_eagerly(True)
        
        # VGGish model from TF Hub can accept raw waveforms
        # It processes them internally. We need to ensure proper shape and execution
        print("5.2 - Calling VGGish model with waveform...")
        
        # Ensure waveform is a proper tensor
        waveform = tf.cast(waveform, tf.float32)
        
        # VGGish typically expects waveforms without batch dimension for direct call
        # But some versions may require batch dimension - we'll try both
        embeddings = None
        error_msgs = []
        
        # Method 1: Try direct call (most common for TF Hub models)
        try:
            print("5.3a - Attempting direct model call...")
            embeddings = vggish_model(waveform)
            print(f"6a - Direct call succeeded! Embeddings shape: {embeddings.shape}")
        except Exception as e1:
            error_msg1 = str(e1)
            error_msgs.append(f"Direct call: {error_msg1}")
            print(f"6b - Direct call failed: {error_msg1[:200]}...")
            
            # Method 2: Try with batch dimension
            try:
                print("5.3b - Attempting call with batch dimension...")
                waveform_batch = tf.expand_dims(waveform, axis=0)
                embeddings = vggish_model(waveform_batch)
                print(f"6c - Batch call succeeded! Embeddings shape: {embeddings.shape}")
            except Exception as e2:
                error_msg2 = str(e2)
                error_msgs.append(f"Batch call: {error_msg2}")
                print(f"6d - Batch call failed: {error_msg2[:200]}...")
                
                # Method 3: Try using signatures
                try:
                    print("5.3c - Attempting signature call...")
                    if hasattr(vggish_model, 'signatures') and vggish_model.signatures:
                        signature_name = list(vggish_model.signatures.keys())[0]
                        signature = vggish_model.signatures[signature_name]
                        embeddings = signature(waveform=waveform)
                        print(f"6e - Signature call succeeded! Embeddings shape: {embeddings.shape}")
                    else:
                        raise ValueError("No signatures available")
                except Exception as e3:
                    error_msg3 = str(e3)
                    error_msgs.append(f"Signature call: {error_msg3}")
                    print(f"6f - Signature call failed: {error_msg3[:200]}...")
                    raise RuntimeError(f"All VGGish model call methods failed:\n" + "\n".join(error_msgs[:3]))
        
        if embeddings is None:
            raise RuntimeError("Failed to get embeddings from VGGish model - embeddings is None")
        
        # Convert to numpy if needed
        if isinstance(embeddings, dict):
            # If it returns a dict, get the embeddings value
            embeddings = embeddings.get('embedding', embeddings.get('output', 
                          embeddings.get('audio_embedding', list(embeddings.values())[0])))
        
        # Ensure we have a tensor
        if not isinstance(embeddings, tf.Tensor):
            embeddings = tf.constant(embeddings, dtype=tf.float32)
        
        print(f"7 - Final embeddings shape: {embeddings.shape}")
        
        # Remove batch dimension if present (we want [time, features])
        if len(embeddings.shape) == 3:  # (batch, time, features)
            embeddings = tf.squeeze(embeddings, axis=0)  # Remove batch: (time, features)
        elif len(embeddings.shape) == 1:  # If it's 1D, something went wrong
            raise ValueError(f"Unexpected 1D embeddings shape: {embeddings.shape}")
        
        embeddings = embeddings.numpy() if hasattr(embeddings, 'numpy') else np.array(embeddings)
        print(f"8 - Embeddings as numpy, shape: {embeddings.shape}")

        # Pad or truncate to max_length
        if embeddings.shape[0] < max_length:
            pad_width = max_length - embeddings.shape[0]
            embeddings = np.pad(embeddings, ((0, pad_width), (0, 0)), mode='constant', constant_values=0)
        elif embeddings.shape[0] > max_length:
            embeddings = embeddings[:max_length, :]

        print("9 - Embeddings prepared, final shape:", embeddings.shape)
        return embeddings
    except Exception as e:
        print(f"Error extracting audio features: {e}")
        import traceback
        traceback.print_exc()
        raise

def calculate_jitter(f0):
    """Calculate actual jitter from pitch periods"""
    # Remove NaN values
    valid_f0 = f0[~np.isnan(f0)]
    
    if len(valid_f0) < 2:
        return 0.0
    
    # Convert frequency to periods
    periods = 1.0 / valid_f0
    
    # Calculate period-to-period differences
    period_diffs = np.abs(np.diff(periods))
    
    # Jitter is the average period-to-period difference divided by average period
    jitter_percent = (np.mean(period_diffs) / np.mean(periods)) * 100
    
    return jitter_percent

def calculate_shimmer(y, sr, f0):
    """Calculate actual shimmer from amplitude variations"""
    valid_f0 = f0[~np.isnan(f0)]
    
    if len(valid_f0) < 2:
        return 0.0
    
    # Get amplitude envelope
    amplitude_envelope = np.abs(librosa.effects.harmonic(y))
    
    # Calculate frame-to-frame amplitude differences
    amp_diffs = np.abs(np.diff(amplitude_envelope))
    
    # Shimmer is the average amplitude difference divided by average amplitude
    shimmer_percent = (np.mean(amp_diffs) / np.mean(amplitude_envelope)) * 100
    
    return shimmer_percent

def calculate_hnr(y, sr, f0):
    """Calculate Harmonic-to-Noise Ratio"""
    try:
        # Separate harmonic and percussive components
        harmonic, percussive = librosa.effects.hpss(y)
        
        # Calculate power of harmonic and noise (percussive) components
        harmonic_power = np.sum(harmonic ** 2)
        noise_power = np.sum(percussive ** 2)
        
        if noise_power == 0:
            return 20.0  # High HNR if no noise detected
        
        # HNR in dB
        hnr_db = 10 * np.log10(harmonic_power / noise_power)
        
        return max(0, min(30, hnr_db))  # Clip to reasonable range
    except:
        return 10.0  # Default moderate value

def estimate_formants(y, sr, n_formants=3):
    """Estimate formant frequencies using LPC"""
    try:
        # Pre-emphasis filter
        pre_emphasized = librosa.effects.preemphasis(y)
        
        # LPC order
        order = int(2 + sr / 1000)
        
        # Get LPC coefficients
        a = librosa.lpc(pre_emphasized, order=order)
        
        # Find roots
        roots = np.roots(a)
        roots = roots[np.imag(roots) >= 0]
        
        # Convert to Hz
        angles = np.arctan2(np.imag(roots), np.real(roots))
        freqs = sorted(angles * (sr / (2 * np.pi)))
        
        # Return first formant
        formants = [f for f in freqs if 50 < f < sr/2][:n_formants]
        
        if len(formants) > 0:
            return formants[0]
        else:
            return 500.0
    except:
        return 500.0

def extract_advanced_features(audio_path):
    """Extract acoustic features with corrected calculations"""
    try:
        # Load audio at 16kHz for consistency
        y, sr = librosa.load(audio_path, sr=16000)

        # Enhanced MFCC features
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = mfcc.mean(axis=1)
        mfcc_std = mfcc.std(axis=1)

        # Enhanced pitch features
        f0, voiced_flag, voiced_probs = librosa.pyin(
            y,
            fmin=librosa.note_to_hz('C2'),
            fmax=librosa.note_to_hz('C7')
        )
        
        # Handle NaN values
        f0_clean = f0[~np.isnan(f0)]
        f0_mean = np.mean(f0_clean) if len(f0_clean) > 0 else 0
        f0_std = np.std(f0_clean) if len(f0_clean) > 0 else 0

        # Enhanced spectral features
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
        spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)

        # Enhanced energy features
        rms = librosa.feature.rms(y=y)

        # FIXED: Calculate actual jitter
        jitter = calculate_jitter(f0)

        # FIXED: Calculate actual shimmer
        shimmer = calculate_shimmer(y, sr, f0)

        # FIXED: Calculate actual HNR (not spectral flatness)
        hnr = calculate_hnr(y, sr, f0)

        # FIXED: Proper formant estimation
        formant_freq = estimate_formants(y, sr)

        # FIXED: Safe voice period calculation
        voice_period = 1.0 / f0_mean if f0_mean > 0 and not np.isnan(f0_mean) else 0

        return {
            "MFCC_Mean": mfcc_mean.tolist(),
            "MFCC_Std": mfcc_std.tolist(),
            "Fundamental_Frequency_Mean": float(f0_mean),
            "Fundamental_Frequency_Std": float(f0_std),
            "Spectral_Centroid": float(np.mean(spectral_centroid)),
            "Spectral_Bandwidth": float(np.mean(spectral_bandwidth)),
            "Spectral_Rolloff": float(np.mean(spectral_rolloff)),
            "Spectral_Contrast": float(np.mean(spectral_contrast)),
            "RMS_Energy_Mean": float(np.mean(rms)),
            "RMS_Energy_Std": float(np.std(rms)),
            "Jitter_Percent": float(jitter),
            "Shimmer_Percent": float(shimmer),
            "HNR_dB": float(hnr),  # Changed from Harmonic_Ratio
            "Voice_Period_Mean": float(voice_period),
            "Voiced_Segments_Ratio": float(np.mean(voiced_flag)),
            "Formant_Frequency": float(formant_freq)
        }
    except Exception as e:
        print(f"Error extracting advanced features: {e}")
        raise

def clean_llm_response(text):
    cleaned_text = re.sub(r'<think>.*?</think>\s*', '', text, flags=re.DOTALL)
    cleaned_text = re.sub(r'<[^>]+>', '', cleaned_text)
    cleaned_text = ' '.join(cleaned_text.split())
    return cleaned_text

def generate_fallback_analysis(features, prediction, probabilities):
    """Generate a detailed analysis when API is unavailable"""
    # Determine if values are within normal ranges
    f0_mean = features['Fundamental_Frequency_Mean']
    f0_std = features['Fundamental_Frequency_Std']
    jitter = features['Jitter_Percent']
    shimmer = features['Shimmer_Percent']
    hnr = features['HNR_dB']
    
    # Analyze fundamental frequency
    if 85 <= f0_mean <= 180:
        f0_analysis = "within normal male range"
    elif 165 <= f0_mean <= 255:
        f0_analysis = "within normal female range"
    elif f0_mean < 85:
        f0_analysis = "lower than normal, potentially indicating vocal fold pathology"
    else:
        f0_analysis = "higher than normal, may indicate vocal tension or pathology"
    
    # Analyze jitter
    if jitter <= 1.04:
        jitter_analysis = "within normal limits, indicating stable vocal fold vibration"
    else:
        jitter_analysis = "elevated, suggesting irregular vocal fold vibration pattern"
    
    # Analyze shimmer
    if shimmer <= 3.81:
        shimmer_analysis = "within normal limits, indicating consistent vocal amplitude"
    else:
        shimmer_analysis = "elevated, suggesting amplitude variability in vocal output"
    
    # Analyze HNR
    if hnr >= 12:
        hnr_analysis = "within acceptable range, indicating good harmonic content"
    else:
        hnr_analysis = "reduced, suggesting increased noise component in voice"
    
    # Clinical implications based on prediction
    if prediction == "Healthy":
        implications = "The acoustic measurements suggest a healthy vocal mechanism with parameters within normal physiological ranges."
        recommendations = "Maintain current vocal hygiene practices. Regular monitoring is recommended."
    elif prediction == "Laryngitis":
        implications = "Acoustic analysis indicates signs consistent with laryngeal inflammation, including increased perturbation measures."
        recommendations = "Vocal rest is recommended. Avoid irritants such as smoking or excessive voice use. Consider hydration and humidification. Consult an otolaryngologist for further evaluation."
    else:  # Vocal Polyp
        implications = "Acoustic measurements show significant deviations consistent with structural vocal fold pathology, likely a polyp or nodule."
        recommendations = "Immediate consultation with an otolaryngologist and speech-language pathologist is strongly recommended. Surgical intervention may be necessary. Voice therapy should be considered post-treatment."
    
    report = f"""
VOICE PATHOLOGY MEDICAL REPORT

PATIENT INFORMATION
Analysis Date: {datetime.now().strftime('%Y-%m-%d')}
Predicted Condition: {prediction} (Confidence: {probabilities.get(prediction, 'N/A')})

SUMMARY OF FINDINGS
The acoustic analysis reveals a predicted condition of {prediction} based on comprehensive voice parameter measurements. The analysis indicates {'normal' if prediction == 'Healthy' else 'abnormal'} acoustic characteristics across multiple voice parameters.

ACOUSTIC ANALYSIS

Fundamental Frequency:
- Mean: {f0_mean:.2f} Hz
- Standard Deviation: {f0_std:.2f} Hz
- Clinical Significance: The fundamental frequency is {f0_analysis}. Standard deviation of {f0_std:.2f} Hz indicates {'stable' if f0_std < 10 else 'variable'} pitch stability.

Voice Perturbation Measures:
- Jitter: {jitter:.2f}%
- Shimmer: {shimmer:.2f}%
- HNR: {hnr:.2f} dB
- Clinical Significance: Jitter values are {jitter_analysis}. Shimmer measurements indicate {shimmer_analysis}. The harmonic-to-noise ratio shows {hnr_analysis}.

Additional Measurements:
- Voice Period: {features['Voice_Period_Mean']:.4f} seconds
- Voiced Segments Ratio: {features['Voiced_Segments_Ratio']:.2f}
- Formant Frequency (F1): {features['Formant_Frequency']:.2f} Hz
- Clinical Significance: These measurements provide additional insight into vocal fold function and resonance characteristics.

CLINICAL IMPLICATIONS
{implications}

RECOMMENDATIONS
{recommendations}

NOTE: This analysis is based on automated acoustic measurements and should be interpreted in conjunction with clinical examination by a qualified healthcare professional.
"""
    return report

def generate_medical_report(features, prediction, probabilities):
    prompt = f"""
    Generate a detailed voice pathology medical report with the following format:

    VOICE PATHOLOGY MEDICAL REPORT

    PATIENT INFORMATION
    Analysis Date: {datetime.now().strftime('%Y-%m-%d')}
    Predicted Condition: {prediction} ({probabilities[prediction]})

    SUMMARY OF FINDINGS
    [Provide a concise summary of the main findings and their clinical significance]

    ACOUSTIC ANALYSIS
    Fundamental Frequency:
    - Mean: {features['Fundamental_Frequency_Mean']:.2f} Hz
    - Standard Deviation: {features['Fundamental_Frequency_Std']:.2f} Hz
    - Clinical Significance: [Explain]

    Voice Perturbation Measures:
    - Jitter: {features['Jitter_Percent']:.2f}%
    - Shimmer: {features['Shimmer_Percent']:.2f}%
    - HNR: {features['HNR_dB']:.2f} dB
    - Clinical Significance: [Explain]

    Additional Measurements:
    - Voice Period: {features['Voice_Period_Mean']:.4f} seconds
    - Voiced Segments Ratio: {features['Voiced_Segments_Ratio']:.2f}
    - Formant Frequency (F1): {features['Formant_Frequency']:.2f} Hz
    - Clinical Significance: [Explain]

    CLINICAL IMPLICATIONS
    [Discuss the clinical implications of these findings]

    RECOMMENDATIONS
    [Provide specific recommendations for treatment and follow-up]

    Please format all headers in bold without using asterisks (*). Use clear section breaks and maintain professional medical terminology.
    """

    try:
        completion = client.chat.completions.create(
            model="deepseek-r1-distill-llama-70b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=4096,
        )
        return clean_llm_response(completion.choices[0].message.content)
    except AuthenticationError:
        # API key is invalid or missing
        print("⚠ API authentication failed - using rule-based fallback analysis")
        return generate_fallback_analysis(features, prediction, probabilities)
    except (APIStatusError, APIConnectionError) as e:
        # Other API errors (rate limit, server error, network issues)
        status_code = getattr(e, 'status_code', 'unknown')
        print(f"⚠ API call failed (status: {status_code}) - using rule-based fallback analysis")
        return generate_fallback_analysis(features, prediction, probabilities)
    except Exception as e:
        # Any other unexpected errors
        print(f"⚠ Unexpected error during API call - using rule-based fallback analysis")
        # Optionally log the error for debugging (but don't show it to user)
        # import traceback
        # traceback.print_exc()
        return generate_fallback_analysis(features, prediction, probabilities)

# FIXED: Updated normal ranges
NORMAL_RANGES = {
    'Fundamental_Frequency_Mean': {
        'male': (85, 180),      # Hz
        'female': (165, 255),   # Hz
        'default': (85, 255)    # Hz
    },
    'Fundamental_Frequency_Std': (0, 20),     # Hz
    'Jitter_Percent': (0, 1.04),              # % (corrected based on actual jitter)
    'Shimmer_Percent': (0, 3.81),             # %
    'HNR_dB': (12, 30),                       # dB (corrected for actual HNR)
    'Voice_Period_Mean': (0.004, 0.012),      # seconds (expanded range)
    'Voiced_Segments_Ratio': (0.4, 0.8),      
    'Formant_Frequency': (400, 1000)          # Hz (F1 range)
}

def get_parameter_key(display_name):
    """Convert display name to parameter key."""
    name_mapping = {
        'Fundamental Frequency (Mean)': 'Fundamental_Frequency_Mean',
        'Fundamental Frequency (Std)': 'Fundamental_Frequency_Std',
        'Jitter': 'Jitter_Percent',
        'Shimmer': 'Shimmer_Percent',
        'HNR': 'HNR_dB',  # Changed from Harmonic_Ratio
        'Voice Period': 'Voice_Period_Mean',
        'Voiced Segments Ratio': 'Voiced_Segments_Ratio',
        'Formant Frequency': 'Formant_Frequency'
    }
    return name_mapping.get(display_name)

def is_within_range(value, parameter_key, gender=None):
    """Check if value is within normal range."""
    if parameter_key not in NORMAL_RANGES:
        print(f"Warning: No range defined for parameter {parameter_key}")
        return True
        
    if parameter_key == 'Fundamental_Frequency_Mean':
        if gender:
            range_values = NORMAL_RANGES[parameter_key][gender]
        else:
            range_values = NORMAL_RANGES[parameter_key]['default']
    else:
        range_values = NORMAL_RANGES[parameter_key]
    
    return range_values[0] <= value <= range_values[1]

# Constants for styling
BRAND_COLOR = '#FF1493'
HEADER_COLOR = (255, 20, 147)
SUBHEADER_COLOR = (255, 182, 193)
LOGO_PATH = "audihealth_logo.jpg"

class VoicePathologyPDF(FPDF):
    def header(self):
        if os.path.exists(LOGO_PATH):
            self.image(LOGO_PATH, 10, 8, 15)

        self.set_xy(25, 12)
        self.set_font('Arial', 'B', 20)
        self.set_text_color(*HEADER_COLOR)
        self.cell(60, 10, 'AudiHealth', 0, 0, 'L')

        self.set_xy(140, 12)
        self.set_font('Arial', 'B', 12)
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, 'Voice Pathology Analysis Report', 0, 1, 'R')

        self.ln(3)
        self.set_line_width(0.4)
        self.line(10, 30, 200, 30)
        self.ln(15)

    def colored_cell(self, w, h, txt, value, parameter_name, gender=None):
        """Create a cell with color based on whether the value is within normal range"""
        if isinstance(value, str):
            value = float(value.replace('%', '').replace(' dB', ''))
        
        parameter_key = get_parameter_key(parameter_name)
        if parameter_key and is_within_range(value, parameter_key, gender):
            self.set_text_color(0, 128, 0)
        else:
            self.set_text_color(255, 0, 0)
            
        self.cell(w, h, txt, 1, 0, 'L')
        self.set_text_color(0, 0, 0)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(*HEADER_COLOR)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}} - AudiHealth Voice Analysis', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(*SUBHEADER_COLOR)
        self.set_text_color(0, 0, 0)
        self.cell(0, 6, title, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, text):
        self.set_font('Arial', '', 11)
        self.set_text_color(0, 0, 0)
        sections = text.split('**')
        for i, section in enumerate(sections):
            if i % 2 == 0:
                self.set_font('Arial', '', 11)
            else:
                self.set_font('Arial', 'B', 11)
            self.multi_cell(0, 5, section)
        self.ln()

def create_pdf_report(audio_path, prediction, probabilities, report_text, features, output_pdf='medical_report.pdf', gender=None):
    pdf = VoicePathologyPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.chapter_title('Patient Information')
    pdf.set_font('Arial', '', 11)
    pdf.cell(0, 6, f"Analysis Date: {datetime.now().strftime('%Y-%m-%d')}", 0, 1)
    pdf.cell(0, 6, f"Predicted Condition: {prediction} ({probabilities[prediction]})", 0, 1)
    pdf.ln(5)

    pdf.chapter_title('Acoustic Measurements')

    col_widths = [pdf.w/3, pdf.w/4, pdf.w/4, pdf.w/4]
    pdf.set_font('Arial', 'B', 11)
    pdf.set_fill_color(*SUBHEADER_COLOR)
    headers = ['Parameter', 'Value', 'Normal Range', 'Unit']
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], 7, header, 1, 0, 'L', True)
    pdf.ln()

    # FIXED: Updated measurements with correct parameter names and ranges
    pdf.set_font('Arial', '', 11)
    measurements = [
        ['Fundamental Frequency (Mean)', 
         f"{features['Fundamental_Frequency_Mean']:.2f}",
         f"{NORMAL_RANGES['Fundamental_Frequency_Mean']['default'][0]}-{NORMAL_RANGES['Fundamental_Frequency_Mean']['default'][1]}",
         'Hz'],
        ['Fundamental Frequency (Std)', 
         f"{features['Fundamental_Frequency_Std']:.2f}",
         f"{NORMAL_RANGES['Fundamental_Frequency_Std'][0]}-{NORMAL_RANGES['Fundamental_Frequency_Std'][1]}",
         'Hz'],
        ['Jitter',
         f"{features['Jitter_Percent']:.2f}",
         f"{NORMAL_RANGES['Jitter_Percent'][0]}-{NORMAL_RANGES['Jitter_Percent'][1]}",
         '%'],
        ['Shimmer',
         f"{features['Shimmer_Percent']:.2f}",
         f"{NORMAL_RANGES['Shimmer_Percent'][0]}-{NORMAL_RANGES['Shimmer_Percent'][1]}",
         '%'],
        ['HNR',
         f"{features['HNR_dB']:.2f}",
         f"{NORMAL_RANGES['HNR_dB'][0]}-{NORMAL_RANGES['HNR_dB'][1]}",
         'dB'],
        ['Voice Period',
         f"{features['Voice_Period_Mean']:.4f}",
         f"{NORMAL_RANGES['Voice_Period_Mean'][0]}-{NORMAL_RANGES['Voice_Period_Mean'][1]}",
         's'],
        ['Voiced Segments Ratio',
         f"{features['Voiced_Segments_Ratio']:.2f}",
         f"{NORMAL_RANGES['Voiced_Segments_Ratio'][0]}-{NORMAL_RANGES['Voiced_Segments_Ratio'][1]}",
         ''],
        ['Formant Frequency',
         f"{features['Formant_Frequency']:.2f}",
         f"{NORMAL_RANGES['Formant_Frequency'][0]}-{NORMAL_RANGES['Formant_Frequency'][1]}",
         'Hz']
    ]

    for row in measurements:
        display_name = row[0]
        value = float(row[1])
        
        pdf.cell(col_widths[0], 7, row[0], 1, 0, 'L')
        pdf.colored_cell(col_widths[1], 7, row[1], value, display_name, gender)
        pdf.cell(col_widths[2], 7, row[2], 1, 0, 'L')
        pdf.cell(col_widths[3], 7, row[3], 1, 0, 'L')
        pdf.ln()

    pdf.ln(5)

    pdf.chapter_title('Detailed Analysis')
    pdf.chapter_body(report_text)

    pdf.add_page()
    pdf.chapter_title('Voice Spectrogram')
    if os.path.exists('mel_spectrogram.png'):
        pdf.image('mel_spectrogram.png', x=10, w=190)

    pdf.output(output_pdf)

def plot_mel_spectrogram(audio_path, output_path='mel_spectrogram.png'):
    try:
        y, sr = librosa.load(audio_path)

        plt.figure(figsize=(12, 8))

        plt.subplot(3, 1, 1)
        librosa.display.waveshow(y, sr=sr, color='c')
        plt.title('Waveform')

        plt.subplot(3, 1, 2)
        # Fix warning: use np.abs() to avoid phase information warning
        S = librosa.stft(y)
        D = librosa.amplitude_to_db(np.abs(S), ref=np.max)
        librosa.display.specshow(D, sr=sr, x_axis='time', y_axis='log')
        plt.colorbar(format='%+2.0f dB')
        plt.title('Mel Spectrogram')

        plt.subplot(3, 1, 3)  
        bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
        times = librosa.times_like(bandwidth, sr=sr)
        plt.plot(times, bandwidth, color='b', label='Spectral Bandwidth')
        plt.xlabel('Time (s)')
        plt.ylabel('Frequency (Hz)')
        plt.title('Spectral Bandwidth over Time')
        plt.legend()

        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()
    except Exception as e:
        print(f"Error creating spectrogram: {e}")

def generate_json_report(audio_path, prediction, probabilities, report_text, features):
    acoustic_measurements = {
        "fundamental_frequency": {
            "mean": round(features['Fundamental_Frequency_Mean'], 2),
            "std": round(features['Fundamental_Frequency_Std'], 2),
            "unit": "Hz"
        },
        "voice_perturbation": {
            "jitter": {
                "value": round(features['Jitter_Percent'], 2),
                "unit": "%"
            },
            "shimmer": {
                "value": round(features['Shimmer_Percent'], 2),
                "unit": "%"
            },
            "hnr": {
                "value": round(features['HNR_dB'], 2),
                "unit": "dB"
            }
        },
        "additional_measurements": {
            "voice_period": {
                "value": round(features['Voice_Period_Mean'], 4),
                "unit": "seconds"
            },
            "voiced_segments_ratio": round(features['Voiced_Segments_Ratio'], 2),
            "formant_frequency": {
                "value": round(features['Formant_Frequency'], 2),
                "unit": "Hz"
            }
        }
    }
    
    report = {
        "report_metadata": {
            "analysis_date": datetime.now().strftime('%Y-%m-%d'),
            "audio_file": audio_path,
            "report_type": "Voice Pathology Analysis"
        },
        "diagnosis": {
            "predicted_condition": prediction,
            "confidence_scores": probabilities
        },
        "acoustic_analysis": acoustic_measurements,
        "mfcc_features": {
            "mean": [round(x, 4) for x in features['MFCC_Mean']],
            "std": [round(x, 4) for x in features['MFCC_Std']]
        },
        "detailed_report": report_text
    }
    
    return json.dumps(report, indent=2)

def process_audio(audio_path):
    try:
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
        
        print("\n=== Starting audio processing ===")
        print("\nStep 1: Extracting VGGish audio features...")
        try:
            vggish_features = extract_audio_features(audio_path)
            print(f"✓ VGGish features extracted successfully, shape: {vggish_features.shape}")
        except Exception as e:
            print(f"✗ Error extracting VGGish features: {e}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"Failed to extract VGGish features: {str(e)}")
        
        print("\nStep 2: Extracting acoustic features...")
        try:
            acoustic_features = extract_advanced_features(audio_path)
            print("✓ Acoustic features extracted successfully")
        except Exception as e:
            print(f"✗ Error extracting acoustic features: {e}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"Failed to extract acoustic features: {str(e)}")

        print("\nStep 3: Making prediction...")
        try:
            # Check model type
            model_type = type(model).__name__
            print(f"Model type: {model_type}")
            
            # TFSMLayer expects input with batch dimension
            vggish_features_expanded = np.expand_dims(vggish_features, axis=0)
            print(f"Input shape for model: {vggish_features_expanded.shape}")
            
            # Convert to tensor
            input_tensor = tf.constant(vggish_features_expanded, dtype=tf.float32)
            print(f"Input tensor shape: {input_tensor.shape}, dtype: {input_tensor.dtype}")
            
            # TFSMLayer is callable directly (not a Keras Model, so no .predict())
            # It may return a dict if using serving_default endpoint
            print("Calling model with input tensor...")
            try:
                model_output = model(input_tensor)
                print(f"Model call succeeded! Output type: {type(model_output)}")
            except AttributeError as ae:
                if "'TFSMLayer' object has no attribute 'predict'" in str(ae):
                    # This shouldn't happen if we're calling correctly, but let's handle it
                    raise RuntimeError("TFSMLayer model was called incorrectly. Please restart the server to reload the updated code.")
                raise
            except Exception as call_error:
                print(f"Error calling model: {call_error}")
                print(f"Error type: {type(call_error)}")
                # Try alternative calling method
                print("Trying alternative calling method...")
                if hasattr(model, '__call__'):
                    model_output = model.__call__(input_tensor)
                else:
                    raise RuntimeError(f"Cannot call model. Error: {call_error}")
            
            # Handle different output formats
            if isinstance(model_output, dict):
                # If output is a dict, get the actual predictions
                output_keys = list(model_output.keys())
                print(f"Model output keys: {output_keys}")
                prediction = model_output[output_keys[0]]  # Get first output
            else:
                prediction = model_output
            
            # Convert to numpy if tensor
            if isinstance(prediction, tf.Tensor):
                prediction = prediction.numpy()
            
            print(f"Prediction shape: {prediction.shape}, values (first 5): {prediction.flatten()[:5]}")
            
            # Handle different prediction shapes
            if len(prediction.shape) == 2:
                # Shape: (batch, classes)
                predicted_class = int(np.argmax(prediction, axis=1)[0])
                prediction_probs = prediction[0]
            elif len(prediction.shape) == 1:
                # Shape: (classes,)
                predicted_class = int(np.argmax(prediction))
                prediction_probs = prediction
            else:
                # Flatten if needed
                prediction_flat = prediction.flatten()
                predicted_class = int(np.argmax(prediction_flat))
                prediction_probs = prediction_flat
            
            # Ensure we have valid class index
            if predicted_class not in label_mapping:
                raise ValueError(f"Predicted class index {predicted_class} is not in label_mapping {list(label_mapping.keys())}")
            
            predicted_class_label = label_mapping[predicted_class]
            probabilities = {label_mapping[i]: f"{float(prob) * 100:.2f}%" 
                            for i, prob in enumerate(prediction_probs) if i in label_mapping}
            probabilities_sorted = dict(sorted(probabilities.items(), 
                                              key=lambda item: float(item[1].rstrip('%')), 
                                              reverse=True))
            print(f"✓ Prediction completed: {predicted_class_label}")
            print(f"  Confidence scores: {probabilities_sorted}")
        except Exception as e:
            error_msg = f"Error making prediction: {str(e)}"
            print(f"✗ {error_msg}")
            print(f"  Error type: {type(e).__name__}")
            import traceback
            print("Full traceback:")
            traceback.print_exc()
            raise RuntimeError(f"Failed to make prediction: {error_msg}")

        print("\nStep 4: Generating spectrogram...")
        try:
            plot_mel_spectrogram(audio_path)
            print("✓ Spectrogram generated")
        except Exception as e:
            print(f"⚠ Warning: Error generating spectrogram: {e}")
            # Don't fail if spectrogram generation fails

        print("\nStep 5: Generating medical report...")
        # generate_medical_report always returns a report (API or fallback)
        # No need for try-except as it handles all errors internally
        report_text = generate_medical_report(acoustic_features, 
                                              predicted_class_label, 
                                              probabilities_sorted)
        print("✓ Medical report generated")

        print("\nStep 6: Creating PDF report...")
        try:
            create_pdf_report(audio_path, predicted_class_label, 
                             probabilities_sorted, report_text, acoustic_features)
            print("✓ PDF report created")
        except Exception as e:
            print(f"✗ Error creating PDF: {e}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"Failed to create PDF report: {str(e)}")

        print("\nStep 7: Creating JSON report...")
        try:
            json_report = generate_json_report(audio_path, 
                                              predicted_class_label,
                                              probabilities_sorted, 
                                              report_text, 
                                              acoustic_features)

            with open('medical_report.json', 'w') as f:
                f.write(json_report)
            print("✓ JSON report created")
        except Exception as e:
            print(f"✗ Error creating JSON report: {e}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"Failed to create JSON report: {str(e)}")

        print("\n=== Report generated successfully! ===")
        return json_report
        
    except Exception as e:
        error_msg = f"Error processing audio: {str(e)}"
        print(f"\n✗ {error_msg}")
        import traceback
        traceback.print_exc()
        raise RuntimeError(error_msg)

# process_audio("Sample_1(vocal polyp).wav")