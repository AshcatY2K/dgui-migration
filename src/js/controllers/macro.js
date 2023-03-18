import * as util from '/src/js/util.js';
import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';
/* Authorization header */
async function get ( database, table ) {
  let url = `/api/v1/databases/${database}/tables/${table}/macros`;

  if ( Date.now() - get.timestamp < 3000 ) {
    return get.ajaxPromise;
  }

  let ajaxPromise = new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "GET",
      url: window.apiUri + url,
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

  get.ajaxPromise = ajaxPromise;
  get.timestamp = Date.now();

  return ajaxPromise;
}

async function exec ( database, table, macroId, payload ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "POST",
      url: `${window.apiUri}/api/v1/databases/${database}/tables/${table}/macros/${macroId}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( [ payload ] ),
      success: res => resolve( res ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

export { get, exec };