import * as report from '/src/js/controllers/report.js';
import * as table from '/src/js/controllers/table.js';
import * as column from '/src/js/controllers/column.js';
import * as preferences from '/src/js/controllers/preferences.js';

import * as util from '/src/js/util.js';
import Modal from '/src/js/classes/modal.js';
import * as inputHelper from '/src/js/helpers/input.js';

import * as FilterGroup from '.././components/filter/filterGroup';
import Select from '.././components/mdb/pro/select';
import mdbModal from '.././components/mdb/pro/modal';
import Datetimepicker from '.././components/mdb/pro/date-time-picker';
import Datepicker from '.././components/mdb/pro/datepicker';
import Autocomplete from '.././components/mdb/pro/autocomplete';

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

export default class FilterModal extends Modal {
	constructor ( $datatable, designer, activePreference = false, columnId = false, comparative = false, filterValue = false ) {
		super( "columnFilterModal", `Filter &amp; Search
				<a href="https://www.mydatagrowsblog.com/post/advanced-filters" 
					target="_blank" style="font-size: 1.2rem;">
					<i class="far fa-question-circle"></i>
				</a>` );

		this.$datatable = $datatable;
		this.databaseId = $datatable.attr( "data-db-id" );
		this.tableId = $datatable.attr( "data-table-id" );

		this.$modal[0].columns = $datatable[0].columns;
		this.$modal[0].databaseId = $datatable.attr( "data-db-id" );

		this.activePreference = activePreference;
		this.columnId = columnId;
		this.comparative = comparative;
		this.filterValue = filterValue;
		this.designer = designer;

		this.$modal.find( ".modal-footer [type='submit']" ).html( "Apply" ).addClass( "float-end" );

		this.$modal.find( ".modal-footer" ).addClass( "align-items-end" );
		
		super.paint();
		this.paint();

		return this;
	}

	populate ( preferences, $container ) {
		if ( "filters" in preferences ) {
			let transitoryFilters = preferences.filters.filter( filter => filter.transitory  ),
				$filterGroup = $( "<filter-group class='mb-2 container'></filter-group>" )
					.attr( "data-operator", preferences.operator );

			if ( transitoryFilters.length > 0 ) {
				preferences.filters = transitoryFilters;
			}

			for ( let filter of preferences.filters  ) {
				$filterGroup.append( this.populate( filter, $filterGroup ) )
			}

			$container.append( $filterGroup );
		} else {
			let $filter = $( "<table-filter class='container mb-2 px-0 pb-2 pt-3 pe-0'></table-filter>" )
				.attr( "data-column-id", preferences.columnId )
				.attr( "data-comparative", preferences.comparative )
				.attr( "data-filter", preferences.filter )
				.attr( "data-operator", preferences.operator )
				.attr( "data-from", preferences.from )
				.attr( "data-to", preferences.to )
				.attr( "data-lookup", preferences.lookup )
				.attr( "data-locked", preferences.locked );
				
    	$container.append( $filter );
		}
	}

	async paint () {
		if ( ! ( "preferences" in this.$datatable[0] ) ) {
			this.$datatable[0].preferences = await preferences.get( this.databaseId, this.tableId );
		}

		let $form = this.$modal.find( ".modal-body form" );

		if ( $form.find( "#filter-name" ).length < 1 ) {
			$form.append( `<div class="form-check form-switch">
					<input class="form-check-input" type="checkbox" value="" id="toggle-advanced-filter">
					<label class="form-label form-check-label" for="toggle-advanced-filter">
						Advanced Filter
					</label>
				</div>

				<div class="row d-flex">
			  	<div class="col-12 col-sm-8 advanced-feature">
				  	<div class="form-outline mb-3 filter-name-container">
			  				<input type="text" id="filter-name" class="form-control">
								<label class="form-label" for="filter-name">
									Title
								</label>
						</div>
					</div>
			  	<div class="col-12 col-sm-4 advanced-feature">
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" value="" id="global">
							<label class="form-label form-check-label" for="global">
								Global preference
							</label>
						</div>
					</div>
				</div>` );

			this.$modal.find( ".modal-footer" ).prepend( `<button class="btn btn-info slide-btn advanced-feature me-3" id="save-filter" 
		    			aria-label="save filter" disabled style="height: 34.64px;">
							<div class="spinner-border text-light" role="status">
								<span class="visually-hidden">Loading...</span>
							</div>
							<span style="line-height: 1.6;">Save &amp; Apply</span>
						</button>`);

    	util.initMDBElements( this.$modal.find( ".filter-name-container" ) );
		}

		if ( ! this.activePreference ) {
			$form.append( `<h4 class="advanced-feature">Filter List</h4>
				<filter-group class='container p-0' style='background: none; border: none;'></filter-group>` );
		} else {
			let activePreference = JSON.parse( this.activePreference.Preference );
			$form.find( "filter-group" ).remove();

			this.populate( activePreference, $form );

			if ( 
				activePreference.filters.length > 1 || 
				"filters" in activePreference.filters ||
				( activePreference.filters.length == 1 && this.columnId )
			) {
				this.$modal.find( "#toggle-advanced-filter" ).prop( "checked", true )
						.trigger( "change" );
			}
		}

		if ( this.columnId ) {
			let $filter = $( "<table-filter class='container mb-2 px-0 pb-2 pt-3'></table-filter>" )
				.attr( "data-column-id", this.columnId )
				.attr( "data-comparative", this.comparative )
				.attr( "data-filter-value", this.filterValue );

    	$form.find( "> filter-group" ).append( $filter );
    }

		if ( this.activePreference.Global ) {
			this.$modal.find( "#global" ).prop( "checked", true );
		}

		let savePreference = this.savePreference.bind( this );
			
		this.$modal
			.on( "click", "#save-filter", savePreference );

		this.ready();
	}

	ready () {
		super.ready();

		let preferences = this.$datatable[0].preferences,
			temp = preferences.map( preference => preference.Name ),
			instance = new Autocomplete( this.$modal.find( "#filter-name" ).parent()[0], { 
				filter: value => {
					return preferences.filter( preference => {
						return preference.Name.toLowerCase().startsWith( value.toLowerCase() );
					});
				},
				displayValue: preference => {
					return preference.Name 
				}
			} );

		if ( this.activePreference && this.activePreference.Name ) {
			this.$modal.find( "#filter-name" ).val( this.activePreference.Name )
				.trigger( "keyup" );
		}

		this.$modal.find( ".filter-name-container" )
			.on( "itemSelect.mdb.autocomplete", ( e ) => {
				this.activePreference = e.value;

				this.paint();
			} );
	}

	savePreference ( e ) {
		e.preventDefault();
		e.stopImmediatePropagation();

		let $form = this.$modal.find( ".modal-body form" ),
			preference = $form.find( "> filter-group" )[0].toJson(),
			name = $form.find( "#filter-name" ).val(),
			$saveBtn = this.$modal.find( "#save-filter" ),
			payload = {
					name: name,
					preference: JSON.stringify( preference ),
					global: false,
					type: "filter"
				},
			saveSuccess = () => {
					setTimeout( () => $saveBtn.removeClass( "success" ), 1500);

					let $datatable = $( `.datatable[data-db-id='${this.databaseId}'][data-table-id='${this.tableId}']` );

					delete $datatable[0].preferences;

					this.submit( e );
			};

		if ( $form.find( "#global" ).is(':checked') ) {
			payload.global = true;
		}
			
		$saveBtn.addClass( "loading" );

		if ( this.activePreference.Name == name ) {
			preferences.update( this.databaseId , this.tableId, this.activePreference.id, payload )
				.then( res => {
					saveSuccess();

					toastSuccess( "Success", "Your filter has been updated" );
					screenReaderAlert( "Your filter has been updated" ) 
				} )
				.catch( error => toastError( error ) );			
		} else {
			preferences.add( this.databaseId , this.tableId, payload )
				.then( res => {
					saveSuccess();
					toastSuccess( "Success", "Your filter has been saved" );
					screenReaderAlert( "Your filter has been saved" ) 
				} )
				.catch( error => toastError( error ) );
		}
	}

	close () {
		super.close();
		this.destroy();
	}

	submit ( e ) {
		super.submit( e );

		let $form = this.$modal.find( ".modal-body form" ),
			filters = $form.find( "> filter-group" )[0].toJson(),
			$table = $(`.datatable[data-db-id='${this.databaseId}'][data-table-id='${this.tableId}']`);

		if ( this.activePreference && this.activePreference.id ) {
			filters.appliedFilterId = this.activePreference.id;
		}

		$table.smartTable( this.databaseId, this.tableId, filters );

		this.close();
		this.destroy();
	}
}

function filterOnField ( $contextMenu, comparative ) {
	let tableId = $contextMenu.attr( "data-table-id" ),
		$datatable = $( `.datatable[data-table-id="${tableId}"]` ),
		databaseId = $datatable.attr( "data-db-id" ),
		columnId = $contextMenu.closest( ".options" ).attr( "data-column-id" ),
		filters = $datatable[0].filters ? $datatable[0].filters : [],
		filter = {
      "columnId": parseInt( $contextMenu.attr( "data-column-id" ) ),
      "comparative": comparative,
      "filter": $contextMenu.attr( "data-value" )
		},
		column = $datatable[0].columns.filter( column => column.id == columnId );

	column = column[0];

	if ( "drop down list multi select" == column.type && comparative == "contains" ) {
		filter.filter = filter.filter.replace( "[", "" ).replace( "]", "" );
	} else 
	if ( "date time" == column.type || "date" == column.type || "clock" == column.type ) {
		filter.from = filter.filter;
		filter.to = filter.filter;

		delete filter.filter;
		delete filter.comparative;
	} else if ( "checkbox" == column.type ) {
		delete filter.comparative;
	}

	$( ".contextMenu" ).remove();

	if ( filters.length > 0 ) {
		filter.operator = "and";
	}

	filters.push( filter );

	$datatable.smartTable( databaseId, tableId, { filters: filters } );
}