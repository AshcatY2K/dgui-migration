import * as util from '/src/js/util.js';

export function get ( database, table = -1 ) {
    let currentDate = new Date(),
      timestamp = currentDate.getTime(),
      token = "T" + util.stringToHash( database );

    if ( get[ token ] && timestamp - get[ token ].timestamp < 2000 ) {
      return get[ token ].ajaxPromise;
    }

    let ajaxPromise = new Promise ( ( resolve, reject ) => {
      $.ajax( {
        type: "GET",
        url: `${window.apiUri}/api/v1/databases/${database}/tables`,
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        success: tables => {
          if ( Array.isArray( tables ) ) {
            resolve( tables );
          }
        },
        error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
        dataType: "json",
        contentType: "application/json"
      } );
    } );

    get[ token ] = {
      ajaxPromise: ajaxPromise,
      timestamp: timestamp
    }

    return ajaxPromise;
  }
  
export async function add ( config, database ) {
    if ( Date.now() - add.timestamp < 10000 ) {
      return add.ajaxPromise;
    }

    config.fromTableId = 0;

    let ajaxPromise = new Promise ( ( resolve, reject ) => {
      $.ajax( {
        type: "POST",
        url: `${window.apiUri}/api/v1/databases/${database}/tables`,
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        data: JSON.stringify( config ),
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
  
export async function update ( config, database, table ) {
    return new Promise ( ( resolve, reject ) => {
      $.ajax( {
        type: "PATCH",
        url: `${window.apiUri}/api/v1/databases/${database}/tables/${table}`,
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        data: JSON.stringify( config ),
        success: res => resolve( res ),
        error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
        dataType: "json",
        contentType: "application/json"
      } );
    } );
  }
  
export async function remove ( database, table ) {
    return new Promise ( ( resolve, reject ) => {
      $.ajax( {
        type: "DELETE",
        url: `${window.apiUri}/api/v1/databases/${database}/tables/${table}`,
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
  
export function getByGuid ( guid ) {
    if ( Date.now() - getByGuid.timestamp < 10000 ) {
      return getByGuid.ajaxPromise;
    }

    let ajaxPromise = new Promise ( ( resolve, reject ) => {
      $.ajax( {
        type: "GET",
        url: `${window.apiUri}/api/v1/tables/${guid}`,
        crossDomain: true,
        success: tables => {
          if ( Array.isArray( tables ) ) {
            resolve( tables );
          }
        },
        error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
        dataType: "json",
        contentType: "application/json"
      } );
    } );

    getByGuid.ajaxPromise = ajaxPromise;
    getByGuid.timestamp = Date.now();

    return ajaxPromise;
  }
  
export function download ( database, table, config ) {
    let url = `${window.apiUri}/api/v1/databases/${database}/tables/${table}/download`,
      params = "";

    if ( config?.order?.column ) {
      params = `&order_column=${config.order.column}`;
    }

    if ( config?.order?.sort ) {
      params += `&order_sort=${config.order.sort}`;
    }
    
    if ( config?.filters ) {
      params += "&" + $.param( { filters: config.filters } );
    }

    if ( params ) {
      url += `?${params}`;
    }

    return new Promise ( ( resolve, reject ) => {
      $.ajax( {
        type: "GET",
        url: url,
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        success: response => {
          var uri = encodeURI( response.filename );

          resolve( `${window.apiUri}/${uri}` );
        },
        error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
        dataType: "json",
        contentType: "application/json"
      } );
    } );
  }
  
export function checkUploadHeadings ( database, table, formData ) {
    let url = `${window.apiUri}/api/v1/databases/${database}/tables/${table}/upload/checkHeadings`;

    return new Promise ( ( resolve, reject ) => {
      $.ajax( {
        url: url,
        crossDomain: true,
        processData: false,
        contentType: false,
        type: 'POST',
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


export function upload ( database, table, formData ) {
    let url = `${window.apiUri}/api/v1/databases/${database}/tables/${table}/upload`;

    return new Promise ( ( resolve, reject ) => {
      $.ajax( {
        url: url,
        crossDomain: true,
        contentType: false,
        processData: false,
        type: 'POST',
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
  
export function relationships ( database, table  ) {
    if ( Date.now() - relationships.timestamp < 3000 ) {
      return relationships.ajaxPromise;
    }

    let ajaxPromise = new Promise ( ( resolve, reject ) => {
      $.ajax( {
        type: "GET",
        url: `${window.apiUri}/api/v1/databases/${database}/tables/${table}/relationships`,
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        success: relationships => {
          if ( Array.isArray( relationships ) ) {
            resolve( relationships );
          }
        },
        error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
        dataType: "json",
        contentType: "application/json"
      } );
    } );

    relationships.ajaxPromise = ajaxPromise;
    relationships.timestamp = Date.now();

    return ajaxPromise;
  }

export function formUpdate ( form, database, table ) {
    return new Promise ( ( resolve, reject ) => {
      $.ajax( {
        type: "PUT",
        url: `${window.apiUri}/api/v1/databases/${database}/tables/${table}/form`,
        crossDomain: true,
        data: JSON.stringify( { form: form } ),
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