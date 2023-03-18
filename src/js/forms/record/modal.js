import '../../components/panel.js';
import '../../components/spinnerButton.js';

import { columnToInput } from '../../helpers/inputGenerator.js';
import { jsonToForm } from '../../helpers/formBuilder.js';

import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class Modal {
  constructor ( database, table, columns, form = "", secondary = false ) {
    let position = secondary ? "secondary" : "primary";
    
    this.$modal = $( `<dg-panel ${position}="true">` );
    this.modal = this.$modal[0];

    this.database = database;
    this.table = table;
    this.columns = JSON.parse(JSON.stringify(columns));
    this.form = form;
    this.valid = true;

    $( "body" ).append( this.$modal );

    this.$modal[0].header = `<div class="tab-container" style="position: relative;">
        <ul class="nav nav-tabs -primary" id="record-card-tabs" role="tablist">
        </ul>
      </div>
      <div class="tab-container -sub"></div>`;

    this.$modal[0].body = `<div class="tab-content">
        <div class="tab-pane active" id="details" role="tabpanel" 
          aria-labelledby="details-tab">
          <form class="needs-validation" novalidate aria-live="polite"></form>
        </div>
      </div>`;

    return this;
  }

  paint () {
    let $form = this.$modal.find( "#details form" );
    
    if ( this.form ) {
      $form.append( jsonToForm( this.form, this.columns, this.database ) );
    } else {
      for ( const column of this.columns ) {
        let $input = columnToInput( column, this.database );

        $form.append( $input );
      }
    }

    $form.find( "[label='id']" ).hide();

    $form.find( ".custom-input" ).trigger( "change" );

    return this;
  }

  formToJson () {
    let $form = this.$modal.find( "#details form" ),
      config = {},
      lookup = {};
    
    $form.find( ".custom-input" ).each( ( i, el ) => {
      let column = this.columns.filter( column => column.id == el.id )[0];

      if ( column.columnName == "id" ) return;

      config[ column.columnName ] = el.value;

      if ( ! $( el ).is( ":visible" ) && this.record ) {
        config[ column.columnName ] = this.record[column.columnName];
      }

      if ( column.type == "from table" ) {
        lookup[ column.columnName + "|Lookup" ] = el.lookupValue;
      }
    } );
    
    this.lookup = lookup;

    return config;
  }

  close () {
    this.$modal.find( "dg-spinner-button" )[0].finish();

    this.$modal.find( ".btn-close" ).trigger( "click" );
  }

  ready () {
    this.$modal[0].ready();

    this.$modal.find( ".custom-input:not([disabled]) input" ).eq(0)
      .trigger( "focus" );

    return this;
  }

  submit () {
    let $form = this.$modal.find( "#details form" );

    this.valid = true;

    this.config = this.formToJson();

    $form.addClass('was-validated');

    if ( ! $form[0].checkValidity() ) {
      this.valid = false;

      $form.find( ":invalid" ).eq(0).focus();
    }
  }
}