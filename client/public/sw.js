// public/sw.js — Service Worker for Dealer Suite 360 PWA
// Cache-first for assets, network-first for API calls

const CACHE_NAME = "dealersuite360-v2.5.0";
const STATIC_ASSETS = [
  "/",
  "/dealer",
  "/portal",
  "/manifest.json",
];

// ==================== INSTALL ====================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ==================== ACTIVATE ====================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  // NOTE: clients.claim() intentionally omitted — claiming existing clients
  // mid-load interrupts in-flight asset requests and causes broken images.
  // The SW takes control on the next navigation instead.
});

// ==================== FETCH ====================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip WebSocket
  if (url.protocol === "ws:" || url.protocol === "wss:") return;

  // Skip Stripe
  if (url.hostname.includes("stripe.com")) return;

  // Skip Clerk, Cloudflare, and Google Fonts — external resources must not be cached
  if (url.hostname.includes("clerk.accounts.dev") ||
      url.hostname.includes("clerk.com") ||
      url.hostname.includes("cloudflare.com") ||
      url.hostname.includes("fonts.googleapis.com") ||
      url.hostname.includes("fonts.gstatic.com")) return;

  // Skip auth pages — always fetch fresh so CSP headers and Clerk JS are current
  if (url.pathname === "/login" || url.pathname.startsWith("/login/") ||
      url.pathname === "/signup" || url.pathname.startsWith("/signup/") ||
      url.pathname === "/portal-router") return;

  // API calls: network-first, fall back to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response(JSON.stringify({ success: false, message: "Offline" }), {
              headers: { "Content-Type": "application/json" },
              status: 503,
            });
          });
        })
    );
    return;
  }

  // Static assets: cache-first, fall back to network
  if (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".gif") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages: network-first for fresh content
  // Only fall back to app shell for actual HTML navigation requests —
  // never serve HTML as a fallback for other resource types (images, fonts, etc.)
  const isNavigation = request.mode === "navigate";
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Only serve the app shell for HTML navigation; let other resources fail naturally
          if (isNavigation) return caches.match("/");
          return new Response(null, { status: 503, statusText: "Service Unavailable" });
        });
      })
  );
});

// ==================== PUSH NOTIFICATIONS ====================
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.message || data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-72.png",
      tag: data.tag || "dealersuite360",
      data: { url: data.url || data.linkTo || "/dealer" },
      actions: [
        { action: "open", title: "View" },
        { action: "dismiss", title: "Dismiss" },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Dealer Suite 360", options)
    );
  } catch (error) {
    console.error("[SW] Push notification error:", error);
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dealer";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});
