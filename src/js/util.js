import * as focusTrap from './components/focusTrap.js';

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

import Select from './components/mdb/pro/select';
import Datepicker from './components/mdb/pro/datepicker';
import Datetimepicker from './components/mdb/pro/date-time-picker';
import Timepicker from './components/mdb/pro/timepicker';
import Input from './components/mdb/free/input';
import Tooltip from './components/mdb/free/tooltip';
import Inputmask from './components/inputmask/inputmask';

import FileUpload from './components/file-upload/file-upload';

let display = {
		date: ( value, mask = "yyyy mmmm dd" ) => {
			if ( ! value || value == "1900-01-01T00:00:00.000Z" ) {
				return "";
			}

			if ( ! mask ) {
				mask = "yyyy mmmm dd";
			}

			const date = ( value !== "NOW" ) ? new Date( value ) : new Date(),
				months = [
					"January", "February", "March",
					"April", "May", "June", "July",
					"August", "September", "October",
					"November", "December",
				],
				days = [
					"Sunday", "Monday", "Tuesday", "Wednesday",
					"Thursday", "Friday", "Saturday",
				];

			if ( Number.isNaN( date.getTime() ) ) {
				return "";
			}
			
			let year = date.getFullYear(),
				month = date.getMonth() + 1,
				day = date.getDate();
				
			return mask
				.replace( "yyyy", year )
				.replace( "mmmm", months[ month - 1 ] )
				.replace( "mm", String( month ).padStart(2, '0') )
				.replace( "dddd", days[ date.getDay() ] )
				.replace( "dd", String( day ).padStart(2, '0') );
		},
		time: ( value, mask = "hh:mm a" ) => {
			let date,
				hours,
				minutes,
				amPm;

			if ( 
				typeof value !== "string" || 
				! value || 
				value === "1970-01-01T00:00:00.000Z" 
			) {
				return "";
			}

			if ( ! mask ) {
				mask = "hh:mm a"
			}

			if ( value !== "NOW" ) {
				date = value.includes( "T" ) ? value.split( "T" )[1].split( ":" ) : value.split( ":" );
				hours = parseInt( date[0] );
				minutes = parseInt( date[1] );
				amPm = "AM";
			} else {
				date = new Date();
				hours = date.getHours();
				minutes = date.getMinutes();
				amPm = ( hours < 13 ) ? "AM" : "PM";
			}

			if ( mask.includes( "a" ) && hours > 12) {
				hours -= 12;

				amPm = "PM";
			}

			return mask
				.replace( "hh", String( hours ).padStart(2, '0') )
				.replace( "mm", String( minutes ).padStart(2, '0') )
				.replace( "a", amPm );
		},
		timer: ( value, mask = "hh:mm" ) => {
			if ( ! value && value !== 0 ) {
				return "";
			}

			if ( ! mask ) {
				mask = "hh:mm";
			}

			let isNegative = value < 0 ? true : false;

			value = Math.abs( value );

			let hours = Math.floor( value / 60 / 60 / 1000 );

			value -= hours * 60 * 60 * 1000;

			let minutes = Math.floor( value / 60 / 1000 );

			value -= minutes * 60  * 1000;

			let seconds = Math.floor( value / 1000 );

			value -= seconds * 1000;

			hours = String( hours ).padStart(2, '0');
			minutes = String( minutes ).padStart(2, '0');
			seconds = String( seconds ).padStart(2, '0');

			return mask.replace( "hh", isNegative ? "-" + hours : hours )
				.replace( "mm", minutes )
				.replace( "ss", seconds );
		},
		dateTime: ( value, mask = "" ) => {
			if ( ! value || value == "1900-01-01T00:00:00.000Z" ) {
				return "";
			}

			try {
				mask = JSON.parse( mask );
			} catch ( e ) {}

			if ( value !== "NOW" ) {

			}

			if ( ! mask ) {
				mask = { date: "", time: "" };
			}
			
			let parts = value.match( /([^:]*)[,T] ?(\d{1,2}:\d{2} ?(AM|PM)?)(:00\.000)?/ ),
				date,
				time;

			if ( value == "NOW" ) {
				date = display.date( "NOW", mask.date );
				time = display.time( "NOW", mask.clock );
			} else if ( parts ) {
				date = display.date( parts[1], mask.date );
				time = display.time( parts[2], mask.clock );
			} else {
				return value;
			}

			return ( ! date || ! time ) ? "" : `${date}, ${time}`;
		}
	},
	data = {
		date: ( value, mask = "yyyy mmmm dd" ) => {
			let date = new Date( value ),
				year = date.getFullYear(),
				day = date.getDate(),
				month = date.getMonth() + 1,
				regex = /[\.\-\\/ ]/g,
				dateShards = value.split( regex ),
				maskShards = mask.split( regex ),
				months = [
					"January", "February", "March", "April", "May", "June", 
					"July", "August", "September", "October", "November", 
					"December",
				],
				days = [
					"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", 
					"Saturday", "Sunday"
				];

			$.each( maskShards, ( index, mask ) => {
				if ( mask.includes( "d" ) ) {
					day = dateShards[ index ];

					if ( days.indexOf( day ) >= 0 ) {
						day = days.indexOf( day ) + 1;
					}

					day = String( day ).padStart(2, '0');
				} else if ( mask.includes( "m" ) ) {
					month = dateShards[ index ];

					if ( months.indexOf( month ) >= 0 ) {
						month = months.indexOf( month ) + 1;
					}

					month = String( month ).padStart(2, '0');
				} else if ( mask.includes( "y" ) ) {
					year = parseInt( dateShards[ index ], 10 );

					if ( year < 100 ) {
						year = 2000 + year;
					}
				}
			} );

			return `${year}-${month}-${day}`;
		},
		time: ( time ) => {
			if ( ! time ) {
				return '';
			}

			time = time.split( /[: ]/ );

			let hours = parseInt( time[0] ),
				minutes = time[1],
				seconds = "00";

			if ( time[2] == "PM" || time[3] == "PM" ) {
				hours += 12;

				if ( hours == 24 ) {
					hours = 0;
				}
			} else if ( Number( time[2] ) ) {
				seconds = time[2];
			}

			hours = String( hours ).padStart(2, '0');
			minutes = String( minutes ).padStart(2, '0');

			return `${hours}:${minutes}:${seconds}.000`;
		},
		timer: ( time ) => {
			if ( ! time ) {
				return '';
			}

			time = time.split( ":" );

			let hours = parseInt( time[0] ),
				minutes = parseInt( time[1] ) + ( hours * 60 ),
				seconds = time[2] ? parseInt( time[2] ) : 0,
				milliseconds = ( minutes * 60 + seconds ) * 1000;

			return milliseconds;
		},
		dateTime: ( value, mask = "" ) => {
			if ( ! value ) {
				return '';
			}

			if ( ! mask ) {
				mask = { date: "", time: "" };
			} else {
				try {
					mask = JSON.parse( mask )
				} catch ( e ) {}
			}

			let parts = value.match( /([^:]*), (\d{2}:\d{2} ?(AM|PM)?)/ );

			if ( ! parts ) {
				return '';
			}
			
			return data.date( parts[1], mask.date ) + "T" + data.time( parts[2], mask.time );
		}
	},
	time = function () {
		return {
			display: () => {
				return {
					dateTime: display.dateTime,
					date: display.date,
					time: display.time,
					timer: display.timer
				}
			},
			data: () => {
				return {
					dateTime: data.dateTime,
					date: data.date,
					time: data.time,
					timer: data.timer
				}
			}
		}
	},
	getDateTimeRegex = function ( mask ) {
		let regex = {
				h: "([0-1]?\\d|2[0-3])",
				ha: "(0?\\d|1[0-2])",
				ms: "([0-5]\\d)",
				a: "([AaPp][Mm])"
			},
			map = {
				"hh:mm": `^\\d\\d:${regex.ms}$`,
				"hh:mm:ss": `^\\d\\d:${regex.ms}:${regex.ms}$`,
				"hh:mm a": `^${regex.ha}:${regex.ms} ${regex.a}$`,
				"hh:mm:ss a": `^${regex.ha}:${regex.ms}:${regex.ms} ${regex.a}$`
			}

		return map[ mask ];
	},
	initMDBElements = ( $container ) => {
		let $input = [];
		
		$container.find( '.select' ).each( function ( index ) {
			let options = { filter: true, optionHeight: 80 },
				id = $( this ).attr( "id" ),
				$modal = $( this ).closest( ".modal" ),
				instance = Select.getInstance( this ),
				$containerCopy = $( this ).parent().clone();

			if ( this.hasAttribute( "no-filter" ) ) {
				options.filter = false;
			}

			if ( $modal.length > 0 ) {
				options.container = "#" + $modal.attr( "id" );
			}

			if ( instance ) {
				let $label = $( this ).closest( ".select-wrapper" ).find("label"),
					forTarget = $label.attr("for"),
					html = $label.html();

				instance.dispose();

				$( this ).parent()
					.append( `<label class="form-label select-label" for="${forTarget}">
							${html}
						</label>` );
			}

			let $select = $container.find( `[id='${id}']` );

			$( this ).parent().find( ".select-input" ).attr( "role", "listbox" );

			if ( $( this )[0] && $( this )[0].hasAttribute( "data-mdb-invalid-feedback" ) ) {
				options.invalidFeedback = $( this ).attr( "data-mdb-invalid-feedback" );
			}

			if ( $( this )[0] && $( this )[0].hasAttribute( "aria-label" ) ) {
				$( this ).parent().find( ".select-input" )
					.attr( "aria-label", $( this ).attr( "aria-label" ) );
			}

			if ( 
				$( this ).attr("required") == "required" || 
				this.hasAttribute( "data-mdb-validation" ) 
			) {
				options.invalidFeedback = $( this ).attr( "data-mdb-invalid-feedback" );

				$( this ).parent().find("input")
					.attr( "aria-label", $( this ).parent().find("label").html() + " required" );
			}

			try {
				options.autoSelect = true;
				let sel = new Select( this, options );

				$( this ).parent().find( "input" )
					.attr( "aria-labelledby", id.replace( " ", "-" ) + "-label" )
				
				if ( 
					this.hasAttribute( "data-default" ) && 
					this.hasAttribute( "multiple" ) &&
					$( this ).attr( "data-default" )
				) {
					sel.setValue( $( this ).attr( "data-default" ).split( "," ) );
				}
			} catch ( e ) { }
		} );
		// Input
		$input = $container.hasClass('form-outline') ? $container : [];
		$input = $container.find( '.form-outline' ).length > 0 ? $container.find( '.form-outline' ) : $input;

		if ( $input.length > 0 ) {
			$input.each( function ( index ) {
				try {
					new Input( this );
				} catch ( e ) {}
			} );
		}
		// Date
		$input = $container.hasClass('datepicker') ? $container : [];
		$input = $container.find( '.datepicker' ).length > 0 ? $container.find( '.datepicker' ) : $input;

		if ( $input.length > 0 ) {
			$input.each( function ( index ) {
				let format = 'yyyy mmm dd',
					instance = Datepicker.getInstance( this );

				if ( instance ) {
					instance.dispose();
				}

				if ( $container[ 0 ].hasAttribute( "data-mdb-format" ) ) {
					format = $container.attr( "data-mdb-format" ) ;
				}

				if ( this.hasAttribute( "data-mask" ) ) {
					format = $( this ).attr( "data-mask" );
				}

				if ( this.hasAttribute( "data-mdb-format" ) ) {
					format = $( this ).attr( "data-mdb-format" );
				}

				new Datepicker( this, { format: format, inline: true } );

				$( this ).find( ".datepicker-toggle-button" )
					.attr( "aria-label", "Date picker" );
			} );
		}
		// Date time
		$input = $container.hasClass('datetimepicker') ? $container : [];
		$input = $container.find( '.datetimepicker' ).length > 0 ? $container.find( '.datetimepicker' ) : $input;
		
		if ( $input.length > 0 ) {
			$input.each( function ( index ) {
				let mask = $( this ).find( "input" ).attr( "data-mask" ),
					defaultVal = $( this ).find( "input" ).attr( "data-default" ),
					instance = Datetimepicker.getInstance( this );

				if ( mask ) {
					mask = JSON.parse( mask );

					if ( "clock" in mask ) {
						mask.time = mask.clock;
					}
				} else {
					mask = {
						date: "yyyy mmmm dd",
						time: "hh:mm a"
					}
				}

				let config = {
					datepicker: { 
						format: mask ? mask.date : 'yyyy mmm dd'
					},
					timepicker: {
						format12: mask.time == "hh:mm a" ? true : false,
						format24: mask.time == "hh:mm" ? true : false
					}
				}

				if ( defaultVal ) {
					defaultVal = defaultVal.split( ", " );

					config.defaultDate = defaultVal[0];
					config.defaultTime = defaultVal[1];

					if ( ! $( this ).find( "input" ).val() ) {
						$( this ).find( "input" ).val( defaultVal );
					}
				}

				$( this ).find( ".timepicker-toggle-button" )
					.attr( "aria-label", "Time picker" );

				let val = $( this ).find( "input" ).val();

				if ( instance ) {
					instance.dispose();
				}

				instance = new Datetimepicker( this, config );

				if ( val ) {
					$( this ).find( "input" ).val( val )

	        val = val.split( ", " );

	        instance._datepicker._input.value = val[0];
	        instance._timepicker.input.value = val[1];
				}

				$( this ).find( ".datetimepicker-toggle-button" )
					.attr( "aria-label", "Date and time picker" );
			} );
		}
		// Time
		$input = $container.hasClass('timepicker') ? $container : [];
		$input = $container.find( '.timepicker' ).length > 0 ? $container.find( '.timepicker' ) : $input;

		if ( $input.length > 0 ) {
			$input.each( function ( index ) {
				let mask = this.hasAttribute( "data-mask" ) ? $( this ).attr( "data-mask" ) : 'hh:mm a';

				if ( ! mask ) {
					mask = 'hh:mm a';
				}

				new Timepicker( this, {
					format12: mask == "hh:mm a" ? true : false,
					format24: mask == "hh:mm" ? true : false
				} );

				$( this ).find( ".timepicker-toggle-button" )
					.attr( "aria-label", "Time picker" );
			} );
		}
		// File upload
		$input = $container.find( 'input[type="file"]' );

		if ( $input.length > 0 ) {
			$input.each( function ( index ) {
				new FileUpload( this );
			} );
		}

		setTimeout( () => {
			$( ".form-outline" ).each( function ( index ) {
				let $notch = $( this ).find( ".form-notch" ),
					$label = $( this ).find( "label" ),
					$middleNotch = $( this ).find( ".form-notch-middle" );

				$middleNotch.width( $label.width() );

				if ( $notch.length > 1 ) {
					$notch.eq(1).remove();
				}
			} );
		}, 10);

		$( ".form-helper" ).each( function ( index ) {
			while ( $( this ).find( ".form-counter" ).length > 1 ) {
				$( this ).find( ".form-counter" ).eq( 0 ).remove();
			}

			$( this ).find( ".form-counter" ).attr( "aria-hidden", true );
		} );

		$container.find( "[data-mdb-toggle='tooltip']" ).each( function ( index ) {
			new Tooltip( this )
		} );
	},
	generateInput = ( config ) => {
		let $div = $("<div>", { class: "form-outline" }),
			$formText = $("<div>", { class: "form-text" }),
			formText,
			$input,
			labelConfig = {
				class: "form-label", 
				for: config.id
			},
			inputConfig = {
				type: "text", 
				id: ( "id" in config ) ? config.id : config.label,
				class: "form-control",
				//title: escape( $('<textarea />').html( config.label ).text() )
			},
			defaultValue = ( "default" in config ) ? config.default : "",
			$helper,
			$prefix,
			$outerLabel,
			invalidTxt;

		try {
			config.mask = JSON.parse( config.mask );
		} catch ( e ) {}

		if ( config.mask ) {
			$div.attr( "data-mdb-format", config.mask );
		}
		
		switch ( config.type ) {
			case "text":
			case "hyperlink":
			case "date":
			case "date time":
			case "timer":
			case "clock":
				$input = $( "<input>", inputConfig );

				switch ( config.type ) {
					case "text":
						$input.attr( "data-mdb-showcounter", "true" );

						if ( "minChar" in config && config.minChar ) {
							$input.attr( "minlength", config.minChar );
						}
						
						if ( "maxChar" in config && config.maxChar ) {
							$input.attr( "maxlength", config.maxChar );
						} else {
							$input.attr( "maxlength", "250" );
						}

						if ( "mask" in config && config.mask) {
							let mask = config.mask
								.replace( /([^\\])\?/g, "$1\\w?" )
								.replace( /([^\\w])\?/g, "$1\\w?" )
								.replace( /([^\\])0/g, "$1\\d" )
								.replace( /([^\\])0/g, "$1\\d" )
								.replace( /([^\\])9/g, "$1\\d?" )
								.replace( /([^\\])9/g, "$1\\d?" )
								.replace( /([^\\])#/g, "$1[\\d\\+\\- ]" )
								.replace( /([^\\])#/g, "$1[\\d\\+\\- ]" )
								.replace( /([^\\])L/g, "$1\\w" )
								.replace( /([^\\])L/g, "$1\\w" )
								.replace( /([^\\])A/g, "$1[\\w\\d]" )
								.replace( /([^\\])A/g, "$1[\\w\\d]" )
								.replace( /([^\\])a/g, "$1[\\w\\d]?" )
								.replace( /([^\\])a/g, "$1[\\w\\d]?" )

								.replace( /^0/g, "\\d" )
								.replace( /^9/g, "\\d?" )
								.replace( /^#/g, "[\\d\\+\\- ]" )
								.replace( /^L/g, "\\w" )
								.replace( /^A/g, "[\\w\\d]" )
								.replace( /^a/g, "[\\w\\d]?" )

								.replace( /\\\?/g, "\\?" )
								.replace( /\\0/g, "0" )
								.replace( /\\9/g, "9" )
								.replace( /\\#/g, "#" )
								.replace( /\\L/g, "L" )
								.replace( /\\A/g, "A" )
								.replace( /\\a/g, "a" );

							$input.attr( "pattern", mask );

							config.mask = "Pattern: " + config.mask + 
								`<a href="https://www.mydatagrowsblog.com/post/input-mask-explained" 
									target="_blank">
									<i class="far fa-question-circle"></i>
								</a>`;

							invalidTxt = "Please match the specified pattern";
						}

						$helper = $( "<div>", { class: "form-helper" } );
						break;
					case "hyperlink":
						$input.attr( "data-mdb-showcounter", "true" )
							.attr( "maxlength", "250" )
							.attr( "type", "url" );

						$helper = $( "<div>", { class: "form-helper" } );
						break;
					case "date":
						if ( config.mask ) {
							let pattern = config.mask.toLowerCase()
								.replace( /\//g, "\\/" )
								.replace( "yyyy", "\\d{4}" )
								.replace( "mmmm", "(January|February|March|April|May|June|July|August|September|October|November|December)" )
								.replace( "mm", "(0[1-9]|1[012])" )
								.replace( "dddd", "(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)" )
								.replace( "dd", "(0[1-9]|[12][0-9]|3[01])" );

							$input.attr( "pattern", `^${pattern}$` );
						}

						$input.attr( "data-mask", getDateTimeRegex( config.mask ) );

						defaultValue = display.date( defaultValue, config.mask );

						invalidTxt = `Invalid value specified. Please use format ${config.mask}`;

						$div.addClass( "datepicker" );
						break;
					case "date time":
						$div.addClass( "datetimepicker" );

						$div.attr( "data-mdb-format", JSON.stringify( config.mask ) );

						if ( defaultValue == "NOW" ) {
							defaultValue = display.dateTime( defaultValue, config.mask );
						} else {
							defaultValue = display.dateTime( defaultValue, config.mask );
						}

						if ( config.mask ) {
							let pattern = config.mask.date.toLowerCase()
								.replace( /\//g, "\\/" )
								.replace( "yyyy", "\\d{4}" )
								.replace( "mmmm", "(January|February|March|April|May|June|July|August|September|October|November|December)" )
								.replace( "mm", "(0[1-9]|1[012])" )
								.replace( "dddd", "(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)" )
								.replace( "dd", "(0[1-9]|[12][0-9]|3[01])" );

							pattern += ", " + getDateTimeRegex( config.mask.clock ).replace( "^", "" );

							$input
								.attr( "pattern", `^${pattern}$` )
								.attr( "data-mask", JSON.stringify( config.mask ) )
								.attr( "data-mdb-format", JSON.stringify( config.mask ) );

							config.mask = config.mask.date + ", " + config.mask.clock;
						}

						invalidTxt = `Invalid value specified. Please use format ${config.mask}`;

						break;
					case "clock":
						$input.attr( "pattern", getDateTimeRegex( config.mask ) );

						$div.addClass( "timepicker" ).attr( "data-mask", config.mask );
						defaultValue = display.time( defaultValue, config.mask );

						invalidTxt = `Invalid value specified. Please use format ${config.mask}`;

						break;
					case "timer":
						if ( ! config.mask ) {
							config.mask = "hh:mm";
						}

						let inputMask = config.mask.replace( /[hms]/g, "9" );

						$input.attr( {
							"pattern": getDateTimeRegex( config.mask ),
							"data-mdb-custom-validator": config.mask,
							"data-mdb-custom-mask": config.mask,
							"data-mdb-input-mask": inputMask
						} );

						$div.addClass( "timer" ).attr( "data-mask", config.mask );
						defaultValue = display.timer( defaultValue, config.mask );

						break;
				}
				
				$formText.html( config.mask );

				$input.val( defaultValue );
				break;
			case "phone number":
				inputConfig.type = "tel";

				$input = $( "<input>", inputConfig );

				$input.attr( "pattern", "[\\d\\+\\-\\(\\)xX ]*" );
				$input.attr( "title", "Phone number can only contain numbers, +, -, (, ), x or X and spaces" );

				
				$formText.html( "May contain +, -, (), x and numbers" );

				$input.val( defaultValue );
				break;
			case "embedded":
				inputConfig.type = "url";

				$input = $( "<input>", inputConfig );

				$input.val( defaultValue );
				break;
			case "number":
			case "currency":
				inputConfig.type = "number";
				inputConfig.placeholder = "00.00";
				
				$input = $( "<input>", inputConfig );

				if ( ! defaultValue ) {
					defaultValue = "";
				}

				if ( config.mask ) {
					try {
						config.mask = JSON.parse( config.mask );
					} catch ( e ) {}

					if ( "symbol" in config.mask ) {
						$prefix = $( `<span class="input-group-text" 
								id="prefix-${inputConfig.id}">
								${config.mask.symbol}
							</span>` );

						$input.attr( "aria-describedby", `prefix-${inputConfig.id}` );
					}

					labelConfig.class += " group-label";
					
					$outerLabel = $( "<label>", labelConfig )
						.html( unescape ( config.label ) );

					$div.removeClass( "form-outline" ).addClass( "input-group" );
				}
				
				$input.attr( "step", config.type == "currency" ? ".01" : ".00001" );

				if ( config.type !== "currency" ) {
					$helper = $( `<div class="invalid-tooltip">
							Numbers should be 25 digits total, with 5 digits after the decimal
						</div>` );
				}

				$input.val( defaultValue );
				break;
			case "integer":
				inputConfig.type = "number";
				inputConfig.max = "2147483647";
				inputConfig.min = "-2147483647";
				inputConfig.placeholder = "0000";

				$input = $( "<input>", inputConfig );

				if ( ! defaultValue ) {
					defaultValue = "";
				}

				if ( config.type !== "currency" ) {
					$helper = $( `<div class="invalid-tooltip">
							Numbers need to be whole numbers
						</div>` );
				}

				$input.val( defaultValue );
				break;
			case "checkbox":
				inputConfig.type = "checkbox";
				inputConfig.class = "form-check-input";

				$input = $( "<input>", inputConfig );

				if ( defaultValue == "true" ) {
					$input.attr( "checked", "checked" )
				}

				$div
					.removeClass( "form-outline" )
					.addClass( "form-check form-switch" )
					.css( "padding-left", "30px" );

				labelConfig.class = "form-check-label";
				break;
			case "drop down list":
			case "drop down list multi select":
				inputConfig.type = "";
				inputConfig.class = "select";

				$input = $( "<select>", inputConfig );

				if ( config.type == "drop down list multi select" ) {
					$input.attr( "multiple", "multiple" )
				}

				let options = config.options.split(",");

				options = options.map( Function.prototype.call, String.prototype.trim )
				options.sort()

				$div.removeClass( "form-outline" );

				if ( config.type == "drop down list" ) {
					$input.append( $( "<option value='( Blank )'>( Blank )</option>" ) );
				} else {
					defaultValue = JSON.parse( defaultValue );
				}

				options.forEach( ( option, index ) => {
					let $option = $( "<option>", { 
						value: option,
						title: option
					} );

					if ( defaultValue == option ) {
						$option.attr( "selected", "selected" )
					} else if ( 
						config.type == "drop down list multi select" && 
						defaultValue.includes( option ) 
					) {
						$option.attr( "selected", "selected" )
					}

					$option.html( option );

					$input.append( $option );
				} );

				labelConfig.class += " select-label";
				labelConfig.id = inputConfig.id.replace( " ", "-" ) + "-label";
				
				break;
			case "longtext":
				inputConfig.type = "";

				$input = $( "<textarea>", inputConfig )
					.attr( "data-mdb-showcounter", "true" )
					.attr( "maxlength", "2000" );

				$helper = $( "<div>", { class: "form-helper" } );

				labelConfig.class += " select-label";

				$input.val( defaultValue );
				break;
			default:
				return ''
		}

		if ( defaultValue ) {
			$input.attr( "data-default", defaultValue );
		}

		let $label = $( "<label>", labelConfig );

		$label.html( unescape ( config.label ) );

		if ( config.required ) {
			$input.attr( "required", "true" );
		}

		$div.append( $prefix ).append( $input );

		if ( ! $outerLabel ) {
			$div.append( $label );
		}

		$div.append( $helper );

		if ( config.required ) {
			$div.append( `<div class="invalid-tooltip">This field is required</div>` );
		}

		if ( invalidTxt ) {
			$input.parent()
				.append( `<div class="invalid-feedback">${invalidTxt}</div>` );
		}
		
		return $( "<div>", { class: "mb-4" } )
			.append( $outerLabel ).append( $div ).append( $formText );
	},
	stringToHash = ( string ) => {
		var hash = 0;

		string += "";

		if ( string.length == 0 ) return hash;

		for ( let i = 0; i < string.length; i++ ) {
	    	hash = ( ( hash << 5 ) - hash ) + string.charCodeAt( i );
	    	hash = hash & hash;
		}

		return hash;
	},
	sortObj = ( objs, prop, direction ) => {
		return objs.sort( ( a, b ) => {
			let nameA = a[prop].toUpperCase(),
				nameB = b[prop].toUpperCase();

			if ( nameA == nameB ) {
				// names must be equal
				return 0;	
			}
			
			if ( direction == "desc" ) {
				return ( nameA < nameB ) ? -1: 1;
			} else {
				return ( nameA > nameB ) ? -1 : 1;
			}
		});
	},
	getTextNodesIn = ( node, includeWhitespaceNodes ) =>{
	    let textNodes = [], nonWhitespaceMatcher = /\S/;

	    function getTextNodes ( node ) {
	        if ( node.nodeType == 3 ) {
	            if (includeWhitespaceNodes || nonWhitespaceMatcher.test(node.nodeValue)) {
	                textNodes.push(node);
	            }
	        } else {
	            for ( var i = 0, len = node.childNodes.length; i < len; ++i ) {
	                getTextNodes( node.childNodes[i] );
	            }
	        }
	    }

	    getTextNodes( node );
	    return textNodes;
	};

jQuery.fn.outerHTML = function() {
  return jQuery('<div />').append(this.eq(0).clone()).html();
};

function timepickerToggle ( e ) {
	setTimeout( () => { 
		let $btn = $( "<button>", { 
				type: "button", 
				class: "timepicker-button ripple js-today", 
				tabindex: "0" 
			} ).html( "Now" );

		$btn.on( "click", ( e ) => {
			let today = new Date(),
				hours = today.getHours(),
				minutes = String( today.getMinutes() ).padStart( 2, '0' );

			if ( $( ".timepicker-pm" ).length > 0 ) {
				if ( hours > 12 ) {
					hours -= 12;
					$( ".timepicker-pm" ).trigger( "click" );
				} else {
					$( ".timepicker-am" ).trigger( "click" );
				}
			}

			hours = String( hours ).padStart( 2, '0' );

			$( ".timepicker-hour" ).html( hours );
			$( ".timepicker-minute" ).html( minutes );
			$( ".timepicker-submit" ).trigger( "click" );
		} );

		$( ".timepicker-footer" ).append( $btn );
	}, 100);
}

function htmlDecode ( txt ) {
	let $el = $( "<div>", { class: "js-tmp-decode" } ).css( "display", "none" ).html( txt );
	$( "body" ).append( $el );
  
	let val = $( ".js-tmp-decode" ).html();
  
	$( ".js-tmp-decode" ).remove();

	return val;
}

function getCaretCharOffset ( el ) {
    var doc = document,
        win = doc.defaultView || doc.parentWindow,
        sel;
  
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0),
            	preCaretRange = range.cloneRange();

            preCaretRange.selectNodeContents( el );
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            return preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange(),
        	preCaretTextRange = doc.body.createTextRange();

        preCaretTextRange.moveToElementText( el );
        preCaretTextRange.setEndPoint("EndToEnd", textRange);

        return preCaretTextRange.text.length;
    }
  
    return 0;
}

function calculateDate ( val, calc ) {
	for ( const match of calc.matchAll(/([\+-])(\d*)$/g) ) {
	  	if ( match[1] == "+" ) {
	  		val.setDate( val.getDate() + parseInt( match[2] ) );
	  	} else if ( match[1] == "-" ) {
	  		val.setDate( val.getDate() - parseInt( match[2] ) );
	  	}
	}

	return val;
}

function checkDisplayLogicTrigger ( logic, val, column ) {
	let logicVal = logic.value,
		check;
		
	if ( column.type == "date" ) {
		let targetDate;

		val = data.date( val, column.mask ) + "T00:00:00.000Z";
		val = new Date( val );

			if ( logicVal.includes( "NOW" ) ) {
				targetDate = data.date( display.date( "NOW", column.mask ), column.mask );
			targetDate = new Date( targetDate +"T00:00:00.000Z" );
			} else {
				targetDate = logicVal.match(/(\d{4}(-\d{2}){2}T(\d{2}:){2}\d{2}.\d{3}Z)/g)[0];
			targetDate = new Date( targetDate );
			}

		targetDate = calculateDate( targetDate, logicVal );

		val = val.getTime();

		logicVal = targetDate.getTime();
	}

	switch ( logic.operation ) {
		case "=":
			return val == logicVal ? true : false;

			break;
		case "!":
			return val != logicVal ? true : false;

			break;
		case ">":
			return val > logicVal ? true : false;

			break;
		case "<":
			return val < logicVal ? true : false;

			break;
		case "in":
			check = ( new RegExp( `([${val}],|[${val}]$)`, "g" ) ).test(logicVal);
			
			return check;

			break;
		case "not in":
			check = ( new RegExp( `${val}[\\],]`, "g" ) ).test(logicVal);
			
			return check ? false: true;

			break;
		case "contains":
			return logicVal.includes( val );

			break;
	}
}

function getNested( obj, ...args ) {
  return args.reduce( ( obj, level ) => obj && obj[level], obj )
}

let activeDateTimepicker;

$( document )
	.on( "focus", '[data-mdb-input-mask]', function ( e ) {
		let value = $( this ).val();
		
		setTimeout( () => $( this ).val( value ), 1 );
	} )
	.on( 'close.mdb.datetimepicker', '.datetimepicker', ( e ) => {
		$( ".timepicker-modal" ).remove();
	} )
	.on( "click", ".modal", ( e ) => {
		$( ".timepicker-modal" ).remove();
	} )
	.on( "focus", "input, textarea", ( e ) => {
		let secondaryTxt = $( e.target ).parent().next( ".form-text" ).html();

		if ( ! secondaryTxt ) {
			return;
		}

		secondaryTxt = secondaryTxt
			.replace( / /g, " space " )
			.replace( /\//g, " slash " )
			.replace( /\-/g, " dash " )
			.replace( /,/g, " comma " )
			.replace( /:/g, " colon " );

		screenReaderAlert( secondaryTxt );
	} )
	.on( "change", "select", ( e ) => {
		let val = $( e.target ).val(),
			noOfOptions = $( e.target ).find( `option` ).length,
			$option = $( e.target ).find( `option[value="${val}"]` ),
			index = $option.index(),
			txt = $option.val();

		if ( e.target.hasAttribute( "multiple" ) || $option.length < 1 ) {
			return;
		}
		
		if ( $option[0].hasAttribute( "data-mdb-secondary-text" ) ) {
			txt += " " + $option.attr( "data-mdb-secondary-text" );
		}

		if ( txt.match( /[ \/\-,:]/g ) && $( e.target ).attr( "id" ) == "mask") {
			txt = txt.replace( / /g, " space " )
				.replace( /\//g, " slash " )
				.replace( /\-/g, " dash " )
				.replace( /,/g, " comma " )
				.replace( /:/g, " colon " );
		}

		if ( index == noOfOptions - 1 ) {
			txt += " Last option in list";
		} else if ( index == 0 ) {
			txt += " First option in list";
		}

		if ( txt ) {
			screenReaderAlert( txt, 1500 );
		}
	} )
	.on( "open.mdb.datepicker", ".datepicker", function ( e ) {
		setTimeout( () => { 
			let $modal = $( ".datepicker-modal-container" ),
				$btn = $( "<button>", { 
					type: "submit", 
					class: $modal.length < 1 ? "btn btn-primary" : "datepicker-footer-btn"
				} ).html( "Today" );

			$btn.addClass( "js-today" );

			$( ".datepicker-dropdown-container" ).trap();

			if ( $(this).closest( ".form-outline" ).hasClass( "datetimepicker" ) ) {
				$(".datepicker-cell.current" ).trigger( "click" );
			}

			$btn.on( "click", ( e ) => {
				let today = new Date(),
					dd = today.getDate(),
					mm = today.getMonth(), //January is 0!
					yyyy = today.getFullYear(),
					$td = $( "<td>", {
						class: "datepicker-cell js-today",
						"data-mdb-date": `${yyyy}-${mm}-${dd}`
					} ).html( dd );

					$( ".datepicker-table-body tr:last-child" ).append( $td );
					$( ".datepicker-table-body .js-today" ).trigger( "click" );
					$( ".datepicker-ok-btn" ).trigger( "click" )
			} );
			
			if ( $modal.length < 1 ) {
				$btn.css( { position: "absolute", right: "25px", bottom: "25px" } )
				$(".datepicker-main").append( $btn );
			} else {
				$btn.on( "click", timepickerToggle );
				$(".datepicker-footer").append( $btn );
			}
		}, 100);
	} )
	.on( "click", ".timepicker-toggle-button", timepickerToggle )
	.on( "focus", "input, textarea", function ( e ) {
		let $counter = $( this ).parent().find( ".form-counter " );

		if ( $counter.length > 0 ) {
			screenReaderAlert($counter.html().replace( "/", "out of" ) + " characters used")
		}
	} )
	.on( "keyup", "input, textarea", function ( e ) {
		let $counter = $( this ).parent().find( ".form-counter " );

		if ( $counter.length > 0 ) {
			let counters = $counter.html().split( "/" );

			if ( parseInt( counters[0] ) == parseInt( counters[1] ) ) {
				screenReaderAlert( "character limit of " + counters[1] + " reached")
			}
		}
	} )
	.on( "input", "textarea", function () {
        $( this ).css( "height", "auto" );
        $( this ).css( "height", this.scrollHeight );
	} )
	.on( "click", ".timepicker-modal .timepicker-cancel, .timepicker-clear", ( e ) => {
		$( ".timepicker-modal" ).remove();
	} )
	.on( "click", ".timepicker-wrapper", ( e ) => {
		if ( $( e.target ).hasClass( "timepicker-wrapper" ) ) {
			$( ".timepicker-modal" ).remove();
		}
	} )
	.on( "click", ".form-control.select-input", () => {
		let offsetTop = $(".select-options-list").offset().top;
		
		$(".select-options-list").css( {
			"max-height": window.innerHeight - offsetTop + "px"
		} )
	} )
	.on( "blur", ".timer input", function ( e ) {
		let value = $( this ).val();

		setTimeout( () => $( this ).val( value ), 10 );
	} )
	.on( "click", ".datetimepicker-toggle-button", function ( e ) {
		let el = $( this ).parent()[0];
		
		activeDateTimepicker = Datetimepicker.getInstance( el );
	} )
	.on( "click", ".timepicker-current.timepicker-hour", function () {
		if ( activeDateTimepicker._options.timepicker.format24 == false ) {
			return;
		}

		let tipsClass = "timepicker-tips-inner-element",
			timeClass = "timepicker-time-tips-inner",
			hours = {
				"00": "left: 64px; bottom: 124px;",
				"13": "left: 94px; bottom: 115.962px;",
				"14": "left: 115.962px; bottom: 94px;",
				"15": "left: 124px; bottom: 64px;",
				"16": "left: 115.962px; bottom: 34px;",
				"17": "left: 94px; bottom: 12.0385px;",
				"18": "left: 64px; bottom: 4px;",
				"19": "left: 34px; bottom: 12.0385px;",
				"20": "left: 12.0385px; bottom: 34px;",
				"21": "left: 4px; bottom: 64px;",
				"22": "left: 12.0385px; bottom: 94px;",
				"23": "left: 34px; bottom: 115.962px;"
			};

		for ( const [hour, style] of Object.entries( hours ) ) {
			$( ".timepicker-clock-inner" )
				.append( `<span class="${timeClass}" style="${style}">
					<span class="${tipsClass}">${hour}</span>
				</span>` );
		}
	} )
	.on( "open.mdb.select", function () {
		setTimeout( () => {
			$( ".select-dropdown-container .select-option-text" ).each( ( i, el ) => {
				let label = $( el ).html().replace( /\<[^\>]*\>/g, "" );

				$( el ).find( "input" ).attr( "aria-label", label );
			} )
		}, 10 )
	} )
	.on( "close.mdb.select", function ( e ) {
		setTimeout( () => {
			$( e.target ).parent().find( "input" ).focus();
		}, 10 );
	} )
	.on( "keyup", ".select-dropdown-container", ( e ) => {
		if ( e.keyCode == 40 || e.keyCode == 38 ) {
			let $input = $( e.target ).closest( ".select-dropdown-container" )
					.find( ".active input" ),
				label = $input.attr( "aria-label" );

			if ( label ) {
				$input.focus();
			}
		}
	} );

let activePicker;

$( document )
	.on( "click", ".datepicker-cancel-btn", function ( e ) {
		activePicker.el.val( activePicker.val );
	} )
	.on( "click", ".datetimepicker-toggle-button", function ( e ) {
		let $input = $( this ).parent().find( "> input" );

		activePicker = { el: $input, val: $input.val() };
	} );

export { 
	time, initMDBElements, generateInput, stringToHash, display, data, sortObj, 
	getTextNodesIn, htmlDecode, getCaretCharOffset, checkDisplayLogicTrigger,
	getNested
};
