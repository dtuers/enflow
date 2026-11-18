export default {
  id:'doctor', title:'Doktor', icon:'doctor', color:'#DF0024',
  image:'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80',
  levels:[{id:'doctor-1',title:'U lékaře',xp:20,items:[
    {id:'d1',type:'phrase',cs:'Bolí mě v krku.',en:'I have a sore throat.',distractors:['pain','neck'],hint:'sore throat = bolest v krku'},
    {id:'d2',type:'word',cs:'předpis',en:'prescription',distractors:['description','medicine'],hint:'Doklad od lékaře na lék'}
  ]}]
};