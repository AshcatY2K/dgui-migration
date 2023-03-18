import { toastError } from '/src/js/alerts.js';
import { initMDBElements } from '/src/js/util.js';

let loader = $( "#main-loader" ),
  path = window.location.pathname.split( "/" ),
  src = `/img/Logo_full.svg`;

window.params = {
  company: path[2]
}

if ( window.params.company ) {
  src = `/img/logos/${window.params.company}.jpg`;
} else {
  $( ".register-container" ).show();
}

$( ".logo" ).attr( "src", src ).show();

initMDBElements( $( "#signin" ) );

$( "#email" ).focus();
    
$("#signin").on("submit", ( e ) => {
  e.preventDefault();

  let $form = $( "#signin" );

  $( ".loader" ).css( "z-index", "1" ).show();

  $form.addClass('was-validated');
    
  if ( ! $form[0].checkValidity() ) {
    return;
  }

  $form.find( "[type='submit']" ).prop( "disabled", true );

  window.app.auth.signIn( $('#email').val(), $('#password').val() )
    .then( res => window.location.href = '/databases' )
    .catch( err => {
      $( ".loader" ).hide();
      
      $form.find( "[type='submit']" ).prop( "disabled", false );

      if ( Array.isArray( err.errors ) ) {
        toastError( "Login Failed", err.errors[0].msg );
      } else {
        toastError( "Login Failed", err.errors );
      }
    } )
} );