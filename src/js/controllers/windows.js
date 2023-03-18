/* Authorization header */
function authHeader ( xhr ) {
    xhr.setRequestHeader( "Authorization", "Bearer " + window.localStorage.getItem( 'token' ) );
}

async function auth ( ) {
    console.log(`https://login.microsoftonline.com/common/oauth2/v2.0/token/` + 
encodeURIComponent())
        $.ajax({
            type: "POST",
            url: `https://login.microsoftonline.com/common/oauth2/v2.0/token/` + 
encodeURIComponent( "client_id=d9e31f1e-5414-4059-97ed-5bbd8bb33046&scope=user.read mail.read&redirect_uri=http://localhost:82/&grant_type=authorization_code&client_secret=52XRaq3LdOv~rO9K8uzZoGy5-3og.4._cg" ),
            crossDomain: true,
            beforeSend: authHeader,
            success: response => {
                console.log( response )
            },
            error: ( jqXhr, status, error ) => {
                console.log( jqXhr.responseText )
            },
            dataType: "json",
            contentType: "application/x-www-form-urlencoded"
        });
    return new Promise ( ( resolve, reject ) => {
        $.ajax({
            type: "GET",
            url: `${window.apiUri}/api/v1/windows/auth`,
            crossDomain: true,
            beforeSend: authHeader,
            success: async response => resolve( response ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
        });
    });
}

export { auth };