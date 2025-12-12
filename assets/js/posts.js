// posts.js - Load blog posts from sitemap.xml

async function loadBlogPosts() {
    try {
        const response = await fetch('/sitemap.xml');
        const xmlText = await response.text();
        
        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Get all <url> elements
        const urls = xmlDoc.querySelectorAll('url');
        
        const posts = [];
        
        urls.forEach(url => {
            const loc = url.querySelector('loc').textContent;
            const lastmod = url.querySelector('lastmod')?.textContent;
            
            // Only get blog posts
            if (loc.includes('/blog/')) {
                // Extract filename from URL
                const urlParts = loc.split('/');
                const slug = urlParts[urlParts.length - 1];
                
                // Try to extract date from slug or use lastmod
                const dateMatch = slug.match(/(\d{4}-\d{2}-\d{2})/);
                const date = dateMatch ? dateMatch[1] : lastmod;
                
                // Create title from slug
                const titleSlug = slug.replace(/-\d{4}-\d{2}-\d{2}$/, '').replace(/-/g, ' ');
                const title = titleSlug.split(' ')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                
                posts.push({
                    title: title,
                    url: loc,
                    slug: slug,
                    category: 'Business', // Default, or parse from URL structure
                    date: date,
                    lastmod: lastmod
                });
            }
        });
        
        // Sort by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log('📰 Loaded posts from sitemap:', posts.length);
        renderPosts(posts);
        
    } catch (error) {
        console.error('Error loading sitemap:', error);
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function createPostHTML(post, type = 'latest') {
    const imageUrl = `/images/${post.slug}.png`;
    const fallbackUrl = `/images/${post.slug}.svg`;
    
    // Image element with fallback
    const imageStyle = `background-image: url(${imageUrl}), url(${fallbackUrl});`;
    
    if (type === 'trending') {
        return `
            <div class="col-md-4">
                <div class="c-trending-posts__posts">
                    <div class="c-trending-posts__image-wrapper">
                        <a href="${post.url}">
                            <div class="c-trending-posts__image" style="${imageStyle}"></div>
                        </a>
                    </div>
                    <div class="c-trending-posts__content">
                        <p class="c-trending-posts__post-tags">${post.category}</p>
                        <h6 class="c-trending-posts__post-title">
                            <a href="${post.url}">${post.title}</a>
                        </h6>
                        <p class="c-trending-posts__post-date">${formatDate(post.date)}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="col-md-4">
                <div class="c-latest-blog__blog-post">
                    <div class="c-latest-blog__image-wrapper">
                        <a href="${post.url}">
                            <div class="c-latest-blog__post-image" style="${imageStyle}"></div>
                        </a>
                    </div>
                    <div class="c-latest-blog__post-content">
                        <p class="c-latest-blog__post-tags">${post.category}</p>
                        <h6 class="latest-posts-title">
                            <a href="${post.url}">${post.title}</a>
                        </h6>
                        <p class="c-latest-blog__post-date">${formatDate(post.date)}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderPosts(posts) {
    const trendingContainer = document.getElementById('trending-posts');
    if (trendingContainer) {
        trendingContainer.innerHTML = posts.slice(0, 3).map(p => createPostHTML(p, 'trending')).join('');
    }
    
    const latestContainer = document.getElementById('latest-posts');
    if (latestContainer) {
        latestContainer.innerHTML = posts.slice(0, 6).map(p => createPostHTML(p, 'latest')).join('');
    }
}

document.addEventListener('DOMContentLoaded', loadBlogPosts);