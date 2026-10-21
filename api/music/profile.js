import { requireMoodUser, getOrCreateProfileId, sql } from "../../server/mood-auth.js";

function cleanList(value){
  if(!Array.isArray(value)) return [];
  return [...new Set(value.map(x=>String(x).trim()).filter(Boolean))].slice(0,40);
}

export default async function handler(req,res){
  try{
    const userId=await requireMoodUser(req);
    const profileId=await getOrCreateProfileId(userId);

    if(req.method==="GET"){
      const rows=await sql`
        SELECT favorite_artists,favorite_genres,favorite_songs,preferred_eras,discovery_mode
        FROM music_profiles
        WHERE profile_id=${profileId}
      `;
      const row=rows[0] || {};
      return res.status(200).json({
        profile:{
          favoriteArtists:row.favorite_artists || [],
          favoriteGenres:row.favorite_genres || [],
          favoriteSongs:row.favorite_songs || [],
          preferredEras:row.preferred_eras || [],
          discoveryMode:row.discovery_mode || "balanced"
        }
      });
    }

    if(req.method==="PUT"){
      const body=req.body || {};
      const favoriteArtists=cleanList(body.favoriteArtists);
      const favoriteGenres=cleanList(body.favoriteGenres);
      const favoriteSongs=cleanList(body.favoriteSongs);
      const preferredEras=cleanList(body.preferredEras);
      const discoveryMode=["familiar","balanced","discover"].includes(body.discoveryMode) ? body.discoveryMode : "balanced";

      await sql`
        INSERT INTO music_profiles(
          profile_id,favorite_artists,favorite_genres,favorite_songs,preferred_eras,discovery_mode
        )
        VALUES(
          ${profileId},${favoriteArtists},${favoriteGenres},${favoriteSongs},${preferredEras},${discoveryMode}
        )
        ON CONFLICT(profile_id)
        DO UPDATE SET
          favorite_artists=EXCLUDED.favorite_artists,
          favorite_genres=EXCLUDED.favorite_genres,
          favorite_songs=EXCLUDED.favorite_songs,
          preferred_eras=EXCLUDED.preferred_eras,
          discovery_mode=EXCLUDED.discovery_mode,
          updated_at=now()
      `;
      return res.status(200).json({ok:true});
    }

    res.setHeader("Allow","GET, PUT");
    return res.status(405).json({error:"Método não permitido."});
  }catch(error){
    return res.status(error.statusCode || 500).json({error:error.message || "Erro ao salvar perfil musical."});
  }
}
