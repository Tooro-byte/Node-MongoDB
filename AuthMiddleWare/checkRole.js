// AuthMiddleWare/checkRole.js

// Ensure user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // Correct redirect for unauthenticated users
  res.redirect("/login");
};

// Ensure user is a Client
exports.ensureClient = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.role === "client") {
    return next();
  }
  // Correct redirect for unauthorized roles
  res.redirect("/");
};

// Ensure user is a Sales Agent
exports.ensureSalesAgent = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.role === "salesAgent") {
    return next();
  }
  // Correct redirect for unauthorized roles
  res.redirect("/");
};

// Ensure user is an Admin
exports.ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  // FIX APPLIED: Redirect unauthorized users to the home page ('/')
  // instead of the non-existent '/index'.
  res.redirect("/");
};
