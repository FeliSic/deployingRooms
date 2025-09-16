import firebase from "firebase/compat/app";
import "firebase/compat/database";

const app = firebase.initializeApp({
  apiKey: process.env.PARCEL_API_KEY,
  databaseURL: process.env.PARCEL_DATABASE_URL,
  projectId: process.env.PARCEL_PROJECT_ID
}); 

const rtdb = firebase.database()

export { rtdb }