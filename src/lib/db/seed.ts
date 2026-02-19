import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client, { schema });

async function main() {
  console.log("Seeding database...");

  const employeesData = [
    { name: "Sarah Johnson", pin: "1234" },
    { name: "Michael Chen", pin: "5678" },
    { name: "Emma Davis", pin: "9876" },
    { name: "James Wilson", pin: "4321" },
    { name: "Olivia Brown", pin: "8765" },
    { name: "William Garcia", pin: "1111" },
    { name: "Sophia Martinez", pin: "2222" },
    { name: "Benjamin Lee", pin: "3333" },
  ];

  await db.insert(schema.employees).values(employeesData);

  console.log("Database seeded successfully!");
}

main();
