// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Mobile Menu Toggle Functionality
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", function (event) {
      // Prevent event from bubbling up to the document click listener
      event.stopPropagation();
      // Toggle active class on menu button for hamburger animation
      mobileMenuBtn.classList.toggle("active");
      // Toggle active class on mobile menu to show/hide it
      mobileMenu.classList.toggle("active");
    });

    // Close mobile menu when clicking on a menu item
    const mobileMenuLinks = mobileMenu.querySelectorAll("a, button");
    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", function () {
        mobileMenuBtn.classList.remove("active");
        mobileMenu.classList.remove("active");
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (event) {
      // Check if the click is outside both the button and the menu
      if (
        !mobileMenuBtn.contains(event.target) &&
        !mobileMenu.contains(event.target)
      ) {
        mobileMenuBtn.classList.remove("active");
        mobileMenu.classList.remove("active");
      }
    });
  }

  // Hero Slider Functionality
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroIndicators = document.querySelectorAll(".indicator");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const heroSection = document.querySelector(".hero");

  let currentSlide = 0;
  const totalSlides = heroSlides.length;
  let slideInterval;

  function showSlide(index) {
    // Remove active class from all slides and indicators
    heroSlides.forEach((slide) => slide.classList.remove("active"));
    heroIndicators.forEach((indicator) => indicator.classList.remove("active"));

    // Add active class to current slide and indicator
    if (heroSlides[index] && heroIndicators[index]) {
      heroSlides[index].classList.add("active");
      heroIndicators[index].classList.add("active");
    }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
  }

  function startSlideshow() {
    slideInterval = setInterval(nextSlide, 3000);
  }

  function stopSlideshow() {
    clearInterval(slideInterval);
  }

  // Initialize slideshow
  if (totalSlides > 1) {
    showSlide(currentSlide); // Set the initial slide
    startSlideshow();
  }

  // Event listeners for hero controls
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopSlideshow();
      nextSlide();
      startSlideshow();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stopSlideshow();
      prevSlide();
      startSlideshow();
    });
  }

  // Event listeners for indicators
  heroIndicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      stopSlideshow();
      currentSlide = index;
      showSlide(currentSlide);
      startSlideshow();
    });
  });

  // Pause slideshow on hover
  if (heroSection) {
    heroSection.addEventListener("mouseenter", stopSlideshow);
    heroSection.addEventListener("mouseleave", startSlideshow);
  }

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Login and Signup button functionality
  const loginButtons = document.querySelectorAll(
    ".btn-login, .btn-login-large, .mobile-login"
  );
  const signupButtons = document.querySelectorAll(
    ".btn-signup, .btn-signup-large, .mobile-signup"
  );

  // Redirect to /login page on click
  loginButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/login";
    });
  });

  // Redirect to /signup page on click
  signupButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/signup";
    });
  });

  // Explore Collection buttons
  const exploreButtons = document.querySelectorAll(".btn-explore");
  exploreButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      // Redirect to the login page for now since a user needs to be logged in to view
      window.location.href = "/login";
    });
  });

  // YouTube Play Button Functionality
  const playButton = document.querySelector(".play-button");
  const iframe = document.querySelector(".video-container iframe");
  if (playButton && iframe) {
    playButton.addEventListener("click", (e) => {
      e.preventDefault();
      iframe.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        "*"
      );
      playButton.parentElement.style.opacity = "0"; // Hide overlay after click
    });
  }

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document
    .querySelectorAll(".feature-card, .collection-card, .review-card")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });

  // Add loading animation
  document.body.style.opacity = "1";
  document.body.style.transition = "opacity 0.5s ease";
});
