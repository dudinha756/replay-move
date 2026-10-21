import React, { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Brain, Check, Clock3, Dumbbell, Footprints,
  HeartPulse, History, Home, Leaf, Music2, Play, RotateCcw, Sparkles,
  Sun, Waves, Wind, Zap, ExternalLink, CircleDot, PersonStanding, Moon
} from "lucide-react";

const currentMoods = [
  { id:"tired", label:"Cansada", emoji:"😴", hint:"Pouca disposição" },
  { id:"stressed", label:"Estressada", emoji:"😵‍💫", hint:"Corpo acelerado" },
  { id:"anxious", label:"Ansiosa", emoji:"😬", hint:"Mente inquieta" },
  { id:"neutral", label:"Neutra", emoji:"😐", hint:"Sem um estado forte" },
  { id:"good", label:"Bem", emoji:"🙂", hint:"Disposta a se mover" },
  { id:"energized", label:"Energizada", emoji:"⚡", hint:"Energia sobrando" }
];

const targetMoods = [
  { id:"calm", label:"Mais calma", emoji:"🌿", hint:"Desacelerar" },
  { id:"focused", label:"Mais focada", emoji:"🎯", hint:"Organizar a mente" },
  { id:"energized", label:"Mais energizada", emoji:"🔥", hint:"Ganhar impulso" },
  { id:"strong", label:"Mais forte", emoji:"💪", hint:"Sentir potência" },
  { id:"free", label:"Mais leve", emoji:"🪽", hint:"Soltar corpo e cabeça" },
  { id:"playful", label:"Mais divertida", emoji:"✨", hint:"Mover sem pressão" }
];

const energies = [
  {id:"low",label:"Baixa",emoji:"🪫",hint:"Quero começar bem leve"},
  {id:"medium",label:"Média",emoji:"🔋",hint:"Consigo fazer um pouco mais"},
  {id:"high",label:"Alta",emoji:"⚡",hint:"Quero gastar energia"}
];

const environments = [
  {id:"home",label:"Em casa",icon:Home},
  {id:"gym",label:"Academia",icon:Dumbbell},
  {id:"outdoor",label:"Ao ar livre",icon:Sun},
  {id:"anywhere",label:"Tanto faz",icon:Sparkles}
];

const intensities = [
  {id:"light",label:"Leve",hint:"Quase sem esforço"},
  {id:"moderate",label:"Moderada",hint:"Sinto que trabalhei"},
  {id:"intense",label:"Intensa",hint:"Quero suar"},
  {id:"surprise",label:"Me surpreenda",hint:"Escolha por mim"}
];

const musicPrefs = [
  {id:"yes",label:"Quero música",emoji:"🎧",hint:"Use som como gatilho para começar"},
  {id:"maybe",label:"Talvez",emoji:"🎵",hint:"Me dê a opção na sessão"},
  {id:"no",label:"Sem música",emoji:"🤍",hint:"Prefiro silêncio"}
];

const times = [5,10,20,30,45,60,90,120];

const library = [
  {
    id:"breath", type:"Respiração guiada", icon:Wind, intensity:"light", min:5,
    env:["home","gym","outdoor","anywhere"], targets:["calm","focused"], energy:["low","medium","high"],
    prompt:"Uma pausa ativa para reduzir o ritmo e reorganizar a atenção.",
    tags:["Garmin-inspired","sem equipamento"],
    routines:{
      5:["1 min · respiração natural","3 min · inspire 4s e expire 6s, sem prender o ar","1 min · volte ao ritmo natural e observe o corpo"],
      10:["2 min · respiração natural","6 min · inspire 4s e expire 6s, de forma confortável","2 min · respiração livre e atenção aos pontos de tensão"],
      20:["3 min · aterramento e respiração natural","12 min · respiração lenta e confortável","5 min · escaneamento corporal e retorno gradual"],
      30:["5 min · chegada e postura confortável","15 min · respiração lenta e confortável","10 min · atenção aberta e retorno gradual"]
    }
  },
  {
    id:"meditation", type:"Meditação guiada", icon:Brain, intensity:"light", min:5,
    env:["home","outdoor","anywhere"], targets:["calm","focused","free"], energy:["low","medium","high"],
    prompt:"Sente-se ou deite-se de forma confortável e use a sessão para criar espaço mental.",
    tags:["Garmin-inspired","baixo atrito"],
    routines:{
      5:["1 min · escolha uma intenção simples","3 min · observe respiração, sons e sensações sem corrigir nada","1 min · perceba o que mudou"],
      10:["2 min · chegada","6 min · atenção na respiração; quando dispersar, volte sem julgamento","2 min · atenção aberta"],
      20:["3 min · chegada","12 min · foco na respiração e sensações do corpo","5 min · atenção aberta e intenção para o próximo passo"],
      30:["5 min · chegada","15 min · atenção sustentada","10 min · escaneamento corporal e fechamento"]
    }
  },
  {
    id:"mobility", type:"Mobilidade", icon:Waves, intensity:"light", min:5,
    env:["home","gym","outdoor","anywhere"], targets:["calm","free","focused"], energy:["low","medium"],
    prompt:"Movimentos controlados para ombros, quadris e coluna, sem forçar amplitude.",
    tags:["Garmin-inspired","sem equipamento"],
    routines:{
      5:["40s · círculos de ombro","40s · gato-vaca","40s · rotação torácica","40s · 90/90 de quadril","40s · mobilidade de tornozelo","1m40 · repetir o que mais ajudou"],
      10:["1 min · ombros e pescoço","2 min · gato-vaca + rotação torácica","2 min · 90/90 de quadril","2 min · agachamento assistido e tornozelo","3 min · flow livre"],
      20:["4 min · coluna torácica","5 min · quadril","4 min · tornozelos e agachamento assistido","4 min · ombros","3 min · flow leve"],
      30:["5 min · aquecimento articular","8 min · coluna e ombros","8 min · quadril e tornozelos","6 min · agachamento assistido e deslocamentos","3 min · flow final"]
    }
  },
  {
    id:"walk", type:"Caminhada consciente", icon:Footprints, intensity:"light", min:10,
    env:["outdoor","gym","anywhere"], targets:["calm","focused","free","energized"], energy:["low","medium","high"],
    prompt:"Caminhe num ritmo confortável; se quiser energia, aumente gradualmente o passo.",
    tags:["Garmin-inspired","baixo impacto"],
    routines:{
      5:["1 min · passo fácil","3 min · ritmo confortável","1 min · desacelere"],
      10:["2 min · passo fácil","6 min · ritmo constante","2 min · desacelere"],
      20:["4 min · fácil","12 min · ritmo vivo, ainda conversável","4 min · fácil"],
      30:["5 min · fácil","20 min · ritmo vivo e constante","5 min · desacelere"]
    }
  },
  {
    id:"dance", type:"Dança livre", icon:Music2, intensity:"moderate", min:5,
    env:["home","anywhere"], targets:["energized","playful","free"], energy:["low","medium","high"],
    prompt:"Use uma música que dê vontade de levantar. Não precisa saber dançar: o objetivo é começar.",
    tags:["música","zero técnica"],
    routines:{
      5:["1 música · balance o corpo e marque o ritmo","1 música · aumente os passos e use os braços"],
      10:["2 min · aquecer com passos simples","6 min · 2 músicas com movimento livre","2 min · diminuir o ritmo"],
      20:["3 min · aquecimento","14 min · músicas alternando intensidade","3 min · desacelerar"],
      30:["5 min · aquecimento","20 min · bloco principal dançando","5 min · retorno gradual"]
    }
  },
  {
    id:"strength", type:"Força essencial", icon:Dumbbell, intensity:"moderate", min:10,
    env:["home","gym","anywhere"], targets:["strong","focused","energized"], energy:["medium","high"],
    prompt:"Um circuito de padrões básicos: agachar, empurrar, extensão de quadril, unilateral e core.",
    tags:["força","peso do corpo"],
    routines:{
      5:["40s · sentar e levantar da cadeira","40s · flexão inclinada na parede ou bancada","40s · ponte de glúteos","40s · dead bug","40s · pausa e repetir o exercício preferido"],
      10:["2 voltas · 8–12 agachamentos para cadeira","2 voltas · 6–12 flexões inclinadas","2 voltas · 10–15 pontes de glúteos","2 voltas · 6–10 avanços reversos por lado","2 voltas · 20–30s prancha ou dead bug"],
      20:["3 voltas · 8–15 agachamentos","3 voltas · 6–12 flexões adaptadas","3 voltas · 10–15 pontes de glúteos","3 voltas · 8–12 avanços reversos por lado","3 voltas · 20–40s prancha ou dead bug"],
      30:["5 min · aquecimento dinâmico","4 voltas · 8–15 agachamentos","4 voltas · 6–12 flexões adaptadas","4 voltas · 10–15 pontes de glúteos","4 voltas · 8–12 avanços reversos por lado","4 voltas · 20–40s prancha ou dead bug"]
    }
  },
  {
    id:"hiit", type:"HIIT acessível", icon:HeartPulse, intensity:"intense", min:10,
    env:["home","gym","outdoor","anywhere"], targets:["energized","strong","playful"], energy:["medium","high"],
    prompt:"Intervalos curtos com opção de baixo impacto. Intensidade é ajustável: técnica vem antes da velocidade.",
    tags:["Garmin-inspired","cardio"],
    routines:{
      5:["5 × 30s marcha rápida ou polichinelo baixo impacto + 30s leve"],
      10:["2 min · aquecer","6 × 30s esforço / 30s leve","2 min · desacelerar"],
      20:["4 min · aquecer","12 × 30s esforço / 30s leve","4 min · desacelerar"],
      30:["5 min · aquecer","10 × 45s esforço / 45s leve","5 min · desacelerar"]
    }
  },
  {
    id:"yoga", type:"Yoga flow", icon:PersonStanding, intensity:"light", min:10,
    env:["home","outdoor","anywhere"], targets:["calm","focused","free"], energy:["low","medium"],
    prompt:"Uma sequência fluida, sem buscar posições extremas. Respiração e controle são prioridade.",
    tags:["Garmin-inspired","mobilidade"],
    routines:{
      5:["1 min · respiração","1 min · gato-vaca","1 min · cão olhando para baixo adaptado","1 min · postura da criança","1 min · alongamento em pé"],
      10:["2 min · respiração + gato-vaca","2 min · mobilidade de quadril","3 min · flow em pé","2 min · postura da criança","1 min · fechamento"],
      20:["4 min · chegada e mobilidade","10 min · flow suave","4 min · posições no chão","2 min · fechamento"],
      30:["5 min · chegada","15 min · flow progressivo","7 min · mobilidade no chão","3 min · fechamento"]
    }
  },
  {
    id:"pilates", type:"Pilates essencial", icon:CircleDot, intensity:"moderate", min:10,
    env:["home","gym","anywhere"], targets:["focused","strong","free"], energy:["medium","high"],
    prompt:"Controle, estabilidade e respiração em uma sessão simples de solo.",
    tags:["Garmin-inspired","core"],
    routines:{
      5:["45s · ponte","45s · dead bug","45s · bird dog","45s · clam por lado","1 min · respiração"],
      10:["2 voltas · 10 pontes","2 voltas · 8 dead bug por lado","2 voltas · 8 bird dog por lado","2 voltas · 10 clam por lado"],
      20:["3 voltas · ponte","3 voltas · dead bug","3 voltas · bird dog","3 voltas · clam","3 voltas · prancha lateral adaptada"],
      30:["5 min · mobilidade","4 voltas · ponte, dead bug, bird dog, clam e prancha lateral","5 min · desacelerar"]
    }
  },

  {
    id:"gym_glutes_posterior", type:"Academia · Glúteo e posterior", icon:Dumbbell, intensity:"intense", min:60,
    env:["gym"], targets:["strong","energized"], energy:["medium","high"],
    prompt:"Sessão de musculação com foco em glúteos e posteriores, combinando padrões de extensão de quadril e flexão de joelho.",
    tags:["academia","intermediário/avançado"],
    routines:{
      60:["Aquecimento · elevação pélvica unilateral 2×10","Stiff unilateral · 3×10","Mesa flexora · 3×8–12","Terra sumô · 3×8–10","Elevação pélvica · 3×8–12","Abdutora · 3×10–15"],
      90:["Aquecimento · elevação pélvica unilateral 2×10","Stiff unilateral · 3×8–10","Terra sumô · 4×8–10","Mesa flexora · 4×8–12","Cadeira flexora · 3×10–12","Elevação pélvica · 4×8–12","Búlgaro · 3×8–10 por lado","Abdutora · 3×12–15","Panturrilha em pé · 4×10–15"],
      120:["Aquecimento progressivo · 8–10 min","Stiff unilateral · 3×8–10","Terra sumô · 4×6–10","Mesa flexora · 4×8–12","Cadeira flexora · 4×10–12","Flexora unilateral · 3×10 por lado","Elevação pélvica · 4×8–12","Búlgaro · 3×8–10 por lado","Abdutora · 3×12–15","Panturrilha em pé · 4×10–15","Desacelerar · 5–8 min"]
    }
  },
  {
    id:"gym_shoulders_push", type:"Academia · Ombro, tríceps e peito", icon:Dumbbell, intensity:"intense", min:60,
    env:["gym"], targets:["strong","focused"], energy:["medium","high"],
    prompt:"Sessão de empurrar com foco em ombros, peitoral e tríceps, priorizando movimentos compostos antes dos isoladores.",
    tags:["academia","intermediário/avançado"],
    routines:{
      60:["Aquecimento de ombros · 5–8 min","Supino · 3×8–12","Desenvolvimento · 3×8–12","Elevação lateral · 3×10–15","Peck deck inverso · 3×10–15","Tríceps corda · 3×10–15"],
      90:["Aquecimento · elevação lateral leve + mobilidade","Supino · 4×8–12","Desenvolvimento · 4×8–12","Elevação lateral · 4×10–15","Peck deck inverso · 3×10–15","Elevação frontal · 3×10–12","Tríceps corda · 4×10–15","Tríceps unilateral na polia · 3×8–12"],
      120:["Aquecimento progressivo · 8–10 min","Supino · 4×6–10","Desenvolvimento · 4×8–12","Elevação lateral · 4×10–15","Peck deck inverso · 4×10–15","Elevação frontal · 3×10–12","Tríceps corda · 4×10–15","Tríceps unilateral na polia · 4×8–12","Cardio leve opcional · 15–20 min"]
    }
  },
  {
    id:"gym_quads_glutes", type:"Academia · Quadríceps e glúteo", icon:Dumbbell, intensity:"intense", min:60,
    env:["gym"], targets:["strong","energized"], energy:["medium","high"],
    prompt:"Sessão de membros inferiores com prioridade para agachamentos e leg press antes dos isoladores.",
    tags:["academia","intermediário/avançado"],
    routines:{
      60:["Aquecimento · agachamento com calcanhar elevado + mobilidade","Agachamento livre · 3×8–12","Leg press · 3×10–12","Extensora · 3×10–15","Afundo com step · 3×8–10 por lado","Abdutora · 3×12–15"],
      90:["Aquecimento · 8 min","Agachamento livre · 4×8–12","Leg press · 4×10–12","Pêndulo · 3×8–12","Afundo com step · 3×8–10 por lado","Extensora · 4×8–12","Adutora · 3×10–15","Abdutora · 3×10–15","Coice na polia · 3×10–12"],
      120:["Aquecimento progressivo · 10 min","Agachamento livre · 4×6–10","Leg press · 4×10–12","Pêndulo · 4×8–12","Afundo com step · 3×8–10 por lado","Extensora · 4×10–15","Extensora unilateral · 3×10 por lado","Adutora · 3×12–15","Abdutora · 3×12–15","Coice na polia · 3×10–15","Desacelerar · 5 min"]
    }
  },
  {
    id:"gym_back_biceps", type:"Academia · Costas e bíceps", icon:Dumbbell, intensity:"intense", min:60,
    env:["gym"], targets:["strong","focused"], energy:["medium","high"],
    prompt:"Sessão de puxar com exercícios para dorsais, parte média das costas e bíceps.",
    tags:["academia","intermediário/avançado"],
    routines:{
      60:["Aquecimento escapular · 5–8 min","Puxada alta · 3×8–12","Remada baixa · 3×8–12","Remada unilateral · 3×8–12 por lado","Face pull · 3×12–15","Rosca direta · 3×8–12","Rosca martelo · 3×10–12"],
      90:["Aquecimento escapular · 8 min","Puxada alta · 4×8–12","Remada curvada ou máquina · 4×8–12","Remada baixa · 3×10–12","Remada unilateral · 3×8–12 por lado","Pullover na polia · 3×10–15","Face pull · 3×12–15","Rosca direta · 3×8–12","Rosca martelo · 3×10–12"],
      120:["Aquecimento · 10 min","Puxada alta · 4×8–12","Remada pesada · 4×6–10","Remada baixa · 4×8–12","Remada unilateral · 3×8–12 por lado","Pullover · 3×10–15","Face pull · 4×12–15","Rosca direta · 4×8–12","Rosca martelo · 3×10–12","Cardio leve opcional · 15–20 min"]
    }
  },
  {
    id:"endurance_cardio", type:"Cardio endurance", icon:HeartPulse, intensity:"moderate", min:45,
    env:["gym","outdoor","anywhere"], targets:["energized","focused","free"], energy:["medium","high"],
    prompt:"Sessão aeróbica contínua para quem tem mais tempo e quer acumular volume com intensidade sustentável.",
    tags:["aeróbico","45–120 min"],
    routines:{
      45:["8 min · aquecimento leve","30 min · ritmo moderado e sustentável","7 min · desacelerar"],
      60:["10 min · aquecimento","40 min · ritmo moderado","10 min · desacelerar"],
      90:["15 min · aquecimento gradual","60 min · esforço moderado e conversável","15 min · desacelerar + mobilidade"],
      120:["20 min · aquecimento gradual","80 min · esforço moderado e sustentável","20 min · retorno gradual e mobilidade"]
    }
  },
  {
    id:"interval_cardio", type:"Cardio intervalado avançado", icon:Zap, intensity:"intense", min:30,
    env:["gym","outdoor","anywhere"], targets:["energized","strong","playful"], energy:["high"],
    prompt:"Intervalos fortes com recuperação suficiente. Indicado para quem já tolera treino vigoroso e consegue manter técnica e controle.",
    tags:["aeróbico","avançado"],
    routines:{
      30:["8 min · aquecimento","8× 1 min forte / 1 min leve","6 min · desacelerar"],
      45:["10 min · aquecimento","10× 1 min forte / 90s leve","10 min · desacelerar"],
      60:["12 min · aquecimento","8× 2 min forte / 2 min leve","16 min · moderado + desacelerar"],
      90:["15 min · aquecimento","10× 2 min forte / 2 min leve","25 min · moderado","10 min · desacelerar"],
      120:["20 min · aquecimento","10× 2 min forte / 2 min leve","45 min · moderado sustentável","15 min · desacelerar"]
    }
  },
  {
    id:"sleepreset", type:"Desacelerar para dormir", icon:Moon, intensity:"light", min:5,
    env:["home","anywhere"], targets:["calm","free"], energy:["low","medium"],
    prompt:"Uma sessão muito leve para quando sua meta é reduzir estímulo, não treinar.",
    tags:["respiração","relaxamento"],
    routines:{
      5:["1 min · soltar ombros","3 min · expiração mais longa que a inspiração, sem esforço","1 min · silêncio"],
      10:["2 min · mobilidade muito leve","6 min · respiração lenta","2 min · relaxamento corporal"],
      20:["5 min · mobilidade leve","10 min · respiração e escaneamento corporal","5 min · silêncio"],
      30:["5 min · mobilidade leve","15 min · respiração e escaneamento corporal","10 min · relaxamento"]
    }
  }
];

const storageKey = "m2m-history-v3";

function readHistory(){
  try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
  catch { return []; }
}

function labelOf(list,id){ return list.find(x=>x.id===id)?.label || id; }

function successScore(entry, movementId, context){
  if(entry.movementId !== movementId || entry.after !== "better") return 0;
  let score = 2;
  if(entry.target === context.target) score += 3;
  if(entry.current === context.current) score += 2;
  if(entry.energy === context.energy) score += 2;
  if(entry.environment === context.environment) score += 1;
  if(entry.intensity === context.intensity) score += 1;
  return score;
}

function recommend(context, history){
  const {current,target,time,energy,environment,intensity,music} = context;

  const scored = library.map(item=>{
    let score = 0;
    const reasons = [];

    if(item.targets.includes(target)){ score += 7; reasons.push("combina com como você quer se sentir"); }
    if(item.energy.includes(energy)){ score += 4; reasons.push("respeita sua energia de hoje"); }
    if(item.env.includes(environment) || environment==="anywhere"){ score += 3; reasons.push("funciona onde você está"); }
    if(item.min <= time){ score += 3; reasons.push("cabe no tempo disponível"); }
    else score -= 8;
    if(item.routines?.[time]){ score += 3; reasons.push("tem um roteiro completo para esse tempo"); }
    if(time >= 60 && !item.routines?.[time]) score -= 4;

    if(intensity !== "surprise"){
      if(item.intensity === intensity){ score += 4; reasons.push("segue a intensidade que você escolheu"); }
      else if(intensity==="light" && item.intensity==="intense") score -= 6;
      else if(intensity==="intense" && item.intensity==="light") score -= 2;
    }

    if((current==="anxious" || current==="stressed") && ["breath","meditation","mobility","walk","yoga"].includes(item.id)){
      score += 3;
      reasons.push("começa com uma opção de menor pressão");
    }

    if(current==="tired" && target==="energized" && ["dance","walk"].includes(item.id)){
      score += 4;
      reasons.push("ajuda a começar com baixa barreira");
    }

    if(music==="yes" && ["dance","walk","strength","hiit"].includes(item.id)){
      score += 2;
      reasons.push("combina bem com estímulo musical");
    }

    const learned = history.reduce((sum,h)=>sum+successScore(h,item.id,context),0);
    if(learned>0){
      score += Math.min(learned,8);
      reasons.push("sessões parecidas já funcionaram bem para você");
    }

    return {...item,score,reasons,learned};
  }).sort((a,b)=>b.score-a.score);

  const chosen = scored[0];
  return {
    ...chosen,
    duration: time,
    reasons: chosen.reasons.slice(0,4),
    routine: chosen.routines[time] || chosen.routines[30] || chosen.routines[20] || chosen.routines[10]
  };
}

function musicSearch(target, movement){
  const vibe = {
    calm:"calm focus instrumental",
    focused:"focus flow instrumental",
    energized:"energy workout upbeat",
    strong:"strength workout motivation",
    free:"feel good movement",
    playful:"dance happy hits"
  }[target] || "workout motivation";
  return "https://open.spotify.com/search/" + encodeURIComponent(vibe + " " + movement);
}

export default function App(){
  const [step,setStep] = useState(0);
  const [current,setCurrent] = useState("neutral");
  const [target,setTarget] = useState("energized");
  const [time,setTime] = useState(10);
  const [energy,setEnergy] = useState("medium");
  const [environment,setEnvironment] = useState("anywhere");
  const [intensity,setIntensity] = useState("surprise");
  const [music,setMusic] = useState("yes");
  const [after,setAfter] = useState("");
  const [history,setHistory] = useState(readHistory);

  const context = {current,target,time,energy,environment,intensity,music};
  const recommendation = useMemo(
    ()=>recommend(context,history),
    [current,target,time,energy,environment,intensity,music,history]
  );

  const saveSession = value => {
    setAfter(value);
    const item = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...context,
      duration: recommendation.duration,
      movementId: recommendation.id,
      movement: recommendation.type,
      after:value
    };
    setHistory(prev=>{
      const next=[item,...prev].slice(0,50);
      localStorage.setItem(storageKey,JSON.stringify(next));
      return next;
    });
  };


  const reset = () => { setStep(1); setAfter(""); };

  if(step===0) return <main className="app landing">
    <header className="landingHeader">
      <div className="badge">MOOD → MOVEMENT</div>
      <button className="historyMini" onClick={()=>setStep(11)}><History size={15}/> Meu histórico</button>
    </header>

    <section className="hero">
      <div className="heroVisual" aria-hidden="true">
        <div className="orb orbOne">🎧</div>
        <div className="orb orbTwo">🌿</div>
        <div className="orb orbThree">⚡</div>
        <div className="pulseRing"></div>
      </div>
      <p className="kicker">NÃO É SOBRE TREINAR MAIS. É SOBRE CONSEGUIR COMEÇAR.</p>
      <h1>Quando falta vontade, o app escolhe um primeiro movimento por você.</h1>
      <p className="lead">Diga como você está, como quer se sentir e quanto tempo tem. O Mood → Movement combina movimento, respiração, meditação e música para criar uma sessão pequena o bastante para começar agora.</p>
      <div className="heroCtas">
        <button className="primary" onClick={()=>setStep(1)}>Encontrar meu movimento <ArrowRight size={18}/></button>
        <span>Leva menos de 1 minuto para escolher.</span>
      </div>
      <div className="promiseGrid">
        <div><span>01</span><b>Você conta o momento</b><p>Humor, energia, lugar e tempo.</p></div>
        <div><span>02</span><b>O app reduz a decisão</b><p>Uma recomendação concreta, não uma lista infinita.</p></div>
        <div><span>03</span><b>Você testa e ensina</b><p>Seu feedback melhora as próximas sugestões.</p></div>
      </div>
    </section>

    <section className="visualBand">
      <div><Wind/><span>Respirar</span></div><div><Brain/><span>Meditar</span></div>
      <div><Footprints/><span>Caminhar</span></div><div><Dumbbell/><span>Fortalecer</span></div>
      <div><Music2/><span>Dançar</span></div><div><Waves/><span>Mobilizar</span></div>
    </section>
    <p className="note">Ferramenta de bem-estar e apoio à decisão. Não substitui avaliação médica, diagnóstico, tratamento ou orientação profissional.</p>
  </main>;

  if(step===8) return <main className="app">
    <Header onHome={()=>setStep(0)}/>
    <section className="screen result">
      <p className="kicker">SEU PRÓXIMO PASSO</p>
      <h2>{recommendation.type}</h2>
      <RecommendationCard recommendation={recommendation}/>
      <div className="why">
        <b>Por que isso apareceu para você?</b>
        <ul>{recommendation.reasons.map((r,i)=><li key={i}>{r}</li>)}</ul>
        <p className="learning">{recommendation.learned>0 ? "Seu histórico já está influenciando esta escolha." : "Esta é uma recomendação inicial. Depois da sessão, diga como você ficou para o app aprender com você."}</p>
      </div>
      <div className="resultActions">
        <button className="primary full" onClick={()=>setStep(9)}><Play size={18}/> Começar agora</button>
        <button className="secondary full" onClick={()=>setStep(7)}><ArrowLeft size={18}/> Ajustar escolhas</button>
      </div>
    </section>
  </main>;

  if(step===9) {
    const Icon=recommendation.icon;
    return <main className="app"><Header onHome={()=>setStep(0)}/>
      <section className="screen session">
        <div className="sessionHero">
          <div className="sessionIcon"><Icon size={30}/></div>
          <div>
            <p className="kicker">SESSÃO DE AGORA</p>
            <h2>{recommendation.type}</h2>
          </div>
          <div className="sessionTime"><Clock3 size={19}/><b>{recommendation.duration} min</b></div>
        </div>

        <p className="sessionPrompt">{recommendation.prompt}</p>

        {music !== "no" && <a className="musicCard" href={musicSearch(target,recommendation.type)} target="_blank" rel="noreferrer">
          <div className="musicIcon"><Music2 size={24}/></div>
          <div><span>TRILHA PARA COMEÇAR</span><b>Abrir música no Spotify</b><p>Uma busca pronta com a energia desta sessão. Você escolhe a faixa.</p></div>
          <ExternalLink size={18}/>
        </a>}

        <div className="routine">
          <div className="routineHeader"><b>Seu roteiro</b><span>Sem perfeição. Apenas siga o próximo bloco.</span></div>
          {recommendation.routine.map((item,i)=><div className="routineStep" key={i}><span>{String(i+1).padStart(2,"0")}</span><b>{item}</b></div>)}
        </div>

        <div className="safetyBox"><HeartPulse size={18}/><span>Adapte amplitude e ritmo. Pare se houver dor, tontura, falta de ar incomum ou mal-estar.</span></div>
        <button className="primary full" onClick={()=>setStep(10)}><Check size={18}/> Terminei</button>
      </section>
    </main>;
  }

  if(step===10) return <main className="app"><Header onHome={()=>setStep(0)}/>
    <section className="screen feedback">
      <p className="kicker">CHECK-OUT</p>
      <h2>Como você se sente agora?</h2>
      <p className="subcopy">Não existe resposta certa. Isso serve para o app descobrir o que funciona melhor para você.</p>
      <div className="feedbackGrid">
        {[["better","😊","Melhor"],["same","😐","Igual"],["worse","😕","Pior"]].map(([v,e,l])=>
          <button key={v} className={after===v?"selected":""} onClick={()=>saveSession(v)}><span>{e}</span><b>{l}</b></button>
        )}
      </div>
      {after ? <div className="saved"><Check size={18}/> Feedback salvo. A próxima recomendação pode usar esse padrão.</div> : null}<button className="secondary" onClick={reset}><RotateCcw size={18}/> Fazer outra sessão</button>
    </section>
  </main>;

  if(step===11) return <main className="app"><Header onHome={()=>setStep(0)}/>
    <section className="screen">
      <p className="kicker">O QUE FUNCIONA PARA VOCÊ</p>
      <h2>Histórico</h2>
      <Stats history={history}/>
      {history.length===0 ? <div className="empty">Você ainda não concluiu nenhuma sessão. Faça a primeira e volte aqui para enxergar seus padrões.</div> :
        <div className="history">
          {history.map(item=><article key={item.id}>
            <div>
              <b>{item.movement} · {item.duration || item.time} min</b>
              <span>{new Date(item.date).toLocaleDateString("pt-BR")} · queria ficar {labelOf(targetMoods,item.target).toLowerCase()}</span>
            </div>
            <div className="miniMood">{item.after==="better"?"😊":item.after==="same"?"😐":"😕"}</div>
          </article>)}
        </div>}
    </section>
  </main>;

  const screens = [
    null,
    {eyebrow:"COMEÇAMOS POR VOCÊ", title:"Como você está agora?", note:"Escolha a opção que mais se aproxima. Não precisa ser exata.", content:<MoodGrid items={currentMoods} value={current} onPick={setCurrent}/>},
    {eyebrow:"ENERGIA", title:"Quanto combustível você sente que tem?", note:"Isso evita que o app sugira uma sessão maior do que o momento pede.", content:<MoodGrid items={energies} value={energy} onPick={setEnergy}/>},
    {eyebrow:"INTENÇÃO", title:"Como você gostaria de terminar?", note:"O objetivo não é prometer mudar seu humor; é escolher um tipo de movimento coerente com sua intenção.", content:<MoodGrid items={targetMoods} value={target} onPick={setTarget}/>},
    {eyebrow:"CONTEXTO", title:"Onde você consegue se mover?", note:"Sem equipamento também conta.", content:<IconGrid items={environments} value={environment} onPick={setEnvironment}/>},
    {eyebrow:"ESFORÇO", title:"Qual intensidade parece possível hoje?", note:"Você sempre pode fazer menos durante a sessão.", content:<ChoiceGrid items={intensities} value={intensity} onPick={setIntensity}/>},
    {eyebrow:"ESTÍMULO", title:"A música ajuda você a começar?", note:"Sem login no Spotify. Se quiser, abrimos uma busca pronta para a sessão.", content:<MoodGrid items={musicPrefs} value={music} onPick={setMusic}/>},
    {eyebrow:"TEMPO REAL", title:"Quanto tempo você tem de verdade?", note:"O app monta a sessão dentro desse limite.", content:<TimeGrid value={time} onPick={setTime}/>}
  ];

  const s=screens[step];
  const progress=Math.round((step/7)*100);

  return <main className="app">
    <Header onHome={()=>setStep(0)}/>
    <section className="screen questionnaire">
      <div className="progress"><span style={{width:progress+"%"}}/></div>
      <div className="questionMeta"><p className="step">0{step} / 07</p><span>{s.eyebrow}</span></div>
      <h2>{s.title}</h2>
      <p className="questionNote">{s.note}</p>
      {s.content}
      <div className="actions">
        <button className="back" onClick={()=>setStep(step-1)} aria-label="Voltar"><ArrowLeft size={18}/></button>
        <button className="primary" onClick={()=>setStep(step===7?8:step+1)}>{step===7?"Criar minha sessão":"Continuar"} <ArrowRight size={18}/></button>
      </div>
      <button className="historyLink" onClick={()=>setStep(11)}><History size={16}/> Ver o que já funcionou</button>
    </section>
  </main>;
}

function Header({onHome}){ return <header><button className="wordmark" onClick={onHome}>MOOD <span>→</span> MOVEMENT</button></header>; }

function MoodGrid({items,value,onPick}){ return <div className="moodGrid">{items.map(i=><button key={i.id} className={value===i.id?"selected":""} onClick={()=>onPick(i.id)}><span>{i.emoji}</span><div><b>{i.label}</b>{i.hint&&<small>{i.hint}</small>}</div></button>)}</div>; }

function IconGrid({items,value,onPick}){ return <div className="moodGrid">{items.map(i=>{const Icon=i.icon;return <button key={i.id} className={value===i.id?"selected":""} onClick={()=>onPick(i.id)}><span className="iconBubble"><Icon size={24}/></span><div><b>{i.label}</b><small>Escolher</small></div></button>})}</div>; }

function ChoiceGrid({items,value,onPick}){ return <div className="choiceGrid">{items.map(i=><button key={i.id} className={value===i.id?"selected":""} onClick={()=>onPick(i.id)}><b>{i.label}</b><small>{i.hint}</small></button>)}</div>; }

function TimeGrid({value,onPick}){ return <div className="timeGrid">{times.map(v=><button key={v} className={value===v?"selected":""} onClick={()=>onPick(v)}><Clock3 size={20}/><b>{v}</b><span>min</span></button>)}</div>; }

function RecommendationCard({recommendation}){
  const Icon=recommendation.icon;
  return <div className="recommendation">
    <div className="recTop">
      <div className="recIcon"><Icon size={28}/></div>
      <div className="recMeta"><span>{recommendation.intensity==="light"?"Leve":recommendation.intensity==="moderate"?"Moderada":"Intensa"}</span><b>{recommendation.duration} minutos</b></div>
      <Zap size={18}/>
    </div>
    <p>{recommendation.prompt}</p>
    <div className="tags">{recommendation.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
  </div>;
}

function Stats({history}){
  const completed=history.length;
  const better=history.filter(x=>x.after==="better").length;
  const rate=completed?Math.round((better/completed)*100):0;
  const counts={};
  history.filter(x=>x.after==="better").forEach(x=>counts[x.movement]=(counts[x.movement]||0)+1);
  const favorite=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—";
  return <div className="stats">
    <div><span>Sessões concluídas</span><b>{completed}</b></div>
    <div><span>Terminou melhor</span><b>{rate}%</b></div>
    <div><span>Seu melhor padrão</span><b>{favorite}</b></div>
  </div>;
}