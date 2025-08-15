import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
// FIX: Use a default import for the runtime object. We will infer the type later.
import vite from "vite";
import { nanoid } from "nanoid";

// Define a default logger that can be replaced by the Vite logger in dev
export let log = (...args: any[]) => console.log("[vite]", ...args);

export async function setupVite(app: Express, server: Server) {
  // FIX: Infer the ViteDevServer type directly from the createServer function.
  // This is a more reliable method that avoids module resolution issues.
  const viteServer: Awaited<ReturnType<typeof vite.createServer>> =
    await vite.createServer({
      // Define the necessary config directly instead of importing the file
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      // Add the path aliases your client code needs
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "client", "src"),
          "@shared": path.resolve(process.cwd(), "shared"),
          "@assets": path.resolve(process.cwd(), "attached_assets"),
        },
      },
      appType: "custom",
    });

  // Use the new viteServer variable
  app.use(viteServer.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    if (url.startsWith("/api")) {
      return next();
    }

    try {
      // Correctly resolve the path to the client's index.html from the project root
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html"
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      // Use the new viteServer variable
      const page = await viteServer.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      // Use the new viteServer variable
      viteServer.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
