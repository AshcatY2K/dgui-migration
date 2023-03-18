import '../../components/panel.js';
import '../../components/spinnerButton.js';

import * as preferences from '/src/js/controllers/preferences.js';

import { columnToInput } from '../../helpers/inputGenerator.js';
import { default as draggableTable } from '../../helpers/draggableTable.js';

import Autocomplete from '../../components/mdb/pro/autocomplete';
import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class manage {
  constructor ( database, table, designer, columns, secondary=false ) {
    let position = secondary ? "secondary" : "primary";
    
    this.$modal = $( `<dg-panel ${position}="true">` );
    this.modal = this.$modal[0];

    this.database = database;
    this.table = table;
    this.designer = designer;
    this.columns = columns;

    if ( $( ".floating-panel" ).length > 0 ) {
      $( ".floating-panel" ).after( this.$modal );
    } else {
      $( "body" ).append( this.$modal );
    }

    this.modal.header = `<h5 class="modal-title ms-3 py-2 px-0">
        Manage Columns
      </h5>`;

    this.modal.body = `<form class="needs-validation" novalidate 
      aria-live="polite">
        <table class="table draggable-row">
          <thead>
            <tr>
              <th width="50">Show</th>
              <th>Column</th>
              <th width="25"></th>
              <th width="25"></th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </form>`;

    this.modal.footer = `<dg-spinner-button class="save">
        Apply
      </dg-spinner-button>`;

    this.$modal.find( ".card-header" ).addClass( "bg-primary" );

    this.paint();

    return new Promise ( resolve => {
      this.$modal
        .on( "click", ".save", () => this.submit( resolve ) )
        .on( "click", ".btn-close", () => resolve( false ) );
    } );
  }

  generateRow ( column, icon, checked ) {
    return $( "<tr>", {
        "data-column-id": column.id,
        "data-column-name": column.columnName,
        "data-seq": column.seq
      } ).html( `<td>
          <div class="form-check form-switch p-0">
            ${icon}
            <input class="form-check-input js-show" type="checkbox" ${checked} role="switch"
              style="display: none"/>
          </div>
        </td>
        <td aria-label="${column.columnName} column" class="draggable"
          tabindex="0">`+
          unescape( column.columnName ) +
        `</td>
        <td class="sort-options p-0">
          <i class="fas fa-angle-up move-up" tabindex="0"
            aria-label="Move item up" role="button"></i>
        </td>
        <td class="sort-options p-0">
          <i class="fas fa-angle-down move-down" tabindex="0"
            aria-label="Move item down" role="button"></i>
        </td>` );
  }

  paint () {
    let $form = this.$modal.find( "form" ),
      columns = this.columns;

    this.$modal.find( "tbody tr" ).remove();

    if ( ! this.preference ) {
      columns.sort( ( a, b ) => ( a.seq > b.seq) ? 1 : -1);
    } else {
      let tempCol = [];

      this.preference.sort( ( a, b ) => ( a.seq > b.seq) ? 1 : -1);

      for ( const column of this.preference ) {
        let col = columns.filter( col => col.id === column.id )
        tempCol.push( col[0] );
      }

      columns = tempCol;
    }

    columns.forEach( ( column, index ) => {
      if ( column.columnName == "id" ) {
        return;
      }

      let checked = "checked",
        icon = `<i class="fas fa-eye js-toggle-show" aria-label="Hide column" 
            aria-role="button" tabindex="0"></i>`;

      if ( column.hiden ) {
        checked = "";
        icon = `<i class="far fa-eye-slash js-toggle-show" aria-label="Show column" 
            aria-role="button" tabindex="0"></i>`;
      }

      if ( this.preference ) {
        let pref = this.preference.filter( pref => pref.id === column.id )
        
        if ( pref[0].hidden ) {
          checked = "";
          icon = `<i class="far fa-eye-slash js-toggle-show" aria-label="Show column" 
            aria-role="button" tabindex="0"></i>`;
        }
      }

      let $tr = this.generateRow( column, icon, checked );

      $form.find( "tbody" ).append( $tr );
    });

    this.$modal.attr( "data-db-table-dependant", "true" );

    draggableTable();
      
    this.ready();

    return this;
  }

  close () {
    this.$modal.find( "dg-spinner-button" )[0].finish();

    this.$modal.find( ".btn-close" ).trigger( "click" );
  }

  submit ( resolve ) {
    let columns = {},
      seq = 2,
      $btn = this.$modal.find( "#save-preference" );

    $btn.addClass( "loading" );

    this.$modal.find( "tbody tr" ).each( ( index, el ) => {
      let checked = $( el ).find( ".js-show" ).is(':checked'),
        id = parseInt( $( el ).attr( "data-column-id" ) );

      columns[ id ] = { 
        seq: seq++, 
        hidden: ! checked ? true : false 
      };
    } );

    resolve( columns );

    this.close();
  }

  async ready () {
    this.$modal[0].ready();

    this.$modal
      .on( "click", ".js-toggle-show", function () {
        $( this ).next( "input" ).trigger( "click" );

        $( this ).toggleClass( "fas" ).toggleClass( "far" )
          .toggleClass( "fa-eye" ).toggleClass( "fa-eye-slash" );
      } )
      .on( "click", ".draggable-row .sort-options .move-up", function ( e ) {
        let $tr = $( this ).closest( "tr" ),
          $clone = $tr.clone( true );

        $clone.addClass( "moved" );

        $tr.closest( "table" ).find( ".moved" ).removeClass( "moved" );

        $tr.prev().before( $clone );

        $tr.prev().prev().find( ".move-up" ).focus();

        $tr.remove();
      } ) 
      .on( "click", ".draggable-row .sort-options .move-down", function ( e ) {
        let $tr = $( this ).closest( "tr" ),
          $clone = $tr.clone( true );

        $clone.addClass( "moved" );

        $tr.closest( "table" ).find( ".moved" ).removeClass( "moved" );

        $tr.next().after( $clone );

        $tr.next().next().find( ".move-down" ).focus();
        $tr.remove();
      } ) 
      .on( "keyup", ".js-toggle-show, .move-up, .move-down", function ( e ) {
        e.preventDefault();

        if ( e.which == 32 || e.which == 13 ) {
          $( this )[0].click();
        }
      } );

    return this;
  }
}