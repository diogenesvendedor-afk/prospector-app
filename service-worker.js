const CACHE_NAME = 'prospector-cache-v1';
const ARQUIVOS_SHELL = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Estratégia: network-first para tudo que é API/Google Maps, cache-first para o shell do app.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const ehShell = ARQUIVOS_SHELL.some(arq => url.endsWith(arq.replace('./', '')));

  if (ehShell) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // outras requisições (Google Maps, Apps Script) sempre vão direto pra rede
});
