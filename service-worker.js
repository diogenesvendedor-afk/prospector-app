const CACHE_NAME = 'prospector-cache-v2'; // versão incrementada: força o navegador a descartar o cache antigo
const ARQUIVOS_SHELL = [
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

// Estratégia: network-first para o HTML (sempre busca a versão mais nova primeiro,
// só usa cache se estiver sem internet). Isso evita ficar preso numa versão antiga
// do app enquanto ele ainda está em desenvolvimento.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (event.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
          return resposta;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  // outras requisições (Google Maps, Apps Script, manifest) vão direto pra rede
});
