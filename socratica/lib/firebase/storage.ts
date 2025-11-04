import { getStorage } from "firebase/storage";
import app from "./config";

// Initialize and export Firebase Storage instance
export const storage = getStorage(app);




