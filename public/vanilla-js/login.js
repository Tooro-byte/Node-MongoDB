// login.js - Complete login functionality with enhanced debugging

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const submitBtn = document.querySelector(".submit-btn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

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
    const field = document.getElementById(fieldName);
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
    const textNode = submitBtn.childNodes[2]; // The text node after the icon
    if (spinner) spinner.style.display = "inline-block";
    if (textNode) textNode.textContent = " Signing In...";
  }

  // Hide loading state
  function hideLoading() {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
    const spinner = submitBtn.querySelector(".loading-spinner");
    const textNode = submitBtn.childNodes[2];
    if (spinner) spinner.style.display = "none";
    if (textNode) textNode.textContent = " Sign In";
  }

  // Form submission
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    console.log("=== LOGIN ATTEMPT STARTED ===");
    clearErrors();
    showLoading();

    // Get raw values
    const rawEmail = emailInput.value;
    const rawPassword = passwordInput.value;

    console.log("Raw email from input:", rawEmail);
    console.log("Raw password length:", rawPassword.length);

    // Process email exactly like your backend expects
    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword;

    console.log("Processed email:", email);
    console.log("Email after processing length:", email.length);

    // Basic validation
    if (!email || !password) {
      console.log("Validation failed - missing email or password");
      if (!email) showError("email", "Email is required");
      if (!password) showError("password", "Password is required");
      hideLoading();
      return;
    }

    // Prepare data exactly as your backend expects
    const loginData = {
      email: email,
      password: password,
    };

    console.log("=== SENDING TO BACKEND ===");
    console.log("Login data being sent:", {
      email: loginData.email,
      password: "[HIDDEN - Length: " + loginData.password.length + "]",
    });

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      console.log("=== BACKEND RESPONSE ===");
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // Get response text first
      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("Parsed response:", result);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        showError("email", "Server error. Please try again later.");
        hideLoading();
        return;
      }

      if (response.ok) {
        console.log("=== LOGIN SUCCESSFUL ===");
        console.log("Success result:", result);

        // Store token if provided
        if (result.token) {
          localStorage.setItem("authToken", result.token);
          console.log("Token stored in localStorage");
        }

        // Redirect based on backend response
        if (result.redirectUrl) {
          console.log("Redirecting to:", result.redirectUrl);
          window.location.href = result.redirectUrl;
        } else {
          console.log("No redirectUrl provided, using fallback");
          window.location.href = "/client/dashboard";
        }
      } else {
        console.log("=== LOGIN FAILED ===");
        console.log("Error result:", result);

        // Handle specific error cases
        if (response.status === 401) {
          console.log("401 Unauthorized - Invalid credentials");
          showError("email", "Invalid email or password");
          showError("password", "Invalid email or password");
        } else if (response.status === 400) {
          console.log("400 Bad Request");
          showError("email", result.message || "Invalid request");
        } else if (response.status === 500) {
          console.log("500 Server Error");
          showError("email", "Server error. Please try again later.");
        } else {
          console.log("Other error status:", response.status);
          showError(
            "email",
            result.message || "Login failed. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("=== NETWORK ERROR ===");
      console.error("Error details:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showError("email", "Network error. Please check your connection.");
      } else {
        showError("email", "An unexpected error occurred. Please try again.");
      }
    } finally {
      hideLoading();
    }
  });

  // Auto-dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alert) => {
    setTimeout(() => {
      if (alert && alert.parentNode) {
        alert.style.opacity = "0";
        setTimeout(() => {
          if (alert.parentNode) {
            alert.remove();
          }
        }, 300);
      }
    }, 5000);
  });
});

// Password toggle function
function togglePassword() {
  const passwordField = document.getElementById("password");
  const toggleButton = document.querySelector(".password-toggle i");

  if (passwordField && toggleButton) {
    if (passwordField.type === "password") {
      passwordField.type = "text";
      toggleButton.className = "fas fa-eye-slash";
    } else {
      passwordField.type = "password";
      toggleButton.className = "fas fa-eye";
    }
  }
}

// Close alert function
function closeAlert() {
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alert) => {
    alert.style.opacity = "0";
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 300);
  });
}

// Demo login functionality
function fillDemo(userType) {
  console.log("Attempting demo login for:", userType);
  fetch("/demo-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userType }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("Demo login response:", result);
      if (result.token) {
        localStorage.setItem("authToken", result.token);
        console.log("Token stored in localStorage");
        window.location.href = result.redirectUrl || "/client/dashboard";
      } else {
        showError("email", result.message || "Demo login failed");
      }
    })
    .catch((error) => {
      console.error("Demo login error:", error);
      showError("email", "An error occurred during demo login");
    });
}

// Social login function
function socialLogin(provider) {
  alert(
    `Social login with ${provider} is not implemented yet. Please use email/password login.`
  );
}
