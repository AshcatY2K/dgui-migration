import Modal from './modal.js';

import * as table from '../../controllers/table.js';
import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class add extends Modal {
  constructor ( database ) {
    super( "Add Table", database );

    this.database = database;

    super.paint().ready();

    return new Promise ( resolve => {
      this.$modal
        .on( "click", ".save", () => this.submit( resolve ) )
        .on( "click", ".btn-close", () => resolve( false ) );
    } );
  }

  submit ( resolve ) {
    super.submit();

    let btn = this.$modal.find( "dg-spinner-button" )[0];

    if ( ! this.valid ) {
      this.$modal.find( "form *:invalid" ).eq(0).focus();
      btn.finish();
      return;
    }

    table.add( this.config, this.database ).then( res => {
        toastSuccess( "Success", "Your table has been added" );

        //window.location.href = `/databases/${res.databaseId}/tables/${res.id}?label=${res.tabelName}`;

        resolve( true );

        super.close();
      } )
      .catch( error => {
        btn.finish();

        toastError( error );
      } );
  }
}