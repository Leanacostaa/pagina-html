/* Mercado Fresco — carrito de compras (100% cliente, sin backend) */
(function () {
  const CART_KEY = 'mercadofresco_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  let storageBlocked = false;
  try {
    const testKey = '__mercadofresco_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
  } catch (e) {
    storageBlocked = true;
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      storageBlocked = false;
    } catch (e) {
      storageBlocked = true;
    }
    updateBadge();
  }

  function addToCart(item, qty) {
    qty = qty && qty > 0 ? qty : 1;
    const cart = getCart();
    const existing = cart.find((p) => p.id === item.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push(Object.assign({}, item, { qty }));
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(id) {
    saveCart(getCart().filter((p) => p.id !== id));
  }

  function setQty(id, qty) {
    const cart = getCart();
    const item = cart.find((p) => p.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      saveCart(cart);
    }
  }

  function clearCart() {
    saveCart([]);
  }

  function cartCount() {
    return getCart().reduce((sum, p) => sum + p.qty, 0);
  }

  function cartSubtotal() {
    return getCart().reduce((sum, p) => sum + p.qty * p.price, 0);
  }

  function formatPrice(n) {
    return '$' + Math.round(n).toLocaleString('es-AR');
  }

  function updateBadge() {
    const count = cartCount();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  function showToast(message) {
    let toast = document.querySelector('.cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'cart-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  // Delegación de eventos: cualquier botón [data-add-to-cart] agrega su producto
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    e.preventDefault();

    const qtyInput = btn.closest('.product-detail, .product-card, tr')
      ? btn.closest('.product-detail, .product-card, tr').querySelector('[data-qty-input]')
      : null;
    const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

    const item = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: parseFloat(btn.dataset.price),
      unit: btn.dataset.unit,
      emoji: btn.dataset.emoji || '🛒',
    };

    addToCart(item, qty);

    if (storageBlocked) {
      showToast('⚠️ Tu navegador bloqueó el guardado del carrito (abrí el sitio con un servidor local, no con doble clic)');
    } else {
      showToast(item.name + ' agregado al pedido');
    }

    if (btn.dataset.redirect) {
      setTimeout(() => {
        window.location.href = btn.dataset.redirect;
      }, 350);
    }
  });

  // Botones +/- de cantidad (ficha de producto y resumen del carrito)
  document.addEventListener('click', function (e) {
    const stepBtn = e.target.closest('[data-qty-step]');
    if (!stepBtn) return;
    const wrap = stepBtn.closest('.qty-box');
    const input = wrap ? wrap.querySelector('input') : null;
    if (!input) return;
    const delta = parseInt(stepBtn.dataset.qtyStep, 10);
    const next = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
    input.value = next;

    const cartId = wrap.dataset.cartId;
    if (cartId) setQty(cartId, next);
  });

  window.MercadoCart = {
    getCart,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    cartCount,
    cartSubtotal,
    formatPrice,
    updateBadge,
    showToast,
    isStorageBlocked: () => storageBlocked,
  };

  document.addEventListener('DOMContentLoaded', updateBadge);
})();
