document.addEventListener("DOMContentLoaded", () => {
  // -----------------------
  // Config
  // -----------------------
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const API_BASE = isLocal ? "http://localhost:5000" : window.location.origin;

  // -----------------------
  // Helpers
  // -----------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const setHTML = (el, html) => (el.innerHTML = html);

  const showLoading = (el) =>
    setHTML(el, '<div class="loading-spinner" role="status"></div>');

  const friendlyError = (el, msg = "Something went wrong") =>
    setHTML(el, `<p class="error-message" role="alert">${msg}</p>`);

  const debounce = (fn, delay = 300) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  // -----------------------
  // Fetch helper
  // -----------------------
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // -----------------------
  // Loaders
  // -----------------------
  async function loadGames({ targetEl, search = "" } = {}) {
    const grid = targetEl;
    showLoading(grid);
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const games = await fetchJSON(`${API_BASE}/api/games${qs}`);
      setHTML(grid, "");
      if (!games.length) {
        setHTML(grid, `<p class="error-message">No games match your search.</p>`);
        return;
      }
      for (const g of games) {
        const card = document.createElement("div");
        card.className = "game-card";
        card.innerHTML = `
          <div class="game-img"><img src="${API_BASE}${g.image}" alt="${g.title} cover"></div>
          <div class="game-content">
            <h3>${g.title}</h3>
            <p>${g.description}</p>
          </div>`;
        grid.appendChild(card);
      }
    } catch (err) {
      console.error(err);
      friendlyError(grid, "Failed to load games.");
    }
  }

  async function loadTechnology({ targetEl, search = "" } = {}) {
    const container = targetEl;
    showLoading(container);
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const techs = await fetchJSON(`${API_BASE}/api/technology${qs}`);
      setHTML(container, "");
      if (!techs.length) {
        setHTML(container, `<p class="error-message">No technology matches your search.</p>`);
        return;
      }
      for (const t of techs) {
        const card = document.createElement("div");
        card.className = "tech-card";
        card.innerHTML = `
          <div class="tech-icon"><i class="${t.icon}" aria-hidden="true"></i></div>
          <h3>${t.name}</h3>
          <p>${t.description}</p>`;
        container.appendChild(card);
      }
    } catch (err) {
      console.error(err);
      friendlyError(container, "Failed to load technology.");
    }
  }

  // -----------------------
  // Router
  // -----------------------
  const views = {
    "/": $("#view-home"),
    "/games": $("#view-games"),
    "/technology": $("#view-technology"),
  };

  function parseHash() {
    const hash = window.location.hash || "#/";
    const [path, qs] = hash.slice(1).split("?");
    return {
      path: path || "/",
      params: new URLSearchParams(qs || ""),
    };
  }

  async function router() {
    const { path, params } = parseHash();
    Object.values(views).forEach((v) => v && (v.hidden = true));
    const view = views[path];
    if (!view) return;

    view.hidden = false;

    if (path === "/games") {
      await loadGames({ targetEl: $("#games-grid"), search: params.get("search") || "" });
    }
    if (path === "/technology") {
      await loadTechnology({ targetEl: $("#tech-container"), search: params.get("search") || "" });
    }
  }

  window.addEventListener("hashchange", router);

  // -----------------------
  // Search inputs
  // -----------------------
  const gameSearch = $("#search-input");
  const techSearch = $("#tech-search-input");

  if (gameSearch) {
    gameSearch.addEventListener(
      "input",
      debounce((e) => {
        const value = e.target.value.trim();
        const base = "#/games";
        const next = value ? `${base}?search=${encodeURIComponent(value)}` : base;
        history.replaceState(null, "", next); // FIX: prevents reload wiping input
        router(); // reload view manually
      }, 400)
    );
  }

  if (techSearch) {
    techSearch.addEventListener(
      "input",
      debounce((e) => {
        const value = e.target.value.trim();
        const base = "#/technology";
        const next = value ? `${base}?search=${encodeURIComponent(value)}` : base;
        history.replaceState(null, "", next); // FIX: prevents reload wiping input
        router(); // reload view manually
      }, 400)
    );
  }

  // -----------------------
  // Init
  // -----------------------
  if (!window.location.hash) window.location.hash = "#/";
  router();
});
