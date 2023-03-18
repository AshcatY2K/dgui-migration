import * as util from '/src/js/util.js';

async function confirm ( databaseId, id ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "PATCH",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/popups/${id}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: res => resolve( {} ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

export { confirm };