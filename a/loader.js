 // added part loading from linktag
        var linkTag = document.querySelector('link[rel="canonical"]');

        // Get the value of the href attribute
        var hrefValue = linkTag.getAttribute('href');

        // Extract the 'news' part from the href attribute
        var extractedValue = hrefValue.split('/').pop();
       

	   // Variable to substitute
        var variable = extractedValue;

        // Select all div elements with data-loader attribute
        var divs = document.querySelectorAll('[data-loader]');

        // Iterate through each div and update the data-loader attribute
        divs.forEach(function(div) {
            // Get the current data-loader attribute value
            var oldValue = div.getAttribute('data-loader');

            // Replace the variable with the new value
            var newValue = oldValue.replace('variable', variable);

            // Set the updated data-loader attribute value
            div.setAttribute('data-loader', newValue);
        });





	var url;
	var id;
	var j=1;
	
$(document).ready(function () {
	$('div[data-loader]').each(function() {
		url=$(this).attr("data-loader");
		id=$(this).attr("id");
    		var tmp_j = j++;
    		 $.get(url, function(data){
			 	 $(data).insertAfter($('#'+tmp_j));

			 });
	});
});