const VERSION='4.1.0';
const STATIC_CACHE=`ffu-static-${VERSION}`;
const RUNTIME_CACHE=`ffu-runtime-${VERSION}`;
const IMAGE_CACHE='ffu-player-images-v2';
const APP_SHELL=['/','/index.html','/styles.css?v=4.1.0','/data.js?v=4.1.0','/assets/three.min.js?v=4.1.0','/match3d.js?v=4.1.0','/career-v4.js?v=4.1.0','/app.js?v=4.1.0','/manifest.webmanifest?v=4.1.0','/assets/icon-192.png','/assets/icon-512.png','/assets/icon-maskable-512.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==STATIC_CACHE&&key!==RUNTIME_CACHE&&key!==IMAGE_CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});

async function networkFirst(request){
  const cache=await caches.open(RUNTIME_CACHE);
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response?.ok)cache.put(request,response.clone());
    return response;
  }catch{
    return (await cache.match(request)) || (await caches.match('/index.html'));
  }
}
async function cacheFirst(request){
  const cache=await caches.open(STATIC_CACHE);
  const cached=await cache.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response?.ok)cache.put(request,response.clone());
  return response;
}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin){
    if(event.request.destination==='image')event.respondWith(caches.open(IMAGE_CACHE).then(async cache=>{const hit=await cache.match(event.request);if(hit)return hit;try{const res=await fetch(event.request,{mode:'cors'});if(res?.ok)cache.put(event.request,res.clone());return res}catch{return new Response('',{status:503})}}));
    return;
  }
  if(event.request.mode==='navigate' || ['script','style','manifest'].includes(event.request.destination)){
    event.respondWith(networkFirst(event.request));
    return;
  }
  event.respondWith(cacheFirst(event.request));
});
