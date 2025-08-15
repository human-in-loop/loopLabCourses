import { createExpressApp } from "./index";
import { createServer } from "http";
import { log } from "./vite";
import dotenv from "dotenv";
import path from "path";

// Load .env.local from the project root
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
console.log("MONGODB_URL:", process.env.MONGODB_URL);
console.log("MONGODB_DB_NAME:", process.env.MONGODB_DB_NAME);

async function startServer() {
  const app = await createExpressApp();
  const server = createServer(app);
  const port = parseInt(process.env.PORT || "5001", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
