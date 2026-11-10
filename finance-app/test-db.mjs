import { neon } from "@neondatabase/serverless";
//import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);
console.log(await sql`select 1 as ok`);
// in test-db.mjs
console.log("script len:", process.env.DATABASE_URL.length, "last char:", JSON.stringify(process.env.DATABASE_URL.slice(-1)));