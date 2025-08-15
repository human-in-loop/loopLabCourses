import dotenv from "dotenv";
import path from "path";

// Load .env.local from the project root (not from functions/)
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
console.log("DEBUG: MONGODB_URL after dotenv config:", process.env.MONGODB_URL);

import express, {
  type Request,
  Response,
  NextFunction,
  Express,
} from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { mongoDB } from "./mongodb";
import { MongoStorage } from "./mongo-storage";
import { https } from "firebase-functions/v2";
import { MongoClient } from "mongodb";

export const app = express();

let initialized = false;

async function initializeApp() {
  console.log("initializeApp: Starting...");
  if (initialized) {
    console.log("initializeApp: Already initialized.");
    return;
  }
  initialized = true;

  console.log("initializeApp: Connecting to MongoDB...");
  const url = process.env.MONGODB_URL;
  const dbName = process.env.MONGODB_DB_NAME;
  console.log("MONGODB_URL:", url);
  console.log("MONGODB_DB_NAME:", dbName);
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  console.log("MongoDB connected.");
  console.log("DB Name:", dbName);
  console.log("DB Object:", db);
  if (!db) throw new Error("MongoDB database not available.");
  if (!client) throw new Error("MongoDB client not available.");

  const storage = new MongoStorage(db);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "loop-lab-dev-secret-key",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: client as any,
        dbName: dbName || "LoopLabCourses",
        collectionName: "sessions",
        ttl: 24 * 60 * 60,
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api")) {
        console.log(
          `${req.method} ${req.path} ${res.statusCode} in ${
            Date.now() - start
          }ms`
        );
      }
    });
    next();
  });

  console.log("initializeApp: Registering routes...");
  await registerRoutes(app, storage);
  console.log("initializeApp: Routes registered.");

  app.use((err, _req, res, _next) => {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  });

  // Health check endpoint
  app.get("/", (_req, res) => res.send("Server is running."));

  // Start listening on the port required by Cloud Run health checks
  const port = parseInt(process.env.PORT || "8080", 10); // Default to 8080 for Cloud Run
  const server = createServer(app); // Create server instance
  console.log(`initializeApp: Attempting to listen on port ${port}...`);
  server.listen({ port, host: "0.0.0.0" }, () => {
    console.log(`initializeApp: Server listening on port ${port}`);
  });
  console.log("initializeApp: Server listen call made.");
}

export async function createExpressApp(): Promise<Express> {
  if (!initialized) {
    await initializeApp();
  }
  return app;
}

// Call initializeApp immediately when the module is loaded
initializeApp().catch((error) => {
  console.error("Failed to initialize server:", error);
  process.exit(1);
});

// Export the app for Firebase Functions
export const api = https.onRequest(app);
