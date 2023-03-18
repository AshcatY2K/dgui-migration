import DGInput from './input.js';

export default class DGEmbedded extends DGInput {
  constructor() {
    super();

    this.html = `<div class="form-outline">
        <input type="url" class="form-control" data-mdb-showcounter="true"/>
        <label class="form-label"></label>
        <div class="invalid-feedback">Invalid URL specified</div>
        <div class="form-helper"></div>
      </div>`;
  }

  get value () { return $( this ).find( "select, input" ).val(); }

  set value ( value ) {
    super.value = value;

    $( this ).find( ".display-wrapper" ).html( DGEmbedded.getDisplayValue( value ) );
  }
  
  static getDisplayValue ( value ) {
    if ( typeof value !== "string" || ! value ) return "";
    
    return `<button data-url='${value}'
        class='embedded btn btn-primary btn-sm' data-mdb-toggle="modal"
        role="button" aria-label='${value} view'
        data-mdb-target="#embeddedModal">
        View
      </button>`;
  }
}

window.customElements.define('dg-embedded', DGEmbedded);