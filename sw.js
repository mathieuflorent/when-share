// Service worker minimal pour la page de partage GitHub Pages.
// Reçoit les notifications push envoyées par sendTemporalReminderPush vers les
// abonnés (SharedPushSubscription) et les affiche. Version simplifiée du sw.js
// principal de l'app : pas de gestion de file d'attente, pas de déduplication
// complexe — une seule notification par When partagé, au bon moment.

self.addEventListener("install", function (e) { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener("push", function (event) {
  var payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { title: "When", body: event.data ? event.data.text() : "C'est le bon moment." };
  }

  var title = payload.title || "When";
  var options = {
    body: payload.body || payload.title || "C'est le bon moment.",
    icon: payload.icon || "icon-192.png",
    badge: payload.badge || "badge-72.png",
    tag: payload.tag || "when-shared",
    data: payload.data || {},
    actions: payload.actions || [],
    vibrate: [80, 40, 80],
    requireInteraction: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  var url = (event.notification.data && event.notification.data.url) || null;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      if (url) {
        for (var i = 0; i < clientList.length; i++) {
          if (clientList[i].url.indexOf(url) !== -1 && "focus" in clientList[i]) {
            return clientList[i].focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
      } else if (clientList.length && "focus" in clientList[0]) {
        return clientList[0].focus();
      }
    })
  );
});
