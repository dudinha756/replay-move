import { requireMoodUser, getOrCreateProfileId, sql } from "../../server/mood-auth.js";
import { getSpotifyAccess, spotifyRequest, dedupeTracks, spotifyConfigured } from "../../server/spotify.js";

function artistNames(track) {
  return (track.artists || []).map(a=>a.name).filter(Boolean);
}

function chooseTracks({topShort, topMedium, saved, discovered, durationMinutes, discovery}) {
  const weights = new Map();
  const add = (track, score) => {
    if (!track?.uri || !track?.duration_ms) return;
    const previous = weights.get(track.uri);
    if (!previous || previous.score < score) weights.set(track.uri,{track,score});
  };

  topShort.forEach((t,i)=>add(t, 120-i*2));
  topMedium.forEach((t,i)=>add(t, 100-i));
  saved.forEach((t,i)=>add(t, discovery==="familiar" ? 95-i*.2 : 72-i*.2));
  discovered.forEach((t,i)=>add(t, discovery==="discover" ? 105-i*.5 : discovery==="balanced" ? 82-i*.5 : 52-i*.5));

  let ranked=[...weights.values()].sort((a,b)=>b.score-a.score).map(x=>x.track);

  if (discovery==="discover") {
    const known = new Set([...topShort,...topMedium].map(t=>t.uri));
    ranked = [...ranked.filter(t=>!known.has(t.uri)), ...ranked.filter(t=>known.has(t.uri))];
  }

  const targetMs = durationMinutes * 60 * 1000;
  const minMs = Math.max(5*60*1000, targetMs - 2.5*60*1000);
  const maxMs = targetMs + 3*60*1000;
  const selected=[];
  let total=0;

  for (const track of ranked) {
    if (selected.length >= 100) break;
    if (total >= minMs && total + track.duration_ms > maxMs) continue;
    selected.push(track);
    total += track.duration_ms;
    if (total >= targetMs) break;
  }
  return {selected,totalMs:total};
}

export default async function handler(req,res) {
  try {
    if (req.method !== "POST") return res.status(405).json({error:"Método não permitido."});
    if (!spotifyConfigured()) return res.status(503).json({error:"A integração Spotify ainda precisa das credenciais do app."});

    const userId = await requireMoodUser(req);
    const profileId = await getOrCreateProfileId(userId);
    const access = await getSpotifyAccess(profileId);

    const body=req.body || {};
    const durationMinutes=Math.max(5,Math.min(120,Number(body.durationMinutes)||20));
    const discovery=["familiar","balanced","discover"].includes(body.discovery) ? body.discovery : "balanced";
    const activity=String(body.activity || "Movimento");
    const targetMood=String(body.targetMood || "");
    const intensity=String(body.intensity || "");

    const [shortData,mediumData,savedData,artistData] = await Promise.all([
      spotifyRequest("/me/top/tracks?time_range=short_term&limit=30",access),
      spotifyRequest("/me/top/tracks?time_range=medium_term&limit=30",access),
      spotifyRequest("/me/tracks?limit=40",access),
      spotifyRequest("/me/top/artists?time_range=medium_term&limit=8",access)
    ]);

    const topShort=shortData.items || [];
    const topMedium=mediumData.items || [];
    const saved=(savedData.items || []).map(x=>x.track || x.item).filter(Boolean);
    const topArtists=artistData.items || [];

    const discovered=[];
    const searchArtists=topArtists.slice(0,6);
    for (const artist of searchArtists) {
      const query=encodeURIComponent(`artist:"${artist.name}"`);
      const found=await spotifyRequest(`/search?q=${query}&type=track&limit=10`,access);
      const items=found.tracks?.items || [];
      discovered.push(...items);
    }

    const {selected,totalMs}=chooseTracks({
      topShort,
      topMedium,
      saved,
      discovered:dedupeTracks(discovered),
      durationMinutes,
      discovery
    });

    if (!selected.length) return res.status(422).json({error:"Não encontramos faixas suficientes para montar a playlist."});

    const moodLabel = targetMood ? ` · ${targetMood}` : "";
    const playlistName = `Mood → Movement · ${activity}${moodLabel}`;
    const description = `Criada pelo Mood → Movement para ${durationMinutes} min. Baseada nos seus gostos autorizados no Spotify e no contexto da atividade.`;

    const playlist=await spotifyRequest("/me/playlists",access,{
      method:"POST",
      body:JSON.stringify({
        name:playlistName.slice(0,100),
        public:false,
        collaborative:false,
        description:description.slice(0,300)
      })
    });

    await spotifyRequest(`/playlists/${playlist.id}/items`,access,{
      method:"POST",
      body:JSON.stringify({uris:selected.map(t=>t.uri)})
    });

    const tasteBasis={
      mode:discovery,
      topArtists:topArtists.slice(0,5).map(a=>a.name),
      sourceCounts:{
        shortTerm:topShort.length,
        mediumTerm:topMedium.length,
        saved:saved.length,
        discovered:discovered.length
      }
    };

    await sql`
      INSERT INTO generated_playlists (
        profile_id, spotify_playlist_id, spotify_playlist_url, name,
        activity, target_mood, intensity, duration_minutes,
        taste_basis, track_count
      )
      VALUES (
        ${profileId}, ${playlist.id}, ${playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`},
        ${playlistName}, ${activity}, ${targetMood || null}, ${intensity || null},
        ${durationMinutes}, ${JSON.stringify(tasteBasis)}::jsonb, ${selected.length}
      )
    `;

    return res.status(201).json({
      playlist:{
        id:playlist.id,
        name:playlistName,
        url:playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`,
        trackCount:selected.length,
        durationMinutes:Math.round(totalMs/60000),
        tasteBasis
      }
    });
  } catch(error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({error:error.message || "Não foi possível criar a playlist."});
  }
}
