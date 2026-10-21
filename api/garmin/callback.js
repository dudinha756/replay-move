import crypto from "node:crypto";

function cookie(req,name){
  const raw=req.headers.cookie || "";
  const hit=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="));
  return hit ? decodeURIComponent(hit.slice(name.length+1)) : "";
}

function encrypt(value){
  const keyRaw=process.env.GARMIN_TOKEN_ENCRYPTION_KEY;
  if(!keyRaw) throw new Error("GARMIN_TOKEN_ENCRYPTION_KEY missing");
  const key=Buffer.from(keyRaw,"base64");
  if(key.length!==32) throw new Error("GARMIN_TOKEN_ENCRYPTION_KEY must decode to 32 bytes");
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv("aes-256-gcm",key,iv);
  const ciphertext=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);
  const tag=cipher.getAuthTag();
  return Buffer.concat([iv,tag,ciphertext]).toString("base64");
}

export default async function handler(req,res){
  try{
    const {code,state}=req.query || {};
    const expected=cookie(req,"m2m_garmin_state");
    if(!code || !state || !expected || state!==expected) return res.status(400).send("Invalid Garmin OAuth state.");

    const {GARMIN_CLIENT_ID,GARMIN_CLIENT_SECRET,GARMIN_TOKEN_URL,GARMIN_REDIRECT_URI}=process.env;
    if(!GARMIN_CLIENT_ID || !GARMIN_CLIENT_SECRET || !GARMIN_TOKEN_URL || !GARMIN_REDIRECT_URI){
      return res.status(503).send("Garmin integration is not configured.");
    }

    const tokenRes=await fetch(GARMIN_TOKEN_URL,{
      method:"POST",
      headers:{"content-type":"application/x-www-form-urlencoded","authorization":"Basic "+Buffer.from(GARMIN_CLIENT_ID+":"+GARMIN_CLIENT_SECRET).toString("base64")},
      body:new URLSearchParams({grant_type:"authorization_code",code:String(code),redirect_uri:GARMIN_REDIRECT_URI})
    });
    if(!tokenRes.ok) return res.status(502).send("Garmin token exchange failed.");
    const token=await tokenRes.json();

    const payload={
      access_token_encrypted:token.access_token ? encrypt(token.access_token) : null,
      refresh_token_encrypted:token.refresh_token ? encrypt(token.refresh_token) : null,
      token_type:token.token_type || null,
      scope:token.scope || null,
      expires_in:token.expires_in || null,
      received_at:new Date().toISOString()
    };

    // Storage is activated after the Neon Garmin schema is approved/applied.
    // For safety, tokens are never returned to the browser.
    const secure=process.env.NODE_ENV==="production" ? "; Secure" : "";
    res.setHeader("Set-Cookie",[
      `m2m_garmin_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`,
      `m2m_garmin_pending=${encodeURIComponent(Buffer.from(JSON.stringify(payload)).toString("base64"))}; HttpOnly; SameSite=Lax; Path=/; Max-Age=300${secure}`
    ]);
    return res.redirect("/?garmin=connected");
  }catch(error){
    return res.status(500).send("Garmin connection could not be completed.");
  }
}
