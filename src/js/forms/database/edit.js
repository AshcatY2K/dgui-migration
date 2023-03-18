import Modal from './modal.js';
import * as database from '../../controllers/database.js';
import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class edit extends Modal {
  constructor ( name, database ) {
    super( "Edit Database" );

    this.name = name;
    this.database = database;

    super.paint().ready();

    this.$modal.find( "#name" )[0].value = this.name;

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
    
    database.update( this.name, this.database ).then( res => {
        toastSuccess( "Success", "Your database has been updated" );

        resolve( this.name );

        super.close();
      } )
      .catch( error => {
        btn.finish();

        toastError( error );
      } );
  }
}