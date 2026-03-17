export default class SearchComponent {

  constructor(){
    this.input = document.getElementById("searchBox");
  }

  init(){
    console.log("App started");
  }

}
constructor(){
  this.input = document.getElementById("searchBox");
  this.timer = null;
}

init(){
  this.input.addEventListener("input", (e)=> this.handleInput(e));
}

handleInput(e){
  const query = e.target.value;

  clearTimeout(this.timer);

  this.timer = setTimeout(()=>{
    console.log("Searching:", query);
  },300);
}
constructor(){
  this.input = document.getElementById("searchBox");
  this.timer = null;
}

init(){
  this.input.addEventListener("input", (e)=> this.handleInput(e));
}

handleInput(e){
  const query = e.target.value;

  clearTimeout(this.timer);

  this.timer = setTimeout(()=>{
    console.log("Searching:", query);
  },300);
}