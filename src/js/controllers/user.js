async function add ( user ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax({
      type: "POST",
      url: `${window.apiUri}/api/v1/signup`,
      crossDomain: true,
      data: JSON.stringify( user ),
      success: async response => resolve( response ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    });
  });
}

export { add };