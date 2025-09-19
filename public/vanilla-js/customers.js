class CustomersPage {
  constructor() {
    this.customers = [];
    this.currentPage = 1;
    this.pageSize = 9;
    this.searchTerm = "";
    this.init();
  }

  init() {
    this.loadCustomers();
    this.initializeSearch();
    this.initializePagination();
    this.initializeAddCustomer();
  }

  async loadCustomers() {
    try {
      const response = await fetch("/api/customers");
      this.customers = await response.json();
      this.renderCustomers();
    } catch (error) {
      this.showToast("error", "Customers", `Failed to load: ${error.message}`);
    }
  }

  renderCustomers() {
    const customersList = document.getElementById("customersList");
    if (!customersList) return;

    customersList.innerHTML = "";
    const filteredCustomers = this.customers.filter((customer) =>
      this.searchTerm
        ? customer.name.toLowerCase().includes(this.searchTerm) ||
          customer.email.toLowerCase().includes(this.searchTerm)
        : true
    );
    const paginatedCustomers = filteredCustomers.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    paginatedCustomers.forEach((customer) => {
      const card = document.createElement("div");
      card.className = "customer-card";
      card.innerHTML = `
        <div class="customer-header">
          <div class="customer-avatar">
            <img src="${
              customer.avatar ||
              "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=50"
            }" alt="${customer.name}">
          </div>
          <div class="customer-info">
            <h3>${customer.name}</h3>
            <p>${customer.email}</p>
          </div>
        </div>
        <div class="customer-details">
          <div class="detail-row">
            <span>Phone:</span>
            <span>${customer.phone || "N/A"}</span>
          </div>
          <div class="detail-row">
            <span>Total Orders:</span>
            <span>${customer.totalOrders || 0}</span>
          </div>
          <div class="detail-row">
            <span>Total Spent:</span>
            <span>${this.formatCurrency(customer.totalSpent || 0)}</span>
          </div>
        </div>
        <div class="customer-actions">
          <button class="btn btn-primary" data-id="${
            customer.id
          }" data-action="view">View Profile</button>
          <button class="btn btn-secondary" data-id="${
            customer.id
          }" data-action="contact">Contact</button>
        </div>
      `;
      customersList.appendChild(card);
    });

    this.updatePagination(filteredCustomers.length);
    this.initializeActionButtons();
  }

  initializeSearch() {
    const searchInput = document.getElementById("customerSearch");
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        this.searchTerm = searchInput.value.toLowerCase();
        this.currentPage = 1;
        searchTimeout = setTimeout(() => this.renderCustomers(), 300);
      });
    }
  }

  initializePagination() {
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");
    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderCustomers();
        }
      });
    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(this.customers.length / this.pageSize);
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderCustomers();
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

  initializeAddCustomer() {
    const addBtn = document.getElementById("addCustomer");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const name = prompt("Enter customer name:");
        const email = prompt("Enter customer email:");
        if (name && email) {
          this.addCustomer({ name, email });
        }
      });
    }
  }

  initializeActionButtons() {
    const buttons = document.querySelectorAll(".customer-actions button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        const customerId = btn.getAttribute("data-id");
        if (action === "view") {
          this.showToast(
            "info",
            "Customer Profile",
            `Viewing profile for customer ${customerId}`
          );
          // Placeholder for profile view
        } else if (action === "contact") {
          this.showToast(
            "info",
            "Contact",
            `Contacting customer ${customerId}`
          );
          // Placeholder for contact functionality
        }
      });
    });
  }

  addCustomer(customer) {
    fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.showToast(
            "success",
            "Customer Added",
            `Customer ${customer.name} added`
          );
          this.loadCustomers();
        } else {
          this.showToast("error", "Customer Add", "Failed to add customer");
        }
      })
      .catch((error) =>
        this.showToast("error", "Customer Add", `Error: ${error.message}`)
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
  new CustomersPage();
});
