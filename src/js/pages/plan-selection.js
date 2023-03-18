import { toastSuccess, toastError } from '../alerts.js';
import * as user from '../controllers/user.js';
import * as account from '../controllers/account.js';
import * as util from '../util.js';
import Collapse from '../components/mdb/bootstrap/mdb-prefix/collapse';

document.title = "Sign Up";

const urlParams = new URLSearchParams( window.location.search );

let plan = urlParams.get('plan'),
  plans = {
    "starter": {
      label: "Starter",
      id: 'P-2YH66271D3684780PMFKYFFI', 
      units: 10,
      gb: 1,
      databases: 3,
      users: "-",
      price: 15
    },
    "pro": {
      label: "Pro",
      id: 'P-3FR85061RG563430UMFKX3UI', 
      units: 100,
      gb: 10,
      databases: 8,
      users: "-",
      price: 79
    },
    "corporate": {
      label: "Corporate",
      id: 'P-4AP795580V944103RMFKX2YI',
      units: 200,
      gb: 20,
      databases: 25,
      users: "-",
      price: 140
    },
    "crm-accounting": {
      label: "CRM: Accountants &amp; Auditors",
      id: 'P-853006799C2510635MFUTVLA',
      units: 10,
      gb: 1,
      databases: "-",
      users: 1,
      price: 400
    }
  };

$( ".form-outline" ).each( ( index, element ) => {
  util.initMDBElements( $( element ) );
} );

$( document )
  .on( "submit", "#signup", ( e ) => {
    let details = {
        plan: plan
      },
      $form = $( "#signup" ),
      $email = $form.find( "#email" ),
      $confirmEmail = $form.find( "#confirm-email" ),
      email = $email.val(),
      confirmEmail = $confirmEmail.val(),
      errorMsg = "Please provide a valid email address.";

    e.preventDefault();

    
    $email[0].setCustomValidity( "" );
    $confirmEmail[0].setCustomValidity( "" );

    $form.find( "input" ).each( ( index, element ) => {
      let id = $( element ).attr( "id" );

      details[ id ] = $( element ).val();
    } );

    if ( $('#marketing').is(':checked') ) {
      details[ "marketing" ] = true;
    } else {
      details[ "marketing" ] = false;
    }

    $form.addClass('was-validated');
    
    $( ".form-control:invalid" ).attr( "aria-invalid", "false" );

    if ( email !== confirmEmail ) {
      errorMsg = "Please provide matching email addresses";
    
      $email[0].setCustomValidity( errorMsg );
      $confirmEmail[0].setCustomValidity( errorMsg );
    }

    $email.siblings( ".invalid-feedback" ).html( errorMsg );
    $confirmEmail.siblings( ".invalid-feedback" ).html( errorMsg );

    if ( ! $form[0].checkValidity() || email !== confirmEmail ) {
      $( ".invalid-tooltip:visible").attr( "role", "alert" );
      $( ".form-control:invalid" ).attr( "aria-invalid", "true" );
      
      return false;
    }
    
    account.add( details )
      .then( ( res ) => {
        window.location.href = '/confirmEmail';

        toastSuccess( 
          `Successfull signup`, 
          `Your account has been created` 
        );
      } )
      .catch( ( error ) => {
        if ( typeof error === "string" ) {
          error = JSON.parse( error );
          error = error.errors
        }

        toastError( `Error during signup`, error );
      } );
  } );

$( ".toggle-password input" ).on( "click", ( e ) => {
  let $input = $('#password'),
    $parent = $( e.target ).closest( ".toggle-password" );

  if ( $( e.target ).is(':checked') ) {
    $input.attr('type', 'text');
    $parent.find( "i" ).removeClass( "fa-eye" ).addClass( "fa-eye-slash" );
    $parent.find( ".label" ).html( "Hide" );
  } else {
    $input.attr('type', 'password');
    $parent.find( "i" ).removeClass( "fa-eye-slash" ).addClass( "fa-eye" );
    $parent.find( ".label" ).html( "Show" );
  }
} );

const collapseElementList = [].slice.call(document.querySelectorAll('.collapse')),
  collapseList = collapseElementList.map( ( collapseEl ) => {
    return new Collapse(collapseEl, {
    toggle: false,
    } );
  } );