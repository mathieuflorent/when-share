<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>When — partage</title>
<style>
  :root {
    --bg:#0f0c1a; --card:#1e1b2e; --border:#2a273b; --fg:#ffffff;
    --muted:#94a3b8; --primary:#a78bfa; --primary2:#7c3aed;
    --danger:#ef4444; --success:#34d399;
  }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body {
    margin:0; background:var(--bg); color:var(--fg);
    font-family:'Inter',system-ui,-apple-system,sans-serif;
    min-height:100vh; letter-spacing:-.011em;
  }
  /* Aurora — même rendu que l'app (mesh violet/bleu atténué, CSS pur). */
  body::before {
    content:""; position:fixed; inset:-25%; z-index:-1; pointer-events:none;
    background:
      radial-gradient(42% 52% at 18% 28%, hsl(265 70% 42% / .16), transparent 62%),
      radial-gradient(46% 56% at 82% 22%, hsl(225 72% 46% / .14), transparent 62%),
      radial-gradient(50% 60% at 72% 80%, hsl(285 60% 42% / .12), transparent 60%),
      radial-gradient(40% 50% at 28% 76%, hsl(210 70% 46% / .10), transparent 62%);
    background-repeat:no-repeat; filter:blur(48px); -webkit-filter:blur(48px);
    animation:aurora-drift 24s ease-in-out infinite alternate; will-change:transform;
  }
  @keyframes aurora-drift {
    0%   { transform:translate3d(-2%,-1.5%,0) scale(1); }
    50%  { transform:translate3d(2.5%,2%,0) scale(1.06); }
    100% { transform:translate3d(-1%,1.5%,0) scale(1.03); }
  }
  @media (prefers-reduced-motion: reduce) { body::before { animation:none; } }

  .wrap { max-width:480px; margin:0 auto; padding:24px 20px 40px; }
  .brand { display:flex; align-items:center; gap:8px; color:var(--muted); font-size:14px; font-weight:600; }
  .dot { width:10px; height:10px; border-radius:50%; background:linear-gradient(135deg,#a78bfa,#7c3aed); }
  .hero { text-align:center; margin-top:40px; }
  .bell {
    width:56px; height:56px; margin:0 auto; border-radius:20px;
    background:rgba(167,139,250,.15); display:grid; place-items:center;
    box-shadow:0 0 0 1px rgba(167,139,250,.16),0 0 32px -8px rgba(167,139,250,.38);
  }
  .bell svg { width:26px; height:26px; color:var(--primary); }
  h1 { margin:20px 0 4px; font-size:22px; font-weight:700; letter-spacing:-.02em; }
  .sub { color:var(--muted); font-size:14px; }
  .card { margin-top:32px; border:1px solid var(--border); background:var(--card); border-radius:24px; padding:20px; }
  .card .k { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
  .card .v { margin-top:6px; font-size:18px; font-weight:700; line-height:1.25; }
  .card .label {
    margin-top:10px; background:linear-gradient(160deg,rgba(167,139,250,.18),rgba(124,58,237,.10));
    color:var(--primary); border-radius:14px; padding:12px; font-size:14px; font-weight:500;
  }
  .btn {
    display:block; width:100%; margin-top:24px; border:none; border-radius:16px;
    padding:16px; font-size:16px; font-weight:600; color:#fff;
    background:linear-gradient(135deg,#a78bfa,#7c3aed);
    box-shadow:0 12px 30px -10px rgba(124,58,237,.5); cursor:pointer;
  }
  .btn:active { transform:scale(.98); }
  .btn:disabled { opacity:.6; cursor:default; }
  .hint { margin-top:16px; text-align:center; color:var(--muted); font-size:12px; }

  /* États (chargement / succès / erreur) */
  .state { margin-top:24px; border-radius:16px; padding:16px; font-size:14px; text-align:center; }
  .state.loading { background:rgba(148,163,184,.08); color:var(--muted); }
  .state.success { background:rgba(52,211,153,.10); color:var(--success); border:1px solid rgba(52,211,153,.2); }
  .state.error   { background:rgba(239,68,68,.10); color:var(--danger); border:1px solid rgba(239,68,68,.2); }
  .spinner { display:inline-block; width:14px; height:14px; border:2px solid currentColor; border-top-color:transparent; border-radius:50%; animation:spin .8s linear infinite; vertical-align:-2px; margin-right:8px; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .ok-check { display:inline-block; width:18px; height:18px; margin-right:8px; vertical-align:-3px; }
  .hidden { display:none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="brand"><span class="dot"></span> When</div>
  <div class="hero">
    <div class="bell">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </svg>
    </div>
    <h1>Quelqu'un veut te prévenir</h1>
    <p class="sub">Active les notifications pour être prévenu au bon moment.</p>
  </div>

  <div class="card" id="card">
    <p class="k">Ce When</p>
    <p class="v" id="when-title"><span class="spinner"></span>Chargement…</p>
    <div class="label hidden" id="when-label"></div>
  </div>

  <button class="btn" id="enable-btn" disabled>Activer les notifications</button>

  <div class="state hidden" id="state"></div>

  <p class="hint">Une seule notification, au bon moment. Aucun compte requis, aucun spam.</p>
</div>

<script>
(function () {
  "use strict";

  // ── Configuration ──────────────────────────────────────────────
  // Domaine de l'app When (fonctions backend). Remplace par ton domaine
  // personnalisé si tu en as connecté un (il proxy /functions/ de la même façon).
  var API_BASE = "https://when-the-moment.base44.app/functions";

  // ── Éléments DOM ───────────────────────────────────────────────
  var titleEl = document.getElementById("when-title");
  var labelEl = document.getElementById("when-label");
  var btn = document.getElementById("enable-btn");
  var stateEl = document.getElementById("state");

  // ── Lecture du token dans l'URL (?token=...) ───────────────────
  var token = new URLSearchParams(window.location.search).get("token");

  function setState(kind, html) {
    stateEl.className = "state " + kind;
    stateEl.innerHTML = html;
    stateEl.classList.remove("hidden");
  }
  function clearState() { stateEl.className = "state hidden"; stateEl.innerHTML = ""; }

  function escapeHtml(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }

  // ── Appels cross-origin vers les fonctions backend ─────────────
  function callFn(name, body) {
    return fetch(API_BASE + "/" + name, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().catch(function () { return { error: "bad_response" }; })
        .then(function (data) { return { status: r.status, data: data }; });
    });
  }

  // ── Conversion clé VAPID base64url → Uint8Array ────────────────
  function urlBase64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - base64String.length % 4) % 4);
    var b64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    var raw = atob(b64);
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  // ── Messages d'erreur lisibles ─────────────────────────────────
  function errMessage(code) {
    switch (code) {
      case "not_found": return "Lien invalide ou expiré. Vérifie le lien que tu as reçu.";
      case "reminder_inactive": return "Ce When est déjà terminé — tu ne peux plus t'y abonner.";
      case "subscriber_cap_reached": return "Ce When a atteint son nombre maximum d'abonnés.";
      case "missing_token": return "Aucun token de partage dans le lien.";
      case "missing_fields": return "Informations de souscription manquantes.";
      default: return "Une erreur est survenue. Réessaie plus tard.";
    }
  }

  // ── 1. Vérifier le support navigateur ──────────────────────────
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    titleEl.textContent = "Notifications non supportées";
    setState("error", "Ton navigateur ne supporte pas les notifications web push. Essaie depuis Chrome, Edge ou Firefox sur mobile ou ordinateur.");
    return;
  }

  // ── 2. Token présent ? ─────────────────────────────────────────
  if (!token) {
    titleEl.textContent = "Lien invalide";
    setState("error", escapeHtml(errMessage("missing_token")));
    return;
  }

  // ── 3. Charger les infos du When + la config push ─────────────
  var vapidKey = null;
  Promise.all([
    callFn("getSharedReminder", { share_token: token }),
    callFn("getPushConfig", {})
  ]).then(function (results) {
    var rem = results[0], cfg = results[1];

    // When
    if (rem.status !== 200 || !rem.data || !rem.data.ok) {
      titleEl.textContent = "When introuvable";
      setState("error", escapeHtml(errMessage(rem.data ? rem.data.error : "not_found")));
      return;
    }
    titleEl.textContent = rem.data.title || "When";
    if (rem.data.recommendation_label) {
      labelEl.textContent = rem.data.recommendation_label;
      labelEl.classList.remove("hidden");
    }

    // Config push
    if (cfg.status !== 200 || !cfg.data || !cfg.data.vapid_public_key) {
      setState("error", "Les notifications push ne sont pas activées sur ce service pour le moment.");
      return;
    }
    vapidKey = cfg.data.vapid_public_key;
    btn.disabled = false;
  }).catch(function () {
    titleEl.textContent = "Erreur de chargement";
    setState("error", "Impossible de contacter le service. Vérifie ta connexion et réessaie.");
  });

  // ── 4. Activation des notifications ───────────────────────────
  btn.addEventListener("click", function () {
    if (!vapidKey) return;
    btn.disabled = true;
    setState("loading", '<span class="spinner"></span>Aktivation en cours…');

    Notification.requestPermission().then(function (perm) {
      if (perm !== "granted") {
        setState("error", "Tu as refusé les notifications. Autorise-les dans les réglages du navigateur pour être prévenu.");
        btn.disabled = false;
        return;
      }
      // Enregistre le service worker (chemin relatif → fonctionne sous /repo/ GitHub Pages)
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
      }).then(function (sub) {
        var payload = {
          share_token: token,
          endpoint: sub.endpoint,
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey("p256dh")))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey("auth"))))
        };
        return callFn("joinSharedReminder", payload).then(function (res) {
          if (res.status === 200 && res.data && (res.data.ok || res.data.already_subscribed)) {
            // Succès : remplace le bouton par une confirmation visuelle.
            btn.style.display = "none";
            setState("success",
              '<svg class="ok-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
              "C'est fait ! Tu recevras une notification au bon moment.");
          } else {
            throw new Error(res.data ? res.data.error : "unknown");
          }
        });
      }).catch(function (err) {
        var code = (err && err.message) ? err.message : "unknown";
        if (code === "permission_denied" || /permission/i.test(code)) {
          setState("error", "Autorisation de notification refusée.");
        } else if (code === "already_subscribed") {
          setState("success", "Tu es déjà abonné à ce When.");
        } else {
          setState("error", escapeHtml(errMessage(code)));
        }
        btn.disabled = false;
      });
    }).catch(function () {
      setState("error", "Impossible de demander l'autorisation de notification.");
      btn.disabled = false;
    });
  });
})();
</script>
</body>
</html>
```

## `sw.js`

```js
// Service worker minimal pour la page de partage GitHub Pages.
// Reçoit les notifications push envoyées par sendTemporalReminderPush vers les
// abonnés (SharedPushSubscription) et les affiche. Version simplifiée du sw.js
// principal de l'app : pas de gestion de file d'attente, pas de déduplication
// complexe — une seule notification par When partagé, au bon moment.

self.addEventListener("install", function (e) { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

// ── Réception d'un push ──────────────────────────────────────────
self.addEventListener("push", function (event) {
  var payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    // Payload non-JSON : on affiche un texte par défaut.
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

// ── Clic sur la notification ─────────────────────────────────────
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Action "done" / "later" : on ne navigue pas (ack géré côté app propriétaire).
  var url = (event.notification.data && event.notification.data.url) || null;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      if (url) {
        // Ouvre l'URL cible (page app / When) si fournie.
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
