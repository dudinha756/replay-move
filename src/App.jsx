import React, { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, Clock3, Dumbbell, Footprints,
  HeartPulse, History, Music2, Play, RotateCcw, Sparkles, Waves
} from "lucide-react";

const currentMoods = [
  { id:"tired", label:"Cansada", emoji:"😴", tone:"low" },
  { id:"stressed", label:"Estressada", emoji:"😵‍💫", tone:"tense" },
  { id:"anxious", label:"Ansiosa", emoji:"😬", tone:"tense" },
  { id:"neutral", label:"Neutra", emoji:"😐", tone:"mid" },
  { id:"good", label:"Bem", emoji:"🙂", tone:"high" },
  { id:"energized", label:"Energizada", emoji:"⚡", tone:"high" }
];

const targetMoods = [
  { id:"calm", label:"Mais calma", emoji:"🌿" },
  { id:"focused", label:"Mais focada", emoji:"🎯" },
  { id:"energized", label:"Mais energizada", emoji:"🔥" },
  { id:"strong", label:"Mais forte", emoji:"💪" },
  { id:"free", label:"Mais leve", emoji:"🪽" },
  { id:"playful", label:"Mais divertida", emoji:"✨" }
];

const times = [5,10,20,30];

const movementLibrary = {
  calm: [
    { type:"Mobilidade", icon:Waves, intensity:"Leve", base:8, prompt:"Movimentos lentos + respiração cadenciada" },
    { type:"Caminhada", icon:Footprints, intensity:"Leve", base:12, prompt:"Caminhe sem pressa e reduza o ritmo aos poucos" }
  ],
  focused: [
    { type:"Caminhada", icon:Footprints, intensity:"Moderada", base:12, prompt:"Ritmo constante e atenção na respiração" },
    { type:"Força", icon:Dumbbell, intensity:"Moderada", base:15, prompt:"Circuito simples com poucos exercícios e boa execução" }
  ],
  energized: [
    { type:"Cardio curto", icon:HeartPulse, intensity:"Moderada", base:10, prompt:"Intervalos curtos para elevar gradualmente a energia" },
    { type:"Dança", icon:Music2, intensity:"Livre", base:8, prompt:"Escolha uma música e mova-se sem se preocupar com técnica" }
  ],
  strong: [
    { type:"Força", icon:Dumbbell, intensity:"Moderada", base:20, prompt:"Agachamento, empurrar, puxar e estabilidade" },
    { type:"Circuito", icon:HeartPulse, intensity:"Moderada", base:15, prompt:"Blocos curtos com força e recuperação ativa" }
  ],
  free: [
    { type:"Caminhada", icon:Footprints, intensity:"Leve", base:15, prompt:"Movimento contínuo em ambiente aberto, se possível" },
    { type:"Mobilidade", icon:Waves, intensity:"Leve", base:10, prompt:"Solte ombros, quadris e coluna sem buscar performance" }
  ],
  playful: [
    { type:"Dança", icon:Music2, intensity:"Livre", base:10, prompt:"Uma música favorita + movimentos improvisados" },
    { type:"Play circuit", icon:Sparkles, intensity:"Livre", base:12, prompt:"Misture passos, deslocamentos e desafios simples" }
  ]
};

function pickRecommendation(current, target, time){
  const pool = movementLibrary[target] || movementLibrary.calm;
  let chosen = pool[0];

  if(current==="tired" && target==="energized") chosen = movementLibrary.energized[1];
  if(current==="stressed" || current==="anxious") {
    if(target==="strong") chosen = movementLibrary.strong[0];
    else if(target!=="energized") chosen = movementLibrary.calm[0];
  }
  if(current==="energized" && target==="calm") chosen = movementLibrary.calm[1];

  return {
    ...chosen,
    duration: Math.max(5, Math.min(time, chosen.base > time ? time : chosen.base))
  };
}

export default function App(){
  const [step,setStep] = useState(0);
  const [current,setCurrent] = useState("neutral");
  const [target,setTarget] = useState("energized");
  const [time,setTime] = useState(10);
  const [after,setAfter] = useState("");
  const [history,setHistory] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("m2m-history")) || []; }
    catch { return []; }
  });

  const recommendation = useMemo(
    ()=>pickRecommendation(current,target,time),
    [current,target,time]
  );

  const saveSession = value => {
    setAfter(value);
    const item = {
      id: Date.now(),
      date: new Date().toISOString(),
      current,target,time,
      movement: recommendation.type,
      after:value
    };
    const next = [item,...history].slice(0,30);
    setHistory(next);
    localStorage.setItem("m2m-history", JSON.stringify(next));
  };

  if(step===0) return <main className="app landing">
    <div className="badge">MOOD → MOVEMENT</div>
    <section className="hero">
      <p className="kicker">HOW YOU FEEL → HOW YOU WANT TO FEEL</p>
      <h1>Seu movimento pode começar pelo seu estado emocional.</h1>
      <p className="lead">Você diz como está, como quer se sentir e quanto tempo tem. O app sugere um movimento simples para aquele momento.</p>
      <button className="primary" onClick={()=>setStep(1)}>Começar <ArrowRight size={18}/></button>
    </section>
    <p className="note">Protótipo de bem-estar. Não substitui avaliação médica ou orientação profissional.</p>
  </main>;

  if(step===4) return <main className="app">
    <Header onHome={()=>setStep(0)}/>
    <section className="screen result">
      <p className="kicker">SUGESTÃO PARA AGORA</p>
      <h2>{recommendation.type}</h2>
      <RecommendationCard recommendation={recommendation} time={time}/>
      <div className="why">
        <b>Por que essa sugestão?</b>
        <p>Você marcou <strong>{labelCurrent(current)}</strong> e quer se sentir <strong>{labelTarget(target)}</strong>. A recomendação prioriza uma sessão simples, compatível com os {time} minutos disponíveis.</p>
      </div>
      <button className="primary full" onClick={()=>setStep(5)}><Play size={18}/> Iniciar sessão</button>
    </section>
  </main>;

  if(step===5) return <main className="app">
    <Header onHome={()=>setStep(0)}/>
    <section className="screen session">
      <div className="sessionIcon"><recommendation.icon size={30}/></div>
      <p className="kicker">MOVIMENTO DE HOJE</p>
      <h2>{recommendation.type}</h2>
      <div className="sessionTime"><Clock3 size={20}/><b>{recommendation.duration} min</b></div>
      <p className="sessionPrompt">{recommendation.prompt}</p>
      <div className="sessionSteps">
        <span>01 <b>Comece leve</b></span>
        <span>02 <b>Encontre um ritmo confortável</b></span>
        <span>03 <b>Finalize percebendo como você está</b></span>
      </div>
      <button className="primary full" onClick={()=>setStep(6)}><Check size={18}/> Concluir</button>
    </section>
  </main>;

  if(step===6) return <main className="app">
    <Header onHome={()=>setStep(0)}/>
    <section className="screen feedback">
      <p className="kicker">DEPOIS DO MOVIMENTO</p>
      <h2>Como você se sente agora?</h2>
      <div className="feedbackGrid">
        {[
          ["better","😊","Melhor"],
          ["same","😐","Igual"],
          ["worse","😕","Pior"]
        ].map(([v,e,l])=><button key={v} className={after===v?"selected":""} onClick={()=>saveSession(v)}><span>{e}</span><b>{l}</b></button>)}
      </div>
      {after && <div className="saved"><Check size={18}/> Sessão salva no seu histórico.</div>}
      <button className="secondary" onClick={()=>{setAfter("");setStep(1)}}><RotateCcw size={18}/> Fazer outra</button>
    </section>
  </main>;

  if(step===7) return <main className="app">
    <Header onHome={()=>setStep(0)}/>
    <section className="screen">
      <p className="kicker">SEU PADRÃO</p>
      <h2>Histórico</h2>
      {history.length===0 ? <div className="empty">Nenhuma sessão concluída ainda.</div> :
      <div className="history">
        {history.map(item=><article key={item.id}>
          <div><b>{item.movement} · {item.time} min</b><span>{new Date(item.date).toLocaleDateString("pt-BR")}</span></div>
          <div className="miniMood">{item.after==="better"?"😊":item.after==="same"?"😐":"😕"}</div>
        </article>)}
      </div>}
    </section>
  </main>;

  const screens = [
    null,
    {title:"Como você está agora?", content:<MoodGrid items={currentMoods} value={current} onPick={setCurrent}/>},
    {title:"Como você gostaria de se sentir?", content:<MoodGrid items={targetMoods} value={target} onPick={setTarget}/>},
    {title:"Quanto tempo você tem?", content:<div className="timeGrid">{times.map(v=><button key={v} className={time===v?"selected":""} onClick={()=>setTime(v)}><Clock3 size={20}/><b>{v}</b><span>min</span></button>)}</div>}
  ];

  const s=screens[step];

  return <main className="app">
    <Header onHome={()=>setStep(0)}/>
    <section className="screen">
      <div className="progress"><span style={{width:(step/3*100)+"%"}}/></div>
      <p className="step">0{step} / 03</p>
      <h2>{s.title}</h2>
      {s.content}
      <div className="actions">
        <button className="back" onClick={()=>setStep(step-1)}><ArrowLeft size={18}/></button>
        <button className="primary" onClick={()=>setStep(step===3?4:step+1)}>{step===3?"Ver sugestão":"Continuar"} <ArrowRight size={18}/></button>
      </div>
      <button className="historyLink" onClick={()=>setStep(7)}><History size={16}/> Ver histórico</button>
    </section>
  </main>;
}

function Header({onHome}){return <header><button className="wordmark" onClick={onHome}>MOOD <span>→</span> MOVEMENT</button></header>}

function MoodGrid({items,value,onPick}){return <div className="moodGrid">{items.map(i=><button key={i.id} className={value===i.id?"selected":""} onClick={()=>onPick(i.id)}><span>{i.emoji}</span><b>{i.label}</b></button>)}</div>}

function RecommendationCard({recommendation,time}){
  const Icon = recommendation.icon;
  return <div className="recommendation">
    <div className="recIcon"><Icon size={28}/></div>
    <div><span>{recommendation.intensity}</span><b>{recommendation.duration} minutos</b><p>{recommendation.prompt}</p></div>
    <Clock3 size={18}/>
  </div>
}

const labelCurrent=id=>currentMoods.find(x=>x.id===id)?.label?.toLowerCase()||id;
const labelTarget=id=>targetMoods.find(x=>x.id===id)?.label?.toLowerCase()||id;
