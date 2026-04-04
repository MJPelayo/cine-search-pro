// Keyboard navigation handler
export class KeyboardNavigator {
  constructor(resultListSelector, onSelect) {
    this.currentIndex = -1;
    this.resultList = null;
    this.resultListSelector = resultListSelector;
    this.onSelect = onSelect;
    this.items = [];
  }
  
  // Update the current list of items
  updateItems() {
    this.resultList = document.querySelector(this.resultListSelector);
    if (this.resultList) {
      this.items = Array.from(this.resultList.querySelectorAll(".movie-card"));
    } else {
      this.items = [];
    }
  }
  
  // Reset navigation state
  reset() {
    this.currentIndex = -1;
    this.removeActiveClass();
  }
  
  // Remove active class from all items
  removeActiveClass() {
    this.items.forEach(item => item.classList.remove("active"));
  }
  
  // Update active item display
  updateActiveItem() {
    this.removeActiveClass();
    if (this.currentIndex >= 0 && this.items[this.currentIndex]) {
      this.items[this.currentIndex].classList.add("active");
      this.items[this.currentIndex].scrollIntoView({ block: "nearest" });
    }
  }
  
  // Handle keyboard events
  handleKeydown(e) {
    this.updateItems();
    
    if (this.items.length === 0) return false;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.updateActiveItem();
        return true;
        
      case "ArrowUp":
        e.preventDefault();
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.updateActiveItem();
        return true;
        
      case "Enter":
        e.preventDefault();
        if (this.currentIndex >= 0 && this.items[this.currentIndex]) {
          const movieId = this.items[this.currentIndex].dataset.id;
          if (this.onSelect) this.onSelect(movieId);
        }
        return true;
        
      default:
        return false;
    }
  }
}