document.addEventListener("DOMContentLoaded", () => {
  // Handle OAuth error query parameters only (success redirects are handled directly now)
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const message = urlParams.get("message");

  // Handle OAuth errors only
  if (error) {
    console.error("OAuth error:", { error, message });
    const errorMessage = message
      ? decodeURIComponent(message)
      : getErrorMessage(error);
    showErrorMessage(errorMessage);

    // Clear URL parameters after showing error
    setTimeout(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 100);
  }

  // Helper functions for messages
  function showSuccessMessage(message) {
    const messageDiv = createMessageDiv(message, "success");
    document.body.insertBefore(messageDiv, document.body.firstChild);
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  function showErrorMessage(message) {
    const messageDiv = createMessageDiv(message, "error");
    document.body.insertBefore(messageDiv, document.body.firstChild);
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 8000);
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

  function getErrorMessage(error) {
    const errorMessages = {
      // Facebook specific errors
      facebook_access_denied:
        "Facebook access was denied. Please try again and grant necessary permissions.",
      facebook_auth_failed:
        "Facebook authentication failed. Please check your internet connection and try again.",
      facebook_server_error:
        "Facebook server error. Please try again in a few minutes.",

      // General errors
      auth_failed: "Social authentication failed. Please try again.",
      invalid_profile: "Invalid profile data received from social provider.",
      server_error: "Server error during authentication. Please try again.",
      database_error: "Database error occurred. Please try again.",

      // Network errors
      network_error:
        "Network connection error. Please check your internet and try again.",
    };

    return (
      errorMessages[error] ||
      (error.startsWith("facebook_")
        ? "Facebook authentication error. Please try again."
        : "An unknown error occurred during authentication.")
    );
  }

  // Tab switching functionality
  function showTab(tabId) {
    document
      .querySelectorAll(".tab")
      .forEach((tab) => tab.classList.remove("active"));
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));

    const targetTab = document.getElementById(tabId);
    if (targetTab) {
      targetTab.classList.add("active");
      const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
      if (targetBtn) targetBtn.classList.add("active");
    }
  }

  // Add event listeners for tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      showTab(tabId);
    });
  });

  // Facebook Auth Button Handler
  const facebookButton = document.querySelector(".social-btn.facebook");
  if (facebookButton) {
    facebookButton.addEventListener("click", async (e) => {
      e.preventDefault();

      // Show loading state
      const originalText = facebookButton.innerHTML;
      facebookButton.innerHTML = `
        <i class="fab fa-facebook-f"></i>
        <i class="fas fa-spinner fa-spin" style="margin-left: 5px;"></i>
        Connecting to Facebook...
      `;
      facebookButton.style.pointerEvents = "none";
      facebookButton.style.opacity = "0.7";

      try {
        // Redirect to Facebook auth
        window.location.href = "/api/auth/facebook";
      } catch (error) {
        console.error("Facebook auth error:", error);
        showErrorMessage("Failed to connect to Facebook. Please try again.");

        // Restore button state
        facebookButton.innerHTML = originalText;
        facebookButton.style.pointerEvents = "auto";
        facebookButton.style.opacity = "1";
      }
    });
  }

  // Google Auth Button Handler
  const googleButton = document.querySelector(".social-btn.google");
  if (googleButton) {
    googleButton.addEventListener("click", async (e) => {
      e.preventDefault();

      // Show loading state
      const originalText = googleButton.innerHTML;
      googleButton.innerHTML = `
        <i class="fab fa-google"></i>
        <i class="fas fa-spinner fa-spin" style="margin-left: 5px;"></i>
        Connecting to Google...
      `;
      googleButton.style.pointerEvents = "none";
      googleButton.style.opacity = "0.7";

      try {
        // Redirect to Google auth
        window.location.href = "/api/auth/google";
      } catch (error) {
        console.error("Google auth error:", error);
        showErrorMessage("Failed to connect to Google. Please try again.");

        // Restore button state
        googleButton.innerHTML = originalText;
        googleButton.style.pointerEvents = "auto";
        googleButton.style.opacity = "1";
      }
    });
  }

  // Email & Password form handling
  const emailForm = document.getElementById("emailForm");
  const roleSelect = document.getElementById("role");
  const mailingAddressRow = document.getElementById("mailingAddressRow");
  const passwordInput = document.getElementById("password-email");
  const confirmPasswordInput = document.getElementById(
    "confirm-password-email"
  );

  // Toggle mailing address based on role
  function toggleMailingAddress() {
    if (!mailingAddressRow || !roleSelect) return;

    const mailingAddressInput = document.getElementById("mailingAddress");
    const selectedRole = roleSelect.value;

    if (selectedRole === "client") {
      mailingAddressRow.style.display = "block";
      if (mailingAddressInput)
        mailingAddressInput.setAttribute("required", "required");
    } else {
      mailingAddressRow.style.display = "none";
      if (mailingAddressInput) {
        mailingAddressInput.removeAttribute("required");
        mailingAddressInput.value = "";
      }
    }
  }

  // Initialize mailing address visibility
  if (roleSelect) {
    toggleMailingAddress();
    roleSelect.addEventListener("change", toggleMailingAddress);
  }

  // Password strength checker
  function checkPasswordStrength(password) {
    const strengthBar = document.querySelector(".strength-fill");
    const strengthText = document.querySelector(".strength-text");

    if (!strengthBar || !strengthText) return;

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const percentage = (strength / 6) * 100;
    strengthBar.style.width = percentage + "%";

    if (strength <= 2) {
      strengthBar.className = "strength-fill weak";
      strengthText.textContent = "Weak";
      strengthText.className = "strength-text weak";
    } else if (strength <= 4) {
      strengthBar.className = "strength-fill medium";
      strengthText.textContent = "Medium";
      strengthText.className = "strength-text medium";
    } else {
      strengthBar.className = "strength-fill strong";
      strengthText.textContent = "Strong";
      strengthText.className = "strength-text strong";
    }
  }

  // Password input event listener
  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      checkPasswordStrength(passwordInput.value);
    });
  }

  // Password confirmation validation
  if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener("input", () => {
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const errorDiv = confirmPasswordInput
        .closest(".form-group")
        .querySelector(".error-message");

      if (errorDiv) {
        if (confirmPassword && password !== confirmPassword) {
          errorDiv.textContent = "Passwords do not match";
        } else {
          errorDiv.textContent = "";
        }
      }
    });
  }

  // Password toggle visibility
  const passwordToggle = document.querySelector(".password-toggle");
  if (passwordToggle) {
    passwordToggle.addEventListener("click", () => {
      togglePassword("password-email");
    });
  }

  // Password toggle function
  function togglePassword(inputId) {
    const passwordField = document.getElementById(inputId);
    if (!passwordField) return;

    const toggleButton =
      passwordField.parentNode.querySelector(".password-toggle i");
    if (!toggleButton) return;

    if (passwordField.type === "password") {
      passwordField.type = "text";
      toggleButton.className = "fas fa-eye-slash";
    } else {
      passwordField.type = "password";
      toggleButton.className = "fas fa-eye";
    }
  }

  // Form utility functions
  function clearErrors(form) {
    const errorMessages = form.querySelectorAll(".error-message");
    errorMessages.forEach((error) => {
      error.textContent = "";
      const group = error.closest(".form-group, .checkbox-group");
      if (group) group.classList.remove("error");
    });
  }

  function showError(form, fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field) {
      const errorDiv = field
        .closest(".form-group, .checkbox-group")
        .querySelector(".error-message");
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.closest(".form-group, .checkbox-group").classList.add("error");
      }
    }
  }

  function showLoading(btn) {
    btn.disabled = true;
    btn.classList.add("loading");
    const spinner = btn.querySelector(".loading-spinner");
    if (spinner) spinner.style.display = "inline-block";

    // Update button text
    const textNodes = Array.from(btn.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE
    );
    if (textNodes.length > 0) {
      textNodes[0].textContent = " Creating Account...";
    }
  }

  function hideLoading(btn) {
    btn.disabled = false;
    btn.classList.remove("loading");
    const spinner = btn.querySelector(".loading-spinner");
    if (spinner) spinner.style.display = "none";

    // Restore button text
    const textNodes = Array.from(btn.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE
    );
    if (textNodes.length > 0) {
      textNodes[0].textContent = " Sign Up";
    }
  }

  // Email Form Submission
  if (emailForm) {
    emailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(emailForm);

      const submitBtn = emailForm.querySelector(".submit-btn");
      showLoading(submitBtn);

      const formData = new FormData(emailForm);
      const data = Object.fromEntries(formData);

      // Process form data
      data.terms = document.getElementById("terms-email")?.checked
        ? "agreed"
        : "";
      data.newsletter =
        document.getElementById("newsletter-email")?.checked || false;

      // Client-side validation
      const errors = validateFormData(data);
      if (errors.length > 0) {
        errors.forEach(({ field, message }) => {
          showError(emailForm, field, message);
        });
        hideLoading(submitBtn);
        return;
      }

      try {
        const response = await fetch("/signup/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          localStorage.setItem("authToken", result.token);
          console.log("Email signup success:", result.redirectUrl);
          showSuccessMessage("Account created successfully! Redirecting...");

          setTimeout(() => {
            window.location.href = result.redirectUrl || "/client-page";
          }, 1500);
        } else {
          handleSignupError(emailForm, result);
        }
      } catch (error) {
        console.error("Signup error:", error);
        showError(emailForm, "email", "Network error. Please try again.");
      } finally {
        hideLoading(submitBtn);
      }
    });
  }

  function validateFormData(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push({
        field: "name",
        message: "Name must be at least 2 characters",
      });
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: "email", message: "Invalid email address" });
    }

    if (!data.password || data.password.length < 8) {
      errors.push({
        field: "password",
        message: "Password must be at least 8 characters",
      });
    }

    if (data.password !== data.confirmPassword) {
      errors.push({
        field: "confirmPassword",
        message: "Passwords do not match",
      });
    }

    if (!data.role) {
      errors.push({ field: "role", message: "Please select a role" });
    }
    if (!data.terms) {
      errors.push({ field: "terms", message: "You must agree to the terms" });
    }

    if (data.role === "client" && !data.mailingAddress) {
      errors.push({
        field: "mailingAddress",
        message: "Mailing address is required for clients",
      });
    }

    return errors;
  }

  function handleSignupError(form, result) {
    const message = result.message || "Signup failed. Please try again.";

    if (message.includes("already exists")) {
      showError(form, "email", "This email is already registered");
    } else if (message.includes("name")) {
      showError(form, "name", message);
    } else if (message.includes("email")) {
      showError(form, "email", message);
    } else if (message.includes("password")) {
      showError(form, "password", message);
    } else if (message.includes("mailing")) {
      showError(form, "mailingAddress", message);
    } else {
      showError(form, "email", message);
    }
  }
});
