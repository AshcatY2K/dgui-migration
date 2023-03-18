import './dataRow.js';
import * as record from '/src/js/controllers/record.js';

export default class DGTableBody extends HTMLElement {
  constructor() {
    super();

    this.html = `<div class="loader" aria-label="Loading page"></div>`;

    this.page = 1;
    this.rows = 20;
    this.scrollTimestamp = 0;
    this.hasMoreRows = true;
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  static get observedAttributes () {
    return [ ];
  }

  doChunk( records, index = 0 ) {
    let chunk = 1;

    this.processing = true;

    $( this ).find( ".loader-container" ).remove();

    for ( let record of records.slice( 0, chunk ) ) {
      let $tr = $( `<dg-data-row>` ).hide();

      $( this ).append( $tr );

      $tr[0].init( record, this.columns, this.app );

      $tr.show();

      ++index;
    }

    if ( records.length > 0) {
      let doChunk = this.doChunk.bind( this );

      records = records.slice( chunk, records.length + 1 );
      // set Timeout for async iteration
      setTimeout( () => { doChunk( records, index ) }, 0);
    } else {
      this.processing = false;
    }
  }

  init () {
    this.$app.find( ".results-wrapper .count" )
      .html( Math.min( this.records.count, this.rows * this.page ) );
    this.$app.find( ".results-wrapper .total" ).html( this.records.count );

    $( this ).trigger( "load::records", [ this.records.records ] );

    $( this ).html("");

    if ( this.records.count === 0 ) {
      $( this ).html( "<p class='p-4 text-center'>No results found</p>" );
    } else {
      this.doChunk( this.records.records );
    }

    $( this ).trigger( "load::table-body" );
  }

  static get observedAttributes () {
    return [ ];
  }

  reloadAttr () {
    for ( const attr of this.getAttributeNames() ) {
      let value = $( this ).attr( attr );

      if ( value ) {
        $( this ).attr( attr, value );
      } else {
        $( this ).prop( attr, true );
      }
    }
  }

  manageRecordCheckox ( e ) {
    let $checkbox = $( e.currentTarget ).find( "[type='checkbox']" );

    if ( $checkbox.is( ":checked" ) !== this?.recordCheckbox?.checked ) {
      $checkbox.trigger( "click" );
    }
  }

  loadRecords () {
    record.get( this.app.database, this.app.table, 0, this.app.config )
      .then( records => {
        this.records = records;

        if ( this.records && this.columns ) {
          this.init();
        }

        $( this ).closest( "dg-table" )
          .attr( "aria-rowcount", records.records.length );

        $( this ).trigger( "load", [ records ] );
      } );
  }

  connectedCallback () {
    let manageRecordCheckox = this.manageRecordCheckox.bind( this );

    $( this ).attr( "role", "rowgroup" ).html( this.html );

    this.$app = $( this ).closest( "dg-app" );
    this.app = this.$app[0];

    this.reloadAttr();

    this.$app.on( "load::columns", ( e, columns ) => {
      this.columns = columns;

      if ( this.records && this.columns ) this.init();
    } );

    this.loadRecords();

    $( this )
      .on( "mousedown", ".checkbox-container", e => {
        this.recordCheckbox = {
          checked: ! $( e.currentTarget ).find( "[type='checkbox']" ).is( ":checked" )
        };

        $( this ).on( "mouseover", ".checkbox-container", manageRecordCheckox );
      } )
      .on( "mouseup", ".checkbox-container", e => {
        this?.recordCheckbox?.checked;

        $( this ).off( "mouseover", ".checkbox-container", manageRecordCheckox );
      } );
  }
}

window.customElements.define('dg-table-body', DGTableBody);