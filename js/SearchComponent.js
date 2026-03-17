import SearchComponent from "./SearchComponent.js";

const app = new SearchComponent();
app.init();

export default class SearchComponent {

  constructor(){
    this.input = document.getElementById("searchBox");
  }

  init(){
    console.log("App started");
  }

}