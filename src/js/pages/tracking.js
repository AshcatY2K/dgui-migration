function addTrackingCode () {
  $( "head" ).append( `<!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5BRGTQT');</script>
    <!-- End Google Tag Manager -->
    <!-- Meta Pixel Code -->
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '513683527173009');
      fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=513683527173009&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-NDT2KY1JMN"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-NDT2KY1JMN');
    </script>
    <!-- End Google tag (gtag.js) -->` );
}

$( document )
  .on( "click", ".js-allow-cookies", ( e ) => {
    window.localStorage.setItem( 'allowCookies', "true" );
    $( ".cookie-consent-container" ).remove();
    addTrackingCode();
  } )
  .on( "click", ".js-decline-cookies", ( e ) => {
    window.localStorage.setItem( 'allowCookies', "false" );
    $( ".cookie-consent-container" ).remove();
  } );

if ( window.localStorage.getItem( 'CanMaintainAccount' ) == "0" ) {
  $( ".my-account-link-container" ).remove();
}

let allowCookies = window.localStorage.getItem( 'allowCookies' );

if ( ! allowCookies ) {
  $( ".cookie-consent-container" ).addClass( "show" );
} else if ( allowCookies == "true" ) {
  addTrackingCode();
}