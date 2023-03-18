import * as util from '/src/js/util.js';

let get = ( paypalSubscriptionId ) => {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "GET",
            url: `${window.apiUri}/api/v1/account/${paypalSubscriptionId}/payment`,
            crossDomain: true,
            beforeSend: ( xhr ) => {
                /* Authorization header */
                xhr.setRequestHeader( "Authorization", "Bearer " + window.localStorage.getItem( 'token' ) );
            },
            success: payments => {
                resolve( payments )
            },
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
            contentType: "application/json"
        } );
    } );
}

async function add ( paypalSubscriptionId, paymentDetails ) {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "POST",
            url: `${window.apiUri}/api/v1/account/${paypalSubscriptionId}/payment`,
            crossDomain: true,
            data: JSON.stringify( paymentDetails ),
            success: response => resolve( response ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
            contentType: "application/json"
        } );
    } );
}

async function remove () {}

export { get, add };