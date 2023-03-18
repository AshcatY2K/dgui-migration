import { remove } from '../../controllers/column.js';
import { default as editColumn } from '/src/js/forms/column/edit.js';

import Dialog from '/src/js/components/dialog.js';
import FilterModal from '/src/js/forms/filter.js';
import mdbModal from '/src/js/components/mdb/pro/modal';

export default class DGColumnOptions extends HTMLElement {
  constructor() {
    super();

    this.html = `<button class="more-options" aria-label="more options" 
      data-label="Date" role="button">
        ⋮
      </button>
      
      <span class="options shadow-1-strong" data-label="Date">
        <button class="sub-list-facade" data-target="sort-list" 
          aria-label="Sort" role="menuitem">
          Sort <i class="fas fa-chevron-right float-end"></i>
        </button>
        <ul class="sub-list shadow-1-strong">
          <li>
            <button type="button" class="sort-asc" aria-label="Sort on ascending"
              role="menuitem" tabindex="0">
              <span>Ascending</span>
              <i class="fas fa-sort-alpha-down" style="float: right;"></i>
            </button>
          </li>
          <li>
            <button type="button" class="sort-desc" aria-label="Sort on descending"
              role="menuitem" tabindex="0">
              <span>Descending</span>
              <i class="fas fa-sort-alpha-down-alt" style="float: right;"></i>
            </button>
          </li>
        </ul>

        <button type="button" class="filter" tabindex="0" role="menuitem"
          aria-label="Filter on column">
          Filter <i class="fas fa-filter" style="float: right;"></i>
        </button>
        <button type="button" class="show" tabindex="0" aria-label="Hide column"
          role="menuitem">
          Show <i class="fas fa-eye-slash" style="float: right;line-height: 1;"></i>
        </button>
        <button type="button" class="hide" tabindex="0" aria-label="Hide column"
          role="menuitem">
          Hide <i class="far fa-eye" style="float: right;line-height: 1;"></i>
        </button>
      </span>`;
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  static get observedAttributes () {
    return [ ];
  }

  hide ( e ) {
    let index = this.$column.index() + 1;

    this.$column.find( ".hover" ).removeClass( "hover" );

    this.$table
      .find( `dg-cell:nth-child(${index}), dg-column:nth-child(${index})` )
      .addClass( "hidden" );

    this.$table[0].resize();

    this.$app[0].hideColumn( this.$column[0].column );
  }

  show () {
    let index = this.$column.index() + 1;

    this.$column.find( ".hover" ).removeClass( "hover" );

    this.$table
      .find( `dg-cell:nth-child(${index}), dg-column:nth-child(${index})` )
      .removeClass( "hidden" );
      
    this.$table[0].resize();

    this.$app[0].showColumn( this.$column[0].column );
  }

  remove ( e ) {
    const dialog = new Dialog(),
      column = this.$column[0];

    dialog.confirm( `Are you sure you want to delete ${column.name}?` )
      .then( res => {
        if( res ) {
          remove( this.app.database, this.app.table, column.id )
            .then( ( res ) => this.app.init() )
            .catch( error => {
              $( this.app ).find( ".table-heading" ).trigger( "focus" );
              toastError( `Error deleting ${type}`, error ) 
            } );
        }
      } );
  }

  edit ( e ) {
    e.preventDefault();

    this.$column.find( ".hover" ).removeClass( "hover" );

    const column = this.$column[0],
      dialog = new editColumn( this.app.database, this.app.table, column.config.column, this.app.embedded );

    dialog.then( config => {
      $( this.app ).find( ".table-heading" ).trigger( "focus" );
      
      if ( ! config ) return;
      
      this.app.init();
    } );
  }

  sort ( direction ) {
    const column = this.$column[0].config.column;

    this.app.sort( column.columnName, direction, column.fromTableId );

    this.$column.find( ".hover" ).removeClass( "hover" );
  }

  sortAsc ( e ) { this.sort( "ASC" ); }
  sortDesc ( e ) { this.sort( "DESC" ); }

  connectedCallback () {
    $( this ).attr( "role", "menu" ).append( this.html );

    this.$app = $( this ).closest( "dg-app" );
    this.app = this.$app[0];
    this.$table = $( this ).closest( "dg-table" );
    this.$column = $( this ).closest( "dg-column" );

    $( this ).closest( "dg-app" ).on( "load::columns", ( e, columns ) => {
      this.columns = columns;
    } );

    ( async () => {
      let config = await this.app.tableConfig;
      
      if ( config.Designer ) {
        $( this ).find( ".options" ).append( `
          <button type="button" class="edit" tabindex="0" aria-label="Edit"
            role="menuitem">
            Edit
          </button>
          <button type="button" class="delete" tabindex="0" aria-label="Delete"
            role="menuitem">
            Delete
          </button>` );
      }
    } )();

    $( this )
      .on( 'keyup', ".more-options", function (e) {
        let isVisible = $( this ).next().is( ":visible" ),
          $option = $( this ).next( ".options" ),
          $next = $( this ).next();

        switch ( e.keyCode ) {
          case 13: // down
            $option.toggleClass( "hover" );
            break;
          case 38: // up
            $option.addClass( "hover" );
            $next.show();

            if ( ! isVisible ) {
              $next.find( "button:last-child" ).focus();
            }
            break;
          case 40: // down
            $option.addClass( "hover" );
            $next.show();
            $next.find( "button" ).eq( 0 ).focus();
            break;
        }
      } )
      .on( 'keyup', ".options", function (e) {
        let index = $( e.target ).index(),
            $buttons = $( e.target ).parent().find( "> button:visible" );

        switch ( e.keyCode ) {
          case 38: // up
            if ( index > 1 ) {
              $( e.target ).prevAll( "button:visible" ).eq(0).focus();
            } else {
              $buttons.eq( $buttons.length - 1 ).focus();
            }

            break;
          case 40: // down
            if ( index <= $buttons.length ) {
              $( e.target ).nextAll( "button:visible" ).eq(0).focus();
            } else {
              $buttons.eq( 0 ).focus();
            }

            break;
        }
      } )
      .on( "keyup", ".sub-list-facade", function ( e ) {
        if ( e.which == 13 || e.keyCode == 32 ) {
          $( this ).toggleClass( "hover" );
          $( this ).trigger( "mouseenter" );
        }
      } )
      .on( "click", ".hide", this.hide.bind( this ) )
      .on( "click", ".show", this.show.bind( this ) )
      .on( "click", ".delete", this.remove.bind( this ) )
      .on( "click", ".edit", this.edit.bind( this ) )
      .on( "click", ".sort-asc", this.sortAsc.bind( this ) )
      .on( "click", ".sort-desc", this.sortDesc.bind( this ) )
      .on( "click", ".filter", async ( e ) => {
        e.preventDefault();

        this.$column.find( ".hover" ).removeClass( "hover" );

        new FilterModal( this.app, this.$column[0].config.column.id );

        const modal = new mdbModal( $( '#columnFilterModal' )[0] );
        modal.show();
      } );
  }
}

window.customElements.define('dg-column-options', DGColumnOptions);