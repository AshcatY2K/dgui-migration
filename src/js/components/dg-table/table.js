import './body.js';
import './head.js';

export default class DGTable extends HTMLElement {
  constructor() {
    super();

    this.html = `<dg-table-header role="rowgroup" class="no-border"></dg-table-header>
      <dg-table-body></dg-table-body>`;
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  static get observedAttributes () {
    return [ "database", "table" ];
  }

  get database () { return $( this ).attr( "database" ) }
  get table () { return $( this ).attr( "table" ) }

  set database ( database ) {
    $( this ).find( "dg-table-body" ).attr( "database", database );
  }

  set table ( table ) {
    $( this ).find( "dg-table-body" ).attr( "table", table );
  }

  resize () {
    let maxDefaultWidth = $( this ).width(),
      $columns = $( this ).find( "dg-column:not(.chat-container):not(.checkbox-container):not(.hidden):not(.delete-action-column)" ),
      columnCount = $columns.length;

    $( this ).find( "dg-column" ).each( ( i, th ) => {
      let style = $( th ).attr( 'style' );

      if ( ! style && i > 1 ) {
        $( th ).find( ".drag-resize" ).trigger( "dblclick" );
      } else {
        let width = Math.trunc( $( th ).outerWidth() );

        if ( width < 1 ) return;

        i++;

        $( this ).find( `dg-cell:nth-child(${i})` ).outerWidth( width );
        $( this ).find( `dg-column:nth-child(${i})` ).outerWidth( width );
      }
    } );

    if ( $( this ).find( "dg-table-header" ).width() < maxDefaultWidth ) {      
      let delta = maxDefaultWidth - $( this ).find( "dg-table-header" ).width();

      delta /= columnCount;

      $columns.each( ( i, th ) => {
        let width = Math.trunc( $( th ).outerWidth() + delta );

        i = $( th ).index() + 1;

        $( this ).find( `dg-cell:nth-child(${i}), dg-column:nth-child(${i})` )
          .outerWidth( width );
      } );
    }
  }

  scrollMouseDownHandler ( e ) {
    window.isDragScrolling = false;
    
    $( this ).css( { "cursor": 'grabbing', "user-select": 'none' } );
    // The current scroll
    this.pos = {
      left: this.scrollLeft,
      top: this.scrollTop,
      x: e.clientX,
      y: e.clientY
    }

    $( this )
      .on( 'mousemove', this.events.scroll.mouseMove )
      .on( 'mouseup', this.events.scroll.mouseUp );
  }

  scrollmouseUpHandler ( e ) {
    $( this ).css( { "cursor": 'grab' } ).removeAttr( 'user-select' );

    $( this )
      .off( 'mousemove', this.events.scroll.mouseMove )
      .off( 'mouseup', this.events.scroll.mouseUp );
  }

  scrollmouseMoveHandler ( e ) {
    window.isDragScrolling = true;
   
    this.scrollTop = this.pos.top - ( e.clientY - this.pos.y );
    this.scrollLeft = this.pos.left - ( e.clientX - this.pos.x );
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

  connectedCallback () {
    $( this ).attr( "role", "table" ).html( this.html );

    this.events = {
      scroll: {
        mouseDown: this.scrollMouseDownHandler.bind( this ),
        mouseMove: this.scrollmouseMoveHandler.bind( this ),
        mouseUp: this.scrollmouseUpHandler.bind( this )
      }
    };

    this.pos = {
      left: 0,
      top: 0,
      x: 0,
      y: 0
    };
    
    this.reloadAttr();

    $( this ).on( "load::table-body", "dg-table-body", e => { 
      setTimeout( () => { this.resize() }, 10 );
    } );
    $( this ).on( "column::resize", "dg-column", e => { this.resize(); } );
    
    $( this )
      .on( "mousedown", "dg-table-body dg-cell:not(.checkbox-container)", this.events.scroll.mouseDown );
  }
}

window.customElements.define('dg-table', DGTable);