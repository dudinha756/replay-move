import { requireMoodUser, getOrCreateProfileId, sql } from "../../server/mood-auth.js";

export default async function handler(req,res){
  try{
    if(req.method!=="GET") return res.status(405).json({error:"Método não permitido."});
    const userId=await requireMoodUser(req);
    const profileId=await getOrCreateProfileId(userId);
    const configured=Boolean(
      process.env.GARMIN_CLIENT_ID &&
      process.env.GARMIN_CLIENT_SECRET &&
      process.env.GARMIN_AUTHORIZATION_URL &&
      process.env.GARMIN_TOKEN_URL &&
      process.env.GARMIN_REDIRECT_URI &&
      process.env.GARMIN_STATE_SECRET &&
      process.env.GARMIN_TOKEN_ENCRYPTION_KEY
    );
    let connected=false;
    try{
      const rows=await sql`SELECT 1 FROM garmin_connections WHERE profile_id=${profileId} LIMIT 1`;
      connected=Boolean(rows.length);
    }catch{
      connected=false;
    }
    return res.status(200).json({configured,connected});
  }catch(error){
    return res.status(error.statusCode||500).json({error:error.message||"Falha ao verificar Garmin."});
  }
}