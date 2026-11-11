/* For setting up the databse using Postgre */
import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = (process.env.DATABASE_URL || "").trim();

export const db = drizzle({ client: neon(url), schema });