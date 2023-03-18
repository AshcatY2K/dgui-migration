import * as util from '/src/js/util.js';
/* Authorization header */
function authHeader ( xhr ) {
    xhr.setRequestHeader( "Authorization", "Bearer " + window.localStorage.getItem( 'token' ) );
}

async function update ( account, units, licences, plan ) {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "PATCH",
            url: `${window.apiUri}/api/v1/account/${account}/netcash`,
            crossDomain: true,
            beforeSend: authHeader,
            data: JSON.stringify( { 
                units: units,
                licences: licences,
                plan: plan
            } ),
            success: response => resolve( response ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
            contentType: "application/json"
        } );
    } );
}

async function cancel ( account ) {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "DELETE",
            url: `${window.apiUri}/api/v1/account/${account}/netcash`,
            crossDomain: true,
            beforeSend: authHeader,
            success: response => resolve( response ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
            contentType: "application/json"
        } );
    } );
}

export { update, cancel };