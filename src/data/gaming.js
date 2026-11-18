export default {
  id: 'gaming', title: 'Gaming', icon: 'game', color: '#00AEEF',
  image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
  levels: [
    { id:'gaming-1', title:'Začínáme hrát', xp:20, items:[
      {id:'g1',type:'phrase',cs:'Připoj se k mému týmu.',en:'Join my team.',distractors:['your','game'],hint:'join = připojit se'},
      {id:'g2',type:'word',cs:'úroveň',en:'level',distractors:['life','leave'],hint:'Nová herní úroveň'},
      {id:'g3',type:'phrase',cs:'Potřebuji více munice.',en:'I need more ammo.',distractors:['have','many'],hint:'ammo = munice'},
      {id:'g4',type:'phrase',cs:'Kde je další kontrolní bod?',en:'Where is the next checkpoint?',distractors:['What','last'],hint:'checkpoint = kontrolní bod'}
    ]},
    { id:'gaming-2', title:'Týmová hra', xp:30, items:[
      {id:'g5',type:'phrase',cs:'Kryj mě!',en:'Cover me!',distractors:['Open','you'],hint:'Pokyn spoluhráči'},
      {id:'g6',type:'word',cs:'spoluhráč',en:'teammate',distractors:['teamwork','enemy'],hint:'Člen tvého týmu'},
      {id:'g7',type:'phrase',cs:'Nepřítel je za námi.',en:'The enemy is behind us.',distractors:['before','we'],hint:'behind = za'}
    ]}
  ]
};