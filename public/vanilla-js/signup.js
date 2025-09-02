// Role change handler - Show/hide mailing address based on role selection
const roleField = document.getElementById("role");
const mailingAddressRow = document.getElementById("mailingAddressRow");
const mailingAddressField = document.getElementById("mailingAddress");

// Initially hide mailing address if role is not client
function toggleMailingAddress() {
  if (roleField.value === "client") {
    mailingAddressRow.style.display = "block";
    mailingAddressField.setAttribute("required", "");
  } else {
    mailingAddressRow.style.display = "none";
    mailingAddressField.removeAttribute("required");
    mailingAddressField.value = ""; // Clear the field when hidden
    // Clear any error messages
    const formGroup = mailingAddressField.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");
    formGroup.classList.remove("error");
    errorElement.textContent = "";
  }
}

// Set initial state
toggleMailingAddress();

// Listen for role changes
roleField.addEventListener("change", toggleMailingAddress);

// Password toggle functionality
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  const toggle = field.nextElementSibling.querySelector("i");

  if (field.type === "password") {
    field.type = "text";
    toggle.classList.remove("fa-eye");
    toggle.classList.add("fa-eye-slash");
  } else {
    field.type = "password";
    toggle.classList.remove("fa-eye-slash");
    toggle.classList.add("fa-eye");
  }
}

// Password strength checker
const passwordField = document.getElementById("password");
const strengthBar = document.querySelector(".strength-fill");
const strengthText = document.querySelector(".strength-text");

passwordField.addEventListener("input", function () {
  const password = this.value;
  const strength = checkPasswordStrength(password);

  strengthBar.className = "strength-fill " + strength.class;
  strengthText.textContent = strength.text;
});

function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score < 2) return { class: "weak", text: "Weak" };
  if (score < 4) return { class: "medium", text: "Medium" };
  return { class: "strong", text: "Strong" };
}

// Form validation
const form = document.getElementById("signupForm");
const submitBtn = document.querySelector(".submit-btn");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Clear previous errors
  document
    .querySelectorAll(".error-message")
    .forEach((el) => (el.textContent = ""));
  document
    .querySelectorAll(".form-group")
    .forEach((el) => el.classList.remove("error"));

  let isValid = true;

  // Validate password match
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    showError("confirmPassword", "Passwords do not match");
    isValid = false;
  }

  // Validate terms checkbox
  const terms = document.getElementById("terms");
  if (!terms.checked) {
    showError("terms", "You must accept the terms and conditions");
    isValid = false;
  }

  if (isValid) {
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    // Simulate form submission
    setTimeout(() => {
      form.submit();
    }, 1500);
  }
});

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const formGroup =
    field.closest(".form-group") || field.closest(".checkbox-group");
  const errorElement = formGroup.querySelector(".error-message");

  formGroup.classList.add("error");
  errorElement.textContent = message;
}

// Real-time validation
document.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("blur", function () {
    validateField(this);
  });

  field.addEventListener("input", function () {
    if (this.classList.contains("error")) {
      validateField(this);
    }
  });
});

function validateField(field) {
  const formGroup =
    field.closest(".form-group") || field.closest(".checkbox-group");
  const errorElement = formGroup.querySelector(".error-message");

  formGroup.classList.remove("error");
  errorElement.textContent = "";

  // Basic validation
  if (field.hasAttribute("required") && !field.value.trim()) {
    showError(field.id, "This field is required");
    return false;
  }

  // Email validation
  if (field.type === "email" && field.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      showError(field.id, "Please enter a valid email address");
      return false;
    }
  }

  return true;
}
