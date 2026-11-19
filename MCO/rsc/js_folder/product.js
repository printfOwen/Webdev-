// ===== PRODUCT PAGE JS - Spirited Away =====
// Features: filter, search, sort, add to cart, quantity +/-, remove, clear, checkout, saved cart
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const peso = n => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const KEY = "spiritedaway.cart";

  // Keep the cart bar right under the header, even when the mobile menu opens
  const nav = $(".site-nav");
  if (nav) {
    const setNav = () => document.documentElement.style.setProperty("--nav-h", nav.offsetHeight + "px");
    setNav();
    new ResizeObserver(setNav).observe(nav);
  }

  // ---------- CART DATA (saved in localStorage so it survives a refresh) ----------
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }
  cart = Array.isArray(cart) ? cart.filter(i => i && i.name && i.price >= 0 && i.qty > 0) : [];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const count = () => cart.reduce((n, i) => n + i.qty, 0);
  const total = () => cart.reduce((n, i) => n + i.qty * i.price, 0);

  // ---------- TOAST ----------
  const toastEl = $("#toast");
  let toastTimer;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  // ---------- DRAW THE CART ----------
  function render() {
    $("#cartCount").textContent = count();
    $("#cartTotal").textContent = peso(total());
    $("#panelTotal").textContent = peso(total());
    $("#checkoutBtn").disabled = !cart.length;

    $("#cartItems").innerHTML = cart.length
      ? cart.map(i => `
        <div class="cart-row">
          <div class="cart-thumb"><i class="bi bi-bag"></i>${i.img ? `<img src="${esc(i.img)}" alt="" onerror="this.remove()">` : ""}</div>
          <div class="flex-grow-1">
            <div class="fw-bold">${esc(i.name)}</div>
            <small class="text-secondary">${peso(i.price)} each</small>
            <div class="qty">
              <button class="qty-btn" data-act="dec" data-name="${esc(i.name)}" aria-label="Decrease">−</button>
              <b>${i.qty}</b>
              <button class="qty-btn" data-act="inc" data-name="${esc(i.name)}" aria-label="Increase">+</button>
            </div>
          </div>
          <div class="text-end">
            <div class="fw-bold">${peso(i.price * i.qty)}</div>
            <button class="icon-btn" data-act="del" data-name="${esc(i.name)}" aria-label="Remove"><i class="bi bi-trash"></i></button>
          </div>
        </div>`).join("")
      : `<div class="empty-cart"><i class="bi bi-cart-x"></i><p class="mt-2 mb-0">Your cart is empty.<br>Add something from Yubaba’s shop!</p></div>`;

    // little "In cart ×2" tag on each product card
    $$(".product-item").forEach(el => {
      const it = cart.find(i => i.name === el.dataset.name);
      let tag = $(".cart-qty", el);
      if (it) {
        if (!tag) { tag = document.createElement("span"); tag.className = "cart-qty"; $(".product-img", el).append(tag); }
        tag.textContent = "In cart ×" + it.qty;
      } else if (tag) tag.remove();
    });
  }

  // ---------- ADD TO CART ----------
  $$(".add-cart").forEach(btn => btn.addEventListener("click", () => {
    const name = btn.dataset.name, price = parseFloat(btn.dataset.price);
    const img = $(".product-img img", btn.closest(".product-item"));
    const found = cart.find(i => i.name === name);
    if (found) found.qty++; else cart.push({ name, price, qty: 1, img: img ? img.getAttribute("src") : "" });
    save(); render();

    if (!btn.dataset.orig) btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-circle"></i> Added!';
    btn.disabled = true;
    setTimeout(() => { btn.innerHTML = btn.dataset.orig; btn.disabled = false; }, 700);
    showToast(name + " added to cart!");
  }));

  // ---------- + / - / REMOVE inside the cart panel ----------
  $("#cartItems").addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const item = cart.find(i => i.name === b.dataset.name);
    if (!item) return;
    if (b.dataset.act === "inc") item.qty++;
    if (b.dataset.act === "dec") item.qty--;
    if (b.dataset.act === "del" || item.qty <= 0) cart = cart.filter(i => i !== item);
    save(); render();
  });

  // ---------- CLEAR CART (button in the bar and in the panel) ----------
  $$(".js-clear").forEach(b => b.addEventListener("click", () => {
    if (!cart.length) return showToast("Your cart is already empty");
    cart = []; save(); render(); showToast("Cart cleared!");
  }));

  // ---------- CHECKOUT (demo only, no real payment) ----------
  const panel = $("#cartPanel");
  $("#checkoutBtn").addEventListener("click", () => {
    if (!cart.length) return;
    $("#orderInfo").innerHTML = `Order <b>SA-${Date.now().toString().slice(-6)}</b><br>${count()} item(s) · <b>${peso(total())}</b>`;
    $("#cartView").classList.add("d-none");
    $("#orderView").classList.remove("d-none");
    cart = []; save(); render();
  });
  $("#shopAgainBtn").addEventListener("click", () => bootstrap.Offcanvas.getOrCreateInstance(panel).hide());
  panel.addEventListener("show.bs.offcanvas", () => {   // always reopen on the cart view
    $("#orderView").classList.add("d-none");
    $("#cartView").classList.remove("d-none");
  });

  // ---------- FILTER + SEARCH ----------
  const items = $$(".product-item"), grid = $("#productGrid");
  const search = $("#searchInput"), none = $("#noResult"), shown = $("#resultCount");
  let filter = "all";
  function applyFilter() {
    const q = search.value.trim().toLowerCase();
    let n = 0;
    items.forEach(el => {
      const text = [el.dataset.name, el.dataset.category, $("p", el).textContent].join(" ").toLowerCase();
      const ok = (filter === "all" || el.dataset.category === filter) && text.includes(q);
      el.classList.toggle("d-none", !ok);
      if (ok) n++;
    });
    none.classList.toggle("d-none", n > 0);
    shown.textContent = `Showing ${n} of ${items.length} products`;
  }
  $$(".filter-btn").forEach(b => b.addEventListener("click", () => {
    $$(".filter-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    filter = b.dataset.filter;
    applyFilter();
  }));
  search.addEventListener("input", applyFilter);

  // ---------- SORT ----------
  const priceOf = el => parseFloat($(".add-cart", el).dataset.price);
  $("#sortSelect").addEventListener("change", e => {
    const list = [...items];
    if (e.target.value === "low") list.sort((a, b) => priceOf(a) - priceOf(b));
    if (e.target.value === "high") list.sort((a, b) => priceOf(b) - priceOf(a));
    if (e.target.value === "az") list.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
    list.forEach(el => grid.append(el));
  });

  render();
  applyFilter();
})();
