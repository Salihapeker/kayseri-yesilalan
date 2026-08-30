import pkg from "pg";
import "dotenv/config";
import { readFile } from "node:fs/promises";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function semayiKur() {
  const sql = await readFile(new URL("./database/init.sql", import.meta.url), "utf8");
  await pool.query(sql);
}

export default pool;
