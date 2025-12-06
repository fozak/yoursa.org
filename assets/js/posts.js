async function loadBlogPosts() {
    const blogFolder = '/blog/';
    const posts = [];
    
    try {
        // Fetch the blog directory index (requires directory listing enabled)
        const response = await fetch(blogFolder);
        const html = await response.text();
        
        // Parse HTML to extract .html files
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href$=".html"]');
        
        // Extract post data from filenames
        links.forEach(link => {
            const filename = link.getAttribute('href');
            const match = filename.match(/(.+)-(\d{4}-\d{2}-\d{2})\.html$/);
            
            if (match) {
                const slug = match[1];
                const date = match[2];
                
                posts.push({
                    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    url: blogFolder + filename,
                    image: `/images/${filename.replace('.html', '.png')}`,
                    category: 'Business', // Default category
                    date: date,
                    trending: false
                });
            }
        });
        
        // Sort by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        renderPosts(posts);
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Create post HTML
function createPostHTML(post, type = 'latest') {
    if (type === 'trending') {
        return `
            <div class="col-md-4">
                <div class="c-trending-posts__posts">
                    <div class="c-trending-posts__image-wrapper">
                        <a href="${post.url}">
                            <div class="c-trending-posts__image" style="background-image: url(${post.image});"></div>
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
                            <div class="c-latest-blog__post-image" style="background-image: url(${post.image});"></div>
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

// Render posts
function renderPosts(posts) {
    // Trending: first 3 posts
    const trendingPosts = posts.slice(0, 3);
    const trendingContainer = document.getElementById('trending-posts');
    if (trendingContainer) {
        trendingContainer.innerHTML = trendingPosts.map(p => createPostHTML(p, 'trending')).join('');
    }
    
    // Latest: next 3 posts
    const latestPosts = posts.slice(0, 6);
    const latestContainer = document.getElementById('latest-posts');
    if (latestContainer) {
        latestContainer.innerHTML = latestPosts.map(p => createPostHTML(p, 'latest')).join('');
    }
}