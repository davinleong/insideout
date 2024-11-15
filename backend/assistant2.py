import base64
import http
import io
import os
import subprocess
from tabnanny import check
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from deepface import DeepFace
from PIL import Image
import numpy as np
import cv2
from flask_swagger_ui import get_swaggerui_blueprint
import jwt
from functools import wraps
from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = Flask(__name__, static_url_path='/static')
CORS(app)

API_VERSION = "v1"

# Load environment variables
JWT_SECRET = os.getenv('JWT_SECRET')

# Configure Swagger UI
SWAGGER_URL = '/docs'
API_URL = '/static/swagger2.yml'

# Call factory function to create our blueprint
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Inside Out API"
    }
)

# Register blueprint at URL
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# Route for serving swagger.yml
@app.route('/static/swagger.yml')
def send_swagger_yml():
    return send_from_directory('static', 'swagger.yml')

# JWT token validation decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
        return f(*args, **kwargs)
    return decorated

class Assistant:
    def __init__(self):
        self.emotion_color_map = {
            "angry": "Red",
            "happy": "Green",
            "sad": "Blue",
            "fear": "Purple",
            "disgust": "Brown",
            "neutral": "Gray",
            "surprise": "Yellow"
        }

    def answer(self, image_base64, user_id):    
        print("Length of image_base64:", len(image_base64))

        # Decode image
        try:
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            print("Image successfully decoded and processed.")
        except Exception as e:
            print("Error decoding image:", e)
            return "Failed to decode image.", "Unknown"

        # Detect emotion
        emotion_color = self.detect_emotion(frame, user_id)
        detected_emotion = emotion_color['emotion']

        if detected_emotion != "Unknown":
            prompt_for_llm = f"Respond empathetically to someone feeling {detected_emotion.lower()}."
            llm_response = self._generate_response(prompt_for_llm)
            emotion_response = f"I detect that you are feeling {detected_emotion}. The color code associated with this emotion is {emotion_color['color']}. {llm_response}"
        else:
            emotion_response = "I'm sorry, I'm unable to detect your emotion at the moment. Could you try again?"
        
        print("Emotion Response:", emotion_response)
        return emotion_response, emotion_color['color']
            
    def detect_emotion(self, frame, user_id):
        try:
            result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            print("DeepFace Result:", result)

            if isinstance(result, list):
                result = result[0]

            emotion = result['dominant_emotion'].lower()
            print("Detected Emotion:", emotion)

            if emotion in self.emotion_color_map:
                emotion_data = check_emotion_exists(user_id, emotion)
                if emotion_data:
                    color = emotion_data[0]['rgb']
                    print("Custom Color for User:", color)
                else:
                    color = self.emotion_color_map[emotion]
                    print("Default Color:", color)
                return {"emotion": emotion.capitalize(), "color": color}
            else:
                # Emotion is not one of the seven basic emotions
                print("Emotion not recognized among the basic emotions.")
                return {"emotion": "Unknown", "color": "Unknown"}
        except Exception as e:
            print("Error in emotion detection:", e)
            return {"emotion": "Unknown", "color": "Unknown"}

    def _generate_response(self, prompt):
        # ollama_path = "/usr/local/bin/ollama" # local environment
        ollama_path = "/home/linuxbrew/.linuxbrew/bin/ollama" # production environment
        try:
            result = subprocess.run(
                [ollama_path, "run", "llama3.2:1b"],
                input=prompt,
                capture_output=True,
                text=True
            )
            response = result.stdout.strip()
            if result.returncode != 0:
                print("LLM Error:", result.stderr)
                return "I'm sorry, I'm unable to process your request at the moment."
            return response
        except Exception as e:
            print("Error calling LLaMA model:", e)
            return "I'm sorry, I'm unable to process your request at the moment."

assistant = Assistant()

@app.route(f'/{API_VERSION}/process', methods=['POST'])
# @token_required
def process_request():
    data = request.get_json()
    user_id = data.get('user_id')
    image_base64 = data.get('image')
    endpoint = f"https://potipress.com/api/{API_VERSION}/process"
    http_method = "POST"
    
    if not user_id:
        record_api_call(user_id, http_method, endpoint, 400)
        return jsonify({'error': 'User ID not provided.'}), 400
    if not image_base64:
        record_api_call(user_id, http_method, endpoint, 400)
        return jsonify({'error': 'No image provided.'}), 400
    
    try:
        response_text, color = assistant.answer(image_base64, user_id)
        record_api_call(user_id, http_method, endpoint, 200)
        return jsonify({
            'response': response_text,
            'color': color,
        })
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        record_api_call(user_id, http_method, endpoint, 500)
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500


@app.route(f'/{API_VERSION}/emotions', methods=['POST'])
def create_emotion():
    data = request.get_json()
    user_id = data.get('user_id')
    emotion = data.get('emotion')
    rgb = data.get('rgb')
    endpoint = f"https://potipress.com/api/{API_VERSION}/emotions"
    http_method = "POST"

    if not user_id or not emotion or not rgb:
        status_code = 400
        record_api_call(user_id, http_method, endpoint, status_code)
        return jsonify({'error': 'Missing user ID, emotion or RGB value'}), 400        

    try:
        check_response = supabase.table('emotions').select('*').eq('user_id', user_id).eq('emotion', emotion).execute()
        
        if check_response.data:
            status_code = 409
            record_api_call(user_id, http_method, endpoint, status_code)
            return jsonify({'error': 'Emotion already exists for this user.'}), 409

        response = supabase.table('emotions').insert({
            'user_id': user_id,
            'emotion': emotion,
            'rgb': rgb
        }).execute()

        print("Insert response:", response.data)

        status_code = 200
        record_api_call(user_id, http_method, endpoint, status_code)
        return jsonify({'message': 'Emotion with RGB added'}), 200

    except Exception as e:
        status_code = 500
        record_api_call(user_id, http_method, endpoint, status_code)
        print(f"Error inserting emotion: {e}")
        return jsonify({'error': 'Failed to add emotion', 'details': str(e)}), 500

@app.route(f'/{API_VERSION}/emotions/<emotion>', methods=['GET'])
def get_emotion(emotion):
    user_id = request.args.get('user_id')
    endpoint = f"https://potipress.com/api/{API_VERSION}/emotions/{emotion}"
    http_method = "GET"

    if not user_id:
        status_code = 400
        record_api_call(user_id, http_method, endpoint, status_code)
        return jsonify({'error': 'User ID not provided.'}), 400

    try:
        response = supabase.table('emotions').select('rgb').eq('user_id', user_id).eq('emotion', emotion).execute()
        data = response.data

        if data:
            rgb = data[0]['rgb']
            status_code = 200
            record_api_call(user_id, http_method, endpoint, status_code)
            return jsonify({'emotion': emotion, 'rgb': rgb}), 200
        else:
            status_code = 404
            record_api_call(user_id, http_method, endpoint, status_code)
            return jsonify({'error': 'Emotion not found.'}), 404
    except Exception as e:
        status_code = 500
        record_api_call(user_id, http_method, endpoint, status_code)
        print(f"Error retrieving emotion: {e}")
        return jsonify({'error': 'Failed to retrieve emotion', 'details': str(e)}), 500

@app.route(f'/{API_VERSION}/emotions/<emotion>', methods=['PATCH'])
def update_emotion(emotion):
    data = request.get_json()
    user_id = data.get('user_id')
    rgb = data.get('rgb')
    endpoint = f"https://potipress.com/api/{API_VERSION}/emotions/{emotion}"
    http_method = "PATCH"

    if not user_id or rgb is None:
        status_code = 400
        record_api_call(user_id, http_method, endpoint, status_code)
        return jsonify({'error': 'Missing user ID or RGB value.'}), 400

    try:
        response = supabase.table('emotions').update({'rgb': rgb}).eq('user_id', user_id).eq('emotion', emotion).execute()
        data = response.data

        if data:
            status_code = 200
            record_api_call(user_id, http_method, endpoint, status_code)
            return jsonify({'message': 'Emotion RGB updated.'}), 200
        else:
            status_code = 404
            record_api_call(user_id, http_method, endpoint, status_code)
            return jsonify({'error': 'Emotion not found.'}), 404
    except Exception as e:
        status_code = 500
        record_api_call(user_id, http_method, endpoint, status_code)
        print(f"Error updating emotion: {e}")
        return jsonify({'error': 'Failed to update emotion', 'details': str(e)}), 500

@app.route(f'/{API_VERSION}/emotions/<emotion>', methods=['DELETE'])
def delete_emotion(emotion):
    user_id = request.args.get('user_id')
    endpoint = f"https://potipress.com/api/{API_VERSION}/emotions/{emotion}"
    http_method = "DELETE"

    if not user_id:
        status_code = 400
        record_api_call(user_id, http_method, endpoint, status_code)
        return jsonify({'error': 'User ID not provided.'}), 400

    try:
        response = supabase.table('emotions').delete().eq('user_id', user_id).eq('emotion', emotion).execute()
        data = response.data

        if data:
            status_code = 200
            record_api_call(user_id, http_method, endpoint, status_code)
            return jsonify({'message': 'Emotion deleted.'}), 200
        else:
            status_code = 404
            record_api_call(user_id, http_method, endpoint, status_code)
            return jsonify({'error': 'Emotion not found.'}), 404
    except Exception as e:
        status_code = 500
        record_api_call(user_id, http_method, endpoint, status_code)
        print(f"Error deleting emotion: {e}")
        return jsonify({'error': 'Failed to delete emotion', 'details': str(e)}), 500

def record_api_call(user_id, http_method, endpoint, status_code):
    try:
        response = supabase.table("api_calls").insert({
            "user_id": user_id,
            "http_method": http_method,
            "endpoint": endpoint,
            "status_code": status_code
        }).execute()

        print("API Call logged:", response.data)

    except Exception as e:
        print(f"Error inserting API call into Supabase: {e}")

def check_emotion_exists(user_id, emotion):
    response = supabase.table('emotions').select('*').eq('user_id', user_id).eq('emotion', emotion).execute()
    return response.data

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8282)