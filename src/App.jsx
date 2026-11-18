import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Gamepad2, Plane, Film, HeartPulse, House, Volume2, VolumeX, Sun, Moon, Trophy, Flame, ChevronRight, RotateCcw, Layers3, Dumbbell, CheckCircle2, XCircle, Shuffle, ArrowLeft } from 'lucide-react';
import categories from './data/index.js';

const icons = { game:Gamepad2, plane:Plane, film:Film, home:House, doctor:HeartPulse };
const shuffle = a => [...a].sort(() => Math.random() - .5);
const wordsOf = text => text.split(' ');

function speak(text, enabled) {
  if (!enabled || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = 'en-US'; voice.rate = .82;
  speechSynthesis.speak(voice);
}

export default function App(){
  const [dark,setDark]=useState(()=>localStorage.getItem('pf-theme')==='dark');
  const [sound,setSound]=useState(()=>localStorage.getItem('pf-sound')!=='off');
  const [tab,setTab]=useState('phrases');
  const [catId,setCatId]=useState('gaming');
  const [screen,setScreen]=useState('home');
  const [levelIndex,setLevelIndex]=useState(0);
  const [itemIndex,setItemIndex]=useState(0);
  const [selected,setSelected]=useState([]);
  const [pool,setPool]=useState([]);
  const [result,setResult]=useState(null);
  const [xp,setXp]=useState(()=>Number(localStorage.getItem('pf-xp')||0));
  const [hearts,setHearts]=useState(5);
  const [completed,setCompleted]=useState(()=>JSON.parse(localStorage.getItem('pf-completed')||'[]'));
  const [mistakes,setMistakes]=useState(()=>JSON.parse(localStorage.getItem('pf-mistakes')||'[]'));

  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';localStorage.setItem('pf-theme',dark?'dark':'light')},[dark]);
  useEffect(()=>localStorage.setItem('pf-sound',sound?'on':'off'),[sound]);
  useEffect(()=>localStorage.setItem('pf-xp',xp),[xp]);
  useEffect(()=>localStorage.setItem('pf-completed',JSON.stringify(completed)),[completed]);
  useEffect(()=>localStorage.setItem('pf-mistakes',JSON.stringify(mistakes)),[mistakes]);

  const category=categories.find(c=>c.id===catId)||categories[0];
  const level=category.levels[levelIndex]||category.levels[0];
  const normalItems=useMemo(()=>tab==='words'?level.items.filter(i=>i.type==='word'):level.items.filter(i=>i.type==='phrase'),[level,tab]);
  const fallback=normalItems.length?normalItems:level.items;
  const practiceItems=useMemo(()=>{
    const all=categories.flatMap(c=>c.levels.flatMap(l=>l.items));
    const wrong=all.filter(i=>mistakes.includes(i.id));
    return shuffle(wrong.length?wrong:all).slice(0,10);
  },[mistakes,screen]);
  const items=tab==='practice'?practiceItems:fallback;
  const item=items[itemIndex%Math.max(items.length,1)];

  useEffect(()=>{
    if(!item)return;
    setPool(shuffle([...wordsOf(item.en),...(item.distractors||[])]));setSelected([]);setResult(null);
  },[item?.id,tab,screen]);

  function start(index=0){setLevelIndex(index);setItemIndex(0);setHearts(5);setScreen('lesson')}
  function pick(word,index){if(result)return;setSelected(s=>[...s,word]);setPool(p=>p.filter((_,i)=>i!==index))}
  function unpick(word,index){if(result)return;setPool(p=>[...p,word]);setSelected(s=>s.filter((_,i)=>i!==index))}
  function reset(){setSelected([]);setPool(shuffle([...wordsOf(item.en),...(item.distractors||[])]));setResult(null)}
  function check(){
    const ok=selected.join(' ')===item.en;setResult(ok?'correct':'wrong');
    if(ok){setXp(v=>v+5);setMistakes(m=>m.filter(id=>id!==item.id));speak(item.en,sound)}
    else{setHearts(v=>Math.max(0,v-1));setMistakes(m=>m.includes(item.id)?m:[...m,item.id])}
  }
  function next(){
    if(itemIndex>=items.length-1){if(tab!=='practice'&&!completed.includes(level.id))setCompleted(c=>[...c,level.id]);if(tab!=='practice')setXp(v=>v+level.xp);setScreen('complete')}
    else setItemIndex(i=>i+1)
  }
  function selectTab(id){setTab(id);setItemIndex(0);setScreen('home')}

  return <div className="app-shell">
    <header className="topbar"><button className="brand" onClick={()=>setScreen('home')}><span className="logo">P</span><span><b>PhraseFlow</b><small>English by playing</small></span></button><div className="tools"><span className="streak"><Flame/>3</span><span><Trophy/>{xp} XP</span><button aria-label="Zvuk" onClick={()=>setSound(!sound)}>{sound?<Volume2/>:<VolumeX/>}</button><button aria-label="Motiv" onClick={()=>setDark(!dark)}>{dark?<Sun/>:<Moon/>}</button></div></header>
    <main>
      {screen==='home'&&<>
        <section className="hero"><span>Denní mise · 10 minut</span><h1>Poskládej angličtinu.<br/>Zapamatuj si ji hraním.</h1><p>Krátké úrovně, obrázkové kategorie, opakování chyb a okamžitá výslovnost.</p></section>
        {tab==='practice'?<section className="practice-card"><Dumbbell/><div><h2>Chytré opakování</h2><p>{mistakes.length?`Čeká na tebe ${mistakes.length} chybných odpovědí.`:'Nemáš uložené chyby. Procvičíš náhodný výběr.'}</p></div><button onClick={()=>start(0)}>Spustit</button></section>:<>
          <div className="section-title"><div><small>VYBER TÉMA</small><h2>{tab==='words'?'Samostatná slovíčka':'Co chceš dnes trénovat?'}</h2></div><button onClick={()=>setCatId(categories[Math.floor(Math.random()*categories.length)].id)}><Shuffle/> Náhodně</button></div>
          <div className="categories">{categories.map(c=>{const Icon=icons[c.icon];return <button key={c.id} className={catId===c.id?'active':''} onClick={()=>{setCatId(c.id);setLevelIndex(0)}}><div className="cat-photo" style={{backgroundImage:`linear-gradient(transparent,rgba(0,0,0,.45)),url(${c.image})`}}/><div><span style={{background:c.color}}><Icon/></span><b>{c.title}</b></div></button>})}</div>
          <div className="levels">{category.levels.map((l,i)=><button key={l.id} onClick={()=>start(i)}><span className="level-badge" style={{background:completed.includes(l.id)?'#43B02A':category.color}}>{completed.includes(l.id)?<CheckCircle2/>:i+1}</span><span className="level-copy"><small>ÚROVEŇ {i+1}</small><b>{l.title}</b><em>{l.items.length} úkoly · +{l.xp} XP</em></span><ChevronRight/></button>)}</div>
        </>}
      </>}
      {screen==='lesson'&&item&&<section className="lesson-wrap"><div className="progress-row"><button onClick={()=>setScreen('home')}><ArrowLeft/></button><div className="progress"><i style={{width:`${((itemIndex+1)/items.length)*100}%`}}/></div><b>♥ {hearts}</b></div><article className="lesson-card"><div className="lesson-meta"><span>{item.type==='word'?'SLOVÍČKO':'SLOŽ FRÁZI'}</span><button onClick={()=>speak(item.en,sound)}><Volume2/></button></div><h2>{item.cs}</h2><p>{item.hint}</p><div className="answer-zone">{selected.map((w,i)=><button key={w+i} onClick={()=>unpick(w,i)}>{w}</button>)}</div><div className="word-pool">{pool.map((w,i)=><button key={w+i} onClick={()=>pick(w,i)}>{w}</button>)}</div><div className="actions"><button className="reset" onClick={reset}><RotateCcw/></button>{!result?<button disabled={!selected.length} className="check" onClick={check}>Zkontrolovat</button>:<button className={result==='correct'?'next good':'next bad'} onClick={next}>Pokračovat</button>}</div>{result&&<div className={`feedback ${result}`}>{result==='correct'?<CheckCircle2/>:<XCircle/>}<div><b>{result==='correct'?'Správně! +5 XP':'Nesprávně'}</b><span>Správná odpověď: {item.en}</span></div></div>}</article></section>}
      {screen==='complete'&&<section className="complete"><Trophy/><small>ÚROVEŇ DOKONČENA</small><h2>Skvělá práce!</h2><p>Výsledky a chyby jsou uložené v tomto zařízení.</p><button onClick={()=>setScreen('home')}>Zpět na úrovně</button></section>}
    </main>
    <nav>{[{id:'phrases',label:'Fráze',Icon:BookOpen},{id:'words',label:'Slovíčka',Icon:Layers3},{id:'practice',label:'Opakování',Icon:Dumbbell}].map(({id,label,Icon})=><button className={tab===id?'active':''} onClick={()=>selectTab(id)} key={id}><Icon/><span>{label}</span></button>)}</nav>
  </div>
}
