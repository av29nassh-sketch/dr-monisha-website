// carty-cart.js — shared cart & wishlist engine (localStorage)
(function () {
  var CART_KEY = 'carty_cart';
  var WISH_KEY = 'carty_wish';

  // ─── CART ─────────────────────────────────────────────────────────────────

  window.getCart = function () {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { return []; }
  };

  window.saveCart = function (cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateBadges();
  };

  window.addToCart = function (product) {
    var cart = getCart();
    var existing = cart.find(function (i) { return i.id === product.id; });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, img: product.img || '', category: product.category || '', qty: 1 });
    }
    saveCart(cart);
    showToast('"' + product.name + '" added to bag');
  };

  window.removeFromCart = function (id) {
    saveCart(getCart().filter(function (i) { return i.id !== id; }));
  };

  window.updateCartQty = function (id, delta) {
    var cart = getCart();
    var item = cart.find(function (i) { return i.id === id; });
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    saveCart(cart);
  };

  window.getCartTotal = function () {
    return getCart().reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);
  };

  window.getCartCount = function () {
    return getCart().reduce(function (sum, i) { return sum + i.qty; }, 0);
  };

  window.clearCart = function () {
    localStorage.removeItem(CART_KEY);
    updateBadges();
  };

  // ─── WISHLIST ──────────────────────────────────────────────────────────────

  window.getWishlist = function () {
    try { return JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); } catch (e) { return []; }
  };

  window.saveWishlist = function (list) {
    localStorage.setItem(WISH_KEY, JSON.stringify(list));
  };

  window.addToWishlist = function (product) {
    var list = getWishlist();
    if (!list.find(function (i) { return i.id === product.id; })) {
      list.push({ id: product.id, name: product.name, price: product.price, img: product.img || '', category: product.category || '' });
      saveWishlist(list);
      showToast('"' + product.name + '" saved to wishlist');
    } else {
      showToast('Already in your wishlist');
    }
  };

  window.removeFromWishlist = function (id) {
    saveWishlist(getWishlist().filter(function (i) { return i.id !== id; }));
  };

  window.isWishlisted = function (id) {
    return !!getWishlist().find(function (i) { return i.id === id; });
  };

  // ─── UI HELPERS ───────────────────────────────────────────────────────────

  window.updateBadges = function () {
    var count = getCartCount();
    document.querySelectorAll('[data-cart-badge]').forEach(function (el) {
      el.textContent = count > 99 ? '99+' : String(count);
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  };

  window.showToast = function (msg) {
    var toast = document.getElementById('carty-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'carty-toast';
      toast.style.cssText = 'position:fixed;bottom:96px;left:50%;transform:translateX(-50%) translateY(12px);background:#111;color:#fff;padding:10px 22px;font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.06em;z-index:99999;opacity:0;transition:opacity 0.2s,transform 0.2s;white-space:nowrap;pointer-events:none;border-radius:2px;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 2400);
  };

  // Format price
  window.fmtPrice = function (n) {
    return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  document.addEventListener('DOMContentLoaded', updateBadges);
})();
