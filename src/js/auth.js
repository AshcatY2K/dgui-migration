function signIn ( email, password ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax({
      type: "POST",
      url: `${window.apiUri}/api/v1/signIn`,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify({
        email: email,
        password: password
      }),
      success: res => {
        if ( "CanCreateDatabase" in res ) {
          window.localStorage.setItem( 'CanCreateDatabase', res.CanCreateDatabase );
        }

        if ( "CanMaintainAccount" in res ) {
          window.localStorage.setItem( 'CanMaintainAccount', res.CanMaintainAccount );
        }

        resolve();
      },
      error: (jqXhr, textStatus, errorMessage) => {
        reject( JSON.parse( jqXhr.responseText ) );
      },
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

function signOut ( url = "/" ) {
  window.location.href = url;
}

let whoAmI = () => {
  if ( Date.now() - whoAmI.timestamp < 200 ) {
    return whoAmI.ajaxPromise;
  }

  let ajaxPromise = new Promise( ( resolve, reject ) => {
  	$.ajax({
  	  type: "GET",
  	  url: `${window.apiUri}/api/v1/users`,
      xhrFields: {
        withCredentials: true
      },
  	  crossDomain: true,
  	  success: res => {
          resolve( res );
  	  },
  	  error: (jqXhr, textStatus, errorMessage) => {
          signOut();

  	   reject( JSON.parse( jqXhr.responseText ) );
  	  },
  	  contentType: "application/json"
  	});
  } );

  whoAmI.ajaxPromise = ajaxPromise;
  whoAmI.timestamp = Date.now();

  return ajaxPromise;
}

async function confirmEmail ( code ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax({
      type: "POST",
      url: `${window.apiUri}/api/v1/confirmEmail`,
      crossDomain: true,
      data: JSON.stringify({ code: code }),
      success: res => { resolve(); },
      error: (jqXhr, textStatus, errorMessage) => {
        reject( JSON.parse( jqXhr.responseText ) );
      },
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function resetPasswordRequest ( email ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax({
      type: "POST",
      url: `${window.apiUri}/api/v1/resetPasswordRequest`,
      crossDomain: true,
      data: JSON.stringify({ email: email }),
      success: res => {
        resolve();
      },
      error: (jqXhr, textStatus, errorMessage) => {
        reject( JSON.parse( jqXhr.responseText ) );
      },
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}

async function resetPassword ( password, code ) {
  return new Promise ( ( resolve, reject ) => {
    $.ajax({
      type: "POST",
      url: `${window.apiUri}/api/v1/resetPassword`,
      crossDomain: true,
      data: JSON.stringify({ 
        password: password,
        code: code
      }),
      success: res => {
        resolve();
      },
      error: (jqXhr, textStatus, errorMessage) => {
        reject( JSON.parse( jqXhr.responseText ) );
      },
      dataType: "json",
      contentType: "application/json"
    } );
  } );
}
// Intercept AJAX request and redirect to home screen if session expired
( open => {
  XMLHttpRequest.prototype.open = function ( XMLHttpRequest ) {
    this.addEventListener( "readystatechange", function () {
      try {
        let json = JSON.parse( this.response );

        if ( json?.errors?.name ) {
          console.log(json.errors)
          //window.location.href = '/dashboard';
          return false;
        }
      } catch (e) {}
    }, false );
    
    open.apply(this, arguments);
  };
} )( XMLHttpRequest.prototype.open );

export { signIn, signOut, whoAmI, confirmEmail, resetPasswordRequest, resetPassword }