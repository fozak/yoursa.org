// assets/js/gtm.js

// Initialize Google Tag Manager
(function() {
    var gtmId = 'G-VK4JWHDC1Z'; // Replace with your GTM ID
    var gtagScript = document.createElement('script');

    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + gtmId;
    document.head.appendChild(gtagScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', gtmId);
})();