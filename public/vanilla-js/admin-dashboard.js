document.addEventListener("DOMContentLoaded", () => {
  // Navigation Tab Switching
  const navTabs = document.querySelectorAll(".nav-tab");
  const contentSections = document.querySelectorAll(".content-section");

  navTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const section = tab.getAttribute("data-section");

      navTabs.forEach((t) => t.classList.remove("active"));
      contentSections.forEach((s) => s.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(section).classList.add("active");
    });
  });

  // Sidebar Navigation
  const sidebarItems = document.querySelectorAll(
    ".sidebar-nav .nav-item:not(.logout)"
  );
  sidebarItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.getAttribute("data-section");

      sidebarItems.forEach((i) => i.classList.remove("active"));
      contentSections.forEach((s) => s.classList.remove("active"));

      item.classList.add("active");
      document.getElementById(section)?.classList.add("active");
    });
  });

  // Logout Handler
  document.querySelectorAll(".logout").forEach((logout) => {
    logout.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Logged out successfully", "success");
      // Simulate logout (replace with actual logout logic)
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    });
  });

  // Add New Product Modal
  const addProductButtons = document.querySelectorAll(".add-product");
  addProductButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showProductModal();
    });
  });

  // Product Modal Logic
  function showProductModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Add New Product</h3>
        <form id="productForm">
          <div class="form-group">
            <label for="productName">Product Name</label>
            <input type="text" id="productName" required>
          </div>
          <div class="form-group">
            <label for="productPrice">Price (UGX)</label>
            <input type="number" id="productPrice" step="0.01" required>
          </div>
          <div class="form-group">
            <label for="productStock">Stock</label>
            <input type="number" id="productStock" required>
          </div>
          <div class="form-group">
            <label for="productCategory">Category</label>
            <select id="productCategory" required>
              <option value="apparel">Apparel</option>
              <option value="accessories">Accessories</option>
              <option value="footwear">Footwear</option>
            </select>
          </div>
          <div class="form-group">
            <label for="productImage">Product Image</label>
            <input type="file" id="productImage" accept="image/*">
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Product</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Modal Styles
    const style = document.createElement("style");
    style.textContent = `
      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }
      .modal-content {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        width: 400px;
        max-width: 90%;
      }
      .modal-content h3 {
        margin-bottom: 20px;
        font-size: 20px;
      }
      .form-group {
        margin-bottom: 15px;
      }
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
      }
      .form-group input,
      .form-group select {
        width: 100%;
        padding: 8px;
        border-radius: 8px;
        border: 1px solid #ddd;
      }
      .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      .btn-secondary {
        background: #6c757d;
        color: #fff;
        border: none;
      }
      .btn-secondary:hover {
        background: #5a6268;
      }
    `;
    document.head.appendChild(style);

    // Modal Handlers
    modal.querySelector(".cancel").addEventListener("click", () => {
      modal.remove();
    });

    modal.querySelector("#productForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const productName = modal.querySelector("#productName").value;
      showToast(`Product "${productName}" added successfully`, "success");
      modal.remove();
      // Add backend API call here for actual product creation
    });
  }

  // Toast Notification
  function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-${
          type === "success" ? "check-circle" : "exclamation-circle"
        }"></i>
      </div>
      <div class="toast-message">${message}</div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Chart Initialization (Using Chart.js as an example)
  const initCharts = () => {
    if (typeof Chart !== "undefined") {
      // Revenue Chart
      const revenueChart = new Chart(document.getElementById("revenueChart"), {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Revenue (UGX)",
              data: [5000000, 6000000, 5500000, 7000000, 6500000, 8000000],
              borderColor: "#007bff",
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });

      // Sales Trend Chart
      const salesTrendChart = new Chart(
        document.getElementById("salesTrendChart"),
        {
          type: "bar",
          data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            datasets: [
              {
                label: "Sales (UGX)",
                data: [2000000, 2500000, 1800000, 3000000, 2700000],
                backgroundColor: "#007bff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        }
      );

      // Category Chart
      const categoryChart = new Chart(
        document.getElementById("categoryChart"),
        {
          type: "pie",
          data: {
            labels: ["Apparel", "Accessories", "Footwear"],
            datasets: [
              {
                data: [50, 30, 20],
                backgroundColor: ["#007bff", "#28a745", "#f1c40f"],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        }
      );
    }
  };

  // Initialize Charts
  initCharts();

  // Refresh Button Handler
  document.querySelector(".refresh-btn").addEventListener("click", () => {
    showToast("Dashboard refreshed", "success");
    // Add API call to refresh data
  });

  // Time Filter Handler
  document.querySelector(".filter-select").addEventListener("change", (e) => {
    const period = e.target.value;
    showToast(`Showing data for ${period}`, "success");
    // Add API call to filter data by period
  });

  // Backend Integration Placeholder
  // Example: Fetch dashboard data
  function fetchDashboardData() {
    // Replace with actual API call
    /*
    fetch('/api/admin/dashboard')
      .then(response => response.json())
      .then(data => {
        // Update dashboard metrics
        document.querySelector('.stat-card.revenue .stat-number').textContent = `UGX ${data.revenue.toLocaleString()}`;
        document.querySelector('.stat-card.orders .stat-number').textContent = data.orders;
        document.querySelector('.stat-card.traffic .stat-number').textContent = data.traffic;
      })
      .catch(error => {
        showToast('Failed to fetch dashboard data', 'error');
      });
    */
  }

  // Initialize Dashboard Data
  fetchDashboardData();
});
