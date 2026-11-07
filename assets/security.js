(() => {
  'use strict';
  const memory = new Map();
  window.BTStorage = Object.freeze({
    getItem(key) {try{return localStorage.getItem(key) ?? memory.get(key) ?? null;}catch{return memory.get(key) ?? null;}},
    setItem(key,value) {memory.set(key,String(value));try{localStorage.setItem(key,String(value));}catch{}},
    removeItem(key) {memory.delete(key);try{localStorage.removeItem(key);}catch{}}
  });
  window.BTSecurity = Object.freeze({
    async fetch(input,init={}) {
      const controller=new AbortController();
      const abort=()=>controller.abort();
      if(init.signal?.aborted)controller.abort();else init.signal?.addEventListener('abort',abort,{once:true});
      const timer=setTimeout(abort,12000);
      try{return await fetch(input,{...init,signal:controller.signal});}
      finally{clearTimeout(timer);init.signal?.removeEventListener('abort',abort);}
    },
    safeImage(value) {
      if (!value) return '/blacktigersbjj/assets/black-tigers-logo-small.png';
      try {const url=new URL(String(value),location.origin);return !url.username&&!url.password&&((url.origin===location.origin && ['http:','https:'].includes(url.protocol))||url.protocol==='https:')?url.href:'/blacktigersbjj/assets/black-tigers-logo-small.png';}
      catch{return '/blacktigersbjj/assets/black-tigers-logo-small.png';}
    },
    storedList(key) {
      try{const data=JSON.parse(window.BTStorage.getItem(key)||'[]');return Array.isArray(data)?[...new Set(data.filter(v=>typeof v==='string'&&v.length<=160))].slice(0,1000):[];}catch{return [];}
    },
    uuid(value){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value||''));},
    returnPath(value) {
      try {const url=new URL(value||'/blacktigersbjj/conta/',location.origin);return url.origin===location.origin && !url.username && !url.password && !url.pathname.startsWith('//') && /^\/blacktigersbjj\/(conta|admin|catalogo|assistir|seguranca|privacidade)(\/|$)/.test(url.pathname)?url.pathname+url.search+url.hash:'/blacktigersbjj/conta/';}catch{return '/blacktigersbjj/conta/';}
    }
  });
})();
