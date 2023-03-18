import Modal from './modal.js';
import * as column from '../../controllers/column.js';
import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class add extends Modal {
  constructor ( database, table, secondary = false ) {
    super( "Add Column", database, table, secondary );

    super.paint().ready();

    return new Promise ( resolve => {
      this.$modal
        .on( "click", ".save", () => this.submit( resolve ) )
        .on( "click", ".btn-close", () => resolve( false ) );
    } );
  }

  submit ( resolve ) {
    super.submit();

    if ( ! this.valid ) {
      this.$modal.find( "form *:invalid" ).eq(0).focus();
      return;
    }

    column.add( this.database , this.table, this.config ).then( res => {
        toastSuccess( "Success", "Your column has been added" );

        resolve( this.config );

        super.close();
      } )
      .catch( error => {
        resolve( false );
        toastError( error );
      } );
  }
}