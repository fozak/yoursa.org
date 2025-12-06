Browser export complete · JS
Copy

/**
 * Browser Console Script - Export HTML Element as SVG/PNG
 * Usage: exportElement('.ysa-container')
 */

(function() {
  window.exportElement = async function(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      console.error('❌ Element not found:', selector);
      return;
    }

    console.log('📦 Exporting element:', selector);

    // ============================================
    // METHOD 1: SVG Export (Pure, No Dependencies)
    // ============================================
    function exportAsSVG() {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      const padding = 20;
      const widthMultiplier = 1.2; // Add 20% extra width
      
      const extraWidth = rect.width * (widthMultiplier - 1);
      const totalWidth = rect.width * widthMultiplier + padding * 2;
      const totalHeight = rect.height + padding * 2;
      
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${totalWidth} ${totalHeight}"
     width="${totalWidth}" 
     height="${totalHeight}">
  <foreignObject x="${padding}" y="${padding}" width="${rect.width + extraWidth}" height="${rect.height}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize};
      font-weight: ${styles.fontWeight};
      color: ${styles.color};
      line-height: ${styles.lineHeight};
      letter-spacing: ${styles.letterSpacing};
      white-space: nowrap;
    ">${element.innerHTML}</div>
  </foreignObject>
</svg>`;
      
      download(svgContent, 'export.svg', 'image/svg+xml');
      console.log('✓ SVG downloaded');
    }

    // ============================================
    // METHOD 2: PNG Favicons (using html2canvas)
    // ============================================
    async function exportFavicons() {
      // Check if html2canvas is loaded
      if (typeof html2canvas === 'undefined') {
        console.log('⏳ Loading html2canvas library...');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        console.log('✓ html2canvas loaded');
      }

      try {
        const rect = element.getBoundingClientRect();
        const widthMultiplier = 1.2; // Add 20% extra width
        
        // First, capture at high resolution
        const sourceCanvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 4, // Very high quality for source
          logging: false,
          width: rect.width * widthMultiplier,
          height: rect.height,
          windowWidth: element.scrollWidth * widthMultiplier,
          windowHeight: element.scrollHeight
        });

        // Favicon sizes to generate
        const sizes = [
          { size: 16, name: 'favicon-16.png' },
          { size: 32, name: 'favicon-32.png' },
          { size: 180, name: 'apple-touch-icon.png' }
        ];

        // Generate each size
        for (const { size, name } of sizes) {
          const faviconCanvas = document.createElement('canvas');
          faviconCanvas.width = size;
          faviconCanvas.height = size;
          const ctx = faviconCanvas.getContext('2d');
          
          // Draw source canvas scaled down to favicon size
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(sourceCanvas, 0, 0, size, size);
          
          // Download
          faviconCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log(`✓ ${name} downloaded (${size}x${size})`);
          }, 'image/png');
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (err) {
        console.error('❌ Favicon export failed:', err);
      }
    }

    // ============================================
    // Helper Functions
    // ============================================
    function download(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Execute exports
    exportAsSVG();
    await exportFavicons();
  };

  console.log('✅ Export function loaded!');
  console.log('📌 Usage: exportElement(".ysa-container")');
  console.log('   Will generate: export.svg, favicon-16.png, favicon-32.png, apple-touch-icon.png');
  console.log('   Example: exportElement(".ysa-container.large")');
})();