import { createServer, request as createProxyRequest } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const portFlagIndex = args.indexOf("--port");
const port = portFlagIndex >= 0 ? Number.parseInt(args[portFlagIndex + 1], 10) : 3000;
const backendBaseUrl = new URL("http://127.0.0.1:8081");

if (!Number.isInteger(port) || port <= 0) {
    console.error("A valid numeric port is required.");
    process.exit(1);
}

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const rootPrefix = `${rootDirectory}${path.sep}`;
const contentTypes = new Map([
    [".css", "text/css; charset=utf-8"],
    [".gif", "image/gif"],
    [".html", "text/html; charset=utf-8"],
    [".ico", "image/x-icon"],
    [".jpeg", "image/jpeg"],
    [".jpg", "image/jpeg"],
    [".js", "application/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".png", "image/png"],
    [".svg", "image/svg+xml"],
    [".txt", "text/plain; charset=utf-8"],
    [".webp", "image/webp"]
]);

function isInsideRoot(resolvedPath) {
    return resolvedPath === rootDirectory || resolvedPath.startsWith(rootPrefix);
}

async function resolveFilePath(requestPathname) {
    const decodedPath = decodeURIComponent(requestPathname);
    const localPath = decodedPath === "/" ? "snap_eats.html" : decodedPath.replace(/^\/+/, "");
    let resolvedPath = path.resolve(rootDirectory, localPath);

    if (!isInsideRoot(resolvedPath)) {
        return null;
    }

    try {
        const resolvedStat = await stat(resolvedPath);
        if (resolvedStat.isDirectory()) {
            resolvedPath = path.join(resolvedPath, "index.html");
        }
    } catch {
        if (!path.extname(resolvedPath)) {
            return path.join(rootDirectory, "snap_eats.html");
        }

        return null;
    }

    try {
        await stat(resolvedPath);
        return resolvedPath;
    } catch {
        return null;
    }
}

function proxyApiRequest(clientRequest, clientResponse) {
    const requestUrl = new URL(clientRequest.url ?? "/", `http://${clientRequest.headers.host ?? "localhost"}`);
    const upstreamUrl = new URL(requestUrl.pathname + requestUrl.search, backendBaseUrl);
    const forwardedHeaders = { ...clientRequest.headers, host: backendBaseUrl.host };

    const upstreamRequest = createProxyRequest(
        upstreamUrl,
        {
            method: clientRequest.method,
            headers: forwardedHeaders
        },
        (upstreamResponse) => {
            clientResponse.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
            upstreamResponse.pipe(clientResponse);
        }
    );

    upstreamRequest.on("error", (error) => {
        if (clientResponse.headersSent) {
            clientResponse.end();
            return;
        }

        clientResponse.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
        clientResponse.end(`Proxy error: ${error.message}`);
    });

    clientRequest.pipe(upstreamRequest);
}

const server = createServer(async (request, response) => {
    try {
        const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

        if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
            proxyApiRequest(request, response);
            return;
        }

        const filePath = await resolveFilePath(url.pathname);

        if (!filePath) {
            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            response.end("Not Found");
            return;
        }

        const fileContents = await readFile(filePath);
        const extension = path.extname(filePath).toLowerCase();
        const contentType = contentTypes.get(extension) ?? "application/octet-stream";

        response.writeHead(200, {
            "Cache-Control": "no-store",
            "Content-Type": contentType
        });
        response.end(fileContents);
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end(`Dev server error: ${error.message}`);
    }
});

server.listen(port, "127.0.0.1", () => {
    console.log(`Serving SnapEats frontend from ${rootDirectory}`);
    console.log(`Frontend URL: http://localhost:${port}/`);
    console.log(`Proxying /api to ${backendBaseUrl.origin}/api`);
    console.log("Press Ctrl+C to stop.");
});

process.on("SIGINT", () => {
    server.close(() => process.exit(0));
});
