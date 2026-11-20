// Amazing Rudolf Shop - State Management
// All product HTML is pre-rendered in HTML files. This file manages cart + wishlist state only.

function formatPrice(p) {
  if (p >= 1000) return p.toLocaleString('de-CH') + " CHF";
  const s = p % 1 === 0 ? p.toString() : p.toFixed(2);
  return s + " CHF";
}

function getCart() {
  try { return JSON.parse(localStorage.getItem('ar_cart') || '[]'); } catch(e) { return []; }
}
function saveCart(c) { localStorage.setItem('ar_cart', JSON.stringify(c)); }

function getWishlist() {
  try { return JSON.parse(localStorage.getItem('ar_wish') || '[]'); } catch(e) { return []; }
}
function saveWishlist(w) { localStorage.setItem('ar_wish', JSON.stringify(w)); }

function addToCart(id, name, price, emoji) {
  const cart = getCart();
  const idx = cart.findIndex(function(i) { return i.id === id; });
  if (idx >= 0) { cart[idx].qty++; }
  else { cart.push({ id: id, qty: 1, name: name, price: price, emoji: emoji }); }
  saveCart(cart);
  updateCartBadge(true);
  showToast('In den Warenkorb!');
}

function toggleWishlist(id) {
  const wish = getWishlist();
  const idx = wish.indexOf(id);
  if (idx >= 0) {
    wish.splice(idx, 1);
    showToast('💔 Von Wunschliste entfernt');
  } else {
    wish.push(id);
    showToast('❤️ Zur Wunschliste hinzugefügt!');
  }
  saveWishlist(wish);
  refreshWishlistButtons();
}

function refreshWishlistButtons() {
  const wish = getWishlist();
  document.querySelectorAll('.wishlist-btn').forEach(function(btn) {
    const id = parseInt(btn.dataset.id);
    const active = wish.includes(id);
    btn.classList.toggle('active', active);
    btn.textContent = active ? '❤️' : '🤍';
  });
}

function updateCartBadge(bump) {
  const total = getCart().reduce(function(s, i) { return s + i.qty; }, 0);
  document.querySelectorAll('.cart-badge').forEach(function(b) {
    b.textContent = total;
    const wasShown = b.classList.contains('show');
    b.classList.toggle('show', total > 0);
    if (bump && total > 0) {
      b.classList.remove('bump');
      void b.offsetWidth;
      b.classList.add('bump');
    }
  });
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.classList.remove('show'); }, 2000);
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  renderCartDrawer();
}
function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
}

function renderCartDrawer() {
  const cart = getCart();
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total-price');
  if (!itemsEl) return;

  // Clear existing items safely
  while (itemsEl.firstChild) { itemsEl.removeChild(itemsEl.firstChild); }

  if (cart.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'cart-empty';
    empty.textContent = '🛒 Dein Warenkorb ist leer';
    itemsEl.appendChild(empty);
    if (totalEl) totalEl.textContent = '0.00 CHF';
    return;
  }

  let total = 0;
  cart.forEach(function(ci) {
    total += ci.price * ci.qty;

    const item = document.createElement('div');
    item.className = 'cart-item';

    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'cart-item-emoji';
    emojiDiv.textContent = ci.emoji || '🃏';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'cart-item-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'cart-item-name';
    nameEl.textContent = ci.name;

    const priceEl = document.createElement('div');
    priceEl.className = 'cart-item-price';
    priceEl.textContent = formatPrice(ci.price);

    const qtyDiv = document.createElement('div');
    qtyDiv.className = 'cart-item-qty';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'qty-btn';
    minusBtn.textContent = '−';
    minusBtn.onclick = function() { changeQty(ci.id, -1); };

    const qtySpan = document.createElement('span');
    qtySpan.textContent = ci.qty;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'qty-btn';
    plusBtn.textContent = '+';
    plusBtn.onclick = function() { changeQty(ci.id, 1); };

    qtyDiv.appendChild(minusBtn);
    qtyDiv.appendChild(qtySpan);
    qtyDiv.appendChild(plusBtn);

    infoDiv.appendChild(nameEl);
    infoDiv.appendChild(priceEl);
    infoDiv.appendChild(qtyDiv);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'cart-item-remove';
    removeBtn.textContent = '✕';
    removeBtn.onclick = function() { removeFromCart(ci.id); };

    item.appendChild(emojiDiv);
    item.appendChild(infoDiv);
    item.appendChild(removeBtn);
    itemsEl.appendChild(item);
  });

  if (totalEl) totalEl.textContent = formatPrice(total);
}

function changeQty(id, delta) {
  const cart = getCart();
  const idx = cart.findIndex(function(i) { return i.id === id; });
  if (idx < 0) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(cart);
  updateCartBadge();
  renderCartDrawer();
}

function removeFromCart(id) {
  const cart = getCart().filter(function(i) { return i.id !== id; });
  saveCart(cart);
  updateCartBadge();
  renderCartDrawer();
}

document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();
  refreshWishlistButtons();

  // Active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});
