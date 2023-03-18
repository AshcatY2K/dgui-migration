import * as report from '/src/js/controllers/report.js';
import Database from '/src/js/model/database.js';
import * as table from '/src/js/controllers/table.js';
import * as column from '/src/js/controllers/column.js';

import * as util from '/src/js/util.js';
import Modal from '/src/js/classes/modal.js';

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

export default class DataModal extends Modal {
	constructor ( databaseId, tableId, tableName ) {
		super( "tinyMceDataModal", "Add data" );

		this.databaseId = databaseId;
		this.tableId = tableId;
		this.tableName = tableName;

		this.paint();

		return this;
	}

	sortColumn ( a, b ) {
		if ( a.columnName > b.columnName )
			return 1;
		
		return ( b.columnName > a.columnName ) ? -1 : 0;
	}

	async paint () {
		let columns = await column.get( this.databaseId, this.tableId ),
			db = new Database( this.databaseId ),
			tables = await db.list,
			$form = this.$modal.find( ".modal-body form" ),
			relatedTables = [],
			tagClick = this.tagClick.bind( this );
			
		columns.sort( this.sortColumn )

		for ( let i in columns ) {
			let columnName = columns[ i ].columnName,
				$btn = $( '<button>', {
					class: "btn btn-info btn-sm mb-3 me-3 ripple-surface shadow-0",
					name: columnName,
					"data-table-name": this.tableName
				} ).html( unescape( columnName ) ),
				tableId = columns[ i ].fromTableId;

			if ( tableId > 0 ) {
				relatedTables.push( { id: tableId, name: columnName } )
			}

			$form.append( $btn );
		}
		
		relatedTables.forEach( ( relatedTable ) => {
			column.get( this.databaseId, relatedTable.id ).then( columns => {
				let tableName = '';

				$form.append( $( "<p>" ).html( unescape( relatedTable.name ) ) );

				tables.forEach( ( table ) => {
					if ( relatedTable.id == table.id ) {
						tableName = table.tabelName;
					}
				} );

				columns.sort( this.sortColumn );

				columns.forEach( ( column ) => {
					let $btn = $( '<button>', {
						class: "btn btn-info btn-sm mb-3 me-3 ripple-surface shadow-0",
						name: column.columnName,
						"data-table-name": tableName
					} ).html( unescape( column.columnName ) );

					$form.append( $btn );
				} );
			} );
		} );

		this.$modal.find( "form" ).on( "click", "button", tagClick );

		this.$modal.find( ".modal-footer" ).hide();

		super.paint();
		super.ready();
	}

	close () {
		super.close();
		this.destroy();
	}

	tagClick ( e ) {
		e.preventDefault();

		let $form = this.$modal.find( "form" ),
			name = $( e.target ).attr( "name" ),
			tableName = $( e.target ).attr( "data-table-name" );

		this.$modal.trigger( "form::tagClick", [
				`{{[${tableName}].[${name}]}}`
			] );
	}
}
