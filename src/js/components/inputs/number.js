import DGInput from './input.js';

export default class DGNumber extends DGInput {
  constructor() {
    super();
    
    this.html = `<div class="form-outline">
        <input type="number" class="form-control" step=".00001" 
          placeholder="00.00000"/>
        <label class="form-label"></label>
        <div class="invalid-tooltip">
          Numbers should be 25 digits total, with 5 digits after the decimal
        </div>
      </div>`;
  }

  get value () {
    let value = $( this ).find( "select, input" ).val();

    if ( ! value ) value = 0;

    return value;
  }

  set value ( value ) {
    if ( value == 0 ) return;
    
    super.value = value;

    $( this ).find( ".display-wrapper" ).addClass( "text-right" )
      .html( DGNumber.getDisplayValue( value ) );
  }
  
  static getDisplayValue ( value, seperator = "none" ) {
    try {
      value = JSON.parse( value );

      if ( value.link ) {
        return DGInteger.getThroughLink( value.link, value.value );
      }

      if ( value?.value ) {
        value = value.value;
      }
    } catch ( e ) {}
    
    if ( ! value ) return "";

    if ( typeof value !== "string" && typeof value !== "number" ) {
      return "";
    }

    value = parseFloat( value ).toFixed(2);

    if ( seperator !== "none" ) {
      value = new Intl.NumberFormat().format( value );
    }

    if ( seperator == "space" ) {
      value = value.replace( /,/g, " " );
    }

    if ( (/\.\d$/).test(value) ) {
      value += "0";
    }

    if ( ! (/\.\d\d$/).test(value) ) {
      value += ".00";
    }

    return value;
  }
}

window.customElements.define('dg-number', DGNumber);