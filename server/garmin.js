import crypto from "node:crypto";
import { sql } from "./mood-auth.js";

function key(){
  const raw=process.env.GARMIN_TOKEN_ENCRYPTION_KEY;
  if(!raw) throw new Error("GARMIN_TOKEN_ENCRYPTION_KEY ausente.");
  const buf=Buffer.from(raw,"base64url");
  if(buf.length!==32) throw new Error("GARMIN_TOKEN_ENCRYPTION_KEY inválida.");
  return buf;
}

export function encrypt(value){
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv("aes-256-gcm",key(),iv);
  const encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);
  const tag=cipher.getAuthTag();
  return [iv,tag,encrypted].map(x=>x.toString("base64url")).join(".");
}

export function signState(userId){
  const secret=process.env.GARMIN_STATE_SECRET;
  if(!secret) throw new Error("GARMIN_STATE_SECRET ausente.");
  const payload=Buffer.from(JSON.stringify({userId,exp:Date.now()+10*60*1000,nonce:crypto.randomUUID()})).toString("base64url");
  const sig=crypto.createHmac("sha256",secret).update(payload).digest("base64url");
  return payload+"."+sig;
}

export function readState(state){
  const secret=process.env.GARMIN_STATE_SECRET;
  const [payload,sig]=String(state||"").split(".");
  if(!payload||!sig||!secret) throw new Error("Estado OAuth inválido.");
  const expected=crypto.createHmac("sha256",secret).update(payload).digest("base64url");
  if(!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected))) throw new Error("Estado OAuth inválido.");
  const data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));
  if(Date.now()>data.exp) throw new Error("Estado OAuth expirado.");
  return data;
}

export async function exchangeCode(code){
  const body=new URLSearchParams({
    grant_type:"authorization_code",
    code,
    redirect_uri:process.env.GARMIN_REDIRECT_URI,
    client_id:process.env.GARMIN_CLIENT_ID,
    client_secret:process.env.GARMIN_CLIENT_SECRET
  });
  const response=await fetch(process.env.GARMIN_TOKEN_URL,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
  const data=await response.json();
  if(!response.ok) throw new Error(data.error_description||data.error||"Falha ao concluir conexão Garmin.");
  return data;
}

export async function saveConnection(profileId,token){
  await sql`
    INSERT INTO garmin_connections(profile_id,access_token_encrypted,refresh_token_encrypted,expires_at,scopes,updated_at)
    VALUES(
      ${profileId},
      ${encrypt(token.access_token)},
      ${token.refresh_token?encrypt(token.refresh_token):null},
      ${token.expires_in?new Date(Date.now()+Number(token.expires_in)*1000).toISOString():null},
      ${String(token.scope||"").split(" ").filter(Boolean)},
      now()
    )
    ON CONFLICT(profile_id) DO UPDATE SET
      access_token_encrypted=EXCLUDED.access_token_encrypted,
      refresh_token_encrypted=COALESCE(EXCLUDED.refresh_token_encrypted,garmin_connections.refresh_token_encrypted),
      expires_at=EXCLUDED.expires_at,
      scopes=EXCLUDED.scopes,
      updated_at=now()
  `;
}