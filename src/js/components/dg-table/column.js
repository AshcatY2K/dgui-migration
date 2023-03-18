import './columnOptions.js';

import Tooltip from '/src/js/components/mdb/free/tooltip';

import { columnToInput } from '/src/js/helpers/inputGenerator.js';

export default class DGColumn extends HTMLElement {
  constructor() {
    super();

    this.html = `<span class="name"></span>`;
    this.config = {};
  }

  static get observedAttributes () {
    return [ "name" ];
  }

  get column () { return this.config.column; }
  get id () { return this.config.column.id; }
  get name () { return this.config.column.columnName; }
  get tooltip () { return this.config.column.tooltip; }

  set column ( column ) {
    if ( column.hiden ) {
      $( this ).addClass( "hidden" );
    }

    this.config.column = column;

    if ( column?.width ) {
      $( this ).width( column.width );
    }
    
    if ( column?.tooltip ) {
      new Tooltip( this, { title: column.tooltip, placement: "left" } );
    }

    try {
      $( this ).find( ".name" ).html( decodeURI( column.columnName ) );
      $( this ).attr( "aria-label", decodeURI( column.columnName ) );
    } catch ( e ) {
      $( this ).find( ".name" ).html( column.columnName );
      $( this ).attr( "aria-label", column.columnName );
    }

    $( this )
      .prepend( `<i class="fas fa-lock-open lock-column" 
        data-mdb-target="#lock-column"></i>` )
      .append( `<dg-column-options></dg-column-options>
        <span class="drag-resize">&nbsp;</span>` );

    if ( 
      this.$app &&
      this.$app[0]?.config?.lockFirstColumn && 
      $( this ).find( ".lock-column" ).is( ":visible" ) 
    ) {
      $( this ).addClass( "lock" );

      $( this ).find( ".lock-column" )
        .toggleClass( "fa-lock-open" )
        .toggleClass( "fa-lock" );
    }
  }

  set name ( name ) {
    $( this ).find( ".name" ).html( name );
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  static get observedAttributes () {
    return [ ];
  }

  mouseDown ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();

    this.startX = e.pageX;
    this.startWidth = $( this ).width();

    $( this ).addClass("resizing");
  
    $( document )
      .on( "mousemove", this.events.mouseMove )
      .on( "mouseup", this.events.mouseup );
  }

  mouseMove ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();

    let delta = e.pageX - this.startX,
      cellWidth = Math.trunc( this.startWidth + delta ),
      tableWidth = Math.trunc( this.$table.width() + delta + 10 );

    $( this ).css( { width: cellWidth + "px" } );

    $( this ).trigger( "column::resize" );
  }

  mouseup ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();

    $( this ).removeClass( "resizing" );

    $( document )
      .off( "mousemove", this.events.mouseMove )
      .off( "mouseup", this.events.mouseup );

    this.$app[0].resizeColumn( this.config.column, $( this ).width() );
  }

  doubleClick ( e ) {
    e.preventDefault();

    let index = $( this ).index() + 1,
      $table = $( this ).closest( "dg-table" ),
      width = $( this ).width(),
      $cells = $table.find( `dg-data-row dg-cell:nth-child( ${index} )` );

    $cells.each( ( index, el ) => {
      let elWidth = $( el ).outerWidth();

      $( el ).css( { width: "auto" } );

      width = Math.max( width, $( el ).outerWidth() );

      $( el ).css( { width: elWidth + "px" } );      
    } );

    $( this ).outerWidth( width );
    $cells.outerWidth( width );

    this.$app[0].resizeColumn( this.config.column, width );
  }

  connectedCallback () {
    this.events = {
      mouseDown: this.mouseDown.bind( this ),
      mouseMove: this.mouseMove.bind( this ),
      mouseup: this.mouseup.bind( this ),
      doubleClick: this.doubleClick.bind( this )
    }

    $( this )
      .attr( "role", "columnheader" )
      .attr( "scope", "col" )
      .attr( "tabindex", "0" )
      .append( this.html );

    this.$app = $( this ).closest( "dg-app" );
    this.$table = $( this ).closest( "dg-table" );

    $( this )
      .on( "mousedown", ".drag-resize", this.events.mouseDown )
      .on("dblclick", ".drag-resize", this.events.doubleClick)
      .on( "keydown", e => {
        let index = $( this ).index() + 1,
          $row = $( this ).closest( "dg-data-row" );
          
        if ( $( e.target ).closest( "dg-column-options" ).length > 0 ) {
          return;
        }

        switch ( e.keyCode ) {
          case 37 : // Left
            console.log( "#1" )
            $( this ).prevAll( ":visible" ).eq( 0 ).focus();
            e.preventDefault();
            break;
          case 39: // Right
            $( this ).nextAll( ":visible" ).eq( 0 ).focus();
            e.preventDefault();
            break;
          case 40: // Down
            $( this ).closest( "dg-table" )
              .find( `dg-data-row:first-child dg-cell:nth-child( ${index} )` ).focus();

            e.preventDefault();
            break;
        }
      } )
      .on( "click", ".lock-column", e => {
        let $column = $( e.target ).closest("dg-column"),
          index = $column.index() + 1;

        $( e.target )
          .toggleClass( "fa-lock-open" )
          .toggleClass( "fa-lock" );

        $column.toggleClass( "lock" );

        $( e.target ).closest( "dg-table" )
          .find( `dg-cell:nth-child(${index})` )
          .toggleClass( "lock" );

        if ( $column.hasClass( "lock" ) ) {
          this.$app[0].lockColumn();
        } else {
          this.$app[0].unlockColumn();
        }
      } );
  }
}

window.customElements.define('dg-column', DGColumn);