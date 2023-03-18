import * as util from '/src/js/util.js';
/* Authorization header */
let get = ( databaseId , tableId ) => {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "GET",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/preferences`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: preference => resolve( preference ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

let add = ( databaseId , tableId, payload ) => {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "POST",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/preferences`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( payload ),
      success: res => resolve(),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

let update = ( databaseId, tableId, referenceId, payload ) => {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "PATCH",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/preferences/${referenceId}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( payload ),
      success: res => resolve(),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

let remove = ( databaseId, tableId, referenceId ) => {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "DELETE",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/preferences/${referenceId}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: res => resolve(),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

export { get, update, add, remove };