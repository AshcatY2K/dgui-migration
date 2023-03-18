import './table.js';

import * as table from '/src/js/controllers/table.js';

import add from '/src/js/forms/table/add.js';

export default class DGTableList extends HTMLElement {
  constructor() {
    super();

    if ( DGTableList?.instances ) {
      DGTableList.instances.push( this );
    } else {
      DGTableList.instances = [ this ];
    }

    this.html = `<div class="loader" aria-label="Loading page"></div>`;
  }

  static get observedAttributes () {
    return [ "database", "table" ];
  }

  get database () { return $( this ).attr( "database" ); }
  get table () { return $( this ).attr( "table" ); }
  
  set database ( database ) { }
  set table ( table ) { }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  sortTable ( a, b ) {
    let aName = a["Group Name"].toUpperCase(),
      bName = b["Group Name"].toUpperCase();

    return aName == bName ? 0 : aName < bName ? -1 : 1;
  }

  load () {
    table.get( this.database )
      .then( tables => {
        let group;

        tables = tables.sort( this.sortTable );

        $( this ).html( "" );

        for ( let table of tables ) {
          let groupName = table[ "Group Name" ],
            $table = $( "<dg-table-item>", {
              table: table.id,
              name: table[ "tabelName" ],
              description: table.Description,
              designer: table.Designer,
              timelog: table.TimeLog
            } );

          if ( groupName.toLowerCase() == "hidden" ) {
            continue;
          }

          if ( groupName ) {
            let groupName = table[ "Group Name" ];

            if ( group !== groupName ) {
              group = groupName;

              $( this ).append( $( `<div class="group" data-group="${group}"
                  role="button" aria-label="Expand ${group} table group" >
                  <span class="name">${group}</span>
                  <i class="fas fa-angle-up"></i>
                </div>` ) );
            } 

            $table.attr( "group", groupName )
              .addClass( "collapsed" );

            group = groupName;
          }

          if ( this?.table == table.id ) {
            $table.addClass( "_active" );
          }

          $( this ).append( $table );
        }

        if ( this?.table ) {
          let group = $( this ).find( "._active" ).attr( "group" );

          $( this ).find( `[data-group="${group}"]` ).trigger( "click" );
        }
        
        if ( $( this ).closest( "dg-database" )[0].designer ) {
          $( this ).append( `<button class="btn_clear add-table collapsed" 
              title="Add a table" aria-label="Add a table">
              <span class="name">
                <i class="fas fa-plus"></i>
                Table
              </span>
            </button>` );
        }

        $( this ).find( ".group" ).trigger( "click" );
      } )
      .catch( e => {
        let error = "An error accured. Please try again later.";

        e = JSON.parse( e );

        if ( e.errors ) error = e.errors;

        $( this ).html( "" );

        $( this ).append( `<div class="alert alert-warning me-4" role="alert" 
            data-mdb-color="warning">
            ${error}
          </div>` );
      } );
  }

  expandGroup ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();

    let $target = $( e.target ).closest( "[data-group]" ),
      group = $target.attr( "data-group" ),
      $items = $( this ).find( `dg-table-item[group='${group}']` );
        
    $items.slideToggle();
    
    $target.find( ".fas" )
      .toggleClass( "fa-angle-up" ).toggleClass( "fa-angle-down" );
  }

  connectedCallback () {
    let expandGroup = this.expandGroup.bind( this );

    $( this ).html( this.html );

    this.load();

    $( this )
      .on( "click", ".group[data-group]", expandGroup )
      .on( "click", ".add-table", e => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let dialog = new add( this.database );

        dialog.then( config => {
          if ( ! config ) return;          

          for ( const instance of DGTableList.instances ) {
            instance.load();
          }
        } );
      } );
  }
}

window.customElements.define('dg-table-list', DGTableList);