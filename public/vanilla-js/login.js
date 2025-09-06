document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const submitBtn = document.querySelector(".submit-btn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // Check for URL parameters (Google OAuth callback)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const role = urlParams.get("role");
  const error = urlParams.get("error");
  const redirectUrl = urlParams.get("redirectUrl");

  // Handle OAuth callback
  if (error) {
    console.error("Authentication error:", error);
    showError("email", getErrorMessage(error));
  } else if (token && redirectUrl) {
    localStorage.setItem("authToken", token);
    console.log("OAuth token stored successfully");
    showSuccessMessage("Login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = decodeURIComponent(redirectUrl);
    }, 1500);
    return;
  }

  function getErrorMessage(error) {
    const errorMessages = {
      auth_failed: "Google authentication failed. Please try again.",
      invalid_profile: "Invalid Google profile data.",
      server_error: "Server error during authentication.",
    };
    return errorMessages[error] || "Authentication failed.";
  }

  function showSuccessMessage(message) {
    const messageDiv = createMessageDiv(message, "success");
    document.body.insertBefore(messageDiv, document.body.firstChild);
  }

  function createMessageDiv(message, type) {
    const div = document.createElement("div");
    div.className = `alert alert-${type}`;
    div.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      padding: 15px 25px; border-radius: 5px; z-index: 1000;
      ${
        type === "success"
          ? "background: #d4edda; color: #155724; border: 1px solid #c3e6cb;"
          : "background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;"
      }
    `;
    div.textContent = message;
    return div;
  }

  function clearErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach((error) => {
      error.textContent = "";
      error.style.display = "none";
      const group = error.closest(".form-group");
      if (group) group.classList.remove("error");
    });
  }

  function showError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (field) {
      const errorDiv = field
        .closest(".form-group")
        .querySelector(".error-message");
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
        errorDiv.closest(".form-group").classList.add("error");
      }
    }
  }

  function showLoading() {
    if (!submitBtn) return;

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    const spinner = submitBtn.querySelector(".loading-spinner");
    if (spinner) spinner.style.display = "inline-block";

    // Update button text
    const textNodes = Array.from(submitBtn.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE
    );
    if (textNodes.length > 0) {
      textNodes[0].textContent = " Signing In...";
    }
  }

  function hideLoading() {
    if (!submitBtn) return;

    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");

    const spinner = submitBtn.querySelector(".loading-spinner");
    if (spinner) spinner.style.display = "none";

    // Restore button text
    const textNodes = Array.from(submitBtn.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE
    );
    if (textNodes.length > 0) {
      textNodes[0].textContent = " Sign In";
    }
  }

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("=== LOGIN ATTEMPT STARTED ===");

      clearErrors();
      showLoading();

      if (!emailInput || !passwordInput) {
        console.error("Login form elements not found");
        hideLoading();
        return;
      }

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      console.log("Login attempt for email:", email);

      // Basic validation
      if (!email || !password) {
        if (!email) showError("email", "Email is required");
        if (!password) showError("password", "Password is required");
        hideLoading();
        return;
      }

      const loginData = { email, password };

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        });

        console.log("Login response status:", response.status);
        const result = await response.json();
        console.log("Login response:", result);

        if (response.ok) {
          console.log("=== LOGIN SUCCESSFUL ===");

          if (result.token) {
            localStorage.setItem("authToken", result.token);
          }

          showSuccessMessage("Login successful! Redirecting...");
          setTimeout(() => {
            window.location.href = result.redirectUrl || "/dashboard";
          }, 1500);
        } else {
          console.log("=== LOGIN FAILED ===");
          handleLoginError(response.status, result);
        }
      } catch (error) {
        console.error("Network error during login:", error);
        showError(
          "email",
          "Network error. Please check your connection and try again."
        );
      } finally {
        hideLoading();
      }
    });
  }

  function handleLoginError(status, result) {
    const message = result.message || "Login failed. Please try again.";

    if (status === 401) {
      showError("email", "Invalid email or password");
      showError("password", "Invalid email or password");
    } else if (status === 400) {
      showError("email", message);
    } else {
      showError("email", message);
    }
  }

  // Auto-hide alert messages
  setTimeout(() => {
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach((alert) => {
      if (alert && alert.parentNode) {
        alert.style.opacity = "0";
        setTimeout(() => {
          if (alert.parentNode) alert.remove();
        }, 300);
      }
    });
  }, 5000);
});

// Password toggle function
function togglePassword(fieldId) {
  const passwordField = document.getElementById(fieldId);
  if (!passwordField) return;

  const toggleButton =
    passwordField.parentElement.querySelector(".password-toggle i");
  if (!toggleButton) return;

  if (passwordField.type === "password") {
    passwordField.type = "text";
    toggleButton.className = "fas fa-eye-slash";
  } else {
    passwordField.type = "password";
    toggleButton.className = "fas fa-eye";
  }
}
