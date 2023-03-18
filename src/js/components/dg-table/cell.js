import { fieldToDisplay } from '/src/js/helpers/inputGenerator.js';

import DGApp from '/src/js/components/app.js';

export default class DGCell extends HTMLElement {
  constructor() {
    super();

    this.html = ``;
    this.initialized = false;
  }

  static get observedAttributes () {
    return [ "columnid", "value" ];
  }

  get columnid () { return $( this ).attr( "columnid" ); }
  get value () { return this._value; }
  get type () { 
    let column = this.app.columns.filter( column => column.id == this.columnid )[0];
    
    if ( ! column ) return false;

    return column.type;
  }

  get filters () { 
    let filters = this.app.config.filters;

    if ( ! Array.isArray( filters ) ) {
      filters = [];
    }

    return filters;
  }

  set columnid ( id ) {
    this.column = this.app.columns.filter( column => column.id == id )[0];

    if ( this.value && this.column ) {
      this.init( this.value, this.column);
    }
  }

  set value ( value ) {
    if ( typeof value == "boolean") {
      value = "";
    }

    this._value = value;

    if ( this.column ) {
      this.init( value, this.column);
    }
  }

  init ( value, column ) {
    if ( this.initialized ) {
      return;
    }

    this.initialized = true;
    
    if ( column.hiden ) {
      $( this ).addClass( "hidden" );
    }

    if ( ! column.formula || [ 
        "clock", "date", "date time", "hyperlink", "embedded", "currency", 
        "timer", "number", "integer"
      ].includes( column.type ) ) {
      let input = fieldToDisplay( value, column, this.app.database );

      if ( [ "checkbox" ].includes( column.type ) ) {
        $( this ).attr( "aria-label", value == "true" ? "checked" : "unchecked" );
      } else if ( [ "drop down list multi select" ].includes( column.type ) ) {
      }  else if ( [ "hyperlink", "embedded" ].includes( column.type ) ) {
        if ( input ) $( this ).attr( "tabindex", "-1" );
      } else {
        $( this ).attr( "aria-label", input );
      }

      $( this ).html( "" ).append( input );      
    } else if ( typeof value !== "boolean" ) {
      $( this ).attr( "aria-label", value );
      $( this ).html( "" ).append( value );      
    }
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  static get observedAttributes () {
    return [ ];
  }

  filter ( filter ) {
    let filters = this.filters;

    $( ".contextMenu" ).remove();

    if ( filters.length > 0 ) filter.operator = "and";

    filters.push( filter );

    this.app.filter( filters, this.app.database );
  }

  filterOnField ( comparative ) {
    let filter = {
        "columnId": this.columnid,
        "comparative": comparative,
        "filter": this.value
      };

    if ( [ "date time", "date", "clock" ].includes( this.type ) ) {
      filter.from = filter.filter;
      filter.to = filter.filter;

      delete filter.filter;
      delete filter.comparative;
    }

    this.filter( filter );
  }

  filterFrom () {
    this.filter( {
        "columnId": parseInt( this.columnid),
        "from": this.value,
        "to": this.type == "clock" ? "23:59:00.000" : "5000-12-29T01:01:00.000"
      } );
  }

  filterTo () {
    this.filter( {
        "columnId": parseInt( this.columnid ),
        "from": this.type == "clock" ? "00:00:00.000" : "0001-01-01T00:00:00.000",
        "to": this.value.replace( "Z", "" )
      } );
  }

  contextMenu ( e ) {
    e.preventDefault();

    var label,
      maxLabelLength = 10,
      value = fieldToDisplay( this.value, this.column, this.app.database ),
      $menu = $( "<div>", {
          class: "contextMenu options shadow-1-strong",
          "data-db-id": this.app.database,
          "data-table-id": this.app.table,
          "data-column-id": this.column.id
        } ).css( {
          top: `${e.pageY-10}px`,
          left: `${e.pageX-40}px`
        } ),
      $btn,
      createButton = ( cssClass, label ) => {
        return $( "<button>", { type: "button", class: cssClass, tabindex: "0" } )
          .html( label );
      };

    if ( 
      ! [ "drop down list", "drop down list multi select", "embedded", 
        "hyperlink", "checkbox", "from table"]
        .includes( this.column.type ) 
    ) {
      label = isNaN( value ) ? value.substring(0, maxLabelLength) : value;
    } else {
      label = isNaN( this.value ) ? this.value.substring(0, maxLabelLength) : this.value;
    }
        
    if ( value.length > maxLabelLength ) {
      label += "&hellip;";
    }
      
    $( ".contextMenu" ).remove();
      
    $menu.on( "mouseleave", ( e ) => $( ".contextMenu" ).remove() );

    $menu.append( createButton( "filter-on", `Filter on "${label}"` ) );

    if ( 
      [ "text", "longtext", "hyperlink", "embedded", "drop down list",
      "drop down list multi select", "from table" ].includes( this.column.type ) 
    ) {
      $btn = createButton( "filter-similar", `Filter on similar` );
      $menu.append( $btn );
    } else if ( 
      [ "number", "currency", "integer", "timer" ].includes( this.column.type )
    ) {
      $btn = createButton( "filter-greater", `Filter bigger than "${label}"` );
      $menu.append( $btn );

      $btn = createButton( "filter-less", `Filter smaller than "${label}"` );
      $menu.append( $btn );
    } else if ( 
      [ "date", "date time", "clock" ].includes( this.column.type ) 
    ) {
      $btn = createButton( "filter-from", `Filter from "${label}"` );
      $menu.append( $btn );

      $btn = createButton( "filter-to", `Filter to "${label}"` );
      $menu.append( $btn );
    }

    $menu.contextmenu( e => e.preventDefault() );

    $( 'body' ).append( $menu );

    $menu
      .on( "click", ".filter-on", e => { this.filterOnField( "equals" ) } )
      .on( "click", ".filter-similar", e => { this.filterOnField( "contains" ) } )
      .on( "click", ".filter-from", e => { this.filterFrom() } )
      .on( "click", ".filter-to", e => { this.filterTo() } )
      .on( "click", ".filter-greater", e => { this.filterOnField( "bigger-than" ) } )
      .on( "click", ".filter-less", e => { this.filterOnField( "smaller-than" ) } )
  }

  connectedCallback () {
    $( this ).attr( "role", "cell" ).attr( "tabindex", "0" );

    let index = $( this ).index();

    this.$app = $( this ).closest( "dg-app" );
    this.app = this.$app[0];
    this.$column = this.$app.find( `dg-column:nth-child( ${index} )` );

    for ( const attr of this.getAttributeNames() ) {
      let value = $( this ).attr( attr );

      if ( value ) {
        this[attr] = value;
      } else {
        $( this ).prop( attr, true );
      }
    }

    $( this ).contextmenu( this.contextMenu.bind( this ) );

    $( this )
      .on( "click", ".filtered-link", e => {
        e.preventDefault();

        let filters = $( e.target ).attr( "data-filter" ),
          table = $( e.target ).attr( "data-table" ),
          url = $( e.target ).attr( "href" );

        if ( table ) {
          this.app.throughLink( filters, table, url );
        }
      } )
      .on( "keydown", e => {
        let index = $( this ).index() + 1,
          $row = $( this ).closest( "dg-data-row" );
          
        switch ( e.keyCode ) {
          case 37 : // Left
            $( this ).prevAll( ":visible" ).eq( 0 ).focus();
            e.preventDefault();
            break;
          case 39: // Right
            $( this ).nextAll( ":visible" ).eq( 0 ).focus();
            e.preventDefault();
            break;
          case 40: // Down
            $row.next().find( `dg-cell:nth-child( ${index} )` ).focus();
            e.preventDefault();
            break;
          case 38: // Up
            if ( $row.prev().length < 1 ) {
              $( this ).closest( "dg-table" )
                .find( `dg-table-header dg-column:nth-child( ${index} )` ).focus();
            } else {
              $row.prev().find( `dg-cell:nth-child( ${index} )` ).focus();
            }

            e.preventDefault();
            break;
        }
      } );
  }
}

window.customElements.define('dg-cell', DGCell);