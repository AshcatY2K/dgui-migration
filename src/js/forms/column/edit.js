import Modal from './modal.js';
import * as column from '../../controllers/column.js';
import Dialog from '/src/js/components/dialog.js';
import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class edit extends Modal {
  constructor ( database, table, column, secondary = false ) {
    super( "Edit Column", database, table, secondary );

    this.column = column;

    super.paint().ready();
    this.populate();

    return new Promise ( resolve => {
      this.resolve = resolve;

      this.$modal
        .on( "click", ".save", () => this.submit() )
        .on( "click", ".btn-close", () => resolve( false ) );
    } );
  }

  populate () {
    let type = this.column.type;

    if ( type == "drop down list multi select" ) {
      type = "drop down list";
    } else if ( type == "integer" ) {
      type = "number";
    }

    this.$modal.find( "#name" )[0].value = this.column.columnName;
    this.$modal.find( "#type" )[0].value = type;
    this.$modal.find( "#drop-down-values" )[0].value = this.column.dropdownValues;

    this.$modal.find( "#tooltip" )[0].value = this.column.Tooltip;
    this.$modal.find( "#is-mandatory" )[0].value = this.column.mandatory;
    this.$modal.find( "#is-read-only" )[0].value = this.column.ReadOnly;

    if ( this.column.formula ) {
      this.$modal.find( "#is-calculated" )[0].value = true;
      this.$modal.find( "#calculated" )[0].value = this.column.formula;
    }

    if ( 
      this.column["default value"] && 
      this.column["default value"].includes( "NOW" )
    ) {
      this.$modal.find( "#now" )[0].value = true;
    }

    if ( this.column.mask ) {
      let mask;

      try {
        mask = JSON.parse( this.column.mask );
      } catch ( e ) {
        mask = {};
      }
      
      if ( typeof this.column.mask == "string" ) {
        this.$modal.find( "#default-value" ).attr( "mask", this.column.mask );
        this.$modal.find( "#timer-format" )[0].value = this.column.mask
          .replace( /['"]/g, "" );
      }

      if ( mask.minChar )
        this.$modal.find( "#min-char" )[0].value = mask.minChar;

      if ( mask.maxChar )
        this.$modal.find( "#max-char" )[0].value = mask.maxChar;

      if ( mask.symbol )
        this.$modal.find( "#currency-symbol" )[0].value = mask.symbol;

      if ( mask.seperator )
        this.$modal.find( "#thousand-seperator" )[0].value = mask.seperator;

      if ( mask.format )
        this.$modal.find( "#input-mask" )[0].value = mask.format;

      if ( mask.date )
        this.$modal.find( "#date-format" )[0].value = mask.date;

      if ( mask.clock )
        this.$modal.find( "#clock-format" )[0].value = mask.clock;

      switch ( this.column.type ) {
        case "clock":
          this.$modal.find( "#clock-format" )[0].value = mask;
          break;
        case "date":
          this.$modal.find( "#date-format" )[0].value = mask;
          break;
        case "date time":
          this.$modal.find( "#date-format" )[0].value = mask.date;
          break;
      }
    }

    switch ( this.column.type ) {
      case "drop down list multi select":
        this.$modal.find( "#is-multi-select" )[0].value = true;
        break;
      case "integer":
        this.$modal.find( "#whole-number" )[0].value = true;
        break;
    }

    if ( this.column["default value"] !== "NOW" ) {
      setTimeout( () => {
        this.$modal.find( "#default-value" )[0].value = this.column['default value'];
      }, 200 );
    }
  }

  update () {
    column.update( this.database , this.table, this.column.id, this.config ).then( res => {
        toastSuccess( "Success", "Your column has been updated" );

        this.resolve( this.config );

        super.close();
      } )
      .catch( error => {
        this.resolve( false );
        toastError( error );
      } );
  }

  submit ( resolve ) {
    super.submit();

    if ( ! this.valid ) {
      this.$modal.find( "form *:invalid" ).eq(0).focus();
      return;
    }

    this.config.originalType = this.column.type;
    this.config.seq = this.column.seq;
    
    column.checkUpdate( this.database, this.table, this.column.id, this.config )
      .then( res => {
        if ( res.warning ) {
          const dialog = new Dialog();

          dialog.confirm( `Values in this column will be deleted.
              Do you wish to continue?` )
            .then( res => {
              if ( res ) this.update() 
            } );
        } else {
          this.update();
        }
      } )
  }
}