import Datepicker from '../mdb/pro/datepicker';

import DGTemporal from './temporal.js';

export default class DGDate extends DGTemporal {
  constructor() {
    super();

    this.html = `<div class="form-outline datepicker">
        <input type="text" class="form-control">
        <label class="form-label"></label>
        <div class="invalid-feedback"></div>
      </div>
      <div class="form-text"></div>`;
  }

  get mask () { return $( this ).attr( "mask" ) }

  get value () {
    let value = $( this ).find( "input" ).val();

    if ( value ) {
      value = DGTemporal.getDateDataValue( value, this.mask ) + "T00:00:00.000Z";
    } else {
      value = "";
    }

    return value;
  }

  set mask ( mask ) {
    let $datepicker = $( this ).find( '.datepicker' );

    if ( $datepicker.length < 1 ) {
      return "";
    }

    super.mask = mask;

    let pattern = DGTemporal.getDatePattern( mask );

    $( this ).find( 'input' ).attr( "pattern", `^${pattern}$` );

    if ( this?.dateInstance ) {
      this?.dateInstance.dispose();
    }

    this.dateInstance = new Datepicker( $datepicker[0], { 
      format: mask, 
      inline: true 
    } );
    
    $( this ).find( ".datepicker-toggle-button" )
      .attr( "aria-label", "Date picker" );

    this.dateInstance.update();
  }

  set value ( value ) {
    let $datepicker = $( this ).find( '.datepicker' );
    
    if ( 
      ! this.mask ||
      ! value ||
      $datepicker.length < 1 ||
      typeof value !== "string" || 
      value.includes( "NaN" ) ||
      value === "1970-01-01T00:00:00.000Z" || 
      value === "1900-01-01T00:00:00.000Z" || 
      value === "1900-01-30T00:00:00.000Z" 
    ) {
      return "";
    }

    super.value = value;

    let inputValue = DGDate.getDisplayValue( value, this.mask );

    $( this ).find( 'input' ).val( inputValue.replaceAll( '"', "" ) );
    
    $( this ).find( ".display-wrapper" ).html( inputValue );
  }
  
  static getDisplayValue ( value, mask ) {
    if ( 
      ! mask ||
      ! value ||
      typeof value !== "string" || 
      value.includes( "NaN" ) ||
      value === "1970-01-01T00:00:00.000Z" || 
      value === "1900-01-01T00:00:00.000Z" || 
      value === "1900-01-30T00:00:00.000Z"
    ) {
      return "";
    }

    return this.getDateValue( value, mask );
  }
}

window.customElements.define('dg-date', DGDate);