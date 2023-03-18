import * as util from '/src/js/util.js';
/* Authorization header */
let 
    add = ( databaseId, tableId, template, reportName, config ) => {
        return new Promise ( ( resolve, reject ) => {
            $.ajax( {
                type: "POST",
                url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/report`,
                crossDomain: true,
                data: JSON.stringify( { 
                    template: template, 
                    name: reportName, 
                    config: config 
                } ),
                success: res => resolve( {} ),
                error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
                dataType: "json",
                contentType: "application/json"
            } );
        } );
    }, 
    update = ( databaseId, tableId, template, reportName, guid, config ) => {
        return new Promise ( ( resolve, reject ) => {
            $.ajax( {
                type: "PATCH",
                url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/report/${guid}`,
                crossDomain: true,
                data: JSON.stringify( { 
                    template: template, 
                    name: reportName, 
                    config: config 
                } ),
                success: res => resolve( {} ),
                error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
                dataType: "json",
                contentType: "application/json"
            } );
        } );
    },
    generate = ( databaseId, tableId, recordId, guid, tableName, tableData ) => {
        if ( Date.now() - generate.timestamp < 10000 ) {
            return generate.ajaxPromise;
        }
        
        let ajaxPromise = new Promise ( ( resolve, reject ) => {
            $.ajax( {
                type: "POST",
                url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/report/${guid}/generate?tableName=${tableName}`,
                crossDomain: true,
                data: JSON.stringify( { tableData: tableData, recordId: recordId } ),
                contentType: "application/json",
                xhr: () => {
                    let xhr = new XMLHttpRequest();

                    xhr.onreadystatechange = () => {
                        if ( xhr.readyState == 2 ) {
                            xhr.responseType = ( xhr.status == 200 ) ? "blob" : "text";
                        }
                    };

                    return xhr;
                },
                success: response => resolve( response ),
                error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
            } );
        } );

        generate.ajaxPromise = ajaxPromise;
        generate.timestamp = Date.now();

        return ajaxPromise;
    },
    remove = ( databaseId, tableId, guid, ) => {
        return new Promise ( ( resolve, reject ) => {
            $.ajax( {
                type: "DELETE",
                url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/report/${guid}}`,
                crossDomain: true,
                success: response => resolve( {} ),
                error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
                dataType: "json",
                contentType: "application/json"
            } );
        } );
    },
    get = ( databaseId, tableId ) => {
        let ajaxPromise = new Promise ( ( resolve, reject ) => {
            $.ajax( {
                type: "GET",
                url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/report`,
                crossDomain: true,
                success: reports => {
                    if ( Array.isArray( reports ) )
                        resolve( reports );
                },
                error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
                dataType: "json",
                contentType: "application/json"
            } );
        } );

        return ajaxPromise;
    },
    getTemplate = ( databaseId, tableId, guid ) => {
        let ajaxPromise = new Promise ( ( resolve, reject ) => {
            $.ajax( {
                type: "GET",
                url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/report/${guid}`,
                crossDomain: true,
                success: reports => {
                    if ( Array.isArray( reports ) ) {
                        resolve( reports );
                    }
                },
                error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
                dataType: "json",
                contentType: "application/json"
            } );
        } );

        return ajaxPromise;
    }

export { add, update, generate, get, getTemplate, remove };