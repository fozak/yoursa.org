// universal-loader.js
class UniversalLoader {
    constructor() {
        this.currentStep = 0;
        this.transformationSteps = [];
        this.data = {};
        this.history = [];
    }

    async init() {
        // Load initial data from script tag
        const dataScript = document.getElementById('data');
        if (dataScript) {
            this.data = JSON.parse(dataScript.textContent);
            this.history.push({...this.data});
        }

        // Initialize first transformation if post_html exists
        if (this.data.post_html) {
            document.body.innerHTML = this.data.post_html;
        }

        // Register transformation steps
        this.registerTransformations();
        
        // Start transformation chain
        await this.runNextTransformation();
    }

    registerTransformations() {
        // Step 1: Basic content enhancement
        this.transformationSteps.push(async (data) => {
            const enhancedHtml = await this.enhanceContent(data.post_html, data);
            return {
                ...data,
                post_html: enhancedHtml
            };
        });

        // Step 2: AI-powered transformation
        this.transformationSteps.push(async (data) => {
            const aiEnhancedHtml = await this.applyAITransformation(data);
            return {
                ...data,
                post_html: aiEnhancedHtml
            };
        });
    }

    async enhanceContent(html, data) {
        // Basic content enhancement
        const container = document.createElement('div');
        container.innerHTML = html;

        // Add metadata if title is empty
        if (!data.title && data.description) {
            const title = document.createElement('h1');
            title.textContent = data.description.split('.')[0];
            container.insertBefore(title, container.firstChild);
        }

        // Add keywords as tags
        if (data.keywords) {
            const tags = document.createElement('div');
            tags.className = 'tags';
            tags.innerHTML = data.keywords.split(',')
                .map(tag => `<span class="tag">${tag.trim()}</span>`)
                .join('');
            container.appendChild(tags);
        }

        return container.innerHTML;
    }

    async applyAITransformation(data) {
        // Simulate AI transformation (replace this with actual AI API calls)
        const aiEnhancedHtml = `
            <div class="ai-enhanced">
                <div class="content">${data.post_html}</div>
                <div class="ai-suggestions">
                    <h3>AI Suggestions</h3>
                    <ul>
                        <li>Added semantic HTML structure</li>
                        <li>Enhanced accessibility</li>
                        <li>Optimized for SEO</li>
                    </ul>
                </div>
            </div>
        `;
        return aiEnhancedHtml;
    }

    async runNextTransformation() {
        if (this.currentStep < this.transformationSteps.length) {
            try {
                // Apply transformation
                const newData = await this.transformationSteps[this.currentStep](this.data);
                
                // Update DOM
                document.body.innerHTML = newData.post_html;
                
                // Store history
                this.history.push({...newData});
                
                // Update current data
                this.data = newData;
                
                // Add transformation controls
                this.addTransformationControls();
                
                this.currentStep++;
            } catch (error) {
                console.error('Transformation error:', error);
            }
        }
    }

    addTransformationControls() {
        const controls = document.createElement('div');
        controls.className = 'transformation-controls';
        controls.innerHTML = `
            <div class="controls-panel">
                <button onclick="loader.previousStep()" ${this.currentStep === 0 ? 'disabled' : ''}>Previous</button>
                <span>Step ${this.currentStep + 1} of ${this.transformationSteps.length}</span>
                <button onclick="loader.runNextTransformation()" ${this.currentStep >= this.transformationSteps.length ? 'disabled' : ''}>Next</button>
            </div>
        `;
        document.body.appendChild(controls);
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            const previousData = this.history[this.currentStep];
            document.body.innerHTML = previousData.post_html;
            this.data = {...previousData};
            this.addTransformationControls();
        }
    }
}

// Initialize loader when script runs
const loader = new UniversalLoader();
if (document.getElementById('loaderScript').getAttribute('run') === 'true') {
    window.addEventListener('DOMContentLoaded', () => loader.init());
}
