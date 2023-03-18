import { screenReaderAlert } from '/src/js/alerts.js';

async function get ( databaseId , tableId, lookup = 0, config = {} ) {
  let url = `/api/v1/databases/${databaseId}/tables/${tableId}/records?lookup=${lookup}`;
  
  if ( config?.order?.column && config?.order?.sort ) {
    config.order.column = config.order.column;

    url += `&order_column=${config.order.column}&order_sort=${config.order.sort}`;

    if ( config?.fromTableId ) {
      url += `&order_from_table_id=${config.fromTableId}`;
    }
  }

  if ( config?.page ) url += `&page=${config.page}`;
  if ( config?.rows ) url += `&rows=${config.rows}`;

  let filters = [];
  
  if ( config?.tempFilters ) {
    filters = filters.concat( config.tempFilters );
  }

  if ( config?.filters && config.filters.length > 0 ) {
    if ( filters ) {
      config.filters[0].operator = "and";
    }

    filters = filters.concat( config.filters );
  }

  if ( filters ) {
    url += "&" + $.param( { filters: filters } );
  }

  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "GET",
      url: window.apiUri + url,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: res => {
        if ( Array.isArray( res.records ) ) {
          $( window ).trigger( "record::loaded", [ res.records ] );

          resolve( res );
        }
      },
      error: ( jqXhr, status, error ) => {
        reject( jqXhr.responseText )
      },
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function getGuid ( databaseId , tableId, recordId ) {
  let url = `/api/v1/databases/${databaseId}/tables/${tableId}/records/${recordId}/guid`;

  return new Promise ( ( resolve, reject ) => {
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
}

async function getByGuid ( guid, tableId ) {
  let url = `/api/v1/tables/${tableId}/records/${guid}`;

  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "GET",
      url: window.apiUri + url,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: res => {
        let records = {
          records: res
        }

        resolve( records )
      },
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function add ( databaseId, tableId, payload ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "POST",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/records`,
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

async function update ( databaseId, tableId, recordId, payload ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "PATCH",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/records/${recordId}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( payload ),
      success: res => resolve( {} ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function updateByGuid ( guid, payload ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "PATCH",
      url: `${window.apiUri}/api/v1/records/${guid}/guid`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( payload ),
      success: res => resolve( {} ),
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function remove ( databaseId, tableId, recordId ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "DELETE",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/records/${recordId}`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: res => {
        screenReaderAlert( "Record successfully removed" );
        resolve( {} );
      },
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function bulkRemove ( databaseId, tableId, recordIds ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax( {
      type: "DELETE",
      url: `${window.apiUri}/api/v1/databases/${databaseId}/tables/${tableId}/records`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify( recordIds ),
      success: res => {
        screenReaderAlert( "Record successfully removed" );
        resolve( {} );
      },
      error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

export { get, update, remove, bulkRemove, add, getGuid, getByGuid, updateByGuid };