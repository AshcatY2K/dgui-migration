import * as util from '/src/js/util.js';

let getAuthenticateUri = ( databaseId, tableId, tableName ) => {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "POST",
            url: `${window.apiUri}/api/v1/intuit/authenticate`,
            data: JSON.stringify( {
                databaseId: databaseId,
                tableId: tableId,
                tableName: tableName
            } ),
            crossDomain: true,
            success: res => resolve( res.uri ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
            contentType: "application/json"
        } );
    } );
}

let getToken = ( uri ) => {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "POST",
            url: `${window.apiUri}/api/v1/intuit/token`,
            data: JSON.stringify( { uri: uri } ),
            crossDomain: true,
            success: res => resolve( res ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
            contentType: "application/json"
        } );
    } );
}

let sync = ( token, realmId ) => {
    return new Promise ( ( resolve, reject ) => {
        $.ajax( {
            type: "POST",
            url: `${window.apiUri}/api/v1/intuit/sync`,
            data: JSON.stringify( {
                token: token,
                realmId: realmId
            } ),
            crossDomain: true,
            success: res => resolve( res ),
            error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            dataType: "json",
            contentType: "application/json"
        } );
    } );
}

export { getAuthenticateUri, getToken, sync };