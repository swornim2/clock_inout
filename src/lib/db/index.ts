import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/http";
import * as schema from "./schema";

const rawUrl = process.env.TURSO_DATABASE_URL!;
const url = rawUrl.replace(/^libsql:\/\//, "https://");

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
