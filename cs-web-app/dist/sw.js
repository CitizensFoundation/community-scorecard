if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let i=Promise.resolve();return s[e]||(i=new Promise(async i=>{if("document"in self){const s=document.createElement("script");s.src=e,document.head.appendChild(s),s.onload=i}else importScripts(e),i()})),i.then(()=>{if(!s[e])throw new Error(`Module ${e} didn’t register its module`);return s[e]})},i=(i,s)=>{Promise.all(i.map(e)).then(e=>s(1===e.length?e[0]:e))},s={require:Promise.resolve(i)};self.define=(i,o,r)=>{s[i]||(s[i]=Promise.resolve().then(()=>{let s={};const t={uri:location.origin+i.slice(1)};return Promise.all(o.map(i=>{switch(i){case"exports":return s;case"module":return t;default:return e(i)}})).then(e=>{const i=r(...e);return s.default||(s.default=i),s})}))}}define("./sw.js",["./workbox-7f44299b"],(function(e){"use strict";e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"f267bb42.js",revision:"993b22fbc80e97ca2661d1adf02fc98a"},{url:"index.html",revision:"c99802e470871e5edb0c77d67aba94c2"},{url:"node_modules/socket.io-client/dist/socket.io.js",revision:"53a8cbbae604f0f6db88bcfe2aabb39e"},{url:"node_modules/socket.io-client/dist/socket.io.min.js",revision:"d5593b94cdc1b8d03f7e079046b3c6ff"},{url:"node_modules/socket.io-client/dist/socket.io.msgpack.min.js",revision:"4c619aaeb046aa4a7fd447ae6581ecfd"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html")))}));
//# sourceMappingURL=sw.js.map
