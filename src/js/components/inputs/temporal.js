import Datepicker from '../mdb/pro/datepicker';

import DGInput from './input.js';

export default class DGTemporal extends DGInput {
  constructor() {
    super();
  }

  static getTimePattern ( mask ) {
    let regex = {
        h: "([0-1]?\\d|2[0-3])",
        ha: "(0?\\d|1[0-2])",
        ms: "([0-5]\\d)",
        a: "([AaPp][Mm])"
      },
      map = {
        "hh:mm": `\\d\\d:${regex.ms}`,
        "hh:mm:ss": `\\d\\d:${regex.ms}:${regex.ms}`,
        "hh:mm a": `${regex.ha}:${regex.ms} ${regex.a}`,
        "hh:mm:ss a": `${regex.ha}:${regex.ms}:${regex.ms} ${regex.a}`
      }

    return map[ mask ];
  }

  static getDatePattern ( mask ) {
    return mask.toLowerCase()
      .replace( /\//g, "\\/" )
      .replace( "yyyy", "\\d{4}" )
      .replace( "mmmm", "(January|February|March|April|May|June|July|August|September|October|November|December)" )
      .replace( "mm", "(0[1-9]|1[012])" )
      .replace( "dddd", "(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)" )
      .replace( "dd", "(0[1-9]|[12][0-9]|3[01])" );
  }

  static getTimeValue ( value, mask ) {
    let date = new Date(), 
      hours = date.getHours(), 
      minutes = date.getMinutes(), 
      amPm = "AM";

    if ( ! mask ) mask = "hh:mm a"

    if ( value !== "NOW" ) {
      date = value.includes( "T" ) ? value.split( "T" )[1].split( ":" ) : value.split( ":" );
      hours = parseInt( date[0] );
      minutes = parseInt( date[1] );
    }

    if ( mask.includes( "a" ) && hours > 12) {
      hours -= 12;

      amPm = "PM";
    }

    return mask
      .replace( "hh", String( hours ).padStart(2, '0') )
      .replace( "mm", String( minutes ).padStart(2, '0') )
      .replace( "a", amPm );
  }

  static getDateValue ( value, mask ) {
    value = value.replace( /T.*/g, "T00:00:00.000Z" );

    if ( ! mask ) mask = "yyyy mmmm dd"

    let date = ( value !== "NOW" ) ? new Date( value ) : new Date(), 
      year = date.getFullYear(),
      month = date.getMonth() + 1,
      day = date.getDate();

    return mask
      .replace( "yyyy", year )
      .replace( "mmmm", DGTemporal.months[ month - 1 ] )
      .replace( "mm", String( month ).padStart(2, '0') )
      .replace( "dddd", DGTemporal.days[ date.getDay() ] )
      .replace( "dd", String( day ).padStart(2, '0') );
  }

  static getDateDataValue ( value, mask ) {
    if ( ! value ) {
      return '';
    }

    if ( mask.includes( "dddd" ) ) {
      value = value.replace( /^[A-z]*, /, "" );
    }

    value = value.split( ", " );

    mask = mask.replace( "dddd, ", "");
    
    let date = new Date( value[0] ),
      year = date.getFullYear(),
      day = date.getDate(),
      month = date.getMonth() + 1,
      regex = /[\.\-\\/ ]/g,
      dateShards = value[0].split( regex );
      
    let maskShards = mask.split( regex );

    $.each( maskShards, ( index, mask ) => {      
      if ( mask.includes( "d" ) ) {
        day = dateShards[ index ];

        if ( DGTemporal.days.indexOf( day ) >= 0 ) {
          day = DGTemporal.days.indexOf( day ) + 1;
        }

        day = String( day ).padStart(2, '0');
      } else if ( mask.includes( "m" ) ) {
        month = dateShards[ index ];

        if ( DGTemporal.months.indexOf( month ) >= 0 ) {
          month = DGTemporal.months.indexOf( month ) + 1;
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
  }

  static getTimeDataValue ( time ) {
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
  }

  get dateTimeRegex () {
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

    return map[ this.mask ];
  }

  get mask () { return $( this ).attr( "mask" ); }

  set mask ( mask ) {
    $( this ).find( '.form-outline' )
      .attr( "data-mdb-format", mask )
      .attr( "data-mask", mask );
    
    $( this ).find( '.input' )
      .attr( "data-mask", mask )
      .attr( "pattern", this.dateTimeRegex );

     $( this ).removeClass( "mb-4" ).addClass( "mb-2" );

    $( this ).find( ".form-text" ).html( mask );

    $( this ).find( ".invalid-feedback" )
      .html( `Invalid value specified. Please use format ${mask}` );
  }
}

DGTemporal.months = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December",
  ];

DGTemporal.days = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ];