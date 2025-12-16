(function() {
    function convertBlogToXThread(mainSelector) {
        const main = document.querySelector(mainSelector);
        if (!main) return [];
        
        const tweets = [];
        const MAX_LENGTH = 270; // Leave room for tweet numbers
        
        // Tweet 1: Title + hook
        const h1 = main.querySelector('h1');
        const dateP = main.querySelector('p[data-semantic="blog-place-time"]');
        if (h1) {
            let tweet1 = `🚀 ${h1.innerText.trim()}`;
            if (dateP) {
                tweet1 += `\n\n${dateP.innerText.trim()}`;
            }
            tweet1 += `\n\n🧵 Thread 👇`;
            tweets.push(tweet1);
        }
        
        // Get all content sections
        const sections = [];
        
        // Collect headings and their following paragraphs
        const headings = main.querySelectorAll('h2, h3, h4, h5, h6');
        headings.forEach(h => {
            const headingText = h.innerText.trim();
            
            // Find paragraphs after this heading
            let nextElement = h.nextElementSibling;
            let content = '';
            
            while (nextElement && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(nextElement.tagName)) {
                if (nextElement.tagName === 'P' && nextElement.dataset.semantic === 'blog-main-text') {
                    content += nextElement.innerText.trim() + ' ';
                } else if (nextElement.tagName === 'UL') {
                    const items = Array.from(nextElement.querySelectorAll('li'))
                        .map(li => `• ${li.innerText.trim()}`)
                        .join('\n');
                    content += '\n' + items;
                }
                nextElement = nextElement.nextElementSibling;
            }
            
            if (content.trim()) {
                sections.push({ heading: headingText, content: content.trim() });
            }
        });
        
        // Create tweets from sections
        sections.forEach(section => {
            const emoji = getXEmoji(section.heading);
            let tweet = `${emoji} ${section.heading}\n\n`;
            
            // Split content if too long
            const words = section.content.split(' ');
            let currentTweet = tweet;
            
            for (const word of words) {
                if ((currentTweet + word).length > MAX_LENGTH) {
                    tweets.push(currentTweet.trim());
                    currentTweet = word + ' ';
                } else {
                    currentTweet += word + ' ';
                }
            }
            
            if (currentTweet.trim().length > tweet.length) {
                tweets.push(currentTweet.trim());
            }
        });
        
        // Final tweet with link
        const link = window.location.href;
        tweets.push(`🔗 Read the full article:\n${link}\n\n#YouthDevelopment #Nonprofit #Entrepreneurship #Education`);
        
        return tweets;
    }
    
    function getXEmoji(text) {
        const lower = text.toLowerCase();
        if (lower.includes('launch') || lower.includes('announce')) return '🚀';
        if (lower.includes('legacy') || lower.includes('history')) return '📜';
        if (lower.includes('youth') || lower.includes('student')) return '🎓';
        if (lower.includes('nonprofit') || lower.includes('consulting')) return '🤝';
        if (lower.includes('honor') || lower.includes('america')) return '🇺🇸';
        if (lower.includes('vision') || lower.includes('impact')) return '🎯';
        if (lower.includes('about') || lower.includes('contact')) return 'ℹ️';
        return '▪️';
    }
    
    const thread = convertBlogToXThread('#main-content');
    
    console.log('=== X (Twitter) THREAD ===\n');
    console.log(`Total tweets: ${thread.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    thread.forEach((tweet, i) => {
        console.log(`TWEET ${i + 1}/${thread.length}:`);
        console.log(tweet);
        console.log(`\nCharacters: ${tweet.length}/280`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
    
    // Copy first tweet to clipboard
    navigator.clipboard.writeText(thread[0]).then(() => {
        console.log('✓ First tweet copied to clipboard!');
        console.log('📝 Copy each tweet manually and post as a thread.');
    });
    
    // Also save all tweets for easy access
    window.xThread = thread;
    console.log('💡 TIP: Access individual tweets with: window.xThread[0], window.xThread[1], etc.');
    
})();