// Sales Agent Dashboard Management System
class SalesAgentDashboard {
  constructor() {
    this.currentSection = "overview";
    this.orders = this.loadOrders();
    this.customers = this.loadCustomers();
    this.inquiries = this.loadInquiries();
    this.returns = this.loadReturns();
    this.inventory = this.loadInventory();
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupOrderManagement();
    this.setupCustomerManagement();
    this.setupInquiryManagement();
    this.setupReturnManagement();
    this.setupInventoryManagement();
    this.setupAnalytics();
    this.setupTools();
    this.setupModals();
    this.setupNotifications();
    this.updateDashboardStats();
    this.initializeCharts();
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

    // Quick action buttons
    const quickActions = document.querySelectorAll(".action-btn");
    quickActions.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleQuickAction(e.target);
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

      // Load section-specific data
      this.loadSectionData(sectionName);

      // Scroll to top of content
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  updateActiveNav(activeItem) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => item.classList.remove("active"));
    activeItem.classList.add("active");
  }

  loadSectionData(sectionName) {
    switch (sectionName) {
      case "overview":
        this.updateOverviewMetrics();
        break;
      case "orders":
        this.refreshOrderQueue();
        break;
      case "customers":
        this.refreshCustomerList();
        break;
      case "inquiries":
        this.refreshInquiries();
        break;
      case "returns":
        this.refreshReturns();
        break;
      case "inventory":
        this.refreshInventory();
        break;
      case "analytics":
        this.updateAnalytics();
        break;
    }
  }

  // Order Management
  setupOrderManagement() {
    // Bulk actions
    const bulkSelect = document.querySelector(".bulk-select");
    const bulkBtns = document.querySelectorAll(".bulk-btn");

    if (bulkSelect) {
      bulkSelect.addEventListener("change", (e) => {
        this.toggleAllOrders(e.target.checked);
      });
    }

    bulkBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleBulkAction(e.target);
      });
    });

    // Order filters
    const orderFilters = document.querySelectorAll(
      ".order-filters select, .order-filters input"
    );
    orderFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        this.filterOrders();
      });
      filter.addEventListener("input", () => {
        this.filterOrders();
      });
    });

    // Individual order actions
    const orderActions = document.querySelectorAll(
      ".order-actions .action-btn"
    );
    orderActions.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleOrderAction(e.target);
      });
    });

    // Order checkboxes
    const orderCheckboxes = document.querySelectorAll(".order-checkbox input");
    orderCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateBulkActions();
      });
    });
  }

  toggleAllOrders(checked) {
    const orderCheckboxes = document.querySelectorAll(".order-checkbox input");
    orderCheckboxes.forEach((checkbox) => {
      checkbox.checked = checked;
    });
    this.updateBulkActions();
  }

  handleBulkAction(button) {
    const selectedOrders = this.getSelectedOrders();
    const action = button.textContent.trim();

    if (selectedOrders.length === 0) {
      this.showToast("Please select orders first", "warning");
      return;
    }

    switch (action) {
      case "Mark as Processed":
        this.bulkProcessOrders(selectedOrders);
        break;
      case "Print Labels":
        this.bulkPrintLabels(selectedOrders);
        break;
      case "Ship Selected":
        this.bulkShipOrders(selectedOrders);
        break;
    }
  }

  handleOrderAction(button) {
    const orderItem = button.closest(".order-item");
    const orderNumber = orderItem.querySelector(".order-number").textContent;
    const action = button.textContent.trim();

    switch (action) {
      case "Process":
        this.processOrder(orderNumber);
        break;
      case "Ship":
      case "Ship Now":
        this.shipOrder(orderNumber);
        break;
      case "View":
        this.viewOrderDetails(orderNumber);
        break;
      case "Message":
        this.messageCustomer(orderNumber);
        break;
      case "Label":
        this.printLabel(orderNumber);
        break;
      case "Track":
        this.trackOrder(orderNumber);
        break;
    }
  }

  processOrder(orderNumber) {
    this.showToast(`Processing order ${orderNumber}...`, "info");

    // Simulate processing
    setTimeout(() => {
      this.updateOrderStatus(orderNumber, "processing");
      this.showToast(`Order ${orderNumber} marked as processing`, "success");
    }, 1000);
  }

  shipOrder(orderNumber) {
    this.showToast(`Shipping order ${orderNumber}...`, "info");

    // Simulate shipping
    setTimeout(() => {
      this.updateOrderStatus(orderNumber, "shipped");
      this.showToast(`Order ${orderNumber} has been shipped`, "success");
    }, 1500);
  }

  viewOrderDetails(orderNumber) {
    this.openModal("orderModal", {
      title: `Order Details - ${orderNumber}`,
      content: this.generateOrderDetailsHTML(orderNumber),
    });
  }

  // Customer Management
  setupCustomerManagement() {
    const customerSearch = document.querySelector(".customer-search input");
    const customerFilters = document.querySelectorAll(
      ".customer-search select"
    );
    const customerActions = document.querySelectorAll(".customer-actions .btn");

    if (customerSearch) {
      customerSearch.addEventListener("input", () => {
        this.filterCustomers();
      });
    }

    customerFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        this.filterCustomers();
      });
    });

    customerActions.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleCustomerAction(e.target);
      });
    });
  }

  handleCustomerAction(button) {
    const customerCard = button.closest(".customer-card");
    const customerName =
      customerCard.querySelector(".customer-name").textContent;
    const action = button.textContent.trim();

    switch (action) {
      case "Message":
        this.messageCustomer(customerName);
        break;
      case "View Profile":
        this.viewCustomerProfile(customerName);
        break;
      case "Order History":
        this.viewCustomerOrderHistory(customerName);
        break;
      case "Welcome Offer":
        this.sendWelcomeOffer(customerName);
        break;
    }
  }

  messageCustomer(customer) {
    this.openModal("customerModal", {
      title: `Message Customer - ${customer}`,
      content: this.generateMessageFormHTML(customer),
    });
  }

  viewCustomerProfile(customerName) {
    this.openModal("customerModal", {
      title: `Customer Profile - ${customerName}`,
      content: this.generateCustomerProfileHTML(customerName),
    });
  }

  // Inquiry Management
  setupInquiryManagement() {
    const inquiryFilters = document.querySelectorAll(".inquiry-filters select");
    const inquiryActions = document.querySelectorAll(".inquiry-actions .btn");

    inquiryFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        this.filterInquiries();
      });
    });

    inquiryActions.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleInquiryAction(e.target);
      });
    });
  }

  handleInquiryAction(button) {
    const inquiryItem = button.closest(".inquiry-item");
    const customerName =
      inquiryItem.querySelector(".customer-name").textContent;
    const subject = inquiryItem.querySelector(".inquiry-subject").textContent;
    const action = button.textContent.trim();

    switch (action) {
      case "Respond":
        this.respondToInquiry(customerName, subject);
        break;
      case "View Full":
        this.viewFullInquiry(customerName, subject);
        break;
      case "Call Customer":
        this.callCustomer(customerName);
        break;
      case "Size Guide":
        this.showSizeGuide();
        break;
    }
  }

  respondToInquiry(customer, subject) {
    this.showToast(`Opening response form for ${customer}`, "info");
    // Implementation for response form
  }

  // Return Management
  setupReturnManagement() {
    const returnFilters = document.querySelectorAll(".return-filters select");
    const returnActions = document.querySelectorAll(".return-actions .btn");

    returnFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        this.filterReturns();
      });
    });

    returnActions.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleReturnAction(e.target);
      });
    });
  }

  handleReturnAction(button) {
    const returnItem = button.closest(".return-item");
    const returnNumber = returnItem.querySelector(".return-number").textContent;
    const action = button.textContent.trim();

    switch (action) {
      case "Approve":
        this.approveReturn(returnNumber);
        break;
      case "Decline":
        this.declineReturn(returnNumber);
        break;
      case "Process Return":
        this.processReturn(returnNumber);
        break;
      case "Print Label":
        this.printReturnLabel(returnNumber);
        break;
      case "Message Customer":
        this.messageCustomerAboutReturn(returnNumber);
        break;
      case "View Details":
        this.viewReturnDetails(returnNumber);
        break;
    }
  }

  approveReturn(returnNumber) {
    this.showToast(`Approving return ${returnNumber}...`, "info");

    setTimeout(() => {
      this.updateReturnStatus(returnNumber, "approved");
      this.showToast(`Return ${returnNumber} has been approved`, "success");
    }, 1000);
  }

  // Inventory Management
  setupInventoryManagement() {
    const inventorySearch = document.querySelector(".inventory-search input");
    const inventoryActions = document.querySelectorAll(
      ".inventory-actions .btn"
    );
    const scanBarcodeBtn = document.querySelector(".inventory-search .btn");

    if (inventorySearch) {
      inventorySearch.addEventListener("input", () => {
        this.filterInventory();
      });
    }

    if (scanBarcodeBtn) {
      scanBarcodeBtn.addEventListener("click", () => {
        this.scanBarcode();
      });
    }

    inventoryActions.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleInventoryAction(e.target);
      });
    });
  }

  handleInventoryAction(button) {
    const inventoryItem = button.closest(".inventory-item");
    const productName =
      inventoryItem.querySelector(".product-name").textContent;
    const action = button.textContent.trim();

    switch (action) {
      case "Restock":
        this.restockProduct(productName);
        break;
      case "Update":
        this.updateProductInfo(productName);
        break;
      case "View Details":
        this.viewProductDetails(productName);
        break;
      case "View All":
        this.viewAllProducts(button.closest(".stat-card"));
        break;
    }
  }

  scanBarcode() {
    this.showToast("Barcode scanner activated", "info");
    // Implementation for barcode scanning
  }

  // Analytics
  setupAnalytics() {
    const analyticsFilters = document.querySelectorAll(
      ".analytics-filters select"
    );
    const exportBtns = document.querySelectorAll(".card-actions .btn");

    analyticsFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        this.updateAnalytics();
      });
    });

    exportBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (btn.textContent.includes("Export")) {
          this.exportData();
        }
      });
    });
  }

  initializeCharts() {
    // Initialize performance chart
    const performanceCtx = document.getElementById("performanceChart");
    if (performanceCtx) {
      this.createPerformanceChart(performanceCtx);
    }

    // Initialize metric charts
    const metricCharts = document.querySelectorAll(".metric-chart canvas");
    metricCharts.forEach((canvas) => {
      this.createMiniChart(canvas);
    });
  }

  createPerformanceChart(ctx) {
    // Simulated chart creation (would use Chart.js in real implementation)
    const canvas = ctx.getContext("2d");
    canvas.fillStyle = "#3498db";
    canvas.fillRect(0, 0, ctx.width, ctx.height);
  }

  createMiniChart(canvas) {
    // Simulated mini chart creation
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(0, 20, canvas.width, 20);
  }

  // Tools
  setupTools() {
    const toolBtns = document.querySelectorAll(".tool-action .btn");

    toolBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.launchTool(e.target);
      });
    });
  }

  launchTool(button) {
    const toolCard = button.closest(".tool-card");
    const toolTitle = toolCard.querySelector(".tool-title").textContent;

    this.showToast(`Launching ${toolTitle}...`, "info");

    // Simulate tool launch
    setTimeout(() => {
      this.showToast(`${toolTitle} is now ready`, "success");
    }, 1500);
  }

  // Modal Management
  setupModals() {
    const modalCloses = document.querySelectorAll(".modal-close");
    const modalOverlays = document.querySelectorAll(".modal-overlay");

    modalCloses.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.closeModal(btn.closest(".modal-overlay"));
      });
    });

    modalOverlays.forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay);
        }
      });
    });
  }

  openModal(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (options.title) {
      const titleElement = modal.querySelector(".modal-header h3");
      if (titleElement) titleElement.textContent = options.title;
    }

    if (options.content) {
      const bodyElement = modal.querySelector(".modal-body");
      if (bodyElement) bodyElement.innerHTML = options.content;
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal(modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Notification System
  setupNotifications() {
    const notificationIcon = document.querySelector(".notifications-icon");

    if (notificationIcon) {
      notificationIcon.addEventListener("click", () => {
        this.showNotificationPanel();
      });
    }

    // Auto-update notifications
    setInterval(() => {
      this.updateNotificationCount();
    }, 30000); // Update every 30 seconds
  }

  showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="toast-icon fas ${this.getToastIcon(type)}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    `;

    toastContainer.appendChild(toast);

    // Setup close button
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => {
      this.removeToast(toast);
    });

    // Show toast
    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeToast(toast);
    }, 5000);
  }

  getToastIcon(type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };
    return icons[type] || icons.info;
  }

  removeToast(toast) {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  // Quick Actions
  handleQuickAction(button) {
    const action = button.textContent.trim();

    switch (action) {
      case "New Order":
        this.createNewOrder();
        break;
      case "Find Customer":
        this.switchSection("customers");
        break;
      case "Check Inventory":
        this.switchSection("inventory");
        break;
      case "Print Labels":
        this.printLabels();
        break;
      case "Export Data":
        this.exportData();
        break;
    }
  }

  createNewOrder() {
    this.showToast("Opening new order form...", "info");
    // Implementation for new order creation
  }

  printLabels() {
    this.showToast("Preparing labels for printing...", "info");
    // Implementation for label printing
  }

  exportData() {
    this.showToast("Exporting data...", "info");

    setTimeout(() => {
      this.showToast("Data export completed", "success");
    }, 2000);
  }

  // Data Management
  updateDashboardStats() {
    // Update header stats
    this.updateHeaderStats();

    // Update navigation counts
    this.updateNavigationCounts();

    // Update overview metrics
    this.updateOverviewMetrics();
  }

  updateHeaderStats() {
    const pendingOrders = this.orders.filter(
      (order) => order.status === "new"
    ).length;
    const newInquiries = this.inquiries.filter(
      (inquiry) => inquiry.status === "new"
    ).length;
    const ordersToday = this.orders.filter((order) =>
      this.isToday(order.date)
    ).length;

    // Update header stat numbers
    const statNumbers = document.querySelectorAll(".header-stats .stat-number");
    if (statNumbers[0]) statNumbers[0].textContent = pendingOrders;
    if (statNumbers[1]) statNumbers[1].textContent = newInquiries;
    if (statNumbers[2]) statNumbers[2].textContent = ordersToday;
  }

  updateNavigationCounts() {
    const overviewCount = this.orders.filter(
      (order) => order.status === "new"
    ).length;
    const orderCount = this.orders.filter((order) =>
      ["new", "processing"].includes(order.status)
    ).length;
    const inquiryCount = this.inquiries.filter(
      (inquiry) => inquiry.status === "new"
    ).length;
    const returnCount = this.returns.filter(
      (ret) => ret.status === "pending"
    ).length;

    this.updateNavCount("overview", overviewCount);
    this.updateNavCount("orders", orderCount);
    this.updateNavCount("inquiries", inquiryCount);
    this.updateNavCount("returns", returnCount);
  }

  updateNavCount(section, count) {
    const navItem = document.querySelector(
      `[data-section="${section}"] .count`
    );
    if (navItem && count > 0) {
      navItem.textContent = count;
      navItem.style.display = "inline-block";
    } else if (navItem) {
      navItem.style.display = "none";
    }
  }

  // Filter Functions
  filterOrders() {
    const statusFilter = document.querySelector(".order-filters select").value;
    const searchTerm = document
      .querySelector(".order-filters input")
      .value.toLowerCase();
    const orderItems = document.querySelectorAll(".order-item");

    orderItems.forEach((item) => {
      const orderNumber = item
        .querySelector(".order-number")
        .textContent.toLowerCase();
      const customerName = item
        .querySelector(".order-customer")
        .textContent.toLowerCase();
      const status = item
        .querySelector(".status-badge")
        .textContent.toLowerCase();

      const matchesStatus =
        statusFilter === "all" || status.includes(statusFilter);
      const matchesSearch =
        orderNumber.includes(searchTerm) || customerName.includes(searchTerm);

      if (matchesStatus && matchesSearch) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  }

  filterCustomers() {
    const typeFilter = document.querySelector(".customer-search select").value;
    const searchTerm = document
      .querySelector(".customer-search input")
      .value.toLowerCase();
    const customerCards = document.querySelectorAll(".customer-card");

    customerCards.forEach((card) => {
      const customerName = card
        .querySelector(".customer-name")
        .textContent.toLowerCase();
      const customerEmail = card
        .querySelector(".customer-email")
        .textContent.toLowerCase();
      const isVip = card.classList.contains("vip");
      const isNew = card.classList.contains("new");

      let matchesType = true;
      if (typeFilter === "vip") matchesType = isVip;
      else if (typeFilter === "new") matchesType = isNew;

      const matchesSearch =
        customerName.includes(searchTerm) || customerEmail.includes(searchTerm);

      if (matchesType && matchesSearch) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  // Utility Functions
  isToday(date) {
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Data Loading Functions
  loadOrders() {
    // Simulated order data
    return [
      {
        id: "ORD-2024-1234",
        customer: "John Smith",
        date: new Date(),
        status: "new",
        total: 299.97,
        items: 3,
        priority: "high",
      },
      {
        id: "ORD-2024-1235",
        customer: "Sarah Johnson",
        date: new Date(Date.now() - 3600000),
        status: "processing",
        total: 189.98,
        items: 2,
        priority: "normal",
      },
    ];
  }

  loadCustomers() {
    return [
      {
        name: "John Smith",
        email: "john.smith@email.com",
        type: "vip",
        orders: 24,
        spent: 2450,
      },
    ];
  }

  loadInquiries() {
    return [
      {
        customer: "John Smith",
        subject: "Order Issue",
        status: "new",
        priority: "urgent",
        date: new Date(),
      },
    ];
  }

  loadReturns() {
    return [
      {
        id: "RTN-2024-001",
        orderId: "ORD-2024-1200",
        status: "pending",
        value: 89.99,
        reason: "Wrong Size",
      },
    ];
  }

  loadInventory() {
    return [
      {
        name: "Classic White Shirt",
        sku: "CWS-001",
        category: "Shirts",
        stock: 6,
        status: "low",
      },
    ];
  }

  // HTML Generators
  generateOrderDetailsHTML(orderNumber) {
    return `
      <div class="order-details-content">
        <h4>Order Information</h4>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Customer:</strong> John Smith</p>
        <p><strong>Status:</strong> Processing</p>
        <p><strong>Total:</strong> $299.97</p>
        
        <h4>Items</h4>
        <div class="order-items-list">
          <div class="item">
            <span>Classic White Shirt - Size L</span>
            <span>$89.99</span>
          </div>
          <div class="item">
            <span>Denim Jacket - Size M</span>
            <span>$129.99</span>
          </div>
        </div>
      </div>
    `;
  }

  generateCustomerProfileHTML(customerName) {
    return `
      <div class="customer-profile-content">
        <h4>Customer Information</h4>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Email:</strong> john.smith@email.com</p>
        <p><strong>Phone:</strong> +1 (555) 123-4567</p>
        <p><strong>Total Orders:</strong> 24</p>
        <p><strong>Total Spent:</strong> $2,450</p>
        <p><strong>Customer Since:</strong> January 2023</p>
      </div>
    `;
  }

  generateMessageFormHTML(customer) {
    return `
      <div class="message-form">
        <div class="form-group">
          <label>To: ${customer}</label>
        </div>
        <div class="form-group">
          <label>Subject:</label>
          <input type="text" class="form-control" placeholder="Enter subject">
        </div>
        <div class="form-group">
          <label>Message:</label>
          <textarea class="form-control" rows="5" placeholder="Type your message here..."></textarea>
        </div>
      </div>
    `;
  }

  // Update Functions
  updateOrderStatus(orderNumber, newStatus) {
    const orderItem = document.querySelector(`[data-order="${orderNumber}"]`);
    if (orderItem) {
      const statusBadge = orderItem.querySelector(".status-badge");
      if (statusBadge) {
        statusBadge.textContent =
          newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        statusBadge.className = `status-badge ${newStatus}`;
      }
    }
  }

  updateReturnStatus(returnNumber, newStatus) {
    const returnItem = document.querySelector(
      `[data-return="${returnNumber}"]`
    );
    if (returnItem) {
      const statusBadge = returnItem.querySelector(".status-badge");
      if (statusBadge) {
        statusBadge.textContent =
          newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        statusBadge.className = `status-badge ${newStatus}`;
      }
    }
  }

  updateOverviewMetrics() {
    // Update metric cards with current data
    const metricNumbers = document.querySelectorAll(".metric-number");
    if (metricNumbers[0]) metricNumbers[0].textContent = "156";
    if (metricNumbers[1]) metricNumbers[1].textContent = "$24,580";
    if (metricNumbers[2]) metricNumbers[2].textContent = "89";
    if (metricNumbers[3]) metricNumbers[3].textContent = "4.8";
  }

  // Refresh Functions
  refreshOrderQueue() {
    this.filterOrders();
    this.updateBulkActions();
  }

  refreshCustomerList() {
    this.filterCustomers();
  }

  refreshInquiries() {
    this.filterInquiries();
  }

  refreshReturns() {
    this.filterReturns();
  }

  refreshInventory() {
    this.filterInventory();
  }

  updateAnalytics() {
    // Refresh analytics charts and data
    this.initializeCharts();
  }

  // Helper Functions
  getSelectedOrders() {
    const selectedCheckboxes = document.querySelectorAll(
      ".order-checkbox input:checked"
    );
    return Array.from(selectedCheckboxes).map((checkbox) => {
      return checkbox.closest(".order-item").querySelector(".order-number")
        .textContent;
    });
  }

  updateBulkActions() {
    const selectedCount = this.getSelectedOrders().length;
    const bulkActions = document.querySelector(".bulk-actions");

    if (bulkActions) {
      if (selectedCount > 0) {
        bulkActions.style.opacity = "1";
        bulkActions.style.pointerEvents = "auto";
      } else {
        bulkActions.style.opacity = "0.5";
        bulkActions.style.pointerEvents = "none";
      }
    }
  }

  updateNotificationCount() {
    const notificationCount = document.querySelector(".notification-count");
    if (notificationCount) {
      // Simulate dynamic notification count
      const count = Math.floor(Math.random() * 20) + 5;
      notificationCount.textContent = count;
    }
  }
}

// Initialize Dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const dashboard = new SalesAgentDashboard();

  // Make dashboard globally available for debugging
  window.salesDashboard = dashboard;

  // Add some interactive enhancements
  addInteractiveEnhancements();
});

// Additional Interactive Features
function addInteractiveEnhancements() {
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

  // Enhanced hover effects for cards
  const cards = document.querySelectorAll(
    ".metric-card, .task-card, .customer-card, .tool-card"
  );
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  // Loading states for buttons
  const buttons = document.querySelectorAll(".btn, .action-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (!this.classList.contains("loading")) {
        this.classList.add("loading");
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

        setTimeout(() => {
          this.classList.remove("loading");
          this.innerHTML = originalText;
        }, 1500);
      }
    });
  });

  // Dynamic time updates
  updateTimeElements();
  setInterval(updateTimeElements, 60000); // Update every minute

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "1":
          e.preventDefault();
          document.querySelector('[data-section="overview"]').click();
          break;
        case "2":
          e.preventDefault();
          document.querySelector('[data-section="orders"]').click();
          break;
        case "3":
          e.preventDefault();
          document.querySelector('[data-section="customers"]').click();
          break;
        case "f":
          e.preventDefault();
          const searchInput = document.querySelector(".search-input");
          if (searchInput) searchInput.focus();
          break;
      }
    }
  });

  // Auto-save functionality for forms
  const formInputs = document.querySelectorAll("input, textarea, select");
  formInputs.forEach((input) => {
    input.addEventListener("change", () => {
      // Simulate auto-save
      showAutoSaveIndicator();
    });
  });
}

function updateTimeElements() {
  const timeElements = document.querySelectorAll(
    ".task-time, .inquiry-time, .time-elapsed"
  );
  timeElements.forEach((element) => {
    // Update relative time displays
    const text = element.textContent;
    if (text.includes("ago") || text.includes("overdue")) {
      // Simulate time updates
      element.style.opacity = "0.8";
      setTimeout(() => {
        element.style.opacity = "1";
      }, 200);
    }
  });
}

function showAutoSaveIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "auto-save-indicator";
  indicator.innerHTML = '<i class="fas fa-check"></i> Saved';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2ecc71;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(indicator);

  setTimeout(() => {
    indicator.style.opacity = "1";
  }, 100);

  setTimeout(() => {
    indicator.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(indicator);
    }, 300);
  }, 2000);
}

// Performance monitoring
const performanceMonitor = {
  init() {
    this.trackPageLoad();
    this.trackUserInteractions();
  },

  trackPageLoad() {
    window.addEventListener("load", () => {
      const loadTime = performance.now();
      console.log(`Dashboard loaded in ${loadTime.toFixed(2)}ms`);
    });
  },

  trackUserInteractions() {
    let interactionCount = 0;
    document.addEventListener("click", () => {
      interactionCount++;
      if (interactionCount % 10 === 0) {
        console.log(`User interactions: ${interactionCount}`);
      }
    });
  },
};

// Initialize performance monitoring
performanceMonitor.init();
