import fs from "node:fs";
import path from "node:path";

const dataFile = path.resolve("src/data/cvData.ts");
const source = fs.readFileSync(dataFile, "utf8");

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
  const name = gameMatch[1].trim();
  if (!name || name === "...") continue;
  games.push({ name, url: gameMatch[2] || "" });
}

if (games.length === 0) {
  console.error("No game entries found in Red Tiger block.");
  process.exit(1);
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

const updatedGames = games.map((game) => ({
  name: game.name,
  url: `https://redtiger.com/games/${slugify(game.name)}`,
}));

const indent = "        ";
const newBlock = "\n" + updatedGames
  .map((game) => `${indent}{ name: \"${game.name}\", url: \"${game.url}\" },`)
  .join("\n");

const updatedSource = source.replace(redTigerGamesRegex, `$1${newBlock}$3`);
fs.writeFileSync(dataFile, updatedSource, "utf8");

console.log(`Generated URLs for ${updatedGames.length} Red Tiger games.`);
