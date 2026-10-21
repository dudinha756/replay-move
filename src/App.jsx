import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, Brain, Check, Clock3, Dumbbell, ExternalLink,
  Footprints, HeartPulse, History, Home, LogOut, Moon, Music2, Play, RotateCcw,
  Sparkles, Sun, Utensils, Watch, Waves, Wind, Zap, PersonStanding, CircleDot
} from "lucide-react";
import { apiFetch, authClient } from "./auth";

const currentMoods=[
  {id:"tired",label:"Cansada",emoji:"😴",hint:"Pouca disposição"},
  {id:"stressed",label:"Estressada",emoji:"😵‍💫",hint:"Corpo acelerado"},
  {id:"anxious",label:"Ansiosa",emoji:"😬",hint:"Mente inquieta"},
  {id:"neutral",label:"Neutra",emoji:"😐",hint:"Sem um estado forte"},
  {id:"good",label:"Bem",emoji:"🙂",hint:"Disposta a se mover"},
  {id:"energized",label:"Energizada",emoji:"⚡",hint:"Energia sobrando"}
];

const targetMoods=[
  {id:"calm",label:"Mais calma",emoji:"🌿",hint:"Desacelerar"},
  {id:"focused",label:"Mais focada",emoji:"🎯",hint:"Organizar a mente"},
  {id:"energized",label:"Mais energizada",emoji:"🔥",hint:"Ganhar impulso"},
  {id:"strong",label:"Mais forte",emoji:"💪",hint:"Sentir potência"},
  {id:"free",label:"Mais leve",emoji:"🪽",hint:"Soltar corpo e cabeça"},
  {id:"playful",label:"Mais divertida",emoji:"✨",hint:"Mover sem pressão"}
];

const energies=[
  {id:"low",label:"Baixa",emoji:"🪫",hint:"Quero começar bem leve"},
  {id:"medium",label:"Média",emoji:"🔋",hint:"Consigo fazer um pouco mais"},
  {id:"high",label:"Alta",emoji:"⚡",hint:"Quero gastar energia"}
];

const environments=[
  {id:"home",label:"Em casa",icon:Home},
  {id:"gym",label:"Academia",icon:Dumbbell},
  {id:"outdoor",label:"Ao ar livre",icon:Sun},
  {id:"anywhere",label:"Tanto faz",icon:Sparkles}
];

const intensities=[
  {id:"light",label:"Leve",hint:"Quase sem esforço"},
  {id:"moderate",label:"Moderada",hint:"Sinto que trabalhei"},
  {id:"intense",label:"Intensa",hint:"Quero suar"},
  {id:"surprise",label:"Me surpreenda",hint:"Escolha por mim"}
];

const musicPrefs=[
  {id:"yes",label:"Quero música",emoji:"🎧",hint:"Som me ajuda a levantar"},
  {id:"maybe",label:"Talvez",emoji:"🎵",hint:"Me dê a opção"},
  {id:"no",label:"Sem música",emoji:"🤍",hint:"Prefiro silêncio"}
];

const goals=[
  {id:"performance",label:"Ter energia",emoji:"⚡",hint:"Render melhor"},
  {id:"muscle",label:"Ganhar massa",emoji:"💪",hint:"Apoiar hipertrofia"},
  {id:"definition",label:"Definição",emoji:"🔥",hint:"Reduzir gordura preservando massa"},
  {id:"wellbeing",label:"Bem-estar",emoji:"🌿",hint:"Comer bem sem complicar"}
];

const times=[5,10,20,30];

const library=[
  {id:"breath",type:"Respiração guiada",icon:Wind,intensity:"light",min:5,env:["home","gym","outdoor","anywhere"],targets:["calm","focused"],energy:["low","medium","high"],prompt:"Uma pausa ativa para reduzir o ritmo e reorganizar a atenção.",tags:["categoria inspirada no Garmin","sem equipamento"],routines:{
    5:["1 min · respiração natural","3 min · inspire 4s e expire 6s sem forçar","1 min · volte ao ritmo natural"],
    10:["2 min · chegada","6 min · expiração confortável e um pouco mais longa","2 min · atenção ao corpo"],
    20:["3 min · chegada","12 min · respiração lenta e confortável","5 min · escaneamento corporal"],
    30:["5 min · chegada","15 min · respiração lenta","10 min · atenção aberta"]
  }},
  {id:"meditation",type:"Meditação guiada",icon:Brain,intensity:"light",min:5,env:["home","outdoor","anywhere"],targets:["calm","focused","free"],energy:["low","medium","high"],prompt:"Sente-se ou deite-se de forma confortável e crie alguns minutos de espaço mental.",tags:["categoria inspirada no Garmin","baixo atrito"],routines:{
    5:["1 min · escolha uma intenção simples","3 min · observe respiração e sons","1 min · perceba o que mudou"],
    10:["2 min · chegada","6 min · atenção na respiração","2 min · atenção aberta"],
    20:["3 min · chegada","12 min · respiração e sensações","5 min · fechamento"],
    30:["5 min · chegada","15 min · atenção sustentada","10 min · escaneamento corporal"]
  }},
  {id:"mobility",type:"Mobilidade",icon:Waves,intensity:"light",min:5,env:["home","gym","outdoor","anywhere"],targets:["calm","free","focused"],energy:["low","medium"],prompt:"Movimentos controlados para ombros, quadris e coluna, sem buscar amplitude máxima.",tags:["categoria inspirada no Garmin","sem equipamento"],routines:{
    5:["40s · círculos de ombro","40s · gato-vaca","40s · rotação torácica","40s · 90/90 de quadril","40s · tornozelos","1m40 · repita o que mais ajudou"],
    10:["1 min · ombros e pescoço","2 min · gato-vaca + rotação","2 min · quadril","2 min · agachamento assistido + tornozelo","3 min · flow livre"],
    20:["4 min · coluna","5 min · quadril","4 min · tornozelos","4 min · ombros","3 min · flow"],
    30:["5 min · aquecimento articular","8 min · coluna e ombros","8 min · quadril e tornozelos","6 min · agachamento assistido","3 min · flow"]
  }},
  {id:"walk",type:"Caminhada consciente",icon:Footprints,intensity:"light",min:5,env:["outdoor","gym","anywhere"],targets:["calm","focused","free","energized"],energy:["low","medium","high"],prompt:"Caminhe em ritmo confortável. Se quiser energia, aumente gradualmente o passo.",tags:["categoria inspirada no Garmin","baixo impacto"],routines:{
    5:["1 min · passo fácil","3 min · ritmo confortável","1 min · desacelerar"],
    10:["2 min · fácil","6 min · constante","2 min · desacelerar"],
    20:["4 min · fácil","12 min · ritmo vivo e conversável","4 min · fácil"],
    30:["5 min · fácil","20 min · ritmo vivo","5 min · desacelerar"]
  }},
  {id:"dance",type:"Dança livre",icon:Music2,intensity:"moderate",min:5,env:["home","anywhere"],targets:["energized","playful","free"],energy:["low","medium","high"],prompt:"Coloque uma música que dê vontade de levantar. Não precisa saber dançar.",tags:["música","zero técnica"],routines:{
    5:["1 música · marque o ritmo com o corpo","1 música · use braços e passos maiores"],
    10:["2 min · passos simples","6 min · movimento livre","2 min · desacelerar"],
    20:["3 min · aquecer","14 min · dançar","3 min · desacelerar"],
    30:["5 min · aquecer","20 min · bloco principal","5 min · retorno"]
  }},
  {id:"strength",type:"Força essencial",icon:Dumbbell,intensity:"moderate",min:10,env:["home","gym","anywhere"],targets:["strong","focused","energized"],energy:["medium","high"],prompt:"Padrões básicos de força com versões acessíveis e progressão simples.",tags:["força","peso do corpo"],routines:{
    5:["40s · sentar e levantar","40s · flexão na parede/bancada","40s · ponte de glúteos","40s · dead bug","40s · repetir o preferido"],
    10:["2 voltas · 8–12 agachamentos para cadeira","2 voltas · 6–12 flexões adaptadas","2 voltas · 10–15 pontes","2 voltas · 6–10 avanços reversos por lado","2 voltas · 20–30s dead bug/prancha"],
    20:["3 voltas · 8–15 agachamentos","3 voltas · 6–12 flexões adaptadas","3 voltas · 10–15 pontes","3 voltas · 8–12 avanços por lado","3 voltas · 20–40s core"],
    30:["5 min · aquecimento","4 voltas · agachamento","4 voltas · flexão adaptada","4 voltas · ponte","4 voltas · avanço reverso","4 voltas · core"]
  }},
  {id:"hiit",type:"HIIT acessível",icon:HeartPulse,intensity:"intense",min:10,env:["home","gym","outdoor","anywhere"],targets:["energized","strong","playful"],energy:["medium","high"],prompt:"Intervalos curtos, com opção de baixo impacto. Técnica vem antes da velocidade.",tags:["categoria inspirada no Garmin","cardio"],routines:{
    5:["5 × 30s marcha rápida / 30s leve"],
    10:["2 min · aquecer","6 × 30s esforço / 30s leve","2 min · desacelerar"],
    20:["4 min · aquecer","12 × 30s esforço / 30s leve","4 min · desacelerar"],
    30:["5 min · aquecer","10 × 45s esforço / 45s leve","5 min · desacelerar"]
  }},
  {id:"yoga",type:"Yoga flow",icon:PersonStanding,intensity:"light",min:5,env:["home","outdoor","anywhere"],targets:["calm","focused","free"],energy:["low","medium"],prompt:"Sequência fluida sem buscar posições extremas; respiração e controle primeiro.",tags:["categoria inspirada no Garmin","mobilidade"],routines:{
    5:["1 min · respiração","1 min · gato-vaca","1 min · cão adaptado","1 min · postura da criança","1 min · alongamento em pé"],
    10:["2 min · respiração + gato-vaca","2 min · quadril","3 min · flow em pé","2 min · chão","1 min · fechamento"],
    20:["4 min · chegada","10 min · flow suave","4 min · chão","2 min · fechamento"],
    30:["5 min · chegada","15 min · flow","7 min · chão","3 min · fechamento"]
  }},
  {id:"pilates",type:"Pilates essencial",icon:CircleDot,intensity:"moderate",min:5,env:["home","gym","anywhere"],targets:["focused","strong","free"],energy:["medium","high"],prompt:"Controle, estabilidade e respiração em uma sessão simples de solo.",tags:["categoria inspirada no Garmin","core"],routines:{
    5:["45s · ponte","45s · dead bug","45s · bird dog","45s · clam por lado","1 min · respiração"],
    10:["2 voltas · 10 pontes","2 voltas · 8 dead bug/lado","2 voltas · 8 bird dog/lado","2 voltas · 10 clam/lado"],
    20:["3 voltas · ponte","3 voltas · dead bug","3 voltas · bird dog","3 voltas · clam","3 voltas · prancha lateral adaptada"],
    30:["5 min · mobilidade","4 voltas · ponte, dead bug, bird dog, clam e prancha lateral","5 min · retorno"]
  }},
  {id:"sleepreset",type:"Desacelerar",icon:Moon,intensity:"light",min:5,env:["home","anywhere"],targets:["calm","free"],energy:["low","medium"],prompt:"Uma sessão muito leve quando a meta é reduzir estímulo, não treinar.",tags:["respiração","relaxamento"],routines:{
    5:["1 min · soltar ombros","3 min · respiração lenta","1 min · silêncio"],
    10:["2 min · mobilidade leve","6 min · respiração lenta","2 min · relaxamento"],
    20:["5 min · mobilidade","10 min · escaneamento corporal","5 min · silêncio"],
    30:["5 min · mobilidade","15 min · respiração e escaneamento","10 min · relaxamento"]
  }}
];

function labelOf(list,id){return list.find(x=>x.id===id)?.label||id}

function successScore(entry,movementId,context){
  if(entry.movementId!==movementId||entry.after!=="better")return 0;
  let score=2;
  if(entry.target===context.target)score+=3;
  if(entry.current===context.current)score+=2;
  if(entry.energy===context.energy)score+=2;
  if(entry.environment===context.environment)score+=1;
  if(entry.intensity===context.intensity)score+=1;
  return score;
}

function recommend(context,history){
  const {current,target,time,energy,environment,intensity,music}=context;
  const scored=library.map(item=>{
    let score=0;const reasons=[];
    if(item.targets.includes(target)){score+=7;reasons.push("combina com como você quer se sentir")}
    if(item.energy.includes(energy)){score+=4;reasons.push("respeita sua energia de hoje")}
    if(item.env.includes(environment)||environment==="anywhere"){score+=3;reasons.push("funciona onde você está")}
    if(item.min<=time){score+=3;reasons.push("cabe no tempo disponível")}else score-=5;
    if(intensity!=="surprise"){
      if(item.intensity===intensity){score+=4;reasons.push("segue a intensidade escolhida")}
      else if(intensity==="light"&&item.intensity==="intense")score-=6;
      else if(intensity==="intense"&&item.intensity==="light")score-=2;
    }
    if((current==="anxious"||current==="stressed")&&["breath","meditation","mobility","walk","yoga"].includes(item.id)){score+=3;reasons.push("começa com uma opção de menor pressão")}
    if(current==="tired"&&target==="energized"&&["dance","walk"].includes(item.id)){score+=4;reasons.push("tem baixa barreira para começar")}
    if(music==="yes"&&["dance","walk","strength","hiit"].includes(item.id)){score+=2;reasons.push("combina bem com estímulo musical")}
    const learned=history.reduce((sum,h)=>sum+successScore(h,item.id,context),0);
    if(learned>0){score+=Math.min(learned,8);reasons.push("sessões parecidas já funcionaram para você")}
    return {...item,score,reasons,learned}
  }).sort((a,b)=>b.score-a.score);
  const chosen=scored[0];
  return {...chosen,duration:time,reasons:chosen.reasons.slice(0,4),routine:chosen.routines[time]||chosen.routines[10]}
}

function spotifySearch(target,movement){
  const vibe={calm:"calm focus",focused:"focus flow",energized:"energy workout",strong:"strength workout motivation",free:"feel good movement",playful:"dance happy hits"}[target]||"workout motivation";
  return "https://open.spotify.com/search/"+encodeURIComponent(vibe+" "+movement)
}

function nutritionGuide({movementId,duration,intensity,goal}){
  const hard=["hiit","strength"].includes(movementId)||intensity==="intense";
  const long=duration>=30;
  const strength=["strength","pilates"].includes(movementId);
  const gentle=["breath","meditation","mobility","yoga","sleepreset"].includes(movementId);

  if(gentle)return{
    headline:"Você não precisa comer especificamente para esta sessão.",
    dayBefore:"Mantenha sua alimentação habitual e hidratação. Não há necessidade de aumentar carboidratos por causa desta prática.",
    hoursBefore:"Se estiver com fome, faça uma refeição normal. Para uma sessão curta e leve, não é necessário um pré-treino específico.",
    hourBefore:"Uma fruta, iogurte ou outra opção leve pode ser suficiente se houver fome.",
    after:"Volte à alimentação habitual. Priorize regularidade, proteína suficiente ao longo do dia e hidratação.",
    note:"A demanda energética desta sessão é baixa."
  };

  let headline="Chegue com energia, sem pesar o estômago.";
  let dayBefore=hard||long?"No dia anterior, evite restrição agressiva. Inclua fontes de carboidrato nas refeições e hidrate-se normalmente.":"Mantenha alimentação e hidratação habituais.";
  let hoursBefore="Entre 1 e 4 horas antes, uma refeição com carboidrato + proteína costuma ser prática. Exemplos: arroz + frango; pão + ovos; iogurte + aveia + fruta.";
  let hourBefore="Se faltar menos de 1 hora e houver fome, prefira algo simples e de fácil digestão, como fruta, pão/torrada ou iogurte, conforme sua tolerância.";
  let after="Depois, faça uma refeição completa com proteína, carboidrato, vegetais/frutas e líquidos.";

  if(strength&&goal==="muscle"){
    headline="Para ganhar massa, o treino precisa encontrar energia e proteína suficientes.";
    after="Depois do treino, inclua uma boa fonte de proteína e carboidrato. Ganho de massa depende principalmente do total de energia/proteína e da progressão do treino ao longo das semanas.";
  }
  if(goal==="definition"){
    headline="Definição não exige treinar com pouca energia.";
    dayBefore="Mantenha alimentação equilibrada. Déficits agressivos podem atrapalhar treino e recuperação.";
    after="Priorize proteína e uma refeição completa. Perda de gordura depende do balanço energético ao longo do tempo, não de cortar a refeição perto do treino.";
  }
  if(goal==="performance")headline="Para render melhor, não chegue ao treino esvaziada.";

  return{headline,dayBefore,hoursBefore,hourBefore,after,note:"As quantidades exatas dependem de peso corporal, gasto energético, rotina, tolerância gastrointestinal e objetivo. O app não prescreve dieta individual."}
}

export default function App(){
  const [sessionLoading,setSessionLoading]=useState(true);
  const [user,setUser]=useState(null);
  const [authMode,setAuthMode]=useState("signin");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [authError,setAuthError]=useState("");
  const [authBusy,setAuthBusy]=useState(false);
  const [step,setStep]=useState(0);
  const [current,setCurrent]=useState("neutral");
  const [target,setTarget]=useState("energized");
  const [time,setTime]=useState(10);
  const [energy,setEnergy]=useState("medium");
  const [environment,setEnvironment]=useState("anywhere");
  const [intensity,setIntensity]=useState("surprise");
  const [music,setMusic]=useState("yes");
  const [goal,setGoal]=useState("performance");
  const [after,setAfter]=useState("");
  const [history,setHistory]=useState([]);
  const [historyLoading,setHistoryLoading]=useState(false);
  const [saveError,setSaveError]=useState("");
  const [garmin,setGarmin]=useState({configured:false,connected:false});

  useEffect(()=>{
    authClient.getSession().then(r=>{setUser(r.data?.user||null);setSessionLoading(false)}).catch(()=>setSessionLoading(false))
  },[]);

  useEffect(()=>{
    if(!user){setHistory([]);return}
    setHistoryLoading(true);
    apiFetch("/api/sessions").then(d=>setHistory(d.sessions||[])).catch(()=>setHistory([])).finally(()=>setHistoryLoading(false));
    apiFetch("/api/garmin/status").then(setGarmin).catch(()=>setGarmin({configured:false,connected:false}))
  },[user]);

  const context={current,target,time,energy,environment,intensity,music};
  const recommendation=useMemo(()=>recommend(context,history),[current,target,time,energy,environment,intensity,music,history]);
  const food=useMemo(()=>nutritionGuide({movementId:recommendation.id,duration:recommendation.duration,intensity:recommendation.intensity,goal}),[recommendation,goal]);

  const submitAuth=async e=>{
    e.preventDefault();setAuthBusy(true);setAuthError("");
    try{
      const r=authMode==="signup"?await authClient.signUp.email({name:email.split("@")[0]||"Usuário",email,password}):await authClient.signIn.email({email,password});
      if(r.error)throw new Error(r.error.message||"Não foi possível entrar.");
      const s=await authClient.getSession();
      if(!s.data?.user)throw new Error("Não foi possível confirmar a sessão.");
      setUser(s.data.user)
    }catch(err){setAuthError(err.message||"Não foi possível concluir o acesso.")}
    finally{setAuthBusy(false)}
  };

  const signOut=async()=>{await authClient.signOut();setUser(null);setStep(0);setHistory([])};

  const saveSession=async value=>{
    setAfter(value);setSaveError("");
    try{
      const payload={...context,movementId:recommendation.id,movement:recommendation.type,score:recommendation.score,reasons:recommendation.reasons,after:value};
      const d=await apiFetch("/api/sessions",{method:"POST",body:JSON.stringify(payload)});
      setHistory(prev=>[d.session,...prev].slice(0,50))
    }catch(err){setSaveError(err.message||"Não foi possível salvar a sessão.")}
  };

  const reset=()=>{setStep(1);setAfter("");setSaveError("")};

  if(sessionLoading)return <main className="app authShell"><div className="authCard"><p className="kicker">MOOD → MOVEMENT</p><h2>Carregando seu espaço...</h2></div></main>;

  if(!user)return <main className="app authShell"><section className="authCard">
    <div className="brandPill">MOOD → MOVEMENT</div>
    <p className="kicker">{authMode==="signup"?"CRIE SEU ESPAÇO":"BEM-VINDA DE VOLTA"}</p>
    <h1>{authMode==="signup"?"Seu primeiro movimento começa pequeno.":"Entre para continuar."}</h1>
    <p className="authLead">O app reduz a distância entre “eu deveria me mexer” e “eu comecei”.</p>
    <form onSubmit={submitAuth} className="authForm">
      <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label>
      <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete={authMode==="signup"?"new-password":"current-password"}/></label>
      {authError&&<div className="authError">{authError}</div>}
      <button className="primary full" disabled={authBusy}>{authBusy?"Processando...":authMode==="signup"?"Criar conta":"Entrar"}</button>
    </form>
    <button className="textButton" onClick={()=>{setAuthError("");setAuthMode(authMode==="signup"?"signin":"signup")}}>{authMode==="signup"?"Já tenho uma conta":"Quero criar uma conta"}</button>
  </section></main>;

  if(step===0)return <main className="app landing">
    <Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/>
    <section className="hero">
      <div className="heroVisual" aria-hidden="true"><div className="orb o1">🎧</div><div className="orb o2">🌿</div><div className="orb o3">⚡</div><div className="pulseRing"/></div>
      <p className="kicker">MENOS DECISÃO. MAIS PRIMEIRO PASSO.</p>
      <h1>Descubra o movimento que cabe no seu momento.</h1>
      <p className="lead">Você conta como está. O app escolhe uma sessão curta com movimento, respiração ou meditação — e pode usar música, alimentação e dados do Garmin como apoio opcional.</p>
      <div className="homeActions">
        <button className="primary" onClick={()=>setStep(1)}>Encontrar meu movimento <ArrowRight size={18}/></button>
        <button className="secondary" onClick={()=>setStep(13)}><Watch size={18}/> Garmin opcional</button>
      </div>
      <div className="promiseGrid">
        <div><span>01</span><b>Conte o momento</b><p>Humor, energia, ambiente e tempo.</p></div>
        <div><span>02</span><b>Receba uma sessão</b><p>Um roteiro concreto, não uma lista infinita.</p></div>
        <div><span>03</span><b>Ensine o app</b><p>Diga como terminou e melhore as próximas escolhas.</p></div>
      </div>
    </section>
    <section className="visualBand">
      <div><Wind/><span>Respirar</span></div><div><Brain/><span>Meditar</span></div><div><Footprints/><span>Caminhar</span></div><div><Dumbbell/><span>Fortalecer</span></div><div><Music2/><span>Dançar</span></div><div><Waves/><span>Mobilizar</span></div>
    </section>
    <p className="note">Ferramenta de bem-estar e apoio à decisão. Não substitui avaliação médica, tratamento, reabilitação ou orientação profissional individual.</p>
  </main>;

  if(step===8)return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/><section className="screen result">
    <p className="kicker">SEU PRÓXIMO PASSO</p><h2>{recommendation.type}</h2>
    <RecommendationCard recommendation={recommendation}/>
    <div className="why"><b>Por que apareceu para você?</b><ul>{recommendation.reasons.map((r,i)=><li key={i}>{r}</li>)}</ul><p className="learning">{recommendation.learned>0?"Seu histórico já está influenciando esta escolha.":"Esta é uma recomendação inicial. Seu feedback depois da sessão ajuda a personalizar as próximas."}</p></div>
    <div className="resultActions">
      <button className="primary full" onClick={()=>setStep(9)}><Play size={18}/> Começar agora</button>
      <button className="nutritionButton full" onClick={()=>setStep(12)}><Utensils size={18}/> Como me alimentar para esta sessão?</button>
    </div>
  </section></main>;

  if(step===9){
    const Icon=recommendation.icon;
    return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/><section className="screen session">
      <div className="sessionHero"><div className="sessionIcon"><Icon size={30}/></div><div><p className="kicker">SESSÃO DE AGORA</p><h2>{recommendation.type}</h2></div><div className="sessionTime"><Clock3 size={19}/><b>{recommendation.duration} min</b></div></div>
      <p className="sessionPrompt">{recommendation.prompt}</p>
      {music!=="no"&&<a className="musicCard" href={spotifySearch(target,recommendation.type)} target="_blank" rel="noreferrer"><div className="musicIcon"><Music2 size={24}/></div><div><span>USE A MÚSICA COMO GATILHO</span><b>Abrir uma busca no Spotify</b><p>Sem perfil musical e sem conectar sua conta. Escolha uma faixa e comece.</p></div><ExternalLink size={18}/></a>}
      <div className="routine"><div className="routineHeader"><b>Seu roteiro</b><span>Só siga o próximo bloco.</span></div>{recommendation.routine.map((item,i)=><div className="routineStep" key={i}><span>{String(i+1).padStart(2,"0")}</span><b>{item}</b></div>)}</div>
      <div className="sessionTools"><button className="nutritionButton" onClick={()=>setStep(12)}><Utensils size={17}/> Alimentação</button><button className="garminButton" onClick={()=>setStep(13)}><Watch size={17}/> Registrar com Garmin</button></div>
      <div className="safetyBox"><HeartPulse size={18}/><span>Adapte amplitude e ritmo. Pare se houver dor, tontura, falta de ar incomum ou mal-estar.</span></div>
      <button className="primary full" onClick={()=>setStep(10)}><Check size={18}/> Terminei</button>
    </section></main>
  }

  if(step===10)return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/><section className="screen feedback">
    <p className="kicker">CHECK-OUT</p><h2>Como você se sente agora?</h2><p className="subcopy">Não existe resposta certa. Isso ajuda a descobrir que tipos de sessão combinam melhor com você.</p>
    <div className="feedbackGrid">{[["better","😊","Melhor"],["same","😐","Igual"],["worse","😕","Pior"]].map(([v,e,l])=><button key={v} className={after===v?"selected":""} onClick={()=>saveSession(v)}><span>{e}</span><b>{l}</b></button>)}</div>
    {after&&!saveError&&<div className="saved"><Check size={18}/> Feedback salvo.</div>}{saveError&&<div className="authError">{saveError}</div>}
    <button className="secondary" onClick={reset}><RotateCcw size={18}/> Fazer outra sessão</button>
  </section></main>;

  if(step===11)return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/><section className="screen">
    <p className="kicker">O QUE FUNCIONA PARA VOCÊ</p><h2>Histórico</h2><Stats history={history}/>
    {historyLoading?<div className="empty">Carregando...</div>:history.length===0?<div className="empty">Você ainda não concluiu nenhuma sessão.</div>:<div className="history">{history.map(item=><article key={item.id}><div><b>{item.movement} · {item.time} min</b><span>{new Date(item.date).toLocaleDateString("pt-BR")} · {labelOf(targetMoods,item.target)}</span></div><div className="miniMood">{item.after==="better"?"😊":item.after==="same"?"😐":"😕"}</div></article>)}</div>}
  </section></main>;

  if(step===12)return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/><section className="screen nutritionScreen">
    <p className="kicker">COMBUSTÍVEL PARA A SESSÃO</p><h2>Como chegar com energia.</h2>
    <div className="nutritionIntro"><Utensils size={24}/><div><b>{recommendation.type} · {recommendation.duration} min</b><span>{recommendation.intensity==="light"?"leve":recommendation.intensity==="moderate"?"moderada":"intensa"}</span></div></div>
    <p className="questionNote">Escolha seu objetivo para adaptar a orientação. Isto é educação nutricional geral — não uma dieta individual.</p>
    <MoodGrid items={goals} value={goal} onPick={setGoal}/>
    <div className="foodHeadline"><Sparkles size={18}/><b>{food.headline}</b></div>
    <div className="foodTimeline">
      <div><span>NO DIA ANTERIOR</span><p>{food.dayBefore}</p></div>
      <div><span>1–4 HORAS ANTES</span><p>{food.hoursBefore}</p></div>
      <div><span>ATÉ 1 HORA ANTES</span><p>{food.hourBefore}</p></div>
      <div><span>DEPOIS</span><p>{food.after}</p></div>
    </div>
    <div className="nutritionCaution"><b>Importante</b><p>{food.note}</p><p>Se você tem diabetes, doença renal, condição gastrointestinal, histórico de transtorno alimentar, gestação ou outra condição que altere sua alimentação, use orientação profissional individualizada.</p></div>
    <button className="primary full" onClick={()=>setStep(9)}><Play size={18}/> Ir para a sessão</button>
  </section></main>;

  if(step===13)return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/><section className="screen garminScreen">
    <p className="kicker">GARMIN É OPCIONAL</p><h2>Use seus dados se quiser.</h2>
    <div className="garminHero"><Watch size={31}/><div><b>Garmin Connect</b><span>Frequência cardíaca, calorias e atividade após sincronização.</span></div></div>
    <p className="questionNote">Você não precisa de Garmin para usar o Mood → Movement. Quando a integração oficial estiver ativada, quem tiver um dispositivo compatível poderá autorizar o compartilhamento dos próprios dados.</p>
    <div className="garminStatus">
      <div><span>STATUS</span><b>{garmin.connected?"Conectado":garmin.configured?"Pronto para conectar":"Integração aguardando credenciais oficiais"}</b></div>
      <div><span>DADOS PREVISTOS</span><b>Atividade · FC · calorias</b></div>
    </div>
    {garmin.connected?<div className="garminConnected"><Check size={18}/> Sua conta Garmin está conectada.</div>:garmin.configured?
      <button className="garminButton full" onClick={()=>window.location.assign("/api/garmin/connect")}><Watch size={18}/> Conectar Garmin</button>:
      <div className="garminPending"><Activity size={20}/><div><b>O app já está preparado para a integração.</b><p>A ativação real depende de aprovação e credenciais do Garmin Connect Developer Program. Até lá, o restante do app funciona normalmente.</p></div></div>}
    <a className="garminLearn" href="https://developer.garmin.com/gc-developer-program/" target="_blank" rel="noreferrer">Sobre o programa oficial Garmin <ExternalLink size={15}/></a>
  </section></main>;

  const screens=[
    null,
    {eyebrow:"COMEÇAMOS POR VOCÊ",title:"Como você está agora?",note:"Escolha a opção mais próxima. Não precisa ser perfeita.",content:<MoodGrid items={currentMoods} value={current} onPick={setCurrent}/>},
    {eyebrow:"ENERGIA",title:"Quanto combustível você sente que tem?",note:"Isso evita uma sessão maior do que o momento pede.",content:<MoodGrid items={energies} value={energy} onPick={setEnergy}/>},
    {eyebrow:"INTENÇÃO",title:"Como você gostaria de terminar?",note:"É uma intenção para escolher o tipo de sessão, não uma promessa de mudar seu humor.",content:<MoodGrid items={targetMoods} value={target} onPick={setTarget}/>},
    {eyebrow:"CONTEXTO",title:"Onde você consegue se mover?",note:"Sem equipamento também conta.",content:<IconGrid items={environments} value={environment} onPick={setEnvironment}/>},
    {eyebrow:"ESFORÇO",title:"Qual intensidade parece possível hoje?",note:"Você sempre pode fazer menos durante a sessão.",content:<ChoiceGrid items={intensities} value={intensity} onPick={setIntensity}/>},
    {eyebrow:"ESTÍMULO",title:"A música ajuda você a começar?",note:"Sem perfil musical e sem login no Spotify.",content:<MoodGrid items={musicPrefs} value={music} onPick={setMusic}/>},
    {eyebrow:"TEMPO REAL",title:"Quanto tempo você tem de verdade?",note:"A sessão cabe dentro desse limite.",content:<TimeGrid value={time} onPick={setTime}/>}
  ];
  const s=screens[step];const progress=Math.round((step/7)*100);
  return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/><section className="screen questionnaire">
    <div className="progress"><span style={{width:progress+"%"}}/></div><div className="questionMeta"><p className="step">0{step} / 07</p><span>{s.eyebrow}</span></div><h2>{s.title}</h2><p className="questionNote">{s.note}</p>{s.content}
    <div className="actions"><button className="back" onClick={()=>setStep(step-1)} aria-label="Voltar"><ArrowLeft size={18}/></button><button className="primary" onClick={()=>setStep(step===7?8:step+1)}>{step===7?"Criar minha sessão":"Continuar"} <ArrowRight size={18}/></button></div>
    <button className="historyLink" onClick={()=>setStep(11)}><History size={16}/> Ver o que já funcionou</button>
  </section></main>
}

function Header({onHome,onSignOut,user}){return <header className="topbar"><button className="wordmark" onClick={onHome}>MOOD <span>→</span> MOVEMENT</button><div className="account"><span>{user?.email}</span><button onClick={onSignOut} aria-label="Sair"><LogOut size={16}/></button></div></header>}
function MoodGrid({items,value,onPick}){return <div className="moodGrid">{items.map(i=><button key={i.id} className={value===i.id?"selected":""} onClick={()=>onPick(i.id)}><span>{i.emoji}</span><div><b>{i.label}</b>{i.hint&&<small>{i.hint}</small>}</div></button>)}</div>}
function IconGrid({items,value,onPick}){return <div className="moodGrid">{items.map(i=>{const Icon=i.icon;return <button key={i.id} className={value===i.id?"selected":""} onClick={()=>onPick(i.id)}><span className="iconBubble"><Icon size={24}/></span><div><b>{i.label}</b><small>Escolher</small></div></button>})}</div>}
function ChoiceGrid({items,value,onPick}){return <div className="choiceGrid">{items.map(i=><button key={i.id} className={value===i.id?"selected":""} onClick={()=>onPick(i.id)}><b>{i.label}</b><small>{i.hint}</small></button>)}</div>}
function TimeGrid({value,onPick}){return <div className="timeGrid">{times.map(v=><button key={v} className={value===v?"selected":""} onClick={()=>onPick(v)}><Clock3 size={20}/><b>{v}</b><span>min</span></button>)}</div>}
function RecommendationCard({recommendation}){const Icon=recommendation.icon;return <div className="recommendation"><div className="recTop"><div className="recIcon"><Icon size={28}/></div><div className="recMeta"><span>{recommendation.intensity==="light"?"Leve":recommendation.intensity==="moderate"?"Moderada":"Intensa"}</span><b>{recommendation.duration} minutos</b></div><Zap size={18}/></div><p>{recommendation.prompt}</p><div className="tags">{recommendation.tags.map(t=><span key={t}>{t}</span>)}</div></div>}
function Stats({history}){const completed=history.length;const better=history.filter(x=>x.after==="better").length;const rate=completed?Math.round((better/completed)*100):0;const counts={};history.filter(x=>x.after==="better").forEach(x=>counts[x.movement]=(counts[x.movement]||0)+1);const favorite=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—";return <div className="stats"><div><span>Sessões concluídas</span><b>{completed}</b></div><div><span>Terminou melhor</span><b>{rate}%</b></div><div><span>Seu melhor padrão</span><b>{favorite}</b></div></div>}