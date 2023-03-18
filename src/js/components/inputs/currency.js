import DGInput from './input.js';

export default class DGCurrency extends DGInput {
  constructor() {
    super();

    this.html = `<label class="form-label group-label"></label>
      <div class="input-group">
        <span class="input-group-text"></span>
        <input type="number" class="form-control" placeholder="00.00" step=".01"
           lang="en-US">
        <div class="invalid-feedback"></div>
      </div>`;
  }

  get symbol () { return $( this ).attr( "symbol" ); }
  get id () { return $( this ).attr( "id" ); }
  get value () { 
    let value = $( this ).find( "select, input" ).val();

    if ( ! value ) value = 0;

    return value;
  }

  set symbol ( symbol ) { $( this ).find( ".input-group-text" ).html( symbol ); }

  set id ( value ) {
    super.id = value;

    $( this ).find( ".input-group-text" ).attr( "id", `symbol-${value}` );
    $( this ).find( "input" ).attr( "aria-describedby", `symbol-${value}` );
  }

  set value ( value ) {
    if ( value == 0 ) return;

    super.value = value;

    value = DGCurrency.getDisplayValue( value, this.symbol, this.seperator );

    $( this ).find( ".display-wrapper" ).addClass( "text-right" ).html( value );
  }

  static getDisplayValue ( value, symbol, seperator ) {
    value = parseFloat( value ).toFixed(2);
    
    if ( isNaN( value ) ) return;
    
    if ( seperator !== "none" ) {
      value = new Intl.NumberFormat().format( value );
    }

    if ( seperator == "space" ) {
      value = value.replace( /,/g, " " );
    }

    if ( symbol ) {
      value = symbol + " " + value;
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

window.customElements.define('dg-currency', DGCurrency);
