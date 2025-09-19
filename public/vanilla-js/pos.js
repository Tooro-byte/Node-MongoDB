class POSPage {
  constructor() {
    this.products = [];
    this.customers = [];
    this.cart = [];
    this.selectedCustomer = null;
    this.paymentMethod = "cash";
    this.taxRate = 0.085; // 8.5%
    this.init();
  }

  init() {
    this.loadProducts();
    this.loadCustomers();
    this.initializeSearch();
    this.initializeCategoryFilter();
    this.initializeCustomerSearch();
    this.initializeCartActions();
    this.initializePaymentMethods();
    this.initializeCheckoutActions();
    this.initializeTransactionHistory();
  }

  async loadProducts() {
    try {
      const response = await fetch("/api/inventory");
      this.products = await response.json();
      this.renderProductGrid();
    } catch (error) {
      this.showToast("error", "Products", `Failed to load: ${error.message}`);
    }
  }

  async loadCustomers() {
    try {
      const response = await fetch("/api/customers");
      this.customers = await response.json();
    } catch (error) {
      this.showToast("error", "Customers", `Failed to load: ${error.message}`);
    }
  }

  renderProductGrid(category = "all") {
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) return;

    productGrid.innerHTML = "";
    const filteredProducts =
      category === "all"
        ? this.products
        : this.products.filter((p) => p.category === category);

    filteredProducts.forEach((product) => {
      const productItem = document.createElement("div");
      productItem.className = "product-item";
      productItem.innerHTML = `
        <img src="${product.image || "/images/placeholder.jpg"}" alt="${
        product.name
      }">
        <div class="product-info">
          <h4>${product.name}</h4>
          <p>${this.formatCurrency(product.price)}</p>
          <p>In Stock: ${product.stock}</p>
        </div>
        <button class="btn btn-primary add-to-cart" data-product-id="${
          product.id
        }" data-price="${product.price}">
          <i class="fas fa-plus"></i> Add
        </button>
      `;
      productGrid.appendChild(productItem);
    });

    this.initializeAddToCartButtons();
  }

  initializeSearch() {
    const productSearch = document.getElementById("productSearch");
    const barcodeBtn = document.querySelector(".barcode-btn");
    if (productSearch) {
      let searchTimeout;
      productSearch.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        const searchTerm = productSearch.value.toLowerCase();
        searchTimeout = setTimeout(() => {
          const filteredProducts = this.products.filter(
            (p) =>
              p.name.toLowerCase().includes(searchTerm) ||
              p.id.toLowerCase().includes(searchTerm)
          );
          this.renderProductGridFiltered(filteredProducts);
        }, 300);
      });
    }
    if (barcodeBtn) {
      barcodeBtn.addEventListener("click", () => this.handleBarcodeScan());
    }
  }

  initializeCategoryFilter() {
    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => {
        this.renderProductGrid(categoryFilter.value);
      });
    }
  }

  initializeCustomerSearch() {
    const customerSearch = document.getElementById("customerSearch");
    if (customerSearch) {
      let searchTimeout;
      customerSearch.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        const searchTerm = customerSearch.value.toLowerCase();
        searchTimeout = setTimeout(() => {
          const filteredCustomers = this.customers.filter(
            (c) =>
              c.name.toLowerCase().includes(searchTerm) ||
              c.id.toLowerCase().includes(searchTerm)
          );
          this.showCustomerSuggestions(filteredCustomers);
        }, 300);
      });
    }
  }

  showCustomerSuggestions(customers) {
    // Placeholder for customer suggestions UI (e.g., dropdown)
    if (customers.length > 0) {
      this.selectedCustomer = customers[0]; // Select first match
      document.querySelector(".customer-name").textContent = customers[0].name;
      this.showToast("info", "Customer", `Selected: ${customers[0].name}`);
    } else {
      this.selectedCustomer = null;
      document.querySelector(".customer-name").textContent = "None";
    }
    this.updateCartSummary();
  }

  initializeAddToCartButtons() {
    const addButtons = document.querySelectorAll(".add-to-cart");
    addButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-product-id");
        const price = parseFloat(btn.getAttribute("data-price"));
        const product = this.products.find((p) => p.id === productId);
        if (product && product.stock > 0) {
          this.addToCart(product);
        } else {
          this.showToast("warning", "Cart", "Product out of stock");
        }
      });
    });
  }

  addToCart(product) {
    const cartItem = this.cart.find((item) => item.id === product.id);
    if (cartItem) {
      cartItem.quantity++;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    this.renderCart();
    this.showToast("success", "Cart", `${product.name} added to cart`);
  }

  renderCart() {
    const cartItems = document.getElementById("cartItems");
    if (!cartItems) return;

    cartItems.innerHTML = "";
    if (this.cart.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <p>Add items to start a sale</p>
        </div>
      `;
    } else {
      this.cart.forEach((item) => {
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
          <span>${item.name} (x${item.quantity})</span>
          <span>${this.formatCurrency(item.price * item.quantity)}</span>
          <button class="remove-item" data-product-id="${item.id}">
            <i class="fas fa-trash"></i>
          </button>
        `;
        cartItems.appendChild(cartItem);
      });
    }

    this.initializeRemoveButtons();
    this.updateCartSummary();
  }

  initializeRemoveButtons() {
    const removeButtons = document.querySelectorAll(".remove-item");
    removeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-product-id");
        this.cart = this.cart.filter((item) => item.id !== productId);
        this.renderCart();
        this.showToast("info", "Cart", "Item removed");
      });
    });
  }

  updateCartSummary() {
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discount = this.calculateDiscount(subtotal);
    const tax = subtotal * this.taxRate;
    const total = subtotal - discount + tax;

    document.querySelector(".subtotal").textContent =
      this.formatCurrency(subtotal);
    document.querySelector(".discount-amount").textContent =
      this.formatCurrency(discount);
    document.querySelector(".tax-amount").textContent =
      this.formatCurrency(tax);
    document.querySelector(".total-amount").textContent =
      this.formatCurrency(total);
  }

  calculateDiscount(subtotal) {
    // Placeholder for discount logic (e.g., from promotions or customer loyalty)
    return this.selectedCustomer && this.selectedCustomer.loyalty
      ? subtotal * 0.1
      : 0; // 10% loyalty discount
  }

  initializePaymentMethods() {
    const paymentButtons = document.querySelectorAll(".payment-btn");
    paymentButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        paymentButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.paymentMethod = btn.getAttribute("data-method");
        this.calculateChange();
      });
    });
  }

  initializeCheckoutActions() {
    const clearCart = document.querySelector(".clear-cart");
    const holdSale = document.querySelector(".hold-sale");
    const completeSale = document.querySelector(".complete-sale");
    const generateReceipt = document.querySelector(".generate-receipt");
    const paymentInput = document.querySelector(".payment-amount");

    if (clearCart) {
      clearCart.addEventListener("click", () => {
        this.cart = [];
        this.selectedCustomer = null;
        document.querySelector(".customer-name").textContent = "None";
        this.renderCart();
        this.showToast("info", "Cart", "Cart cleared");
      });
    }

    if (holdSale) {
      holdSale.addEventListener("click", () => {
        this.showToast("info", "Sale", "Sale held (not implemented)");
        // Placeholder for holding sale logic
      });
    }

    if (completeSale) {
      completeSale.addEventListener("click", () => this.completeSale());
    }

    if (generateReceipt) {
      generateReceipt.addEventListener("click", () => this.generateReceipt());
    }

    if (paymentInput) {
      paymentInput.addEventListener("input", () => this.calculateChange());
    }
  }

  calculateChange() {
    const paymentInput = document.querySelector(".payment-amount");
    const total = parseFloat(
      document.querySelector(".total-amount").textContent.replace("UGX ", "")
    );
    const amountReceived = parseFloat(paymentInput.value) || 0;
    const change = amountReceived - total;
    document.querySelector(
      ".change-amount span"
    ).textContent = `Change: ${this.formatCurrency(change)}`;
  }

  async completeSale() {
    if (this.cart.length === 0) {
      this.showToast("warning", "Sale", "Cart is empty");
      return;
    }

    const total = parseFloat(
      document.querySelector(".total-amount").textContent.replace("UGX ", "")
    );
    const amountReceived =
      parseFloat(document.querySelector(".payment-amount").value) || 0;

    if (amountReceived < total) {
      this.showToast("warning", "Sale", "Insufficient payment");
      return;
    }

    try {
      const sale = {
        customerId: this.selectedCustomer ? this.selectedCustomer.id : null,
        items: this.cart,
        total,
        paymentMethod: this.paymentMethod,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale),
      });

      if (response.ok) {
        // Update inventory stock
        for (const item of this.cart) {
          await fetch(`/api/inventory/${item.id}/stock`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock: item.stock - item.quantity }),
          });
        }

        this.showToast("success", "Sale", "Sale completed successfully");
        this.cart = [];
        this.selectedCustomer = null;
        document.querySelector(".customer-name").textContent = "None";
        document.querySelector(".payment-amount").value = "";
        this.renderCart();
        this.loadProducts(); // Refresh product stock
      } else {
        this.showToast("error", "Sale", "Failed to complete sale");
      }
    } catch (error) {
      this.showToast("error", "Sale", `Error: ${error.message}`);
    }
  }

  generateReceipt() {
    if (this.cart.length === 0) {
      this.showToast("warning", "Receipt", "Cart is empty");
      return;
    }

    const receipt = `
Kings Collection Receipt
-----------------------
Date: ${new Date().toLocaleString()}
Customer: ${this.selectedCustomer ? this.selectedCustomer.name : "Guest"}
-----------------------
Items:
${this.cart
  .map(
    (item) =>
      `${item.name} (x${item.quantity}): ${this.formatCurrency(
        item.price * item.quantity
      )}`
  )
  .join("\n")}
-----------------------
Subtotal: ${document.querySelector(".subtotal").textContent}
Discount: ${document.querySelector(".discount-amount").textContent}
Tax (8.5%): ${document.querySelector(".tax-amount").textContent}
Total: ${document.querySelector(".total-amount").textContent}
Payment Method: ${this.paymentMethod}
Change: ${document
      .querySelector(".change-amount span")
      .textContent.replace("Change: ", "")}
-----------------------
Thank you for shopping with us!
    `;

    const blob = new Blob([receipt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("success", "Receipt", "Receipt generated");
  }

  initializeTransactionHistory() {
    const transactionHistoryBtn = document.getElementById("transactionHistory");
    if (transactionHistoryBtn) {
      transactionHistoryBtn.addEventListener("click", () => {
        this.showToast(
          "info",
          "Transaction History",
          "Displaying transaction history (not implemented)"
        );
        // Placeholder for transaction history logic
      });
    }
  }

  handleBarcodeScan() {
    // Placeholder for barcode scanning logic
    this.showToast(
      "info",
      "Barcode",
      "Barcode scanning initiated (hardware integration required)"
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
  new POSPage();
});
