import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// If FIREBASE_SERVICE_ACCOUNT_JSON is provided as a string in .env
// Or if you have a serviceAccountKey.json in the current directory
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';

if (!admin.apps.length) {
  try {
    let config = {};
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      config = {
        credential: admin.credential.cert(serviceAccount)
      };
      console.log("Firebase Admin initialized via serviceAccountKey.json");
    } else if (process.env.FIREBASE_PROJECT_ID) {
      config = {
        projectId: process.env.FIREBASE_PROJECT_ID
      };
      console.log(`Firebase Admin initialized via Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    } else {
      config = {
          credential: admin.credential.applicationDefault()
      };
      console.log("Firebase Admin initialized via Application Default Credentials");
    }
    
    admin.initializeApp(config);
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error.message);
    // Fallback to minimal initialization if possible or just log error
  }
}

export default admin;
