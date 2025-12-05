// assets/js/loader.js
(function () {
    const loaderScript = document.getElementById("loaderScript");

    // Check if the script should run and if the <head> is not present
    if (loaderScript.getAttribute("run") === "true") {
        // Check if <head> already exists
        // Fetch the external head template

        (function () {
            var gtmId = 'G-VK4JWHDC1Z'; // Replace with your GTM ID
            var gtagScript = document.createElement('script');

            gtagScript.async = true;
            gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + gtmId;
            document.head.appendChild(gtagScript);

            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', gtmId);
        })();

        // Fetch the contents of the HTML file
        fetch('/components/template-head.html')
            .then(response => {
                // Check if the response is okay (status in the range 200-299)
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.text(); // Get the response as text
            })
            .then(htmlContent => {
                // Prepend the entire HTML content directly to the <head>
                document.head.insertAdjacentHTML('afterbegin', htmlContent);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

        // After the head is loaded, set 'run' to false
        loaderScript.setAttribute("run", "false");

        // Now load the other components
        loadComponents(); // Calling the function to load components
    } else { // Corrected placement of else
        console.log("The script will not run as 'run' is set to false.");
    }


    function loadComponents() {
        // This function will load the other components
        const urlPath = window.location.pathname;
        const baseUrl = window.location.href; // Get the full URL for comparison
        const segments = urlPath.split('/');
        const currentPage = segments[segments.length - 1]; // Extract the current page

        // Create and append the divs to the body
        const divIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        divIds.forEach(id => {
            const div = document.createElement('div');
            div.id = id;
            document.body.appendChild(div);
        });

        // Fetch the JSON data from the script tag
        const jsonData = JSON.parse(document.getElementById("data").textContent);
        console.log(jsonData);

        // Parse item-html once
        const itemHtml = jsonData['item-html'];

        let components = [];
        let heroHtml = ''; // Initialize heroHtml variable

        // Check if jsonData and title are valid
        if (jsonData && jsonData.is_draft !== true) {
            if (baseUrl.includes('/programs')) {
                heroHtml = '/components/hero-programs.html'; // Set heroHtml for programs
                components = [
                    '/components/header.html',
                    // Conditional inclusion of itemHtml for programs
                    ...(itemHtml ? [itemHtml] : [heroHtml]), // Use itemHtml if it's not null or empty
                    '/components/list-programs.html',
                    '/components/services-stats.html',
                    '/components/faces.html',
                    '/components/featured-programs.html',
                    '/components/services-types.html',
                    '/components/portfolio.html',
                    '/components/footer.html',
                ];
            }
            else if (baseUrl.includes('/people')) {
                heroHtml = '/components/hero-people.html'; // Set heroHtml for people
                components = [
                    '/components/header.html',
                    ...(itemHtml ? [itemHtml] : [heroHtml]), // Use itemHtml if it's not null or empty
                    '/components/list-people.html',
                    '/components/services-stats.html',
                    '/components/faces.html',
                    '/components/featured-people.html',
                    '/components/services-types.html',
                    '/components/portfolio.html',
                    '/components/footer.html',
                ];
            }
            else if (baseUrl.includes('/blog')) {
                heroHtml = '/components/hero-blog.html'; // Set heroHtml for blog
                components = [
                    '/components/header.html',
                    ...(itemHtml ? [itemHtml] : [heroHtml]), // Use itemHtml if it's not null or empty
                    '/components/blog-posts.html',
                    '/components/services-stats.html',
                    '/components/faces.html',
                    '/components/featured-blog.html',
                    '/components/services-types.html',
                    '/components/portfolio.html',
                    '/components/footer.html',
                ];
            }
            else if (baseUrl.includes('/partners')) {
                heroHtml = '/components/hero-partners.html'; // Set heroHtml for partners
                components = [
                    '/components/header.html',
                    ...(itemHtml ? [itemHtml] : [heroHtml]), // Use itemHtml if it's not null or empty
                    '/components/list-partners.html',
                    '/components/services-stats.html',
                    '/components/faces.html',
                    '/components/featured-partners.html',
                    '/components/services-types.html',
                    '/components/portfolio.html',
                    '/components/footer.html',
                ];
            }
            else {
                // Default components if none of the above match
                components = [
                    '/components/header.html',
                    `/components/hero-${currentPage}.html`, // Use current page data
                    '/components/services-stats.html',
                    '/components/faces.html',
                    `/components/featured-${currentPage}.html`, // Use current page data
                    '/components/services-types.html',
                    '/components/portfolio.html',
                    '/components/call-to-action.html',
                    '/components/footer.html',
                ];
            }
        } else {
            // Fallback components if is_draft is true
            components = [
                '/components/header.html',
                '/components/hero-comingsoon.html', // Default to coming soon
                '/components/services-stats.html',
                '/components/faces.html',
                '/components/featured-people.html', // Default to featured people
                '/components/services-types.html',
                '/components/portfolio.html',
                '/components/call-to-action.html',
                '/components/footer.html',
            ];
        }

        // Load other components after handling the special case for partners
        const fetchPromises = components.map((component, index) => {
            // Check if the current component is itemHtml
            if (component === itemHtml) {
                document.getElementById(divIds[index]).innerHTML = itemHtml; // Set the HTML content directly
                return Promise.resolve(); // Resolve immediately since we set the content directly
            }
            // Fetching heroHtml if itemHtml does not exist
            else if (component === heroHtml) {
                return fetch(heroHtml)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.text().then(data => {
                            document.getElementById(divIds[index]).innerHTML = data; // Set the HTML content
                        });
                    });
            } else {
                return fetch(component)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.text().then(data => {
                            document.getElementById(divIds[index]).innerHTML = data; // Set the HTML content
                        });
                    });
            }
        });

        // Wait for all fetch promises to resolve
        Promise.all(fetchPromises)
            .then(() => {
                console.log("All components loaded successfully.");
                populatePlaceholders();
            })
            .catch(error => console.error('Error loading component:', error));
    }

    // Loading data
    function populatePlaceholders() {
        // Fetch the JSON data from the script tag
        const jsonData = JSON.parse(document.getElementById("data").textContent);
        console.log(jsonData);

        // Check if the title in JSON data is present and not null before populating
        if (jsonData && jsonData.is_draft === false ) {
            document.title = jsonData.title;
            console.log(document.title);
            document.querySelector('meta[name="description"]').setAttribute("content", jsonData.description || ''); // Fallback to empty string if description is undefined
            document.querySelector('meta[name="keywords"]').setAttribute("content", jsonData.keywords || ''); // Fallback to empty string if keywords is undefined
            document.querySelector('link[rel="canonical"]').setAttribute("href", `https://${jsonData.domain}/${jsonData.url}`);
            document.querySelector('script[type="application/ld+json"]').textContent = JSON.stringify(jsonData['ld-script']);
        } else {
            console.warn("Title is null or empty in JSON data. Placeholders not populated.");
        }
    }
})();

// loader js Add event listener to detect Ctrl+E key combination


document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 'q') {
        event.preventDefault(); // Prevent default behavior of the key combination

        // Get the current page's HTML
        const current_html = document.documentElement.outerHTML;

        // Get the current domain and path
        const domain = window.location.hostname; // This will get 'cfeglobal.org'
        const path = window.location.pathname; // This will get '/category/item.html'

        // Extract category from the path
        const path_segments = path.split('/').filter(segment => segment); // Split path and filter empty segments
        const category = path_segments.length > 0 ? path_segments[0] : ''; // Get the first segment as category

        // Get the existing JSON data from the <script> tag
        const data_element = document.getElementById('data');
        const data = JSON.parse(data_element.innerHTML); // Parse the JSON data

        // Update the JSON object with the new domain, url, and category
        data.domain = domain; // Update domain
        console.log("domain: " + data.domain);
        data.path = path;      // Update url
        console.log("path: " + data.path);
        data.category = category; // Add/update category field
        console.log("category: " + data.category);

        // Construct the URL for the template based on the category
        const template_url = `https://${domain}/components/template-${category}.html`;
        console.log("template_url: " + template_url);

        // Fetch the template HTML
        fetch(template_url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.text(); // Get the response as text
            })
            .then(template_html => {
                // Set the fetched HTML into the data object
                data.template_html = template_html;
                console.log("template_html: " + data.template_html);

                // Store the updated JSON object back as a string in the existing HTML
                data_element.innerHTML = JSON.stringify(data); // Update the <script> element with the modified JSON

                // Store the updated HTML in session storage
                sessionStorage.setItem('edit_content', current_html);

                // Redirect to the edit page
                window.location.href = '/components/edit_html.html';
            })
            .catch(error => {
                console.error("Error fetching the template HTML:", error);
            });
    }
});

