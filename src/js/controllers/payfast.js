import * as util from '/src/js/util.js';
/* Authorization header */
async function update ( data ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "PATCH",
      url: `${window.apiUri}/api/v1/account/${data.accountId}/payfast`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( data ),
      success: response => resolve( response ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function cancel ( data ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "DELETE",
      url: `${window.apiUri}/api/v1/account/${data.accountId}/payfast`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( data ),
      success: response => resolve( response ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function hashInput ( data ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "POST",
      url: `${window.apiUri}/api/v1/payfast/hashInput`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( data ),
      success: response => resolve( response.hash ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

export { update, cancel, hashInput };