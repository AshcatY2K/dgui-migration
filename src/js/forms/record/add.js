import Modal from './modal.js';
import * as record from '../../controllers/record.js';
import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class add extends Modal {
  constructor ( database, table, columns, app, form = "", secondary = false ) {
    super( database, table, columns, form, secondary );

    this.app = app;

    this.modal.header = `<h5 class="modal-title ms-3 py-2 px-0">Add Record</h5>`;

    this.modal.footer = `<dg-spinner-button class="save-new">
        Save &amp; New
      </dg-spinner-button>
      <dg-spinner-button class="save-edit">
        Save &amp; Edit
      </dg-spinner-button>`;

    this.$modal.find( ".card-header" ).addClass( "bg-primary" );

    super.paint();
    this.ready();

    return new Promise ( resolve => {
      this.resolve = resolve;

      this.$modal
        .on( "click", ".save-new", () => this.submit( "new" ) )
        .on( "click", ".save-edit", () => this.submit( "edit" ) )
        .on( "click", ".btn-close", () => resolve( false ) );
    } );
  }

  submit ( action ) {
    super.submit();

    let btn = this.$modal.find( "dg-spinner-button" )[0];

    if ( ! this.valid ) {
      btn.finish();

      return;
    }

    record.add( this.database, this.table, this.config ).then( res => {      
      this.resolve( {
          action: action,
          record: {
            ...this.config,
            ...this.lookup,
            id: res.newrecId
          }
        } );

      super.close();
    } )
    .catch( error => {
      btn.finish();

      toastError( error );
    } );
  }

  async ready () {
    super.ready();

    if ( this.app.hasAttribute( "embedded" ) && this.app.activeRecord ) {
      let records = await record.get( await this.app.database, this.app.activeRecord.table, 1 );
      
      records = records.records;

      for ( let column of this.app.columns ) {
        if ( this.app.activeRecord.table == column.fromTableId ) {
          let record = records.filter( record => record.id == this.app.activeRecord.record.id )[0];

          this.$modal.find( `.custom-input[id="${column.id}"]` )[0].value = {
            value: this.app.activeRecord.record.id,
            label: record[ Object.keys(record)[1] ]
          };
        }
      }
    }
  }
}