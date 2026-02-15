import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import * as fs from "fs";
import * as path from "path";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { sharedRecommendations } from "@shared/schema";
import 'dotenv/config';


const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origins = new Set<string>();

    // Production domain
    origins.add("https://reclib.com");
    origins.add("https://www.reclib.com");

    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }

    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }

    const origin = req.header("origin");

    // Allow localhost origins for Expo web development (any port)
    const isLocalhost =
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:");

    // Allow requests without origin (mobile apps, curl, etc.)
    const allowRequest = !origin || origins.has(origin) || isLocalhost;

    if (allowRequest) {
      res.header("Access-Control-Allow-Origin", origin || "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      limit: "50mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false, limit: "50mb" }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  return "RecLib";
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function serveSharePage(req: Request, res: Response, id: string, appName: string) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - Shared Recommendation</title>
  <meta property="og:title" content="${appName} - Shared Recommendation">
  <meta property="og:description" content="Open this recommendation in ${appName}">
  <meta property="og:url" content="${baseUrl}/recommendation/${id}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #fff;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 12px;
    }
    p {
      color: rgba(255,255,255,0.7);
      margin-bottom: 32px;
      line-height: 1.5;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 16px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    .store-links {
      margin-top: 24px;
      color: rgba(255,255,255,0.5);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">R</div>
    <h1>${appName}</h1>
    <p>Someone shared a recommendation with you! Open the app to view it.</p>
    <a href="reclib://recommendation/${id}" class="btn">Open in App</a>
    <p class="store-links">Don't have the app? Download it from the App Store.</p>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const privacyTemplatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "privacy.html",
  );
  const privacyPageTemplate = fs.readFileSync(privacyTemplatePath, "utf-8");
  const termsTemplatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "terms.html",
  );
  const termsPageTemplate = fs.readFileSync(termsTemplatePath, "utf-8");
  const appName = getAppName();

  log("Serving static Expo files with dynamic manifest routing");

  app.get("/recommendation/:id", (req: Request, res: Response) => {
    serveSharePage(req, res, req.params.id, appName);
  });

  app.get("/privacy", (_req: Request, res: Response) => {
    const html = privacyPageTemplate.replace(
      /APP_NAME_PLACEHOLDER/g,
      appName,
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/terms", (_req: Request, res: Response) => {
    const html = termsPageTemplate.replace(/APP_NAME_PLACEHOLDER/g, appName);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  // Handle shared recommendation links - serve a standalone share page
  app.get("/shared/:shareId", async (req: Request, res: Response) => {
    const shareId = req.params.shareId;
    
    // First check if we're in development mode
    if (process.env.NODE_ENV === "development") {
      return res.redirect(`http://localhost:8081/shared/${shareId}`);
    }
    
    // In production, serve the static Expo web build if it exists
    const staticIndexPath = path.resolve(process.cwd(), "static-build", "index.html");
    if (fs.existsSync(staticIndexPath)) {
      return res.sendFile(staticIndexPath);
    }
    
    // Fallback: Serve a standalone share page
    try {
      const [shared] = await db.select().from(sharedRecommendations).where(eq(sharedRecommendations.id, shareId));
      if (!shared) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html><head><title>Not Found - ${appName}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>body{font-family:system-ui;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5;}
          .container{text-align:center;padding:2rem;}</style></head>
          <body><div class="container"><h1>Recommendation Not Found</h1><p>This link may have expired or doesn't exist.</p></div></body></html>
        `);
      }
      
      const platformList = shared.platforms?.join(", ") || "";
      res.send(`
        <!DOCTYPE html>
        <html><head>
          <title>${shared.title} - ${appName}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta property="og:title" content="${shared.title}">
          <meta property="og:description" content="${shared.category}${platformList ? ` on ${platformList}` : ""}">
          <style>
            *{box-sizing:border-box}
            body{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#fafaf9;color:#1a1a1a;min-height:100vh;display:flex;flex-direction:column}
            .container{max-width:480px;margin:0 auto;padding:2rem 1.5rem;flex:1}
            .badge{display:inline-block;background:#f0f0ee;padding:0.25rem 0.75rem;border-radius:100px;font-size:0.875rem;color:#666;margin-bottom:1rem}
            h1{font-size:1.75rem;font-weight:600;margin:0 0 1rem;line-height:1.3}
            .platforms{display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem}
            .platform{background:#fff;border:1px solid #e5e5e5;padding:0.5rem 1rem;border-radius:100px;font-size:0.875rem}
            .notes{background:#fff;border:1px solid #e5e5e5;padding:1rem;border-radius:12px;margin-bottom:1.5rem;line-height:1.6}
            .notes-label{font-size:0.75rem;text-transform:uppercase;color:#999;margin-bottom:0.5rem}
            .cta{background:#1a1a1a;color:#fff;padding:1rem 2rem;border-radius:12px;text-decoration:none;display:block;text-align:center;font-weight:500;margin-top:auto}
            .cta:hover{background:#333}
            .footer{text-align:center;padding:1rem;color:#999;font-size:0.875rem}
            .image{width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:1rem}
          </style>
        </head>
        <body>
          <div class="container">
            ${shared.imageBase64 ? `<img class="image" src="data:image/jpeg;base64,${shared.imageBase64}" alt="${shared.title}">` : ""}
            <div class="badge">${shared.category}</div>
            <h1>${shared.title}</h1>
            ${platformList ? `<div class="platforms">${shared.platforms?.map((p: string) => `<span class="platform">${p}</span>`).join("")}</div>` : ""}
            ${shared.notes ? `<div class="notes"><div class="notes-label">Notes</div>${shared.notes}</div>` : ""}
            <a class="cta" href="reclib://shared/${shareId}">Open in ${appName}</a>
          </div>
          <div class="footer">Shared via ${appName}</div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("Error serving share page:", error);
      res.status(500).send("Error loading shared recommendation");
    }
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  // Serve web app at /app
  const webBuildPath = path.resolve(process.cwd(), "web-build");
  app.use("/app", express.static(webBuildPath));

  // Handle client-side routing for the web app (SPA fallback)
  app.use("/app", (_req: Request, res: Response, next: NextFunction) => {
    const indexPath = path.join(webBuildPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });

  log("Expo routing: Checking expo-platform header on / and /manifest");
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });
}

(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);

  configureExpoAndLanding(app);

  const server = await registerRoutes(app);

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  const isReplit = Boolean(
  process.env.REPLIT_DEV_DOMAIN || process.env.REPL_ID,
);

if (isReplit) {
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`express server running on Replit at port ${port}`);
    },
  );
} else {
  server.listen(port, "localhost", () => {
    log(`express server running locally at http://localhost:${port}`);
  });
}
})();
