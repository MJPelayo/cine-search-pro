// XSS-safe text highlighting (NO innerHTML!)
export function buildHighlightedTitle(title, query) {
  const container = document.createElement("span");
  
  if (!query || query.trim() === "") {
    container.textContent = title;
    return container;
  }
  
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerTitle.indexOf(lowerQuery);
  
  if (idx === -1) {
    container.textContent = title;
    return container;
  }
  
  // Text before match
  const before = document.createTextNode(title.slice(0, idx));
  
  // Highlighted match (using span with class)
  const match = document.createElement("span");
  match.className = "highlight";
  match.textContent = title.slice(idx, idx + query.length);
  
  // Text after match
  const after = document.createTextNode(title.slice(idx + query.length));
  
  container.appendChild(before);
  container.appendChild(match);
  container.appendChild(after);
  
  return container;
}