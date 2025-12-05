(function() {
    const CONFIG = {
        categoryConfigs: {
            programs: [
                '/components/header.html',
                '/components/hero-programs.html',
                'post_html',
                '/components/list-programs.html',
                '/components/services-stats.html',
                '/components/faces.html',
                '/components/featured-programs.html',
                '/components/services-types.html',
                '/components/portfolio.html',
                '/components/footer.html'
            ],
            people: [
                '/components/header.html',
                //'/components/hero-people.html',
                'post_html',
                '/components/list-people.html',
                '/components/services-stats.html',
                '/components/faces.html',
                '/components/featured-people.html',
                '/components/services-types.html',
                '/components/portfolio.html',
                '/components/footer.html'
            ],
            blog: [
                '/components/header.html',
                '/components/hero-blog.html',
                'post_html',
                '/components/blog-posts.html',
                '/components/services-stats.html',
                '/components/faces.html',
                '/components/featured-blog.html',
                '/components/services-types.html',
                '/components/portfolio.html',
                '/components/footer.html'
            ],
            partners: [
                '/components/header.html',
                '/components/hero-partners.html',
                'post_html',
                '/components/list-partners.html',
                '/components/services-stats.html',
                '/components/faces.html',
                '/components/featured-partners.html',
                '/components/services-types.html',
                '/components/portfolio.html',
                '/components/footer.html'
            ]
        },
        defaultComponents: [
            '/components/header.html',
            'hero', // placeholder for dynamic hero
            '/components/services-stats.html',
            '/components/faces.html',
            'featured', // placeholder for dynamic featured
            '/components/services-types.html',
            '/components/portfolio.html',
            '/components/call-to-action.html',
            '/components/footer.html'
        ],
        comingSoonComponents: [
            '/components/header.html',
            '/components/hero-comingsoon.html',
            '/components/services-stats.html',
            '/components/faces.html',
            '/components/featured-people.html',
            '/components/services-types.html',
            '/components/portfolio.html',
            '/components/call-to-action.html',
            '/components/footer.html'
        ],
        gtm: {
            id: 'G-VK4JWHDC1Z',
            domain: 'googletagmanager.com'
        }
    };

    class ComponentLoader {
        constructor() {
            this.loaderScript = document.getElementById("loaderScript");
            this.loadDraftComponents = false;
            this.jsonData = this.getJsonData();
            this.currentPage = this.getCurrentPage();
            this.baseUrl = window.location.href;
            this.divIds = Array.from(
                { length: this.calculateMaxComponents() }, 
                (_, i) => (i + 1).toString()
            );
        }

        calculateMaxComponents() {
            const lengths = [
                ...Object.values(CONFIG.categoryConfigs).map(arr => arr.length),
                CONFIG.defaultComponents.length,
                CONFIG.comingSoonComponents.length
            ];
            return Math.max(...lengths);
        }

        getJsonData() {
            try {
                return JSON.parse(document.getElementById("data").textContent);
            } catch (e) {
                console.error('Error parsing JSON data:', e);
                return null;
            }
        }

        getCurrentPage() {
            const segments = window.location.pathname.split('/');
            return segments[segments.length - 1];
        }

        async init() {
            if (this.loaderScript.getAttribute("run") !== "true") {
                console.log("Loader script is not set to run");
                return;
            }

            await this.setupHead();
            this.createComponentDivs();
            this.setupKeyboardShortcuts();
            await this.loadComponents();
        }

        async setupHead() {
            await this.loadGTM();
            await this.loadHeadTemplate();
            this.loaderScript.setAttribute("run", "false");
        }

        loadGTM() {
            const { id, domain } = CONFIG.gtm;
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://${domain}/gtag/js?id=${id}`;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            window.gtag = function() { dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', id);
        }

        async loadHeadTemplate() {
            try {
                const response = await fetch('/components/template-head.html');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const html = await response.text();
                document.head.insertAdjacentHTML('afterbegin', html);
            } catch (error) {
                console.error('Error loading head template:', error);
            }
        }

        createComponentDivs() {
            this.divIds.forEach(id => {
                const div = document.createElement('div');
                div.id = id;
                document.body.appendChild(div);
            });
        }

        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey && event.key === 'y') {
                    this.loadDraftComponents = true;
                    console.log("Loading draft components");
                    this.loadComponents();
                }
            });
        }

        determineComponents() {
            if (!this.loadDraftComponents && (!this.jsonData || this.jsonData.is_draft === true)) {
                return CONFIG.comingSoonComponents;
            }

            // Check for category-specific components
            for (const [category, components] of Object.entries(CONFIG.categoryConfigs)) {
                if (this.baseUrl.includes(`/${category}`)) {
                    return components.map(component => 
                        component === 'post_html' ? this.jsonData?.post_html : component
                    );
                }
            }

            // Handle default components with dynamic parts
            return CONFIG.defaultComponents.map(component => {
                if (component === 'hero') {
                    return `/components/hero-${this.currentPage}.html`;
                }
                if (component === 'featured') {
                    return `/components/featured-${this.currentPage}.html`;
                }
                return component;
            });
        }

        async loadComponents() {
            const components = this.determineComponents();
            
            const promises = components.map((component, index) => {
                const div = document.getElementById(this.divIds[index]);
                if (!div) return Promise.resolve();

                if (typeof component === 'string' && component.startsWith('/')) {
                    return fetch(component)
                        .then(response => {
                            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                            return response.text();
                        })
                        .then(html => {
                            div.innerHTML = html;
                        })
                        .catch(error => {
                            console.error(`Error loading component ${component}:`, error);
                        });
                } else if (component) {
                    div.innerHTML = component;
                    return Promise.resolve();
                }
            });

            try {
                await Promise.all(promises);
                console.log("All components loaded successfully");
                this.populateMeta();
            } catch (error) {
                console.error('Error loading components:', error);
            }
        }

        populateMeta() {
            if (!this.jsonData || this.jsonData.is_draft === true) {
                console.warn("Draft content or missing JSON data");
                return;
            }

            const { title, description, keywords, domain, url, 'ld-script': ldScript } = this.jsonData;
            
            if (title) document.title = title;
            
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription && description) {
                metaDescription.setAttribute("content", description);
            }
            
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords && keywords) {
                metaKeywords.setAttribute("content", keywords);
            }
            
            const canonicalLink = document.querySelector('link[rel="canonical"]');
            if (canonicalLink && domain && url) {
                canonicalLink.setAttribute("href", `https://${domain}/${url}`);
            }
            
            const ldScriptElement = document.querySelector('script[type="application/ld+json"]');
            if (ldScriptElement && ldScript) {
                ldScriptElement.textContent = JSON.stringify(ldScript);
            }
        }
    }

    // Initialize and run the loader
    const loader = new ComponentLoader();
    loader.init();
})();
