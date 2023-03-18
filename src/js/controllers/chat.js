import * as util from '/src/js/util.js';
/* Authorization header */
let person = {
    get: ( databaseId ) => {
      let url = `/api/v1/databases/${databaseId}/chat/persons`;

      if ( Date.now() - person.get.timestamp < 1000 ) {
        return person.get.ajaxPromise;
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

      person.get.ajaxPromise = ajaxPromise;
      person.get.timestamp = Date.now();

      return ajaxPromise;
    }
  },
  message = {
    get: ( databaseId, tableId, recordId, timestamp = false ) => {
      if ( Date.now() - message.get.timestamp < 1000 ) {
        return message.get.ajaxPromise;
      }

      let ajaxPromise = new Promise ( ( resolve, reject ) => {
        $.ajax( {
          type: "GET",
          url: `${window.apiUri}/api/v1/databases/${databaseId}/table/${tableId}/record/${recordId}/chat/${timestamp}`,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          },
          success: messages => resolve( messages ),
          error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
          dataType: "json",
          contentType: "application/json"
        } );
      } );

      message.get.ajaxPromise = ajaxPromise;
      message.get.timestamp = Date.now();

      return ajaxPromise;
    },
    add: ( databaseId, tableId, recordId, payload ) => {
      return new Promise ( ( resolve, reject ) => {
        $.ajax( {
          type: "POST",
          url: `${window.apiUri}/api/v1/databases/${databaseId}/table/${tableId}/record/${recordId}/chat`,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          },
          data: JSON.stringify( payload ),
          success: res => resolve( res ),
          error: ( jqXhr, status, error ) => reject( jqXhr.responseText ),
          dataType: "json",
          contentType: "application/json"
        } );
      } );
    }
  }

export { person, message };