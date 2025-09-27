class ProductsManager {
  constructor() {
    this.categories = document.querySelectorAll(".category-item");
    this.products = document.querySelectorAll(".product-card");
    this.activeCategorySpan = document.getElementById("active-category");
    this.productCountSpan = document.getElementById("product-count");
    this.buyNowButtons = document.querySelectorAll(".buy-now-btn");

    this.init();
  }

  init() {
    this.setupCategoryFiltering();
    this.setupBuyNowButtons();
    this.setupProductInteractions();
    this.updateProductCount();
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

  setupBuyNowButtons() {
    this.buyNowButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = button.dataset.productId;

        // Add loading state
        button.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Processing...';
        button.disabled = true;

        // Simulate processing time
        setTimeout(() => {
          // Redirect to payment page
          window.location.href = `/payment/${productId}`;
        }, 1000);
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
    contentHeader.after(searchInput);

    // Search functionality
    document.getElementById("product-search").addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const products = document.querySelectorAll(".product-card");

      products.forEach((product) => {
        const title = product
          .querySelector(".product-title")
          .textContent.toLowerCase();
        const description = product
          .querySelector(".product-description")
          .textContent.toLowerCase();

        if (title.includes(searchTerm) || description.includes(searchTerm)) {
          product.style.display = "block";
        } else {
          product.style.display = "none";
        }
      });
    });
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
