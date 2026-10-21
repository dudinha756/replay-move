export default async function handler(req,res){
  const configured=Boolean(
    process.env.GARMIN_CLIENT_ID &&
    process.env.GARMIN_CLIENT_SECRET &&
    process.env.GARMIN_AUTH_URL &&
    process.env.GARMIN_TOKEN_URL &&
    process.env.GARMIN_REDIRECT_URI
  );
  return res.status(200).json({
    connected:false,
    available:configured,
    reason:configured ? "" : "A conexão será liberada assim que as credenciais oficiais do Garmin Connect Developer Program forem adicionadas."
  });
}
