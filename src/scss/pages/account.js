import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

import * as account from '/src/js/controllers/account.js';
import * as payment from '/src/js/controllers/payment.js';
import * as paypal from '/src/js/controllers/paypal.js';
import * as netcash from '/src/js/controllers/netcash.js';
import * as payfast from '/src/js/controllers/payfast.js';

import * as plan from '/src/js/controllers/plan.js';

import * as util from '/src/js/util.js';
import Popconfirm from '../components/mdb/pro/popconfirm';

import DGTemporal from '../components/inputs/temporal.js';

document.title = "My Account";
  
$( ".account-section" ).hide();

$( '.popconfirm-toggle' ).each( ( index, element ) => {
  new Popconfirm( element )
} );

let hash = ( window.location.hash ) ? window.location.hash : "#account",
  subscriptionId,
  accountInfo = account,
  plans = [],
  chosenPlan;

plans[7] = { name: "free", cost: 0 };
plans[8] = { name: "starter", cost: 15 };
plans[9] = { name: "pro", cost: 79 };
plans[12] = { name: "corporate", cost: 140 };
plans[16] = { name: "crm-accounting", cost: 250 };

$( hash ).show();

$( window ).on( 'hashchange', function( e ) {
  let hash = ( window.location.hash ) ? window.location.hash : "#account";

  $( ".account-section" ).hide();
  $( hash ).show();
} );

function calcSubscriptionTotal () {
  let licenseCost = $( "#licences" ).val() * 
      parseInt(accountInfo["Discounted Price"])

  let storageCost = $( "#storage" ).val() * 10 * 
      parseInt(chosenPlan["Cost per 100MB"]);

  $( "#license-price-wrapper" ).show();

  $( "#license-price-wrapper .total" ).html( licenseCost + storageCost );
}

account.get()
  .then( async ( account ) => {
    account = account[0];

    accountInfo = account;

    if ( ! account ) {
      return;
    }

    chosenPlan = await plan.get( account["Plan"] );

    let planId = account["Plan"];

    $( "#license-price-wrapper" ).show();

    if ( plans[ planId ].name !== "free" ) {
      $( "#cancel-subscription-wrapper" ).show(); 
    }

    $( "button[value='" + plans[ planId ].name + "']" )
      .addClass( "disabled" )
      .html( "Current Plan" )
      .closest( ".pricing-container" )
      .addClass( "shadow-1-strong" )

    $( ".plan-name" ).html( plans[ planId ].name );

    if ( plans[ planId ].name == "crm-accounting" ) {
      $( ".plan-cost" ).html( "R " + plans[ planId ].cost + ".00" );
      $( ".plan-container" ).hide();

      $( "#licence-wrapper" ).show();
      $( "#storage-wrapper" ).show();

      $( "#licences" ).val( Math.max( account["Number Of Licences"], 1 ) );
      $( "#storage" ).val( account["Additional Storage Licence 100MB"] / 10 );

      calcSubscriptionTotal();

      $( ".plan-date-registered" ).html( account["Date Created"].split("T")[0] );

      if ( ! accountInfo["PayFast Token"] ) {
        $( "#subscription-cancel" ).hide();
        $( "#subscription-cancel" ).prev().hide();
        $( ".accounting-crm-cost" ).show();

        $( "#debit-order-wrapper" ).show();
      } else {
        let token = accountInfo["PayFast Token"];

        $( "#update-card" ).attr( "href", `https://www.payfast.co.za/eng/recurring/update/${token}` );

        $( "#update-card-wrapper" ).show();
      }
    } else {
      $( ".plan-cost" ).html( "$" + plans[ planId ].cost + ".00" );
    }

    $( "#firstname" ).val( account["First Name"] );
    $( "#lastname" ).val( account["Last Name"] );
    $( "#email" ).val( account["Email"] );
    $( "#plan" ).val( account["Plan"] );
    $( "#phoneNumber" ).val( account?.["Phone number"] );
    $( "#accountName" ).val( account?.["Account Name"] );
    $( "#companyName" ).val( account?.["Company Name"] );
    $( "#taxNumber" ).val( account?.["Company registration number"] );
    $( "#companyRegNumber" ).val( account?.["Tax number"] );
    $( "#address1" ).val( account?.["Address 1"] );
    $( "#address2" ).val( account?.["Address 2"] );
    $( "#city" ).val( account?.["City"] );
    $( "#zipCode" ).val( account?.["Zip code"] );
    $( "#state" ).val( account?.["State"] );
    $( "#country" ).val( account?.["Country"] );
    $( "#payPalSubscriptionId" ).val( account?.["payPalSubscriptionId"] );

    if ( account["Debit Order"] ) {
      $( "#debit-order" ).prop( "checked", true );
    }

    if ( "Payment day" in account ) {
      let $dayOfPayment = $( "#day-of-payment" );

      const today = new Date(),
        day = today.getDate();

      for (var i = 1; i <= 28; i++) {
        let $option = $( "<option>", { value: i } ).html( i );

        if ( i == account["Payment day"] ) {
          $option.prop( "selected", true );
        } else if ( i == day ) {
          $option.prop( "selected", true );
        }

        $dayOfPayment.append( $option );
      }

      let $option = $( "<option>", { value: "31" } ).html( "Last day of the month" );

      $dayOfPayment.append( $option );
    }

    if ( 
      plans[ planId ].name !== "free" && 
      plans[ planId ].name !== "crm-accounting" 
    ) {
      $( "#storage-wrapper" ).show();

      subscriptionId = account["payPalSubscriptionId"];

      payment.get( subscriptionId )
        .then( ( payments ) => {
          let storageMap = {
              "8": 10,
              "9": 100,
              "12": 200  
            },
            units = payments[ payments.length - 1 ].Units,
            storage = units / 10,
            additionalStorage = storage - ( storageMap[ planId ] / 10 );

          $( "#storage" ).val( additionalStorage );

          $( ".plan-storage" ).html( storage + ` GB` );
          $( ".plan-date-registered" ).html( DGTemporal.getDateValue( payments[0].Date, "yyyy-mm-dd" ) );
          $( ".plan-next-payment-date" ).html( DGTemporal.getDateValue( payments[0].Expire, "yyyy-mm-dd" ) );

          $( ".form-outline" ).each( ( index, element ) => {
            util.initMDBElements( $( element ) );
          } );
        } )
        .catch( ( e ) => {
          toastError( "Failed to retrieve payment information", e );
        } );
    } else if ( plans[ planId ].name == "crm-accounting" ) {
      $( "#storage-wrapper" ).show();

        $( ".plan-storage" ).html( ( accountInfo["Additional Storage Licence 100MB"] / 10 + 1 ) + ` GB` );

        if ( accountInfo["PayFast Token"] ) {
          $( ".account-status" ).html( "Active" );
        } else {
          $( ".account-status" ).html( "Free Trial" );
          $( "#payfast-submit-btn > span" ).html( "Subscribe" );
        }

      $( ".form-outline" ).each( ( index, element ) => {
        util.initMDBElements( $( element ) );
      } );
    } else {
      $( ".form-outline" ).each( ( index, element ) => {
        util.initMDBElements( $( element ) );
      } );
    }
  } ).catch( ( e ) => {
    toastError( "Failed to retrieve account information", e );
  } );

$( ".form-outline" ).each( ( index, element ) => {
  util.initMDBElements( $( element ) );
} );

$( "#subscription-cancel")
  .unbind()
  .on( "click", ( e ) => e.preventDefault() );

$('#subscription-cancel')
    .on('confirm.mdb.popconfirm', () => {
      let $submitBtn = $( "#subscription-cancel" );

      if ( accountInfo.Plan == 16 && accountInfo[ "PayFast Token" ] ) {
        $submitBtn.addClass( "loading" );

        payfast.cancel( {
            accountId: accountInfo.AccountId,
            token: accountInfo["PayFast Token"] 
          } )
          .then( res => {
          $submitBtn.removeClass( "loading" ).addClass( "success" );

          setTimeout( () => $submitBtn.removeClass( "success" ), 3000);

          toastSuccess( 
            "Subscription Canceled", 
            `Your subscription has been canceled` 
          );
          } )
          .catch( err => {
            err = JSON.parse(err);
            toastError( "Error", err.errors ) ;
          });
      }
    } );

$( ".plan-option" )
  .unbind()
  .on( "click", function ( e ) {
    e.preventDefault();

    accountInfo["New Plan"] = $( this ).val();

    let plan = accountInfo["Plan"],
      info = accountInfo;
    
    info.plan = $( this ).val();

    if ( plans[ plan ].name !== "free" ) {
      paypal.updatePlan( accountInfo.payPalSubscriptionId, info )
        .then( ( payment ) => {
          toastSuccess( 
            "Subscription updated", 
            "It might take a couple of minutes for the change to reflect" 
          );
        } )
        .catch( ( e ) => {
          toastError( "Failed to update subscription plan", e );
        } );
    } else {
      paypal.subscribe( info )
        .then( ( payment ) => {
          for ( let i in payment.links ) {
            if ( payment.links[ i ].rel == "approve" ) {
              window.open( payment.links[ i ].href );
            }
          }
        } )
        .catch( ( e ) => {
          toastError( "Failed to update subscription plan", e );
        } );
    }
  } );

$( "#updateAccountSettings" )
  .unbind()
  .on( "submit", async function ( e ) {
    e.preventDefault();

    let $submitBtn = $( "#updateAccountSettings .slide-btn[type='submit']" );

    $submitBtn.addClass( "loading" );

    if ( accountInfo.Plan == 16 ) {
      let storage = $( "#storage" ).val(),
        licenses = $( "#licences" ).val(),
        paymentDay = $( "#day-of-payment" ).val(),
        units = storage ? storage * 10 : 0,
        licensePrice = licenses * ( chosenPlan["Price"] - accountInfo["Discount"] ),
        cost = licensePrice + units * chosenPlan["Cost per 100MB"],
        token = accountInfo["PayFast Token"],
        body = {
          accountId: accountInfo.AccountId, 
          storage: storage, 
          licenses: licenses, 
          planId: accountInfo.Plan,
          discount: accountInfo["Discount"],
          paymentDay: paymentDay,
          debitOrder: $( "#debit-order" ).is(':checked') ? 1 : 0,
          lastPayment: accountInfo["Date Last Payment"]
        };
        
      if ( token ) {
        body.token = token
      }

      payfast.update( body )
        .then( res => {
          if ( token ) {
            $submitBtn.removeClass( "loading" ).addClass( "success" );

            setTimeout( () => $submitBtn.removeClass( "success" ), 3000);

            toastSuccess( 
              "Update Successful", 
              `Your subscription has been updated. It might take several minutes 
              for the change to take effect` 
            );
          } else if ( $( "#debit-order" ).is(':checked') ) {
            $submitBtn.removeClass( "loading" ).addClass( "success" );

            setTimeout( () => $submitBtn.removeClass( "success" ), 3000);

            toastSuccess( 
              "Email Sent", 
              `Please refer to the email for further steps`
            );
          }
        } )
        .catch( err => {
          err = JSON.parse(err);
          toastError( "Error", err.errors ) ;
        } );

      if ( ! token ) {
        let $from = $( "#payfast-form" ),
            inputs = {};

        $from.find( "[name='item_name']" ).val( `DataGrows CRM accounting subscription` );

        $from.find( "[name='amount']" ).val( cost + ".00" );
        $from.find( "[name='m_payment_id']" ).val( accountInfo.AccountId );

        let today = new Date(),
          year = today.getFullYear(),
          month = today.getMonth() + 1,
          day = $( "#day-of-payment" ).val();

        if ( month > 12 ) {
          month = "01";
          year++;
        }

        if ( day < 10 ) {
          day = "0" + day;
        }

        if ( month < 10 ) {
          month = "0" + month;
        }

        let dateOfRecurrance = year + "-" + month + "-" + day;

        $from.find( "[name='billing_date']" ).val( dateOfRecurrance );

        $from.find( "input" ).each( ( index, el ) => {
          if ( $( el ).attr( "type" ) !== "submit" ) {
            inputs[ $( el ).attr( "name" ) ] = $( el ).val();
          }
        } );

        if ( ! $( "#debit-order" ).is(':checked') ) {
          payfast.hashInput(inputs)
            .then( ( hash ) => {
              $from.find( "[name='signature']" ).val( hash );

              $from.find( "[type='submit']" ).trigger( "click" );
            } );
        }
      }
    } else {
      let storageMap = {
          "8": 10,
          "9": 100,
          "12": 200  
        },
        planId = $( plan ).val(),
        units = $( this ).find( "#storage" ).val() * 10 + storageMap[ planId ];
        
      e.preventDefault();

      paypal.updateUnits( $( "#payPalSubscriptionId" ).val(), units )
        .then( ( payment ) => {
          $submitBtn.removeClass( "loading" ).addClass( "success" );

          setTimeout( () => $submitBtn.removeClass( "success" ), 3000);

          for ( let i in payment.links ) {
            if ( payment.links[ i ].rel == "approve" ) {
              window.open( payment.links[ i ].href );
            }
          }

          screenReaderAlert( "Account settings updated" );
        } )
        .catch( ( e ) => toastError( "Failed to update subscription storage", e ) );
    }
  } );

$( "#account" )
  .unbind()
  .on( "submit", ( e ) => {
    e.preventDefault();

    let info = {
      firstname: $( "#firstname" ).val(),
      lastname: $( "#lastname" ).val(),
      email: $( "#email" ).val(),
      password: $( "#password" ).val(),
      phoneNumber: $( "#phoneNumber" ).val(),
      accountName: $( "#accountName" ).val(),
      companyName: $( "#companyName" ).val(),
      companyRegNumber: $( "#taxNumber" ).val(),
      taxNumber: $( "#companyRegNumber" ).val(),
      address1: $( "#address1" ).val(),
      address2: $( "#address2" ).val(),
      city: $( "#city" ).val(),
      zipCode: $( "#zipCode" ).val(),
      state: $( "#state" ).val(),
      country: $( "#country" ).val(),
      plan: $( "#plan" ).val(),
      payPalSubscriptionId: $( "#payPalSubscriptionId" ).val()
    };

    account.update( info )
      .then( () => {
        toastSuccess( "Success", "Account information updated" );
      } ).catch( ( e ) => {
        toastError( "Failed to update account information", e );
      } );
  } );

$( "#generateInvoice" )
  .unbind()
  .on( "click", ( e ) => {
    account.invoice()
      .then( ( res ) => {
        window.open( res.URL );
      } )
      .catch( ( e ) => {
        toastError( "Failed to generate invoice", e );
      } );
  } );

const urlParams = new URLSearchParams( window.location.search ),
  paramId = urlParams.get( 'subscription_id' ),
  updated = urlParams.get( 'updated' );

if ( updated == "true" ) {
  toastSuccess( 
    "Update Successful", 
    `Your subscription has been updated. It might take several minutes 
    for the change to take effect` 
  );
} else if ( updated == "false" ) {
  toastError( "Error", "There was an error updating your subscription" ) ;
}

let accStatusNotified = false;

if ( paramId && ! accStatusNotified ) {
  accStatusNotified = true;

  toastSuccess( 
    "Update Successful", 
    `Your subscription has been updated. It might take several minutes 
    for the change to take effect` 
  );
}

$( "#storage, #licences" ).on( "change", calcSubscriptionTotal );

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