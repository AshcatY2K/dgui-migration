import DGInput from './input.js';

export default class DGHyperlink extends DGInput {
  constructor() {
    super();

    this.html = `<div class="form-outline">
        <input type="url" class="form-control" data-mdb-showcounter="true"
          maxlength="250"/>
        <label class="form-label"></label>
        <div class="invalid-feedback"></div>
        <div class="form-helper"></div>
      </div>`;
  }

  get value () { return $( this ).find( "select, input" ).val(); }

  set value ( value ) {
    super.value = value;

    $( this ).find( ".display-wrapper" ).html( DGHyperlink.getDisplayValue( value ) );
  }
  
  static getDisplayValue ( value ) {
    if ( typeof value !== "string" || ! value ) return;

    return `<a href='${value}' 
      target="_blank" role="button" aria-label='${value} view'>
      <i class="fas fa-external-link-alt"></i>
    </a>`;
  }
}

window.customElements.define('dg-hyperlink', DGHyperlink);