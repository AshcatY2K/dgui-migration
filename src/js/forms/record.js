import * as recordController from '/src/js/controllers/record.js';
import * as columnController from '/src/js/controllers/column.js';
import * as table from '/src/js/controllers/table.js';
import * as report from '/src/js/controllers/report.js';
import * as util from '/src/js/util.js';
import * as focusTrap from '/src/js/components/focusTrap.js';
import * as doc from '/src/js/controllers/document.js';
import * as clipBoard from '/src/js/helpers/clipBoard.js';

import Modal from '/src/js/classes/modal.js';
import RecordModal from '/src/js/classes/recordModal.js';
import initTinyMcePlugins from "/src/js/components/tinyMce.js"

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

import Popconfirm from '.././components/mdb/pro/popconfirm';
import Tab from '.././components/mdb/free/tab';
import Popover from '.././components/mdb/free/popover';
import mdbModal from '.././components/mdb/pro/modal';
import * as timer from '/src/js/controllers/timer.js';

import Tooltip from '.././components/mdb/free/tooltip';

let modals = {};

class add extends RecordModal {
	constructor ( config ) {
		super( config.databaseId, config.tableId, config.record, config.primary );

		this.$modal.attr( "id", "addRecordModal" )
			.addClass( "side-panel add-modal" );

		this.tableName = config.tableName;
		this.restrictions = config.restrictions;

		( async () => {
			let saveEdit = this.saveEdit.bind( this );

			await super.paint();

			this.ready();

			this.paintTabs()
				.paintButtons ();

			this.$modal.on( "click", ".save-edit", saveEdit );
		} )();

		return this;
	}

	ready () {
    this.$modal.find( "[data-default]" ).each( function( index ) {
			$( this ).val( $( this ).attr( "data-default" ) );
		} );

		super.ready();
	}

	paintTabs () {
		let name = decodeURI(this.tableName);

		this.$modal.find( "#record-card-tabs" )
			.append( `<li class="nav-item" role="presentation">
					<a class="nav-link active" role="tab" aria-selected="true">
						New ${name} Record
					</a>
				</li>` );
		
		return this;
	}

	paintButtons () {
		let loaderHtml = `<div class="spinner-border text-light" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>`,
			$saveNewBtn = $( `<button type="submit" class="btn btn-primary slide-btn mb-5">
					${loaderHtml}
				</button>` ),
			$saveEditBtn = $( `<button class="btn btn-primary slide-btn ms-3 save-edit mb-5">
					${loaderHtml}
					<span>Save & Edit</span>
				</button>` );

		if ( this.primary ) {
			$saveNewBtn.append( "<span>Save &amp; New</span>" );

			this.$modal.find( "form" )
				.append( $saveNewBtn )
				.append( $saveEditBtn );
		} else {
			$saveNewBtn.append( "<span>Save</span>" );

			this.$modal.find( "form" ).append( $saveNewBtn );
		}
		
		return this;
	}

	saveEdit ( e ) {
		e.preventDefault();

		let payload = super.submit( e );

		if ( ! payload ) {
			return;
		}

		recordController.add( this.databaseId, this.tableId, payload )
			.then( ( response ) => {
				this.success( "Your record has been added"  );

				let primary = this.$modal.hasClass( "primary" ) ? true : false;

				this.$modal.trigger( "form::submit", [ {
					databaseId: this.databaseId, 
					tableId: this.tableId,
					edited: true,
					recordId: response.newrecId,
					tableName: this.tableName,
					activeRecord: this.activeRecord,
					primary: this.primary
				} ] );

				this.close( e, true );

				new edit( {
					databaseId: this.databaseId,
					tableId: this.tableId,
					rowId: response.newrecId,
					record: payload,
					primary:  primary,
					restrictions: this.restrictions
				} );
			} )
			.catch( ( error ) => this.error( error ) );
	}

	submit ( e ) {
		let payload = super.submit( e );

		if ( ! payload ) {
			return;
		}

		recordController.add( this.databaseId, this.tableId, payload )
			.then( ( e ) => {
				this.success( "Record has added successfully, Continue capturing new records"  );

				$( ".floating-panel.second-position" ).removeClass( "second-position" );

				this.$modal.trigger( "form::submit", [ {
					databaseId: this.databaseId, 
					tableId: this.tableId,
					tableName: this.tableName,
					activeRecord: this.activeRecord,
					primary: this.primary,
					restrictions: this.restrictions
				} ] );

				this.close( e, true );
			} )
			.catch( ( error ) => this.error( error ) );
	}
}

$( document )
	.off( "click", ".js-add-record")
	.off( "form::submit", "#addRecordModal")
	.off( "click", '#addRecordModal .btn-close')
	.on( "click", ".js-add-record", ( e ) => {
		e.preventDefault();

		if ( modalLoading ) {
			return;
		}

		let databaseId = $( e.target ).data( "database-id" ),
			tableId = $( e.target ).data( "table-id" ),
			$table = $( e.target ).closest( ".datatable" ),
			$parent = $( e.target ).parent(),
			activeRecord = {},
			tableName = $table.attr( "data-table-name" ),
			$primeEditModal = $(".edit-modal.primary"),
			primary = true;

		databaseId = databaseId ? databaseId : $parent.data( "database-id" );
		tableId = tableId ? tableId : $parent.data( "table-id" );

		if ( $( e.target ).closest( ".datatable[data-dg-embedded]" ).length > 0 ) {
			activeRecord = {
				tableId: $primeEditModal[0].modal.tableId,
				rowId: $primeEditModal[0].modal.rowId
			};

			primary = false;
		}

		new add( {
			databaseId: databaseId,
			tableId: tableId,
			tableName: tableName,
			record: activeRecord,
			primary: primary,
			restrictions: $table[0].restrictions
		} );

    	modalLoading = true;
	} )
	.on( "form::submit", "#addRecordModal", ( e, config ) => {
		if ( "edited" in config ) {
			return;
		}

		new add ( {
			databaseId: config.databaseId,
			tableId: config.tableId,
			tableName: config.tableName,
			record: config.activeRecord,
			primary: config.primary,
			restrictions: config.restrictions
		} );
	} )
	.on( "click", '#addRecordModal .btn-close', ( e ) => {
		let $panel = $( e.target ).closest( ".floating-panel" );

		if ( $panel.length > 0 && "modal" in $panel[0] ) {
			$panel[0].modal.close( e );
		}
	} );

function htmlEncode(str){
  return String(str).replace(/[^\w. ]/gi, function(c){
    return '&#'+c.charCodeAt(0)+';';
  });
}

export class edit extends RecordModal {
	constructor ( config ) {
		if ( ! config.guid ) {
			table.get( config.databaseId );
			table.relationships( config.databaseId, config.tableId );
			timer.get( config.databaseId );
		}

		super( config.databaseId, config.tableId, null, config.primary );

		this.$modal
			.attr( "id", "row-edit-card" )
			.addClass( "side-panel edit-modal" );

		this.rowId = config.rowId;
		this.record = config.record;
		this.restrictions = config.restrictions;
		this.columns = config.columns;
		this.guid = config.guid;

		if ( config.primary ) {
			this.paintTabs();
		}

		( async () => {
			if ( this.restrictions["Can Edit Record"] !== 1 ) {
				for ( let column of this.columns ) {
					column.ReadOnly = 1
				}
			}

			await super.paint();
			await this.populate();

			if ( this.restrictions["Can Edit Record"] == 1 ) {
				this.$modal.find( "#details form" ).append( 
					$( `<button type="submit" class="btn btn-primary slide-btn mb-5">
						<div class="spinner-border text-light" role="status">
							<span class="visually-hidden">Loading...</span>
						</div>
						<span>Save</span>
					</button>` )
				);
			}

			if ( ! ( "guid" in config ) ) {
				this.$modal.find( "#details form" ).prepend( 
					$( `<button type="button" 
							class="btn btn-sm btn-info request-guid mb-2" 
							data-mdb-toggle="popover"
							aria-label="Share edit record form"
							style="float: right;clear: both;display: block;">
							<i class="fas fa-share-alt fa-1x"></i>
						</button>` )
				);

				await this.populateTabs();
			}

			super.ready();
		})();

		return this;
	}

	paintTabs () {
		if ( ! ( "guid" in this ) || ! this.guid ) {
			this.$modal.find( "#record-card-tabs" )
				.append( `<li class="nav-item" role="presentation">
						<a class="nav-link active" data-mdb-toggle="tab" id="details-tab"
							href="#details" role="tab" aria-controls="details"
							aria-selected="true">
							Details
						</a>
					</li>
					<li class="nav-item" role="presentation">
						<a class="nav-link" data-mdb-toggle="tab" id="documents-tab"
							href="#documents" role="tab" aria-controls="documents">
							Documents
						</a>
					</li>
					<!--li class="nav-item" role="presentation">
						<a class="nav-link" data-mdb-toggle="tab" id="reports-tab"
							href="#reports" role="tab" aria-controls="reports">
							Reports
						</a>
					</li-->` );
		} else {
			this.$modal.find( "#record-card-tabs" ).hide();
		}
		
		this.$modal.find( ".tab-content" )
			.append( this.getStyles() )
			// .append( `<div class="tab-pane fade" id="reports" role="tabpanel" 
			// 		aria-labelledby="reports-tab">
			// 	  	<div class="mb-3">
			// 			<select class="select" id="report-select" 
			// 				aria-label="Column type dropdown"></select>
			// 			<label class="form-label select-label" 
			// 				for="report-select">Reports</label>
			// 		</div>

			// 	  	<input type="hidden" id="reportName" class="form-control" />
			// 	    <textarea id="tiny" style="display: none;"></textarea>

			// 		<button id="report-generate" class="btn btn-primary slide-btn mt-3"
			// 			style="display: none;">
			// 			Download
			// 		</button>

			// 		<button id="report-print" class="btn btn-primary slide-btn mt-3"
			// 			style="display: none;">
			// 			Print
			// 		</button>
			// 	</div>` )
			.append( `<div class="tab-pane fade" id="documents" role="tabpanel" 
					aria-labelledby="documents-tab">
					<form class="needs-validation" novalidate aria-live="polite">
						<ul class="document-list list-group list-group-flush mb-3"></ul>

						<button type="button" class="btn btn-primary js-add-document"
							data-database-id="${this.databaseId}"
							data-table-id="${this.tableId}"
							data-row-id="${this.rowId}"
							aria-label="Upload document">
							<i class="fas fa-plus text-light"></i>
						</button>

						<button type="button" style="display: none;"
							class="btn btn-primary popconfirm-toggle"></button>
					</form>
				</div>` )
					
		return this;
	}

	getStyles () {
		return `<link rel="preload" as="style"
			      href="https://fonts.googleapis.com/css?family=Roboto|Besley|Montserrat|Rampart+One|Roboto+Mono|Hina+Mincho|Work+Sans|Bebas+Neue|Baskervville" />

			<link rel="stylesheet"
			      href="https://fonts.googleapis.com/css?family=Roboto|Besley|Montserrat|Rampart+One|Roboto+Mono|Hina+Mincho|Work+Sans|Bebas+Neue|Baskervville"
			      media="print" onload="this.media='all'" />

			<noscript>
			  <link rel="stylesheet"
			        href="https://fonts.googleapis.com/css?family=Roboto|Besley|Montserrat|Rampart+One|Roboto+Mono|Hina+Mincho|Work+Sans|Bebas+Neue|Baskervville" />
			</noscript>`;
	}

	destroy () {
		super.destroy();
		if ( typeof tinymce != "undefined") {
			tinymce.remove();
		}
	}

	async populate () {
		let $form = this.$modal.find( "form" ),
			$table = $( "#main-content > .container > .datatable" ),
			//restrictions = $table[0].restrictions
			restrictions = this.restrictions;

		$.each( this.record, ( key, value ) => {
			let $input = $form.find( `[id='${key}']` ),
				column = this.columns.filter( column => { return column.columnName == key } )[0],
				$container = $( `[id='${key}-container']` );

			if ( $input.length < 1 ) {
				return;
			}
			
			if ( $container.length > 0 ) {
				$( `[id='${key}-container']` ).show();
				$( `[id='${key}-container'] .value` ).html( value );
			}

			if ( $input.attr( "type" ) === "checkbox" ) {
				if ( value ) {
					$input.prop("checked", true );
				} else {
					$input.prop("checked", false );
				}
			} else if ( value && column && column.type == "clock" ) {
				value = util.time().display().time( value, column.mask );

				$input.val( value );				
			} else if ( column && column.type == "timer" ) {
				value = util.time().display().timer( value, column.mask );

				$input.val( value );				
			} else if ( value && column && column.type == "date time" ) {
				try {
					value = util.time().display().dateTime( value, JSON.parse( column.mask ) );
				} catch ( e ) {
					value = util.time().display().dateTime( value, column.mask );
				}

				$input.val( value );	
			} else if ( value && column && column.type == "date" ) {
				$input.val( util.time().display().date( value, column.mask ) );			
			}  else if ( value === 0 && column && column.type == "number" ) {
				$input.val( 0 );		
			}  else if ( value === 0 && column && column.type == "currency" ) {
				$input.val( "0.00" );		
			} else if (  value && column && column.type == "drop down list multi select" ) {
				$input.attr( "data-original-value", JSON.parse( value ).join( "," ) )
					.attr( "data-default", JSON.parse( value ).join( "," ) );
			} else if (  value && column && column.type == "from table" ) {
				let optionTxt = this.record[column.columnName + "|Lookup"];
				$input.append( `<option value="${value}" selected="selected">${optionTxt}</option>` );
			} else if ( key.indexOf( "|" ) < 0 && value ) {
				$input.val( value );
			} else if ( ! value ) {
				$input.val( "" );
			}

			if ( column && column.type == "longtext" ) {
				let html = $input.val();

				html = html.replace( /((?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gmi, "<a href='$1' target='_blank'>$1</a>" )
					.replace( /\r\n/gm, "<br>" )
					.replace( /\n/gm, "<br>" )
					.replace( /\r/gm, "<br>" )
					.replace( /^ /gm, "&nbsp;" )
					.replace( /  /gm, "&nbsp;&nbsp;" )

				$input.closest( ".form-outline" ).before( $( "<span>", { 
						class: "longtext-facade"
					} ).html( html ) ) 
			}

			$input.trigger( "input" ).trigger( "change" );
		} );

		$form.find( "select" ).each( ( index, el ) => {
			let value = $( el ).val(),
				$option = $( el ).find( `option[ value="${value}" ]` );

			$( el ).find( `option` ).removeAttr( "selected" )

			$option.attr( "selected", "selected" );
			
			$( el ).closest( ".select-wrapper" ).find( "input" )
				.val( $option.html() )
		} );

		$form.find( "#row-id-edit" ).val( this.rowId );
		
		if( ! restrictions[ "Can Edit Record" ] ) {
			$form.find( "input, textarea, select" ).attr( "disabled", "disabled" );
			$form.find( "[type='submit']" ).hide();
		} else {
			let submit = this.submit.bind( this );

			$form
				.on( "submit", "form", submit )
				.on( "click", "[ type='submit' ]", submit );
		}

		let databaseId = this.databaseId,
			tableId = this.tableId,
			$timer = $( `<dg-timer data-database-id='${databaseId}'
				data-table-id='${tableId}' disabled="disabled"/>` );

		if ( restrictions.TimeLog ) {
			$timer.removeAttr( "disabled" );
			$timer.attr( "data-record-id", this.rowId );
		}

		this.$modal.find( "#details" ).prepend( $timer );
	}

	submit ( e ) {
		e.preventDefault();

		let $form = this.$modal.find( "form" ),
			payload = super.submit( e ),
			rowId,
			$submitBtn = this.$modal.find( ".slide-btn[type='submit']" );

		if ( ! payload ) {
			return;
		}

		if ( ! ( "guid" in this ) || ! this.guid ) {
			recordController.update( this.databaseId, this.tableId, this.rowId, payload )
				.then( () => {
					this.success( "Your record has been updated" );

					this.$modal.trigger( "form::submit", [ {
						databaseId: this.databaseId, 
						tableId: this.tableId 
					} ] );

					this.close( e, true );
				})
				.catch( ( error ) => this.error( error ) );
		} else {
			recordController.updateByGuid( this.guid, payload )
				.then( () => {
					this.success( "Your record has been updated" );
				})
				.catch( ( error ) => this.error( error ) );
		}
	}

	async populateDocuments () {
		let docs = await doc.get( this.databaseId, this.tableId, this.rowId ),
			$modal = $( ".edit-modal.primary" );

		$modal.find( ".document-list" ).html( "" );

		for ( let i in docs ) {
			let $download = $( "<i>", { 
					class: "fas fa-arrow-circle-down me-2 js-download",
					role: "button",
					"aria-label": "Download document"
				} ),
				$delete = $( "<i>", { 
					class: "far fa-trash-alt js-delete popconfirm-toggle",
					role: "button",
					"aria-label": "Delete document"
				} ),
				$li = $( "<li>", {
					"data-guid": docs[i].ID,
					class: "list-group-item d-flex justify-content-between align-items-start"
				} ).html( `<div class="ms-2 me-auto js-filename">${docs[i].FileName}</div>` );

			$li.append( $download );

			if ( this.restrictions["Can Delete Record"] ) {
				$li.append( $delete );
			}
			
			$modal.find( ".document-list" ).append( $li );
		}

		this.$modal.find( "#documents .popconfirm-toggle" ).each( function ( i ) {
			new Popconfirm( this, {
				message: "Are you sure you want to delete this document?"
			} );
		} );

		this.$modal.find( "#documents" )
			.on( "confirm.mdb.popconfirm", ( e ) => {
				let $li = $( e.target ).closest( "li" ),
					guid = $li.attr( "data-guid" ),
					classes = {
						loading: "fas fa-spin fa-spinner",
						base: "far fa-trash-alt"
					};

				$( e.target ).removeClass( classes.base ).addClass( classes.loading );

				doc.remove( this.databaseId, this.tableId, this.rowId, guid )
					.then( buffer => {
						screenReaderAlert( "Your document has been removed" )
						$li.remove();
					} )
					.catch( error => {
						toastError( "Error", error );

						$( e.target ).addClass( classes.base ).removeClass( classes.loading );
					} );
			} );
	}

	applyPageConfig ( config ) {
		let margins = {
				left: config ? config.margin.left * 96 : 0,
				right: config ? config.margin.right * 96 : 0,
				bottom: config ? config.margin.bottom * 96 : 0,
				top: config ? config.margin.top * 96 : 0
			},
			editor = tinymce.get( 'tiny' ),
			$body = $( editor.dom.doc.getElementById( "tinymce" ) );

		editor.dg = { page: config };

		$body.removeClass( "a3 a4 a5 legal letter tabloid" );

		if ( config && config.format !== "Custom" ) {
			$body.addClass( config.format.toLowerCase() );

			switch ( config.format ) {
				case "A3":
					config.size.width = 11.7;
					config.size.height = 16.5;
					break;
				case "A4":
					config.size.width = 8.3;
					config.size.height = 11.7;
					break;
				case "A5":
					config.size.width = 5.8;
					config.size.height = 8.3;
					break;
				case "Legal":
					config.size.width = 8.5;
					config.size.height = 14;
					break;
				case "Tabloid":
					config.size.width = 11;
					config.size.height = 17;
					break;
				case "Letter":
					config.size.width = 8.5;
					config.size.height = 11;
					break;
			}
		}

		if ( ! config ) {
			config = { };
		}

		if ( ! ( "size" in config ) ) {
			config.size = {
				width: 8.3,
				height: 11.7
			};
		}

		$body.css( {
			width: ( config.size.width * 96 ) + 'px',
			height: ( config.size.height * 96 ) + 'px',
			padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`
		} );
	}

	tableToTab ( table ) {
		let $li = $( "<li>" ),
			$table = $( "#main-content > .container > .datatable" ),
			urlLabel = $table.attr( "data-table-name" ),
			name = urlLabel == table.tableName ? `${urlLabel}-${table.tableName}` : table.tableName,
			id = name.replace( / /g, "-" ).replace( /[^\w\d]/g, "" ),
			$a = $( "<a>", { 
				class: "nav-link",
				id: `${id}-tab`,
				role: "tab",
				href: `#${id}-content`,
				"data-database-id": this.databaseId,
				"data-table-id": table.tableId,
				"data-record-id": this.rowId,
				"data-mdb-toggle": "tab",
				"data-related-table": `${id}-datatable`,
				"aria-controls": `#${id}-content`
			} ).html( name ),
			groupName = table["Group Name"],
			$tabGroup = this.$modal.find( `ul[data-group='${groupName}']` );

		if ( table.Description ) {
			$li.attr( "data-mdb-toggle", "tooltip" )
				.attr( "data-mdb-placement", "bottom" )
				.attr( "title", table.Description )
				.attr( "data-mdb-original-title", table.Description );
		}

		if ( $tabGroup.length > 0 ) {
			let $tabGroup = this.$modal.find( `ul[data-group='${groupName}']` );

			$li.append( $a );

			$tabGroup.prepend( $li );
		} else {
			$li.attr( "role", "presentation" ).addClass( "nav-item temp" );

			$li.append( $a );
			this.$modal.find( "#record-card-tabs > li:first-child" ).after( $li );
		}
	}

	async populateTabs () {
		let activeTabId = this.$modal.find( "#record-card-tabs .nav-link.active" ).attr( "id" ),
			relationships = await table.relationships( this.databaseId, this.tableId ),
			tables = await table.get( this.databaseId ),
			$table = $( "#main-content > .container > .datatable" ),
			urlLabel = $table.attr( "data-table-name" ),
			tableIds = [],
			groups = {},
			tabs = [],
			tabIds = [];

		relationships.sort( ( a, b ) => a.tableName < b.tableName ? 1 : -1 );

		for ( const tab of relationships ) {
			if ( tabIds.includes( tab.tableId ) ) {
				continue;
			}

			let table = tables.filter( table => table.tabelName == tab.tableName ),
				groupName = table[0]["Group Name"].trim(),
				name = urlLabel == tab.tableName ? `${urlLabel}-${tab.tableName}` : tab.tableName,
				id = name.replace( / /g, "-" ).replace( /[^\w\d]/g, "" );

			tab.tabelName = table[0].tabelName;
			tab["Group Name"] = groupName;

			let $tabPane = $( "<div>", { 
				class:"tab-pane fade",
				id: `${id}-content`,
				role: "tabpanel",
				"aria-labelledby": `${id}-tab`
			} );

			$tabPane.html( `<div id="${id}-datatable" class="datatable loading" 
					data-dg-embedded="true" data-table-name="${name}"></div>` );

			this.$modal.find( ".card-body .tab-content" ).append( $tabPane );

			if ( 
				groupName && groupName.toLowerCase() !== "hidden" 
			) {
				if ( ! ( groupName in groups ) ) {
					groups[ groupName ] = [];
				}

				groups[ groupName ].push( tab );
			} else {
				tabs.push( tab );
			}

			tabIds.push( tab.tableId );
		}

		Object.keys(groups).sort().reverse()
			.forEach( ( groupName, index ) => {
				let $li = $( `<li class="nav-item temp" role="presentation">
							<button class="nav-link" tabindex="0" 
								data-group="${groupName}">
								${groupName}
								<i class="fas fa-angle-down ms-3"></i>
							</button>
						</li>` ),
					$tabGroup = $( "<ul>", { 
						"data-group": groupName, 
						class: "shadow-2 nav-tab-sub-content nav nav-tabs"
					} );
		
				this.$modal.find( ".card-header .nav-tabs > li:first-child" ).after( $li );
				this.$modal.find( ".card-header .tab-container.-sub" ).append( $tabGroup );
	
				for ( const tab of groups[ groupName ] ) {
					let name = urlLabel == tab.tableName ? `${urlLabel}-${tab.tableName}` : tab.tableName,
						id = name.replace( / /g, "-" ).replace( /[^\w\d]/g, "" );

					this.tableToTab( tab );

					new Tab( this.$modal.find( `[id="${id}-tab"]` )[0] );
				}
			});

			for ( const tab of tabs ) {
				let name = urlLabel == tab.tableName ? `${urlLabel}-${tab.tableName}` : tab.tableName,
					id = name.replace( / /g, "-" ).replace( /[^\w\d]/g, "" );

				this.tableToTab( tab );

				new Tab( this.$modal.find( `[id="${id}-tab"]` )[0] );		
			}

	    this.$modal.find(".nav-tabs [data-mdb-toggle='tooltip']").each( function( index ) {

    	new Tooltip( this, { title: $( this ).attr( "title" ) } );
    } );

		this.$modal.find( ".card-header .nav-tabs" )
			.on( "click", `[data-related-table]`, async ( e ) => {
				$( e.target ).closest( ".floating-panel" ).find( ".card-body" )[0].scrollTo( 0, 0 );

				let databaseId = $( e.target ).attr( "data-database-id" ),
					tableId = $( e.target ).attr( "data-table-id" ),
					columns = await columnController.get( databaseId, tableId ),
					tableName = $( e.target ).html(),
					filter = this.$modal.find( "#details form" )
		        		.find( "input, select, textarea" )
		        		.eq( 0 ).val(),
		      fromColumn = columns.filter( column => column.fromTableId == this.tableId ),
			    config = {
			    	filters: [{
							columnId: fromColumn[0].id, 
							comparative: "equals",
							filter: this.rowId,
							lookup: false,
							locked: true
						}],
						parentTableId: this.tableId,
						clear_filters: true
			    },
			    relatedTable = $( e.target ).attr( "data-related-table" ),
			    $table = this.$modal.find( `[id='${relatedTable}']`);

				$table.smartTable( this.databaseId, tableId, config );

				$table.on( "table::load", ( e ) => {
					$( e.target ).find( ".js-through-link" ).show();

					$( e.target ).find( ".js-through-link.filtered-link" )
			    	.attr( "href", `/databases/${this.databaseId}/tables/${tableId}?label=${tableName}` )
				    .attr( "data-databases-id", this.databaseId )
				    .attr( "data-table-id", tableId )
				    .attr( "data-filter", JSON.stringify( [{
									columnId: fromColumn[0].id,
									operator: "equals",
									value: this.rowId,
									lookup: false
					    }] ) );
				} );
			} );	

		$( `#${activeTabId}` ).addClass( "active" ).trigger( "click" );
	}
}

$( document )
	.off( "click", "#reports-tab")
	.on( "click", "#reports-tab", function ( e ) {
		let modal = $( this ).closest( ".floating-panel " )[0].modal;

		if ( modal.restrictions["Designer"] ) {
			initTinyMcePlugins();

			let $tinyMce = modal.$modal.find( '#tiny' );
			
			$tinyMce.show();

			tinymce.init( {
				height: 500,
				body_class: 'tinyMceBody a4',
				plugins: [
					'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 
					'print', 'preview', 'anchor', 'searchreplace', 'visualblocks', 
					'code', 'fullscreen', 'insertdatetime', 'media', 'table', 
					'paste', 'code', 'help', 'wordcount', 'dgadddata'
				],
				contextmenu_never_use_native: true,
				contextmenu: 'link image table dgTableContext',
				content_css : 'document', //default, dark, document, writer
				menubar: 'file edit insert view format table tools help mydata',
				menu: {
					file: { title: 'File', items: 'dgNewReport dgSave | dgDelete' },
					insert: { title: 'Insert', items: 'dgData dgTable dgImageAdd link template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime' },
					format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat dgPageSettings' },
				},
				font_formats: 'Roboto=Roboto; Besley=Besley; Montserrat=Montserrat; Rampart One=Rampart One; Roboto Mono=Roboto Mono; Hina Mincho=Hina Mincho; Work Sans=Work Sans; Bebas Neue=Bebas Neue; Baskervville=Baskervville',
				selector: '#tiny',
				skin: "oxide-dark",
				content_css : [ 
					'https://fonts.googleapis.com/css?family=Roboto|Open+Sans|Besley|Montserrat|Rampart+One|Roboto+Mono|Hina+Mincho|Work+Sans|Bebas+Neue|Baskervville', 
					'/styles/tinymce.css',
					'dark'
				],
				content_css_cors: true
			} );
		}
	} )

let modalLoading = false;

async function editRecordEvent ( e ) {
	if ( modalLoading || Math.abs( mouseDownX - e.pageX ) > 50 ) {
		return;
	}

	if ( e.target.tagName == "A" || e.target.tagName == "I" ) {
		return;
	}

	let $target = $( e.target ),
		$table = $target.closest( ".datatable" ),
		databaseId = $table.attr( "data-db-id" ), 
		tableId = $table.attr( "data-table-id" ),
		id = $target.closest( "tr" ).find( "td[data-mdb-field='id']" ).html(),
		record = $table[0].records.filter( record => record.id == id );
		
	if ( 
		$target.hasClass( "form-control" ) ||
		$target.hasClass( "popconfirm-toggle" ) ||
		$target.hasClass( "fa-trash-alt" ) || 
		(
			e.target.hasAttribute( "aria-label" ) && 
			$target.attr( "aria-label" ) == "Delete row" 
		) ||
		$target.prop( "tagName" ) == "A" ||
		$target.parent().prop( "tagName" ) == "A"
	) {
		return;
	}

	$table.find( "tr.active" ).removeClass( "active" );
	$target.closest( "tr" ).addClass( "active" );

	if ( $( ".add-modal.primary" ).length > 0 ) {
		$( ".add-modal.primary" )[0].modal.close( e );
	}

	if ( $( ".edit-modal:not( .primary )" ).length > 0 ) {
		$( ".edit-modal:not( .primary )" )[0].modal.close( e );
	}

	let config = {
			databaseId: databaseId,
			tableId: tableId,
			rowId: record[0].id,
			record: record[0],
			primary: false,
			restrictions: $table[0].restrictions,
			columns: $( e.target ).closest( ".datatable" )[0].columns
		};

	if ( $table.attr( "data-dg-embedded" ) ) {
		new edit( config );
	} else {
		if ( 
			$( ".edit-modal.primary" ).length > 0 && 
			$( ".edit-modal.primary" )[0].modal
		) {
			$( ".edit-modal.primary" )[0].modal.close( e );
		}

		config.primary = true;

		new edit( config );
	}
		
    modalLoading = true;
}

let mouseDownX;

function updateBreadcrumbs ( targetTableId ) {
		let breadcrumb = [],
			$mainTable = $( ".datatable:not([data-dg-embedded='true'])" ),
			databaseId = $mainTable.attr( "data-db-id" ),
			tableName = $mainTable.attr( "data-table-name" ),
			tableId = $mainTable.attr( "data-table-id" );

		if ( window.localStorage.getItem( 'breadcrumb' ) ) {
			breadcrumb = window.localStorage.getItem( 'breadcrumb' );
			breadcrumb = JSON.parse( breadcrumb );
			breadcrumb.pop();
		}

		if ( breadcrumb.filter( crumb => crumb.tableId == tableId ).length < 1 ) {
			breadcrumb.push( {
					name: tableName,
					tableId: tableId,
					link: `/databases/${databaseId}/tables/${tableId}?label=${tableName}`
				} );
		}

		breadcrumb.push( { target: targetTableId } );
		
		window.localStorage.setItem( 'breadcrumb', JSON.stringify( breadcrumb ) );
}

$( document )
	.on( "click", ".datatable:not( [data-dg-embedded] ) tbody tr", editRecordEvent )
	.on( "click", ".datatable[data-dg-embedded] tbody tr", editRecordEvent )
	.on( "mousedown", ".datatable tbody tr", ( e ) => mouseDownX = e.pageX )
	.on( "keyup", ".datatable tbody tr", function ( e ) {
		if ( e.target.hasAttribute( "href" ) ) {
			return;
		}

		if ( e.which == 13 || e.keyCode == 32 ) {
			let index = $( e.target ).index(),
				tdCount = $( e.target ).closest( "tr" ).find( "td" ).length;

			if ( $( e.target ).closest( "td" ).length > 0 ) {
				index = $( e.target ).closest( "td" ).index();

				if ( index == 1 || index == tdCount - 1 ) {
					return;
				}
			} else if ( index == 1 ) {
				return;
			}

			$( e.target ).closest( "tr" ).trigger( "click" );
		}
	} )
	.on( "click", '#row-edit-card .btn-close, [data-link]', ( e ) => {
		let $panel = $( e.target ).closest( ".floating-panel" );

		if ( $panel.length > 0 && $panel[0].modal ) {
			$panel[0].modal.close( e );
		}
	} )
	.on( "click", ".db-side-nav a", () => {
		window.localStorage.removeItem( 'breadcrumb' );
	} )
	.on( "change", "#report-select", ( e ) => {
		let guid = $( e.target ).val(),
			name = $( e.target ).find( `option[value='${guid}']` ).html(),
			$reportName = $( "#reportName" ),
			$loader = $( e.target ).closest( ".tab-pane" ).find( ".loader.-tab" ),
			editModal = $( ".edit-modal.primary" )[0].modal;

		if ( guid == '' ) {
			$reportName.closest( ".form-outline" ).show();
			$( "#report-generate, #report-print" ).hide();
			$( "#tiny" ).val( "" );

			return;
		}

		$loader.show();

		$reportName.closest( ".form-outline" ).hide();
		$( "#report-generate, #report-print" ).show();

		$reportName.val( name );

		report.getTemplate( editModal.databaseId, editModal.tableId, guid )
			.then( report => {
				let html = report[0].FileStreamCol;

				editModal.report = {
					config: report[0].Config
				}

				html = html.replace( /<pseudo-element>[^<]*<\/pseudo-element>/gm, '')
					.replace( /({{#each[^}]*}}|{{\/each}})/gm, '')
					.replace( /{{dgTotals[^}]*}}/gm, 'Total')
					.replace( />{{[^}]*}}<\/td/gm, '>-</td');

				tinymce.activeEditor.setContent(html, {format: 'raw'});

				editModal.applyPageConfig( editModal.report.config )

				screenReaderAlert( "Report has been loaded" )

				$loader.hide();
			} );
	} )
	.on( "form::render", ".floating-panel", ( e ) => {
		if ( $( e.target ).hasClass( "secondary" ) ) {
			$( ".floating-panel.primary" ).addClass( "second-position" );
		}
	} ) 
	.on( "form::ready", ".floating-panel", ( e ) => {
		modalLoading = false;
	} )
	.on( "form::destroy", ".floating-panel", ( e ) => {
		if ( $( e.target ).hasClass( "secondary" ) ) {
			$( ".floating-panel.primary" ).removeClass( "second-position" );
		}
	} )
	.on( "mouseenter", ".nav-tabs.-primary .nav-link", ( e ) => {
		let $item = $( e.target ).closest( ".nav-item" ),
			containerW = $item.closest( ".nav-tabs" ).width(),
			$link = $item.find( ".nav-link" ),
			$ul = $item.find( "[data-group]" ),
			left = $link.position().left,
			group = $( e.target ).attr( "data-group" ),
			$subContent = $( `.nav-tab-sub-content[data-group='${group}']` ),
			position = $item.position();

		$( ".nav-tab-sub-content" ).hide();

		$subContent.css( {
			left: position.left,
			top: position.top + $item.height()
		} ).show();
		
		$subContent.find( "li" ).eq( 0 ).find( "a" ).focus();

		if ( left + $ul.width() > containerW ) {
			$ul.css( { left: containerW - $ul.width() } );
		} else {
			$ul.css( { left: left } );
		}
	} )
	.on( "mouseleave", ".nav-tab-sub-content", function ( e ) {
		$( this ).hide();
	} )
  .on( "keypress", ".nav-tabs .nav-link", function ( e ) {
    if ( e.which == 13 || e.keyCode == 32 ) {
			$( e.target ).trigger( "mouseenter" );
    }
  } )
  .on( "click", ".longtext-facade", ( e ) => {
  	if ( e.target.tagName == "A" ) {
  		return;
  	}

  	let caretPos = util.getCaretCharOffset( e.target ),
  		txtarea = $( e.target ).parent().find( "textarea" )[0];

    $( e.target ).hide();

    txtarea.focus();

    txtarea.selectionEnd = caretPos;
  } )
  .on( "blur", "textarea", ( e ) => {
  	let $outline = $( e.target ).closest( ".form-outline" ),
  		value = $outline.find( "textarea" ).val()
  				.replace( /((?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gmi, "<a href='$1' target='_blank'>$1</a>" )
				.replace( /\r\n/gm, "<br>" )
				.replace( /\n/gm, "<br>" )
				.replace( /^ /gm, "&nbsp;" )
				.replace( /  /gm, "&nbsp;&nbsp;" );

  	$outline.parent().find( ".longtext-facade" ).html( value ).show();
  } )
  .on( "click", ".edit-modal .nav-link", function () {
  	let tabId = $( this ).attr( "id" );

  	$( this ).closest( ".card-header" )
  		.find( `.nav-link.active[id!='${tabId}']` )
  		.removeClass( "active" );
  } )
  .on( "click", ".request-guid", function ( e ) {
  	let modal = $( this ).closest( ".floating-panel" )[0].modal;

  	if ( ! this.hasAttribute( "data-guid" ) ) {
  		e.preventDefault();

    	recordController
    		.getGuid( modal.databaseId, modal.tableId, modal.rowId )
    		.then( response => {
    			let url = location.protocol + '//' + 
    					window.location.hostname + "/form/" + response.GUID;

					$( this )
						.attr( "data-guid", response.GUID );

					new Popover( this, {
						html: true,
				        title : `<span class="text-info">
				        		<strong>Share URL</strong>
				        	</span>`,
				        content : '-'
					} );

					$( this ).popover()
						.off( 'shown.bs.popover' )
						.off( 'hidden.bs.popover' )
						.on( 'shown.bs.popover', function() {
					    $( ".popover-body" ).html( `<div class="input-group mb-3">
									<input type="text"
										class="guid form-control" 
										value="${url}"
									    aria-label="Sharable URL"
									    aria-describedby="button-addon2" />
									<button class="btn btn-sm copy-to-clipboard btn-outline-primary" 
										type="button"
										aria-label="Copy sharable url"
										data-mdb-ripple-color="dark">
										<i class="fas fa-copy"></i>
									</button>
								</div>` );

					    if ( $( ".popover-header" ).find( ".close-popover" ).length < 1 ) {
				        let $closeBtn = $( "<button>", {
						        	"class": "btn btn-sm close-popover shadow-0",
						        	"type": "button",
						        	"aria-label": "close"
						        } ).css( { float: "right" } ),
				        	$icon = $( "<i>", { class: "fas fa-times" } );
				        
				        $closeBtn.append( $icon );

				        $( ".popover-header" ).append( $closeBtn );
					    }
							
							$( ".popover" ).trap();

					    $( document ).on( "click", togglePopover );

							util.initMDBElements( $( ".popover-body" ) );
					  } )
						.on( 'hidden.bs.popover', function() {
							$( ".popover" ).free();
					    $( document ).off( "click", togglePopover );
					  } );

					$( this ).trigger( "click" );
    		} );
    }
  } )
  .on( "close.mdb.select", ( e ) => {
  	$(".tooltip").remove();
  	$("[aria-describedby^='tooltip']").removeAttr( "aria-describedby" );
  } );

function togglePopover ( e ) {
	if ( 
		e.target.hasAttribute( "data-mdb-toggle" ) && 
		$( e.target ).attr( "data-mdb-toggle" ) == "popover"
	) {
		return;
	}

	if ( $( e.target ).closest( ".popover" ).length < 1 ) {
		let id = $( '.popover' ).attr( "id" );

		$( `[aria-describedby='${id}']` ).trigger("click");
	}
}

function getReportPayload () {
	let payload = {};

	$( ".edit-modal.primary form" ).find( "input, select, textarea" )
		.each( function ( index ) {
			let id = $( this ).attr( "id" ),
				type = $( this ).attr( "type" ),
				value = $( this ).val();

			if ( ! id ) {
				return;
			}

			id = id.replace('-edit','')

			if ( type == "checkbox" ) {
				payload[id] = $( this ).prop( "checked" ) ? 1 : 0;
			} if ( $( this ).parent().find("input[type='text']").length < 1 ) {
				payload[id] = value;
			} else  {
				payload[id] = $( this ).parent().find("input[type='text']").val();
			}
		} );

	return payload;
}

$( document )
	.on( "click", "#report-generate", async e => {
		let $editModal = $( ".edit-modal.primary" ),
			guid = $editModal.find( "#report-select" ).val(),
			payload = getReportPayload(),
			$loader = $editModal.find( ".loader.-tab" ),
			urlParams = new URLSearchParams( window.location.search ),
			tableName = urlParams.get('label');

		$loader.show();

		let buffer = await report.generate( 
					$editModal[0].modal.databaseId, 
					$editModal[0].modal.tableId, 
					$editModal[0].modal.rowId,
					guid, 
					tableName, 
					payload 
				),
			link = $( "<a>", {
				href: window.URL.createObjectURL( buffer ),
				download: $( `#report-select option[value='${guid}']` ).html(),
				class: "download-link"
			} );

		$( ".download-link" ).remove();
		$( "body" ).append( link ); // Required for FF
		$( `a.download-link` )[0].click();

		$loader.hide();
	} )
	.on( "click", "#report-print", async e => {
		let $editModal = $( ".edit-modal.primary" ),
			guid = $editModal.find( "#report-select" ).val(),
			payload = getReportPayload(),
			$loader = $( this ).closest( ".tab-pane" ).find( ".loader.-tab" ),
			urlParams = new URLSearchParams( window.location.search ),
			tableName = urlParams.get('label');

		$loader.show();

		let buffer = await report.generate( 
				$editModal[0].modal.databaseId, 
				$editModal[0].modal.tableId, 
				$editModal[0].modal.rowId,
				guid, 
				tableName, 
				payload 
			);

		printJS( {
			printable: window.URL.createObjectURL( buffer ), 
			type: 'pdf', 
			showModal: true
		} )

		$loader.hide();
	} )
	.on( "click", ".copy-to-clipboard", function ( e ) {
		let txt = $( this ).prev(".guid").val();

		clipBoard.copy( txt );

		toastSuccess( 
			"Copied", 
			"The URL has been copied"
		);
	} )
	.on( "click", ".popover .close-popover", function ( e ) {
		let id = $( '.popover' ).attr( "id" );

		$( `[aria-describedby='${id}']` ).trigger("click");
	} );

$( document )
	.on( "click", "#row-edit-card #documents-tab", async () => {
		$( ".edit-modal.primary" )[0].modal.populateDocuments();
	} )
	.on( "form::submit", "#addDocumentModal", () => {
		$( ".edit-modal.primary" )[0].modal.populateDocuments();
	} );

class documentUpload extends Modal {
	constructor ( databaseId, tableId, rowId ) {
		super( "addDocumentModal", "Upload Document" );
		this.paint();

		this.databaseId = databaseId;
		this.tableId = tableId;
		this.rowId = rowId;

		return this;
	}

	paint ( config ) {
		let $wrapper = $( "<div>", {
				id: "document",
				class: "file-upload-wrapper"
			} ),
			$input = $( "<input>", {
				id: "file-upload",
				type: "file",
			    "data-mdb-file-upload": "file-upload",
			    class: "file-upload-input",
			    "aria-label": "File upload",
			    "data-mdb-main-error": "Ooops, error here",
			    "data-mdb-format-error": "Bad file format (correct format ~~~)"
			} ),
			$submit = $( "<input>", { type: "submit", class: "hidden" } );

		$wrapper.append( $input );

		this.$modal.find( ".modal-body" )
			.append( $wrapper )
			.append( $submit );

		super.paint();
		super.ready();
	}

	submit ( e ) {
    	let fd = new FormData(),
        	files = this.$modal.find( "[type='file']" )[0].files[0];

		super.submit( e );
			
        fd.append('file', files);

		doc.upload( this.databaseId, this.tableId, this.rowId, fd )
			.then( res => {
				this.success( "Your document has been uploaded" );

				this.$modal.trigger( "form::submit" );
				
				this.close();
			} )
			.catch( error => this.error( error ) );
	}
}

$( document )
	.on( "click", ".js-add-document", ( e ) => {
		let dbId = $( e.target ).data( "database-id" ), 
			tableId = $( e.target ).data( "table-id" ) , 
			rowId = $( e.target ).data( "row-id" );

		if ( $( e.target ).hasClass( "fas" ) ) {
			dbId = $( e.target ).parent().data( "database-id" );
			tableId = $( e.target ).parent().data( "table-id" ) ;
			rowId = $( e.target ).parent().data( "row-id" );
		}

		modals.documentUpload = new documentUpload( dbId, tableId, rowId );

		const modal = new mdbModal( $( '#addDocumentModal' )[0] );
		modal.show();
	} )
	.on( "hidden.mdb.modal", '#addDocumentModal', () => {
		modals.documentUpload.destroy();
	} )
  .on( "click", "#documents .document-list .js-download", function ( e ) {
  	let editModal = $( ".edit-modal.primary" )[0].modal,
  		$li = $( this ).closest( "li" ),
  		guid = $li.attr( "data-guid" ),
      	classes = {
      		loading: "fa-spin fa-spinner",
      		base: "fa-arrow-circle-down"
      	};

      $( this ).removeClass( classes.base ).addClass( classes.loading );

		doc.download( editModal.databaseId, editModal.tableId, editModal.rowId, guid )
			.then( buffer => {
				let link = $( "<a>", {
						href: window.URL.createObjectURL( buffer ),
						download: $li.find( ".js-filename" ).html(),
						class: "download-link"
					} );

				$( ".download-link" ).remove();
				$( "body" ).append( link ); // Required for FF
				$( `a.download-link` )[0].click();

		        $( this ).addClass( classes.base ).removeClass( classes.loading );
			} )
			.catch( error => {
				toastError( "Error", error );

		        $( this ).addClass( classes.base ).removeClass( classes.loading );
			} );
    } );
