export async function get ( ) {
  if ( Date.now() - get.timestamp < 5000 ) {
    return get.ajaxPromise;
  }

  let ajaxPromise = new Promise ( ( resolve, reject ) => {
    $.ajax({
      type: "GET",
      url: `${window.apiUri}/api/v1/databases`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: async databases => resolve( databases ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    });
  });

  get.ajaxPromise = ajaxPromise;
  get.timestamp = Date.now();

  return ajaxPromise;
}

export function getTables ( databaseId ) {
  if ( Date.now() - getTables.timestamp < 5000 ) {
    return getTables.ajaxPromise;
  }

  let ajaxPromise = new Promise ( ( resolve, reject ) => {
    $.ajax({
      type: "GET",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: async tables => {
        if ( Array.isArray( tables ) ) {
          resolve( tables );
        }
      },
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    });
  });


  getTables.ajaxPromise = ajaxPromise;
  getTables.timestamp = Date.now();

  return ajaxPromise;
}

export async function update ( name, id ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax({
      type: "PATCH",
      url: `${window.apiUri}/api/v1/databases/${id}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( { databaseName: name } ),
      success: async response => resolve( response ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    });
  });
}

export async function remove ( databaseId ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "DELETE",
      url: `${window.apiUri}/api/v1/databases/${databaseId}`,
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

export async function add ( name ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax({
      type: "POST",
      url: `${window.apiUri}/api/v1/databases`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( { databaseName: name } ),
      success: async response => resolve( response ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    });
  });
}