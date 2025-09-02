// signup.js - Complete signup functionality

document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const roleSelect = document.getElementById("role");
  const mailingAddressRow = document.getElementById("mailingAddressRow");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitBtn = document.querySelector(".submit-btn");

  // Show/hide mailing address based on role
  function toggleMailingAddress() {
    const selectedRole = roleSelect.value;
    if (selectedRole === "client") {
      mailingAddressRow.style.display = "block";
      document
        .getElementById("mailingAddress")
        .setAttribute("required", "required");
    } else {
      mailingAddressRow.style.display = "none";
      document.getElementById("mailingAddress").removeAttribute("required");
      document.getElementById("mailingAddress").value = "";
    }
  }

  // Initialize mailing address visibility
  toggleMailingAddress();

  // Role change event listener
  roleSelect.addEventListener("change", toggleMailingAddress);

  // Password strength checker
  function checkPasswordStrength(password) {
    const strengthBar = document.querySelector(".strength-fill");
    const strengthText = document.querySelector(".strength-text");

    let strength = 0;

    // Check criteria
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Update strength indicator
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
  passwordInput.addEventListener("input", function () {
    checkPasswordStrength(this.value);
  });

  // Password confirmation validation
  confirmPasswordInput.addEventListener("input", function () {
    const password = passwordInput.value;
    const confirmPassword = this.value;
    const errorDiv = this.parentNode.parentNode.querySelector(".error-message");

    if (confirmPassword && password !== confirmPassword) {
      errorDiv.textContent = "Passwords do not match";
      errorDiv.style.display = "block";
    } else {
      errorDiv.textContent = "";
      errorDiv.style.display = "none";
    }
  });

  // Clear error messages
  function clearErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach((error) => {
      error.textContent = "";
      error.style.display = "none";
    });
  }

  // Show error message
  function showError(fieldName, message) {
    const field =
      document.getElementById(fieldName) ||
      document.querySelector(`[name="${fieldName}"]`);
    if (field) {
      const errorDiv = field
        .closest(".form-group")
        .querySelector(".error-message");
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
      }
    }
  }

  // Show loading state
  function showLoading() {
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    const spinner = submitBtn.querySelector(".loading-spinner");
    const text = submitBtn.childNodes[2]; // The text node
    spinner.style.display = "inline-block";
    text.textContent = " Creating Account...";
  }

  // Hide loading state
  function hideLoading() {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
    const spinner = submitBtn.querySelector(".loading-spinner");
    const text = submitBtn.childNodes[2];
    spinner.style.display = "none";
    text.textContent = " Create Account";
  }

  // Form submission
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    clearErrors();
    showLoading();

    // Get form data and create a JSON object
    const formData = new FormData(this);
    const data = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Ensure checkbox values are properly set
    data.terms = document.getElementById("terms").checked ? "agreed" : "";
    data.newsletter = document.getElementById("newsletter").checked
      ? "subscribed"
      : "";

    console.log("Raw signup data:", data);

    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Store token in localStorage
        if (result.token) {
          localStorage.setItem("authToken", result.token);
          console.log("Token stored in localStorage");
        }
        // Redirect based on backend response
        if (result.redirectUrl) {
          console.log("Redirecting to:", result.redirectUrl);
          alert("Account created successfully! Redirecting to login...");
          window.location.href = result.redirectUrl;
        } else {
          alert("Account created successfully! Please login to continue.");
          window.location.href = "/login";
        }
      } else {
        // Handle validation errors from the backend
        if (result.message) {
          if (result.message.includes("name")) {
            showError("name", result.message);
          } else if (result.message.includes("email")) {
            showError("email", result.message);
          } else if (result.message.includes("password")) {
            showError("password", result.message);
          } else if (result.message.includes("mailing")) {
            showError("mailingAddress", result.message);
          } else if (result.message.includes("already exists")) {
            showError("email", "This email is already registered");
          } else {
            alert(result.message);
          }
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during signup. Please try again.");
    } finally {
      hideLoading();
    }
  });
});

// Password toggle function (called from HTML)
function togglePassword(fieldId) {
  const passwordField = document.getElementById(fieldId);
  const toggleButton =
    passwordField.parentNode.querySelector(".password-toggle i");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    toggleButton.className = "fas fa-eye-slash";
  } else {
    passwordField.type = "password";
    toggleButton.className = "fas fa-eye";
  }
}
