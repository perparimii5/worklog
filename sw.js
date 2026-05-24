const CACHE='worklog-private-v11-storage-backup-safe-delete';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./script.js','./jspdf.umd.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone();if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin)caches.open(CACHE).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match('./index.html'))))});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SCHEDULE_REMINDER'){setTimeout(()=>{self.registration.showNotification('WorkLog Private',{body:'Mos harro ta regjistrosh ditën e punës.',icon:'icon-192.png',badge:'icon-192.png'})},e.data.delay)}});
