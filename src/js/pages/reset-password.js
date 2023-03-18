import { toastSuccess, toastError } from '../alerts.js';
import * as util from '../util.js';

document.title = "Reset Password";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

$( ".toggle-password input" ).on( "click", ( e ) => {
    let $input = $('#password'),
        $parent = $( e.target ).closest( ".toggle-password" );

    if ( $( e.target ).is(':checked') ) {
        $input.attr('type', 'text');
        $parent.find( "i" ).removeClass( "fa-eye" ).addClass( "fa-eye-slash" );
        $parent.find( ".label" ).html( "Hide" );
    } else {
        $input.attr('type', 'password');
        $parent.find( "i" ).removeClass( "fa-eye-slash" ).addClass( "fa-eye" );
        $parent.find( ".label" ).html( "Show" );
    }
} );

let $form = $( "#resetPassword" );
$form.on( "submit", ( e ) => {
    e.preventDefault();

    if ( ! $form[0].checkValidity() ) {
        e.preventDefault();
        e.stopPropagation();
    } else {
        let password = $('#password').val(),
            code = urlParams.get('code'),
            loader = $( "#loader" );

        loader.show();

        window.app.auth.resetPassword( password, code )
            .then( ( res ) => {
                loader.hide();

                window.location.href = '/signin';

                toastSuccess( 
                    `Success`, 
                    `Your password has been updated` 
                );
            } )
            .catch( ( errors ) => {
                loader.hide();
                
                toastError( "Password reset failed", errors.errors );
            } );
    }

    $form.addClass( "was-validated" );
} );

$( ".form-outline" ).each( ( index, element ) => {
    util.initMDBElements( $( element ) );
} );