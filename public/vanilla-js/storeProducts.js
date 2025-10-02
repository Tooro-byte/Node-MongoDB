class ProductsManager {
  constructor() {
    this.categories = document.querySelectorAll(".category-item");
    this.products = document.querySelectorAll(".product-card");
    this.activeCategorySpan = document.getElementById("active-category");
    this.productCountSpan = document.getElementById("product-count");
    this.addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    this.cartCountSpan = document.getElementById("cart-count"); // Added for cart count

    this.init();
  }

  init() {
    this.setupCategoryFiltering();
    this.setupAddToCartButtons();
    this.setupProductInteractions();
    this.updateProductCount();
    this.fetchCartCount(); // Fetch initial cart count
  }

  async fetchCartCount() {
    try {
      const response = await fetch("/api/cart/count", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        this.updateCartCount(data.totalProducts || 0);
      } else {
        console.error("Failed to fetch cart count:", data.Message);
        this.updateCartCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
      this.updateCartCount(0);
    }
  }

  updateCartCount(count) {
    if (this.cartCountSpan) {
      this.cartCountSpan.textContent = ` (${count})`;
    }
  }

  setupCategoryFiltering() {
    this.categories.forEach((category) => {
      category.addEventListener("click", () => {
        const categoryId = category.dataset.category;
        const categoryName =
          category.querySelector(".category-name").textContent;

        this.filterProducts(categoryId);
        this.updateActiveCategory(category, categoryName);
        this.updateProductCount();

        // Smooth scroll to products grid
        document.getElementById("products-container").scrollIntoView({
          behavior: "smooth",
        });
      });
    });
  }

  filterProducts(categoryId) {
    this.products.forEach((product) => {
      if (categoryId === "all" || product.dataset.category === categoryId) {
        product.classList.remove("hidden");
        // Add entrance animation
        product.style.opacity = "0";
        product.style.transform = "translateY(20px)";
        setTimeout(() => {
          product.style.transition = "all 0.3s ease";
          product.style.opacity = "1";
          product.style.transform = "translateY(0)";
        }, 100);
      } else {
        product.classList.add("hidden");
      }
    });
  }

  updateActiveCategory(activeCategory, categoryName) {
    // Remove active class from all categories
    this.categories.forEach((cat) => cat.classList.remove("active"));

    // Add active class to clicked category
    activeCategory.classList.add("active");

    // Update active category display
    this.activeCategorySpan.textContent = categoryName;
  }

  updateProductCount() {
    const visibleProducts = document.querySelectorAll(
      ".product-card:not(.hidden)"
    ).length;
    this.productCountSpan.textContent = `${visibleProducts} Products`;
  }

  setupAddToCartButtons() {
    this.addToCartButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        const productId = button.dataset.productId;

        // Add loading state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        button.disabled = true;

        try {
          // Send POST request to add product to cart
          const response = await fetch(`/api/cart/${productId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quantity: 1, // Default quantity is 1
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Show success message
            button.innerHTML = '<i class="fas fa-check"></i> Added!';
            button.style.background = "#48bb78";

            // Update cart count with the new totalProducts from response
            this.updateCartCount(data.cart.totalProducts || 0);

            // Show success notification
            this.showNotification(
              "Product added to cart successfully!",
              "success"
            );

            // Reset button after 2 seconds
            setTimeout(() => {
              button.innerHTML = originalHTML;
              button.style.background = "";
              button.disabled = false;
            }, 2000);
          } else {
            const data = await response.json();
            throw new Error(data.Message || "Failed to add product to cart");
          }
        } catch (error) {
          console.error("Error adding to cart:", error);

          // Show error message
          this.showNotification(
            error.message || "Failed to add product to cart",
            "error"
          );

          // Reset button
          button.innerHTML = originalHTML;
          button.disabled = false;
        }
      });
    });
  }

  setupProductInteractions() {
    // Add hover effects and interactions
    this.products.forEach((product) => {
      const quickView = product.querySelector(".quick-view");

      if (quickView) {
        quickView.addEventListener("click", () => {
          const productTitle =
            product.querySelector(".product-title").textContent;
          this.showQuickViewModal(product, productTitle);
        });
      }
    });
  }

  showQuickViewModal(product, productTitle) {
    // Create a simple modal for quick view
    const modal = document.createElement("div");
    modal.style.cssText = `
       position: fixed;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background: rgba(0, 0, 0, 0.8);
       display: flex;
       justify-content: center;
       align-items: center;
       z-index: 10000;
       backdrop-filter: blur(10px);
     `;

    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
       background: var(--card-bg);
       padding: 2rem;
       border-radius: 15px;
       max-width: 500px;
       width: 90%;
       text-align: center;
       border: 2px solid var(--accent-color);
     `;

    modalContent.innerHTML = `
       <h2 style="color: var(--accent-color); margin-bottom: 1rem;">${productTitle}</h2>
       <p style="color: var(--text-secondary); margin-bottom: 2rem;">Quick view feature coming soon!</p>
       <button onclick="this.closest('[style*=fixed]').remove()" style="
         background: var(--accent-color);
         color: var(--primary-color);
         border: none;
         padding: 0.75rem 1.5rem;
         border-radius: 8px;
         font-weight: bold;
         cursor: pointer;
         transition: all 0.3s ease;
       ">Close</button>
     `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      background: ${type === "success" ? "#48bb78" : "#fc8181"};
      color: white;
      font-weight: 600;
      z-index: 10001;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideIn 0.3s ease reverse";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize the products manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ProductsManager();
});

// Add search functionality
document.addEventListener("DOMContentLoaded", () => {
  // Add search functionality
  const searchFeature = () => {
    const searchInput = document.createElement("div");
    searchInput.innerHTML = `
       <div style="margin-bottom: 1rem; padding: 1rem; background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-color);">
         <input type="text" placeholder="Search products..." style="
           width: 100%;
           padding: 0.75rem;
           border: 1px solid var(--border-color);
           border-radius: 8px;
           background: var(--primary-color);
           color: var(--text-primary);
           font-size: 1rem;
         " id="product-search">
       </div>
     `;

    const contentHeader = document.querySelector(".content-header");
    if (contentHeader) {
      contentHeader.after(searchInput);

      // Search functionality
      document
        .getElementById("product-search")
        .addEventListener("input", (e) => {
          const searchTerm = e.target.value.toLowerCase();
          const products = document.querySelectorAll(".product-card");

          products.forEach((product) => {
            const title = product
              .querySelector(".product-title")
              .textContent.toLowerCase();
            const description = product
              .querySelector(".product-description")
              .textContent.toLowerCase();

            if (
              title.includes(searchTerm) ||
              description.includes(searchTerm)
            ) {
              product.classList.remove("hidden");
            } else {
              product.classList.add("hidden");
            }
          });

          // Update product count after search
          const visibleProducts = document.querySelectorAll(
            ".product-card:not(.hidden)"
          ).length;
          document.getElementById(
            "product-count"
          ).textContent = `${visibleProducts} Products`;
        });
    }
  };

  searchFeature();

  // Add smooth scrolling to all internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
});
