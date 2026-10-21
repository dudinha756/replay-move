import { requireMoodUser, getOrCreateProfileId, sql } from "../../server/mood-auth.js";

function spotifySearch(query){
  return "https://open.spotify.com/search/" + encodeURIComponent(query);
}

function rotate(list,offset=0){
  if(!list.length) return [];
  const n=offset % list.length;
  return [...list.slice(n),...list.slice(0,n)];
}

function buildItems(profile, context){
  const mode=context.discoveryMode || profile.discoveryMode || "balanced";
  const count=Math.max(3,Math.min(20,Math.round((context.durationMinutes || 20)/3.5)));
  const songs=rotate(profile.favoriteSongs || [],1);
  const artists=rotate(profile.favoriteArtists || [],2);
  const genres=rotate(profile.favoriteGenres || [],3);
  const eras=rotate(profile.preferredEras || [],1);

  const pool=[];
  songs.forEach(song=>pool.push({
    kind:"favorite",
    label:song,
    subtitle:"Uma das suas músicas favoritas",
    query:song
  }));

  artists.forEach((artist,i)=>{
    const genre=genres[i % Math.max(genres.length,1)] || "";
    const era=eras[i % Math.max(eras.length,1)] || "";
    const query=[artist,genre,era,context.activity,context.targetMood].filter(Boolean).join(" ");
    pool.push({
      kind:"artist",
      label:`Explore ${artist}`,
      subtitle:[genre,era].filter(Boolean).join(" · ") || "Baseado em um artista favorito",
      query
    });
  });

  genres.forEach((genre,i)=>{
    const era=eras[i % Math.max(eras.length,1)] || "";
    const query=[genre,era,context.targetMood,context.activity].filter(Boolean).join(" ");
    pool.push({
      kind:"genre",
      label:`${genre}${era ? " · "+era : ""}`,
      subtitle:"Busca de descoberta dentro do seu gosto",
      query
    });
  });

  if(!pool.length){
    pool.push({
      kind:"starter",
      label:"Comece pelo seu perfil musical",
      subtitle:"Adicione artistas, gêneros ou músicas favoritas",
      query:[context.activity,context.targetMood,"workout"].filter(Boolean).join(" ")
    });
  }

  let ordered=[...pool];
  if(mode==="familiar"){
    ordered.sort((a,b)=>({favorite:0,artist:1,genre:2,starter:3}[a.kind]-({favorite:0,artist:1,genre:2,starter:3}[b.kind])));
  }else if(mode==="discover"){
    ordered.sort((a,b)=>({genre:0,artist:1,favorite:2,starter:3}[a.kind]-({genre:0,artist:1,favorite:2,starter:3}[b.kind])));
  }

  const items=[];
  for(let i=0;i<count;i++){
    const base=ordered[i % ordered.length];
    const suffix=i>=ordered.length ? ` ${i+1}` : "";
    items.push({
      ...base,
      id:`${i+1}-${base.kind}`,
      url:spotifySearch(base.query + suffix)
    });
  }
  return items;
}

export default async function handler(req,res){
  try{
    if(req.method!=="POST") return res.status(405).json({error:"Método não permitido."});
    const userId=await requireMoodUser(req);
    const profileId=await getOrCreateProfileId(userId);

    const rows=await sql`
      SELECT favorite_artists,favorite_genres,favorite_songs,preferred_eras,discovery_mode
      FROM music_profiles
      WHERE profile_id=${profileId}
    `;
    const row=rows[0] || {};
    const profile={
      favoriteArtists:row.favorite_artists || [],
      favoriteGenres:row.favorite_genres || [],
      favoriteSongs:row.favorite_songs || [],
      preferredEras:row.preferred_eras || [],
      discoveryMode:row.discovery_mode || "balanced"
    };

    const body=req.body || {};
    const context={
      activity:String(body.activity || "Movimento"),
      targetMood:String(body.targetMood || ""),
      intensity:String(body.intensity || ""),
      durationMinutes:Math.max(5,Math.min(120,Number(body.durationMinutes)||20)),
      discoveryMode:["familiar","balanced","discover"].includes(body.discoveryMode) ? body.discoveryMode : profile.discoveryMode
    };

    const items=buildItems(profile,context);
    const title=`Mood → Movement · ${context.activity}`;

    const saved=await sql`
      INSERT INTO suggested_playlists(
        profile_id,title,activity,target_mood,intensity,duration_minutes,discovery_mode,items
      )
      VALUES(
        ${profileId},${title},${context.activity},${context.targetMood || null},
        ${context.intensity || null},${context.durationMinutes},${context.discoveryMode},
        ${JSON.stringify(items)}::jsonb
      )
      RETURNING id,created_at
    `;

    return res.status(201).json({
      playlist:{
        id:saved[0].id,
        title,
        durationMinutes:context.durationMinutes,
        discoveryMode:context.discoveryMode,
        items,
        createdAt:saved[0].created_at
      }
    });
  }catch(error){
    return res.status(error.statusCode || 500).json({error:error.message || "Não foi possível gerar a playlist."});
  }
}
