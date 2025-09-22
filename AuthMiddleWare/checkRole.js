// Ensure user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login"); // Redirect unauthenticated users to login
};

// Ensure user is a Client
exports.ensureClient = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.role === "client") {
    return next();
  }
  res.redirect("/index"); // Redirect if not authenticated or wrong role
};

// Ensure user is a Sales Agent
exports.ensureSalesAgent = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.role === "salesAgent") {
    return next();
  }
  res.redirect("/index"); // Redirect if not authenticated or wrong role
};

// Ensure user is an Admin
exports.ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.redirect("/index"); // Redirect if not authenticated or wrong role
};
