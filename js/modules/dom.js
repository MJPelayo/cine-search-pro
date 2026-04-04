// DOM manipulation helpers
export const DOM = {
  // Show/hide elements
  show: (element) => { if (element) element.style.display = "block"; },
  hide: (element) => { if (element) element.style.display = "none"; },
  
  // Set loading state
  setLoading: (appElement, isLoading) => {
    if (appElement) appElement.dataset.loading = isLoading;
  },
  
  // Clear element content
  clear: (element) => {
    if (element) element.innerHTML = "";
  },
  
  // Show message
  showMessage: (messageElement, text) => {
    if (messageElement) {
      messageElement.textContent = text;
    }
  },
  
  // Clear search input
  clearInput: (inputElement) => {
    if (inputElement) {
      inputElement.value = "";
      inputElement.dispatchEvent(new Event('input'));
    }
  },
  
  // Update result count
  updateResultCount: (countElement, count) => {
    if (countElement) {
      countElement.textContent = `${count} movie${count !== 1 ? 's' : ''} found`;
    }
  }
};