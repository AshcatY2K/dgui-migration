import * as util from '/src/js/util.js';
/* Authorization header */
let 
  get = () => {
    if ( get.timestamp && Date.now() - get.timestamp < 10000 ) {
      return get.ajaxPromise;
    }
    
    get.ajaxPromise = new Promise ( ( resolve, reject ) => {
        $.ajax( {
          type: "GET",
          url: `${window.apiUri}/api/v1/account`,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          },
          success: account => resolve( account ),
          error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
          dataType: "json",
          contentType: "application/json"
        } );
      } );

    get.timestamp = Date.now();

    return get.ajaxPromise;
  },
  invoice = () => {
    if ( invoice.timestamp && Date.now() - invoice.timestamp < 10000 ) {
      return invoice.ajaxPromise;
    }
    
    invoice.ajaxPromise = new Promise ( ( resolve, reject ) => {
        $.ajax( {
          type: "GET",
          url: `${window.apiUri}/api/v1/account/invoice`,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          },
          success: invoice => resolve( invoice[0] ),
          error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
          dataType: "json",
          contentType: "application/json"
        } );
      } );

    invoice.timestamp = Date.now();

    return invoice.ajaxPromise;
  },
  add = async ( accountDetails ) => {
    return new Promise ( ( resolve, reject ) => {
      $.ajax( {
        type: "POST",
        url: `${window.apiUri}/api/v1/account`,
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        data: JSON.stringify( accountDetails ),
        success: response => resolve( response ),
        error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
        dataType: "json",
        contentType: "application/json"
      } );
    } );
  },
  update = async ( accountDetails ) => {
    return new Promise ( ( resolve, reject ) => {
      $.ajax( {
        type: "PATCH",
        url: `${window.apiUri}/api/v1/account`,
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        data: JSON.stringify( accountDetails ),
        success: response => resolve( response ),
        error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
        dataType: "json",
        contentType: "application/json"
      } );
    } );
  }

async function remove () {}

export { get, update, remove, add, invoice };