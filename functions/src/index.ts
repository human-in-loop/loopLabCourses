import { https } from "firebase-functions"; // Explicitly import https from Gen 1

// Correctly import the named app export from its new location
import { app } from "./server";

// Export your entire Express server as a single Cloud Function
export const api = https.onRequest(app);
