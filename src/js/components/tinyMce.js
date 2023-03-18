import { toastSuccess, toastError } from '/src/js/alerts.js';

import * as column from '/src/js/controllers/column.js';
import * as table from '/src/js/controllers/table.js';
import * as report from '/src/js/controllers/report.js';
import * as util from '/src/js/util.js';
import PageSettings from '/src/js/classes/pageSettings.js';
import DataTableModal from '/src/js/classes/dataTableModal.js';
import DataModal from '/src/js/classes/dataModal.js';
import { screenReaderAlert } from '/src/js/alerts.js';

import * as focusTrap from '/src/js/components/focusTrap.js';

import Popconfirm from '.././components/mdb/pro/popconfirm';
import mdbModal from '.././components/mdb/pro/modal';
import Select from '.././components/mdb/pro/select';

import FileUpload from '.././components/file-upload/file-upload';

let databaseId = window.params.databaseId,
	tableId = window.params.tableId,
	queryString = window.location.search,
	urlParams = new URLSearchParams(queryString),
	tableName = urlParams.get('label'),
	htmlToHandleBars = ( html ) => {
		$( "body" ).append( $( "<div>", { id: "temp-html" } ).html( html ) );

		$( "#temp-html tbody[data-table]" ).each( ( index, tbody ) => {
			let tableName = $( tbody ).data( "table" );

			$( tbody ).find( "tr:first-child td[data-column]" ).each( ( index, td ) => {
				let column = $( td ).data( "column" ),
					$span = $( td ).find( "span" ),
					html;

				if ( $span.length < 1 ) {
					html = $( td ).html().replace( "-", `{{this.[${column}]}}` );
					$( td ).html( html );
				} else {
					html = $span.html().replace( "-", `{{this.[${column}]}}` );
					$span.html( html );
				}
			} );

			$( tbody ).find( "tr.totals-row td" ).each( ( index, td ) => {
				let column = $( td ).data( "column" ),
					$span = $( td ).find( "span" ),
					html;
				
				if ( column ) {
					html = $( td ).html().replace( "Total", `{{dgTotals.[${tableName}].[${column}]}}` );

					$( td ).css( "font-weight", "bold" ).html( html );
				} else {
					$( td ).html( "" );
				}
			} );

			$( tbody ).find( "tr:first-child" )
				.before( `<pseudo-element>{{#each [${tableName}]}}</pseudo-element>`)
				.after( "<pseudo-element>{{/each}}</pseudo-element>" );
		} );

		let template = $( "#temp-html" ).html()
			.replace( /(<pseudo-element>)({{[^}]*}})(<\/pseudo-element>)/gm, "$2" );

		$( "#temp-html" ).remove();

		return template;
	},
	populateReportSelect = async () => {
		let $select = $( "#report-select" ),
			$option = $( "<option>", { value: "" } ),
			$body = $select.closest( ".card-body" );

		$body.find( "[alt='Loading page']").show();
		$body.find( ".tab-content" ).hide();

		let reports = await report.get( databaseId, tableId );

		util.initMDBElements( $select.parent() );

		$select.html( "" ).append( $option );
		$option.html( "Select report" );

		$body.find( "[alt='Loading page']").hide();
		$body.find( ".tab-content" ).show();

		reports.forEach( ( report, index ) => {
			let $option = $( "<option>", { value: report.ID } );

			$option.html( unescape( report.FileName ) );
			$select.append( $option );
		});
	},
	applyPageConfig = ( config, editor ) => {
		let margin = {
				left: config.margin.left * 96,
				right: config.margin.right * 96,
				bottom: config.margin.bottom * 96,
				top: config.margin.top * 96
			},
			$body = $( editor.dom.doc.getElementById( "tinymce" ) );

		editor.dg = { page: config };

		$body.removeClass( "a3 a4 a5 legal letter tabloid" );

		if ( config.format !== "Custom" ) {
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

		$body.css( {
			width: ( config.size.width * 96 ) + 'px',
			height: ( config.size.height * 96 ) + 'px',
			padding: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`
		} );
	};

new Popconfirm( $( ".toggle-delete-confirm" )[0], {
	cancelLabel: "No",
	cancelText: "No",
	confirmLabel: "Yes",
	okText: "Yes",
	okClass: "delete-report-confirm btn-primary",
	message: "Are you sure you want to delete this report?",
	popconfirmMode: "modal"
} );

export default function initTinyMcePlugins () {
	databaseId = window.params.databaseId;
	tableId = window.params.tableId;

	populateReportSelect();

	tinymce.PluginManager.add( 'dgadddata', function ( editor, url ) {
		let urlParams = new URLSearchParams( window.location.search ),
			tableName = urlParams.get('label'),
			modal = {
				data: () => {
					let $modal = new DataModal( databaseId, tableId, tableName );
					
					const modal = new mdbModal( $( '#tinyMceDataModal' )[0] );
					modal.show();

					$( '#tinyMceDataModal' ).trap();
				},
				imageUpload: () => {
					const $modal = $( '#tinyMceImgAddModal' ),
						modal = new mdbModal( $modal[0] );

					new FileUpload( $modal.find( ".file-upload-input" )[0] );

					modal.show();

					$modal.trap();
				},
				newReport: function ( e ) {
					const $modal = $( '#tinyMceReportAddModal' ),
						modal = new mdbModal( $modal[0] );

					util.initMDBElements( $modal );

					modal.show();

					$modal.trap();
				},
				delete: () => $( ".toggle-delete-confirm" ).trigger( "click" )
			},
			actions = {
				img: {
					add: ( e ) => {
						let $modal = $( '#tinyMceImgAddModal' ),
							input = $modal.find( 'input[type="file"]' )[0],
							modal = new mdbModal( $modal[0] ),
							fr = new FileReader();

						if ( ! input.files[0] ) {
							alert( "Please select a file before clicking 'Load'" );
						} else {
							fr.onload = () => {
								editor.insertContent( `<img src='${fr.result}' 
									style='max-width: 100%;'>` );
							};

							fr.readAsDataURL( input.files[0] );
						}

						modal.hide();
					}
				},
				report: {
					add: ( e ) => {
						let $modal = $( "#tinyMceReportAddModal" ),
							$reportName = $modal.find( "#reportName" ),
							select = Select.getInstance( $( "#report-select" )[0] ),
							config = { 
								"format": "A4",
								size: {
									width: 8.3,
									height: 11.7
								},
								"margin":{
									"left":"0.5",
									"right":"0.5",
									"bottom":"0.2",
									"top":"0.2"
								}
							};

						$( "#reports #reportName" ).val( $reportName.val() );

						editor.resetContent( '' );
						select.setValue( '' );

						applyPageConfig( config, editor );

						$modal.find( ".btn-close" ).trigger( "click" );
					},
					delete: () => {
						let guid = $( "#report-select" ).val(),
							$loader = $("#tiny").closest( ".tab-pane" )
								.find( ".loader.-tab" );

						$loader.show();

						report.remove( databaseId, tableId, guid )
							.then( ( uri ) => {
								$loader.hide();

								populateReportSelect();
								editor.resetContent( '' );
		        				toastSuccess( "Report Deleted", "Your report has been deleted" );
								screenReaderAlert( "Your report has been deleted" );
							} )
							.catch( err => toastError( "Error", err ) );
					},
					save: () => {
						let html = tinymce.activeEditor.getContent(),
							reportName = $( "#reportName" ).val(),
							guid = $( "#report-select" ).val(),
							$loader = $("#tiny").closest( ".tab-pane" )
								.find( ".loader.-tab" );

						$loader.show();

						html = htmlToHandleBars( html );

						if ( guid ) {
							report.update( databaseId, tableId, html, reportName, guid, editor.dg.page )
								.then( () => {
									$loader.hide();

			        				toastSuccess( "Report Updated", "Your report has been updated" );
									screenReaderAlert( "Your report has been updated" );
								} )
								.catch( err => toastError( "Error", err ) );
						} else {
							report.add( databaseId, tableId, html, reportName, editor.dg.page )
								.then( () => {
									$loader.hide();

									populateReportSelect();
			        				toastSuccess( "Report Saved", "Your report has been saved" );
									screenReaderAlert( "Your report has been saved" );
								} )
								.catch( err => toastError( "Error", err ) );
						}
					}
				}
			};

		$( "#tinyMceImgAddModal .modal-footer" ).on( "click", "button", actions.img.add );
		$( "#tinyMceReportAddModal .modal-footer" ).on( "click", "button", actions.report.add );

		$( document )
			.on( 
				"form::submit", "#tinyMcePageSettingsModal", 
				( e, config ) => applyPageConfig( config, editor ) 
			)
			.on( 'click', ".delete-report-confirm", actions.report.delete )
			.on( 
				"form::submit", "#tinyMceTableModal", 
				( e, html ) => editor.insertContent( html ) 
			)
			.on( "form::tagClick", "#tinyMceDataModal", function ( e, html ) {
				editor.insertContent( html );
			} )
			.on( "click", "#tinyMceReportAddModal .btn-close, #tinyMceDataModal .btn-close, #tinyMceTableModal .btn-close, #tinyMceImgAddModal .btn-close, #tinyMcePageSettingsModal .btn-close", function ( e ) {
				$( this ).closest( "modal").free();
			} );

		// Adds a menu item, which can then be included in any menu via the menu/menubar configuration
		editor.ui.registry.addMenuItem( 'dgData', {
			text: 'Data', 
			onAction: modal.data,
			icon: "character-count"
		} );

		editor.ui.registry.addMenuItem( 'dgTable', {
			text: 'Data table', 
			onAction:  ( e ) => {
				let $modal = new DataTableModal( databaseId, tableId );
				
				const modal = new mdbModal( $( '#tinyMceTableModal' )[0] );
				modal.show();
			},
			icon: "table"
		} );

		editor.ui.registry.addMenuItem( 'dgImageAdd', {
			text: 'Image...', 
			onAction: modal.imageUpload,
			icon: 'image'
		} );

		editor.ui.registry.addMenuItem( 'dgNewReport', {
			text: 'New Report', 
			onAction: modal.newReport,
			icon: 'new-document'
		} );

		editor.ui.registry.addMenuItem( 'dgSave', {
			text: 'Save', 
			onAction: actions.report.save,
			icon: 'save'
		} );

		editor.ui.registry.addMenuItem( 'dgDelete', {
			text: 'Delete', 
			onAction: modal.delete,
			icon: 'remove'
		} );

		editor.ui.registry.addMenuItem( 'dgPageSettings', {
			text: 'Page Settings', 
			onAction: ( e ) => {
				let $modal = new PageSettings( editor.dg.page );
				
				const modal = new mdbModal( $( '#tinyMcePageSettingsModal' )[0] );
				modal.show();

				$( '#tinyMcePageSettingsModal' ).trap();
			}
		} );

		editor.ui.registry.addMenuItem( 'dgTableContext', {
			icon: 'sharpen',
			text: 'Add Column Total',
			onAction: ( ) => {
				let $element = $( editor.selection.getNode() ),
					index = $element.index(),
					$table = $element.closest( "table" ),
					$tbody = $table.find( "tbody" ),
					dataColumn = $tbody.find( "tr:first-child td" ).eq( index )
						.attr( "data-column" );

				if ( $tbody.find( ".totals-row" ).length == 0 ) {
					let $tr = $( "<tr>", { class: "totals-row" } );

					for ( let i = 0; i < $table.find( "thead th" ).length; i++ ) {
						$tr.append( $( "<td>" ).css(  'font-weight', 'bold' ) );
					}

					$tbody.append( $tr );
				}

				$tbody.find( ".totals-row" ).find( "td" ).eq( index )
					.attr( "data-column", `${dataColumn}` ).html( "Total" );
			}
		} );

		editor.ui.registry.addContextMenu( 'dgTableContext', {
			update: element => {				
				if ( 
					element.nodeName == "TH" && 
					$( element ).closest( "table" )[0].hasAttribute( "data-table" ) 
				) {
					return "dgTableContext";
				}

				return "";
			}
		} );
		// Return the metadata for the help plugin
		return;
	} );
} 

$( document )
	.on( "focus", ".tox-collection__group [role='menuitem']", ( e ) => {
		let label = $( e.target ).attr( "title" );
		
		$( "#pseudo-alert" ).html( label );
	} );