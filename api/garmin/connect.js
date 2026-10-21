import crypto from "node:crypto";

export default async function handler(req,res){
  const {GARMIN_CLIENT_ID,GARMIN_AUTH_URL,GARMIN_REDIRECT_URI,GARMIN_SCOPES}=process.env;
  if(!GARMIN_CLIENT_ID || !GARMIN_AUTH_URL || !GARMIN_REDIRECT_URI){
    return res.status(503).json({
      message:"Integração preparada. Falta a aprovação do Garmin Connect Developer Program e as credenciais oficiais."
    });
  }

  const state=crypto.randomBytes(24).toString("hex");
  const secure=process.env.NODE_ENV==="production" ? "; Secure" : "";
  res.setHeader("Set-Cookie",`m2m_garmin_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secure}`);

  const url=new URL(GARMIN_AUTH_URL);
  url.searchParams.set("client_id",GARMIN_CLIENT_ID);
  url.searchParams.set("response_type","code");
  url.searchParams.set("redirect_uri",GARMIN_REDIRECT_URI);
  url.searchParams.set("state",state);
  if(GARMIN_SCOPES) url.searchParams.set("scope",GARMIN_SCOPES);

  return res.status(200).json({url:url.toString()});
}
