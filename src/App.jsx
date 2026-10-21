import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, Clock3, Dumbbell, Footprints,
  HeartPulse, History, Home, Leaf, LogOut, Music2, Play, RotateCcw,
  Sparkles, Sun, Waves, Zap
} from "lucide-react";
import { apiFetch, authClient } from "./auth";

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
    if(item.min <= time){ score += 3; reasons.push("cabe no tempo disponível"); } else score -= 5;

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
    duration: time,
    reasons: chosen.reasons.slice(0,4)
  };
}

export default function App(){
  const [sessionLoading,setSessionLoading] = useState(true);
  const [user,setUser] = useState(null);
  const [authMode,setAuthMode] = useState("signin");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [authError,setAuthError] = useState("");
  const [authBusy,setAuthBusy] = useState(false);

  const [step,setStep] = useState(0);
  const [current,setCurrent] = useState("neutral");
  const [target,setTarget] = useState("energized");
  const [time,setTime] = useState(10);
  const [energy,setEnergy] = useState("medium");
  const [environment,setEnvironment] = useState("anywhere");
  const [intensity,setIntensity] = useState("surprise");
  const [after,setAfter] = useState("");
  const [history,setHistory] = useState([]);
  const [historyLoading,setHistoryLoading] = useState(false);
  const [saveError,setSaveError] = useState("");
  const [musicProfile,setMusicProfile] = useState({favoriteArtists:[],favoriteGenres:[],favoriteSongs:[],preferredEras:[],discoveryMode:"balanced"});
  const [musicProfileLoaded,setMusicProfileLoaded] = useState(false);
  const [musicSaving,setMusicSaving] = useState(false);
  const [musicError,setMusicError] = useState("");
  const [playlistResult,setPlaylistResult] = useState(null);
  const [musicDiscovery,setMusicDiscovery] = useState("balanced");

  useEffect(()=>{
    authClient.getSession().then(result=>{
      setUser(result.data?.user || null);
      setSessionLoading(false);
    }).catch(()=>setSessionLoading(false));
  },[]);

  useEffect(()=>{
    if(!user) {
      setHistory([]);
      setMusicProfileLoaded(false);
      return;
    }
    setHistoryLoading(true);
    apiFetch("/api/sessions")
      .then(data=>setHistory(data.sessions || []))
      .catch(()=>setHistory([]))
      .finally(()=>setHistoryLoading(false));

    apiFetch("/api/music/profile")
      .then(data=>{
        const p=data.profile || {};
        setMusicProfile(p);
        setMusicDiscovery(p.discoveryMode || "balanced");
        setMusicProfileLoaded(true);
      })
      .catch(()=>{
        setMusicProfileLoaded(true);
      });
  },[user]);

  const saveMusicProfile = async profile => {
    setMusicSaving(true);
    setMusicError("");
    try {
      await apiFetch("/api/music/profile",{
        method:"PUT",
        body:JSON.stringify(profile)
      });
      setMusicProfile(profile);
      setMusicDiscovery(profile.discoveryMode || "balanced");
      setStep(0);
    } catch(error) {
      setMusicError(error.message || "Não foi possível salvar seu perfil musical.");
    } finally {
      setMusicSaving(false);
    }
  };

  const createSuggestedPlaylist = async () => {
    setMusicSaving(true);
    setMusicError("");
    setPlaylistResult(null);
    try {
      const data=await apiFetch("/api/music/playlist",{
        method:"POST",
        body:JSON.stringify({
          activity:recommendation.type,
          targetMood:labelOf(targetMoods,target),
          intensity:recommendation.intensity,
          durationMinutes:recommendation.duration,
          discoveryMode:musicDiscovery
        })
      });
      setPlaylistResult(data.playlist);
    } catch(error) {
      setMusicError(error.message || "Não foi possível gerar a playlist.");
    } finally {
      setMusicSaving(false);
    }
  };

  const context = {current,target,time,energy,environment,intensity};
  const recommendation = useMemo(()=>recommend(context,history),[current,target,time,energy,environment,intensity,history]);

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const result = authMode === "signup"
        ? await authClient.signUp.email({ name: email.split("@")[0] || "Usuário", email, password })
        : await authClient.signIn.email({ email, password });

      if(result.error) throw new Error(result.error.message || "Não foi possível entrar.");

      const session = await authClient.getSession();
      if(!session.data?.user) throw new Error("Não foi possível confirmar a sessão.");
      setUser(session.data.user);
    } catch(error) {
      setAuthError(error.message || "Não foi possível concluir o acesso.");
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    await authClient.signOut();
    setUser(null);
    setStep(0);
    setHistory([]);
  };

  const saveSession = async value => {
    setAfter(value);
    setSaveError("");
    try {
      const payload = {
        ...context,
        movementId: recommendation.id,
        movement: recommendation.type,
        score: recommendation.score,
        reasons: recommendation.reasons,
        after:value
      };
      const data = await apiFetch("/api/sessions", {
        method:"POST",
        body:JSON.stringify(payload)
      });
      setHistory(prev=>[data.session,...prev].slice(0,50));
    } catch(error) {
      setSaveError(error.message || "Não foi possível salvar a sessão.");
    }
  };

  const reset = () => {
    setStep(1);
    setAfter("");
    setSaveError("");
  };

  if(sessionLoading) return <main className="app authShell"><div className="authCard"><p className="kicker">MOOD → MOVEMENT</p><h2>Carregando seu espaço...</h2></div></main>;

  if(!user) return <main className="app authShell">
    <section className="authCard">
      <div className="badge">MOOD → MOVEMENT</div>
      <p className="kicker">{authMode==="signup" ? "CRIE SEU ESPAÇO" : "BEM-VINDA DE VOLTA"}</p>
      <h1>{authMode==="signup" ? "Seu histórico começa aqui." : "Entre para continuar."}</h1>
      <p className="authLead">Seu histórico fica salvo no Neon e ajuda o app a personalizar as próximas sugestões.</p>
      <form onSubmit={submitAuth} className="authForm">
        <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label>
        <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete={authMode==="signup"?"new-password":"current-password"}/></label>
        {authError ? <div className="authError">{authError}</div> : null}
        <button className="primary full" disabled={authBusy}>{authBusy ? "Processando..." : authMode==="signup" ? "Criar conta" : "Entrar"}</button>
      </form>
      <button className="textButton" onClick={()=>{setAuthError("");setAuthMode(authMode==="signup"?"signin":"signup")}}>
        {authMode==="signup" ? "Já tenho uma conta" : "Quero criar uma conta"}
      </button>
    </section>
  </main>;

  if(step===0) return <main className="app landing">
    <Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/>
    <section className="hero">
      <p className="kicker">FEEL → CHOOSE → MOVE → LEARN</p>
      <h1>Movimento que começa em como você está hoje.</h1>
      <p className="lead">Conte seu humor, energia, ambiente e preferência. O app combina esses sinais com seu histórico para sugerir um movimento simples e progressivamente mais pessoal.</p>
      <div className="heroActions">
        <button className="primary" onClick={()=>setStep(1)}>Começar <ArrowRight size={18}/></button>
        <button className="secondary" onClick={()=>setStep(11)}><Music2 size={18}/> Meu perfil musical</button>
      </div>
    </section>
    <p className="note">Protótipo de bem-estar. Não substitui avaliação médica, diagnóstico ou orientação profissional.</p>
  </main>;

  if(step===7) return <main className="app">
    <Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/>
    <section className="screen result">
      <p className="kicker">SUGESTÃO PARA AGORA</p>
      <h2>{recommendation.type}</h2>
      <RecommendationCard recommendation={recommendation}/>
      <div className="why">
        <b>Por que essa sugestão?</b>
        <ul>{recommendation.reasons.map((r,i)=><li key={i}>{r}</li>)}</ul>
        <p className="learning">{recommendation.learned>0 ? "A personalização já está usando seu histórico." : "Ainda estamos aprendendo com você. Seu feedback após a sessão vai melhorar as próximas sugestões."}</p>
      </div>
      <MusicPlaylistCard
        profile={musicProfile}
        loaded={musicProfileLoaded}
        loading={musicSaving}
        error={musicError}
        result={playlistResult}
        discovery={musicDiscovery}
        setDiscovery={setMusicDiscovery}
        onEditProfile={()=>setStep(11)}
        onGenerate={createSuggestedPlaylist}
        duration={recommendation.duration}
      />
      <button className="primary full" onClick={()=>setStep(8)}><Play size={18}/> Iniciar sessão</button>
    </section>
  </main>;

  if(step===8) {
    const Icon=recommendation.icon;
    return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/>
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

  if(step===9) return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/>
    <section className="screen feedback">
      <p className="kicker">DEPOIS DO MOVIMENTO</p>
      <h2>Como você se sente agora?</h2>
      <div className="feedbackGrid">
        {[["better","😊","Melhor"],["same","😐","Igual"],["worse","😕","Pior"]].map(([v,e,l])=>
          <button key={v} className={after===v?"selected":""} onClick={()=>saveSession(v)}><span>{e}</span><b>{l}</b></button>
        )}
      </div>
      {after && !saveError ? <div className="saved"><Check size={18}/> Feedback salvo no seu histórico.</div> : null}
      {saveError ? <div className="authError">{saveError}</div> : null}
      <button className="secondary" onClick={reset}><RotateCcw size={18}/> Fazer outra</button>
    </section>
  </main>;

  if(step===11) return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/>
    <MusicProfileScreen
      profile={musicProfile}
      loading={musicSaving}
      error={musicError}
      onCancel={()=>setStep(0)}
      onSave={saveMusicProfile}
    />
  </main>;

  if(step===10) return <main className="app"><Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/>
    <section className="screen">
      <p className="kicker">SEU PADRÃO</p>
      <h2>Histórico</h2>
      <Stats history={history}/>
      {historyLoading ? <div className="empty">Carregando seu histórico...</div> : history.length===0 ? <div className="empty">Nenhuma sessão concluída ainda.</div> :
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
    <Header onHome={()=>setStep(0)} onSignOut={signOut} user={user}/>
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

function Header({onHome,onSignOut,user}){ return <header className="topbar"><button className="wordmark" onClick={onHome}>MOOD <span>→</span> MOVEMENT</button><div className="account"><span>{user?.email}</span><button onClick={onSignOut} aria-label="Sair"><LogOut size={16}/></button></div></header>; }

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



function splitField(value){
  return value.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean);
}

function MusicProfileScreen({profile,loading,error,onCancel,onSave}){
  const [artists,setArtists]=useState((profile.favoriteArtists||[]).join(", "));
  const [genres,setGenres]=useState((profile.favoriteGenres||[]).join(", "));
  const [songs,setSongs]=useState((profile.favoriteSongs||[]).join("\n"));
  const [eras,setEras]=useState((profile.preferredEras||[]).join(", "));
  const [mode,setMode]=useState(profile.discoveryMode || "balanced");

  const submit=e=>{
    e.preventDefault();
    onSave({
      favoriteArtists:splitField(artists),
      favoriteGenres:splitField(genres),
      favoriteSongs:splitField(songs),
      preferredEras:splitField(eras),
      discoveryMode:mode
    });
  };

  return <section className="screen musicProfileScreen">
    <p className="kicker">SEU GOSTO MUSICAL</p>
    <h2>Monte seu perfil musical.</h2>
    <p className="profileIntro">Essas informações ficam no Mood → Movement e são usadas para montar playlists sugeridas. Você não precisa conectar sua conta do Spotify.</p>
    <form className="musicProfileForm" onSubmit={submit}>
      <label>Artistas favoritos
        <input value={artists} onChange={e=>setArtists(e.target.value)} placeholder="Ex.: Dua Lipa, The Weeknd, Coldplay"/>
      </label>
      <label>Gêneros que você gosta
        <input value={genres} onChange={e=>setGenres(e.target.value)} placeholder="Ex.: pop, rock, pagode, eletrônico"/>
      </label>
      <label>Músicas favoritas
        <textarea value={songs} onChange={e=>setSongs(e.target.value)} rows={5} placeholder={"Uma por linha\nEx.: Blinding Lights - The Weeknd"}/>
      </label>
      <label>Décadas / épocas preferidas
        <input value={eras} onChange={e=>setEras(e.target.value)} placeholder="Ex.: anos 80, anos 2000, atual"/>
      </label>
      <div>
        <span className="fieldTitle">Quanto você quer descobrir?</span>
        <div className="musicModes">
          {[["familiar","Mais familiar"],["balanced","Equilíbrio"],["discover","Mais descoberta"]].map(([v,l])=>
            <button type="button" key={v} className={mode===v?"active":""} onClick={()=>setMode(v)}>{l}</button>
          )}
        </div>
      </div>
      {error ? <div className="authError">{error}</div> : null}
      <div className="profileActions">
        <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>
        <button className="primary" disabled={loading}>{loading?"Salvando...":"Salvar perfil musical"}</button>
      </div>
    </form>
  </section>;
}

function MusicPlaylistCard({profile,loaded,loading,error,result,discovery,setDiscovery,onEditProfile,onGenerate,duration}){
  const hasProfile=(profile.favoriteArtists||[]).length || (profile.favoriteGenres||[]).length || (profile.favoriteSongs||[]).length || (profile.preferredEras||[]).length;

  return <section className="spotifyCard">
    <div className="spotifyHead">
      <div className="spotifyIcon"><Music2 size={22}/></div>
      <div>
        <span>TRILHA PERSONALIZADA</span>
        <b>Playlist para esta sessão</b>
      </div>
    </div>

    {!loaded ? <p>Carregando seu perfil musical...</p> : !hasProfile ? <>
      <p>Conte seus artistas, gêneros, músicas e épocas favoritas. O Mood → Movement usa isso para sugerir uma sequência musical personalizada sem acessar sua conta do Spotify.</p>
      <button className="secondary full" onClick={onEditProfile}>Criar meu perfil musical</button>
    </> : <>
      <p>A playlist será baseada no seu perfil musical e ajustada para cerca de {duration} minutos.</p>
      <div className="musicModes">
        {[["familiar","Mais familiar"],["balanced","Equilíbrio"],["discover","Mais descoberta"]].map(([value,label])=>
          <button key={value} className={discovery===value?"active":""} onClick={()=>setDiscovery(value)}>{label}</button>
        )}
      </div>
      <div className="musicCardActions">
        <button className="secondary" onClick={onEditProfile}>Editar perfil</button>
        <button className="spotifyButton" onClick={onGenerate} disabled={loading}>{loading?"Montando...":"Gerar playlist sugerida"}</button>
      </div>
      {result ? <div className="suggestedPlaylist">
        <div className="suggestedPlaylistHead">
          <div><b>{result.title}</b><span>~{result.durationMinutes} min · {result.items.length} sugestões</span></div>
        </div>
        <div className="suggestedTrackList">
          {result.items.map((item,index)=><a key={item.id} href={item.url} target="_blank" rel="noreferrer">
            <span className="trackNo">{String(index+1).padStart(2,"0")}</span>
            <div><b>{item.label}</b><span>{item.subtitle}</span></div>
            <span className="openSpotify">Buscar no Spotify ↗</span>
          </a>)}
        </div>
        <small>Os links abrem buscas no Spotify. O Mood → Movement não acessa nem altera sua conta.</small>
      </div> : null}
    </>}
    {error ? <div className="authError">{error}</div> : null}
  </section>;
}
