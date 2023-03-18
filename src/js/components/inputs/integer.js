import DGInput from './input.js';

export default class DGInteger extends DGInput {
  constructor() {
    super();

    this.html = `<div class="form-outline">
        <input type="number" class="form-control" max="2147483647"
          min="-2147483647" placeholder="0000"/>
        <label class="form-label"></label>
        <div class="invalid-tooltip">
          Numbers need to be whole numbers
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
      .html( DGInteger.getDisplayValue( value, this.seperator ) );
  }
  
  static getDisplayValue ( value, seperator = "none" ) {
    try {
      let val = JSON.parse( value );

      if ( val.link ) {
        return DGInteger.getThroughLink( val.link, val.value );
      }

      if ( val.value ) value = val.value;
    } catch ( e ) {}

    if ( ! value ) return "";
    
    if ( typeof value !== "string" && typeof value !== "number" ) {
      return "";
    }

    value = parseInt( value, 10 );
    
    if ( seperator !== "none" ) {
      value = new Intl.NumberFormat().format( value );
    }

    if ( seperator == "space" ) {
      value = value.replace( /,/g, " " );
    }

    return value;
  }
}

window.customElements.define('dg-integer', DGInteger);