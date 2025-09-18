/**
 * Kings Collection Sales Dashboard
 * Enhanced JavaScript functionality with modern ES6+ features
 * Version: 2.0.3
 * Updated: Added click-based dropdown toggling for user menu and nav bar, improved accessibility, fixed hover issue
 */

class SalesDashboard {
  constructor() {
    this.currentSection = "dashboard";
    this.currentTime = new Date();
    this.cartItems = new Map();
    this.notifications = [];
    this.tasks = [];
    this.promotions = [];
    this.taxRate = 0.085; // Configurable tax rate
    this.locale = "en-US"; // Configurable locale

    this.init();
  }

  init() {
    this.initializeClock();
    this.initializeNavigation();
    this.initializeQuickActions();
    this.initializePOS();
    this.initializeModals();
    this.initializeDropdowns(); // Replaced initializeNotifications
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
        this.switchSection(targetSection);
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
   * Dropdown System (User Menu and Nav Bar)
   */
  initializeDropdowns() {
    // User Menu Dropdown
    const userMenu = document.querySelector(".user-menu");
    const userDropdown = document.querySelector(".dropdown-menu");

    if (userMenu && userDropdown) {
      userMenu.setAttribute("tabindex", "0"); // Make focusable
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

      // Handle user menu item clicks
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

    // Navigation Bar Dropdowns
    const navItems = document.querySelectorAll(".top-nav .nav-item");
    navItems.forEach((item) => {
      const dropdown = item.querySelector(".nav-dropdown");
      if (dropdown) {
        item.setAttribute("tabindex", "0"); // Make focusable
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

        // Handle nav dropdown item clicks
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

    // Close dropdowns when clicking outside
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

    // Prevent dropdown closure when clicking inside
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
    const quickActions = document.querySelectorAll(".action-btn");
    quickActions.forEach((action) => {
      action.addEventListener("click", (e) => {
        e.preventDefault();
        if (action.classList.contains("new-order")) {
          this.handleNewOrder();
        } else if (action.classList.contains("pos")) {
          this.switchSection("pos");
        } else if (action.classList.contains("customer-lookup")) {
          this.handleCustomerLookup();
        } else {
          const actionName =
            action.querySelector("span")?.textContent || "Action";
          this.showToast("info", "Quick Action", `${actionName} clicked`);
        }
      });
    });
  }

  handleNewOrder() {
    this.showModal("orderModal", "Create New Order", this.getNewOrderContent());
  }

  handleCustomerLookup() {
    const searchTerm = prompt("Enter customer name, email, or order number:");
    if (searchTerm) {
      this.searchCustomers(searchTerm);
    }
  }

  searchCustomers(searchTerm) {
    this.showLoading();
    setTimeout(() => {
      this.hideLoading();
      this.switchSection("customers");
      this.showToast(
        "success",
        "Customer Search",
        `Found customers matching "${searchTerm}"`
      );
    }, 1500);
  }

  /**
   * Point of Sale System
   */
  initializePOS() {
    this.initializeProductSearch();
    this.initializeProductGrid();
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
    this.showToast("info", "Barcode Scan", `Scanning barcode: ${barcode}`);
    setTimeout(() => {
      const mockProduct = {
        id: barcode,
        name: "Scanned Product",
        price: 99.99,
        stock: 12,
      };
      this.addToCart(mockProduct);
    }, 500);
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
              <div class="item-price">$${item.price.toFixed(2)}</div>
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
            <div class="item-total">$${item.total.toFixed(2)}</div>
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

  updateCartTotals(subtotal, tax, total) {
    const subtotalElement = document.querySelector(".subtotal");
    const taxElement = document.querySelector(".tax-amount");
    const totalElement = document.querySelector(".total-amount");

    if (subtotalElement) {
      subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    } else {
      console.warn("Subtotal element not found");
    }
    if (taxElement) {
      taxElement.textContent = `$${tax.toFixed(2)}`;
    } else {
      console.warn("Tax element not found");
    }
    if (totalElement) {
      totalElement.textContent = `$${total.toFixed(2)}`;
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
          changeElement.textContent = `Change: $${change.toFixed(2)}`;
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

    this.showLoading();
    setTimeout(() => {
      this.hideLoading();
      const receiptData = {
        id: "RCP-" + Date.now(),
        items: Array.from(this.cartItems.values()),
        total: totalAmount,
        paymentMethod: paymentMethod,
        timestamp: new Date(),
      };
      this.clearCart();
      this.showToast(
        "success",
        "Sale Complete",
        `Transaction completed - $${totalAmount.toFixed(2)}`
      );
      this.showReceiptModal(receiptData);
    }, 2000);
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
    let heldSales = JSON.parse(localStorage.getItem("heldSales") || "[]");
    heldSales.push(saleData);
    localStorage.setItem("heldSales", JSON.stringify(heldSales));
  }

  showReceiptModal(receiptData) {
    const receiptContent = this.generateReceiptContent(receiptData);
    this.showModal("receiptModal", "Transaction Receipt", receiptContent);
  }

  generateReceiptContent(data) {
    let itemsHTML = "";
    data.items.forEach((item) => {
      itemsHTML += `
        <div class="receipt-item">
          <span class="item-name">${item.name}</span>
          <span class="item-qty">x${item.quantity}</span>
          <span class="item-total">$${item.total.toFixed(2)}</span>
        </div>
      `;
    });

    return `
      <div class="receipt-content">
        <div class="receipt-header">
          <h4>Kings Collection</h4>
          <p>Receipt #${data.id}</p>
          <p>${data.timestamp.toLocaleString()}</p>
        </div>
        <div class="receipt-items">
          ${itemsHTML}
        </div>
        <div class="receipt-total">
          <strong>Total: $${data.total.toFixed(2)}</strong>
        </div>
        <div class="receipt-payment">
          <p>Paid with: ${data.paymentMethod}</p>
        </div>
        <div class="receipt-footer">
          <p>Thank you for your business!</p>
        </div>
      </div>
    `;
  }

  /**
   * Modal System
   */
  initializeModals() {
    const modalOverlays = document.querySelectorAll(".modal-overlay");
    modalOverlays.forEach((modal) => {
      const closeBtn = modal.querySelector(".modal-close");
      const cancelBtn = modal.querySelector(".modal-cancel");

      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.hideModal(modal.id);
      });

      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.hideModal(modal.id));
      }
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => this.hideModal(modal.id));
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const activeModal = document.querySelector(".modal-overlay.active");
        if (activeModal) this.hideModal(activeModal.id);
      }
    });
  }

  showModal(modalId, title, content) {
    const modal = document.getElementById(modalId);
    if (modal) {
      const titleElement = modal.querySelector(".modal-header h3");
      const bodyElement = modal.querySelector(".modal-body");

      if (titleElement) {
        titleElement.textContent = title;
        titleElement.setAttribute("id", `${modalId}-title`);
        modal.setAttribute("aria-labelledby", `${modalId}-title`);
      }
      if (bodyElement) bodyElement.innerHTML = content;

      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.classList.add("active");

      const firstFocusable = modal.querySelector(
        "button, input, select, textarea"
      );
      if (firstFocusable) firstFocusable.focus();
    } else {
      console.warn(`Modal ${modalId} not found`);
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  }

  getNewOrderContent() {
    return `
      <div class="order-form">
        <div class="form-group">
          <label for="customerSelect">Customer</label>
          <select id="customerSelect" class="form-input">
            <option value="">Select Customer</option>
            <option value="1">John Smith</option>
            <option value="2">Sarah Johnson</option>
            <option value="3">Mike Wilson</option>
          </select>
        </div>
        <div class="form-group">
          <label for="orderType">Order Type</label>
          <select id="orderType" class="form-input">
            <option value="standard">Standard Delivery</option>
            <option value="express">Express Delivery</option>
            <option value="pickup">Store Pickup</option>
          </select>
        </div>
        <div class="form-group">
          <label for="orderNotes">Order Notes</label>
          <textarea id="orderNotes" class="form-input" rows="3" placeholder="Special instructions..."></textarea>
        </div>
      </div>
    `;
  }

  /**
   * Notification System
   */
  loadNotifications() {
    // Mock data; replace with API call for production
    this.notifications = [
      {
        id: 1,
        type: "urgent",
        title: "Urgent Order",
        message: "Order #ORD-2024-1234 is overdue",
        time: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
      },
      {
        id: 2,
        type: "message",
        title: "Customer Inquiry",
        message: "New message from John Smith",
        time: new Date(Date.now() - 12 * 60 * 1000),
        read: false,
      },
    ];
    this.updateNotificationBadge();
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
   * Loading States
   */
  showLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
      loadingOverlay.classList.add("active");
    } else {
      console.warn("Loading overlay not found");
    }
  }

  hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
      loadingOverlay.classList.remove("active");
    }
  }

  /**
   * Chart Initialization
   */
  initializeCharts() {
    // Requires Chart.js: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    this.initializeSalesChart();
    this.initializeCustomerChart();
    this.initializePerformanceChart();
  }

  initializeSalesChart() {
    const canvas = document.getElementById("salesChart");
    if (!canvas) {
      console.warn("Sales chart canvas not found");
      return;
    }
    // Mock Chart.js implementation; replace with real data
    new Chart(canvas, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Sales Trend",
            data: [1200, 1900, 3000, 2500, 4000, 3500],
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
  }

  initializeCustomerChart() {
    const canvas = document.getElementById("customerChart");
    if (!canvas) {
      console.warn("Customer chart canvas not found");
      return;
    }
    // Mock Chart.js implementation; replace with real data
    new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        datasets: [
          {
            label: "Customer Growth",
            data: [150, 300, 450, 600],
            backgroundColor: "rgba(198, 79, 240, 0.5)",
          },
        ],
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  initializePerformanceChart() {
    const canvas = document.getElementById("performanceChart");
    if (!canvas) {
      console.warn("Performance chart canvas not found");
      return;
    }
    // Mock Chart.js implementation; replace with real data
    new Chart(canvas, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        datasets: [
          {
            label: "Performance",
            data: [80, 85, 90, 88, 92],
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
  }

  /**
   * Data Loading and Management
   */
  loadDashboardData() {
    this.updateDashboardStats();
    this.loadRecentActivity();
    this.loadPriorityTasks();
  }

  loadSectionData(sectionId) {
    switch (sectionId) {
      case "orders":
        this.loadOrdersData();
        break;
      case "customers":
        this.loadCustomersData();
        break;
      case "inventory":
        this.loadInventoryData();
        break;
      case "tasks":
        this.loadTasksData();
        break;
      case "promotions":
        this.loadPromotionsData();
        break;
      // Admin-specific sections (placeholder for owner dashboard)
      case "analytics":
        this.loadAnalyticsData();
        break;
      case "employees":
        this.loadEmployeeData();
        break;
      case "financials":
        this.loadFinancialData();
        break;
      case "marketing":
        this.loadMarketingData();
        break;
      default:
        break;
    }
  }

  updateDashboardStats() {
    this.animateCounter(".stat-number", [24, 3200, 18]);
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
            ? "$" + Math.floor(current).toLocaleString()
            : Math.floor(current);
        }, 20);
      }
    });
  }

  loadRecentActivity() {
    // Mock data; replace with API call
    const activities = [
      {
        type: "order",
        customer: "John Smith",
        action: "placed a new order",
        orderId: "#ORD-2024-1237",
        time: "2 minutes ago",
        avatar:
          "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=40",
      },
      {
        type: "shipping",
        customer: "Sarah Johnson",
        action: "was shipped to",
        orderId: "#ORD-2024-1230",
        time: "15 minutes ago",
        icon: "fa-truck",
      },
      {
        type: "review",
        customer: "Mike Wilson",
        action: "left a 5-star review",
        time: "1 hour ago",
        icon: "fa-star",
      },
    ];
    // Update DOM with activities
  }

  loadPriorityTasks() {
    this.tasks = [
      {
        id: 1,
        title: "Follow up on Order #ORD-2024-1234",
        description: "Customer John Smith waiting for missing item update",
        priority: "high",
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: "urgent",
        assignee: "me",
      },
      {
        id: 2,
        title: "Restock Low Inventory Items",
        description: "Check and reorder 23 items that are running low",
        priority: "medium",
        dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
        status: "today",
        assignee: "me",
      },
    ];
  }

  loadOrdersData() {
    console.log("Loading orders data..."); // Replace with API call
  }

  loadCustomersData() {
    console.log("Loading customers data..."); // Replace with API call
  }

  loadInventoryData() {
    console.log("Loading inventory data..."); // Replace with API call
  }

  loadTasksData() {
    console.log("Loading tasks data..."); // Replace with API call
  }

  loadPromotionsData() {
    this.promotions = [
      {
        id: 1,
        title: "Summer Sale 2024",
        code: "SUMMER30",
        discount: "30% OFF",
        description: "All summer collection items",
        validUntil: "2024-06-30",
        uses: 234,
        revenue: 12500,
        featured: true,
      },
      {
        id: 2,
        title: "Buy 2 Get 1 Free",
        code: "BUY2GET1",
        discount: "BOGO Offer",
        description: "Selected shirts and accessories",
        validUntil: "2024-03-31",
        uses: 67,
        revenue: 3200,
        featured: false,
      },
    ];
  }

  // Admin-specific methods (placeholders for owner dashboard)
  loadAnalyticsData() {
    console.log("Loading analytics data..."); // Replace with API call
  }

  loadEmployeeData() {
    console.log("Loading employee data..."); // Replace with API call
  }

  loadFinancialData() {
    console.log("Loading financial data..."); // Replace with API call
  }

  loadMarketingData() {
    console.log("Loading marketing data..."); // Replace with API call
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
        this.showHelpModal();
        break;
      case "logout":
        this.handleLogout();
        break;
    }
  }

  handleRefresh() {
    this.showLoading();
    setTimeout(() => {
      this.loadDashboardData();
      this.hideLoading();
      this.showToast("success", "Refresh", "Dashboard data updated");
    }, 1000);
  }

  handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      this.handleNewOrder();
    }
    if (e.key === "F1") {
      e.preventDefault();
      this.switchSection("pos");
    }
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

  showHelpModal() {
    const helpContent = `
      <div class="help-content">
        <h4>Keyboard Shortcuts</h4>
        <ul>
          <li><kbd>Ctrl+N</kbd> - New Order</li>
          <li><kbd>F1</kbd> - Open POS</li>
          <li><kbd>Ctrl+F</kbd> - Search Customers</li>
          <li><kbd>Ctrl+D</kbd> - Dashboard</li>
          <li><kbd>Esc</kbd> - Close Modals</li>
        </ul>
        <h4>Support</h4>
        <p>For technical support, contact:</p>
        <ul>
          <li>Email: support@kingscollection.com</li>
          <li>Phone: +1 (555) 123-4567</li>
          <li>Hours: 9 AM - 6 PM EST</li>
        </ul>
      </div>
    `;
    this.showModal("helpModal", "Help & Support", helpContent);
  }

  handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
      this.showLoading();
      setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }, 1500);
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
