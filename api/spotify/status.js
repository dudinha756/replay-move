import { requireMoodUser, getOrCreateProfileId, sql } from "../../server/mood-auth.js";
import { spotifyConfigured } from "../../server/spotify.js";

export default async function handler(req,res) {
  try {
    if (req.method !== "GET") return res.status(405).json({error:"Método não permitido."});
    const userId = await requireMoodUser(req);
    const profileId = await getOrCreateProfileId(userId);
    const rows = await sql`
      SELECT spotify_display_name, connected_at
      FROM spotify_connections
      WHERE profile_id = ${profileId}
    `;
    return res.status(200).json({
      configured:spotifyConfigured(),
      connected:Boolean(rows.length),
      displayName:rows[0]?.spotify_display_name || null,
      connectedAt:rows[0]?.connected_at || null
    });
  } catch(error) {
    return res.status(error.statusCode || 500).json({error:error.message || "Falha ao verificar Spotify."});
  }
}
