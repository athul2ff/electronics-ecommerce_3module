self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("bigDeal").then((cache) => {
      return cache.addAll([
        "/images/favicon.png",
        "/stylesheets/users-style.css",
        "/userStyle/bootstrap.min.css",
        "/userStyle/font-awesome.min.css",
        "/userStyle/slick-theme.css",
        "/userStyle/slick.css",
        "/userStyle/style.css",
        "/userScript/bootstrap.min.js",
        "/userScript/jquery.min.js",
        "/userScript/jquery.zoom.min.js",
        "/userScript/main.js",
        "/userScript/slick.min.js",
        "/javascripts/users-script.js",
        "/javascripts/script.js",
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
