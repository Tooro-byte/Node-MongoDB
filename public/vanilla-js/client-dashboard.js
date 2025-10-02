class EcommerceDashboard {
  constructor() {
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.startClock();
    this.initializeCounters();
    this.setupNotifications();
    await this.loadDashboardData(); // Load initial data
  }

  setupEventListeners() {
    // Navigation event listeners
    this.setupNavigation();

    // Cart functionality
    this.setupCart();

    // Search functionality
    this.setupSearch();

    // Filter functionality
    this.setupFilters();

    // User menu
    this.setupUserMenu();

    // Notifications
    this.setupNotificationHandlers();

    // Order actions
    this.setupOrderActions();

    // Message actions
    this.setupMessageActions();
  }

  setupNavigation() {
    const navTabs = document.querySelectorAll(".nav-tab, .nav-item");
    const contentSections = document.querySelectorAll(".content-section");

    navTabs.forEach((tab) => {
      tab.addEventListener("click", async (e) => {
        const href = tab.getAttribute("href");
        const section = tab.dataset.section;

        const navigableRoutes = [
          "/products",
          "/orders",
          "/cart",
          "/messages",
          "/payment-methods",
          "/account",
          "/addresses",
          "/wishlist",
          "/reviews",
          "/notifications",
          "/loyalty",
          "/subscriptions",
          "/referrals",
          "/settings",
          "/support",
          "/logout",
          "/client-page",
        ];

        if (navigableRoutes.includes(href)) {
          return;
        }

        if (section) {
          e.preventDefault();
          this.switchSection(section, navTabs, contentSections);
        }
      });
    });

    document.querySelectorAll(".view-all").forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        const section = link.dataset.section;

        if (["/products", "/orders"].includes(href)) {
          return;
        }

        if (section) {
          e.preventDefault();
          this.switchSection(section, navTabs, contentSections);
        }
      });
    });
  }

  switchSection(section, navElements, contentSections) {
    navElements.forEach((el) => el.classList.remove("active"));
    const activeElements = document.querySelectorAll(
      `[data-section="${section}"]`
    );
    activeElements.forEach((el) => el.classList.add("active"));

    contentSections.forEach((content) => content.classList.remove("active"));
    const targetSection = document.getElementById(section);
    if (targetSection) {
      targetSection.classList.add("active");
      this.animateSection(targetSection);
    }

    this.loadSectionData(section);
  }

  animateSection(section) {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";

    setTimeout(() => {
      section.style.transition = "all 0.5s ease";
      section.style.opacity = "1";
      section.style.transform = "translateY(0)";
    }, 10);
  }

  startClock() {
    const updateTime = () => {
      const now = new Date();
      const timeElement = document.getElementById("current-time");
      if (timeElement) {
        const timeString = now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        timeElement.textContent = timeString;
      }

      const dateElement = document.getElementById("current-date");
      if (dateElement) {
        const dateString = now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        dateElement.textContent = dateString;
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  initializeCounters() {
    const counters = document.querySelectorAll(".summary-number, .stat-number");

    counters.forEach((counter) => {
      const target = parseInt(counter.textContent.replace(/[^0-9]/g, "")) || 0;
      const prefix = counter.textContent.replace(/[0-9]/g, "");
      let current = 0;
      const increment = target / 100;

      const updateCounter = () => {
        if (current < target) {
          current += increment;
          counter.textContent = prefix + Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = prefix + target;
        }
      };

      setTimeout(updateCounter, 500);
    });
  }

  setupCart() {
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest(".qty-btn");
      if (btn) {
        const productId = btn.dataset.productId;
        const isPlus = btn.classList.contains("plus");

        try {
          const endpoint = isPlus
            ? `/api/cart/increase/${productId}`
            : `/api/cart/decrease/${productId}`;
          const response = await fetch(endpoint, { method: "PATCH" });
          const result = await response.json();

          if (response.ok) {
            this.showNotification(result.Message, "success");
            await this.loadCartData(); // Reload cart data
          } else {
            this.showNotification(result.Message, "error");
          }
        } catch (error) {
          console.error("Error updating cart:", error);
          this.showNotification("Error updating cart", "error");
        }

        this.animateButton(btn);
      }

      if (e.target.closest(".action-btn.remove")) {
        const btn = e.target.closest(".action-btn.remove");
        const productId = btn.dataset.productId;
        if (confirm("Remove this item from your cart?")) {
          try {
            const response = await fetch(`/api/cart/${productId}`, {
              method: "DELETE",
            });
            const result = await response.json();

            if (response.ok) {
              this.showNotification(result.Message, "success");
              await this.loadCartData();
            } else {
              this.showNotification(result.Message, "error");
            }
          } catch (error) {
            console.error("Error removing item:", error);
            this.showNotification("Error removing item", "error");
          }
        }
      }

      if (e.target.closest(".action-btn.wishlist")) {
        const btn = e.target.closest(".action-btn.wishlist");
        const productId = btn.dataset.productId;
        this.toggleWishlist(btn, productId);
      }

      if (e.target.closest(".btn.btn-primary[data-product-id]")) {
        const btn = e.target.closest(".btn.btn-primary");
        const productId = btn.dataset.productId;
        try {
          const response = await fetch(`/api/cart/${productId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: 1 }),
          });
          const result = await response.json();

          if (response.ok) {
            this.showNotification(result.Message, "success");
            await this.loadCartData();
          } else {
            this.showNotification(result.Message, "error");
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          this.showNotification("Error adding to cart", "error");
        }
      }
    });
  }

  async toggleWishlist(btn, productId) {
    const icon = btn.querySelector("i");
    const isInWishlist = icon.classList.contains("fas");

    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: isInWishlist ? "DELETE" : "POST",
      });
      const result = await response.json();

      if (response.ok) {
        if (isInWishlist) {
          icon.classList.remove("fas");
          icon.classList.add("far");
          this.showNotification("Removed from wishlist", "info");
        } else {
          icon.classList.remove("far");
          icon.classList.add("fas");
          this.showNotification("Added to wishlist", "success");
        }
        this.updateWishlistCount();
      } else {
        this.showNotification(result.Message, "error");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      this.showNotification("Error updating wishlist", "error");
    }

    this.animateButton(btn);
  }

  async updateCartCount() {
    try {
      const response = await fetch("/api/cart/count");
      const { totalProducts } = await response.json();
      const countElements = document.querySelectorAll(
        '.cart-icon .cart-count, .nav-tab[data-section="cart"] .badge, .nav-item[data-section="cart"] .count'
      );

      countElements.forEach((element) => {
        element.textContent = totalProducts || 0;
      });
    } catch (error) {
      console.error("Error updating cart count:", error);
      this.showNotification("Error updating cart count", "error");
    }
  }

  async updateWishlistCount() {
    try {
      const response = await fetch("/api/wishlist/count");
      const { count } = await response.json();
      const countElements = document.querySelectorAll(
        '.nav-item[data-section="wishlist"] .count'
      );

      countElements.forEach((element) => {
        element.textContent = count || 0;
      });
    } catch (error) {
      console.error("Error updating wishlist count:", error);
      this.showNotification("Error updating wishlist count", "error");
    }
  }

  setupSearch() {
    const searchInput = document.querySelector(".search-box input");
    if (searchInput) {
      let searchTimeout;

      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.performSearch(e.target.value);
        }, 300);
      });
    }
  }

  async performSearch(query) {
    if (query.length < 2) return;

    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}`
      );
      const products = await response.json();
      this.showSearchResults(products);
    } catch (error) {
      console.error("Error searching products:", error);
      this.showNotification("Error searching products", "error");
    }
  }

  showSearchResults(products) {
    let dropdown = document.querySelector(".search-results");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-results";
      dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        margin-top: 0.5rem;
        padding: 1rem;
      `;
      document.querySelector(".search-box").style.position = "relative";
      document.querySelector(".search-box").appendChild(dropdown);
    }

    dropdown.innerHTML = products.length
      ? products
          .map(
            (product) => `
              <div class="search-result-item" style="padding: 0.5rem; cursor: pointer; border-radius: 0.25rem; margin-bottom: 0.5rem;" data-product-id="${
                product._id
              }">
                <div style="font-weight: 600;">${product.title}</div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">$${product.price.toFixed(
                  2
                )}</div>
              </div>
            `
          )
          .join("")
      : '<div style="padding: 0.5rem; color: var(--text-secondary);">No products found</div>';

    dropdown.querySelectorAll(".search-result-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const productId = item.dataset.productId;
        try {
          const response = await fetch(`/api/cart/${productId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: 1 }),
          });
          const result = await response.json();

          if (response.ok) {
            this.showNotification("Product added to cart!", "success");
            await this.loadCartData();
          } else {
            this.showNotification(result.Message, "error");
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          this.showNotification("Error adding to cart", "error");
        }
        dropdown.remove();
      });

      item.addEventListener("mouseenter", () => {
        item.style.background = "var(--bg-secondary)";
      });

      item.addEventListener("mouseleave", () => {
        item.style.background = "transparent";
      });
    });

    setTimeout(() => {
      document.addEventListener(
        "click",
        (e) => {
          if (
            !dropdown.contains(e.target) &&
            !document.querySelector(".search-box").contains(e.target)
          ) {
            dropdown.remove();
          }
        },
        { once: true }
      );
    }, 100);
  }

  setupFilters() {
    const orderFilters = document.querySelectorAll(".filter-select");
    orderFilters.forEach((filter) => {
      filter.addEventListener("change", (e) => {
        this.filterOrders(e.target.value);
      });
    });

    const messageFilters = document.querySelectorAll(".filter-btn");
    messageFilters.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        messageFilters.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.filterMessages(btn.dataset.filter);
      });
    });
  }

  filterOrders(status) {
    const orders = document.querySelectorAll(".order-card");

    orders.forEach((order) => {
      const orderStatus = order.querySelector(".order-status span");
      if (status === "all" || !orderStatus) {
        order.style.display = "block";
      } else {
        const shouldShow =
          orderStatus.textContent.toLowerCase() === status.toLowerCase();
        order.style.display = shouldShow ? "block" : "none";
      }
    });
  }

  filterMessages(filter) {
    const messages = document.querySelectorAll(".message-item");

    messages.forEach((message) => {
      switch (filter) {
        case "unread":
          message.style.display = message.classList.contains("unread")
            ? "flex"
            : "none";
          break;
        case "orders":
          message.style.display = message.textContent
            .toLowerCase()
            .includes("order")
            ? "flex"
            : "none";
          break;
        case "promotions":
          message.style.display =
            message.textContent.toLowerCase().includes("offer") ||
            message.textContent.toLowerCase().includes("promotion")
              ? "flex"
              : "none";
          break;
        default:
          message.style.display = "flex";
      }
    });
  }

  setupUserMenu() {
    const userMenu = document.querySelector(".user-menu");
    const dropdown = document.querySelector(".dropdown-menu");

    if (userMenu && dropdown) {
      dropdown.style.display = "none";
      dropdown.style.position = "absolute";
      dropdown.style.top = "100%";
      dropdown.style.right = "0";
      dropdown.style.background = "white";
      dropdown.style.borderRadius = "0.5rem";
      dropdown.style.boxShadow = "var(--shadow-lg)";
      dropdown.style.padding = "0.5rem";
      dropdown.style.minWidth = "200px";
      dropdown.style.zIndex = "1000";

      userMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === "none" ? "block" : "none";
      });

      document.addEventListener("click", () => {
        dropdown.style.display = "none";
      });
    }
  }

  setupNotifications() {
    this.createNotificationContainer();

    document.addEventListener("click", (e) => {
      if (e.target.closest(".notification-btn")) {
        this.showNotificationDropdown();
      }
    });
  }

  createNotificationContainer() {
    if (document.querySelector(".notification-container")) return;

    const container = document.createElement("div");
    container.className = "notification-container";
    container.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  showNotification(message, type = "info", duration = 3000) {
    const container = document.querySelector(".notification-container");
    if (!container) return;

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      background: ${
        type === "success"
          ? "var(--success)"
          : type === "error"
          ? "var(--error)"
          : "var(--primary)"
      };
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      margin-bottom: 0.5rem;
      box-shadow: var(--shadow-lg);
      transform: translateX(100%);
      transition: all 0.3s ease;
      pointer-events: auto;
      cursor: pointer;
      max-width: 350px;
      word-wrap: break-word;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <i class="fas fa-${
          type === "success"
            ? "check-circle"
            : type === "error"
            ? "exclamation-circle"
            : "info-circle"
        }"></i>
        <span>${message}</span>
        <button style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    container.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 10);

    const dismissTimer = setTimeout(() => {
      this.dismissNotification(notification);
    }, duration);

    notification.addEventListener("click", () => {
      clearTimeout(dismissTimer);
      this.dismissNotification(notification);
    });
  }

  dismissNotification(notification) {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  async showNotificationDropdown() {
    try {
      const response = await fetch("/api/notifications");
      const notifications = await response.json();

      const dropdown = document.createElement("div");
      dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 0.75rem;
        box-shadow: var(--shadow-xl);
        padding: 1rem;
        min-width: 300px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
        margin-top: 0.5rem;
      `;

      dropdown.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Notifications</h4>
          <button class="btn btn-text" style="font-size: 0.75rem;">Mark all as read</button>
        </div>
        <div class="notification-list">
          ${
            notifications.length
              ? notifications
                  .map(
                    (notification) => `
                  <div class="notification-item" style="padding: 0.75rem; border-bottom: 1px solid var(--border-light); cursor: pointer;">
                    <div style="font-weight: 600; font-size: 0.875rem;">${notification.title}</div>
                    <div style="color: var(--text-secondary); font-size: 0.75rem; margin: 0.25rem 0;">${notification.content}</div>
                    <div style="color: var(--text-muted); font-size: 0.75rem;">${notification.timeAgo}</div>
                  </div>
                `
                  )
                  .join("")
              : '<div style="padding: 0.75rem; color: var(--text-secondary);">No notifications</div>'
          }
        </div>
      `;

      const notificationBtn = document.querySelector(".notification-btn");
      notificationBtn.parentNode.style.position = "relative";
      notificationBtn.parentNode.appendChild(dropdown);

      setTimeout(() => {
        document.addEventListener(
          "click",
          (e) => {
            if (
              !dropdown.contains(e.target) &&
              !notificationBtn.contains(e.target)
            ) {
              dropdown.remove();
            }
          },
          { once: true }
        );
      }, 100);
    } catch (error) {
      console.error("Error loading notifications:", error);
      this.showNotification("Error loading notifications", "error");
    }
  }

  setupNotificationHandlers() {
    document.addEventListener("click", (e) => {
      if (e.target.closest(".close-notification")) {
        const notification = e.target.closest(".notification");
        if (notification) {
          this.dismissNotification(notification);
        }
      }
    });
  }

  setupOrderActions() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const btnText = btn.textContent.trim();

      switch (true) {
        case btnText.includes("Track Order"):
          this.trackOrder(btn);
          break;
        case btnText.includes("View Invoice"):
          this.viewOrderDetails(btn);
          break;
        case btnText.includes("Reorder"):
          this.reorderItems(btn);
          break;
        case btnText.includes("Export Orders"):
          this.exportOrders();
          break;
      }
    });
  }

  trackOrder(btn) {
    this.showNotification("Opening order tracking...", "info");
    setTimeout(() => {
      this.showNotification("Order is currently in transit", "success");
    }, 1000);
  }

  viewOrderDetails(btn) {
    this.showNotification("Loading order details...", "info");
    this.animateButton(btn);
  }

  async reorderItems(btn) {
    this.showNotification("Adding items to cart...", "info");
    try {
      const orderId = btn
        .closest(".order-card")
        ?.querySelector("h4")
        ?.textContent.split("#")[1];
      const response = await fetch(`/api/orders/reorder/${orderId}`, {
        method: "POST",
      });
      const result = await response.json();

      if (response.ok) {
        this.showNotification("Items added to cart!", "success");
        await this.loadCartData();
      } else {
        this.showNotification(result.Message, "error");
      }
    } catch (error) {
      console.error("Error reordering items:", error);
      this.showNotification("Error reordering items", "error");
    }
    this.animateButton(btn);
  }

  exportOrders() {
    this.showNotification("Preparing export...", "info");
    setTimeout(() => {
      this.showNotification("Orders exported successfully!", "success");
    }, 2000);
  }

  setupMessageActions() {
    document.addEventListener("click", async (e) => {
      if (e.target.closest(".message-actions button")) {
        const btn = e.target.closest("button");
        const btnText = btn.textContent.trim();
        const messageItem = btn.closest(".message-item");

        switch (true) {
          case btnText.includes("Mark as Read"):
            const messageId = messageItem.dataset.messageId;
            try {
              const response = await fetch(`/api/messages/${messageId}/read`, {
                method: "PATCH",
              });
              if (response.ok) {
                this.markMessageAsRead(messageItem);
                this.showNotification("Message marked as read", "success");
              } else {
                this.showNotification("Error marking message as read", "error");
              }
            } catch (error) {
              console.error("Error marking message as read:", error);
              this.showNotification("Error marking message as read", "error");
            }
            break;
          case btnText.includes("Track Order"):
            this.trackOrder(btn);
            break;
          case btnText.includes("Shop Now"):
            this.showNotification("Redirecting to shop...", "info");
            break;
        }
      }
    });
  }

  markMessageAsRead(messageItem) {
    messageItem.classList.remove("unread");
    const btn = messageItem.querySelector("button");
    if (btn && btn.textContent.includes("Mark as Read")) {
      btn.style.display = "none";
    }
    this.updateMessageCount();
  }

  async updateMessageCount() {
    try {
      const response = await fetch("/api/messages/count");
      const { unreadCount } = await response.json();
      const countElements = document.querySelectorAll(
        '.nav-tab[data-section="messages"] .badge, .nav-item[data-section="messages"] .count'
      );

      countElements.forEach((element) => {
        element.textContent = unreadCount || 0;
        element.classList.toggle("new", unreadCount > 0);
      });
    } catch (error) {
      console.error("Error updating message count:", error);
      this.showNotification("Error updating message count", "error");
    }
  }

  animateButton(btn) {
    btn.style.transform = "scale(0.95)";
    setTimeout(() => {
      btn.style.transform = "scale(1)";
    }, 150);
  }

  handleLogout(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to logout?")) {
      this.showNotification("Logging out...", "info");
      setTimeout(() => {
        window.location.href = "/logout";
      }, 1500);
    }
  }

  async loadSectionData(section) {
    console.log(`Loading data for section: ${section}`);
    switch (section) {
      case "dashboard":
        await this.loadDashboardData();
        break;
      case "orders":
        await this.loadOrdersData();
        break;
      case "messages":
        await this.loadMessagesData();
        break;
      case "cart":
        await this.loadCartData();
        break;
      case "products":
        await this.loadProductsData();
        break;
    }
  }

  async loadCartData() {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        console.error(
          `Cart fetch error: Status ${
            response.status
          }, ${await response.text()}`
        );
        throw new Error("Failed to fetch cart");
      }
      let cart = await response.json();

      // Fallback to server-rendered cart if API fails or returns invalid data
      if (!cart || !cart.products) {
        cart = window.serverCart || {
          totalProducts: 0,
          totalCartPrice: 0,
          products: [],
        };
      }

      const cartItems = document.querySelector(".cart-items");
      if (cartItems) {
        cartItems.innerHTML =
          cart.products && cart.products.length
            ? cart.products
                .map(
                  (item) => `
              <div class="cart-item">
                <div class="item-checkbox">
                  <input type="checkbox" id="item${item.productId}" checked>
                  <label for="item${item.productId}"></label>
                </div>
                <div class="item-image">
                  <img src="${
                    item.image ||
                    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=150"
                  }" alt="Product">
                </div>
                <div class="item-details">
                  <h4>${item.title}</h4>
                  <p>Size: ${item.size || "N/A"}, Color: ${
                    item.color || "N/A"
                  }</p>
                  <div class="item-features">
                    <span class="feature-tag">Premium Quality</span>
                    <span class="feature-tag">Free Shipping</span>
                  </div>
                  <div class="item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="item-quantity">
                  <button class="qty-btn minus" data-product-id="${
                    item.productId
                  }"><i class="fas fa-minus"></i></button>
                  <input class="qty-input" type="number" value="${
                    item.quantity
                  }" min="1" data-product-id="${item.productId}">
                  <button class="qty-btn plus" data-product-id="${
                    item.productId
                  }"><i class="fas fa-plus"></i></button>
                </div>
                <div class="item-total">$${(item.price * item.quantity).toFixed(
                  2
                )}</div>
                <div class="item-actions">
                  <button class="action-btn wishlist" data-product-id="${
                    item.productId
                  }"><i class="fas fa-heart"></i></button>
                  <button class="action-btn remove" data-product-id="${
                    item.productId
                  }"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            `
                )
                .join("")
            : "<p>Your cart is empty.</p>";
      }

      const cartSummary = document.querySelector(".cart-summary");
      if (cartSummary) {
        const subtotal = cart.totalCartPrice || 0;
        const tax = subtotal * 0.08;
        const discount = subtotal * 0.1;
        const total = subtotal + tax - discount;

        cartSummary.querySelectorAll(".summary-row").forEach((row, index) => {
          const valueElement = row.querySelector("span:last-child");
          if (index === 0) valueElement.textContent = `$${subtotal.toFixed(2)}`;
          if (index === 1) valueElement.textContent = "Free";
          if (index === 2) valueElement.textContent = `$${tax.toFixed(2)}`;
          if (index === 3)
            valueElement.textContent = `-$${discount.toFixed(2)}`;
          if (index === 4) valueElement.textContent = `$${total.toFixed(2)}`;
        });
      }

      await this.updateCartCount();
    } catch (error) {
      console.error("Error loading cart:", error.message);
      this.showNotification("Error loading cart", "error");
      // Fallback to server-rendered cart
      const cart = window.serverCart || {
        totalProducts: 0,
        totalCartPrice: 0,
        products: [],
      };
      const cartItems = document.querySelector(".cart-items");
      if (cartItems) {
        cartItems.innerHTML =
          cart.products && cart.products.length
            ? cart.products
                .map(
                  (item) => `
              <div class="cart-item">
                <div class="item-checkbox">
                  <input type="checkbox" id="item${item.productId}" checked>
                  <label for="item${item.productId}"></label>
                </div>
                <div class="item-image">
                  <img src="${
                    item.image ||
                    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=150"
                  }" alt="Product">
                </div>
                <div class="item-details">
                  <h4>${item.title}</h4>
                  <p>Size: ${item.size || "N/A"}, Color: ${
                    item.color || "N/A"
                  }</p>
                  <div class="item-features">
                    <span class="feature-tag">Premium Quality</span>
                    <span class="feature-tag">Free Shipping</span>
                  </div>
                  <div class="item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="item-quantity">
                  <button class="qty-btn minus" data-product-id="${
                    item.productId
                  }"><i class="fas fa-minus"></i></button>
                  <input class="qty-input" type="number" value="${
                    item.quantity
                  }" min="1" data-product-id="${item.productId}">
                  <button class="qty-btn plus" data-product-id="${
                    item.productId
                  }"><i class="fas fa-plus"></i></button>
                </div>
                <div class="item-total">$${(item.price * item.quantity).toFixed(
                  2
                )}</div>
                <div class="item-actions">
                  <button class="action-btn wishlist" data-product-id="${
                    item.productId
                  }"><i class="fas fa-heart"></i></button>
                  <button class="action-btn remove" data-product-id="${
                    item.productId
                  }"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            `
                )
                .join("")
            : "<p>Your cart is empty.</p>";
      }
    }
  }

  async loadOrdersData() {
    try {
      const response = await fetch("/api/orders");
      const orders = await response.json();

      const ordersList = document.querySelector(".orders-list");
      if (ordersList) {
        ordersList.innerHTML = orders.length
          ? orders
              .map(
                (order) => `
              <div class="order-card">
                <div class="order-header">
                  <div class="order-info">
                    <h4>Order #${order.orderId}</h4>
                    <p>${order.orderDate}</p>
                  </div>
                  <div class="order-status ${order.status.toLowerCase()}">
                    <i class="fas fa-${
                      order.status === "Shipped"
                        ? "truck"
                        : order.status === "Delivered"
                        ? "check-circle"
                        : "hourglass"
                    }"></i>
                    <span>${order.status}</span>
                  </div>
                  <div class="order-total">$${order.totalPrice.toFixed(2)}</div>
                </div>
                <div class="order-items">
                  ${order.items
                    .map(
                      (item) => `
                    <div class="order-item">
                      <img src="${
                        item.image ||
                        "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=100"
                      }" alt="Product">
                      <div class="item-details">
                        <h5>${item.title}</h5>
                        <p>Size: ${item.size || "N/A"}, Color: ${
                        item.color || "N/A"
                      } | Qty: ${item.quantity}</p>
                        <span class="item-price">$${item.price.toFixed(
                          2
                        )}</span>
                      </div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
                <div class="order-actions">
                  <button class="btn btn-outline"><i class="fas fa-truck"></i> Track Order</button>
                  <button class="btn btn-outline"><i class="fas fa-receipt"></i> View Invoice</button>
                  <button class="btn btn-outline"><i class="fas fa-redo"></i> Reorder</button>
                </div>
              </div>
            `
              )
              .join("")
          : "<p>No orders found.</p>";
      }

      this.showNotification("Orders updated", "info", 1000);
    } catch (error) {
      console.error("Error loading orders:", error);
      this.showNotification("Error loading orders", "error");
    }
  }

  async loadMessagesData() {
    try {
      const response = await fetch("/api/messages");
      const messages = await response.json();

      const messagesList = document.querySelector(".messages-list");
      if (messagesList) {
        messagesList.innerHTML = messages.length
          ? messages
              .map(
                (message) => `
              <div class="message-item ${
                message.isUnread ? "unread" : ""
              }" data-message-id="${message._id}">
                <div class="message-avatar">
                  <i class="fas fa-${
                    message.type === "order" ? "truck" : "gift"
                  }"></i>
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <h4>${message.title}</h4>
                    <span class="message-time">${message.timeAgo}</span>
                  </div>
                  <p>${message.content}</p>
                  <div class="message-actions">
                    ${
                      message.type === "order"
                        ? '<button class="btn btn-text">Track Order</button>'
                        : ""
                    }
                    ${
                      message.isUnread
                        ? '<button class="btn btn-text">Mark as Read</button>'
                        : ""
                    }
                    ${
                      message.type === "promotion"
                        ? '<button class="btn btn-text">Shop Now</button>'
                        : ""
                    }
                  </div>
                </div>
              </div>
            `
              )
              .join("")
          : "<p>No messages available.</p>";
      }

      await this.updateMessageCount();
    } catch (error) {
      console.error("Error loading messages:", error);
      this.showNotification("Error loading messages", "error");
    }
  }

  async loadCartData() {
    try {
      const response = await fetch("/api/cart");
      const cart = await response.json();

      const cartItems = document.querySelector(".cart-items");
      if (cartItems) {
        cartItems.innerHTML =
          cart.products && cart.products.length
            ? cart.products
                .map(
                  (item) => `
              <div class="cart-item">
                <div class="item-checkbox">
                  <input type="checkbox" id="item${item.productId}" checked>
                  <label for="item${item.productId}"></label>
                </div>
                <div class="item-image">
                  <img src="${
                    item.image ||
                    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=150"
                  }" alt="Product">
                </div>
                <div class="item-details">
                  <h4>${item.title}</h4>
                  <p>Size: ${item.size || "N/A"}, Color: ${
                    item.color || "N/A"
                  }</p>
                  <div class="item-features">
                    <span class="feature-tag">Premium Quality</span>
                    <span class="feature-tag">Free Shipping</span>
                  </div>
                  <div class="item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="item-quantity">
                  <button class="qty-btn minus" data-product-id="${
                    item.productId
                  }"><i class="fas fa-minus"></i></button>
                  <input class="qty-input" type="number" value="${
                    item.quantity
                  }" min="1" data-product-id="${item.productId}">
                  <button class="qty-btn plus" data-product-id="${
                    item.productId
                  }"><i class="fas fa-plus"></i></button>
                </div>
                <div class="item-total">$${(item.price * item.quantity).toFixed(
                  2
                )}</div>
                <div class="item-actions">
                  <button class="action-btn wishlist" data-product-id="${
                    item.productId
                  }"><i class="fas fa-heart"></i></button>
                  <button class="action-btn remove" data-product-id="${
                    item.productId
                  }"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            `
                )
                .join("")
            : "<p>Your cart is empty.</p>";
      }

      const cartSummary = document.querySelector(".cart-summary");
      if (cartSummary) {
        const subtotal = cart.totalCartPrice || 0;
        const tax = subtotal * 0.08;
        const discount = subtotal * 0.1;
        const total = subtotal + tax - discount;

        cartSummary.querySelectorAll(".summary-row").forEach((row, index) => {
          const valueElement = row.querySelector("span:last-child");
          if (index === 0) valueElement.textContent = `$${subtotal.toFixed(2)}`;
          if (index === 1) valueElement.textContent = "Free";
          if (index === 2) valueElement.textContent = `$${tax.toFixed(2)}`;
          if (index === 3)
            valueElement.textContent = `-$${discount.toFixed(2)}`;
          if (index === 4) valueElement.textContent = `$${total.toFixed(2)}`;
        });
      }

      await this.updateCartCount();
    } catch (error) {
      console.error("Error loading cart:", error);
      this.showNotification("Error loading cart", "error");
    }
  }

  async loadProductsData() {
    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch("/api/category"),
        fetch("/api/products"),
      ]);

      const categories = await categoriesResponse.json();
      const products = await productsResponse.json();

      const categoryList = document.querySelector(".category-list");
      if (categoryList) {
        categoryList.innerHTML = `
          <div class="category-item active" data-category="all">
            <div class="category-icon">
              <i class="fas fa-th-large"></i>
            </div>
            <div class="category-name">ALL CATEGORIES</div>
          </div>
          ${categories
            .map(
              (category) => `
                <div class="category-item" data-category="${category._id}">
                  <div class="category-icon">
                    <img src="${
                      category.image.startsWith("http")
                        ? category.image
                        : `/upload/category/${category.image}`
                    }" alt="${category.name}">
                  </div>
                  <div class="category-name">${category.name}</div>
                </div>
              `
            )
            .join("")}
        `;

        if (window.ProductsManager) {
          new ProductsManager();
        }
      }

      const productsGrid = document.querySelector(".products-grid");
      if (productsGrid) {
        productsGrid.innerHTML = products
          .map(
            (product) => `
              <div class="product-card" data-category="${product.category._id}">
                <div class="product-image-container">
                  <img class="product-image" src="${
                    product.images[0].startsWith("http")
                      ? product.images[0]
                      : `/upload/products/${product.images[0]}`
                  }" alt="${product.title}">
                  <div class="product-overlay">
                    <div class="quick-view">Quick View</div>
                  </div>
                </div>
                <div class="product-info">
                  <div class="product-header">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-stock">Stock ID: ${
                      product.stockId
                    }</div>
                  </div>
                  <p class="product-description">${product.description}</p>
                  <div class="product-footer">
                    <div class="product-price">$${product.price.toFixed(
                      2
                    )}</div>
                    <button class="buy-now-btn" data-product-id="${
                      product._id
                    }">
                      <i class="fas fa-shopping-bag"></i> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            `
          )
          .join("");

        if (window.ProductsManager) {
          new ProductsManager();
        }

        const productCountSpan = document.getElementById("product-count");
        if (productCountSpan) {
          productCountSpan.textContent = `${products.length} Products`;
        }
      }

      this.showNotification("Products loaded successfully", "success", 1000);
    } catch (error) {
      console.error("Error loading products data:", error);
      this.showNotification("Error loading products", "error");
    }
  }

  animateCounters() {
    const counters = document.querySelectorAll("#dashboard .stat-number");
    counters.forEach((counter, index) => {
      setTimeout(() => {
        counter.style.transform = "scale(1.1)";
        setTimeout(() => {
          counter.style.transform = "scale(1)";
        }, 200);
      }, index * 100);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new EcommerceDashboard();

  setTimeout(() => {
    window.dashboard.showNotification("Welcome back!", "success", 4000);
  }, 1000);
});

document.documentElement.style.scrollBehavior = "smooth";

window.addEventListener("beforeunload", () => {
  document.body.style.opacity = "0.7";
});

function handleResponsiveNav() {
  const nav = document.querySelector(".main-nav");
  const toggleBtn = document.createElement("button");

  if (window.innerWidth <= 768 && !document.querySelector(".nav-toggle")) {
    toggleBtn.className = "nav-toggle";
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.style.cssText = `
      display: block;
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
    `;

    document.querySelector(".header-content").insertBefore(toggleBtn, nav);

    toggleBtn.addEventListener("click", () => {
      nav.classList.toggle("mobile-open");
      nav.style.display = nav.style.display === "none" ? "flex" : "none";
    });
  }
}

window.addEventListener("resize", handleResponsiveNav);
window.addEventListener("load", handleResponsiveNav);
