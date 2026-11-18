export default {
  id:'movies', title:'Movies', icon:'film', color:'#FFB81C',
  image:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  levels:[{id:'movies-1',title:'V kině',xp:20,items:[
    {id:'m1',type:'phrase',cs:'Kdy film začíná?',en:'When does the movie start?',distractors:['is','finish'],hint:'Otázka na čas začátku'},
    {id:'m2',type:'word',cs:'titulky',en:'subtitles',distractors:['actors','screen'],hint:'Text dole na obrazovce'}
  ]}]
};