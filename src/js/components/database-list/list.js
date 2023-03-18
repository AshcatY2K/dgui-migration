import './database.js';

import * as database from '/src/js/controllers/database.js';

import add from '/src/js/forms/database/add.js';

export default class DGDatabaseList extends HTMLElement {
  constructor() {
    super();

    if ( DGDatabaseList?.instances ) {
      DGDatabaseList.instances.push( this );
    } else {
      DGDatabaseList.instances = [ this ];
    }

    this.html = `<div class="loader" aria-label="Loading page"></div>`;
  }

  static get observedAttributes () {
    return [ "database", "table" ];
  }

  get database () { return this._database }
  get table () { return $( this ).attr( "table" ) }

  set database ( database ) {
    let $item = $( this ).find( `dg-database[database="${database}"]` );
    
    if ( this.database !== database ) {
      this.load();
    }

    this._database = database;

    if ( $item.hasClass( 'collapsed' ) ) {
      $item.trigger( "click" );
    }

    if ( this?.table ) {
      $item.attr( 'table', this?.table );
    }
  }

  set table ( table ) {
    if ( this?.database ) {
      let $item = $( this ).find( `dg-database[database="${database}"]` );

      $item.attr( 'table', table );
    }
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  checkStatus ( database ) {
    if ( 
      $( this ).hasClass( "_horizontal" ) &&
      database?.Status && 
      database?.Status !== "active" 
    ) {
      $( this ).prepend( `<div class="alert alert-warning" role="alert" 
        data-mdb-color="warning">${database.DatabaseStatus}</div>` );
    }
  }

  sortDatabases ( a, b ) {
    let aName = a["Database"].toUpperCase(),
      bName = b["Database"].toUpperCase();

    return aName == bName ? 0 : aName < bName ? -1 : 1;
  }

  load () {
    database.get().then( databases => {
      databases = databases.sort( this.sortDatabases );

      $( this ).html( "" );

      for ( let database of databases ) {
        let $database = $( "<dg-database>", {
          database: database.id,
          name: database[ "Database" ],
          designer: database[ "Application Designer" ]
        } );
        
        if ( this?.database == database.id ) {
          $database.attr( "table", this?.table )
        }
        
        if ( this.database == database.id && databases.length > 1 ) {
          $( this ).prepend( `<div class="all-databases collapsed" role="button" 
              aria-label="Show all databases">
                <span class="name">All databases</span>
                <i class="fas fa-angle-down"></i>
              </div>` )
          $( this ).prepend( $database );
          $database.trigger( "click" );
        } else {
          $( this ).append( $database );
        }

        if ( this.database && databases.length < 2 ) {
          $database.trigger( "click" );
        }

        this.checkStatus( database );
      }

      if ( window.localStorage.getItem( 'CanCreateDatabase' ) == "1" ) {
        $( this ).append( `<button class="btn_clear add-database collapsed mb-3" 
            title="Add a database" aria-label="Add a database">
            <span class="name" style="border: none;">
              <i class="fas fa-plus"></i>
              Database
            </span>
          </button>` );
      }

      if ( databases.length == 1 && $( this ).hasClass( "_horizontal" ) ) {
        $( this ).find( "dg-database" ).trigger( "click" );
        $( this ).find( "dg-database > .name" ).attr( "data-mdb-target", "step-1" )
      }

      $( this ).parent().animate( { scrollTop: 0 }, 300 );

      $( ".tooltip" ).remove();
    } );
  }

  connectedCallback () {
    $( this ).html( this.html );

    this.load();

    $( this )
      .on( "click", ".add-database", e => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let dialog = new add();

        dialog.then( name => { 
          if ( ! name ) return;

          for ( const instance of DGDatabaseList.instances ) {
            instance.load();
          }
        } );
      } )
      .on( "click", ".all-databases", e => {
        e.preventDefault();
        e.stopImmediatePropagation();

        $( e.currentTarget ).toggleClass( "collapsed" );
        $( e.currentTarget ).find( "i" ).toggleClass( "fa-angle-down" )
          .toggleClass( "fa-angle-up" );
      } );
  }
}

window.customElements.define('dg-database-list', DGDatabaseList);