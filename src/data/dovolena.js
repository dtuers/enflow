export default {
  id:'vacation', title:'Dovolená', icon:'plane', color:'#43B02A',
  image:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  levels:[{id:'vacation-1',title:'Na letišti',xp:20,items:[
    {id:'v1',type:'phrase',cs:'Kde je odbavení?',en:'Where is the check-in desk?',distractors:['gate','are'],hint:'check-in desk = odbavovací přepážka'},
    {id:'v2',type:'word',cs:'zavazadlo',en:'luggage',distractors:['holiday','ticket'],hint:'To, co odevzdáš u přepážky'},
    {id:'v3',type:'phrase',cs:'Chtěl bych pokoj s výhledem.',en:'I would like a room with a view.',distractors:['have','window'],hint:'would like = chtěl bych'}
  ]}]
};