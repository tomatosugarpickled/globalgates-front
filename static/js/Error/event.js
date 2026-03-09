document.addEventListener("DOMContentLoaded", function () {
    // Log the 404 error with the attempted path
    console.error(
        "404 Error: User attempted to access non-existent route:",
        window.location.pathname,
    );
});
