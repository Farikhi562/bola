const CACHE='ffu-v3.0.0';
const IMAGE_CACHE='ffu-player-images-v1';
const ASSETS=['./','./index.html','./styles.css','./data.js','./assets/three.min.js','./match3d.js','./app.js','./manifest.webmanifest','./assets/icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE && key!==IMAGE_CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);

  // Wajah pemain/agen hanya dimuat ketika dibuka, lalu dicache. Bukan 700 request brutal saat startup.
  if(url.origin!==self.location.origin && event.request.destination==='image'){
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async cache=>{
        const cached=await cache.match(event.request);
        if(cached) return cached;
        try{
          const response=await fetch(event.request,{mode:'cors'});
          if(response && response.ok) cache.put(event.request,response.clone());
          return response;
        }catch{
          return new Response('',{status:503,statusText:'Image unavailable offline'});
        }
      })
    );
    return;
  }

  if(url.origin!==self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached=>{
      const network=fetch(event.request).then(response=>{
        if(response && response.ok){
          const clone=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,clone));
        }
        return response;
      });
      return cached || network.catch(()=>caches.match('./index.html'));
    })
  );
});
