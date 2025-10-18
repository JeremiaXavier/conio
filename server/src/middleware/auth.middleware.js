const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (do this once in your app)
// Option 1: Using service account JSON file
 const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
/* admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
 */

  try {
    // 1. Decode the Base64 string back to a JSON string
    const serviceAccountJsonString = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');

    // 2. Parse the JSON string into a JavaScript object
    const serviceAccount = JSON.parse(serviceAccountJsonString);

    // 3. Initialize the Admin SDK with the credentials object
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Add other options like databaseURL, storageBucket, if needed
      // databaseURL: "https://your-project-id.firebaseio.com" 
    });
    console.log("Firebase Admin SDK initialized successfully.");

  } catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
  }

const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Get the token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    // Extract token
    const token = authHeader.split('Bearer ')[1];

    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null
    };

    next(); // Proceed to next middleware/route handler
  } catch (error) {
    console.error('Token verification error:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please sign in again.'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The authentication token is invalid.'
      });
    }

    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Failed to authenticate user'
    });
  }
};

module.exports = { verifyFirebaseToken, admin };

