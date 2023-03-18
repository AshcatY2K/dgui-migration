import { toastSuccess, toastError } from '/src/js/alerts.js';

import * as email from '/src/js/controllers/email.js';
import * as ssrsReport from '/src/js/controllers/ssrsReport.js';
import * as util from '/src/js/util.js';

import Carousel from '../components/mdb/free/carousel';
import lazyframe from "lazyframe";

$( document ).ready( () => {
    let $form = $( "#sendEmail" );

    $form.on( "submit", ( e ) => {
        e.preventDefault();
        e.stopPropagation();

        if ( $form[0].checkValidity() ) {
            let msg = "From " + $form.find( "#senderName" ).val() + ": ",
                senderEmail = $form.find( "#senderEmail" ).val();

            msg += $form.find( "#enquiry" ).val();

            email.send( senderEmail, msg )
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

    util.initMDBElements( $form.find( "#sendEmail" ).parent() );

    let error = window.localStorage.getItem( 'error' );
    
    if ( error ) {
        window.localStorage.removeItem( 'error' );

        toastError( "Session expired", error );
    }

    const $carousel = $('.carousel'),
        carousel = new Carousel( $carousel[0] );

    $carousel.on( "click", ".carousel-control-prev", () => carousel.prev() );

    $carousel.on( "click", ".carousel-control-next", () => carousel.next() );
} );
// Passing a selector
lazyframe(".lazyframe");