import "dotenv/config";
import { createDatabase } from "./db.js";

const path = process.env.DATABASE_PATH ?? "./data/steward.sqlite";
const database = createDatabase(path);
console.log(`Initialized Discord Steward database at ${database.path}`);
database.sqlite.close();
