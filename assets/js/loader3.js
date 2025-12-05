// assets/js/loader.js

document.addEventListener("DOMContentLoaded", function() {
    // Step 1: Get the current URL path
    const urlPath = window.location.pathname; // e.g., '/industries'
    
    // Step 2: Extract the last segment from the URL
    const segments = urlPath.split('/'); // Split the path by '/'
    const currentPage = segments[segments.length - 1]; // Get the last segment (e.g., 'industries')

    // Step 3: Use the extracted segment in the components array
    const components = [
        '../components/header.html',
        `../components/${currentPage}-hero.html`, // Dynamically include the correct hero component
        '../components/services-stats.html',
        '../components/faces.html',
        `../components/featured-${currentPage}.html`, // Dynamically use the page variable
        '../components/services-types.html',
        '../components/portfolio.html',
        '../components/call-to-action.html',
        '../components/footer.html',
    ];

    // Step 4: Load components dynamically
    components.forEach((component, index) => {
        fetch(component)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                document.getElementById(index + 1).innerHTML = data; // Set the HTML content
            })
            .catch(error => console.error('Error loading component:', error));
    });
});