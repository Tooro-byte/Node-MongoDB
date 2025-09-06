document.addEventListener("DOMContentLoaded", () => {
  // Handle Google OAuth callback query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const role = urlParams.get("role");
  const error = urlParams.get("error");
  const redirectUrl = urlParams.get("redirectUrl");
  const googleAuth = urlParams.get("googleAuth");

  if (token && role && redirectUrl && googleAuth) {
    // Store token and redirect for Google OAuth success
    localStorage.setItem("authToken", token);
    console.log("Google OAuth success:", {
      token: token.substring(0, 20) + "...",
      role,
      redirectUrl,
    });

    // Show success message briefly before redirecting
    showSuccessMessage(
      "Google authentication successful! Redirecting to dashboard..."
    );

    setTimeout(() => {
      window.location.href = decodeURIComponent(redirectUrl);
    }, 2000);
    return;
  }

  if (error) {
    console.error("Google OAuth error:", error);
    showErrorMessage(getErrorMessage(error));
  }

  // Helper functions for messages
  function showSuccessMessage(message) {
    const messageDiv = createMessageDiv(message, "success");
    document.body.insertBefore(messageDiv, document.body.firstChild);
    setTimeout(() => messageDiv.remove(), 5000);
  }

  function showErrorMessage(message) {
    const messageDiv = createMessageDiv(message, "error");
    document.body.insertBefore(messageDiv, document.body.firstChild);
    setTimeout(() => messageDiv.remove(), 8000);
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

  function getErrorMessage(error) {
    const errorMessages = {
      auth_failed: "Google authentication failed. Please try again.",
      invalid_profile: "Invalid Google profile data received.",
      server_error: "Server error during authentication. Please try again.",
    };
    return (
      errorMessages[error] || "An unknown error occurred during authentication."
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
            window.location.href = result.redirectUrl || "/dashboard";
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

    if (!data.name || data.name.length < 3) {
      errors.push({
        field: "name",
        message: "Name must be at least 3 characters",
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
