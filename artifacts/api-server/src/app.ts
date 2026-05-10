import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import path from "path";
import fs from "fs";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api", router);

// In production, serve the frontend static files and handle SPA routing
if (process.env.NODE_ENV === "production") {
  const frontendDist =
    process.env.FRONTEND_DIST ||
    path.resolve(process.cwd(), "..", "..", "artifacts", "royal-jersey-bd", "dist", "public");

  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
    logger.info({ frontendDist }, "Serving frontend static files");
  } else {
    logger.warn({ frontendDist }, "Frontend dist not found — static serving skipped");
  }
}

export default app;
