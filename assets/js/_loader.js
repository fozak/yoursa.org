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

/* Bootstrap collapse functionality for mobile nav - using event delegation */
document.addEventListener('click', function(e) {
    const toggleButton = e.target.closest('[data-toggle="collapse"]');
    
    if (toggleButton) {
        const targetId = toggleButton.getAttribute('data-target');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            
            // Toggle aria-expanded
            toggleButton.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle collapse class
            targetElement.classList.toggle('show');
            
            // Toggle icon animation
            navbartoggle(toggleButton);
        }
    }
});

/* End of mobile menue script */

function loadSidebarImage() {
    const currentUrl = window.location.pathname;
    
    if (!currentUrl.includes('/blog/')) return;
    
    const urlParts = currentUrl.split('/');
    let slug = urlParts[urlParts.length - 1].replace(/\.html$/, '');
    
    if (!slug) slug = 'home';
    
    const svgPath = `/images/${slug}.svg`;
    const pngPath = `/images/${slug}.png`;
    
    const img = new Image();
    img.onload = function() {
        const sidebar = document.createElement('div');
        sidebar.id = 'sidebar-image';
        sidebar.innerHTML = `<img src="${img.src}" alt="">`;
        
        const mainContent = document.getElementById('main-content');
        mainContent.insertAdjacentElement('afterbegin', sidebar); // Inside main-content
        
        /*mainContent.style.marginLeft = '30%';*/
    };
    
    img.onerror = function() {
        const pngImg = new Image();
        pngImg.onload = function() {
            const sidebar = document.createElement('div');
            sidebar.id = 'sidebar-image';
            sidebar.innerHTML = `<img src="${pngPath}" alt="">`;
            
            const mainContent = document.getElementById('main-content');
            mainContent.insertAdjacentElement('afterbegin', sidebar); // Inside main-content
            
            /*mainContent.style.marginLeft = '30%';*/
        };
        pngImg.src = pngPath;
    };
    
    img.src = svgPath;
}

document.addEventListener('DOMContentLoaded', loadSidebarImage);

//scrolling

if (typeof ScrollingText !== "function") {
            class ScrollingText extends HTMLElement {
                constructor() {
                    super();
                    
                    // Get dimensions helper
                    const getWidth = (element) => {
                        const rect = element.getBoundingClientRect();
                        return rect.right - rect.left;
                    };

                    // Main scrolling controller
                    class ScrollingController {
                        constructor(box, speed) {
                            const innerElement = box.children?.[0];
                            if (!innerElement) throw new Error("No child node found");
                            
                            innerElement.style.position = "relative";
                            this.position = 0;
                            this.speed = speed;
                            this.box = box;
                            this.innerElement = innerElement.cloneNode(true);
                            this.boxWidth = 0;
                            this.innerElementWidth = 0;
                            this._running = false;
                            
                            this.refreshWidths();
                            this.setupChildren();
                        }

                        refreshWidths() {
                            this.boxWidth = getWidth(this.box);
                            this.innerElementWidth = getWidth(this.box.children[0]);
                        }

                        calculateNumElements() {
                            return Math.ceil(this.boxWidth / this.innerElementWidth) + 1;
                        }

                        setupChildren() {
                            const qty = this.calculateNumElements();
                            const currentChildren = this.box.children.length;

                            if (qty > currentChildren) {
                                for (let i = currentChildren; i < qty; i++) {
                                    this.box.appendChild(this.innerElement.cloneNode(true));
                                }
                            } else if (qty < currentChildren) {
                                for (let i = qty; i < currentChildren; i++) {
                                    this.box.removeChild(this.box.lastChild);
                                }
                            }
                        }

                        nextFrame(delta, direction) {
                            this.refreshWidths();
                            this.setupChildren();

                            Array.from(this.box.children).forEach(el => {
                                const translateValue = direction === "rtl" ? this.position : -this.position;
                                el.style.transform = `translateX(${translateValue}px)`;
                            });

                            this.position += (this.speed * delta) / 1000;
                            
                            if (this.position >= this.innerElementWidth) {
                                this.position = this.position % this.innerElementWidth;
                            }
                        }

                        start(direction) {
                            this._running = true;
                            let lastTime = null;

                            const loop = () => {
                                if (!this._running) return;

                                const now = Date.now();
                                const delta = lastTime === null ? 0 : now - lastTime;
                                this.nextFrame(delta, direction);
                                lastTime = now;
                                window.requestAnimationFrame(loop);
                            };

                            window.requestAnimationFrame(loop);
                        }

                        stop() {
                            this._running = false;
                        }
                    }

                    // Initialize
                    const speed = window.innerWidth > 768 
                        ? parseInt(this.dataset.scrollingSpeed) 
                        : parseInt(this.dataset.scrollingSpeed) / 1.5;
                    
                    const direction = this.dataset.scrollingDirection || "ltr";
                    const scrollingText = new ScrollingController(this, speed);

                    // Pause on hover functionality
                    if (this.dataset.pauseOnHover === "true") {
                        let windowInFocus = true;

                        const handleMouseOver = () => {
                            if (windowInFocus) scrollingText.stop();
                        };

                        const handleMouseOut = () => {
                            if (windowInFocus) scrollingText.start(direction);
                        };

                        window.addEventListener("blur", () => windowInFocus = false);
                        window.addEventListener("focus", () => windowInFocus = true);
                        this.addEventListener("mouseover", handleMouseOver);
                        this.addEventListener("mouseout", handleMouseOut);
                    }

                    // Start/stop based on visibility
                    new IntersectionObserver(entries => {
                        if (entries[0].isIntersecting) {
                            scrollingText.start(direction);
                        } else {
                            scrollingText.stop();
                        }
                    }).observe(this);
                }
            }

            if (typeof customElements.get("scrolling-text") === "undefined") {
                customElements.define("scrolling-text", ScrollingText);
            }
        }