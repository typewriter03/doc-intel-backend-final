import os
import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.core.config import settings

# Initialize Firebase Admin (Only once)
if not firebase_admin._apps:
    try:
        # We try to get the path from settings, or default to the root folder
        cred_path = getattr(settings, "FIREBASE_CREDENTIALS_PATH", "firebase_credentials.json")
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK Initialized")
        else:
            print(f"⚠️ Warning: Firebase credentials not found at {cred_path}")
    except Exception as e:
        print(f"❌ Failed to init Firebase: {e}")

security = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Validates the Bearer Token sent by the frontend.
    Returns the User ID (uid) if valid.
    """
    token = creds.credentials
    try:
        # Verify the ID token using the Firebase Admin SDK
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid or expired token: {str(e)}"
        )