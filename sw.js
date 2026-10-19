const CACHE='gym-companion-v4-6';
const ASSETS=['./','./index.html','./styles.css?v=4.6','./workouts.js?v=4.6','./core.js?v=4.6','./app.js?v=4.6','./manifest.json?v=4.6','./icons/icon-yellow-192.png','./icons/icon-yellow-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(asset=>new Request(asset,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('gym-companion-')||k.startsWith('workout-companion-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  const known=ASSETS.some(asset=>new URL(asset,self.registration.scope).pathname===url.pathname);
  if(!known&&request.mode!=='navigate')return;
  // Fetch fresh app files when online. Keep the last complete app available offline.
  event.respondWith(fetch(request,{cache:'no-cache'}).then(async response=>{
    if(response.ok&&response.type!=='opaqueredirect'&&(response.headers.get('content-type')||'').includes(request.mode==='navigate'?'text/html':url.pathname.endsWith('.js')?'javascript':url.pathname.endsWith('.css')?'text/css':url.pathname.endsWith('.json')?'json':'image/')){
      const cache=await caches.open(CACHE);await cache.put(request,response.clone());
    }
    return response;
  }).catch(async()=>{const cached=await caches.match(request);if(cached)return cached;if(request.mode==='navigate')return (await caches.match('./index.html'))||Response.error();return Response.error()}));
});
