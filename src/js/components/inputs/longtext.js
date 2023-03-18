import DGInput from './input.js';

export default class DGLongtext extends DGInput {
  constructor() {
    super();

    this.html = `<span class="longtext-facade"></span>
      <div class="form-outline">
        <textarea type="text" class="form-control" data-mdb-showcounter="true"
          rows="4" maxlength="2000"></textarea>
        <label class="form-label"></label>
        <div class="invalid-feedback"></div>
        <div class="form-helper"></div>
      </div>
      <div class="form-text"></div>`;
  }

  get value () {
    return $( this ).find( "textarea" ).val();
  }

  set value ( value ) {
    if ( ! value || typeof value !== "string" ) {
      return;
    }
    
    super.value = value;

    $( this ).find( " textarea" ).closest( ".longtext-facade" )
      .html( DGLongtext.getDisplayValue( value ) );
  }
  
  static getDisplayValue ( value ) {
    if ( ! value || typeof value !== "string" ) {
      return "";
    }
    
    return value.replace( /((?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))/gmi, "<a href='$1' target='_blank'>$1</a>" )
      .replace( /\r\n/gm, "<br>" )
      .replace( /\n/gm, "<br>" )
      .replace( /\r/gm, "<br>" )
      .replace( /^ /gm, "&nbsp;" )
      .replace( /  /gm, "&nbsp;&nbsp;" );
  }
}

window.customElements.define('dg-longtext', DGLongtext);