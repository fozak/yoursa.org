(function() {
    // Proper Unicode bold conversion (sans-serif mathematical bold)
    function toBold(str) {
        const boldMap = {
            // Uppercase A-Z
            'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 
            'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 
            'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 
            'Y': '𝗬', 'Z': '𝗭',
            // Lowercase a-z
            'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 
            'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 
            'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 
            'y': '𝘆', 'z': '𝘇',
            // Numbers
            '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', 
            '8': '𝟴', '9': '𝟵'
        };
        
        return str.split('').map(c => boldMap[c] || c).join('');
    }
    
    // Smart emoji selector based on heading content
    function getHeaderEmoji(text) {
        const lower = text.toLowerCase();
        
        // Match keywords to emojis
        if (lower.includes('launch') || lower.includes('announce')) return '🚀';
        if (lower.includes('legacy') || lower.includes('history') || lower.includes('heritage')) return '🏛️';
        if (lower.includes('youth') || lower.includes('student') || lower.includes('development')) return '🎓';
        if (lower.includes('nonprofit') || lower.includes('consulting') || lower.includes('philanthrop')) return '🤝';
        if (lower.includes('honor') || lower.includes('america') || lower.includes('civic')) return '🇺🇸';
        if (lower.includes('vision') || lower.includes('impact') || lower.includes('mission')) return '💡';
        if (lower.includes('about') || lower.includes('contact')) return '📋';
        
        // Default
        return '📌';
    }
    
    function convertBlogToFb(mainSelector) {
        const main = document.querySelector(mainSelector);
        if (!main) return '';
        
        let output = '';
        
        // Main image
        const img = main.querySelector('#sidebar-image img');
        if (img && img.src) {
            const fullUrl = new URL(img.src, window.location.origin).href;
            output += `📸 ${fullUrl}\n\n`;
        }
        
        // Title (H1) - special treatment
        const h1 = main.querySelector('h1');
        if (h1) {
            output += `🚀 ${toBold(h1.innerText.trim())}\n\n`;
        }
        
        // Date
        const dateP = main.querySelector('p[data-semantic="blog-place-time"]');
        if (dateP) {
            output += `📅 ${dateP.innerText.trim()}\n\n`;
        }
        
        // Other headings (H2-H6) with smart emojis
        const headings = main.querySelectorAll('h2, h3, h4, h5, h6');
        headings.forEach(h => {
            const emoji = getHeaderEmoji(h.innerText);
            output += `${emoji} ${toBold(h.innerText.trim())}\n\n`;
        });
        
        // Paragraphs (excluding date which we already handled)
        const paragraphs = main.querySelectorAll('p[data-semantic="blog-main-text"]');
        paragraphs.forEach(p => {
            const clone = p.cloneNode(true);
            clone.querySelectorAll('strong').forEach(s => {
                s.textContent = toBold(s.textContent);
            });
            output += `${clone.innerText.trim()}\n\n`;
        });
        
        // Lists with contextual emojis
        const lists = main.querySelectorAll('ul');
        lists.forEach(ul => {
            ul.querySelectorAll('li').forEach(li => {
                const clone = li.cloneNode(true);
                clone.querySelectorAll('strong').forEach(s => {
                    s.textContent = toBold(s.textContent);
                });
                const text = clone.innerText.trim();
                
                // Choose emoji based on list item content
                let emoji = '✓';
                if (text.toLowerCase().includes('self-management') || text.toLowerCase().includes('independence')) emoji = '🎯';
                if (text.toLowerCase().includes('social') || text.toLowerCase().includes('relationship')) emoji = '💬';
                if (text.toLowerCase().includes('job') || text.toLowerCase().includes('career')) emoji = '💼';
                if (text.toLowerCase().includes('strategy') || text.toLowerCase().includes('impact')) emoji = '📊';
                if (text.toLowerCase().includes('grantee') || text.toLowerCase().includes('vetting')) emoji = '🔍';
                if (text.toLowerCase().includes('measurement') || text.toLowerCase().includes('outcomes')) emoji = '📈';
                if (text.toLowerCase().includes('organizational') || text.toLowerCase().includes('support')) emoji = '🏗️';
                
                output += `${emoji} ${text}\n`;
            });
            output += '\n';
        });
        
        // Current page link
        output += `🔗 Read the full article: ${window.location.href}\n`;
        
        return output.trim();
    }
    
    const fbText = convertBlogToFb('#main-content');
    console.log('--- Facebook-ready post with emojis ---\n');
    console.log(fbText);
    console.log('\n--- Copying to clipboard ---');
    
    navigator.clipboard.writeText(fbText).then(() => {
        console.log('✓ Copied! Your post is ready with bold text and smart emojis.');
    });
})();