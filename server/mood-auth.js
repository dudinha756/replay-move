import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";

export const sql = neon(process.env.DATABASE_URL);
const JWKS = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL));

export async function requireMoodUser(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    const error = new Error("Sessão inválida ou expirada.");
    error.statusCode = 401;
    throw error;
  }
  const { payload } = await jwtVerify(header.slice(7), JWKS);
  if (!payload.sub) {
    const error = new Error("Sessão inválida.");
    error.statusCode = 401;
    throw error;
  }
  return payload.sub;
}

export async function getOrCreateProfileId(userId) {
  const rows = await sql`
    INSERT INTO app_profiles (auth_user_id)
    VALUES (${userId})
    ON CONFLICT (auth_user_id)
    DO UPDATE SET updated_at = now()
    RETURNING id
  `;
  return rows[0].id;
}
