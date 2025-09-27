document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const submitBtn = document.querySelector(".submit-btn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // --- Start of OAuth Callback Handling ---
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const error = urlParams.get("error");
  const redirectUrl = urlParams.get("redirectUrl");

  // Handle OAuth success or failure on the login page itself
  if (token && redirectUrl) {
    localStorage.setItem("authToken", token);
    console.log("OAuth token stored successfully.");
    showSuccessMessage("Login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = decodeURIComponent(redirectUrl);
    }, 1500);
  } else if (error) {
    console.error("OAuth authentication error:", error);
    showError("email", getErrorMessage(error));
  }
  // --- End of OAuth Callback Handling ---

  function getErrorMessage(error) {
    const errorMessages = {
      auth_failed: "Social authentication failed. Please try again.",
      invalid_profile: "Invalid profile data from social provider.",
      server_error: "Server error during authentication.",
      database_error: "Database error. Please try again later.",
      // You can add more specific error messages here for a better UX
    };
    return errorMessages[error] || "Authentication failed. Please try again.";
  }

  function showSuccessMessage(message) {
    const messageDiv = createMessageDiv(message, "success");
    document.body.insertBefore(messageDiv, document.body.firstChild);
    // Automatically remove after 5 seconds
    setTimeout(() => {
      if (messageDiv && messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  function createMessageDiv(message, type) {
    const div = document.createElement("div");
    div.className = `alert alert-${type}`;
    div.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      padding: 15px 25px; border-radius: 5px; z-index: 1000; max-width: 90%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: 500;
      ${
        type === "success"
          ? "background: #d4edda; color: #155724; border: 1px solid #c3e6cb;"
          : "background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;"
      }
    `;
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="fas fa-${
          type === "success" ? "check-circle" : "exclamation-triangle"
        }"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none; border: none; color: inherit; font-size: 18px; 
          cursor: pointer; margin-left: 10px; opacity: 0.7;
        ">×</button>
      </div>
    `;
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
    const textNodes = Array.from(submitBtn.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE
    );
    if (textNodes.length > 0) {
      textNodes[0].textContent = " Sign In";
    }
  }

  // Login form submission handler
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("=== EMAIL/PASSWORD LOGIN ATTEMPT STARTED ===");

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

  // Password toggle function
  window.togglePassword = function (fieldId) {
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
  };
});
