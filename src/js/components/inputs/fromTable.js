import Select from '../mdb/pro/select';
import * as record from '/src/js/controllers/record.js';

import DGInput from './input.js';

export default class DGFromTable extends DGInput {
  constructor() {
    super();

    this.html = `<select class="select">
        <option value="" selected>( Blank )</option>
      </select>

      <div class="select-custom-content">
        <span class="loader" 
          style="position: relative; top: 0; transform: translateY(0) translateX(-50%);"></span>
      </div>
      <label class="form-label select-label"></label>`;
  }

  get multiple () { return $( this ).attr( "multiple" ); }
  get value () { return $( this ).find( "select" ).val(); }
  get lookupValue () { 
    let value = this.value;
    
    return $( this ).find( `select option[value='${value}']` ).html();
  }
  get guid () { return this._guid; }

  set multiple ( value ) {
    $( this ).find( "select" ).prop( "multiple", value ? true : false );
  }

  set value ( value ) {
    let $select = $( this ).find( "select" );
    
    if ( $select.find( "option" ).length < 2 ) {
      let $option = $( "<option>", { 
          value: value.value,
          selected: true
        } ).html( value.label );

      $select.append( $option );
    }

    if ( this.selectInstance ) {
      this.selectInstance.setValue( value.value );
    }

    $( this ).find( ".display-wrapper" )
      .append( DGFromTable.getDisplayValue( value.value, this.multiple ) );

    super.updateLabel();
  }

  set guid ( guid ) { this._guid = guid; }
  
  static getDisplayValue ( value, multiple ) {
    let html = "";
    
    if ( typeof value == "boolean" ) {
      return "";
    }

    if ( multiple ) {
      for ( let option of value ) {
        if ( option !== "( Blank )" ) {
          html += `<div class="chip btn-info">${option}</div>`;
        }
      };
    } else if ( value !== "( Blank )" ) {
      html = `${value}`;
    }

    return html;
  }

  setDefaultOption ( value, txt ) {
    this.value = value;

    if ( $( this ).find( `option[value="${value}"]` ).length < 1 ) {
      let $option = $( "<option>", {
          value: value,
          selected: true
        } ).html( txt );

      $( this ).find( "select" ).append( $option );
    }
  }

  sort ( a, b ) {
    let nameA = a[ this.key ],
      nameB = b[ this.key ]; 

    if ( typeof a[ this.key ] === "string" ) {
      if ( nameA ) nameA = nameA.toUpperCase();
      if ( nameB ) nameB = nameB.toUpperCase();
    }

    if ( nameA < nameB ) {
      return -1;
    } else if ( nameA > nameB ) {
      return 1;
    }
    // names must be equal
    return 0;
  }

  async populate () {
    let $select = $( this ).find( "select" ),
      setValue = this.value,
      records;

    if ( 
        $select.find( "option" ).length > 2 || 
        ! this.table || 
        ! this.database 
      ) {
      return;
    }

    $( this ).find( "option[selected]:not( [value=''] )" ).remove();

    if ( ! this.guid ) {
      records = await record.get( this.database, this.table, 1 );
    } else {
      records = await record.getByGuid( this.guid, this.table );
    }

    if ( records.records.length > 0 ) {
      let sort = this.sort.bind( this );
      this.key = Object.keys( records.records[0] )[1];

      records.records.sort( sort );

      records.records.forEach( ( record, index) => {
        record = Object.values( record );

        let $option = $( "<option>", { value: record[ 0 ] } )
          .html( record[ 1 ] );

        if ( setValue == record[0] ) {
          $option.prop( "selected", true );
        }

        $select.append( $option );
      } );

      this.selectInstance.setValue( this.value );
    }

    $( ".select-custom-content .loader" ).hide();

    setTimeout( () => {
      $( ".select-dropdown-container .select-option-text" ).each( ( i, el ) => {
        let label = $( el ).html().replace( /\<[^\>]*\>/g, "" );

        $( el ).attr( "aria-label", label ).attr( "tabindex", 0 );
      } )
    }, 10 )
  }

  ready () {    
    let $select = $( this ).find( 'select' ),
      config = { filter: true, optionHeight: 60, autoSelect: true },
      $modal = $select.closest( ".modal" ),
      openSelect = this.populate.bind( this );

    if ( $modal.length > 0 ) {
      config.container = "#" + $modal.attr( "id" );
    }

    if ( this.required ) {
      config.validation = true;
      config.validFeedback = "This field is required";
    }

    this.selectInstance = new Select( $select[0], config );

    $( this ).find( ".select-input" ).attr( "role", "listbox" );

    $select.on( "open.mdb.select", openSelect );
    
    super.ready();
  }
}

window.customElements.define('dg-from-table', DGFromTable);

$( document )
  .on( "keyup", ".select-dropdown-container", ( e ) => {
    if ( e.keyCode == 40 || e.keyCode == 38 ) {
      let $input = $( e.target ).closest( ".select-dropdown-container" )
          .find( ".active input" ),
        label = $input.attr( "aria-label" );

      if ( label ) {
        $input.focus();
      }
    }
  } )