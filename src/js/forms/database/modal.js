import '../../components/panel.js';
import '../../components/spinnerButton.js';

import { columnToInput } from '../../helpers/inputGenerator.js';

import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class Modal {
  constructor ( title, database = -1 ) {
    this.$modal = $( `<dg-panel primary="true">` );
    
    this.modal = this.$modal[0];

    this.database = database;
    this.valid = true;

    $( "body" ).append( this.$modal );
    
    this.modal.header = `<h5 class="modal-title ms-3 py-2 px-0">${title}</h5>`;

    this.modal.body = `<form class="needs-validation" novalidate 
      aria-live="polite"></form>`;

    this.modal.footer = `<dg-spinner-button class="save">
        Save
      </dg-spinner-button>`;

    this.$modal.find( ".card-header" ).addClass( "bg-primary" );

    return this;
  }

  paint () {
    let $input = columnToInput( { 
        id: "name",
        type: "text", 
        columnName: "Name",
        mandatory: true
      } );

    this.$modal.find( "form" ).append( $input );

    return this;
  }

  close () {
    this.$modal.find( "dg-spinner-button" )[0].finish();

    this.$modal.find( ".btn-close" ).trigger( "click" );
  }


  ready () {
    this.$modal[0].ready();

    return this;
  }

  submit () {
    let $form = this.$modal.find( "form" );

    this.valid = true;
    this.name = $form.find( "#name" )[0].value;

    $form.addClass('was-validated');

    if ( ! $form[0].checkValidity() ) {
      this.valid = false;
      this.$modal.find( "dg-spinner-button" )[0].finish();

      $form.find( ":invalid" ).eq(0).focus();
    }
  }
}