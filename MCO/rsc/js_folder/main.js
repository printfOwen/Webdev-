
(() => {
  // Shortcuts for selecting HTML elements
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const KEY = "spiritedaway.cart";

  // Format prices in Philippine pesos
  const peso = n => "₱" + n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Load the saved cart from localStorage
  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    cart = [];
  }

  cart = Array.isArray(cart)
    ? cart.filter(i => i && i.name && i.price >= 0 && i.qty > 0)
    : [];

  // Save cart and calculate its contents
  const save = () => localStorage.setItem(KEY, JSON.stringify(cart));
  const count = () => cart.reduce((sum, i) => sum + i.qty, 0);
  const total = () => cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Display temporary notification messages
  const toast = $("#toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  // Update the cart display and product quantity labels
  function render() {
    $("#cartCount").textContent = count();
    $("#cartTotal").textContent = peso(total());
    $("#panelTotal").textContent = peso(total());
    $("#checkoutBtn").disabled = cart.length === 0;

    // Display cart items or an empty cart message
    $("#cartItems").innerHTML = cart.length
      ? cart.map(i => `
          <div class="cart-row">
            <div class="cart-thumb">
              <i class="bi bi-bag"></i>
              ${i.img ? `<img src="${i.img}" alt="">` : ""}
            </div>

            <div class="flex-grow-1">
              <div class="fw-bold">${i.name}</div>
              <small class="text-secondary">${peso(i.price)} each</small>

              <div class="qty">
                <button class="qty-btn" data-act="dec" data-name="${i.name}">−</button>
                <b>${i.qty}</b>
                <button class="qty-btn" data-act="inc" data-name="${i.name}">+</button>
              </div>
            </div>

            <div class="text-end">
              <div class="fw-bold">${peso(i.price * i.qty)}</div>
              <button class="icon-btn" data-act="del" data-name="${i.name}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        `).join("")
      : `
          <div class="empty-cart">
            <i class="bi bi-cart-x"></i>
            <p>Your cart is empty.<br>Add something from Yubaba’s shop!</p>
          </div>
        `;

    // Show how many of each product are in the cart
    $$(".product-item").forEach(el => {
      const item = cart.find(i => i.name === el.dataset.name);
      let tag = $(".cart-qty", el);

      if (item) {
        if (!tag) {
          tag = document.createElement("span");
          tag.className = "cart-qty";
          $(".product-img", el).append(tag);
        }

        tag.textContent = `In cart ×${item.qty}`;
      } else {
        tag?.remove();
      }
    });
  }

  // Add products to the cart
  $$(".add-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const img = $(".product-img img", btn.closest(".product-item"));
      const item = cart.find(i => i.name === name);

      if (item) {
        item.qty++;
      } else {
        cart.push({
          name,
          price,
          qty: 1,
          img: img?.getAttribute("src") || ""
        });
      }

      save();
      render();

      // Temporarily change the button after adding
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check-circle"></i> Added!';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
      }, 700);

      showToast(`${name} added to cart!`);
    });
  });

  // Handle quantity changes and item removal
  $("#cartItems").addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;

    const item = cart.find(i => i.name === btn.dataset.name);
    if (!item) return;

    if (btn.dataset.act === "inc") item.qty++;
    if (btn.dataset.act === "dec") item.qty--;
    if (btn.dataset.act === "del" || item.qty <= 0) {
      cart = cart.filter(i => i !== item);
    }

    save();
    render();
  });

  // Remove all items from the cart
  $$(".js-clear").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!cart.length) {
        showToast("Your cart is already empty");
        return;
      }

      cart = [];
      save();
      render();
      showToast("Cart cleared!");
    });
  });

  // Demo checkout (does not process real payments)
  const panel = $("#cartPanel");

  $("#checkoutBtn").addEventListener("click", () => {
    if (!cart.length) return;

    // Display a simple order confirmation
    $("#orderInfo").innerHTML = `
      Order <b>SA-${Date.now().toString().slice(-6)}</b><br>
      ${count()} item(s) · <b>${peso(total())}</b>
    `;

    $("#cartView").classList.add("d-none");
    $("#orderView").classList.remove("d-none");

    cart = [];
    save();
    render();
  });

  // Close the cart panel when shopping again
  $("#shopAgainBtn").addEventListener("click", () => {
    bootstrap.Offcanvas.getOrCreateInstance(panel).hide();
  });

  // Show the cart instead of the previous order confirmation
  // whenever the cart panel is opened
  panel.addEventListener("show.bs.offcanvas", () => {
    $("#orderView").classList.add("d-none");
    $("#cartView").classList.remove("d-none");
  });

  // Display the saved cart when the page loads
  render();
})();
