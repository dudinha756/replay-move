import { getOrCreateProfileId } from "../../server/mood-auth.js";
import { exchangeCode, readState, saveConnection } from "../../server/garmin.js";

export default async function handler(req,res){
  const app=process.env.APP_BASE_URL||"https://replay-move.vercel.app";
  try{
    if(req.query?.error) return res.redirect(app+"/?garmin=denied");
    const code=req.query?.code,state=req.query?.state;
    if(!code||!state) throw new Error("Retorno Garmin incompleto.");
    const {userId}=readState(state);
    const token=await exchangeCode(code);
    const profileId=await getOrCreateProfileId(userId);
    await saveConnection(profileId,token);
    return res.redirect(app+"/?garmin=connected");
  }catch(error){
    console.error(error);
    return res.redirect(app+"/?garmin=error");
  }
}