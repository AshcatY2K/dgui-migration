import { toastSuccess, toastError } from '../alerts.js';

document.title = "Thank You";

const queryString = window.location.search,
  urlParams = new URLSearchParams(queryString);

if ( urlParams.get('code') ) {
  window.app.auth.confirmEmail( urlParams.get('code') )
    .then( () => {
      window.location.href = '/databases';

      toastSuccess( 
        `Confirmed`, 
        `Email successfully confirmed` 
        );
    } )
    .catch( ( error) => {
      $( "#failContainer" ).show();
      $( "#failContainer" ).prev().hide();

      toastError( `Error confirming email`, "Your email may have already been confirmed. Please try signing in." );
    } );
}