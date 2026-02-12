import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

const dataFile = path.resolve("src/data/cvData.ts");
const source = fs.readFileSync(dataFile, "utf8");
const applyFixes = process.argv.includes("--apply");

const redTigerGamesRegex = /(id:\s*"pf-redtiger"[\s\S]*?games:\s*\[)([\s\S]*?)(\n\s*\],)/m;
const match = source.match(redTigerGamesRegex);
if (!match) {
  console.error("Could not locate Red Tiger games block in cvData.ts");
  process.exit(1);
}

const gameEntryRegex = /\{\s*name:\s*"([^"]+)"(?:\s*,\s*url:\s*"([^"]+)")?\s*\}/g;
const games = [];
let gameMatch;
while ((gameMatch = gameEntryRegex.exec(match[2])) !== null) {
  games.push({ name: gameMatch[1], url: gameMatch[2] || "" });
}

function slugify(value) {
  return value
    .replace(/mega\s*ways/gi, "megaways")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "-")
    .replace(/[']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function headRequest(url, redirectCount = 0) {
  const client = url.startsWith("https://") ? https : http;

  return new Promise((resolve) => {
    const req = client.request(
      url,
      { method: "HEAD", timeout: 10000 },
      (res) => {
        const status = res.statusCode || 0;
        const location = res.headers.location;

        if (status >= 300 && status < 400 && location && redirectCount < 5) {
          const nextUrl = new URL(location, url).toString();
          resolve(headRequest(nextUrl, redirectCount + 1));
          return;
        }

        resolve({ status, finalUrl: url, error: null });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("timeout"));
    });

    req.on("error", (err) => {
      resolve({ status: 0, finalUrl: url, error: err.message });
    });

    req.end();
  });
}

function buildRetryCandidates(name, baseSlug) {
  const candidates = new Set();
  const noThe = slugify(name.replace(/\bthe\b/gi, " "));
  const noNumbers = slugify(name.replace(/\d+/g, " "));
  const andVariant = slugify(name.replace(/&/g, " and "));

  if (noThe && noThe !== baseSlug) candidates.add(noThe);
  if (noNumbers && noNumbers !== baseSlug) candidates.add(noNumbers);
  if (andVariant && andVariant !== baseSlug) candidates.add(andVariant);

  if (baseSlug.endsWith("s") && baseSlug.length > 1) {
    candidates.add(baseSlug.replace(/s$/, ""));
  } else {
    candidates.add(`${baseSlug}s`);
  }

  if (baseSlug.includes("judgment")) {
    candidates.add(baseSlug.replace(/judgment/g, "judgement"));
  }
  if (baseSlug.includes("judgement")) {
    candidates.add(baseSlug.replace(/judgement/g, "judgment"));
  }

  return Array.from(candidates).slice(0, 4);
}

const results = [];

for (const game of games) {
  const baseSlug = game.url ? game.url.split("/").pop() || slugify(game.name) : slugify(game.name);
  const primaryUrl = `https://redtiger.com/games/${baseSlug}`;

  let res = await headRequest(primaryUrl);
  let attemptedUrl = primaryUrl;

  if (!(res.status >= 200 && res.status <= 399)) {
    const retries = buildRetryCandidates(game.name, baseSlug);
    for (const retrySlug of retries) {
      const retryUrl = `https://redtiger.com/games/${retrySlug}`;
      const retryRes = await headRequest(retryUrl);
      if (retryRes.status >= 200 && retryRes.status <= 399) {
        res = retryRes;
        attemptedUrl = retryUrl;
        break;
      }
      if (res.status === 0) {
        res = retryRes;
        attemptedUrl = retryUrl;
      }
    }
  }

  results.push({
    title: game.name,
    url: attemptedUrl,
    status: res.status,
    error: res.error,
    valid: res.status >= 200 && res.status <= 399,
  });
}

if (applyFixes) {
  const indent = "        ";
  const rewrittenGames = "\n" + results
    .map((row) => `${indent}{ name: \"${row.title}\", url: \"${row.url}\" },`)
    .join("\n");

  const updatedSource = source.replace(redTigerGamesRegex, `$1${rewrittenGames}$3`);
  fs.writeFileSync(dataFile, updatedSource, "utf8");
  console.log("\nApplied validated URLs to src/data/cvData.ts");
}

console.log("TITLE | STATUS | URL");
for (const row of results) {
  const statusText = row.status ? String(row.status) : `ERR(${row.error || "network"})`;
  console.log(`${row.title} | ${statusText} | ${row.url}`);
}

const valid = results.filter((r) => r.valid);
const broken = results.filter((r) => !r.valid);

console.log("\nSUMMARY");
console.log(`Valid: ${valid.length}`);
console.log(`Broken: ${broken.length}`);
console.log(`Valid %: ${((valid.length / results.length) * 100).toFixed(1)}%`);

if (broken.length) {
  console.log("\nBROKEN URLS");
  for (const row of broken) {
    const reason = row.status ? `HTTP ${row.status}` : row.error || "network";
    console.log(`- ${row.title}: ${row.url} (${reason})`);
  }
}
