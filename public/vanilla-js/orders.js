class OrdersPage {
  constructor() {
    this.orders = [];
    this.currentPage = 1;
    this.pageSize = 10;
    this.sortField = "orderId";
    this.sortDirection = "asc";
    this.filterStatus = "";
    this.searchTerm = "";
    this.init();
  }

  init() {
    this.loadOrders();
    this.initializeSearch();
    this.initializeFilters();
    this.initializeSorting();
    this.initializePagination();
  }

  async loadOrders() {
    try {
      const response = await fetch("/api/orders");
      this.orders = await response.json();
      this.renderOrders();
    } catch (error) {
      this.showToast("error", "Orders", `Failed to load: ${error.message}`);
    }
  }

  renderOrders() {
    const tbody = document.querySelector("#ordersTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const filteredOrders = this.getFilteredOrders();
    const sortedOrders = this.getSortedOrders(filteredOrders);
    const paginatedOrders = sortedOrders.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    paginatedOrders.forEach((order) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.orderId}</td>
        <td>${order.customerName}</td>
        <td>${new Date(order.createdAt).toLocaleDateString("en-UG")}</td>
        <td>${this.formatCurrency(order.total)}</td>
        <td><span class="status status-${order.status}">${
        order.status
      }</span></td>
        <td class="order-actions">
          <button class="btn btn-primary" data-action="update" data-id="${
            order.orderId
          }">Update Status</button>
          <button class="btn btn-danger" data-action="cancel" data-id="${
            order.orderId
          }">Cancel</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    this.updatePagination(sortedOrders.length);
    this.initializeActionButtons();
  }

  getFilteredOrders() {
    return this.orders.filter((order) => {
      const matchesSearch = this.searchTerm
        ? order.orderId.toLowerCase().includes(this.searchTerm) ||
          order.customerName.toLowerCase().includes(this.searchTerm) ||
          order.status.toLowerCase().includes(this.searchTerm)
        : true;
      const matchesFilter = this.filterStatus
        ? order.status === this.filterStatus
        : true;
      return matchesSearch && matchesFilter;
    });
  }

  getSortedOrders(orders) {
    return orders.sort((a, b) => {
      const fieldA = a[this.sortField];
      const fieldB = b[this.sortField];
      const direction = this.sortDirection === "asc" ? 1 : -1;
      return typeof fieldA === "string"
        ? fieldA.localeCompare(fieldB) * direction
        : (fieldA - fieldB) * direction;
    });
  }

  initializeSearch() {
    const searchInput = document.getElementById("orderSearch");
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        this.searchTerm = searchInput.value.toLowerCase();
        this.currentPage = 1;
        searchTimeout = setTimeout(() => this.renderOrders(), 300);
      });
    }
  }

  initializeFilters() {
    const filterBtn = document.getElementById("filterOrders");
    if (filterBtn) {
      filterBtn.addEventListener("click", () => {
        const status = prompt(
          "Enter status to filter (pending, shipped, delivered, cancelled):"
        );
        this.filterStatus = status ? status.toLowerCase() : "";
        this.currentPage = 1;
        this.renderOrders();
        this.showToast(
          "info",
          "Filter",
          `Filtering by status: ${this.filterStatus || "all"}`
        );
      });
    }
  }

  initializeSorting() {
    const headers = document.querySelectorAll("th.sortable");
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        const field = header.getAttribute("data-sort");
        if (this.sortField === field) {
          this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
        } else {
          this.sortField = field;
          this.sortDirection = "asc";
        }
        headers.forEach((h) => h.classList.remove("sort-asc", "sort-desc"));
        header.classList.add(`sort-${this.sortDirection}`);
        this.renderOrders();
      });
    });
  }

  initializePagination() {
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderOrders();
        }
      });
    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(
          this.getFilteredOrders().length / this.pageSize
        );
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderOrders();
        }
      });
  }

  updatePagination(totalItems) {
    const pageInfo = document.getElementById("pageInfo");
    if (pageInfo) {
      const totalPages = Math.ceil(totalItems / this.pageSize);
      pageInfo.textContent = `Page ${this.currentPage} of ${totalPages || 1}`;
    }
  }

  initializeActionButtons() {
    const buttons = document.querySelectorAll(".order-actions button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        const orderId = btn.getAttribute("data-id");
        if (action === "update") {
          const newStatus = prompt(
            "Enter new status (pending, shipped, delivered):"
          );
          if (newStatus) this.updateOrderStatus(orderId, newStatus);
        } else if (action === "cancel") {
          if (confirm(`Cancel order ${orderId}?`)) this.cancelOrder(orderId);
        }
      });
    });
  }

  updateOrderStatus(orderId, status) {
    fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.showToast(
            "success",
            "Order Update",
            `Order ${orderId} updated to ${status}`
          );
          this.loadOrders();
        } else {
          this.showToast("error", "Order Update", "Failed to update order");
        }
      })
      .catch((error) =>
        this.showToast("error", "Order Update", `Error: ${error.message}`)
      );
  }

  cancelOrder(orderId) {
    fetch(`/api/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.showToast(
            "success",
            "Order Cancelled",
            `Order ${orderId} cancelled`
          );
          this.loadOrders();
        } else {
          this.showToast(
            "error",
            "Order Cancellation",
            "Failed to cancel order"
          );
        }
      })
      .catch((error) =>
        this.showToast("error", "Order Cancellation", `Error: ${error.message}`)
      );
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
    }).format(amount);
  }

  showToast(type, title, message, duration = 4000) {
    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon =
      {
        success: "fa-check-circle",
        warning: "fa-exclamation-triangle",
        error: "fa-times-circle",
        info: "fa-info-circle",
      }[type] || "fa-info-circle";
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

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.parentNode?.removeChild(toast), 300);
    }, duration);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new OrdersPage();
});
