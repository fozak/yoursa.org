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