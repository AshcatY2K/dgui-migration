import DGTemporal from './temporal.js';
import Inputmask from '../inputmask/inputmask';

export default class DGTimer extends DGTemporal {
  constructor() {
    super();

    this.html = `<div class="form-outline timer">
        <input type="text" class="form-control"/>
        <label class="form-label"></label>
        <div class="invalid-feedback"></div>
        <div class="form-helper"></div>
      </div>
      <div class="form-text"></div>`;
  }

  get value () {
    let value = $( this ).find( "input" ).val();

    if ( ! value ) {
      value = "00:00:00"
    }

    if ( ! value ) {
      return '';
    }

    value = value.split( ":" );

    let hours = parseInt( value[0] ),
      minutes = parseInt( value[1] ) + ( hours * 60 ),
      seconds = value[2] ? parseInt( value[2] ) : 0,
      milliseconds = ( minutes * 60 + seconds ) * 1000;

    return milliseconds;
  }

  set value ( value ) { 
    super.value = value;
    this._value = value;

    if ( this._mask ) {
      this.init( value, this._mask );
    }
  }

  set mask ( mask ) {
    mask = mask.replace( /['"]/g, "" );

    this._mask = mask;

    super.mask = mask;

    let pattern = DGTemporal.getTimePattern( mask );

    $( this ).find( 'input' ).attr( "pattern", `^${pattern}$` )
      .attr( "data-mdb-custom-validator", mask )
      .attr( "data-mdb-custom-mask", mask )
      .attr( "data-mdb-input-mask", mask.replace( /[hms]/g, "9" ) )
      .attr( "placeholder", mask.replace( /[hms]/g, "9" ) );

    this.initInputMask();

    if ( this._value ) {
      this.init( this._value, mask );
    }
  }
  
  static getDisplayValue ( value, mask ) {
    if ( ( ! value && value !== 0 ) || typeof value == "boolean" ) {
      return "";
    }

    if ( ! mask ) {
      mask = "hh:mm";
    }

    mask = mask.replace( /['"]/g, "" );

    value = Math.abs( value );

    let isNegative = value < 0 ? true : false,
      hours = Math.floor( value / 3600000 ),
      minutes = Math.floor( value % 3600000 / 60000 ),
      seconds = Math.floor( value % 3600000 % 60000 / 1000);

    hours = String( hours ).padStart( 2, '0' );
    minutes = String( minutes ).padStart( 2, '0' );
    seconds = String( seconds ).padStart( 2, '0' );
    
    return mask.replace( "hh", isNegative ? "-" + hours : hours )
      .replace( "mm", minutes )
      .replace( "ss", seconds );
  }

  init ( value, mask ) {
    if ( ! value && value !== 0 ) {
      return "";
    }

    value = DGTimer.getDisplayValue( value, mask );

    $( this ).find( "input" ).val( value );
  }
}

window.customElements.define('dg-input-timer', DGTimer);
