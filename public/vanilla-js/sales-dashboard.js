class SalesDashboard {
  constructor() {
    this.currentSection = "dashboard";
    this.currentTime = new Date();
    this.cartItems = new Map();
    this.notifications = [];
    this.tasks = [];
    this.promotions = [];
    this.taxRate = 0.085; // Configurable tax rate
    this.locale = "en-UG"; // Updated for Ugandan locale
    this.currency = "UGX"; // Added for currency formatting

    this.init();
  }

  init() {
    this.initializeClock();
    this.initializeNavigation();
    this.initializeQuickActions();
    this.initializePOS();
    this.initializeDropdowns();
    this.initializeCharts();
    this.initializeEventListeners();
    this.loadDashboardData();

    // Auto-refresh functionality
    this.startAutoRefresh();
  }

  /**
   * Digital Clock Functionality
   */
  initializeClock() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  updateClock() {
    const now = new Date();
    const timeElement = document.getElementById("currentTime");
    const dateElement = document.getElementById("currentDate");

    if (timeElement && dateElement) {
      const timeString = now.toLocaleTimeString(this.locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const dateString = now.toLocaleDateString(this.locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      timeElement.textContent = timeString;
      dateElement.textContent = dateString;
    } else {
      console.warn("Clock elements not found");
    }

    this.updateGreeting(now);
  }

  updateGreeting(now) {
    const hour = now.getHours();
    const greetingElement = document.querySelector(".greeting-text");

    if (greetingElement) {
      let greeting;
      if (hour < 12) greeting = "Good Morning,";
      else if (hour < 17) greeting = "Good Afternoon,";
      else greeting = "Good Evening,";
      greetingElement.textContent = greeting;
    } else {
      console.warn("Greeting element not found");
    }
  }

  /**
   * Navigation System
   */
  initializeNavigation() {
    const navItems = document.querySelectorAll(".nav-item[data-section]");
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetSection = item.getAttribute("data-section");
        const href = item.getAttribute("href");
        if (href && href !== "#") {
          window.location.href = href; // Navigate to actual page
        } else {
          this.switchSection(targetSection);
        }
      });
    });

    this.initializeTabNavigation();
  }

  switchSection(sectionId) {
    const sections = document.querySelectorAll(".content-section");
    sections.forEach((section) => section.classList.remove("active"));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add("active");
    } else {
      console.warn(`Section ${sectionId} not found`);
    }

    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => item.classList.remove("active"));

    const activeNavItem = document.querySelector(
      `[data-section="${sectionId}"]`
    );
    if (activeNavItem) {
      activeNavItem.classList.add("active");
    }

    this.currentSection = sectionId;
    this.loadSectionData(sectionId);
    this.showToast(
      "success",
      "Navigation",
      `Switched to ${this.formatSectionName(sectionId)} section`
    );
  }

  initializeTabNavigation() {
    const tabLinks = document.querySelectorAll(".tab-link[data-tab]");
    tabLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetTab = link.getAttribute("data-tab");

        tabLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        const tabPanels = document.querySelectorAll(".tab-panel");
        tabPanels.forEach((panel) => panel.classList.remove("active"));
        const targetPanel = document.getElementById(`${targetTab}-settings`);
        if (targetPanel) {
          targetPanel.classList.add("active");
        } else {
          console.warn(`Tab panel ${targetTab}-settings not found`);
        }
      });
    });
  }

  formatSectionName(sectionId) {
    return (
      sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace("-", " ")
    );
  }

  /**
   * Dropdown System
   */
  initializeDropdowns() {
    const userMenu = document.querySelector(".user-menu");
    const userDropdown = document.querySelector(".dropdown-menu");

    if (userMenu && userDropdown) {
      userMenu.setAttribute("tabindex", "0");
      userMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleDropdown(userDropdown);
      });
      userMenu.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.toggleDropdown(userDropdown);
        }
      });

      const dropdownItems = userDropdown.querySelectorAll("[data-action]");
      dropdownItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const action = item.getAttribute("data-action");
          this.handleUserAction(action);
          this.closeAllDropdowns();
        });
      });
    } else {
      console.warn("User menu or dropdown not found");
    }

    const navItems = document.querySelectorAll(".top-nav .nav-item");
    navItems.forEach((item) => {
      const dropdown = item.querySelector(".nav-dropdown");
      if (dropdown) {
        item.setAttribute("tabindex", "0");
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleDropdown(dropdown);
        });
        item.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.toggleDropdown(dropdown);
          }
        });

        const notificationItems =
          dropdown.querySelectorAll(".notification-item");
        notificationItems.forEach((notifItem) => {
          notifItem.addEventListener("click", (e) => {
            e.stopPropagation();
            const title =
              notifItem.querySelector(".notification-title")?.textContent ||
              "Item";
            this.showToast("info", "Notification", `Clicked ${title}`);
            this.closeAllDropdowns();
          });
        });
      }
    });

    document.addEventListener("click", (e) => {
      const dropdowns = document.querySelectorAll(
        ".dropdown-menu, .nav-dropdown"
      );
      dropdowns.forEach((dropdown) => {
        if (
          !dropdown.contains(e.target) &&
          dropdown.classList.contains("active")
        ) {
          dropdown.classList.remove("active");
        }
      });
    });

    const allDropdowns = document.querySelectorAll(
      ".dropdown-menu, .nav-dropdown"
    );
    allDropdowns.forEach((dropdown) => {
      dropdown.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
  }

  toggleDropdown(dropdown) {
    if (!dropdown) return;
    const isActive = dropdown.classList.contains("active");
    this.closeAllDropdowns();
    if (!isActive) {
      dropdown.classList.add("active");
      const firstItem = dropdown.querySelector("a, button");
      if (firstItem) firstItem.focus();
    }
  }

  closeAllDropdowns() {
    const dropdowns = document.querySelectorAll(
      ".dropdown-menu, .nav-dropdown"
    );
    dropdowns.forEach((dropdown) => dropdown.classList.remove("active"));
  }

  /**
   * Quick Actions
   */
  initializeQuickActions() {
    const quickActions = document.querySelectorAll(
      ".action-btn:not(.new-order):not(.pos)"
    );
    quickActions.forEach((action) => {
      action.addEventListener("click", (e) => {
        e.preventDefault();
        if (action.classList.contains("customer-lookup")) {
          this.handleCustomerLookup();
        } else if (action.classList.contains("approve-order")) {
          this.handleOrderAction("approve");
        } else if (action.classList.contains("reject-order")) {
          this.handleOrderAction("reject");
        } else if (action.classList.contains("cancel-order")) {
          this.handleOrderAction("cancel");
        } else {
          const actionName =
            action.querySelector("span")?.textContent || "Action";
          this.showToast("info", "Quick Action", `${actionName} clicked`);
        }
      });
    });
  }

  handleCustomerLookup() {
    const searchTerm = prompt("Enter customer name, email, or order number:");
    if (searchTerm) {
      this.searchCustomers(searchTerm);
    }
  }

  handleOrderAction(action) {
    const orderId = prompt(`Enter Order ID to ${action}:`);
    if (orderId) {
      this.processOrderAction(orderId, action);
    }
  }

  processOrderAction(orderId, action) {
    fetch(`/api/orders/${orderId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.showToast(
            "success",
            `Order ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            `Order #${orderId} has been ${action}ed`
          );
          this.loadDashboardData(); // Refresh dashboard
        } else {
          this.showToast(
            "error",
            "Order Action Failed",
            `Failed to ${action} order #${orderId}`
          );
        }
      })
      .catch((error) => {
        this.showToast("error", "Error", `Error: ${error.message}`);
      });
  }

  searchCustomers(searchTerm) {
    this.switchSection("customers");
    this.showToast(
      "success",
      "Customer Search",
      `Found customers matching "${searchTerm}"`
    );
  }

  /**
   * Point of Sale System
   */
  initializePOS() {
    this.initializeProductSearch();
    this.loadProducts();
    this.initializeCart();
    this.initializePaymentMethods();
  }

  initializeProductSearch() {
    const searchInput = document.getElementById("productSearch");
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value.toLowerCase();
        searchTimeout = setTimeout(() => this.filterProducts(searchTerm), 300);
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.value.startsWith("*")) {
          const barcode = e.target.value.substring(1);
          this.handleBarcodeSearch(barcode);
        }
      });
    } else {
      console.warn("Product search input not found");
    }
  }

  async loadProducts() {
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) {
      console.warn("Product grid not found");
      return;
    }

    productGrid.innerHTML =
      '<div class="loading-products">Loading products...</div>';

    try {
      const response = await fetch("/api/products");
      const products = await response.json();
      productGrid.innerHTML = "";
      products.forEach((product) => this.addProductToGrid(product));
      this.initializeProductGrid();
    } catch (error) {
      productGrid.innerHTML =
        '<div class="error-products">Failed to load products</div>';
      this.showToast("error", "Products", `Failed to load: ${error.message}`);
    }
  }

  addProductToGrid(product) {
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) return;

    const productHTML = `
      <div class="product-item" data-product-id="${product.id}" data-price="${
      product.price
    }">
        <div class="product-image">
          <img src="${
            product.image ||
            "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=150"
          }" alt="${product.name}">
        </div>
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-price">${this.formatCurrency(product.price)}</div>
          <div class="product-stock">In Stock: ${product.stock}</div>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary add-to-cart">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    `;
    productGrid.insertAdjacentHTML("beforeend", productHTML);
  }

  filterProducts(searchTerm) {
    const products = document.querySelectorAll(".product-item");
    products.forEach((product) => {
      const productName =
        product.querySelector(".product-name")?.textContent.toLowerCase() || "";
      const isVisible = searchTerm === "" || productName.includes(searchTerm);
      product.style.display = isVisible ? "block" : "none";
    });
  }

  handleBarcodeSearch(barcode) {
    fetch(`/api/products/barcode/${barcode}`)
      .then((response) => response.json())
      .then((product) => {
        if (product) {
          this.addToCart(product);
          this.showToast(
            "success",
            "Barcode Scan",
            `Added ${product.name} to cart`
          );
        } else {
          this.showToast(
            "warning",
            "Barcode Scan",
            `No product found for barcode: ${barcode}`
          );
        }
      })
      .catch((error) => {
        this.showToast("error", "Barcode Scan", `Error: ${error.message}`);
      });
  }

  initializeProductGrid() {
    const products = document.querySelectorAll(".product-item");
    products.forEach((product) => {
      const addButton = product.querySelector(".add-to-cart");
      if (addButton) {
        addButton.addEventListener("click", () => {
          const productData = {
            id: product.getAttribute("data-product-id"),
            name:
              product.querySelector(".product-name")?.textContent ||
              "Unknown Product",
            price: parseFloat(product.getAttribute("data-price")) || 0,
            image: product.querySelector(".product-image img")?.src,
          };
          this.addToCart(productData);
        });
      }
    });
  }

  initializeCart() {
    const clearButton = document.querySelector(".clear-cart");
    const cartContainer = document.getElementById("cartItems");

    if (clearButton) {
      clearButton.addEventListener("click", () => this.clearCart());
    } else {
      console.warn("Clear cart button not found");
    }

    if (cartContainer) {
      cartContainer.addEventListener("click", (e) => {
        const target = e.target.closest("button");
        if (!target) return;

        const productId = target.getAttribute("data-product-id");
        const action = target.getAttribute("data-action");

        if (target.classList.contains("remove-item")) {
          this.removeFromCart(productId);
        } else if (action === "increase") {
          const item = this.cartItems.get(productId);
          if (item) this.updateCartQuantity(productId, item.quantity + 1);
        } else if (action === "decrease") {
          const item = this.cartItems.get(productId);
          if (item) this.updateCartQuantity(productId, item.quantity - 1);
        }
      });
    } else {
      console.warn("Cart container not found");
    }
  }

  addToCart(product) {
    const existingItem = this.cartItems.get(product.id);
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.total = existingItem.quantity * existingItem.price;
    } else {
      this.cartItems.set(product.id, {
        ...product,
        quantity: 1,
        total: product.price,
      });
    }
    this.updateCartDisplay();
    this.showToast("success", "Cart", `${product.name} added to cart`);
  }

  removeFromCart(productId) {
    this.cartItems.delete(productId);
    this.updateCartDisplay();
    this.showToast("info", "Cart", "Item removed from cart");
  }

  updateCartQuantity(productId, quantity) {
    const item = this.cartItems.get(productId);
    if (item && quantity > 0) {
      item.quantity = quantity;
      item.total = item.quantity * item.price;
      this.updateCartDisplay();
    } else if (quantity <= 0) {
      this.removeFromCart(productId);
    }
  }

  clearCart() {
    this.cartItems.clear();
    this.updateCartDisplay();
    this.showToast("info", "Cart", "Cart cleared");
  }

  updateCartDisplay() {
    const cartContainer = document.getElementById("cartItems");
    if (!cartContainer) {
      console.warn("Cart container not found");
      return;
    }

    cartContainer.innerHTML = "";
    if (this.cartItems.size === 0) {
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <p>Add items to start a sale</p>
        </div>
      `;
      this.updateCartTotals(0, 0, 0);
      return;
    }

    let subtotal = 0;
    this.cartItems.forEach((item, id) => {
      subtotal += item.total;
      const cartItemHTML = `
        <div class="cart-item" data-product-id="${id}">
          <div class="item-info">
            <div class="item-image">
              <img src="${
                item.image ||
                "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=50"
              }" alt="${item.name}">
            </div>
            <div class="item-details">
              <div class="item-name">${item.name}</div>
              <div class="item-price">${this.formatCurrency(item.price)}</div>
            </div>
          </div>
          <div class="item-controls">
            <div class="quantity-controls">
              <button class="qty-btn minus" data-action="decrease" data-product-id="${id}">
                <i class="fas fa-minus"></i>
              </button>
              <span class="quantity">${item.quantity}</span>
              <button class="qty-btn plus" data-action="increase" data-product-id="${id}">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <div class="item-total">${this.formatCurrency(item.total)}</div>
            <button class="remove-item" data-product-id="${id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      cartContainer.insertAdjacentHTML("beforeend", cartItemHTML);
    });

    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;
    this.updateCartTotals(subtotal, tax, total);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency: this.currency,
    }).format(amount);
  }

  updateCartTotals(subtotal, tax, total) {
    const subtotalElement = document.querySelector(".subtotal");
    const taxElement = document.querySelector(".tax-amount");
    const totalElement = document.querySelector(".total-amount");

    if (subtotalElement) {
      subtotalElement.textContent = this.formatCurrency(subtotal);
    } else {
      console.warn("Subtotal element not found");
    }
    if (taxElement) {
      taxElement.textContent = this.formatCurrency(tax);
    } else {
      console.warn("Tax element not found");
    }
    if (totalElement) {
      totalElement.textContent = this.formatCurrency(total);
    } else {
      console.warn("Total element not found");
    }
  }

  initializePaymentMethods() {
    const paymentBtns = document.querySelectorAll(".payment-btn");
    const paymentInput = document.querySelector(".payment-amount");
    const completeButton = document.querySelector(".complete-sale");
    const holdButton = document.querySelector(".hold-sale");

    paymentBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        paymentBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    if (paymentInput) {
      paymentInput.addEventListener("input", (e) => {
        const amountPaid = parseFloat(e.target.value);
        if (isNaN(amountPaid)) {
          this.showToast(
            "warning",
            "Invalid Input",
            "Please enter a valid amount"
          );
          e.target.value = "";
          return;
        }
        const totalAmount = this.calculateCartTotal();
        const change = Math.max(0, amountPaid - totalAmount);
        const changeElement = document.querySelector(".change-amount");
        if (changeElement) {
          changeElement.textContent = `Change: ${this.formatCurrency(change)}`;
        } else {
          console.warn("Change amount element not found");
        }
      });
    } else {
      console.warn("Payment input not found");
    }

    if (completeButton) {
      completeButton.addEventListener("click", () => this.completeSale());
    } else {
      console.warn("Complete sale button not found");
    }

    if (holdButton) {
      holdButton.addEventListener("click", () => this.holdSale());
    } else {
      console.warn("Hold sale button not found");
    }
  }

  calculateCartTotal() {
    let subtotal = 0;
    this.cartItems.forEach((item) => {
      subtotal += item.total;
    });
    return subtotal + subtotal * this.taxRate;
  }

  completeSale() {
    if (this.cartItems.size === 0) {
      this.showToast("warning", "Sale Error", "Cart is empty");
      return;
    }

    const totalAmount = this.calculateCartTotal();
    const paymentMethod =
      document.querySelector(".payment-btn.active")?.textContent.trim() ||
      "Cash";

    fetch("/api/sales/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: Array.from(this.cartItems.values()),
        total: totalAmount,
        paymentMethod,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.clearCart();
          this.showToast(
            "success",
            "Sale Complete",
            `Transaction completed - ${this.formatCurrency(totalAmount)}`
          );
        } else {
          this.showToast("error", "Sale Error", "Failed to complete sale");
        }
      })
      .catch((error) => {
        this.showToast("error", "Sale Error", `Error: ${error.message}`);
      });
  }

  holdSale() {
    if (this.cartItems.size === 0) {
      this.showToast("warning", "Hold Sale", "Cart is empty");
      return;
    }

    const heldSale = {
      id: "HOLD-" + Date.now(),
      items: Array.from(this.cartItems.values()),
      timestamp: new Date(),
    };
    this.saveHeldSale(heldSale);
    this.clearCart();
    this.showToast("info", "Sale Held", "Current sale has been held");
  }

  saveHeldSale(saleData) {
    fetch("/api/sales/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saleData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          this.showToast("error", "Hold Sale", "Failed to hold sale");
        }
      })
      .catch((error) => {
        this.showToast("error", "Hold Sale", `Error: ${error.message}`);
      });
  }

  /**
   * Notification System
   */
  async loadNotifications() {
    try {
      const response = await fetch("/api/notifications");
      this.notifications = await response.json();
      this.updateNotificationBadge();
    } catch (error) {
      this.showToast(
        "error",
        "Notifications",
        `Failed to load: ${error.message}`
      );
    }
  }

  updateNotificationBadge() {
    const badge = document.querySelector(".notification-badge");
    const unreadCount = this.notifications.filter((n) => !n.read).length;
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? "block" : "none";
    } else {
      console.warn("Notification badge not found");
    }
  }

  showToast(type, title, message, duration = 4000) {
    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
      console.warn("Toast container not found");
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = this.getToastIcon(type);
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  getToastIcon(type) {
    switch (type) {
      case "success":
        return "fa-check-circle";
      case "warning":
        return "fa-exclamation-triangle";
      case "error":
        return "fa-times-circle";
      case "info":
      default:
        return "fa-info-circle";
    }
  }

  /**
   * Chart Initialization
   */
  initializeCharts() {
    this.initializeSalesChart();
    this.initializeCustomerChart();
    this.initializePerformanceChart();
  }

  async initializeSalesChart() {
    const canvas = document.getElementById("salesChart");
    if (!canvas) {
      console.warn("Sales chart canvas not found");
      return;
    }
    try {
      const response = await fetch("/api/charts/sales");
      const data = await response.json();
      new Chart(canvas, {
        type: "line",
        data: {
          labels: data.labels || [],
          datasets: [
            {
              label: "Sales Trend",
              data: data.values || [],
              borderColor: "#c64ff0",
              backgroundColor: "rgba(198, 79, 240, 0.3)",
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } },
        },
      });
    } catch (error) {
      this.showToast(
        "error",
        "Sales Chart",
        `Failed to load: ${error.message}`
      );
    }
  }

  async initializeCustomerChart() {
    const canvas = document.getElementById("customerChart");
    if (!canvas) {
      console.warn("Customer chart canvas not found");
      return;
    }
    try {
      const response = await fetch("/api/charts/customers");
      const data = await response.json();
      new Chart(canvas, {
        type: "bar",
        data: {
          labels: data.labels || [],
          datasets: [
            {
              label: "Customer Growth",
              data: data.values || [],
              backgroundColor: "rgba(198, 79, 240, 0.5)",
            },
          ],
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } },
        },
      });
    } catch (error) {
      this.showToast(
        "error",
        "Customer Chart",
        `Failed to load: ${error.message}`
      );
    }
  }

  async initializePerformanceChart() {
    const canvas = document.getElementById("performanceChart");
    if (!canvas) {
      console.warn("Performance chart canvas not found");
      return;
    }
    try {
      const response = await fetch("/api/charts/performance");
      const data = await response.json();
      new Chart(canvas, {
        type: "line",
        data: {
          labels: data.labels || [],
          datasets: [
            {
              label: "Performance",
              data: data.values || [],
              borderColor: "#c64ff0",
              backgroundColor: "rgba(198, 79, 240, 0.3)",
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } },
        },
      });
    } catch (error) {
      this.showToast(
        "error",
        "Performance Chart",
        `Failed to load: ${error.message}`
      );
    }
  }

  /**
   * Data Loading and Management
   */
  async loadDashboardData() {
    try {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      this.updateDashboardStats(data.stats || {});
      this.loadRecentActivity(data.activities || []);
      this.loadPriorityTasks(data.tasks || []);
    } catch (error) {
      this.showToast("error", "Dashboard", `Failed to load: ${error.message}`);
    }
  }

  async loadSectionData(sectionId) {
    try {
      const response = await fetch(`/api/${sectionId}`);
      const data = await response.json();
      switch (sectionId) {
        case "orders":
          this.updateOrders(data);
          break;
        case "customers":
          this.updateCustomers(data);
          break;
        case "inventory":
          this.updateInventory(data);
          break;
        case "tasks":
          this.updateTasks(data);
          break;
        case "promotions":
          this.updatePromotions(data);
          break;
        case "analytics":
          this.updateAnalytics(data);
          break;
        case "employees":
          this.updateEmployeeData(data);
          break;
        case "financials":
          this.updateFinancialData(data);
          break;
        case "marketing":
          this.updateMarketingData(data);
          break;
        default:
          break;
      }
    } catch (error) {
      this.showToast(
        "error",
        `${this.formatSectionName(sectionId)}`,
        `Failed to load: ${error.message}`
      );
    }
  }

  updateDashboardStats(stats) {
    const values = [
      stats.pendingOrders || 0,
      stats.todaysSales || 0,
      stats.newCustomers || 0,
    ];
    this.animateCounter(".stat-number", values);
  }

  animateCounter(selector, values) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
      if (values[index] !== undefined) {
        let current = 0;
        const target = values[index];
        const increment = target / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          element.textContent = selector.includes("revenue")
            ? this.formatCurrency(Math.floor(current))
            : Math.floor(current);
        }, 20);
      }
    });
  }

  updateRecentActivity(activities) {
    const activityFeed = document.querySelector(".activity-feed");
    if (!activityFeed) {
      console.warn("Activity feed not found");
      return;
    }
    activityFeed.innerHTML = "";
    activities.forEach((activity) => {
      const activityHTML = `
        <div class="activity-item">
          <div class="activity-avatar">
            ${
              activity.avatar
                ? `<img src="${activity.avatar}" alt="Customer">`
                : `<div class="avatar-icon"><i class="fas ${
                    activity.icon || "fa-user"
                  }"></i></div>`
            }
          </div>
          <div class="activity-content">
            <div class="activity-text">
              <strong>${activity.customer || "Unknown"}</strong>
              <span>${activity.action}</span>
              ${activity.orderId ? `<strong>${activity.orderId}</strong>` : ""}
            </div>
            <div class="activity-time">${activity.time}</div>
          </div>
          <div class="activity-action">
            <button class="btn btn-sm btn-outline">View ${
              activity.type === "order"
                ? "Order"
                : activity.type === "shipping"
                ? "Tracking"
                : "Review"
            }</button>
          </div>
        </div>
      `;
      activityFeed.insertAdjacentHTML("beforeend", activityHTML);
    });
  }

  updatePriorityTasks(tasks) {
    this.tasks = tasks;
    const urgentList = document.querySelector(
      ".priority-card.urgent .priority-list"
    );
    const todayList = document.querySelector(
      ".priority-card.today .priority-list"
    );
    if (urgentList) urgentList.innerHTML = "";
    if (todayList) todayList.innerHTML = "";

    tasks.forEach((task) => {
      const taskHTML = `
        <div class="priority-item">
          <div class="item-icon">
            <i class="fas ${task.icon || "fa-task"}"></i>
          </div>
          <div class="item-content">
            <div class="item-title">${task.title}</div>
            <div class="item-subtitle">${task.subtitle || ""}</div>
          </div>
          <div class="item-action">
            <button class="btn btn-sm ${
              task.priority === "high" ? "btn-danger" : "btn-primary"
            }">${task.action || "Process"}</button>
          </div>
        </div>
      `;
      if (task.status === "urgent" && urgentList) {
        urgentList.insertAdjacentHTML("beforeend", taskHTML);
      } else if (task.status === "today" && todayList) {
        todayList.insertAdjacentHTML("beforeend", taskHTML);
      }
    });

    const urgentCount = tasks.filter((t) => t.status === "urgent").length;
    const todayCount = tasks.filter((t) => t.status === "today").length;
    const urgentCounter = document.querySelector(
      ".priority-card.urgent .priority-count"
    );
    const todayCounter = document.querySelector(
      ".priority-card.today .priority-count"
    );
    if (urgentCounter) urgentCounter.textContent = urgentCount;
    if (todayCounter) todayCounter.textContent = todayCount;
  }

  updateOrders(data) {
    // Update orders section with API data
    console.log("Updating orders with:", data);
  }

  updateCustomers(data) {
    // Update customers section with API data
    console.log("Updating customers with:", data);
  }

  updateInventory(data) {
    // Update inventory section with API data
    console.log("Updating inventory with:", data);
  }

  updateTasks(data) {
    // Update tasks section with API data
    console.log("Updating tasks with:", data);
  }

  updatePromotions(data) {
    this.promotions = data;
    // Update promotions section with API data
    console.log("Updating promotions with:", data);
  }

  updateAnalytics(data) {
    console.log("Updating analytics with:", data);
  }

  updateEmployeeData(data) {
    console.log("Updating employee data with:", data);
  }

  updateFinancialData(data) {
    console.log("Updating financial data with:", data);
  }

  updateMarketingData(data) {
    console.log("Updating marketing data with:", data);
  }

  /**
   * Auto-refresh functionality
   */
  startAutoRefresh() {
    setInterval(() => {
      if (this.currentSection === "dashboard" && !document.hidden) {
        this.loadDashboardData();
      }
    }, 5 * 60 * 1000);

    setInterval(() => {
      if (!document.hidden) {
        this.loadSectionData(this.currentSection);
      }
    }, 2 * 60 * 1000);
  }

  /**
   * Event Listeners
   */
  initializeEventListeners() {
    const refreshBtn = document.querySelector(".refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.handleRefresh());
    } else {
      console.warn("Refresh button not found");
    }

    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e)
    );
    window.addEventListener("resize", () => this.handleWindowResize());
    window.addEventListener("online", () => {
      this.showToast("success", "Connection", "Back online");
    });
    window.addEventListener("offline", () => {
      this.showToast("warning", "Connection", "You are now offline");
    });
  }

  handleUserAction(action) {
    switch (action) {
      case "profile":
        this.switchSection("settings");
        break;
      case "preferences":
        this.switchSection("settings");
        setTimeout(() => {
          const prefTab = document.querySelector('[data-tab="preferences"]');
          if (prefTab) prefTab.click();
          else console.warn("Preferences tab not found");
        }, 100);
        break;
      case "help":
        window.location.href = "/help";
        break;
      case "logout":
        this.handleLogout();
        break;
    }
  }

  handleRefresh() {
    this.loadDashboardData();
    this.showToast("success", "Refresh", "Dashboard data updated");
  }

  handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      this.handleCustomerLookup();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault();
      this.switchSection("dashboard");
    }
  }

  handleWindowResize() {
    const sidebar = document.querySelector(".sidebar");
    const isMobile = window.innerWidth <= 768;
    if (sidebar) {
      if (isMobile) sidebar.classList.add("mobile");
      else sidebar.classList.remove("mobile");
    } else {
      console.warn("Sidebar not found");
    }
  }

  handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/index";
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.salesDashboard = new SalesDashboard();
});

// Export for potential module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = SalesDashboard;
}
