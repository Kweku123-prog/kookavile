import admin from "firebase-admin";
import path from "path";

const serviceAccount = path.resolve("./ecom-ffd1b-firebase-adminsdk-kt08i-bd4df68a1e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "YOUR_PROJECT_ID.appspot.com" // replace with your bucket name
});

const bucket = admin.storage().bucket();

export { bucket };
