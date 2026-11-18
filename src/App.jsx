import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, Gamepad2, Plane, Film, HeartPulse, House, Volume2,
  VolumeX, Sun, Moon, Trophy, Flame, ChevronRight, RotateCcw,
  Layers3, Dumbbell, CheckCircle2, XCircle, Shuffle, ArrowLeft,
  Library, Search, ListFilter
} from 'lucide-react';
import categories from './data/index.js';

const icons = { game: Gamepad2, plane: Plane, film: Film, home: House, doctor: HeartPulse };
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const wordsOf = (text) => text.split(' ');
const cleanWord = (word) => word.toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, '');

function speak(text, enabled) {
  if (!enabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = 'en-US';
  voice.rate = 0.82;
  window.speechSynthesis.speak(voice);
}

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('pf-theme') === 'dark');
  const [sound, setSound] = useState(() => localStorage.getItem('pf-sound') !== 'off');
  const [tab, setTab] = useState('phrases');
  const [catId, setCatId] = useState('gaming');
  const [screen, setScreen] = useState('home');
  const [levelIndex, setLevelIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [pool, setPool] = useState([]);
  const [result, setResult] = useState(null);
  const [xp, setXp] = useState(() => Number(localStorage.getItem('pf-xp') || 0));
  const [hearts, setHearts] = useState(5);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('pf-completed') || '[]'));
  const [mistakes, setMistakes] = useState(() => JSON.parse(localStorage.getItem('pf-mistakes') || '[]'));
  const [overviewType, setOverviewType] = useState('phrases');
  const [overviewCategory, setOverviewCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(60);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('pf-theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => localStorage.setItem('pf-sound', sound ? 'on' : 'off'), [sound]);
  useEffect(() => localStorage.setItem('pf-xp', String(xp)), [xp]);
  useEffect(() => localStorage.setItem('pf-completed', JSON.stringify(completed)), [completed]);
  useEffect(() => localStorage.setItem('pf-mistakes', JSON.stringify(mistakes)), [mistakes]);
  useEffect(() => setVisibleCount(60), [query, overviewType, overviewCategory]);

  const category = categories.find((c) => c.id === catId) || categories[0];
  const level = category.levels[levelIndex] || category.levels[0];
  const normalItems = useMemo(() => {
    const filtered = level.items.filter((i) => i.type === (tab === 'words' ? 'word' : 'phrase'));
    return filtered.length ? filtered : level.items;
  }, [level, tab]);
  const practiceItems = useMemo(() => {
    const all = categories.flatMap((c) => c.levels.flatMap((l) => l.items));
    const wrong = all.filter((i) => mistakes.includes(i.id));
    return shuffle(wrong.length ? wrong : all).slice(0, 10);
  }, [mistakes, screen]);
  const items = tab === 'practice' ? practiceItems : normalItems;
  const item = items[itemIndex % Math.max(items.length, 1)];

  const allPhrases = useMemo(() => categories.flatMap((cat) =>
    cat.levels.flatMap((lev, levelNo) => lev.items.map((entry) => ({
      ...entry, categoryId: cat.id, categoryTitle: cat.title,
      categoryColor: cat.color, levelTitle: lev.title, levelNo: levelNo + 1
    })))
  ), []);

  const allWords = useMemo(() => {
    const map = new Map();
    allPhrases.forEach((phrase) => {
      wordsOf(phrase.en).forEach((raw) => {
        const word = cleanWord(raw);
        if (!word || word.length < 2) return;
        const key = `${phrase.categoryId}:${word}`;
        if (!map.has(key)) map.set(key, {
          word, count: 0, categoryId: phrase.categoryId,
          categoryTitle: phrase.categoryTitle, categoryColor: phrase.categoryColor,
          exampleEn: phrase.en, exampleCs: phrase.cs
        });
        map.get(key).count += 1;
      });
    });
    return [...map.values()].sort((a, b) => a.word.localeCompare(b.word, 'en'));
  }, [allPhrases]);

  const overviewItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = overviewType === 'phrases' ? allPhrases : allWords;
    return source.filter((entry) => {
      const categoryMatch = overviewCategory === 'all' || entry.categoryId === overviewCategory;
      if (!categoryMatch) return false;
      if (!q) return true;
      return overviewType === 'phrases'
        ? `${entry.en} ${entry.cs} ${entry.categoryTitle} ${entry.levelTitle}`.toLowerCase().includes(q)
        : `${entry.word} ${entry.exampleEn} ${entry.exampleCs} ${entry.categoryTitle}`.toLowerCase().includes(q);
    });
  }, [allPhrases, allWords, overviewType, overviewCategory, query]);

  useEffect(() => {
    if (!item) return;
    setPool(shuffle([...wordsOf(item.en), ...(item.distractors || [])]));
    setSelected([]); setResult(null);
  }, [item?.id, tab, screen]);

  function start(index = 0) { setLevelIndex(index); setItemIndex(0); setHearts(5); setScreen('lesson'); }
  function pick(word, index) { if (result) return; setSelected((s) => [...s, word]); setPool((p) => p.filter((_, i) => i !== index)); }
  function unpick(word, index) { if (result) return; setPool((p) => [...p, word]); setSelected((s) => s.filter((_, i) => i !== index)); }
  function reset() { setSelected([]); setPool(shuffle([...wordsOf(item.en), ...(item.distractors || [])])); setResult(null); }
  function check() {
    const ok = selected.join(' ') === item.en;
    setResult(ok ? 'correct' : 'wrong');
    if (ok) { setXp((v) => v + 5); setMistakes((m) => m.filter((id) => id !== item.id)); speak(item.en, sound); }
    else { setHearts((v) => Math.max(0, v - 1)); setMistakes((m) => m.includes(item.id) ? m : [...m, item.id]); }
  }
  function next() {
    if (itemIndex >= items.length - 1) {
      if (tab !== 'practice' && !completed.includes(level.id)) setCompleted((c) => [...c, level.id]);
      if (tab !== 'practice') setXp((v) => v + level.xp);
      setScreen('complete');
    } else setItemIndex((i) => i + 1);
  }
  function selectTab(id) { setTab(id); setItemIndex(0); setScreen('home'); }

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setScreen('home')}><span className="logo">P</span><span><b>PhraseFlow</b><small>English by playing</small></span></button>
      <div className="tools"><span className="streak"><Flame />3</span><span><Trophy />{xp} XP</span><button aria-label="Zvuk" onClick={() => setSound(!sound)}>{sound ? <Volume2 /> : <VolumeX />}</button><button aria-label="Motiv" onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</button></div>
    </header>

    <main>
      {screen === 'home' && tab !== 'overview' && <>
        <section className="hero"><span>Denní mise · 10 minut</span><h1>Poskládej angličtinu.<br />Zapamatuj si ji hraním.</h1><p>Krátké úrovně, obrázkové kategorie, opakování chyb a okamžitá výslovnost.</p></section>
        {tab === 'practice' ? <section className="practice-card"><Dumbbell /><div><h2>Chytré opakování</h2><p>{mistakes.length ? `Čeká na tebe ${mistakes.length} chybných odpovědí.` : 'Nemáš uložené chyby. Procvičíš náhodný výběr.'}</p></div><button onClick={() => start(0)}>Spustit</button></section> : <>
          <div className="section-title"><div><small>VYBER TÉMA</small><h2>{tab === 'words' ? 'Samostatná slovíčka' : 'Co chceš dnes trénovat?'}</h2></div><button onClick={() => setCatId(categories[Math.floor(Math.random() * categories.length)].id)}><Shuffle /> Náhodně</button></div>
          <div className="categories">{categories.map((c) => { const Icon = icons[c.icon]; return <button key={c.id} className={catId === c.id ? 'active' : ''} onClick={() => { setCatId(c.id); setLevelIndex(0); }}><div className="cat-photo" style={{ backgroundImage: `linear-gradient(transparent,rgba(0,0,0,.45)),url(${c.image})` }} /><div><span style={{ background: c.color }}><Icon /></span><b>{c.title}</b></div></button>; })}</div>
          <div className="levels">{category.levels.map((l, i) => <button key={l.id} onClick={() => start(i)}><span className="level-badge" style={{ background: completed.includes(l.id) ? '#43B02A' : category.color }}>{completed.includes(l.id) ? <CheckCircle2 /> : i + 1}</span><span className="level-copy"><small>ÚROVEŇ {i + 1}</small><b>{l.title}</b><em>{l.items.length} úkolů · +{l.xp} XP</em></span><ChevronRight /></button>)}</div>
        </>}
      </>}

      {screen === 'home' && tab === 'overview' && <section className="overview-page">
        <div className="overview-heading"><div><small>KNIHOVNA UČIVA</small><h1>Všechny fráze a slovíčka</h1><p>Prohledávej kompletní obsah všech kategorií a přehraj si anglickou výslovnost.</p></div><div className="overview-stats"><span><b>{allPhrases.length.toLocaleString('cs-CZ')}</b> frází</span><span><b>{allWords.length.toLocaleString('cs-CZ')}</b> slov</span></div></div>
        <div className="overview-controls">
          <div className="overview-switch"><button className={overviewType === 'phrases' ? 'active' : ''} onClick={() => setOverviewType('phrases')}><BookOpen /> Fráze</button><button className={overviewType === 'words' ? 'active' : ''} onClick={() => setOverviewType('words')}><Layers3 /> Slovíčka</button></div>
          <label className="search-box"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={overviewType === 'phrases' ? 'Hledat česky nebo anglicky…' : 'Hledat slovíčko…'} /></label>
          <label className="category-filter"><ListFilter /><select value={overviewCategory} onChange={(e) => setOverviewCategory(e.target.value)}><option value="all">Všechny kategorie</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
        </div>
        <div className="result-line">Nalezeno <b>{overviewItems.length.toLocaleString('cs-CZ')}</b> položek</div>
        {overviewItems.length === 0 ? <div className="empty-results">Pro zadané hledání nebyly nalezeny žádné výsledky.</div> : overviewType === 'phrases' ?
          <div className="phrase-catalog">{overviewItems.slice(0, visibleCount).map((row, index) => <article key={`${row.id}-${index}`} className="catalog-card"><div className="catalog-number">{index + 1}</div><div className="catalog-copy"><div className="catalog-tags"><span style={{ background: row.categoryColor }}>{row.categoryTitle}</span><em>Úroveň {row.levelNo}</em></div><h3>{row.en}</h3><p>{row.cs}</p></div><button className="speak-button" aria-label="Přehrát frázi" onClick={() => speak(row.en, sound)}><Volume2 /></button></article>)}</div>
          : <div className="word-catalog">{overviewItems.slice(0, visibleCount).map((row) => <article key={`${row.categoryId}-${row.word}`} className="word-card"><div><span className="word-category" style={{ background: row.categoryColor }}>{row.categoryTitle}</span><h3>{row.word}</h3><p>Výskyt ve frázích: {row.count}×</p><small>{row.exampleEn}</small></div><button className="speak-button" aria-label="Přehrát slovíčko" onClick={() => speak(row.word, sound)}><Volume2 /></button></article>)}</div>}
        {visibleCount < overviewItems.length && <button className="load-more" onClick={() => setVisibleCount((n) => n + 100)}>Zobrazit dalších 100</button>}
      </section>}

      {screen === 'lesson' && item && <section className="lesson-wrap"><div className="progress-row"><button onClick={() => setScreen('home')}><ArrowLeft /></button><div className="progress"><i style={{ width: `${((itemIndex + 1) / items.length) * 100}%` }} /></div><b>♥ {hearts}</b></div><article className="lesson-card"><div className="lesson-meta"><span>{item.type === 'word' ? 'SLOVÍČKO' : 'SLOŽ FRÁZI'}</span><button onClick={() => speak(item.en, sound)}><Volume2 /></button></div><h2>{item.cs}</h2><p>{item.hint}</p><div className="answer-zone">{selected.map((w, i) => <button key={w + i} onClick={() => unpick(w, i)}>{w}</button>)}</div><div className="word-pool">{pool.map((w, i) => <button key={w + i} onClick={() => pick(w, i)}>{w}</button>)}</div><div className="actions"><button className="reset" onClick={reset}><RotateCcw /></button>{!result ? <button disabled={!selected.length} className="check" onClick={check}>Zkontrolovat</button> : <button className={result === 'correct' ? 'next good' : 'next bad'} onClick={next}>Pokračovat</button>}</div>{result && <div className={`feedback ${result}`}>{result === 'correct' ? <CheckCircle2 /> : <XCircle />}<div><b>{result === 'correct' ? 'Správně! +5 XP' : 'Nesprávně'}</b><span>Správná odpověď: {item.en}</span></div></div>}</article></section>}
      {screen === 'complete' && <section className="complete"><Trophy /><small>ÚROVEŇ DOKONČENA</small><h2>Skvělá práce!</h2><p>Výsledky a chyby jsou uložené v tomto zařízení.</p><button onClick={() => setScreen('home')}>Zpět na úrovně</button></section>}
    </main>

    <nav>{[
      { id: 'phrases', label: 'Fráze', Icon: BookOpen },
      { id: 'words', label: 'Slovíčka', Icon: Layers3 },
      { id: 'practice', label: 'Opakování', Icon: Dumbbell },
      { id: 'overview', label: 'Přehled', Icon: Library }
    ].map(({ id, label, Icon }) => <button className={tab === id ? 'active' : ''} onClick={() => selectTab(id)} key={id}><Icon /><span>{label}</span></button>)}</nav>
  </div>;
}
