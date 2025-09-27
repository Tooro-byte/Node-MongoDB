// Dashboard JavaScript functionality
class EcommerceDashboard {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startClock();
    this.initializeCounters();
    this.setupNotifications();
    this.loadDashboardData();
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
    // Main nav tabs and sidebar items
    const navTabs = document.querySelectorAll(".nav-tab, .nav-item");
    const contentSections = document.querySelectorAll(".content-section");

    navTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const href = tab.getAttribute("href");
        const section = tab.dataset.section;

        // Allow navigation for specific routes
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
          // Allow default navigation behavior
          return;
        }

        // Handle section toggling for dashboard content
        if (section) {
          e.preventDefault();
          this.switchSection(section, navTabs, contentSections);
        }
      });
    });

    // Handle "View All" links in widgets
    document.querySelectorAll(".view-all").forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        const section = link.dataset.section;

        if (["/products", "/orders"].includes(href)) {
          // Allow navigation to /products or /orders
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
    // Remove active class from all nav elements
    navElements.forEach((el) => el.classList.remove("active"));

    // Add active class to clicked element and its corresponding nav-tab/nav-item
    const activeElements = document.querySelectorAll(
      `[data-section="${section}"]`
    );
    activeElements.forEach((el) => el.classList.add("active"));

    // Hide all content sections
    contentSections.forEach((content) => content.classList.remove("active"));

    // Show target section
    const targetSection = document.getElementById(section);
    if (targetSection) {
      targetSection.classList.add("active");
      this.animateSection(targetSection);
    }

    // Load section-specific data
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

      // Update time
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

      // Update date
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

    // Update immediately and then every second
    updateTime();
    setInterval(updateTime, 1000);
  }

  initializeCounters() {
    // Animate counter numbers on page load
    const counters = document.querySelectorAll(".summary-number, .stat-number");

    counters.forEach((counter) => {
      const target = parseInt(counter.textContent.replace(/[^0-9]/g, ""));
      const prefix = counter.textContent.replace(/[0-9]/g, "");
      let current = 0;
      const increment = target / 100;

      const updateCounter = () => {
        if (current < target) {
          current += increment;
          counter.textContent = prefix + Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = counter.textContent; // Reset to original
        }
      };

      // Start animation after a delay
      setTimeout(updateCounter, 500);
    });
  }

  setupCart() {
    // Quantity controls
    document.addEventListener("click", (e) => {
      if (e.target.closest(".qty-btn")) {
        const btn = e.target.closest(".qty-btn");
        const input = btn.parentNode.querySelector(".qty-input");
        const isPlus = btn.classList.contains("plus");

        let quantity = parseInt(input.value);
        quantity = isPlus ? quantity + 1 : Math.max(1, quantity - 1);
        input.value = quantity;

        this.updateCartTotal();
        this.animateButton(btn);
      }
    });

    // Remove item from cart
    document.addEventListener("click", (e) => {
      if (e.target.closest(".remove-item, .action-btn.remove")) {
        const item = e.target.closest(".cart-item");
        if (item && confirm("Remove this item from your cart?")) {
          this.removeCartItem(item);
        }
      }
    });

    // Add to wishlist
    document.addEventListener("click", (e) => {
      if (e.target.closest(".action-btn.wishlist")) {
        const btn = e.target.closest(".action-btn.wishlist");
        this.toggleWishlist(btn);
      }
    });
  }

  updateCartTotal() {
    const cartItems = document.querySelectorAll(".cart-item");
    let subtotal = 0;

    cartItems.forEach((item) => {
      const price = parseFloat(
        item.querySelector(".item-price").textContent.replace(/[^0-9.]/g, "")
      );
      const quantity = parseInt(item.querySelector(".qty-input").value);
      const total = price * quantity;

      const totalElement = item.querySelector(".item-total");
      if (totalElement) {
        totalElement.textContent = "$" + total.toFixed(2);
      }

      subtotal += total;
    });

    // Update summary
    const summaryRows = document.querySelectorAll(".summary-row");
    summaryRows.forEach((row) => {
      const label = row.querySelector("span:first-child").textContent;
      const valueElement = row.querySelector("span:last-child");

      if (label.includes("Subtotal")) {
        valueElement.textContent = "$" + subtotal.toFixed(2);
      } else if (label.includes("Total")) {
        const tax = subtotal * 0.08; // 8% tax
        const discount = subtotal * 0.1; // 10% discount
        const total = subtotal + tax - discount;
        valueElement.textContent = "$" + total.toFixed(2);
      }
    });
  }

  removeCartItem(item) {
    item.style.transition = "all 0.3s ease";
    item.style.transform = "translateX(-100%)";
    item.style.opacity = "0";

    setTimeout(() => {
      item.remove();
      this.updateCartTotal();
      this.updateCartCount();
    }, 300);
  }

  toggleWishlist(btn) {
    const icon = btn.querySelector("i");
    const isInWishlist = icon.classList.contains("fas");

    if (isInWishlist) {
      icon.classList.remove("fas");
      icon.classList.add("far");
      this.showNotification("Removed from wishlist", "info");
    } else {
      icon.classList.remove("far");
      icon.classList.add("fas");
      this.showNotification("Added to wishlist", "success");
    }

    this.animateButton(btn);
  }

  updateCartCount() {
    const cartItems = document.querySelectorAll(".cart-item").length;
    const countElements = document.querySelectorAll(
      '.cart-icon .cart-count, .nav-tab[data-section="cart"] .badge, .nav-item[data-section="cart"] .count'
    );

    countElements.forEach((element) => {
      element.textContent = cartItems;
    });
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

  performSearch(query) {
    if (query.length < 2) return;

    // Simulate search functionality
    console.log("Searching for:", query);

    // Show search results or suggestions
    this.showSearchResults(query);
  }

  showSearchResults(query) {
    // Create search results dropdown
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

    // Sample search results
    dropdown.innerHTML = `
            <div class="search-result-item" style="padding: 0.5rem; cursor: pointer; border-radius: 0.25rem; margin-bottom: 0.5rem;">
                <div style="font-weight: 600;">Premium Cotton Shirt</div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">$89.99</div>
            </div>
            <div class="search-result-item" style="padding: 0.5rem; cursor: pointer; border-radius: 0.25rem;">
                <div style="font-weight: 600;">Designer Denim Jacket</div>
                <div style="color: var(--text-secondary); font-size: 0.875rem;">$199.99</div>
            </div>
        `;

    // Add click handlers for results
    dropdown.querySelectorAll(".search-result-item").forEach((item) => {
      item.addEventListener("click", () => {
        dropdown.remove();
        this.showNotification("Product added to cart!", "success");
      });

      item.addEventListener("mouseenter", () => {
        item.style.background = "var(--bg-secondary)";
      });

      item.addEventListener("mouseleave", () => {
        item.style.background = "transparent";
      });
    });

    // Remove dropdown when clicking outside
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
    // Order filters
    const orderFilters = document.querySelectorAll(".filter-select");
    orderFilters.forEach((filter) => {
      filter.addEventListener("change", (e) => {
        this.filterOrders(e.target.value);
      });
    });

    // Message filters
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
    const orders = document.querySelectorAll(".order-card, .order-item");

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
    // Initialize notification system
    this.createNotificationContainer();

    // Mark notifications as read
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

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 10);

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      this.dismissNotification(notification);
    }, duration);

    // Manual dismiss
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

  showNotificationDropdown() {
    // Create and show notification dropdown
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
                <div class="notification-item" style="padding: 0.75rem; border-bottom: 1px solid var(--border-light); cursor: pointer;">
                    <div style="font-weight: 600; font-size: 0.875rem;">Order Shipped</div>
                    <div style="color: var(--text-secondary); font-size: 0.75rem; margin: 0.25rem 0;">Your order #KC-2024-001 is on its way</div>
                    <div style="color: var(--text-muted); font-size: 0.75rem;">2 hours ago</div>
                </div>
                <div class="notification-item" style="padding: 0.75rem; border-bottom: 1px solid var(--border-light); cursor: pointer;">
                    <div style="font-weight: 600; font-size: 0.875rem;">Special Offer</div>
                    <div style="color: var(--text-secondary); font-size: 0.75rem; margin: 0.25rem 0;">25% off on selected items</div>
                    <div style="color: var(--text-muted); font-size: 0.75rem;">1 day ago</div>
                </div>
            </div>
        `;

    const notificationBtn = document.querySelector(".notification-btn");
    notificationBtn.parentNode.style.position = "relative";
    notificationBtn.parentNode.appendChild(dropdown);

    // Remove dropdown when clicking outside
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
  }

  setupNotificationHandlers() {
    document.addEventListener("click", (e) => {
      if (e.target.closest(".close-notification")) {
        const notification = e.target.closest(".notification");
        if (notification) {
          notification.style.transform = "translateX(100%)";
          setTimeout(() => notification.remove(), 300);
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
        case btnText.includes("View Details"):
        case btnText.includes("View Invoice"):
          this.viewOrderDetails(btn);
          break;
        case btnText.includes("Reorder"):
          this.reorderItems(btn);
          break;
        case btnText.includes("Leave Review"):
          this.leaveReview(btn);
          break;
        case btnText.includes("Return Item"):
          this.returnItem(btn);
          break;
        case btnText.includes("Export Orders"):
          this.exportOrders();
          break;
      }
    });
  }

  trackOrder(btn) {
    this.showNotification("Opening order tracking...", "info");
    // Simulate opening tracking page
    setTimeout(() => {
      this.showNotification("Order is currently in transit", "success");
    }, 1000);
  }

  viewOrderDetails(btn) {
    this.showNotification("Loading order details...", "info");
    this.animateButton(btn);
  }

  reorderItems(btn) {
    this.showNotification("Items added to cart!", "success");
    this.updateCartCount();
    this.animateButton(btn);
  }

  leaveReview(btn) {
    this.showNotification("Opening review form...", "info");
    this.animateButton(btn);
  }

  returnItem(btn) {
    if (confirm("Are you sure you want to return this item?")) {
      this.showNotification("Return request submitted", "success");
      this.animateButton(btn);
    }
  }

  exportOrders() {
    this.showNotification("Preparing export...", "info");
    setTimeout(() => {
      this.showNotification("Orders exported successfully!", "success");
    }, 2000);
  }

  setupMessageActions() {
    document.addEventListener("click", (e) => {
      if (e.target.closest(".message-actions button")) {
        const btn = e.target.closest("button");
        const btnText = btn.textContent.trim();
        const messageItem = btn.closest(".message-item");

        switch (true) {
          case btnText.includes("Mark as Read"):
            this.markMessageAsRead(messageItem);
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

  updateMessageCount() {
    const unreadCount = document.querySelectorAll(
      ".message-item.unread"
    ).length;
    const countElements = document.querySelectorAll(
      '.nav-tab[data-section="messages"] .badge, .nav-item[data-section="messages"] .count'
    );

    countElements.forEach((element) => {
      element.textContent = unreadCount;
      element.classList.toggle("new", unreadCount > 0);
    });
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
        // Navigate to logout route
        window.location.href = "/logout";
      }, 1500);
    }
  }

  loadSectionData(section) {
    // Simulate loading data for different sections
    console.log(`Loading data for section: ${section}`);

    // Add any section-specific initialization here
    switch (section) {
      case "dashboard":
        this.loadDashboardData();
        break;
      case "orders":
        this.loadOrdersData();
        break;
      case "messages":
        this.loadMessagesData();
        break;
      case "cart":
        this.updateCartTotal();
        break;
    }
  }

  loadDashboardData() {
    // Simulate loading dashboard metrics
    this.animateCounters();
  }

  loadOrdersData() {
    // Simulate loading orders
    this.showNotification("Orders updated", "info", 1000);
  }

  loadMessagesData() {
    // Simulate loading messages
    this.updateMessageCount();
  }

  animateCounters() {
    // Re-animate counters when dashboard loads
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

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new EcommerceDashboard();

  // Show welcome message
  setTimeout(() => {
    window.dashboard.showNotification(
      "Welcome back, John! 👋",
      "success",
      4000
    );
  }, 1000);
});

// Add smooth scrolling for better UX
document.documentElement.style.scrollBehavior = "smooth";

// Add loading states for better perceived performance
window.addEventListener("beforeunload", () => {
  document.body.style.opacity = "0.7";
});

// Handle responsive navigation
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

// Handle responsive behavior
window.addEventListener("resize", handleResponsiveNav);
window.addEventListener("load", handleResponsiveNav);
