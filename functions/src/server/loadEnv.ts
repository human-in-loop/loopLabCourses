import dotenv from "dotenv";
import * as functions from "firebase-functions";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Load environment variables from Firebase Functions config
process.env.MONGODB_URL =
  process.env.MONGODB_URL || functions.config().mongodb?.url;
process.env.MONGODB_DB_NAME =
  process.env.MONGODB_DB_NAME || functions.config().mongodb?.db_name;
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || functions.config().session?.secret;
