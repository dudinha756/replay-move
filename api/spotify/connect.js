import { requireMoodUser } from "../../server/mood-auth.js";
import { createSpotifyState, spotifyConfigured } from "../../server/spotify.js";

const scopes = [
  "user-top-read",
  "user-library-read",
  "user-read-private",
  "playlist-modify-private"
];

export default async function handler(req,res) {
  try {
    if (req.method !== "POST") return res.status(405).json({error:"Método não permitido."});
    const userId = await requireMoodUser(req);
    if (!spotifyConfigured()) return res.status(503).json({error:"A integração Spotify ainda precisa das credenciais do app."});

    const state = createSpotifyState(userId);
    const url = new URL("https://accounts.spotify.com/authorize");
    url.search = new URLSearchParams({
      response_type:"code",
      client_id:process.env.SPOTIFY_CLIENT_ID,
      scope:scopes.join(" "),
      redirect_uri:process.env.SPOTIFY_REDIRECT_URI,
      state,
      show_dialog:"true"
    }).toString();

    return res.status(200).json({url:url.toString()});
  } catch(error) {
    return res.status(error.statusCode || 500).json({error:error.message || "Falha ao iniciar conexão Spotify."});
  }
}
