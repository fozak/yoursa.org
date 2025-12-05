<script>
    /* navbar toggler script for header starts */
    function navbartoggle(x) {
      x.classList.toggle("change");
    }
    /* navbar toggler script for header ends */
    $('.number-counter .number-counter__number-counter-column_counter-count .count').each(function () {
        $(this).prop('Counter',0).animate({
            Counter: $(this).text()
        }, {
            duration: 4000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });



    $('#contact-submit').click(function() {
      var first_name=$('#contact_first_name').val();
      var last_name=$('#contact_last_name').val();
      var email=$('#contact_email').val();
      if ( first_name != "" && last_name != "" && email!= "" ){
     $('.contact-section__contact-form .contact-section__contact-form_success').css('display','block');
      setTimeout(function(){
      $('.contact-section__contact-form .contact-section__contact-form_success').css('display','none');
      }, 3000);
     $('#contact_first_name').val("");
     $('#contact_last_name').val("");
     $('#contact_email').val("");
     $('#contact_textarea').val("");
   }else{
     setTimeout(function(){
      $('.contact-section__contact-form .contact-section__contact-form_success').css('display','none');
      }, 3000);
   }
  });


</script>


	
<script>
(function(){
    const bookshopLiveSetup = (CloudCannon) => {
      CloudCannon.enableEvents();
      CloudCannon?.setLoading?.("Loading Bookshop Live Editing");
      let triggeredLoad = false;
      const whenLoaded = () => {
        triggeredLoad = true;
        CloudCannon?.setLoading?.(false);
      }
      setTimeout(() => {
        if (!triggeredLoad) {
          CloudCannon?.setLoading?.("Error Loading Bookshop Live Editing");
          setTimeout(() => {
            if (!triggeredLoad) { whenLoaded() }
          }, 2000);
        }
      }, 12000);
  
      const head = document.querySelector('head');
      const script = document.createElement('script');
      script.src = `/_cloudcannon/bookshop-live.js`;
      script.onload = function() {
        window.bookshopLive = new window.BookshopLive({
          remoteGlobals: [],
          loadedFn: whenLoaded,
        });
        const updateBookshopLive = async () => {
          const frontMatter = await CloudCannon.value({
            keepMarkdownAsHTML: false,
            preferBlobs: true
          });
          const options = window.bookshopLiveOptions || {};
          const rendered = await window.bookshopLive.update(frontMatter, options);
          if (rendered) CloudCannon?.refreshInterface?.();
        }
        document.addEventListener('cloudcannon:update', updateBookshopLive);
        updateBookshopLive();
      }
      head.appendChild(script);
    }
  
    document.addEventListener('cloudcannon:load', function (e) {
      bookshopLiveSetup(e.detail.CloudCannon);
    });
  })();
</script>