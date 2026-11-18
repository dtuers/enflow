export default {
  id:'life', title:'Life', icon:'home', color:'#506E81',
  image:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  levels:[{id:'life-1',title:'Běžný den',xp:20,items:[
    {id:'l1',type:'phrase',cs:'V kolik hodin vstáváš?',en:'What time do you get up?',distractors:['When','wake'],hint:'get up = vstát'},
    {id:'l2',type:'word',cs:'snídaně',en:'breakfast',distractors:['dinner','break'],hint:'První jídlo dne'}
  ]}]
};