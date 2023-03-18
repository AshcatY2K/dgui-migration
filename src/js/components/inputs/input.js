import Input from '../mdb/free/input';
import Tooltip from '../mdb/free/tooltip';

import Inputmask from '../inputmask/inputmask';
import { toastSuccess, toastError, screenReaderAlert } from '../../alerts.js';

export default class DGInput extends HTMLElement {
  constructor() {
    super();  

    this.html = ``;
  }

  initInputMask () {
    $( this ).find( '[data-mdb-custom-validator]' ).each( function ( index ) {
      if ( ! Inputmask.getInstance( this ) ) {
        new Inputmask( this, {
            customValidator: $( this ).attr( "data-mdb-custom-validator" ),
            customMask: $( this ).attr( "data-mdb-custom-mask" ),
            inputmask: $( this ).attr( "data-mdb-input-mask" ),
            clearIncomplete: true,
            maskPlaceholder: true
          } );

        $( this ).val( $( this ).val() );
      }
    } );
  }

  static get observedAttributes () {
    return [ 
      "id", "label", "value", "default", "mask", "datemask", "timemask", 
      "minlength", "maxlength", "symbol", "options", "multiple", "format", 
      "table", "database", "required", "disabled", "tooltiptxt", "displaylogic",
      "beforehtml", "afterhtml", "usable", "formats", "guid"
    ];
  }

  get id () { return $( this ).attr( "id" ); }
  get label () { return $( this ).attr( "label" ); }
  get required () { return $( this ).attr( "required" ); }
  get disabled () { return $( this ).attr( "disabled" ); }
  get value () { return $( this ).find( "select, input" ).val(); }
  get minlength () { return $( this ).attr( "minChar" ); }
  get maxlength () { return $( this ).attr( "maxChar" ); }
  get tooltiptxt () { return $( this ).attr( "tooltiptxt" ); }
  get displaylogic () { return this._displaylogic; }
  get beforehtml () { return $( this ).attr( "beforehtml" ); }
  get afterhtml () { return $( this ).attr( "afterhtml" ); }
  get usable () { return $( this ).attr( "usable" ); }
  
  set id ( value ) {
    $( this ).find( "input, select, textarea" ).attr( "id", `input-${value}` );
    $( this ).find( "label" ).attr( "for", `input-${value}` );
  }

  set label ( value ) {
    this.identifier = value;
    $( this ).find( "label" ).html( unescape( value ) );
    $( this ).find( "input" ).attr( "title", unescape( value ) );
  }

  set required ( value ) {
    let label = $( this ).find( "label" ).html();

    if ( label )
      label = label.replace( /\*$/g, "" );

    $( this ).find( "label" ).html( label + "*" );
    $( this ).find( ".invalid-feedback" ).html( "This field is required" );
    $( this ).find( "input, select, textarea" ).prop( "required", value );
  }

  set disabled ( value ) {
    $( this ).find( "input, select, textarea" ).prop( "disabled", value );
  }

  set value ( value ) {
    $( this ).find( "input, select, textarea" ).val( value );
    
    this?.inputInstance?.update();

    $( this ).find( ".display-wrapper" ).html( DGInput.getDisplayValue( value ) );

    $( this ).find( "input, select, textarea" ).trigger( "change" );
  }

  set minlength ( value ) {
    $( this ).find( "input, textarea" ).attr( "minlength", value );
  }

  set maxlength ( value ) {
    $( this ).find( "input, textarea" ).attr( "maxlength", value )
      .trigger( "input" );
  }

  set tooltiptxt ( tooltip ) {
    $( this ).attr( "data-mdb-toggle", "tooltip" )
      .attr( "title", this.tooltiptxt );
      
    new Tooltip( this );
  }

  set displaylogic ( displaylogic ) {
    this._displaylogic = displaylogic;
    
    displaylogic = JSON.parse( displaylogic );

    for ( const logic of displaylogic ) {
      let id = `#${logic.columnId}`;

      $( this ).closest( "form" )
        .on( "change", id, e => {
          this.displayTrigger( logic, e.currentTarget.value );
        } )
        .on( "keyup", id, e => {
          this.displayTrigger( logic, e.currentTarget.value );
        } );
    }
  }

  set beforehtml ( content ) {
    $( this ).find( ".form-outline" ).addClass( "group" ).addClass( "before" );

    $( this ).find( "input" ).before( `<span class="input-group-text">
        ${content}
      </span>` );
  }

  set afterhtml ( content ) {
    $( this ).find( ".form-outline" ).addClass( "group" ).addClass( "after" );

    $( this ).find( "label" ).after( `<span class="input-group-text">
        ${content}
      </span>` );
  }
  
  static getDisplayValue ( value ) {
    return typeof value == "boolean" ? "" : value;
  }

  static getThroughLink ( config, value ) {    
    return $( "<a>", {
        class: 'btn btn-info btn-sm filtered-link',
        "data-filter": escape( JSON.stringify( config.filter ) ),
        "data-table": config.table,
        href: `/databases/${config.database}/tables/${config.table}`
      } ).html( value );
  }

  checkTrigger ( operation, logicValue, value ) {
    let regex;
    
    switch ( operation ) {
      case "=":
        return value == logicValue ? true : false;
        break;
      case "!":
        return value != logicValue ? true : false;
        break;
      case ">":
        return value > logicValue ? true : false;
        break;
      case "<":
        return value < logicValue ? true : false;
        break;
      case "in":
      case "not in":
        regex = "";
    
        for ( let piece of value.split( "," ) ) {
          regex += `${piece},|${piece}\]?$`;
        }

        regex = new RegExp( `(${regex})`, "g" );
        
        if ( operation === "in" ) {
          return regex.test( logicValue );
        } else {
          return ! regex.test( logicValue );
        }

        break;
      case "contains":
        return logicValue.includes( value );
        break;
    }
  }

  displayTrigger ( logic, value ) {
    let $input = $( this ).find( "input, textarea" ),
      style = $input.attr( "style" ),
      triggered = this.checkTrigger( logic.operation, logic.value, value );

    switch ( logic?.action ) {
      case "style": 
        if ( triggered ) {
          style += logic.css + ";";
        }

        break;
      case "alert": 
        if ( triggered ) {
          toastError( logic.title, logic.message );
        }

        break;
      case "info":
        if ( triggered ) {
          toastSuccess( logic.title, logic.message );
        }

        break;
      case "hide":
        if ( $( this ).closest( ".row" ).length < 1 ) {
          triggered ? $( this ).hide() : $( this ).show();
        } else {
          triggered ? $( this ).parent().hide() : $( this ).parent().show();
        }

        break;
      case "disable":
        $( this ).attr( "disabled", triggered ? true : false );
        break;
    }

    $input.attr( "style", style );
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  initInput () {
    let $outline = $( this ).find( '.form-outline' );
    
    $( this ).find( ".form-counter" ).attr( "aria-hidden", true );

    if ( $outline.length > 0 ) {
      this.inputInstance = new Input( $outline[0] );
      this.inputInstance.init();
    }

    return this;
  }

  updateLabel () {  
    let width = $( this ).find( "label" ).width();
    
    $( this ).find( ".form-notch-middle" ).width( width );
  }

  connectedCallback () {
    $( this ).addClass( "mb-4 input-wrapper custom-input" )
      .append( `<div class="display-wrapper"></div>` + this.html );

    this.initInput().initInputMask();

    this.ready();

    for ( const attr of this.getAttributeNames() ) {
      let value = $( this ).attr( attr );

      if ( value ) {
        $( this ).attr( attr, value );
      } else {
        $( this ).prop( attr, true );
      }
    }

    if ( this.inputInstance?.update ) {
      this.inputInstance.update();
    }

    this.updateLabel();
  }

  ready () {
    let $fromText = $( this ).find( ".form-text" );

    if ( $fromText.length > 0 && $fromText.html() ) {
      $( this ).removeClass( "mb-4" ).addClass( "mb-1" );
    }

    $( this ).find( "select, input, textarea" ).on( "change", e => {
      $( this ).trigger( "change" );
    } );
  }
}

window.customElements.define('dg-input', DGInput);