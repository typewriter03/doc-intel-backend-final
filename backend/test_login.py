import firebase_admin
from firebase_admin import auth, credentials
import requests

# --- CONFIGURATION ---
# Your Frontend API Key (from the code you shared)
API_KEY = "AIzaSyCZ4FmbGyo2DdHli23Lg9tb-Ni9IwhY-aI" 
# The User ID we want to simulate
TEST_UID = "dev-admin-user"
# Path to the file you downloaded earlier
CRED_PATH = "firebase_credentials.json"

def generate_dev_token():
    # 1. Initialize Admin SDK (if not already running)
    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate(CRED_PATH)
            firebase_admin.initialize_app(cred)
            print("✅ Admin SDK Initialized")
        except Exception as e:
            print(f"❌ Error loading {CRED_PATH}. Make sure the file is in this folder!")
            print(f"Error details: {e}")
            return

    print(f"⚙️ Generating secure token for User ID: {TEST_UID}...")
    
    try:
        # 2. Mint a "Custom Token" using your Admin privileges
        # This works even if Anonymous Auth is disabled in the console.
        custom_token = auth.create_custom_token(TEST_UID)
        # Note: In some Python versions, create_custom_token returns bytes
        if isinstance(custom_token, bytes):
            custom_token = custom_token.decode('utf-8')
            
        # 3. Exchange the Custom Token for a valid ID Token (Bearer Token)
        # This is what the Backend expects in the 'Authorization' header.
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key={API_KEY}"
        payload = {
            "token": custom_token,
            "returnSecureToken": True
        }
        
        response = requests.post(url, json=payload)
        data = response.json()
        
        if "idToken" in data:
            print("\n✅ SUCCESS! Here is your Bearer Token for Swagger/Postman:\n")
            print(data["idToken"])
            print("\n(Copy the long string above, excluding quotes)\n")
        else:
            print(f"\n❌ Exchange failed. Response from Firebase: {data}")
            
    except Exception as e:
        print(f"❌ Script failed: {e}")

if __name__ == "__main__":
    generate_dev_token()