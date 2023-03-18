async function send ( recipients, body ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "POST",
      url: `${window.apiUri}/api/v1/email/send`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( { recipients: recipients, body: body } ),
      success: res => resolve( res ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

export { send };