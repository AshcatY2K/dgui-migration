import { toastSuccess, toastError } from '../alerts.js';
import * as util from '../util.js';

document.title = "Forgot Password";

$("#forgotPassword").on("submit", ( e ) => {
    e.preventDefault();

    let email = $('#email').val(),
        loader = $( "#loader" );

    loader.show();

    window.app.auth.resetPasswordRequest( email )
        .then( ( res ) => {
            loader.hide();

            $( "#forgotPassword" ).html( `<p class="text-center">
                    Please check your email for a password reset link
                </p>` )
        } )
        .catch( ( errors ) => {
            loader.hide();
            
            toastError( "Password reset failed", errors.errors );
        } );
} );

$( ".form-outline" ).each( ( index, element ) => {
    util.initMDBElements( $( element ) );
} );