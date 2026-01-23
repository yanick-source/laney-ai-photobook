import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import os from "os";
import type { ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && {
      name: "local-pdf-from-downloads",
      configureServer(server: ViteDevServer) {
        server.middlewares.use("/__local/pdf", (req: IncomingMessage, res: ServerResponse) => {
          const pdfPath = path.join(os.homedir(), "Downloads", "Kookfabriek Fotoboek A4.pdf");

          if (!fs.existsSync(pdfPath)) {
            res.statusCode = 404;
            res.end("Local PDF not found in Downloads");
            return;
          }

          const stat = fs.statSync(pdfPath);
          const range = req.headers.range;

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("Cache-Control", "no-store");

          if (range) {
            const match = /^bytes=(\d+)-(\d+)?$/.exec(range);
            if (!match) {
              res.statusCode = 416;
              res.setHeader("Content-Range", `bytes */${stat.size}`);
              res.end();
              return;
            }

            const start = Number(match[1]);
            const end = match[2] ? Number(match[2]) : stat.size - 1;

            if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= stat.size) {
              res.statusCode = 416;
              res.setHeader("Content-Range", `bytes */${stat.size}`);
              res.end();
              return;
            }

            res.statusCode = 206;
            res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
            res.setHeader("Content-Length", String(end - start + 1));

            fs.createReadStream(pdfPath, { start, end }).pipe(res);
            return;
          }

          res.statusCode = 200;
          res.setHeader("Content-Length", String(stat.size));
          fs.createReadStream(pdfPath).pipe(res);
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
