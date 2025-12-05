// Function to log all loaded <div> elements on the page
function parseFullDOM() {

    // Get the entire document as a string
    const fullDOMString = document.documentElement.outerHTML;

    // Log the full DOM as a string
    console.log("Full DOM:", fullDOMString);
}

// Wait for a specified amount of time (e.g., 2 seconds) before executing the function
setTimeout(() => {
    parseFullDOM();
}, 6000); // 6000 milliseconds = 2 seconds