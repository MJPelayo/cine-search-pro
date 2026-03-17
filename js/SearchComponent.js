export default class SearchComponent {

  constructor(){

    this.apiKey = "YOUR_API_KEY";

    this.input = document.getElementById("searchBox");
    this.resultList = document.getElementById("results");
    

    this.timer = null;

  }

  init(){
    this.input.addEventListener("input", (e)=> this.handleInput(e));
  }

  handleInput(e){

    const query = e.target.value;

    clearTimeout(this.timer);

   

    this.timer = setTimeout(()=>{
      this.search(query);
    },300);

  }

  async search(query){
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${query}`
  );
  const data = await res.json();
  console.log(data);
}

  }

  