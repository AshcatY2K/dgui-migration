/* Authorization header */
let download = ( database, table, id, guid ) => {
  if ( Date.now() - download.timestamp < 1000 ) {
    return download.ajaxPromise;
  }
  
  let ajaxPromise = new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "GET",
      url: `${window.apiUri}/api/v1/databases/${database}/tables/${table}/records/${id}/documents/${guid}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      xhr: () => {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
          if ( xhr.readyState == 2 ) {
            xhr.responseType = ( xhr.status == 200 ) ? "blob" : "text";
          }
        };

        return xhr;
      },
      success: response => { resolve( response ) },
      error: ( jqXhr, status, error ) => { reject( jqXhr.responseText ) }
    } );
  } );

  download.ajaxPromise = ajaxPromise;
  download.timestamp = Date.now();

  return ajaxPromise;
}

let remove = ( database, table, id, guid ) => { 
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "DELETE",
      url: `${window.apiUri}/api/v1/databases/${database}/tables/${table}/records/${id}/documents/${guid}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: response => resolve( response ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
    } );
  } );
}

let upload = ( database, table, id, formData ) => {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: 'POST',
      url: `${window.apiUri}/api/v1/databases/${database}/tables/${table}/records/${id}/documents`,
      crossDomain: true,
      contentType: false,
      processData: false,
      data: formData,
      xhrFields: {
        withCredentials: true
      },
      success: response => resolve( response ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
        dataType: "json"
    } );
  } );
}

let get = ( database, table, id ) => {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: 'GET',
      url: `${window.apiUri}/api/v1/databases/${database}/tables/${table}/records/${id}/documents`,
      crossDomain: true,
      dataType: "json",
      contentType: "application/json",
      xhrFields: {
        withCredentials: true
      },
      success: response => resolve( response ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
    } );
  } );
}

export { upload, get, download, remove };