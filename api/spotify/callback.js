import { sql, getOrCreateProfileId } from "../../server/mood-auth.js";
import { exchangeCode, spotifyRequest, readSpotifyState, encryptSecret } from "../../server/spotify.js";

export default async function handler(req,res) {
  const app = process.env.APP_BASE_URL || "https://replay-move.vercel.app";
  try {
    if (req.query?.error) return res.redirect(`${app}/?spotify=denied`);
    const code = req.query?.code;
    const state = req.query?.state;
    if (!code || !state) throw new Error("Retorno do Spotify incompleto.");

    const {userId} = readSpotifyState(state);
    const token = await exchangeCode(code);
    if (!token.refresh_token) throw new Error("Spotify não retornou refresh token.");

    const spotifyUser = await spotifyRequest("/me", token.access_token);
    const profileId = await getOrCreateProfileId(userId);
    const scopes = String(token.scope || "").split(" ").filter(Boolean);

    await sql`
      INSERT INTO spotify_connections (
        profile_id, spotify_user_id, spotify_display_name,
        refresh_token_encrypted, granted_scopes
      )
      VALUES (
        ${profileId}, ${spotifyUser.id}, ${spotifyUser.display_name || null},
        ${encryptSecret(token.refresh_token)}, ${scopes}
      )
      ON CONFLICT (profile_id)
      DO UPDATE SET
        spotify_user_id = EXCLUDED.spotify_user_id,
        spotify_display_name = EXCLUDED.spotify_display_name,
        refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
        granted_scopes = EXCLUDED.granted_scopes,
        updated_at = now()
    `;

    return res.redirect(`${app}/?spotify=connected`);
  } catch(error) {
    console.error(error);
    return res.redirect(`${app}/?spotify=error`);
  }
}
