import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { ENV } from "./env.js";

//so whatever in schema.js will be imported here
import * as schema from "../db/schema.js";

const sql = neon(ENV.DATABASE_URL);

export const db = drizzle(sql, { schema });