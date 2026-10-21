import React, { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, Clock3, Dumbbell, Footprints,
  HeartPulse, History, Home, Leaf, Music2, Play, RotateCcw,
  Sparkles, Sun, Waves, Zap
} from "lucide-react";

const currentMoods = [
  { id:"tired", label:"Cansada", emoji:"😴" },
  { id:"stressed", label:"Estressada", emoji:"😵‍💫" },
  { id:"anxious", label:"Ansiosa", emoji:"😬" },
  { id:"neutral", label:"Neutra", emoji:"😐" },
  { id:"good", label:"Bem", emoji:"🙂" },
  { id:"energized", label:"Energizada", emoji:"⚡" }
];

const targetMoods = [
  { id:"calm", label:"Mais calma", emoji:"🌿" },
  { id:"focused", label:"Mais focada", emoji:"🎯" },
  { id:"energized", label:"Mais energizada", emoji:"🔥" },
  { id:"strong", label:"Mais forte", emoji:"💪" },
  { id:"free", label:"Mais leve", emoji:"🪽" },
  { id:"playful", label:"Mais divertida", emoji:"✨" }
];

const energies = [
  {id:"low",label:"Baixa",emoji:"🪫"},
  {id:"medium",label:"Média",emoji:"🔋"},
  {id:"high",label:"Alta",emoji:"⚡"}
];

const environments = [
  {id:"home",label:"Em casa",icon:Home},
  {id:"gym",label:"Academia",icon:Dumbbell},
  {id:"outdoor",label:"Ao ar livre",icon:Sun},
  {id:"anywhere",label:"Tanto faz",icon:Sparkles}
];

const intensities = [
  {id:"light",label:"Leve"},
  {id:"moderate",label:"Moderada"},
  {id:"intense",label:"Intensa"},
  {id:"surprise",label:"Me surpreenda"}
];

const times = [5,10,20,30];

const library = [
  { id:"mobility", type:"Mobilidade", icon:Waves, intensity:"light", min:5, env:["home","gym","outdoor","anywhere"], targets:["calm","free","focused"], energy:["low","medium"], prompt:"Movimentos lentos para ombros, quadris e coluna, com respiração confortável." },
  { id:"walk", type:"Caminhada", icon:Footprints, intensity:"light", min:10, env:["outdoor","gym","anywhere"], targets:["calm","focused","free","energized"], energy:["low","medium","high"], prompt:"Caminhe em ritmo confortável e constante, observando sua respiração." },
  { id:"dance", type:"Dança livre", icon:Music2, intensity:"moderate", min:5, env:["home","anywhere"], targets:["energized","playful","free"], energy:["low","medium","high"], prompt:"Escolha uma música que combine com o momento e mova-se sem buscar técnica." },
  { id:"strength", type:"Força essencial", icon:Dumbbell, intensity:"moderate", min:15, env:["home","gym","anywhere"], targets:["strong","focused","energized"], energy:["medium","high"], prompt:"Faça um circuito simples de agachar, empurrar, puxar e estabilizar." },
  { id:"cardio", type:"Cardio curto", icon:HeartPulse, intensity:"intense", min:10, env:["home","gym","outdoor","anywhere"], targets:["energized","strong","playful"], energy:["medium","high"], prompt:"Alterne pequenos blocos de esforço e recuperação sem perder o controle da respiração." },
  { id:"flow", type:"Flow restaurador", icon:Leaf, intensity:"light", min:10, env:["home","outdoor","anywhere"], targets:["calm","free"], energy:["low","medium"], prompt:"Combine mobilidade, alongamentos ativos e respiração em sequência contínua." },
  { id:"play", type:"Play circuit", icon:Sparkles, intensity:"moderate", min:10, env:["home","outdoor","anywhere"], targets:["playful","energized","free"], energy:["medium","high"], prompt:"Misture deslocamentos, passos e pequenos desafios para tornar a sessão mais espontânea." }
];

const storageKey = "m2m-history-v2";

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
  const {current,target,time,energy,environment,intensity} = context;

  const scored = library.map(item=>{
    let score = 0;
    const reasons = [];

    if(item.targets.includes(target)){ score += 6; reasons.push("combina com o estado que você quer alcançar"); }
    if(item.energy.includes(energy)){ score += 4; reasons.push("respeita seu nível de energia"); }
    if(item.env.includes(environment) || environment==="anywhere"){ score += 3; reasons.push("funciona no ambiente escolhido"); }
    if(item.min <= time){ score += 3; reasons.push("cabe no tempo disponível"); }
    else score -= 5;

    if(intensity !== "surprise"){
      if(item.intensity === intensity){ score += 4; reasons.push("segue sua intensidade preferida"); }
      else if(intensity==="light" && item.intensity==="intense") score -= 5;
      else if(intensity==="intense" && item.intensity==="light") score -= 2;
    }

    if((current==="anxious" || current==="stressed") && item.intensity==="light"){
      score += 2;
      reasons.push("começa com uma proposta mais reguladora");
    }
    if(current==="tired" && item.id==="dance" && target==="energized"){
      score += 3;
      reasons.push("usa música e movimento livre para ativar sem exigir muito");
    }

    const learned = history.reduce((sum,h)=>sum+successScore(h,item.id,context),0);
    if(learned>0){
      score += Math.min(learned,8);
      reasons.push("movimentos parecidos já fizeram você se sentir melhor");
    }

    return {...item,score,reasons,learned};
  }).sort((a,b)=>b.score-a.score);

  const chosen = scored[0];
  return {
    ...chosen,
    duration: Math.max(5, Math.min(time, Math.max(chosen.min, Math.min(time,20)))),
    reasons: chosen.reasons.slice(0,4)
  };
}

export default function App(){
  const [step,setStep] = useState(0);
  const [current,setCurrent] = useState("neutral");
  const [target,setTarget] = useState("energized");
  const [time,setTime] = useState(10);
  const [energy,setEnergy] = useState("medium");
  const [environment,setEnvironment] = useState("anywhere");
  const [intensity,setIntensity] = useState("surprise");
  const [after,setAfter] = useState("");
  const [history,setHistory] = useState(readHistory);

  const context = {current,target,time,energy,environment,intensity};
  const recommendation = useMemo(()=>recommend(context,history),[current,target,time,energy,environment,intensity,history]);

  const saveSession = value => {
    setAfter(value);
    const item = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...context,
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

  const reset = () => {
    setStep(1);
    setAfter("");
  };

  if(step===0) return <main className="app landing">
    <div className="badge">MOOD → MOVEMENT</div>
    <section className="hero">
      <p className="kicker">FEEL → CHOOSE → MOVE → LEARN</p>
      <h1>Movimento que começa em como você está hoje.</h1>
      <p className="lead">Conte seu humor, energia, ambiente e preferência. O app combina esses sinais com seu histórico para sugerir um movimento simples e progressivamente mais pessoal.</p>
      <button className="primary" onClick={()=>setStep(1)}>Começar <ArrowRight size={18}/></button>
    </section>
    <p className="note">Protótipo de bem-estar. Não substitui avaliação médica, diagnóstico ou orientação profissional.</p>
  </main>;

  if(step===7) return <main className="app">
    <Header onHome={()=>setStep(0)}/>
    <section className="screen result">
      <p className="kicker">SUGESTÃO PARA AGORA</p>
      <h2>{recommendation.type}</h2>
      <RecommendationCard recommendation={recommendation}/>
      <div className="why">
        <b>Por que essa sugestão?</b>
        <ul>{recommendation.reasons.map((r,i)=><li key={i}>{r}</li>)}</ul>
        <p className="learning">{recommendation.learned>0 ? "A personalização já está usando seu histórico." : "Ainda estamos aprendendo com você. Seu feedback após a sessão vai melhorar as próximas sugestões."}</p>
      </div>
      <button className="primary full" onClick={()=>setStep(8)}><Play size={18}/> Iniciar sessão</button>
    </section>
  </main>;

  if(step===8) {
    const Icon=recommendation.icon;
    return <main className="app"><Header onHome={()=>setStep(0)}/>
      <section className="screen session">
        <div className="sessionIcon"><Icon size={30}/></div>
        <p className="kicker">MOVIMENTO DE HOJE</p>
        <h2>{recommendation.type}</h2>
        <div className="sessionTime"><Clock3 size={20}/><b>{recommendation.duration} min</b></div>
        <p className="sessionPrompt">{recommendation.prompt}</p>
        <div className="sessionSteps">
          <span>01 <b>Comece abaixo do seu limite</b></span>
          <span>02 <b>Encontre um ritmo sustentável</b></span>
          <span>03 <b>Interrompa se sentir dor, tontura ou mal-estar</b></span>
          <span>04 <b>Finalize percebendo como você está</b></span>
        </div>
        <button className="primary full" onClick={()=>setStep(9)}><Check size={18}/> Concluir</button>
      </section>
    </main>;
  }

  if(step===9) return <main className="app"><Header onHome={()=>setStep(0)}/>
    <section className="screen feedback">
      <p className="kicker">DEPOIS DO MOVIMENTO</p>
      <h2>Como você se sente agora?</h2>
      <div className="feedbackGrid">
        {[["better","😊","Melhor"],["same","😐","Igual"],["worse","😕","Pior"]].map(([v,e,l])=>
          <button key={v} className={after===v?"selected":""} onClick={()=>saveSession(v)}><span>{e}</span><b>{l}</b></button>
        )}
      </div>
      {after ? <div className="saved"><Check size={18}/> Feedback salvo. Isso ajuda a personalizar as próximas recomendações.</div> : null}
      <button className="secondary" onClick={reset}><RotateCcw size={18}/> Fazer outra</button>
    </section>
  </main>;

  if(step===10) return <main className="app"><Header onHome={()=>setStep(0)}/>
    <section className="screen">
      <p className="kicker">SEU PADRÃO</p>
      <h2>Histórico</h2>
      <Stats history={history}/>
      {history.length===0 ? <div className="empty">Nenhuma sessão concluída ainda.</div> :
        <div className="history">
          {history.map(item=><article key={item.id}>
            <div>
              <b>{item.movement} · {item.time} min</b>
              <span>{new Date(item.date).toLocaleDateString("pt-BR")} · {labelOf(targetMoods,item.target)}</span>
            </div>
            <div className="miniMood">{item.after==="better"?"😊":item.after==="same"?"😐":"😕"}</div>
          </article>)}
        </div>}
    </section>
  </main>;

  const screens = [
    null,
    {title:"Como você está agora?", content:<MoodGrid items={currentMoods} value={current} onPick={setCurrent}/>},
    {title:"Como está sua energia?", content:<MoodGrid items={energies} value={energy} onPick={setEnergy}/>},
    {title:"Como você gostaria de se sentir?", content:<MoodGrid items={targetMoods} value={target} onPick={setTarget}/>},
    {title:"Onde você vai se mover?", content:<IconGrid items={environments} value={environment} onPick={setEnvironment}/>},
    {title:"Qual intensidade parece melhor hoje?", content:<ChoiceGrid items={intensities} value={intensity} onPick={setIntensity}/>},
    {title:"Quanto tempo você tem?", content:<TimeGrid value={time} onPick={setTime}/>}
  ];

  const s=screens[step];
  const progress=Math.round((step/6)*100);

  return <main className="app">
    <Header onHome={()=>setStep(0)}/>
    <section className="screen">
      <div className="progress"><span style={{width:progress+"%"}}/></div>
      <p className="step">0{step} / 06</p>
      <h2>{s.title}</h2>
      {s.content}
      <div className="actions">
        <button className="back" onClick={()=>setStep(step-1)} aria-label="Voltar"><ArrowLeft size={18}/></button>
        <button className="primary" onClick={()=>setStep(step===6?7:step+1)}>{step===6?"Ver sugestão":"Continuar"} <ArrowRight size={18}/></button>
      </div>
      <button className="historyLink" onClick={()=>setStep(10)}><History size={16}/> Ver histórico</button>
    </section>
  </main>;
}

function Header({onHome}){ return <header><button className="wordmark" onClick={onHome}>MOOD <span>→</span> MOVEMENT</button></header>; }

function MoodGrid({items,value,onPick}){ return <div className="moodGrid">{items.map(i=><button key={i.id} className={value===i.id?"selected":""} onClick={()=>onPick(i.id)}><span>{i.emoji}</span><b>{i.label}</b></button>)}</div>; }

function IconGrid({items,value,onPick}){ return <div className="moodGrid">{items.map(i=>{const Icon=i.icon;return <button key={i.id} className={value===i.id?"selected":""} onClick={()=>onPick(i.id)}><Icon size={27}/><b>{i.label}</b></button>})}</div>; }

function ChoiceGrid({items,value,onPick}){ return <div className="choiceGrid">{items.map(i=><button key={i.id} className={value===i.id?"selected":""} onClick={()=>onPick(i.id)}><b>{i.label}</b></button>)}</div>; }

function TimeGrid({value,onPick}){ return <div className="timeGrid">{times.map(v=><button key={v} className={value===v?"selected":""} onClick={()=>onPick(v)}><Clock3 size={20}/><b>{v}</b><span>min</span></button>)}</div>; }

function RecommendationCard({recommendation}){
  const Icon=recommendation.icon;
  return <div className="recommendation">
    <div className="recIcon"><Icon size={28}/></div>
    <div><span>{recommendation.intensity==="light"?"Leve":recommendation.intensity==="moderate"?"Moderada":"Intensa"}</span><b>{recommendation.duration} minutos</b><p>{recommendation.prompt}</p></div>
    <Zap size={18}/>
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
    <div><span>Sessões</span><b>{completed}</b></div>
    <div><span>Terminou melhor</span><b>{rate}%</b></div>
    <div><span>Melhor padrão</span><b>{favorite}</b></div>
  </div>;
}
