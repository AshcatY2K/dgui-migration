import Input from '../mdb/free/input';
import Tooltip from '../mdb/free/tooltip';
import { remove } from '/src/js/controllers/preferences.js';

import Inputmask from '../inputmask/inputmask';
import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

import Dialog from '/src/js/components/dialog.js';

export default class DGFilterLink  extends HTMLElement {
  constructor() {
    super();  

    this.html = `<span class="name"></span>
      <button class="btn btn-sm text-dark shadow-0 remove" 
        aria-label="Delete filter">
        <i class="far fa-trash-alt"></i>
      </button>`;
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  static get observedAttributes () {
    return [ "id", "name" ];
  }

  get id () { return this._id; }
  get name () { return this._name; }
  
  set id ( id ) { this._id = id; }

  set name ( name ) {
    this._name = name;

    $( this ).find( ".name" ).html( name );
  }

  async click ( e ) {
    e.preventDefault();

    let preferences = await this.app.preferences,
      preference = preferences.filter( preference => preference.id == this.id )[0];

    this.app.filter( JSON.parse( preference.Preference ).filters, this.id );
  }

  remove ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const dialog = new Dialog();

    dialog.confirm( `Are you sure you want to delete filter ${this.name}?` )
      .then( async res => {
        if ( res ) {
          let preferences = await this.app.preferences,
            index = preferences.findIndex( pref => pref.id == this.id );
          
          preferences.splice( index, 1 );
          remove( this.app.database, this.app.table, this.id ).then( async res => { 
          
              $( this.app ).find( "dg-table-body" )[0].init();
              $( this ).remove();
            } );
        }
      } );
  }

  connectedCallback () {
    $( this ).append(  this.html );

    this.app = $( this ).closest( "dg-app" )[0];

    for ( const attr of this.getAttributeNames() ) {
      if ( this[ attr ] ) {
        $( this ).attr( attr, this[ attr ] );
      } else {
        $( this ).prop( attr, true );
      }
    }

    $( this )
      .on( "click", ".remove", this.remove.bind( this ) )
      .on( "click", this.click.bind( this ) );
  }
}

window.customElements.define('dg-filter-link', DGFilterLink );