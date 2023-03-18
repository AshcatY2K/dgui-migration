import * as report from '/src/js/controllers/report.js';
import * as table from '/src/js/controllers/table.js';
import * as column from '/src/js/controllers/column.js';

import * as util from '/src/js/util.js';
import Modal from '/src/js/classes/modal.js';

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

export default class DataTableModal extends Modal {
	constructor ( databaseId, tableId ) {
		super( "tinyMceTableModal", "Add data" );

		this.databaseId = databaseId;
		this.tableId = tableId;

		this.paint();

		return this;
	}

	async populateDataTableLists () {
		let $tableSelect = this.$modal.find( "#table-select" ),
			tableId = $tableSelect.val(),
			columns = await column.get( this.databaseId, tableId ),
			$list1 = this.$modal.find( "#mceColumnList1" ),
			$list2 = this.$modal.find( "#mceColumnList2" );
			
		this.$modal.find( ".table-list-container" ).show();

		$list1.html( "" );
		$list2.html( "" );

		for ( let i in columns ) {
			let $li = $( "<li>", {
				class: "sortable-item",
				tabindex: "0",
				"data-column-name": columns[i].columnName
			} ).html( unescape( columns[i].columnName ) );

			if ( columns[i].fromTableId > 0 ) {
				$li.attr( "lookup", "true" );
			}

			$list1.append( $li );
		}
	
		new DragAndDrop.Sortable( $list1[0], { 
			connectedList: "#tinyMceTableModal #mceColumnList2"
		} );

		new DragAndDrop.Sortable( $list2[0], { 
			connectedList: "#tinyMceTableModal #mceColumnList1"
		} );
	}

	async paint () {
		this.$modal
			.find( ".modal-body form" )
			.append( `<div class="mb-3">
					<select id="table-select" class="table-select select">
						<option value="">Select a table</option>
					</select>
					<label class="form-label select-label" 
						for="table-select">Select table</label>
				</div>

				<div class="row table-list-container" style="display: none;">
					<div class="col-12 mb-3">
					</div>
					<div class="col-md-6">
						<h5>From</h5>
						<ul id="mceColumnList1" data-mdb-sortable="sortable" 
							style="height: calc( 100% - 35px );"
							class="sortable-list"></ul>
					</div>
					<div class="col-md-6">
						<h5>To</h5>
						<ul id="mceColumnList2" data-mdb-sortable="sortable" 
							style="height: calc( 100% - 35px );"
							class="sortable-list"></ul>
					</div>
				</div>` );

		let $list = this.$modal.find( ".table-select" ),
			tables = await table.relationships( this.databaseId, this.tableId ),
			populateDataTableLists = this.populateDataTableLists.bind( this );

		for ( let i in tables ) {
			let tableName = unescape( tables[i].tableName ),
				$li = $( "<option>", { value: tables[i].tableId } )
					.html( tableName );

			$list.append( $li );
		}

		this.$modal.on( "change", ".table-select", populateDataTableLists );

		super.paint();
		super.ready();
	}

	close () {
		super.close();
		this.destroy();
	}

	submit ( e ) {
		let $form = this.$modal.find( "form" ),
			$tableList = $form.find( ".table-select" ),
			tableName = $tableList.find( "[value='" + $tableList.val() + "']" ).html(),
			thead = `<thead><tr>`,
			tbody = `<tbody data-table="${tableName}"><tr>`;

		super.submit( e );

		$form.find( "#mceColumnList2 li" ).each( ( i, el ) => {
			let column = $( el ).html(),
				dataColumn = $( el ).attr( "data-column-name" );

			thead += `<th>${column}</th>`;

			if ( el.hasAttribute( "lookup" ) ) {
				column += "|Lookup";
			}

			tbody += `<td data-column="${dataColumn}">-</td>`
		} ) 

		thead += `</tr></thead>`;
		tbody += `</tr></tbody>`;

		this.$modal.trigger( "form::submit", [
				`<table data-table>${thead}${tbody}</table>`
			] );

		this.close();
		this.destroy();
	}
}
