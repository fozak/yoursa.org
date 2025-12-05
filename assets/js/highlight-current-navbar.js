// Function to update active navigation links
function updateActiveNavLinks() {
    // Get the current URL path
    const currentPath = window.location.pathname;

    // Select all navigation links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    // Loop through each link to check if it matches the current URL
    navLinks.forEach(link => {
        // Remove 'active' class from all links
        link.classList.remove('active');

        // Check if the link's href matches the current URL path
        if (link.getAttribute('href') === currentPath) {
            // Add 'active' class to the matching link
            link.classList.add('active');
        }
    });

    // Special case for the Home link to ensure it is only active on '/'
    const homeLink = document.querySelector('a[href="/"]');
    if (currentPath !== '/') {
        homeLink.classList.remove('active');
    }
}

// Use setTimeout to wait for 2 seconds before executing the function
setTimeout(() => {
    updateActiveNavLinks();
}, 300);