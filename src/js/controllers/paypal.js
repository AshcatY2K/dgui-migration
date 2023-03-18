import * as util from '/src/js/util.js';
/* Authorization header */
function authHeader ( xhr ) {
    xhr.setRequestHeader( "Authorization", "Bearer " + window.localStorage.getItem( 'token' ) );
}

let updatePlan = ( paypalSubscriptionId, info ) => {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "PATCH",
            url: `${window.apiUri}/api/v1/account/${paypalSubscriptionId}/paypal/plan`,
            crossDomain: true,
            data: JSON.stringify( info ),
            beforeSend: authHeader,
            success: payments => resolve( payments ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
            contentType: "application/json"
        } );
    } );
}

async function updateUnits ( paypalSubscriptionId, units ) {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "PATCH",
            url: `${window.apiUri}/api/v1/account/${paypalSubscriptionId}/paypal/units`,
            crossDomain: true,
            data: JSON.stringify( { units: units } ),
            success: response => resolve( response ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
            contentType: "application/json"
        } );
    } );
}

async function generateInvoice ( paypalSubscriptionId, subscription ) {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "POST",
            url: `${window.apiUri}/api/v1/account/${paypalSubscriptionId}/paypal/invoice`,
            crossDomain: true,
            data: JSON.stringify( subscription ),
            success: response => resolve( response ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            contentType: "application/json"
        } );
    } );
}

let subscribe = ( subscription ) => {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "POST",
            url: `${window.apiUri}/api/v1/paypal/subscribe`,
            crossDomain: true,
            data: JSON.stringify( subscription ),
            beforeSend: authHeader,
            success: payments => resolve( payments ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
            contentType: "application/json"
        } );
    } );
}

export { updatePlan, updateUnits, generateInvoice, subscribe/*, cancel*/ };