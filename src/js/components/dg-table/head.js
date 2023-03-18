import './column.js';

export default class DGTableHeader extends HTMLElement {
  constructor() {
    super();

    this.html = `<div role="row" style="display: flex;">
        <dg-column class="checkbox-container"></dg-column>
        <dg-column class="chat-container"></dg-column>
      </div>`;
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  get columns () {}

  set columns ( columns ) {
    $( this ).html( this.html );

    $( this ).find( ".checkbox-container" )[0].name = `<input type="checkbox" 
      class="head-tr-checkbox" aria-label="check all records for bulk action">`;

    $( this ).find( ".chat-container" )[0].name = `<i class="far fa-comments" 
      aria-label="chat"></i>`;

    for ( let column of columns ) {
      let $col = $( "<dg-column>" );
      
      $( this ).find( "[role='row']" ).append( $col );

      $col[0].column = column;
    }
    
    this.app.tableConfig.then( tableConfig => {
      if ( tableConfig["Can Delete Record"] ) {
        let $col = $( "<dg-column>", { class: "delete-action-column" } );
        
        $( this ).find( "[role='row']" ).append( $col );
      }

      if ( this.app.embedded ) {
        let $col = $( "<dg-column>", { class: "through-link-action-column" } );
        $( this ).find( "[role='row']" ).append( $col );
      }
    } );

    $( this ).removeClass( "no-border" );
  }

  static get observedAttributes () {
    return [];
  }

  selectAllRows ( e ) {
    let $checkboxes = $( this.app ).find( "dg-table-body .checkbox-container [type='checkbox']" ),
      isChecked = $( this ).find( ".checkbox-container input" ).is(':checked');
   
    $checkboxes.prop( "checked", isChecked );
  }

  connectedCallback () {
    let selectAllRows = this.selectAllRows.bind( this );

    $( this ).attr( "role", "rowgroup" );

    this.app = $( this ).closest( "dg-app" )[0];

    $( this ).closest( "dg-app" ).on( "load::columns", ( e, columns ) => {
      this.columns = columns;
    } );

    $( this ).on( "click", ".checkbox-container input", selectAllRows );

    $( this )
      .on( "keydown", e => {
        let index = $( this ).index() + 1,
          $row = $( this ).closest( "dg-data-row" ),
          $cell = $( this ).find( "dg-column, dg-cell" );
          
        if ( $( e.target ).closest( "dg-column-options" ).length > 0 ) {
          return;
        }

        switch ( e.keyCode ) {
          case 40: // Down
            $( this ).closest( `dg-table` ).find( "dg-table-body dg-data-row:first-child" ).focus();

            e.preventDefault();
            break;
        }
      } );
  }
}

window.customElements.define('dg-table-header', DGTableHeader);