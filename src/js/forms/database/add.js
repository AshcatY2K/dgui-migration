import Modal from './modal.js';
import * as database from '../../controllers/database.js';
import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class add extends Modal {
  constructor () {
    super( "Add Database" );

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
      btn.finish();
      return;
    }

    database.add( this.name ).then( res => {
        toastSuccess( "Success", "Your database has been added" );

        resolve( this.name );

        super.close();
      } )
      .catch( error => {
        btn.finish();

        toastError( error );
      } );
  }
}