import DGInput from './input.js';

export default class DGCheckbox extends DGInput {
  constructor() {
    super();

    this.html = `<div class="form-check form-switch" style="padding-left: 30px">
        <input type="checkbox" class="form-check-input"/>
        <label class="form-check-label"></label>
      </div>`;
  }

  get value () { 
    return $( this ).find( "input" ).is( ":checked" ) ? 1 : 0; 
  }

  set value ( value ) {
    if ( value && value !== "false" && value !== "0" ) {
      $( this ).find( "input" ).prop( "checked", true );   
    } else {
      $( this ).find( "input" ).prop( "checked", false );   
    }
  
    let $i = DGCheckbox.getDisplayValue( value );

    $( this ).find( ".display-wrapper" ).html( "" ).append( $i );

    super.value = value;
  }

  static getDisplayValue ( value ) {
    return $( `<i>`, {
        class: value == "false" ? "fas fa-times" : "fas fa-check"
      } );
  }
}

window.customElements.define('dg-checkbox', DGCheckbox);