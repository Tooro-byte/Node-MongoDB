class InventoryPage {
  constructor() {
    this.inventory = [];
    this.currentPage = 1;
    this.pageSize = 10;
    this.sortField = "id";
    this.sortDirection = "asc";
    this.searchTerm = "";
    this.filterLowStock = false;
    this.lowStockThreshold = 10; // Items with stock <= 10 are considered low
    this.init();
  }

  init() {
    this.loadInventory();
    this.initializeSearch();
    this.initializeFilters();
    this.initializeSorting();
    this.initializePagination();
    this.initializeAddProduct();
  }

  async loadInventory() {
    try {
      const response = await fetch("/api/inventory");
      this.inventory = await response.json();
      this.renderInventory();
    } catch (error) {
      this.showToast("error", "Inventory", `Failed to load: ${error.message}`);
    }
  }

  renderInventory() {
    const tbody = document.querySelector("#inventoryTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const filteredInventory = this.getFilteredInventory();
    const sortedInventory = this.getSortedInventory(filteredInventory);
    const paginatedInventory = sortedInventory.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    paginatedInventory.forEach((item) => {
      const isLowStock = item.stock <= this.lowStockThreshold;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td class="${isLowStock ? "low-stock" : ""}">${item.stock}</td>
        <td>${this.formatCurrency(item.price)}</td>
        <td class="inventory-actions">
          <input type="number" class="stock-input" data-id="${
            item.id
          }" value="${item.stock}" min="0">
          <button class="btn btn-primary update-stock" data-id="${
            item.id
          }">Update</button>
          <button class="btn btn-secondary restock" data-id="${
            item.id
          }">Restock</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    this.updatePagination(filteredInventory.length);
    this.initializeActionButtons();
  }

  getFilteredInventory() {
    return this.inventory.filter((item) => {
      const matchesSearch = this.searchTerm
        ? item.id.toLowerCase().includes(this.searchTerm) ||
          item.name.toLowerCase().includes(this.searchTerm)
        : true;
      const matchesLowStock = this.filterLowStock
        ? item.stock <= this.lowStockThreshold
        : true;
      return matchesSearch && matchesLowStock;
    });
  }

  getSortedInventory(items) {
    return items.sort((a, b) => {
      const fieldA = a[this.sortField];
      const fieldB = b[this.sortField];
      const direction = this.sortDirection === "asc" ? 1 : -1;
      return typeof fieldA === "string"
        ? fieldA.localeCompare(fieldB) * direction
        : (fieldA - fieldB) * direction;
    });
  }

  initializeSearch() {
    const searchInput = document.getElementById("inventorySearch");
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        this.searchTerm = searchInput.value.toLowerCase();
        this.currentPage = 1;
        searchTimeout = setTimeout(() => this.renderInventory(), 300);
      });
    }
  }

  initializeFilters() {
    const filterBtn = document.getElementById("filterLowStock");
    if (filterBtn) {
      filterBtn.addEventListener("click", () => {
        this.filterLowStock = !this.filterLowStock;
        this.currentPage = 1;
        this.renderInventory();
        this.showToast(
          "info",
          "Filter",
          `Showing ${this.filterLowStock ? "low stock" : "all"} items`
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
        this.renderInventory();
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
          this.renderInventory();
        }
      });
    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(
          this.getFilteredInventory().length / this.pageSize
        );
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderInventory();
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

  initializeAddProduct() {
    const addBtn = document.getElementById("addProduct");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const name = prompt("Enter product name:");
        const price = parseFloat(prompt("Enter product price (UGX):"));
        const stock = parseInt(prompt("Enter initial stock:"));
        if (name && !isNaN(price) && !isNaN(stock)) {
          this.addProduct({ name, price, stock });
        } else {
          this.showToast("warning", "Add Product", "Invalid input");
        }
      });
    }
  }

  initializeActionButtons() {
    const updateButtons = document.querySelectorAll(".update-stock");
    const restockButtons = document.querySelectorAll(".restock");

    updateButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        const input = document.querySelector(
          `.stock-input[data-id="${productId}"]`
        );
        const newStock = parseInt(input.value);
        if (!isNaN(newStock) && newStock >= 0) {
          this.updateStock(productId, newStock);
        } else {
          this.showToast("warning", "Update Stock", "Invalid stock value");
        }
      });
    });

    restockButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        const restockAmount = parseInt(prompt("Enter restock amount:"));
        if (!isNaN(restockAmount) && restockAmount > 0) {
          this.restockProduct(productId, restockAmount);
        } else {
          this.showToast("warning", "Restock", "Invalid restock amount");
        }
      });
    });
  }

  updateStock(productId, stock) {
    fetch(`/api/inventory/${productId}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.showToast(
            "success",
            "Stock Update",
            `Stock updated for product ${productId}`
          );
          this.loadInventory();
        } else {
          this.showToast("error", "Stock Update", "Failed to update stock");
        }
      })
      .catch((error) =>
        this.showToast("error", "Stock Update", `Error: ${error.message}`)
      );
  }

  restockProduct(productId, amount) {
    fetch(`/api/inventory/${productId}/restock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.showToast(
            "success",
            "Restock",
            `Restocked ${amount} units for product ${productId}`
          );
          this.loadInventory();
        } else {
          this.showToast("error", "Restock", "Failed to restock product");
        }
      })
      .catch((error) =>
        this.showToast("error", "Restock", `Error: ${error.message}`)
      );
  }

  addProduct(product) {
    fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.showToast(
            "success",
            "Product Added",
            `Product ${product.name} added`
          );
          this.loadInventory();
        } else {
          this.showToast("error", "Product Add", "Failed to add product");
        }
      })
      .catch((error) =>
        this.showToast("error", "Product Add", `Error: ${error.message}`)
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
  new InventoryPage();
});
