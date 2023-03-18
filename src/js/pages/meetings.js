import { toastSuccess, toastError } from '../alerts.js';

import * as email from '../controllers/email.js';
import * as util from '../util.js';

document.title = "Request a meeting"

if ( window.location.hash !== "" ) {
    $('html, body').animate({
        scrollTop: $( window.location.hash ).offset().top + $( window ).height()
    }, 2000);
}

let $form = $( "#sendEmail" );
$form.on( "submit", ( e ) => {
    e.preventDefault();
    e.stopPropagation();

    if ( $form[0].checkValidity() ) {
        let enquiry = $form.find( "#enquiry" ).val(),
            company = "Company: " + $form.find( "#company" ).val(),
            message = `${company}<br><br>${enquiry}`;

        email.send( $form.find( "#senderEmail" ).val(), message )
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
            } );
    }

    $form.addClass( "was-validated" );
} );

util.initMDBElements( $form.find( "#senderEmail" ).parent() );
util.initMDBElements( $form.find( "#enquiry" ).parent() );
util.initMDBElements( $form.find( "#company" ).parent() );