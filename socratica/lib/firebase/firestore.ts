import { getFirestore } from "firebase/firestore";
import app from "./config";

// Initialize and export Firestore instance
export const db = getFirestore(app);



