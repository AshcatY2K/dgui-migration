import Datetimepicker from '../mdb/pro/date-time-picker';

import DGTemporal from './temporal.js';

export default class DGDateTime extends DGTemporal {
  constructor() {
    super();

    this.html = `<div class="form-outline datetimepicker">
        <input type="text" class="form-control">
        <label class="form-label"></label>
        <div class="invalid-feedback"></div>
      </div>
      <div class="form-text"></div>`;
  }

  init ( datemask, timemask ) {
    let $dateTimePicker = $( this ).find( '.datetimepicker' );
    
    if ( $dateTimePicker.length < 1  ) {
      return "";
    }

    let pattern = DGTemporal.getDatePattern( this.datemask ),
      mask = this.datemask + ", " + this.timemask,
      config = {
        datepicker: { format: this.datemask },
        timepicker: {
          format12: this.timemask == "hh:mm a" ? true : false,
          format24: this.timemask == "hh:mm" ? true : false
        }
      };

    pattern += ", " + DGTemporal.getTimePattern( this.timemask ).replace( "^", "" );

    $( this ).find( ".form-text" ).html( mask );

    $( this ).find( ".invalid-feedback" )
      .html( `Invalid value specified. Please use format ${mask}` );

    $( this ).find( 'input' )
      .attr( "data-mdb-format", `{"date":"${this.datemask}","clock":"${this.timemask}"}` )
      .attr( "data-mask", `{"date":"${this.datemask}","clock":"${this.timemask}"}` )
      .attr( "pattern",  `^${pattern}$`);

    if ( this?.dateTimeInstance ) {
      this?.dateTimeInstance.dispose();
    }

    this.dateTimeInstance = new Datetimepicker( $dateTimePicker[0], config );

    $( this ).find( ".datetimepicker-toggle-button" )
      .attr( "aria-label", "Date and time pickerr" );
  }

  get datemask () { return $( this ).attr( "datemask" ); }
  get timemask () { return $( this ).attr( "timemask" ); }

  get value () {
    let value = $( this ).find( "input" ).val();

    if ( ! value ) {
      return '';
    }
    
    if ( this.datemask.includes( "dddd" ) ) {
      value = value.replace( /^[A-z]*, /, "" );
    }

    value = value.split( ", " );

    let date = DGTemporal.getDateDataValue ( value[0], this.datemask ),
      time = DGTemporal.getTimeDataValue ( value[1] );

    return `${date}T${time}Z`;
  }

  set datemask ( mask ) {
    if ( mask && this.timemask ) {
      this.init();
    }
  }

  set timemask ( mask ) {
    if ( this.datemask && mask ) {
      this.init();
    }
  }

  set value ( value ) {
    let $dateTimePicker = $( this ).find( '.datetimepicker' );

    if ( 
      $dateTimePicker.length < 1 ||
      typeof value !== "string" || 
      ! value || 
      value.includes( "NaN" ) ||
      value === "1970-01-01T00:00:00.000Z" || 
      value === "1900-01-01T00:00:00.000Z" 
    ) {
      return "";
    }

    super.value = value;

    let config = {
        defaultDate: DGTemporal.getDateValue( value, this.datemask ),
        defaultTime: DGTemporal.getTimeValue( value, this.timemask )
      },
      displayValue = DGDateTime.getDisplayValue( value, this.datemask, this.timemask ) ;

    $( this ).find( "input" ).val( displayValue );
    
    $( this ).find( ".display-wrapper" ).html( displayValue );

    if ( this.dateTimeInstance ) {
      this.dateTimeInstance._datepicker._input.value = config.defaultDate;
      this.dateTimeInstance._timepicker.input.value = config.defaultTime;
    }
  }  

  static getDisplayValue ( value, datemask, timemask ) {
    if ( 
      ! value || 
      typeof value !== "string" || 
      value.includes( "NaN" ) ||
      value === "1970-01-01T00:00:00.000Z" ||
      value === "1900-01-01T00:00:00.000Z"
    ) {
      return "";
    }
    
    let config = {
        defaultDate: DGTemporal.getDateValue( value, datemask ),
        defaultTime: DGTemporal.getTimeValue( value, timemask )
      };

    return `${config.defaultDate}, ${config.defaultTime}`;
  }
}

window.customElements.define('dg-date-time', DGDateTime);