import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Set DATABASE_URL in .env.local (dev) and in the Vercel project's
// environment variables (production). Get a free Postgres URL at
// https://neon.tech — create a project, copy the "pooled connection"
// string, done.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // We don't throw here so `next build` still works before the env
  // var is configured. Every real query will fail loudly instead,
  // which is easier to debug than a silent build-time crash.
  console.warn(
    "[db] DATABASE_URL is not set. Add it to .env.local, see README.md."
  );
}

// A syntactically-valid placeholder so `next build` can statically
// analyze routes even before DATABASE_URL is configured. Any real
// query made against it will fail at request time with a clear
// connection error — not silently, and not at build time.
const sql = neon(connectionString ?? "postgres://user:pass@localhost/db");
export const db = drizzle(sql, { schema });
