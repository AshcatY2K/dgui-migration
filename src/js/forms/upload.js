import * as util from '/src/js/util.js';

import Dialog from '/src/js/components/dialog.js';
import { upload, checkUploadHeadings } from '/src/js/controllers/table.js';

import '/src/js/components/panel.js';
import '/src/js/components/spinnerButton.js';

import { columnToInput } from '/src/js/helpers/inputGenerator.js';

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

export default class Upload {
  constructor ( database, table ) {
    this.$modal = $( '<dg-panel>' );
    this.modal = this.$modal[0];

    this.database = database;
    this.table = table;
    this.valid = true;

    if ( $( ".floating-panel" ).length > 0 ) {
      $( ".floating-panel" ).after( this.$modal );
    } else {
      $( "body" ).append( this.$modal );
    }

    this.modal.header = `<h5 class="modal-title ms-3">Upload</h5>`;

    this.$modal[0].body = `<form></form>`;

    this.modal.footer = `<dg-spinner-button class="save">
        Save
      </dg-spinner-button>`;

    this.paint().ready();

    return new Promise ( resolve => {
      this.$modal
        .on( "click", ".save", () => this.submit( resolve ) )
        .on( "click", ".btn-close", () => resolve( false ) );
    } );
  }

  paint () {
    let $form = this.$modal.find( "form" ),
      $seperator = columnToInput( {
          "id": "separator",
          "columnName": "Separator",
          "type": "drop down list",
          "dropdownValues": `[
            {
              "label": "Comma",
              "value": "comma"
            }, {
              "label": "Semicolon",
              "value": "semicolon"
            }, {
              "label": "Tab",
              "value": "tab"
            }
          ]`,
          "mandatory": true
        } ),
      $file = columnToInput( {
          "id": "file",
          "columnName": "File",
          "type": "file",
          "mandatory": true,
          "formats": ".csv"
        } );

    $form.append( $file ).append( $seperator );

    $seperator[0].value = "comma";

    $form.find( ".custom-input" ).trigger( "change" );

    return this;
  }

  formToJson () {
    let $form = this.$modal.find( "form" ),
      config = {};
    
    $form.find( ".custom-input:visible" ).each( ( i, el ) => {
      let id = $( el ).attr( "id" );

      config[ id ] = el.value;
    } );

    return config;
  }

  close () {
    this.$modal.find( "dg-spinner-button" )[0].finish();

    this.$modal.find( ".btn-close" ).trigger( "click" );
  }

  ready () {
    this.$modal[0].ready();

    return this;
  }

  submit ( resolve ) {
    let $form = this.$modal.find( "form" );

    this.config = this.formToJson();

    $form.addClass('was-validated');

    if ( ! $form[0].checkValidity() ) {
      return;
    }

    let fd = new FormData(),
      uploadFile = () => {
        upload( this.database, this.table, fd )
          .then( ( res ) => {
            toastSuccess( "Upload successfull", "Your file has been uploaded" );
            resolve( true );
            this.close();
          } )
          .catch( ( err ) => toastError( "Error", err ) );
      };

    fd.append( 'file', this.config.file[0] );
    fd.append( 'seperator', this.config.separator );

    checkUploadHeadings( this.database, this.table, fd )
      .then( uploadFile )
      .catch( err => {
        err = JSON.parse( err );

        const dialog = new Dialog();

        let msg = '';

        this.$modal.find( "dg-spinner-button" )[0].finish();

        if ( err?.errors?.headers ) {
          msg = `The following headers are not part of the table 
            ( ` + err.errors.headers.join( ", " ) +` ).<br><br> 
            They will not be uploaded. <br><br> 
            Do you want to continue?`;
        } else {
          msg = `${err.errors} <br><br> Do you want to continue?`;
        }

        dialog.confirm( msg ).then( res => { if( res ) uploadFile(); } );
      } );
  }
}