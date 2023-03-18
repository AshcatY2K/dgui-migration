import DGTableList from './list.js';

import edit from '/src/js/forms/table/edit.js';

import Dialog from '/src/js/components/dialog.js';
import DGApp from '/src/js/components/app.js';
import Tooltip from '/src/js/components/mdb/free/tooltip';

import { remove } from '/src/js/controllers/table.js';

import { toastSuccess, toastError } from '/src/js/alerts.js';

export default class DGTable extends HTMLElement {
  constructor() {
    super();  

    this.html = `<a class="name" href="#"></a>`;

    this.optionsHtml = `<button class="more-options" role="button" aria-label="more options" >
        ⋮
      </button>
      <span class="options -table shadow-1-strong"
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
    return [ "name", "database", "table", "description", "designer", "timelog" ];
  }

  get name () { return $( this ).attr( "name" ) }
  get table () { return $( this ).attr( "table" ) }
  get description () { return $( this ).attr( "description" ) }
  get designer () { return $( this ).attr( "designer" ) }
  get timelog () { return $( this ).attr( "timelog" ) }
  
  set name ( name ) { $( this ).find( ".name" ).html( name ) }
  set table ( table ) {
    this.link = `/databases/${this.database}/tables/${this.table}`;

    $( this ).find( ".name" ).attr( "href", this.link );
  }
  set description ( description ) {
    if ( description && typeof description === 'string' ) {
      new Tooltip( this, { title: description } );
    }
  }

  set designer ( designer ) {
    if ( designer == "1" ) {
      $( this ).append( this.optionsHtml );
    }
  }
  set timelog ( timelog ) {}

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  relaodLists () {
    for ( const instance of DGTableList.instances ) {
      instance.load();
    }
  }

  edit ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();

    let config = {
        name: this.name, 
        description: this.description, 
        timelog: this.timelog
      },
      dialog = new edit( config, this.database, this.table );

    dialog.then( config => {
      if ( ! config ) return;

      this.relaodLists();
    } );
  }

  remove ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();
    
    const dialog = new Dialog();

    dialog.confirm( `You are about to delete table ${this.name}` )
      .then( res => { 
        if ( ! res ) return;

        remove( this.database, this.table )
          .then( res =>  {
            toastSuccess( "Deleted", `Table ${this.name} has been removed` );

            this.relaodLists();
          } );
      } );
  }

  click ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if ( this.hasAttribute( "disabled" ) ) {
      return;
    }

    $( this ).attr( "disabled", "disabled" );

    setTimeout( () => { $( this ).removeAttr( "disabled" ) }, 500 );

    DGApp.clearTempFilter( this.database, this.table );
    window.localStorage.removeItem( 'breadcrumb' );
    
    window.history.pushState("", "", this.link);

    $( "dg-table-item._active" ).removeClass( "_active" );

    $( this ).addClass( "_active" );
    
    $( "dg-panel .btn-close" ).trigger( "click" );
  
    if ( screen.width < 769 ) {
      $( "#mobile-nav-toggle" ).trigger( "click" );
    }
  }

  connectedCallback () {
    let edit = this.edit.bind( this ),
        remove = this.remove.bind( this ),
        click = this.click.bind( this );

    this.database = $( this ).closest( "dg-table-list" )[0].database;

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
      .on( "click", click )
      .on( "click", "a", click )
      .on( "click", ".options.-table .edit", edit )
      .on( "click", ".options.-table .remove", remove )
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

window.customElements.define('dg-table-item', DGTable);