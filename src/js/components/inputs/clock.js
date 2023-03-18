import Timepicker from '../mdb/pro/timepicker';

import DGTemporal from './temporal.js';

export default class DGClock extends DGTemporal {
  constructor() {
    super();

    this.html = `<div class="form-outline timepicker">
        <input type="text" class="form-control">
        <label class="form-label"></label>
        <div class="invalid-feedback"></div>
      </div>
      <div class="form-text"></div>`;
  }

  set value ( value ) {
    super.value = value;
    
    let $timepicker = $( this ).find( '.timepicker' );

    if ( 
      ! this.mask ||
      ! value ||
      $timepicker.length < 1 ||
      typeof value !== "string" || 
      value.includes( "NaN" ) ||
      value === "1970-01-01T00:00:00.000Z" 
    ) {
      $( this ).find( 'input' ).val( "" );

      return "";
    }

    let inputValue = DGClock.getDisplayValue( value, this.mask );
    
    $( this ).find( 'input' ).val( inputValue );
    
    $( this ).find( ".display-wrapper" ).html( inputValue );
  }

  static getDisplayValue ( value, mask ) {
    if ( 
      ! mask || 
      ! value ||
      typeof value !== "string" || 
      value === "1970-01-01T00:00:00.000Z" 
    ) {
      return "";
    }

    return this.getTimeValue( value, mask );
  }

  set mask ( mask ) { 
    let $timepicker = $( this ).find( '.timepicker' );

    if ( $timepicker.length < 1 ) {
      return "";
    }

    mask = mask.replace( /"/g, "" );

    super.mask = mask;

    let pattern = DGTemporal.getTimePattern( mask );

    $( this ).find( 'input' ).attr( "pattern", `^${pattern}$` );

    if ( this?.timerInstance ) {
      this?.timerInstance.dispose();
    }
    
    this.timerInstance = new Timepicker( $timepicker[0], {
      format12: mask == "hh:mm a" ? true : false,
      format24: mask == "hh:mm" ? true : false
    } );
    
    $( this ).find( ".timepicker-toggle-button" )
      .attr( "aria-label", "Time picker" );
  }

  get value () {
    let value = $( this ).find( "input" ).val();

    if ( value ) {
      value = "1970-01-01T" + DGTemporal.getTimeDataValue( value ) + "Z";
    } else {
      value = "";
    }

    return value;
  }

  get mask () { return $( this ).attr( "mask" ) }
}

window.customElements.define('dg-clock', DGClock);