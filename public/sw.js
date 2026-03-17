self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Esse evento vazio é o segredo que engana o Chrome e libera a instalação do App Nativo!
});
