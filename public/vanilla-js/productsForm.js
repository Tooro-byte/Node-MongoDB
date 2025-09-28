const socket = io();

// DOM Elements
const categoryForm = document.getElementById("categoryForm");
const productForm = document.getElementById("productForm");
const categoryPreview = document.getElementById("categoryPreview");
const productImagesPreview = document.getElementById("productImagesPreview");
const recentAdditions = document.getElementById("recentAdditions");
const toastContainer = document.getElementById("toastContainer");

// File upload previews
document
  .getElementById("categoryImage")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        categoryPreview.innerHTML = `<img src="${e.target.result}" class="preview-image" alt="Category Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });

document
  .getElementById("productImages")
  .addEventListener("change", function (e) {
    const files = Array.from(e.target.files);
    productImagesPreview.innerHTML = "";

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "preview-image";
        img.alt = "Product Preview";
        productImagesPreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

// Category Form Submit
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(categoryForm);
  const submitBtn = categoryForm.querySelector('button[type="submit"]');

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    const response = await fetch("/categories", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      showToast("Category added successfully!", "success");
      categoryForm.reset();
      categoryPreview.innerHTML = "";

      // Update category dropdown in product form
      updateCategoryOptions(result.category);

      // Add to recent additions
      addToRecentAdditions("category", result.category);
    } else {
      throw new Error(result.message || "Failed to add category");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Category';
  }
});

// Product Form Submit
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(productForm);
  const submitBtn = productForm.querySelector('button[type="submit"]');

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    const response = await fetch("/add-product", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      showToast("Product added successfully!", "success");
      productForm.reset();
      productImagesPreview.innerHTML = "";

      // Add to recent additions
      addToRecentAdditions("product", result.product);
    } else {
      throw new Error(result.message || "Failed to add product");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Product';
  }
});

// Socket.io real-time updates
socket.on("category-added", (category) => {
  updateCategoryOptions(category);
  addToRecentAdditions("category", category);
  showToast(`New category "${category.name}" added!`, "success");
});

socket.on("product-added", (product) => {
  addToRecentAdditions("product", product);
  showToast(`New product "${product.title}" added!`, "success");
});

// Helper Functions
function updateCategoryOptions(category) {
  const categorySelect = document.getElementById("productCategory");
  const option = document.createElement("option");
  option.value = category._id;
  option.textContent = category.name;
  categorySelect.appendChild(option);
}

function addToRecentAdditions(type, item) {
  const additionCard = document.createElement("div");
  additionCard.className = "addition-card";

  if (type === "category") {
    additionCard.innerHTML = `
            <div class="addition-header">
                <i class="fas fa-tags"></i>
                <span>Category Added</span>
            </div>
            <div class="addition-content">
                <h4>${item.name}</h4>
                <p>New category is now available</p>
            </div>
            <div class="addition-time">${new Date().toLocaleTimeString()}</div>
        `;
  } else if (type === "product") {
    additionCard.innerHTML = `
            <div class="addition-header">
                <i class="fas fa-box"></i>
                <span>Product Added</span>
            </div>
            <div class="addition-content">
                <h4>${item.title}</h4>
                <p>$${item.price} - Stock: ${item.stockId}</p>
                <p>${item.category.name}</p>
            </div>
            <div class="addition-time">${new Date().toLocaleTimeString()}</div>
        `;
  }

  recentAdditions.insertBefore(additionCard, recentAdditions.firstChild);

  // Limit to 10 recent additions
  while (recentAdditions.children.length > 10) {
    recentAdditions.removeChild(recentAdditions.lastChild);
  }
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${
              type === "success" ? "check-circle" : "exclamation-circle"
            }"></i>
            <span>${message}</span>
        </div>
    `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = "slideOutRight 0.3s ease forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }, 5000);

  // Click to remove
  toast.addEventListener("click", () => {
    toast.style.animation = "slideOutRight 0.3s ease forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
}

// Form validation enhancements
function addFormValidation() {
  const inputs = document.querySelectorAll(
    "input[required], textarea[required], select[required]"
  );

  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      if (!this.checkValidity()) {
        this.style.borderColor = "#ff4757";
      } else {
        this.style.borderColor = "rgba(255, 255, 255, 0.2)";
      }
    });

    input.addEventListener("input", function () {
      if (this.checkValidity()) {
        this.style.borderColor = "#38ef7d";
      }
    });
  });
}

// Character counters
function addCharacterCounters() {
  const titleInput = document.getElementById("productTitle");
  const descInput = document.getElementById("productDescription");

  function addCounter(input, maxLength) {
    const counter = document.createElement("div");
    counter.className = "char-counter";
    counter.style.fontSize = "12px";
    counter.style.color = "#888";
    counter.style.textAlign = "right";
    counter.style.marginTop = "5px";

    input.parentNode.appendChild(counter);

    function updateCounter() {
      const remaining = maxLength - input.value.length;
      counter.textContent = `${remaining} characters remaining`;
      counter.style.color = remaining < 10 ? "#ff4757" : "#888";
    }

    input.addEventListener("input", updateCounter);
    updateCounter();
  }

  addCounter(titleInput, 50);
  addCounter(descInput, 100);
}

// Initialize enhancements
document.addEventListener("DOMContentLoaded", function () {
  addFormValidation();
  addCharacterCounters();
});

// Add some CSS for additional components
const additionalStyles = `
<style>
.addition-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    border: 1px solid rgba(255, 215, 0, 0.3);
    animation: slideInUp 0.5s ease;
    transition: all 0.3s ease;
}

.addition-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.addition-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    color: #ffd700;
    font-weight: 600;
    font-size: 14px;
}

.addition-content h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #ffffff;
}

.addition-content p {
    font-size: 14px;
    color: #b0b0b0;
    margin: 2px 0;
}

.addition-time {
    font-size: 12px;
    color: #888;
    text-align: right;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.toast-content i {
    font-size: 18px;
}

@keyframes slideOutRight {
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.char-counter.warning {
    color: #ff4757 !important;
    font-weight: 600;
}
</style>
`;

document.head.insertAdjacentHTML("beforeend", additionalStyles);
