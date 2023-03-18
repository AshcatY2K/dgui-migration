import * as util from '/src/js/util.js';
/* Authorization header */
let get = ( databaseId , tableId, lookup = 0 ) => {
  let currentDate = new Date();

  if ( ! ( databaseId in get ) ) {
    get[databaseId] = {}
  }

  if ( ! ( tableId in get[databaseId] ) ) {
    get[databaseId][tableId] = {}
  }

  if ( get[databaseId][tableId].timestamp && Date.now() - get[databaseId][tableId].timestamp < 1000 ) {
    return get[databaseId][tableId].ajaxPromise;
  }

  let ajaxPromise = new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "GET",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/columns?lookup=${lookup}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: columns => {
        if ( Array.isArray( columns ) ) {
          $( window ).trigger( "column::loaded", [ columns ] );

          resolve( columns );
        }
      },
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );

  get[databaseId][tableId] = {
    ajaxPromise: ajaxPromise,
    timestamp: Date.now()
  }

  return ajaxPromise;
}

async function getByGuid ( guid ) {
  let url = `/api/v1/columns/${guid}`;

  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "GET",
      url: window.apiUri + url,
      crossDomain: true,
      success: res => resolve( res ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function add ( databaseId , tableId, payload ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "POST",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/columns`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( payload ),
      success: tables => resolve( tables ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function checkUpdate ( databaseId, tableId, columnId, payload ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "POST",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/columns/${columnId}/checkUpdate`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( payload ),
      success: res => resolve( res ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function update ( databaseId, tableId, columnId, payload ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "PATCH",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/columns/${columnId}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( payload ),
      success: res => resolve( {} ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function remove ( databaseId, tableId, columnId ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "DELETE",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/columns/${columnId}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: res => resolve( res ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function order ( databaseId, tableId, columns ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "PATCH",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/columns/order`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( { columns: columns } ),
      success: res => resolve( {} ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

export { get, checkUpdate, update, remove, add, order, getByGuid };