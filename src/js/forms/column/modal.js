import form from './form.json' assert { type: 'json' };

import '../../components/panel.js';
import '../../components/spinnerButton.js';
import './calculatedInput.js';

import * as table from '../../controllers/table.js';

import { columnToInput } from '../../helpers/inputGenerator.js';

import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class Modal {
  constructor ( title, database, table, secondary = false ) {
    let position = secondary ? "secondary" : "primary";

    this.$modal = $( `<dg-panel ${position}="true">` );
    this.modal = this.$modal[0];

    this.database = database;
    this.table = table;
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
    let $form = this.$modal.find( "form" ),
      $calculatedInput;

    for ( const input of form ) {
      if ( typeof input?.dropdownValues == "object" ) {
        input.dropdownValues = JSON.stringify( input.dropdownValues );
      }

      if ( typeof input?.displayLogic == "object" ) {
        input.displayLogic = JSON.stringify( input.displayLogic );
      }

      let $input = columnToInput(input);

      $form.append( $input );

      if ( input["default value"] ) {
        $input[0].value = input["default value"];
      }
    }

    $calculatedInput = $( "<dg-calculated-input>", {
        class: "container p-0 m-0",
        database: this.database,
        table: this.table,
        type: this.$modal.find( "#type" )[0].value
      } ).hide();

    $form.find( "#is-calculated" ).after( $calculatedInput );

    $form.find( ".custom-input" ).trigger( "change" );

    return this;
  }

  close () {
    this.$modal.find( "dg-spinner-button" )[0].finish();

    this.$modal.find( ".btn-close" ).trigger( "click" );
  }

  formToJson () {
    let $form = this.$modal.find( "form" ),
      config = {},
      type = $form.find( "#type" ).val();
    
    $form.find( ".custom-input:visible" ).each( ( i, el ) => {
      config[ el.id ] = el.value;
    } );

    switch ( type ) {
      case "drop down list":
        if ( $form.find( "#input-is-multi-select" ).is( ":checked" ) ) {
          config.type = "drop down list multi select";
        }

        break;
      case "text":
        config.mask = {};

        if ( config['min-char'] ) {
          config.mask.minChar = config['min-char'];
        }

        if ( config['max-char'] ) {
          config.mask.maxChar = config['max-char'];
        }

        if ( config['input-mask'] ) {
          config.mask.format = config['input-mask'];
        }

        break;
      case "date":
        config.mask = config['date-format'];
        break;
      case "date time":
        config.mask = {
          "date": config['date-format'],
          "clock": config['clock-format']
        };

        break;
      case "clock":
        config.mask = config['clock-format'];
        break;
      case "timer":
        config.mask = config['timer-format'];
        break;
      case "number":
        if ( $form.find( "#whole-number input" ).is( ":checked" ) ) {
          config.type = "integer";
        }

        config.mask = {
          seperator: config['thousand-seperator']
        };

        break;
      case "currency":
        config.mask = {
          seperator: config['thousand-seperator'],
          symbol: config['currency-symbol']
        };

        break;
      case "from table":
        config.fromTableId = config['from-table'];

        break;
    }

    if ( config.calculated ) {
      config.calculated = config.calculated.replace( /"/g, "'" )
    }

    return config;
  }

  submit () {
    let $form = this.$modal.find( "form" );

    this.valid = true;
    
    this.config = this.formToJson();

    $form.addClass('was-validated');

    $form.find( ".custom-input:visible" ).find( "input, select, textarea" )
      .each( ( index, el ) => {
        if ( $( el ).is(':invalid') ) {
          this.valid = false
        }
      } );

    this.$modal.find( "dg-spinner-button" )[0].finish();
  }

  async typeChange ( e ) {
    let $default = this.$modal.find( "#default-value" ),
      type = this.$modal.find( "#type" )[0].value,
      config = form.filter( column => column.id == "default-value" )[0];

    if ( ! type ) return;
    
    config.type = type;

    if ( type == "from table" ) {
      let $fromTable = this.$modal.find( "#from-table" ),
        tables = await table.get( this.database, this.table ),
        options = [];

      for ( const table of tables ) {
        options.push( {
          "label": table.tabelName,
          "value": table.id
        } );
      }

      $fromTable[0].options = JSON.stringify( options );
    } else {
      $default.after( columnToInput( config ) );
      $default.remove();
    }

    switch ( type ) {
      case "clock":
        this.$modal.find( "#now label" ).html( "Default to current time" );
        break;
      case "date":
        this.$modal.find( "#now label" ).html( "Default to current date" );
        break;
      case "date time":
        this.$modal.find( "#now label" ).html( "Default to current date and time" );
        break;
    }

    this.$modal.find( "dg-calculated-input" )[0].type = type;

    setTimeout( () => {
      this.$modal.find( "dg-dropdown:not(#type):visible" ).trigger( "change" );
    }, 100 );
  }

  formatChange ( e ) {
    let $default = this.$modal.find( "#default-value" ),
      $clockFormat = this.$modal.find( "#clock-format" ),
      $dateFormat = this.$modal.find( "#date-format" );

    $default[0].value = "";

    setTimeout( () => {
      $default
        .attr( "timemask", $clockFormat[0].value )
        .attr( "datemask", $dateFormat[0].value )
        .attr( "mask", e.currentTarget.value );
    }, 100 );
  }

  populateDropdownOptions ( e ) {
    let $default = this.$modal.find( "#default-value" ),
      $value = this.$modal.find( "#drop-down-values" );

    $default[0].options = $value[0].value;
  }

  toggleMultipleDropDown ( e ) {
    let $default = this.$modal.find( "#default-value" );

    if ( this.$modal.find( "#is-multi-select" )[0].value ) {
      $default.attr( "multiple", true );
    } else {
      $default.removeAttr( "multiple" );
    }
  }

  ready () {
    let typeChange = this.typeChange.bind( this ),
      formatChange = this.formatChange.bind( this ),
      populateDropdownOptions = this.populateDropdownOptions.bind( this ),
      toggleMultipleDropDown = this.toggleMultipleDropDown.bind( this );

    this.$modal[0].ready();

    this.$modal
      .on( "change", "#type", typeChange )
      .on( "change", "#clock-format, #date-format", formatChange )
      .on( "change", "#drop-down-values input", populateDropdownOptions )
      .on( "change", "#is-multi-select input", toggleMultipleDropDown )
      .on( "change", "#is-calculated input", e => {
        if ( $( e.currentTarget ).is( ":checked" ) ) {
          this.$modal.find( "dg-calculated-input" ).show();
        } else {
          this.$modal.find( "dg-calculated-input" ).hide()
        }
      } );

    this.$modal.find( "#type" ).trigger( "change" );

    this.$modal.find( ".custom-input:not([disabled]) input" ).eq(0)
      .trigger( "focus" );

    return this;
  }
}