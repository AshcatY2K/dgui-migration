import * as util from '/src/js/util.js';
import * as record from '/src/js/controllers/record.js';

import Tooltip from '.././components/mdb/free/tooltip';
import Select from '.././components/mdb/pro/select';

import { toastSuccess, toastError, screenReaderAlert } from '../alerts.js';

export async function columnToInput ( databaseId, column, guid = false ) {
	if ( ! column ) {
		return;
	}

	let type = column.type,
		name = column.columnName,
		defaultValue = column[ "default value" ],
		$div = $("<div>", { class: "form-outline mb-4" }),
		$label = $( "<label>", { class: "form-label", for: name } ),
		$input;

	$label.html( unescape( name ) );
	
	if ( type == "text" ) {
		if ( defaultValue && defaultValue.includes( "NaN" ) ) {
			defaultValue = "";
		}

		let config = {
			type: type,
			label: name, 
			default: defaultValue,
			formula: column.formula
		};

		if ( column.mask ) {
			try {
				let mask = JSON.parse( column.mask );

				config.minChar = mask.minChar;
				config.maxChar = mask.maxChar;
				config.mask = mask.format;
			} catch ( e ) {}
		}

		$input = util.generateInput( config );
	} else if ( type == "drop down list" || type == "drop down list multi select" ) {
		$input = util.generateInput( {
			type: type,
			label: name,
			options: column.dropdownValues, 
			default: defaultValue
		} );
	} else if ( type == "from table" ) {
		let records,
			$select = $( "<select>", { 
				id: `${name}`, 
				class: "select from-select",
				"from-table-id": column.fromTableId
			} ),
			$option = $( "<option>", { value: "( Blank )" } ).html( "( Blank )" );

		$select.append( $option );

		if ( guid ) {
			$select.attr( "data-guid", guid );
		}

		$div.removeClass( "form-outline" );

		$select.attr( "aria-label", `${name} dropdown` );

		$label.attr( "for", name );
		$label.attr( "id", name.replace( " ", "-" ) + "-label" );

		$label.addClass( "select-label" );

		$div.append( $select ).append( $label );
		$input = $div;
	} else {
		if ( defaultValue && defaultValue.includes( "NaN" ) ) {
			defaultValue = "";
		}

		$input = util.generateInput( {
			type: type,
			label: name, 
			default: defaultValue,
			mask: column.mask,
			formula: column.formula
		} );
	}

	if ( column.tooltip ) {
		$input.attr( "data-mdb-toggle", "tooltip" )
			.attr( "title", column.tooltip );
			
		new Tooltip( $input[0] );
	}

	if ( column.mandatory && type !== "checkbox" ) {
		$input = manditoryField( $input );
	}

	if ( "formula" in column && column.formula ) {
		$input.find( "input, select, textarea" ).attr( "disabled", "disabled" )
	}

	if ( column.ReadOnly == 1 ) {
		$input.find( "input, select, textarea" ).prop( "readonly", true )
	}

	return $input
}

export function manditoryField ( $el ) {
	let $feedback = $( "<div>", { class: "invalid-feedback" } )
			.html( "This field is required" ),
		$invalidFeedback = $el.find(".invalid-feedback"),
		$label = $el.find( "label" );
		
	if ( $invalidFeedback.length < 1 ) {
		$el.find("input, select, textarea").after( $feedback );

		$el.find("select")
			.attr( "data-mdb-invalid-feedback", "This field is required" )
			.attr( "data-mdb-validation", "true" );
	}

	$label.html( $label.html() + "*" );

	$el.find("input, select, textarea").attr( "required", "required" );

	return $el;
}

export function inputValue ( $el) {
	let mask = $el.parent().attr( "data-mdb-format" ),
		value = $el.val(),
		$parent = $el.parent();
		
	if ( $el[0].hasAttribute( "data-mdb-format" ) ) {
		try {
			mask = JSON.parse( mask );
		} catch ( e ) {}
	}

	switch ( $el.attr( "type" ) ) {
		case "checkbox":
			value = $el.prop( "checked" ) ? 1 : 0;
			break;
		case "number":
		case "currency":
		case "integer":
			value = value ? value : null;
			break;
	}

	if ( value ) {
		if ( $parent.hasClass( "datepicker" ) ) {
			value = util.time().data().date( value, mask );
		} else if ( $parent.hasClass( "datetimepicker" ) ) {
			value = util.time().data().dateTime( value, mask );
		} else if ( $parent.hasClass( "timepicker" ) ) {
			value = util.time().data().time( value, mask );
		} else if ( $parent.hasClass( "timer" ) ) {
			value = util.time().data().timer( value, mask );
		}
	}

	return value;
}

export function dataToInputValue ( type, value, mask = '' ) {
	if ( type === "checkbox" ) {
		return value ? true : false;
	} if ( ! value ) {
		return "";
	} else if ( value ) {
		switch ( type ) {
			case "clock":
				value = util.time().display().time( value, mask );

				break;
			case "timer":
				value = util.time().display().timer( value, mask );

				break;				
			case "date time":
				try {
					value = util.time().display().dateTime( 
							value, JSON.parse( mask )
						);
				} catch ( e ) {
					value = util.time().display().dateTime( value, mask );
				}

				break;		
			case "date":
				value = util.time().display().date( value, mask );

				break;
			case "currency":
				value = value == 0 ? "0.00" : value;

				break;
		}

		return value;
	}
}

$( document )
	.on( "change", 'input[type="number"][placeholder="00.00"]', function () {
		let val = parseFloat( $( this ).val() );

		if ( ! isNaN( val ) ) {
			$( this ).val( val.toFixed(2) );
		}
	} )
	.on( "open.mdb.select", async function ( e ) {
		let tableId = $( e.target ).attr( "from-table-id" ),
			records,
			value = $( e.target ).val();

		if ( $( e.target ).find( "option" ).length > 2 || ! tableId ) {
			return;
		}

		$( e.target ).html( "" );

		if ( ! e.target.hasAttribute( "data-guid" ) ) {
			records = await record.get( window.params.databaseId, tableId, 1 );
		} else {
			records = await record.getByGuid( $( e.target ).attr( "data-guid" ), tableId );
		}

		if ( records.records.length > 0 ) {
			let key = Object.keys( records.records[0] )[1];

			records.records.sort( ( a, b ) => {
				let nameA = a[key],
					nameB = b[key]; 

				if ( typeof a[key] === "string" ) {
					if ( nameA ) {
						nameA = nameA.toUpperCase();
					}

					if ( nameB ) {
						nameB = nameB.toUpperCase(); 
					}
				}

				if ( nameA < nameB ) {
					return -1;
				} else if ( nameA > nameB ) {
					return 1;
				}
				// names must be equal
				return 0;
			} );

			let $option = $( "<option>", { value: "( Blank )" } );

			$option.html( "( Blank )" );

			if ( ! value ) {
				$option.attr( "selected", "selected" );
			}

			$( e.target ).append( $option );

			records.records.forEach( ( record, index) => {
				record = Object.values( record );

				let $option = $( "<option>", { value: record[ 0 ] } );

				if ( value == record[ 0 ] ) {
					$option.attr( "selected", "selected" );
				}

				$option.html( record[ 1 ] );

				$( e.target ).append( $option );
			} );
		}
	} )
	.on( "focus", "input, textarea, .nav-link", ( e ) => {
		setTimeout( () => {
			let $tooltip = $( e.target ).closest( "[data-mdb-original-title]" );

			if ( $tooltip.length > 0 ) {
				screenReaderAlert( "tooltip: " + $tooltip.attr( "data-mdb-original-title" ) );
			}

			$( ".tooltip.show" ).remove();
		}, 10 );
	} )
	.on( "mouseover", "input, textarea", ( e ) => {
		if ( $( ".tooltip.show" ).length > 1 ) {
			$( ".tooltip.show" ).eq( 0 ).remove();
		}
	} )
	.on( "shown.bs.tooltip", "[data-mdb-toggle='tooltip']", ( e ) => {
		let tooltip = $( e.target ).attr( "data-mdb-original-title" );

		screenReaderAlert( "tooltip: " + tooltip );
	} );