declare global {
  interface Window { SiteMath: { mount(document: Document): unknown[] }; }
}

window.SiteMath.mount(document);
