import * as util from '/src/js/util.js';
/* Authorization header */
function authHeader ( xhr ) {
    xhr.setRequestHeader( "Authorization", "Bearer " + window.localStorage.getItem( 'token' ) );
}

let getFunctionalityMatrix = () => {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "GET",
            url: `${window.apiUri}/api/v1/reports/functionalityMatrix`,
            crossDomain: true,
            success: html => resolve( html ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json"
        } );
    } );
}

export { getFunctionalityMatrix };