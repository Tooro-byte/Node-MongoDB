document.addEventListener("DOMContentLoaded", () => {
  // Socket.IO Integration for Real-Time Updates
  const socket = io();

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server");
  });

  socket.on("product-added", (product) => {
    console.log("New product added:", product);
    const productList = document.querySelector(".product-list tbody");
    if (productList && window.location.pathname === "/admin-page") {
      const productRow = document.createElement("tr");
      productRow.dataset.productId = product._id;
      productRow.innerHTML = `
        <td>
          <img src="/upload/products/${product.images[0]}" alt="${product.title}" width="50">
        </td>
        <td>${product.title}</td>
        <td>${product.category.name}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.stockId}</td>
        <td>
          <a href="/admin/products/edit/${product._id}" class="btn btn-primary">Edit</a>
          <button class="btn btn-danger delete-product" data-product-id="${product._id}">Delete</button>
        </td>
      `;
      productList.prepend(productRow);
      showToast("New product added!", "success");
    }
  });

  socket.on("product-updated", (product) => {
    console.log("Product updated:", product);
    if (window.location.pathname === "/admin-page") {
      const productRow = document.querySelector(`[data-product-id="${product._id}"]`);
      if (productRow) {
        productRow.querySelector("td:nth-child(2)").textContent = product.title;
        productRow.querySelector("td:nth-child(3)").textContent = product.category.name;
        productRow.querySelector("td:nth-child(4)").textContent = `$${product.price.toFixed(2)}`;
        productRow.querySelector("td:nth-child(5)").textContent = product.stockId;
        productRow.querySelector("img").src = `/upload/products/${product.images[0]}`;
        productRow.querySelector("a.btn-primary").href = `/admin/products/edit/${product._id}`;
        showToast("Product updated!", "info");
      }
    }
  });

  socket.on("product-deleted", ({ id }) => {
    console.log("Product deleted:", id);
    if (window.location.pathname === "/admin-page") {
      const productRow = document.querySelector(`[data-product-id="${id}"]`);
      if (productRow) {
        productRow.remove();
        showToast("Product deleted!", "info");
      }
    }
  });

  socket.on("category-added", (category) => {
    console.log("New category added:", category);
    const categoryList = document.querySelector(".category-list tbody");
    if (categoryList && window.location.pathname === "/admin-page") {
      const categoryRow = document.createElement("tr");
      categoryRow.dataset.categoryId = category._id;
      categoryRow.innerHTML = `
        <td>
          <img src="/upload/category/${category.image}" alt="${category.name}" width="50">
        </td>
        <td>${category.name}</td>
      `;
      categoryList.prepend(categoryRow);
      showToast("New category added!", "success");
    }
  });

  // Navigation Tab Switching (Updated for href routing)
  const navTabs = document.querySelectorAll(".nav-tab");
  const sidebarItems = document.querySelectorAll(".sidebar-nav .nav-item:not(.logout)");
  const contentSections = document.querySelectorAll(".content-section");

  // Helper function to check if link should navigate or toggle section
  function shouldNavigate(href) {
    const navigableRoutes = [
      "/admin-page",
      "/admin/add-product/new",
      "/admin/categories/new",
      "/admin/products/edit",
      "/admin/profile",
      "/admin/security",
      "/support",
      "/logout",
      "/admin/sales",
      "/admin/orders",
      "/admin/inventory",
      "/admin/customers",
      "/admin/employees",
      "/admin/marketing",
      "/admin/payments",
      "/admin/website",
      "/admin/support",
      "/admin/analytics",
      "/admin/financials",
      "/admin/settings"
    ];
    return navigableRoutes.some(route => href.includes(route));
  }

  // Top Navigation Tabs
  navTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const href = tab.getAttribute("href");
      const section = tab.getAttribute("data-section");

      // Check if this is a navigable route
      if (href !== "#" && shouldNavigate(href)) {
        // Allow default navigation
        return;
      }

      // Handle section toggling for internal dashboard sections
      if (section) {
        e.preventDefault();
        navTabs.forEach((t) => t.classList.remove("active"));
        contentSections.forEach((s) => s.classList.remove("active"));
        tab.classList.add("active");
        const targetSection = document.getElementById(section);
        if (targetSection) {
          targetSection.classList.add("active");
        }
      }
    });
  });

  // Sidebar Navigation
  sidebarItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const href = item.getAttribute("href");
      const section = item.getAttribute("data-section");

      // Check if this is a navigable route
      if (href !== "#" && shouldNavigate(href)) {
        // Allow default navigation
        return;
      }

      // Handle section toggling for internal dashboard sections
      if (section) {
        e.preventDefault();
        sidebarItems.forEach((i) => i.classList.remove("active"));
        contentSections.forEach((s) => s.classList.remove("active"));
        item.classList.add("active");
        const targetSection = document.getElementById(section);
        if (targetSection) {
          targetSection.classList.add("active");
        }
      }
    });
  });

  // Logout Handler
  document.querySelectorAll(".logout").forEach((logout) => {
    logout.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to log out?")) {
        showToast("Logging out...", "info");
        setTimeout(() => {
          window.location.href = "/logout";
        }, 1000);
      }
    });
  });

  // Add New Product Button (Updated to navigate instead of modal)
  const addProductButtons = document.querySelectorAll(".add-product a");
  addProductButtons.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Allow navigation to /admin/add-product/new
      console.log("Navigating to add product form");
    });
  });

  // Delete Product Handler
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-product")) {
      e.preventDefault();
      const productId = e.target.dataset.productId;
      const confirmed = confirm("Are you sure you want to delete this product?");
      if (confirmed) {
        try {
          const response = await fetch(`/admin/products/${productId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            e.target.closest("tr").remove();
            showToast("Product deleted successfully", "success");
          } else {
            const error = await response.json();
            showToast("Failed to delete product: " + error.error, "error");
          }
        } catch (error) {
          console.error("Error deleting product:", error);
          showToast("Error deleting product", "error");
        }
      }
    }
  });

  // Toast Notification (Updated)
  function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
      console.warn("Toast container not found");
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-${
          type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"
        }"></i>
      </div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    toastContainer.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
  }

  // Chart Initialization (Updated to check for Chart.js)
  const initCharts = () => {
    // Check if Chart.js is loaded
    if (typeof Chart !== "undefined") {
      // Revenue Chart
      const revenueCtx = document.getElementById("revenueChart");
      if (revenueCtx) {
        new Chart(revenueCtx, {
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
      }

      // Sales Trend Chart
      const salesTrendCtx = document.getElementById("salesTrendChart");
      if (salesTrendCtx) {
        new Chart(salesTrendCtx, {
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
        });
      }

      // Category Chart
      const categoryCtx = document.getElementById("categoryChart");
      if (categoryCtx) {
        new Chart(categoryCtx, {
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
        });
      }
    } else {
      console.warn("Chart.js not loaded. Charts will not be displayed.");
    }
  };

  // Initialize Charts
  initCharts();

  // Refresh Button Handler
  const refreshBtn = document.querySelector(".refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      try {
        // Fetch updated dashboard data
        const response = await fetch("/admin-page", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          showToast("Dashboard refreshed", "success");
          // Optionally reload the page or update specific elements
          location.reload();
        } else {
          showToast("Failed to refresh dashboard", "error");
        }
      } catch (error) {
        console.error("Error refreshing dashboard:", error);
        showToast("Error refreshing dashboard", "error");
      }
    });
  }

  // Time Filter Handler
  const timeFilter = document.querySelector(".filter-select");
  if (timeFilter) {
    timeFilter.addEventListener("change", (e) => {
      const period = e.target.value;
      showToast(`Showing data for ${period}`, "info");
      // Add API call to filter data by period
      // fetch(`/api/admin/dashboard?period=${period}`)
      //   .then(response => response.json())
      //   .then(data => updateDashboardMetrics(data));
    });
  }

  // Backend Integration (Updated)
  async function fetchDashboardData() {
    try {
      const response = await fetch("/admin-page");
      if (response.ok) {
        const data = await response.text(); // Since it's a rendered page
        console.log("Dashboard data fetched successfully");
        // Note: For dynamic updates, consider creating an API endpoint
        // /api/admin/dashboard that returns JSON data
      } else {
        showToast("Failed to fetch dashboard data", "error");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast("Network error loading dashboard", "error");
    }
  }

  // Initialize Dashboard Data
  fetchDashboardData();

  // Delete Category Handler (if needed)
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-category")) {
      e.preventDefault();
      const categoryId = e.target.dataset.categoryId;
      const confirmed = confirm("Are you sure you want to delete this category?");
      if (confirmed) {
        try {
          const response = await fetch(`/admin/categories/${categoryId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            e.target.closest("tr").remove();
            showToast("Category deleted successfully", "success");
          } else {
            const error = await response.json();
            showToast("Failed to delete category: " + error.error, "error");
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          showToast("Error deleting category", "error");
        }
      }
    }
  });
});