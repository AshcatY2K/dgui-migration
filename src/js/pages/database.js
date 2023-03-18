import '/src/js/forms/upload.js';

import * as record from '/src/js/controllers/record.js';
import * as account from '/src/js/controllers/account.js';
//import * as intuit from '/src/js/controllers/intuit.js';
import * as popup from '/src/js/controllers/popup.js';

import '/src/js/components/database-list/list.js';
import '/src/js/components/app.js';

import Sidenav from '/src/js/components/mdb/pro/sidenav';

import { columnToInput } from '/src/js/helpers/inputGenerator.js';
import Onboarding from '/src/js/components/onboarding/onboarding.js';

let tableName,
	databaseId,
	tableId,
	loadStart,
	pos,
	slimInstance,
	darkMode = localStorage.getItem( 'darkMode' );

function setSidenavCollapse () {
	let collapse = window.localStorage.getItem( 'sideNavCollapse' );
	
	$( "#sidenav-inner" ).removeClass( "collapsed" );
	$( "#slim-toggler .fa" )
		.removeClass( "fa-chevron-left" )
		.removeClass( "fa-chevron-right" );
		
	if ( collapse === "true" ) {
		$( "#sidenav-inner" ).addClass( "collapsed" );
		$( "#slim-toggler .fa" ).addClass( "fa-chevron-right" );
	} else {
		$( "#slim-toggler .fa" ).addClass( "fa-chevron-left" );
	}
}

function onboard () {
	const options = {
	  steps: [
	    {
	      index: 1,
	      onboardingContent: `Hi.<br><br>
					Welcome to DataGrows. <br>
					This is your home screen, where you can find all your databases. <br>
					Each database contains tables and departments.`,
	      target: 'step-1',
	      placement: "right"
	    }, {
	      index: 2,
	      onboardingContent: 'You can also find the databases, departments and tables in the left navigation.',
	      target: 'step-2',
	      placement: "bottom"
	    }, {
	      index: 3,
	      onboardingContent: 'Don&apos;t feel stuck. If you need help at any point, click here to email support. Our team is happy to assist.',
	      target: 'step-3',
	      placement: "bottom"
	    }, {
	      index: 4,
	      onboardingContent: 'Click on this link to start setting up your Accounting CRM and Practice Management database.',
	      target: 'step-4',
	      placement: "top"
	    },
	  ],
	  autostart: true,
	  startDelay: 1,
	  nextLabel: "Got It"
	}

	new Onboarding($('body')[0], options);
}

function init () {
	let queryString = window.location.search,
		urlParams = new URLSearchParams(queryString),
		tableConfig = {},
		regex = /databases\/(\d*)\/tables\/(\d*)/g,
		result = regex.exec( document.location.pathname );

	tableName = urlParams.get('label');

	if ( result ) {
		databaseId = result[1];
		tableId = result[2];
	}

	loadStart = Date.now();

	pos = { top: 0, left: 0, x: 0, y: 0 };

	slimInstance = new Sidenav( $('#sidenav-inner')[0], {
		width: 280,
		slimWidth: 70,
		mode: "side",
		slim: true,
		content: "#main-content"
	} );

	account.get()
		.then( ( res ) => {
		var dateCreated = new Date( res[0]["Date Created"] ),
			today = new Date(),
			onboarded = window.localStorage.getItem( 'onboarded' );

			if ( res[0] ) {
				if ( res[0].Plan == 16 ) {
					$( ".crm-accounting-info, .js-crm-onboarding" ).show();
				}

				if ( res[0]["First Name"] ) {
					$( ".greeting .client-name" ).html( res[0]["First Name"] );
				}
			}

			if ( res[0].popups && res[0].popups.length > 0 ) {
				for ( let popup of res[0].popups ) {
					let $popupBtn = $( "<button>", {
						type: "button",
						"data-mdb-toggle": "modal",
						"data-mdb-target": `#user-popup-${popup.id}`
					} ).css( { "display": "none" } );

					if ( popup.Message ) {
						popup.Message = popup.Message
							.replace( /<script[\s\S]*?>[\s\S]*?<\/script>/gmi, '' );
					} else {
						popup.Message = "";
					}

					$( "body" ).append( $popupBtn )
						.append( `<div class="modal right fade user-popup modal-non-invasive-show" 
								id="user-popup-${popup.id}" 
								tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" 
								data-mdb-backdrop="false" data-mdb-keyboard="true">
							  <div class="modal-dialog modal-side modal-bottom-right" 
							  	style="width: auto;min-width: 350px;">
							    <div class="modal-content">
							      <div class="modal-header">
							        <h5 class="modal-title" id="exampleModalLabel">
							        	${popup.Title}
							        </h5>
							        <button type="button" class="btn-close" 
							        	data-mdb-dismiss="modal" aria-label="Close"></button>
							      </div>
							      <div class="modal-body">${popup.Message}</div>
							      <div class="modal-footer">
							        <button type="button" class="btn btn-primary"
							        	data-popup-id="${popup.id}"
							        	data-database-id="${popup.DatabaseID}">Confirm</button>
							      </div>
							    </div>
							  </div>
							</div>`);
				}

				$( `[data-mdb-target^="#user-popup"]` ).eq( 0 ).trigger( "click" );
			}

			if ( 
				dateCreated.getUTCFullYear() == today.getUTCFullYear() &&
				dateCreated.getUTCMonth() >= today.getUTCMonth() - 1 &&
				! res[0]["Date Last Payment"] && 
				! res[0]["Debit Order"] &&
				! onboarded
			) {
				onboard();
				
				window.localStorage.setItem( 'onboarded', true );
			}
		} )
		.catch();

	if ( tableId ) {
		if ( window.localStorage.getItem( 'smartTable' ) ) {
			let storedConfig = JSON.parse( window.localStorage.getItem( 'smartTable' ) );
			if ( storedConfig[ databaseId ] && storedConfig[ databaseId ][ tableId ] ) {
				tableConfig = storedConfig[ databaseId ][ tableId ];
			}
		}

		$( ".role-step" ).hide();

		if ( tableId == 4 ) {
			record.get( databaseId, 3 )
				.then( ( records ) => {
					$( ".role-step" ).html( `<div class="col-12">
							<h4>Roles</h4>
						</div>` );
					
					records.records.forEach( async function ( record ) {
						$( ".role-step" ).append( `<div class="col-12 col-sm-6 col-md-3">
							<p><b>${record.Role}</b></p>
							<p>${record.Description}</p>
						</div>` )
					} );

					$( ".role-step" ).show();
				} )
				.catch( ( err ) => { } );
		}

		$( "#table" ).show();
	} else {
		$( "#db-list" ).show();

  	$( ".working" ).removeClass("working");
	}

  let $input = columnToInput( {
    "id": "dark-mode",
    "columnName": "Dark mode",
    "type": "checkbox"
  } ).addClass( "ps-4" );

  $( ".dark-mode-container" ).append( $input );

	if ( darkMode == "true" ) {
	  $( "#dark-mode" )[0].value = true;
	}

	if ( window.localStorage.getItem( 'CanMaintainAccount' ) == "0" ) {
	  $( ".my-account-link-container" ).remove();
	}

	let sideNavCollapse = window.localStorage.getItem( 'sideNavCollapse' );

	if ( screen.width <= 769 ) {
		$('#sidenav-inner').attr( "data-mdb-slim-collapsed", "false");
		$('#sidenav-inner').attr( "data-mdb-mode", "over");

		slimInstance.hide();
	} else {
		slimInstance.show();
	}

	if ( sideNavCollapse === "true" && screen.width >= 769 ) {
		slimInstance.toggleSlim();
	}
	
	setSidenavCollapse();

	if ( screen.width < 769 ) {
		$('#sidenav-inner').attr( "data-mdb-slim-collapsed", "false");
		$('#sidenav-inner').attr( "data-mdb-mode", "over");
		$( "#mobile-nav-toggle" ).trigger( "click" );
	}
}

init();

$( document )
	.on( "click", ".user-popup .modal-footer button", function ( e ) {
		let databaseId = $( this ).attr( "data-database-id" ),
			id = $( this ).attr( "data-popup-id" );

		popup.confirm( databaseId, id );

		$( this ).closest( ".modal" ).find( ".btn-close" ).trigger( "click" );

		$( `[data-mdb-target="#user-popup-${id}"]` ).remove();
		$( `[data-mdb-target^="#user-popup"]` ).eq( 0 ).trigger( "click" );
	} )
	.on( "click", ".user-popup .btn-close", function ( e ) {
		let id = $( this ).closest( ".modal" ).find( ".modal-footer button" )
			.attr( "data-popup-id" );

		$( `[data-mdb-target="#user-popup-${id}"]` ).remove();
		$( `[data-mdb-target^="#user-popup"]` ).eq( 0 ).trigger( "click" );
	} )

	.on( "modal:ready", "#crmOnboarding", e => {
		$( "#crmOnboardingToggle" ).trigger( "click" );
		$( "#crm-onboarding-stepper" ).trigger( 'onChangeStep.mdb.stepper' );
	} )
	.on( 'click', '#slim-toggler', function ( e ) {
		let collapse = window.localStorage.getItem( 'sideNavCollapse' );

		slimInstance.toggleSlim();

		window.localStorage.setItem( 'sideNavCollapse', collapse === "true" ? "false" : "true" );

		setSidenavCollapse();
	} )
	.on( "click", ".modal-backdrop, .modal", () => {
		$( "[aria-describedby^='tooltip']" ).removeAttr( "aria-describedby" )
	} )
	.on( "click", "button", () => { $( '.tooltip' ).remove(); } )
	.on( "form::submit", "#addDatabaseModal", ( e, data ) => {
		$( ".add-table.js-temp" ).remove();

		let $btn = $( "<button>", {
			"class": "add-table js-temp",
			"data-mdb-toggle": "modal",
			"data-mdb-target": "#addTableModal",
			"data-database-id": data.databaseId
		} )

		$( "body" ).append( $btn );
		$( ".add-table.js-temp" ).trigger( "click" );
	} );

let 
	stateChanged = ( url ) => {
	  let pattern = /\/databases\/(\d+)\/tables\/(\d+)/,
	    match = url.match( pattern ),
	    database,
	    table;

	  if ( match ) {
	    database = match[1];
			table = match[2];

			$( "dg-app" ).removeAttr( "database" ).removeAttr( "table" );

			$( "dg-app, dg-database-list" )
	      .attr( "database", database )
	      .attr( "table", table );

	    $( "dg-app" ).show();
	    $( "#db-list" ).hide();
	  } else {
	    $( "dg-app" ).hide();
	    $( "#db-list" ).show();
	  }
	};

$( window )
  .on( "popstate", e => stateChanged( window.location.pathname ) )
  .on( "pushstate ", ( e, config ) => stateChanged( config[2] ) );

stateChanged( window.location.pathname );

// if ( databaseId == 2660 ) {
// 	$( document )
// 		.off( "table::load", ".datatable" )
// 		.off( "click", ".option-intuit-sync" )
// 		.on( "table::load", ".datatable", function ( e, columns, records ) {
// 			$( ".table-heading .options" )
// 				.append( `<button type="button" 
// 					class="option-intuit-sync" tabindex="0" 
// 					aria-label="QuickBooks Sync">
// 					QuickBooks Sync
// 				</button>` );
// 		} )
// 		.on( "click", ".option-intuit-sync", () => {
// 			intuit.getAuthenticateUri( databaseId, tableId, tableName )
// 				.then( uri => {
// 					window.localStorage.setItem( 'intuitFromUri', window.location.href );

// 					window.location.replace( uri );
// 				} )
// 				.catch();
// 		} );
// }