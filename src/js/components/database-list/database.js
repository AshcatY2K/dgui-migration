import DGDatabaseList from './list.js';
import './table-list/list.js';

import edit from '/src/js/forms/database/edit.js';

import Dialog from '/src/js/components/dialog.js';

import { remove } from '/src/js/controllers/database.js';

import { toastSuccess, toastError } from '/src/js/alerts.js';

export default class DGDatabase extends HTMLElement {
  constructor() {
    super();

    this.html = `<span class="name"></span>`;

    this.optionsHtml = `<button class="more-options" role="button" 
      aria-label="more options" tabindex="0">
        ⋮
      </button>
      <span class="options -dabatase shadow-1-strong"
        data-label="Declines">
        <button type="button" class="edit" tabindex="0" 
          aria-label="Edit">
          Edit
        </button>
        <button type="button" class="remove" 
          tabindex="0" aria-label="Delete">
          Delete
        </button>
      </span>`;
  }

  static get observedAttributes () {
    return [ "database", "table", "name", "designer" ];
  }

  get name () { return $( this ).attr( "name" ) }
  get database () { return $( this ).attr( "database" ) }
  get table () { return $( this ).attr( "table" ) }
  get designer () { return this._designer }
  
  set name ( name ) { 
    $( this ).find( ".name" ).html( name );
    $( this ).attr( "aria-label", name );
  }
  set database ( database ) { }
  set table ( table ) { }
  set designer ( designer ) {
    if ( designer === "true" ) {
      this._designer = true;
      $( this ).append( this.optionsHtml );
    } else {
      this._designer = false;
    }
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  populate ( e ) {
    $( this ).toggleClass( "collapsed" );

    if ( this.hasAttribute( "loaded" ) ) {
      $( this ).find( "dg-table-list" ).slideToggle();

      return;
    }

    let $list = $( "<dg-table-list>", { 
      database: this.database,
      table: this.table
    } );

    $( this ).append( $list ).attr( "loaded", true );
  }

  relaodLists () {
    for ( const instance of DGDatabaseList.instances ) {
      instance.load();
    }
  }

  edit ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();

    let dialog = new edit( this.name, this.database );

    dialog.then( name => {
      if ( ! name ) return;

      this.relaodLists();
    } );
  }

  remove ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();
    
    const dialog = new Dialog();

    dialog.confirm( `You are about to delete database ${this.name}` )
      .then( res => { 
        if ( ! res ) return;

        remove( this.database ).then( res => {
          toastSuccess( "Deleted", `Database ${this.name} has been removed` );

          this.relaodLists();
        } );
      } );
  }

  connectedCallback () {
    let populate = this.populate.bind( this ),
      edit = this.edit.bind( this ),
      remove = this.remove.bind( this );

    $( this ).attr( "tabindex", "0" ).addClass( "collapsed" );

    $( this )
      .attr( "role", "application" )
      .html( this.html );

    for ( const attr of this.getAttributeNames() ) {
      let value = $( this ).attr( attr );

      if ( value ) {
        $( this ).attr( attr, value );
      } else {
        $( this ).prop( attr, true );
      }
    }

    $( this )
      .on( "click", ".options.-dabatase .edit", edit )
      .on( "click", ".options.-dabatase .remove", remove )
      .on( "click", populate )
      .on( "keypress", ".more-options", e => {
        e.preventDefault();
        e.stopImmediatePropagation();

        $( ".more-options" ).removeClass( "hover" );

        if ( e.which == 13 || e.keyCode == 32 ) {
          $( e.currentTarget ).addClass( "hover" );
        }
      } )
      .on( "keypress", e => {
        if ( e.which == 13 || e.keyCode == 32 ) {
          $( this ).trigger( "click" );
        }
      } );
  }
}

window.customElements.define('dg-database', DGDatabase);