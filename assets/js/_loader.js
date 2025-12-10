/* Preloader script starts */
// Define the variable from the parentlink meta tag
var parentLinkMeta = document.querySelector('meta[name="parentlink"]');
var parentLink = parentLinkMeta ? parentLinkMeta.getAttribute('content') : null;

if (parentLink) {
    // Construct the URL for the additional content
    var linkParts = parentLink.split('/');
    var lastPart = linkParts.pop();
    var additionalContentUrl = linkParts.join('/') + '/' + lastPart + '-about.html';

    // Fetch the additional content
    fetch(additionalContentUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Append the fetched content to #additional-content
            var additionalContent = document.getElementById('additional-content');
            if (additionalContent) {
                additionalContent.innerHTML = data;
            } else {
                console.error('#additional-content element not found.');
            }
        })
        .catch(error => {
            console.error('Error loading additional content:', error);
            // Optionally handle error cases, e.g., display a message or fallback content
        });
} else {
    console.error('No parentlink meta tag found.');
}

// Load components when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}

function loadComponents() {
    // Get all divs with data-loader attribute
    var loaderDivs = document.querySelectorAll('div[data-loader]');
    
    loaderDivs.forEach(function(div) {
        var url = div.getAttribute('data-loader');
        var id = div.getAttribute('id');
        
        // Fetch the component
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load: ' + url);
                }
                return response.text();
            })
            .then(data => {
                // Insert the fetched content after the div
                div.insertAdjacentHTML('afterend', data);
                // Optionally remove or hide the loader div
                // div.style.display = 'none';
            })
            .catch(error => {
                console.error('Error loading component for #' + id + ':', error);
            });
    });
}


/* navbar toggler script for header starts */
function navbartoggle(x) {
  x.classList.toggle("change");
}
/* navbar toggler script for header ends */

/* number counter animation */
document.querySelectorAll('.number-counter .number-counter__number-counter-column_counter-count .count').forEach(function(element) {
    const target = parseFloat(element.textContent);
    const duration = 4000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeInOutQuad (similar to jQuery's 'swing')
        const easing = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const current = easing * target;
        element.textContent = Math.ceil(current);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
});

/* Bootstrap collapse functionality for mobile nav */
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.querySelector('[data-toggle="collapse"]');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                // Toggle aria-expanded
                this.setAttribute('aria-expanded', !isExpanded);
                
                // Toggle collapse class
                targetElement.classList.toggle('show');
                
                // Toggle icon animation
                navbartoggle(this);
            }
        });
    }
});

//- Load sidebar image based on current page URL

function loadSidebarImage() {
    // Get current page URL
    const currentUrl = window.location.pathname;
    
    // Extract page slug from URL
    // Examples: /about → about, /programs/mentoring → programs-mentoring
    let slug = currentUrl
        .replace(/^\//, '')           // Remove leading slash
        .replace(/\/$/, '')           // Remove trailing slash
        .replace(/\//g, '-')          // Replace slashes with dashes
        .replace(/\.html$/, '');      // Remove .html extension
    
    // If homepage, use default
    if (!slug || slug === 'index') {
        slug = 'home';
    }
    
    // Construct image path
    const imagePath = `/images/${slug}.png`;
    
    // Create sidebar HTML
    const sidebarHTML = `
        <div id="sidebar-image" style="
            position: fixed;
            left: 0;
            top: 86px;
            width: 20%;
            height: calc(100vh - 86px);
            background-image: url('${imagePath}');
            background-size: cover;
            background-position: center;
            z-index: 100;
        ">
            <img src="${imagePath}" alt="Page illustration" style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            " onerror="this.parentElement.style.display='none';">
        </div>
    `;
    
    // Insert sidebar before main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.insertAdjacentHTML('beforebegin', sidebarHTML);
        
        // Shift main content to the right
        mainContent.style.marginLeft = '20%';
        mainContent.style.width = '80%';
    }
    
    console.log('🖼️ Sidebar image loaded:', imagePath);
}

// Load on DOM ready
document.addEventListener('DOMContentLoaded', loadSidebarImage);