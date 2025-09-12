// Dashboard Navigation and Functionality
class CustomerDashboard {
  constructor() {
    this.currentSection = "overview";
    this.cart = this.loadCart();
    this.wishlist = this.loadWishlist();
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupCartFunctionality();
    this.setupWishlistFunctionality();
    this.setupNotifications();
    this.setupOrderFilters();
    this.setupAccountForms();
    this.updateCartCount();
    this.updateWishlistCount();
  }

  // Navigation System
  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const contentSections = document.querySelectorAll(".content-section");

    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetSection = item.getAttribute("data-section");

        if (targetSection) {
          this.switchSection(targetSection);
          this.updateActiveNav(item);
        }
      });
    });

    // Handle card links
    const cardLinks = document.querySelectorAll(".card-link");
    cardLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute("data-section");
        if (targetSection) {
          this.switchSection(targetSection);
          this.updateActiveNavBySection(targetSection);
        }
      });
    });
  }

  switchSection(sectionName) {
    const contentSections = document.querySelectorAll(".content-section");

    contentSections.forEach((section) => {
      section.classList.remove("active");
    });

    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
      targetSection.classList.add("active");
      this.currentSection = sectionName;

      // Scroll to top of content
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  updateActiveNav(activeItem) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => item.classList.remove("active"));
    activeItem.classList.add("active");
  }

  updateActiveNavBySection(sectionName) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("data-section") === sectionName) {
        item.classList.add("active");
      }
    });
  }

  // Cart Functionality
  setupCartFunctionality() {
    // Add to cart buttons
    const addToCartBtns = document.querySelectorAll(".btn-primary");
    addToCartBtns.forEach((btn) => {
      if (btn.textContent.includes("Add to Cart")) {
        btn.addEventListener("click", (e) => {
          this.addToCart(e.target);
        });
      }
    });

    // Quantity controls
    const qtyBtns = document.querySelectorAll(".qty-btn");
    qtyBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.updateQuantity(e.target);
      });
    });

    // Remove item buttons
    const removeItemBtns = document.querySelectorAll(".remove-item");
    removeItemBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.removeFromCart(e.target);
      });
    });

    // Checkout button
    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        this.proceedToCheckout();
      });
    }
  }

  addToCart(button) {
    const productCard =
      button.closest(".product-card") || button.closest(".wishlist-item");
    if (!productCard) return;

    const productName = productCard.querySelector("h4").textContent;
    const productPrice = productCard.querySelector("p").textContent;
    const productImage = productCard.querySelector("img").src;

    const cartItem = {
      id: Date.now(),
      name: productName,
      price: productPrice,
      image: productImage,
      quantity: 1,
    };

    this.cart.push(cartItem);
    this.saveCart();
    this.updateCartCount();
    this.showNotification(`${productName} added to cart!`, "success");

    // Update cart display if currently viewing cart
    if (this.currentSection === "cart") {
      this.renderCartItems();
    }
  }

  updateQuantity(button) {
    const cartItem = button.closest(".cart-item");
    const qtyInput = cartItem.querySelector(".qty-input");
    const currentQty = parseInt(qtyInput.value);

    if (button.classList.contains("plus")) {
      qtyInput.value = currentQty + 1;
    } else if (button.classList.contains("minus") && currentQty > 1) {
      qtyInput.value = currentQty - 1;
    }

    this.updateCartItemTotal(cartItem);
    this.updateCartSummary();
  }

  removeFromCart(button) {
    const cartItem = button.closest(".cart-item");
    const productName = cartItem.querySelector("h4").textContent;

    if (confirm(`Remove ${productName} from cart?`)) {
      cartItem.remove();
      this.updateCartCount();
      this.updateCartSummary();
      this.showNotification(`${productName} removed from cart`, "info");
    }
  }

  updateCartItemTotal(cartItem) {
    const price = parseFloat(
      cartItem.querySelector(".item-price").textContent.replace("$", "")
    );
    const quantity = parseInt(cartItem.querySelector(".qty-input").value);
    const total = price * quantity;

    cartItem.querySelector(".item-total").textContent = `$${total.toFixed(2)}`;
  }

  updateCartSummary() {
    const cartItems = document.querySelectorAll(".cart-item");
    let subtotal = 0;

    cartItems.forEach((item) => {
      const total = parseFloat(
        item.querySelector(".item-total").textContent.replace("$", "")
      );
      subtotal += total;
    });

    const shipping = 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.querySelector(
      ".summary-row:nth-child(1) span:last-child"
    ).textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector(
      ".summary-row:nth-child(3) span:last-child"
    ).textContent = `$${tax.toFixed(2)}`;
    document.querySelector(
      ".summary-row.total span:last-child"
    ).textContent = `$${total.toFixed(2)}`;
  }

  proceedToCheckout() {
    this.showNotification("Redirecting to checkout...", "info");
    // In a real app, this would redirect to checkout page
    setTimeout(() => {
      alert("Checkout functionality would be implemented here");
    }, 1000);
  }

  updateCartCount() {
    const cartCount = document.querySelector(".cart-count");
    const navCartCount = document.querySelector(
      '.nav-item[data-section="cart"] .count'
    );
    const count = this.cart.length;

    if (cartCount) cartCount.textContent = count;
    if (navCartCount) navCartCount.textContent = count;
  }

  // Wishlist Functionality
  setupWishlistFunctionality() {
    // Remove from wishlist buttons
    const removeWishlistBtns = document.querySelectorAll(".remove-wishlist");
    removeWishlistBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.removeFromWishlist(e.target);
      });
    });

    // Share wishlist button
    const shareBtn = document.querySelector(".wishlist-actions .btn-primary");
    if (shareBtn && shareBtn.textContent.includes("Share")) {
      shareBtn.addEventListener("click", () => {
        this.shareWishlist();
      });
    }

    // Clear all wishlist button
    const clearBtn = document.querySelector(".wishlist-actions .btn-outline");
    if (clearBtn && clearBtn.textContent.includes("Clear")) {
      clearBtn.addEventListener("click", () => {
        this.clearWishlist();
      });
    }
  }

  removeFromWishlist(button) {
    const wishlistItem = button.closest(".wishlist-item");
    const productName = wishlistItem.querySelector("h4").textContent;

    if (confirm(`Remove ${productName} from wishlist?`)) {
      wishlistItem.remove();
      this.updateWishlistCount();
      this.showNotification(`${productName} removed from wishlist`, "info");
    }
  }

  shareWishlist() {
    if (navigator.share) {
      navigator.share({
        title: "My MenStyle Wishlist",
        text: "Check out my wishlist on MenStyle!",
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        this.showNotification("Wishlist link copied to clipboard!", "success");
      });
    }
  }

  clearWishlist() {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      const wishlistItems = document.querySelectorAll(".wishlist-item");
      wishlistItems.forEach((item) => item.remove());
      this.wishlist = [];
      this.saveWishlist();
      this.updateWishlistCount();
      this.showNotification("Wishlist cleared", "info");
    }
  }

  updateWishlistCount() {
    const navWishlistCount = document.querySelector(
      '.nav-item[data-section="wishlist"] .count'
    );
    const count = document.querySelectorAll(".wishlist-item").length;

    if (navWishlistCount) navWishlistCount.textContent = count;
  }

  // Notifications System
  setupNotifications() {
    const closeNotificationBtns = document.querySelectorAll(
      ".close-notification"
    );
    closeNotificationBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.closeNotification(e.target);
      });
    });

    // Auto-hide notifications after 5 seconds
    const notifications = document.querySelectorAll(".notification");
    notifications.forEach((notification) => {
      setTimeout(() => {
        this.closeNotification(
          notification.querySelector(".close-notification")
        );
      }, 5000);
    });
  }

  showNotification(message, type = "info") {
    const notificationsContainer = document.querySelector(".notifications");

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas ${this.getNotificationIcon(type)}"></i>
      <span>${message}</span>
      <button class="close-notification">
        <i class="fas fa-times"></i>
      </button>
    `;

    notificationsContainer.appendChild(notification);

    // Setup close button
    const closeBtn = notification.querySelector(".close-notification");
    closeBtn.addEventListener("click", () => {
      this.closeNotification(closeBtn);
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.closeNotification(closeBtn);
    }, 5000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };
    return icons[type] || icons.info;
  }

  closeNotification(button) {
    const notification = button.closest(".notification");
    if (notification) {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }

  // Order Filters
  setupOrderFilters() {
    const filterSelect = document.querySelector(".filter-select");
    const searchInput = document.querySelector(".search-input");

    if (filterSelect) {
      filterSelect.addEventListener("change", () => {
        this.filterOrders();
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this.filterOrders();
      });
    }
  }

  filterOrders() {
    const filterValue = document.querySelector(".filter-select").value;
    const searchValue = document
      .querySelector(".search-input")
      .value.toLowerCase();
    const orderItems = document.querySelectorAll(".order-item");

    orderItems.forEach((item) => {
      const orderStatus = item
        .querySelector(".order-status")
        .textContent.toLowerCase();
      const orderNumber = item
        .querySelector(".order-info h4")
        .textContent.toLowerCase();

      const matchesFilter =
        filterValue === "all" || orderStatus.includes(filterValue);
      const matchesSearch =
        orderNumber.includes(searchValue) || searchValue === "";

      if (matchesFilter && matchesSearch) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }

  // Account Forms
  setupAccountForms() {
    // Edit buttons
    const editBtns = document.querySelectorAll(".account-card .btn-outline");
    editBtns.forEach((btn) => {
      if (btn.textContent.includes("Edit")) {
        btn.addEventListener("click", (e) => {
          this.editAccountInfo(e.target);
        });
      }
    });

    // Add new buttons
    const addBtns = document.querySelectorAll(".account-card .btn-outline");
    addBtns.forEach((btn) => {
      if (btn.textContent.includes("Add New")) {
        btn.addEventListener("click", (e) => {
          this.addNewItem(e.target);
        });
      }
    });
  }

  editAccountInfo(button) {
    const cardHeader = button.closest(".card-header");
    const cardTitle = cardHeader.querySelector("h3").textContent;

    this.showNotification(
      `Edit ${cardTitle} functionality would be implemented here`,
      "info"
    );
  }

  addNewItem(button) {
    const cardHeader = button.closest(".card-header");
    const cardTitle = cardHeader.querySelector("h3").textContent;

    this.showNotification(
      `Add new ${cardTitle} functionality would be implemented here`,
      "info"
    );
  }

  // Local Storage Management
  loadCart() {
    const saved = localStorage.getItem("menstyle_cart");
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem("menstyle_cart", JSON.stringify(this.cart));
  }

  loadWishlist() {
    const saved = localStorage.getItem("menstyle_wishlist");
    return saved ? JSON.parse(saved) : [];
  }

  saveWishlist() {
    localStorage.setItem("menstyle_wishlist", JSON.stringify(this.wishlist));
  }

  // Utility Methods
  formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

// Initialize Dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const dashboard = new CustomerDashboard();

  // Make dashboard globally available for debugging
  window.dashboard = dashboard;
});

// Additional Interactive Features
document.addEventListener("DOMContentLoaded", () => {
  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Image lazy loading
  const images = document.querySelectorAll("img");
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.src; // Trigger loading
        img.classList.add("loaded");
        observer.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));

  // Add loading states to buttons
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (!this.classList.contains("loading")) {
        this.classList.add("loading");
        setTimeout(() => {
          this.classList.remove("loading");
        }, 1000);
      }
    });
  });

  // Enhanced hover effects for product cards
  const productCards = document.querySelectorAll(
    ".product-card, .wishlist-item"
  );
  productCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  // Dynamic greeting based on time of day
  const welcomeText = document.querySelector(".welcome-text h1");
  if (welcomeText) {
    const hour = new Date().getHours();
    let greeting = "Welcome back";

    if (hour < 12) {
      greeting = "Good morning";
    } else if (hour < 18) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }

    welcomeText.textContent = `${greeting}, John!`;
  }
});
