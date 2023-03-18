import * as report from '/src/js/controllers/report.js';
import * as table from '/src/js/controllers/table.js';
import * as record from '/src/js/controllers/record.js';
import * as util from '/src/js/util.js';
import * as inputHelper from '/src/js/helpers/input.js';

import Modal from '/src/js/classes/modal.js';

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

export default class InputFormModal extends Modal {
	constructor ( databaseId, tableId, columns, form ) {
		super( "inputFormModal", "Edit input form" );

		this.databaseId = databaseId;
		this.tableId = tableId;
		this.columns = columns;
		this.form = form;

		this.$modal.find( ".modal-dialog" ).css( { "max-width": "98vw" } )

		this.$modal.find( ".modal-body form" ).css( { 
			height: "calc( 100vh - 195px )"
		} ).attr( "class", "row ps-3 pe-3");

		this.$modal.find( ".modal-body form" ).append(`
				<div class="col-12 col-md-4 col-lg-3 component-panel p-0 pt-2">
					<b class="title">Static components</b>
					<div class="sidebar static-components pb-3">
					    <div class="grid-stack-item ui-draggable" gs-x="1" gs-y="1" gs-w="1" gs-h="1" style="padding: 10px;">
					        <div class="grid-stack-item-content editable static title" draggable="true" style="padding: 10px;">
					        	<h2>
						        	<div class="form-outline a-2">
						        		<input type="text" id="Name" class="form-control" title="Name" 
						        			data-mdb-showcounter="true" maxlength="250" data-type="heading">
						        		<label class="form-label" for="Name"
						        			style="margin-left: 0px;">
						        			Heading
						        		</label>
						        		<div class="form-helper">
						        			<div class="form-counter">0 / 250</div>
						        		</div>
						        	</div>
					        	</h2>
					        	<button class="delete-cell">
									<i class="far fa-trash-alt"></i>
								</button>
					        </div>
					    </div>

					    <div class="grid-stack-item ui-draggable" gs-x="1" gs-y="1" gs-w="1" gs-h="1" style="padding: 10px;">
					        <div class="grid-stack-item-content editable static seperator-ln" draggable="true" style="padding: 10px;">
					        	<hr>
					        	<input type="hidden" data-type="seperator-ln">
					        	<button class="delete-cell">
									<i class="far fa-trash-alt"></i>
								</button>
					        </div>
					    </div>
					</div>

					<b class="title mt-4">Table columns</b>
					<div class="grid-stack form-components">
					</div>
				</div>
				<div class="col-12 col-md-8 col-lg-9 form-container p-0">
					<div class="grid-stack"></div>
				</div>`)
		
		this.paint();

		return this;
	}

	sortColumn ( a, b ) {
		if ( a.columnName > b.columnName )
			return 1;
		
		return ( b.columnName > a.columnName ) ? -1 : 0;
	}

	async paint () {
		let 
			y = 0,
			formGrid = GridStack.init( {
					column: 12,
					minRow: 8, // don't collapse when empty
					cellHeight: 70,
					disableOneColumnMode: false,
					float: true,
					removable: '.trash', // true or drag-out delete class
					acceptWidgets: el => { 
						el.setAttribute("gs-w", "3");
						return el; 
					}, // function example, but can also be: true | false | '.someClass' value
					resizable: {
						handles: 'e,se,s,w,n'
					},
					draggable: {
						scroll: true
					}
				}, this.$modal.find( ".form-container .grid-stack" )[0] ),
			componentGrid = GridStack.init({
					column: 1,
					minRow: 1, // don't collapse when empty
					cellHeight: 70,
					disableOneColumnMode: false,
					float: false,
					removable: '.trash', // true or drag-out delete class
					acceptWidgets: false,
					disableResize: true
				}, this.$modal.find( ".form-components" )[0] ),
			staticComponentGrid = GridStack.init({
					column: 1,
					minRow: 1, // don't collapse when empty
					cellHeight: 70,
					disableOneColumnMode: false,
					float: false,
					removable: '.trash', // true or drag-out delete class
					acceptWidgets: false, // function example, but can also be: true | false | '.someClass' value
					disableResize: true
				}, this.$modal.find( ".static-components .grid-stack" )[0] );

		GridStack.setupDragIn('.static-components .grid-stack-item', { 
			revert: 'invalid', scroll: false, appendTo: 'body', helper: cloneCell });
		// decide what the dropped item will be - for now just a clone but can be anything
		function cloneCell(event) {
			return event.target.cloneNode(true);
		}

		for ( const column of this.columns ) {
			let col = { ...column };

			col.ReadOnly = 1;
			let $input = await inputHelper.columnToInput( this.databaseId, col ),
				cell = false;

			if ( ! $input ) {
				continue
			}

			$input.find( "[disabled]" ).prop( "disabled", false );

			$input.attr( {
				"column-id": column.id,
				"table-id": this.tableId
			} );

			if ( this.form ) {
				cell = this.form.filter( cell => {
				 		if ( "config" in cell && cell.config["column-id"] == column.id ) {
				 			return true
				 		} 
				 	} );

				cell = cell[0];
			}

			$input.append( `<button class="delete-cell" aria-label="remove input">
					<i class="far fa-trash-alt"></i>
				</button>` );

			if ( cell ) {
				formGrid.addWidget({ 
					autoPosition: false, 
					x: cell.pos.x,
					y: cell.pos.y,
					w: cell.size.w,
					h: cell.size.h,
					minW: 2,
					content: $input.outerHTML()
				});

				y = Math.max( cell.pos.y, y );
			} else if ( ! column.mandatory ) {
				componentGrid.addWidget({ 
					autoPosition: true, 
					w: 6,
					minW: 2,
					content: $input.outerHTML()
				});
			} else {
				formGrid.addWidget({ 
					autoPosition: true, 
					w: 6,
					minW: 2,
					content: $input.outerHTML()
				});
			}
		}

		if ( this.form ) {
			for ( const cell of this.form ) {
				if ( cell.type == "form-element" ) {
					continue;
				}

				let content;

				switch ( cell.type ) {
					case "heading" : 
						content = `<div class="grid-stack-item">
							<div class="grid-stack-item-content editable static title" 
								draggable="true" style="padding: 10px;">
					        	<h2>
						        	<div class="form-outline a-2">
						        		<input type="text" id="Name" class="form-control" title="Name" 
						        			data-mdb-showcounter="true" maxlength="250" data-type="heading"
						        			value="${cell.content}">
						        		<label class="form-label" for="Name"
						        			style="margin-left: 0px;">
						        			Heading
						        		</label>
						        		<div class="form-helper">
						        			<div class="form-counter">0 / 250</div>
						        		</div>
						        	</div>
						       </h2>

					        	<button class="delete-cell">
									<i class="far fa-trash-alt"></i>
								</button>
					        </div>
				        </div>`;

						formGrid.addWidget(content, { 
							autoPosition: false, 
							x: cell.pos.x,
							y: cell.pos.y,
							w: cell.size.w,
							h: cell.size.h,
							minW: 3
						});

						break;
					case "seperator-ln":
						content = `<div class="grid-stack-item">
							<div class="grid-stack-item-content editable static seperator-ln" 
								draggable="true" style="padding: 10px;">
					        	<hr>
					        	<input type="hidden" data-type="seperator-ln">
					        	<button class="delete-cell">
									<i class="far fa-trash-alt"></i>
								</button>
					        </div>
				        </div>`;

						formGrid.addWidget(content, { 
							autoPosition: false, 
							x: cell.pos.x,
							y: cell.pos.y,
							w: cell.size.w,
							h: cell.size.h,
							minW: 3
						});
						
						break;
				}

				y = Math.max( cell.pos.y, y );
			}
		}

		formGrid.addWidget({ 
			autoPosition: false, 
			w: 12,
			minW: 12,
			x: 0,
			y: Math.max( y + 1, 9 ),
			content: "<div class='pseudo-new-row'></div>"
		});

		util.initMDBElements( $( ".grid-stack, .sidebar" ) );

		$( document )
			.on( "click", ".grid-stack-item .delete-cell", function ( e ) {
				e.preventDefault();
				
				let $item = $( this ).closest( ".grid-stack-item" ),
					$itemContent = $( this ).closest( ".grid-stack-item-content" );

				if ( ! $itemContent.hasClass( "static" ) ) {
					componentGrid.addWidget( $item[0] );
				}

				formGrid.removeWidget( $item[0] )
			} )
			.on( "drag", ".form-container .grid-stack-item", function ( e ) {
				let elY = parseInt( $( this ).attr( "gs-y" ), 10 ) + 2,
					$item = $( ".form-container .pseudo-new-row" )
						.closest( ".grid-stack-item" ),
					newRowY = $item.attr( "gs-y" ),
					currRows = $item.closest( ".grid-stack" ).attr( "gs-current-row" );

				if ( elY >= newRowY ) {
					$item.attr( "gs-y", elY - 1 )

					$item.closest( ".grid-stack" ).attr( "gs-current-row", elY )
				}
			} );

		super.paint();
		super.ready();
	}

	close () {
		super.close();
		this.destroy();
	}

	submit ( e ) {
		let cells = [],
			row = 0,
			col = 0;

		let $submitBtn = this.$modal.find( ".slide-btn[type='submit']" );

		$submitBtn.addClass( "loading" );

		this.$modal.find( ".form-container .grid-stack-item" ).each( function () {
			let $item = $( this ),
				cell = { 
					pos: {
						x: $item.attr( "gs-x" ),
						y: $item.attr( "gs-y" )
					},
					size: {
						w: $item.attr( "gs-w" ),
						h: $item.attr( "gs-h" )
					},
					type: "",
				},
				$input = $item.find( "[column-id]" )

			if ( $input.length > 0 ) {
				cell.type = "form-element";
				cell.config = {
					"table-id": $input.attr( "table-id" ),
					"column-id": $input.attr( "column-id" )
				}
			} else {
				cell.type = $item.find( "input" ).attr( "data-type" );
				cell.content = $item.find( "input" ).val();
			}

			cells.push( cell );
		} );

		table.formUpdate( cells, this.databaseId, this.tableId )
			.then( () => {
				this.success( "Your database has been updated" );

				this.$modal.trigger( "form::submit", [ {
					databaseId: this.databaseId, 
					tableId: this.tableId,
					form: cells
				} ] );

				this.close();
			})
			.catch( error => this.error( error ) );
	}
}