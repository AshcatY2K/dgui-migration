import Modal from './modal.js';
import * as table from '../../controllers/table.js';
import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class edit extends Modal {
  constructor ( config, database, table  ) {
    super( "Edit Table", database, table );

    super.paint().ready();

    this.populate( config );

    return new Promise ( resolve => {
      this.$modal
        .on( "click", ".save", () => this.submit( resolve ) )
        .on( "click", ".btn-close", () => resolve( false ) );
    } );
  }

  populate ( config ) {
    this.$modal.find( "#name" )[0].value = config?.name;
    this.$modal.find( "#description" )[0].value = config?.description;
    this.$modal.find( "#timelog" )[0].value = config?.timelog === "1" ? true : false;
  }

  submit ( resolve ) {
    super.submit();

    let btn = this.$modal.find( "dg-spinner-button" )[0];

    if ( ! this.valid ) {
      this.$modal.find( "form *:invalid" ).eq(0).focus();
      btn.finish();
      return;
    }

    table.update( this.config, this.database, this.table ).then( res => {
        toastSuccess( "Success", "Your table has been updated" );

        resolve( this.config );

        super.close();
      } )
      .catch( error => {
        btn.finish();

        toastError( error );
      } );
  }
}