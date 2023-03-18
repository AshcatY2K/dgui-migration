import * as database from '/src/js/controllers/database.js';
import * as table from '/src/js/controllers/table.js';
import * as column from '/src/js/controllers/column.js';
import * as timer from '.././controllers/timer.js';
import * as preference from '/src/js/controllers/preferences.js';
import DGTemporal from '/src/js/components/inputs/temporal.js';

import mdbModal from '/src/js/components/mdb/pro/modal';
import FilterModal from '/src/js/forms/filter.js';

import './dg-table/table.js';
import './dg-table/pagination.js';
import './appMenu.js';

export default class DGApp extends HTMLElement {
  constructor() {
    super();

    let showAllColums = `<div class="col-12 col-md-6 pe-0 preferences-wrapper">
          <button type="button" aria-label="Show all column" 
            class="show-columns btn btn-link" 
            style="font-size: 13px; text-transform: capitalize; float: right; display: none;">
            <i class="far fa-eye"></i> 
            <span class="label">Show all columns</span>
          </button>
        </div>`;

    this.html = `<dg-app-menu></dg-app-menu>
      <div class="d-flex justify-content-between py-3 align-items-center row"
        style="padding-left: 1.78rem; padding-right: 1.78rem;">
        <div class="col-12 col-md-6 ps-0 heading-container">
          <h1 class="table-heading me-3 mb-0" tabindex="0"></h1>

          <button class="navbar-toggler mobile-table-nav-toggle" 
            type="button" 
            data-mdb-target="#table-nav" 
            aria-controls="table-nav" 
            aria-expanded="false" 
            aria-label="Toggle navigation" 
            style="font-size: 2rem;">
              &vellip;
            </button>
        </div>

        ${showAllColums}
      </div>
      <div class="px-3 table-wrapper"></div>`;

    this.htmlEmbedded = `<dg-app-menu></dg-app-menu>
      <div class="d-flex justify-content-between py-3 align-items-center row"
        style="padding-left: 1.78rem; padding-right: 1.78rem;">
        <div class="col-12 col-md-6 ps-0 heading-container">
          <a class="filtered-link js-through-link pe-2" aria-current="page" 
            style="vertical-align: top;line-height: 3;" 
            aria-label="Expand current table" href="#">
            <i class="fas fa-external-link-alt"></i>
          </a>

          <h1 class="table-heading me-3 mb-0"></h1>
        </div>

        ${showAllColums}
      </div>
      <div class="px-3 table-wrapper"></div>`;
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  static get observedAttributes () {
    return [ "database", "table", "name", "refresh", "embedded" ];
  }

  get database () { return $( this ).attr( "database" ); }
  get table () { return $( this ).attr( "table" ); }
  get parentId () { return $( this ).attr( "parentId" ); }
  get name () { return this._name; }
  get refresh () { return $( this ).attr( "refresh" ); }
  get embedded () { return this._embedded; }
  get config () {
    let config = window.localStorage.getItem( this.cacheId );

    if ( config ) {
      return JSON.parse( config );
    } 

    return { rows: 50, page: 1 };
  }

  get preferences () {
    return new Promise( rersolve => {
      if ( this._preferences === undefined ) {
        this._preferences = [];

        preference.get( this.database, this.table )
          .then( preferences => {
            preferences = preferences.sort( ( a, b ) => {
              const nameA = a.Name.toUpperCase(); // ignore upper and lowercase
              const nameB = b.Name.toUpperCase(); // ignore upper and lowercase

              if (nameA > nameB) return -1;
              if (nameA < nameB) return 1;
              // names must be equal
              return 0;
            });

            this._preferences = preferences;
            rersolve( this._preferences );
          } )
          .catch( e => {} );
      } else {
        rersolve( this._preferences );
      }
    } );
  }

  get tableConfig () {
    return new Promise ( ( resolve, reject ) => {
      if ( ! this._tableConfig || this._tableConfig.id != this.table ) {
        table.get( this.database, this.table ).then( tables => {
          this._tableConfig = tables.filter( table => table.id == this.table )[0];

          resolve( this._tableConfig );
        } );
      } else {
        resolve( this._tableConfig );
      }
    } );
  }

  set database ( id ) { 
    if ( this?.traceDatabase == id ) return;

    if ( this.table && id ) this.init();
  }
  set table ( id ) { if ( id && this.database ) this.init(); }
  set name ( name ) { 
    $( this ).find( ".table-heading" ).html( name )

    this._name = name;
  }
  set refresh ( refresh ) { this.init() }

  set config ( config ) {
    window.localStorage.setItem( this.cacheId, JSON.stringify( config ) );
  }

  set parentId ( id ) {}
  set embedded ( embedded ) {
    this._embedded = embedded;

    $( this ).find( ".heading-container" ).removeClass( "col-12" )
      .removeClass( "col-md-6" );
  }

  set page ( page ) {
    this.config = {
      ...this.config,
      page: page
    };
    
    $( this ).find( "dg-table-body" )[0].loadRecords();
  }

  set pageSize ( size ) {
    this.config = {
      ...this.config,
      rows: size,
      page: 1
    };
    
    $( this ).find( "dg-table-body" )[0].loadRecords();
  }

  resetConfig ( config ) {
    window.localStorage.removeItem( this.cacheId );

    this.init();
  }

  columnPreference ( preference ) {
    this.config = {
      ...this.config,
      columns: preference
    };
  }

  hideColumn ( column ) {
    this.config = {
      ...this.config,
      columns: {
        ...this.config?.columns,
        [ column.id ]: {
          ...this.config?.columns?.[ column.id ],
          hidden: true
        }
      }
    };

    let col = this.columns.filter( col => col.id == column.id )[0];

    col.hiden = 1;

    $( this ).find( ".show-columns" ).show();
  }

  showColumn ( column ) {
    this.config = {
      ...this.config,
      columns: {
        ...this.config?.columns,
        [ column.id ]: {
          ...this.config?.columns?.[ column.id ],
          hidden: false
        }
      }
    };

    let col = this.columns.filter( col => col.id == column.id )[0];

    col.hiden = 0;

    if ( $( this ).find( "dg-column.hidden" ).length < 1 ) {
      $( this ).find( ".show-columns" ).hide();
    }    
  }

  resizeColumn ( column, width ) {
    this.config = {
      ...this.config,
      columns: {
        ...this.config?.columns,
        [ column.id ]: {
          ...this.config?.columns?.[ column.id ],
          width: width
        }
      }
    };
  }

  lockColumn () {
    this.config = {
      ...this.config,
      lockFirstColumn: true
    };
  }

  unlockColumn () {
    this.config = {
      ...this.config,
      lockFirstColumn: false
    };
  }

  filter ( filters, id = -1 ) {
    this.config = {
      ...this.config,
      filters: filters,
      appliedFilterId: id
    };
    
    this.setFilterChip();

    $( this ).find( "dg-table-body" )[0].loadRecords();
  }

  static tempFilter ( filters, database, table, embedded = false ) {
    let cacheId = `${database}-${table}`;

    if ( embedded ) cacheId += "embedded";

    let config = window.localStorage.getItem( cacheId );

    config = config ? JSON.parse( config ) : { rows: 50, page: 1 };

    config = {
      ...config,
      tempFilters: filters
    };

    window.localStorage.setItem( cacheId, JSON.stringify( config ) );
  }

  static clearTempFilter ( database, table ) {
    let cacheId = `${database}-${table}`,
      config = window.localStorage.getItem( cacheId );

    if ( ! config ) {
      return;
    }

    config = JSON.parse( config );

    delete config.tempFilters;

    window.localStorage.setItem( cacheId, JSON.stringify( config ) );
  }

  sort ( column, sort, fromTableId = -1 ) {
    this.config = {
      ...this.config,
      order: {
        column: column,
        sort: sort
      },
      fromTableId: fromTableId
    };

    $( this ).find( "dg-table-body" )[0].loadRecords();
  }

  async setFilterChip () {
    let name = "Applied Filter",
      $chip = $( "<div>", {
          class: "chip js-active-filter-chip text-light bg-primary me-0 my-0 ms-3"
        } ).css( {
          "padding-top": ".625rem",
          "float": "right",
          "padding-bottom": ".625rem",
          "height": "35px"
        } ),
        filters = this.config.filters;

    if ( 
      ! this.hasAttribute( "embedded" ) && 
      this.config.tempFilters &&
      ! $.isEmptyObject( this.config.tempFilters )
    ) {
      filters = this.config.tempFilters;
    }

    if ( filters && ! jQuery.isEmptyObject( filters ) ) {
      let preferences = await this.preferences;

      if ( this.config.appliedFilterId && preferences ) {
        let preference = preferences
            .filter( preference => preference.id == this.config.appliedFilterId )[0];

        if ( preference ) {
          name = `Filter: ${preference.Name}`;
        }
      }

      $chip.html( `<span class="filter-name">${name}</span> 
        <i class="fas fa-filter"></i>
        <i class="close fas fa-times ms-2"></i>` );

      $( this ).find( ".js-active-filter-chip" ).remove();
      $( this ).find( ".preferences-wrapper" ).prepend( $chip );
    }
  }

  init () {
    if ( ! this.embedded ) {
      $( this ).html( this.html );
    } else {
      $( this ).html( this.htmlEmbedded );
    }

    let $table = $( "<dg-table>", {
      database: this.database,
      table: this.table
    } );
    
    this._preferences = undefined;

    this.traceDatabase = this.database;
    this.traceTable = this.table;

    this.cacheId = `${this.database}-${this.table}`;

    if ( this.hasAttribute( "embedded" ) ) {
      this.cacheId += "embedded";
    }

    $( this ).find( "dg-table, .results-wrapper" ).remove();
    $( this ).find( ".table-wrapper" )
      .append( $table )
      .append( `<dg-pagination class="results-wrapper text-end"></dg-pagination>` );

    this.tableConfig.then( tableConfig => {
      this.form = tableConfig.Form;

      $( this ).find( ".table-heading" ).html( tableConfig.tabelName );
      $( this ).find( "dg-breadcrumb" )[0].load();

      $( this ).find( "dg-table" ).attr( "aria-label", tableConfig.tabelName )


      $( this ).find( ".table-heading" ).trigger( "focus" );
    } );

    this.setFilterChip();

    $( this ).find( "dg-app-menu" )[0].refresh();

    column.get( this.database, this.table )
      .then( columns => {
        let includedColumns = [];

        this.columns = columns;

        for ( const column of columns ) {
          let include = column.hiden == 0;

          if ( this.config?.columns?.[ column.id ] ) {
            if ( this.config.columns[ column.id ].hidden ) {
              column.hiden = 1;

              $( this ).find( ".show-columns" ).show();
            }
            
            if ( this.config.columns[ column.id ]?.seq ) {
              column.seq = this.config.columns[ column.id ]?.seq;
            }

            column.width = this.config.columns[ column.id ]?.width;
          }

          if ( include ) {
            includedColumns.push( column );
          }
        }

        includedColumns = includedColumns.sort( (a, b) => a.seq - b.seq );
        
        $( this ).trigger( "load::columns", [ includedColumns ] );
      } )
      .catch( err => {} );

    timer.get( this.database ).then( async ( timer ) => {
      this._timer = timer;

      let tableConfig = await this.tableConfig;

      if ( tableConfig.TimeLog || ! $.isEmptyObject( timer ) ) {
        $( this ).find( ".table-heading" ).parent().append( `<dg-timer/>` );
      }
    } );

    if ( screen.width < 769 ) {
      $( ".mobile-table-nav-toggle" ).trigger( "click" );
    }
  }

  throughLink ( filters, table, url ) {
    let tempFilters = [],
      index = 0;
      
    filters = JSON.parse( unescape( filters ) );

    for ( let filter of filters ) {
      let filteredColumn;

      if ( ! Number.isInteger( Number( filter.column ) ) ) {
        filteredColumn = this.columns.filter( column => column.columnName == filter.column )[0];
      } else {
        filteredColumn = this.columns.filter( column => column.id == Number( filter.column ) )[0];
      }

      let tempFilter = {
          columnId: filter.columnId ? filter.columnId : filteredColumn.id
        };

      switch ( filter.type ) {
        case "Date":
          if ( filter.from )
            tempFilter.from = DGTemporal.getDateDataValue( filter.from, filter.format );

          if ( filter.to )
            tempFilter.to = DGTemporal.getDateDataValue( filter.to, filter.format );

          break;
        case "Date time":
          // if ( filter.from )
          //   tempFilter.from = util.time().data().dateTime( filter.from, filter.format );

          // if ( filter.to )
          //   tempFilter.to = util.time().data().dateTime( filter.to, filter.format );

          break;
        case "clock":
          if ( filter.from )
            tempFilter.from = DGTemporal.getTimeDataValue( filter.from, filter.format );

          if ( filter.to )
            tempFilter.to = DGTemporal.getTimeDataValue( filter.to, filter.format );
          
          break;
        default:
          tempFilter.filter = filter.value;
          tempFilter.comparative = filter.operator;
          break;
      }

      if ( filter.lookup || filter.fromTableId ) {
        tempFilter.lookup = true;
      } else {
        tempFilter.lookup = false;
      }

      if ( index > 0 ) {
        if ( filter.operator ) {
          tempFilter.operator = filter.operator;
        } else {
          tempFilter.operator = "and";
        }
      }

      tempFilters.push( tempFilter );

      index++;
    }

    DGApp.clearTempFilter( this.database, table );
    DGApp.tempFilter( tempFilters, this.database, table, false );

    $( "dg-table-item._active" ).removeClass( "_active" );

    let $tableItem = $( `dg-database-list dg-database[database='${this.database}'] dg-table-item[table='${table}']` ),
      link = $tableItem.eq(0).find( "a" ).attr( "href" ) ;

    $tableItem.eq( 0 ).addClass( "_active" );

    window.history.pushState("", "", link);
  }

  static addBreadcrumb ( database, table, name ) {
    let breadcrumb = [];

    if ( window.localStorage.getItem( 'breadcrumb' ) ) {
      breadcrumb = window.localStorage.getItem( 'breadcrumb' );
      breadcrumb = JSON.parse( breadcrumb );
      breadcrumb.pop();
    }

    breadcrumb.push( {
        name: name,
        tableId: table,
        link: `/databases/${database}/tables/${table}`
      } );

    window.localStorage.setItem( 'breadcrumb', JSON.stringify( breadcrumb ) );
  }

  connectedCallback () {
    $( this ).attr( "role", "region" );

    for ( const attr of this.getAttributeNames() ) {
      let value = $( this ).attr( attr );

      if ( value ) {
        $( this ).attr( attr, value );
      } else {
        $( this ).prop( attr, true );
      }
    }

    $( this )
      .on( "click", ".show-columns", e => {
        let $table = $( this ).find( "dg-table" );

        $table.toggleClass( "show-hidden" );

        if ( $table.hasClass( "show-hidden" ) ) {
          $( this ).find( ".show-columns" ).html( `<i class="far fa-eye-slash"></i> 
            <span class="label">Hide columns</span>` );
        } else {
          $( this ).find( ".show-columns" ).html( `<i class="far fa-eye"></i> 
            <span class="label">Show all columns</span>` );
        }
      } )
      .on( "click", ".checkbox-container [type='checkbox']", e => {
        let $checked = $( this )
            .find( "dg-table-body .checkbox-container [type='checkbox']:checked" ),
          ids = [];

        $checked.each( function ( index ) {
          ids.push( $( this ).closest( "dg-data-row" )[0].id );
        } );

        this.selectedRecords = ids;
      } )
      .on( "clear::filter", "dg-app-menu", e => {
        $( this ).find( ".js-active-filter-chip" ).remove();
      } )
      .on( "click", ".js-active-filter-chip", e => {
        if ( ! $( e.target ).hasClass( "close" ) ) {
          e.preventDefault();

          new FilterModal( this );

          const modal = new mdbModal( $( '#columnFilterModal' )[0] );
          modal.show();
        }
      } )
      .on( "click", ".js-active-filter-chip .close", e => {
        DGApp.tempFilter( {}, this.database, this.table );

        $( this ).find( "dg-app-menu" )[0].clearFilter();
      } )
      .on( "click", ".mobile-table-nav-toggle", e => {
        $( this ).find( "#table-nav" )
          .slideToggle();
      } )

    $( document )
      .on( "form::submit", "#inputFormModal", ( e, config ) => {
        this.form = JSON.stringify( config.form );
      } );
  }
}

window.customElements.define('dg-app', DGApp);