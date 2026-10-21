import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const rows = await sql`SELECT 1 AS ok`;
    return res.status(200).json({ ok: rows[0]?.ok === 1 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false });
  }
}
