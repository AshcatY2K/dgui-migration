import * as util from '/src/js/util.js';
import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';
/* Authorization header */
async function get ( planId ) {
  let token = "T" + planId;
    
  if ( get[ token ] && Date.now() - get[ token ].timestamp < 1000 ) {
    return get[ token ].ajaxPromise;
  }

  let ajaxPromise = new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "GET",
      url: `${window.apiUri}/api/v1/plans/${planId}`,
      crossDomain: true,
      success: plan => { resolve( plan ) },
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );

  get[ token ] = {
    ajaxPromise: ajaxPromise,
    timestamp: Date.now()
  }

  return ajaxPromise;
}

export { get };