// document.addEventListener("DOMContentLoaded", () => {
//   // Extract token and redirectUrl from query parameters
//   const urlParams = new URLSearchParams(window.location.search);
//   const token = urlParams.get("token");
//   const redirectUrl = decodeURIComponent(urlParams.get("redirectUrl"));

//   try {
//     // Store the token in localStorage
//     localStorage.setItem("authToken", token);
//     console.log("Token stored successfully");

//     // Redirect after a brief delay
//     setTimeout(() => {
//       window.location.href = redirectUrl;
//     }, 2000);
//   } catch (error) {
//     console.error("Error storing token:", error);
//     // Fallback: redirect immediately without token storage
//     window.location.href = redirectUrl;
//   }
// });
