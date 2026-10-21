import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";

const sql = neon(process.env.DATABASE_URL);
const JWKS = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL));

async function userIdFromRequest(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const { payload } = await jwtVerify(token, JWKS);
  return payload.sub || null;
}

async function profileIdFor(userId) {
  const rows = await sql`
    INSERT INTO app_profiles (auth_user_id)
    VALUES (${userId})
    ON CONFLICT (auth_user_id)
    DO UPDATE SET updated_at = now()
    RETURNING id
  `;
  return rows[0].id;
}

function toClient(row) {
  return {
    id: row.id,
    date: row.created_at,
    current: row.current_mood,
    target: row.target_mood,
    energy: row.energy,
    environment: row.environment,
    intensity: row.intensity_preference,
    time: row.available_minutes,
    movementId: row.movement_id,
    movement: row.movement_type,
    score: row.recommendation_score == null ? null : Number(row.recommendation_score),
    reasons: row.recommendation_reasons || [],
    after: row.felt_after,
  };
}

export default async function handler(req, res) {
  try {
    const userId = await userIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: "Sessão inválida ou expirada." });
    const profileId = await profileIdFor(userId);

    if (req.method === "GET") {
      const rows = await sql`
        SELECT *
        FROM movement_sessions
        WHERE profile_id = ${profileId}
          AND completed = true
        ORDER BY created_at DESC
        LIMIT 50
      `;
      return res.status(200).json({ sessions: rows.map(toClient) });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const required = ["current","target","energy","environment","intensity","time","movementId","movement","after"];
      const missing = required.filter((key) => body[key] === undefined || body[key] === null || body[key] === "");
      if (missing.length) return res.status(400).json({ error: "Dados incompletos da sessão." });

      const rows = await sql`
        INSERT INTO movement_sessions (
          profile_id, current_mood, target_mood, energy, environment,
          intensity_preference, available_minutes, movement_id, movement_type,
          recommendation_score, recommendation_reasons, felt_after,
          completed, completed_at
        )
        VALUES (
          ${profileId}, ${body.current}, ${body.target}, ${body.energy}, ${body.environment},
          ${body.intensity}, ${Number(body.time)}, ${body.movementId}, ${body.movement},
          ${body.score ?? null}, ${JSON.stringify(body.reasons || [])}::jsonb, ${body.after},
          true, now()
        )
        RETURNING *
      `;
      return res.status(201).json({ session: toClient(rows[0]) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao acessar seu histórico." });
  }
}
