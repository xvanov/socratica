import { getAuth } from "firebase/auth";
import app from "./config";

// Initialize and export Firebase Auth instance
export const auth = getAuth(app);

