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
        
        // Capture at high resolution preserving aspect ratio
        const sourceCanvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 4, // Very high quality for source
          logging: false,
          width: rect.width * widthMultiplier,
          height: rect.height,
          windowWidth: element.scrollWidth * widthMultiplier,
          windowHeight: element.scrollHeight
        });

        // Favicon sizes to generate (square icons)
        const squareSizes = [
          { size: 16, name: 'favicon-16.png' },
          { size: 32, name: 'favicon-32.png' },
          { size: 180, name: 'apple-touch-icon.png' }
        ];

        // Get the aspect ratio
        const aspectRatio = sourceCanvas.width / sourceCanvas.height;
        
        // Generate square favicons (centered with transparent padding)
        for (const { size, name } of squareSizes) {
          const faviconCanvas = document.createElement('canvas');
          faviconCanvas.width = size;
          faviconCanvas.height = size;
          const ctx = faviconCanvas.getContext('2d');
          
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Calculate dimensions to fit within square while preserving aspect ratio
          let drawWidth, drawHeight, x, y;
          if (aspectRatio > 1) {
            // Wider than tall
            drawWidth = size;
            drawHeight = size / aspectRatio;
            x = 0;
            y = (size - drawHeight) / 2;
          } else {
            // Taller than wide
            drawHeight = size;
            drawWidth = size * aspectRatio;
            x = (size - drawWidth) / 2;
            y = 0;
          }
          
          ctx.drawImage(sourceCanvas, x, y, drawWidth, drawHeight);
          
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
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Also export full-size PNG preserving original aspect ratio
        sourceCanvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'export.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log(`✓ export.png downloaded (${sourceCanvas.width}x${sourceCanvas.height})`);
        }, 'image/png');
        
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
  console.log('   Will generate:');
  console.log('   - export.svg (vector)');
  console.log('   - export.png (full size, preserves aspect ratio)');
  console.log('   - favicon-16.png, favicon-32.png, apple-touch-icon.png (square, centered)');
  console.log('   Example: exportElement(".ysa-container.large")');
})();