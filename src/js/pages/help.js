import { toastSuccess, toastError } from '../alerts.js';

import * as email from '../controllers/email.js';
import * as util from '../util.js';

document.title = "Help"

let $form = $( "#sendEmail" );
$form.on( "submit", ( e ) => {
    e.preventDefault();
    e.stopPropagation();

    if ( $form[0].checkValidity() ) {
        email.send( $form.find( "#email" ).val(), $form.find( "#enquiry" ).val() )
        .then( ( res ) => {
            toastSuccess( 
                `Email sent`, 
                `We will be in touch with you shortly` 
            );
        } ).catch( ( error ) => {
            if ( typeof error === "string" ) {
                error = JSON.parse( error );
                error = error.errors
            }

            toastError( `Error sending email`, error );
        } )
    }

    $form.addClass( "was-validated" );
} );

$( ".form-outline" ).each( ( index, element ) => {
    util.initMDBElements( $( element ) );
} );