import { screenReaderAlert } from './alerts.js';
import { signIn, signOut, whoAmI, confirmEmail, resetPasswordRequest, resetPassword } from "/src/js/auth.js"
import * as focusTrap from './components/focusTrap.js';

import Select from './components/mdb/pro/sidenav.js';

const routes = [
    { path: "/windowsAuth", view: '/views/WindowsAuth.html', secure: true },
    { path: "/intuit/autenticated", view: '/views/intuitAutenticated.html', secure: true }
]

window.app = {
    auth: {
        signIn: signIn,
        signOut: signOut,
        whoAmI: whoAmI,
        confirmEmail: confirmEmail,
        resetPasswordRequest: resetPasswordRequest,
        resetPassword: resetPassword
    },
    elements: {
        active: {}
    }
}

window.apiUri = "https://datagrowdockerapi.azurewebsites.net";

if ( window.location.host === "datagrowui-beta.azurewebsites.net" ) {
    window.apiUri = "https://datagrowdockerapi-beta.azurewebsites.net";
} else if ( window.location.host === "beta.mydatagrows.com" ) {
    window.apiUri = "https://betaapi.mydatagrows.com";
} else if ( window.location.host === "dgui.local" ) {
    window.apiUri = "https://dgapi.local:444";
}

var alterResponse = function (opts) {
    /**
     * Function modifies $.ajax responses
     * by allowing you to modify ajax response object before each bound success callback.
     * Currently it supports only `success` callbacks, `error` and `complete` support to come.
     * @param {RegExp} opts.urlMatch - use this to filter calls by url
     * @param {String} opts.dataType - Optional - use this to filter calls by response type
     * @param {Function} opts.successWrapper - function that gets called before each ajax callback
     *          - function (options:Object, originalOptions:Object, jqXHR:jQuery.XHR, originalSuccess: Function)
     */
    var callback = function ( options, originalOptions, jqXHR ) {
      var check = true;

      if ( opts.urlMatch && !options.url.match(opts.urlMatch) ) check = false;
      if ( opts.typeMatch && !options.type.match(opts.typeMatch) ) check = false;

      if ( check ) {
        var originalSuccess = originalOptions.success || options.success,
          originalError = originalOptions.error || options.error,
          originalBeforeSend = originalOptions.beforeSend || options.beforeSend

        let successNext = ( data ) => originalSuccess( data ),
          errorNext = ( data ) => originalError( data );

        originalOptions.success = options.success = function () {
          opts.successWrapper.call( 
            null, options, originalOptions, jqXHR, successNext 
          );
        };

        originalOptions.error = options.error = function () {
          opts.errorWrapper.call( 
            null, options, originalOptions, jqXHR, errorNext
          );
        };
      }
    };

    if ( opts.dataTypes ) {
      $.ajaxPrefilter(opts.dataTypes, callback);
    } else {
      $.ajaxPrefilter(callback);
    }
};

alterResponse( { 
    urlMatch: false, 
    typeMatch: false, 
    dataTypes: "*", 
    successWrapper: ( options, originalOptions, jqXHR, next ) => {
      if ( options.dataTypes.includes( "binary" ) ) {
        next(jqXHR);
        return;
      }

      var response = JSON.parse( jqXHR.responseText );

      if ( "payload" in response ) {
        response = response.payload;
      }

      if ( originalOptions?.xhrFields?.withCredentials ) {
        if ( window.timeoutID ) {
          clearTimeout( window.timeoutID );
        }

        window.timeoutID = setTimeout( function (msg) {
          window.app.auth.signOut( "/signin" );
          clearTimeout( window.timeoutID );
        }, 24 * 60 * 60 * 1000 );
      }

      next( response );
    }, 
    errorWrapper: ( options, originalOptions, jqXHR, next ) => {
      try {
        let response = JSON.parse( jqXHR.responseText ),
          signedOutErr = "You are currently logged into another device. Please log out and back in.",
          tokenErrArray = [ "TokenExpiredError", "JsonWebTokenError" ],
          error;

        if ( tokenErrArray.includes( response?.errors?.name ) ) {
          error = "Session expired. You have been signed out";
        } else if ( response?.errors?.name == "FatalError" ) {
          error = response.errors.message;
        } else if ( response?.errors == signedOutErr ) {
          error = response.errors;
        } else if ( response?.errors == "Authentication required" ) {
          error = response.errors;
        }
        
        if ( response?.payload ) {
          jqXHR.responseText = JSON.stringify( response.payload );
        }

        if ( error ) {
          window.localStorage.setItem( 'error', error );

          window.location.href = '/signout';
        }

        next( jqXHR );
      } catch ( e ) {
        next( jqXHR )
      }
    } 
} );

window.history.pushState = new Proxy( window.history.pushState, {
  apply: (target, thisArg, argArray) => {
    $( window ).trigger( "pushstate", [ argArray ] );
    
    return target.apply(thisArg, argArray);
  },
});

$( document )
  .on( "click", ".btn-close, .modal.fade", ( e ) => {
    if ( 
      ! $( e.target ).hasClass( "btn-close" ) && 
      ! $( e.target ).hasClass( "fade" ) 
    ) {
      return;
    }

    $( ".select-dropdown.open" ).removeClass( "open" )
  } )
  .on( "input", "input[data-mdb-showcounter='true']", function ( e ) {
    let maxLength = $( this ).attr( 'maxlength' ),
      inputLength = $( this ).val().length;

    $( this ).parent().find( ".form-counter" ).html( `${inputLength}/${maxLength}` )
  } )
  .on( "keypress", ".popconfirm-toggle", function ( e ) {
    if ( e.which == 32) {
      $( e.target ).trigger( "click" );
    }

    if ( e.which == 13 || e.keyCode == 32 ) {
    }
  } )
  .on( "click", ".popconfirm-toggle", function ( e ) {
    setTimeout( () => {
      $( ".popconfirm-popover, .popconfirm-modal" ).trap();
      $( ".popconfirm-popover .popconfirm-message-text, .popconfirm-modal .popconfirm-message-text" ).eq(0)
        .attr( "role", "alert" )
        .attr( "tabindex", "0" )
        .focus();  
    }, 100);
  } )
  .on( "keyup", "[maxlength]", function ( e ) {
    if ( $( this ).attr( "maxLength" ) == $( this ).val().length ) {
      screenReaderAlert( "max input length reached" )
    }
  } )
  .on( "keyup", "a", function ( e ) {
    if ( e.which == 32 ) {
      $( this )[0].click();
    }
  } )
  .on( "click", ".stylized-link", function ( e ) {
    if ( ! e.target.hasAttribute( "href" ) ) {
      $( this ).find( "a" )[0].click();
    }
  } )
  .on( 'close.mdb.datepicker', function ( e ) {
    $( ".datepicker-dropdown-container" ).free();
    $( ".floating-panel" ).trap();
  } )
  .on( "mousemove", "*", e => {
    let overflowY = $(e.target).css('overflow-y'),
      overflowX = $(e.target).css('overflow-x'),
      overflow = $(e.target).css('overflow'),
      values = [ "scroll", "auto", "overlay" ]

    $( '.more-width' ).removeClass( 'more-width' );

    if ( values.includes( overflowY ) || values.includes( overflow ) ) {
      let distance = $( e.target ).width() - e.offsetX;

      if ( distance < 20 && distance > -20 ) {
        $( e.target ).addClass('more-width');
      }
    }

    if ( values.includes( overflowX ) || values.includes( overflow ) ) {
      let distance = $( e.target ).height() - e.offsetY;

      if ( distance < 20 && distance > -20 ) {
        $( e.target ).addClass('more-width');
      }
    }
  } );

if ( window.localStorage.getItem( 'CanMaintainAccount' ) == "0" ) {
  $( ".my-account-link-container" ).remove();
}