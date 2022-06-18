if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("../sworker.js")
    .then((registration) => {
      console.log("Service Worker registered");
      console.log(registration);
    })
    .catch((error) => {
      console.log(`service worker Error`);
      console.log(error);
    });
} else {
  alert("Service worker not working");
}
