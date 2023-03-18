import DGInput from './input.js';

import FileUpload from '../file-upload/file-upload.js';

export default class DGFile extends DGInput {
  constructor() {
    super();

    this.html = `<div class="file-upload-wrapper">
          <input type="file"
            data-mdb-file-upload="fileUpload"
            class="file-upload-input"
            data-mdb-main-error="Ooops, error here"/>
          <div class="invalid-feedback"></div>
        </div>`;
  }
    
  ready () {
    let $input = $( this ).find( 'input' );

    this.fileInputInstance = new FileUpload( $input[0] );

    super.ready();
  }

  get value () {
    let files = $( this ).find( "input" )[0].files;
    
    return files ? files : [];
  }

  get formats () { return super._formats; }
  get multiple () { return super._multiple; }

  set value ( value ) { super.value = value; }
  set formats ( formats ) { 
    super._formats = formats;

    if ( this.fileInputInstance ) {
      this.fileInputInstance.update( { "acceptedExtensions": formats } );
    }
  }

  set multiple ( multiple ) {
    super._multiple = multiple;

    if ( this.fileInputInstance ) {
      this.fileInputInstance.update( { "multiple": true } );
    }
  }

  static getDisplayValue ( value ) {
    return super.getDisplayValue( value );
  }
}

window.customElements.define('dg-file-input', DGFile);