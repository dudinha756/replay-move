import { requireMoodUser } from "../../server/mood-auth.js";
import { signState } from "../../server/garmin.js";

export default async function handler(req,res){
  try{
    if(req.method!=="POST") return res.status(405).json({error:"Método não permitido."});
    const userId=await requireMoodUser(req);
    const required=["GARMIN_CLIENT_ID","GARMIN_CLIENT_SECRET","GARMIN_AUTHORIZATION_URL","GARMIN_TOKEN_URL","GARMIN_REDIRECT_URI","GARMIN_STATE_SECRET","GARMIN_TOKEN_ENCRYPTION_KEY"];
    const missing=required.filter(k=>!process.env[k]);
    if(missing.length) return res.status(503).json({error:"A integração oficial Garmin ainda precisa ser ativada no Garmin Connect Developer Program."});

    const url=new URL(process.env.GARMIN_AUTHORIZATION_URL);
    url.searchParams.set("response_type","code");
    url.searchParams.set("client_id",process.env.GARMIN_CLIENT_ID);
    url.searchParams.set("redirect_uri",process.env.GARMIN_REDIRECT_URI);
    url.searchParams.set("state",signState(userId));
    if(process.env.GARMIN_SCOPES) url.searchParams.set("scope",process.env.GARMIN_SCOPES);
    return res.status(200).json({url:url.toString()});
  }catch(error){
    return res.status(error.statusCode||500).json({error:error.message||"Falha ao iniciar conexão Garmin."});
  }
}