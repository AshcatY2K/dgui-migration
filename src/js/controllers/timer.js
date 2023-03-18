import * as util from '/src/js/util.js';

let start = ( databaseId, tableId, recordId ) => {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "POST",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/record/${recordId}/timer`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: res => {
        get.timestamp = 0;

        resolve()
      },
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

let stop = ( databaseId ) => {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "DELETE",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/timer`,
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

let get = ( databaseId ) => {
  if ( Date.now() - get.timestamp < 1000 ) {
    return get.ajaxPromise;
  }

  let ajaxPromise = new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "GET",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/timer`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: timer => resolve( timer ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );

  get.ajaxPromise = ajaxPromise;
  get.timestamp = Date.now();

  return ajaxPromise;
}

export { start, stop, get };