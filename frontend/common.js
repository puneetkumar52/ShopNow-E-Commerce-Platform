// ===== Bada Bazar - Shared Utilities =====
// This file is included in all pages

var API = "http://localhost:5000";

// --- Toast Notification ---
function showToast(msg, type) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = "";

  var icon = type === "success" ? "✅" : type === "error" ? "❌" : "🛒";
  toast.textContent = icon + " " + msg;
  toast.className = "toast " + (type || "info");
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 2800);
}

// --- Get logged-in user ---
function getUser() {
  var userId = localStorage.getItem("userId");
  var email = localStorage.getItem("email");
  return userId ? { userId: userId, email: email } : null;
}

// --- Update navbar based on login state ---
function updateNavAuth() {
  var user = getUser();
  var loginLink = document.getElementById("nav-login");
  var signupLink = document.getElementById("nav-signup");
  var logoutBtn = document.getElementById("nav-logout");
  var userInfo = document.getElementById("nav-user");

  if (user) {
    if (loginLink) loginLink.classList.add("hidden");
    if (signupLink) signupLink.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    if (userInfo) {
      userInfo.textContent = "👤 " + user.email;
      userInfo.classList.remove("hidden");
    }
  } else {
    if (loginLink) loginLink.classList.remove("hidden");
    if (signupLink) signupLink.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (userInfo) userInfo.classList.add("hidden");
  }
}

// --- Logout ---
function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  showToast("Logged out successfully", "info");
  setTimeout(function () {
    window.location.href = "index.html";
  }, 800);
}

// --- Update cart count in navbar ---
function updateCartCount() {
  var countEl = document.getElementById("cart-count");
  if (!countEl) return;

  var user = getUser();
  if (!user) {
    countEl.textContent = "0";
    return;
  }

  fetch(API + "/api/cart/" + user.userId)
    .then(function (res) { return res.json(); })
    .then(function (items) {
      var total = 0;
      if (Array.isArray(items)) {
        items.forEach(function (item) { total += item.qty || 1; });
      }
      countEl.textContent = total;
    })
    .catch(function () {
      countEl.textContent = "0";
    });
}

// --- Add item to cart ---
function addToCart(product) {
  var user = getUser();
  if (!user) {
    showToast("Please login to add items to cart", "error");
    setTimeout(function () {
      window.location.href = "login.html";
    }, 1000);
    return;
  }

  var body = {
    userId: user.userId,
    productId: product._id,
    name: product.name,
    price: product.price,
    image: product.image || "",
    qty: 1
  };

  fetch(API + "/api/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.cart || data.message) {
        showToast(product.name + " added to cart!", "success");
        updateCartCount();
      } else {
        showToast("Could not add to cart", "error");
      }
    })
    .catch(function () {
      showToast("Network error. Is the server running?", "error");
    });
}

// --- Star rating helper ---
function getStars(rating) {
  var stars = "";
  var r = Math.round(rating || 0);
  for (var i = 1; i <= 5; i++) {
    stars += i <= r ? "★" : "☆";
  }
  return stars;
}

// --- Product emoji by category ---
function getCategoryEmoji(category) {
  var map = {
    electronics: "📱", clothing: "👕", shoes: "👟",
    food: "🍎", grocery: "🛒", books: "📚",
    furniture: "🪑", sports: "⚽", toys: "🧸",
    beauty: "💄", health: "💊", kitchen: "🍳"
  };
  var key = (category || "").toLowerCase();
  for (var k in map) {
    if (key.includes(k)) return map[k];
  }
  return "🛍️";
}

// Run on every page load
document.addEventListener("DOMContentLoaded", function () {
  updateNavAuth();
  updateCartCount();
});
