import crypto from "node:crypto";
import { sql } from "./mood-auth.js";

const apiBase = "https://api.spotify.com/v1";

function secretKey() {
  const raw = process.env.SPOTIFY_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("SPOTIFY_TOKEN_ENCRYPTION_KEY ausente.");
  const key = Buffer.from(raw, "base64url");
  if (key.length !== 32) throw new Error("SPOTIFY_TOKEN_ENCRYPTION_KEY inválida.");
  return key;
}

export function encryptSecret(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map(x=>x.toString("base64url")).join(".");
}

export function decryptSecret(value) {
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(ivRaw,"base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw,"base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw,"base64url")),
    decipher.final()
  ]).toString("utf8");
}

export function createSpotifyState(userId) {
  const payload = JSON.stringify({ userId, exp: Date.now() + 10 * 60 * 1000, nonce: crypto.randomUUID() });
  return encryptSecret(payload);
}

export function readSpotifyState(state) {
  const value = JSON.parse(decryptSecret(state));
  if (!value.userId || Date.now() > value.exp) throw new Error("Estado OAuth expirado.");
  return value;
}

export function spotifyConfigured() {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_CLIENT_SECRET &&
    process.env.SPOTIFY_REDIRECT_URI
  );
}

export async function spotifyRequest(path, accessToken, options={}) {
  const response = await fetch(path.startsWith("http") ? path : apiBase + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Spotify API ${response.status}: ${body.slice(0,300)}`);
    error.statusCode = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function exchangeCode(code) {
  const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method:"POST",
    headers:{
      Authorization:`Basic ${basic}`,
      "Content-Type":"application/x-www-form-urlencoded"
    },
    body:new URLSearchParams({
      grant_type:"authorization_code",
      code,
      redirect_uri:process.env.SPOTIFY_REDIRECT_URI
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || "Falha ao conectar Spotify.");
  return data;
}

export async function refreshSpotifyToken(refreshToken) {
  const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method:"POST",
    headers:{
      Authorization:`Basic ${basic}`,
      "Content-Type":"application/x-www-form-urlencoded"
    },
    body:new URLSearchParams({
      grant_type:"refresh_token",
      refresh_token:refreshToken
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || "Sua conexão Spotify precisa ser renovada.");
  return data;
}

export async function getSpotifyAccess(profileId) {
  const rows = await sql`
    SELECT refresh_token_encrypted
    FROM spotify_connections
    WHERE profile_id = ${profileId}
  `;
  if (!rows.length) {
    const error = new Error("Spotify não conectado.");
    error.statusCode = 409;
    throw error;
  }
  const refresh = decryptSecret(rows[0].refresh_token_encrypted);
  const token = await refreshSpotifyToken(refresh);
  if (token.refresh_token) {
    await sql`
      UPDATE spotify_connections
      SET refresh_token_encrypted = ${encryptSecret(token.refresh_token)}, updated_at = now()
      WHERE profile_id = ${profileId}
    `;
  }
  return token.access_token;
}

export function dedupeTracks(tracks) {
  const seen = new Set();
  return tracks.filter(track=>{
    if (!track?.uri || seen.has(track.uri)) return false;
    seen.add(track.uri);
    return true;
  });
}
