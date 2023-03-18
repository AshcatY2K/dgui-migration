import Select from '../mdb/pro/select';

import DGInput from './input.js';

export default class DGDropdown extends DGInput {
  constructor() {
    super();

    this.conf = {};

    this.html = `<select class="select">
        <option value=''>( Blank )</option>
      </select>
      <label class="form-label select-label"></label>`;
  }

  get options () { return $( this ).attr( "options" ); }
  get multiple () { return $( this ).attr( "multiple" ); }
  get value () {
    let value = this?.selectInstance?.value;

    return Array.isArray( value ) ? JSON.stringify( value ) : value;
  }

  set options ( options ) {
    let $select = $( this ).find( "select" ),
      stringToOptions = ( options ) => {
        options = options.replace(/^"|"$/gm,'').split( "," );
        options = options.map( Function.prototype.call, String.prototype.trim );
        options.sort();

        for ( let option of options ) {
          let $option = $( "<option>", {
            value: option,
            title: option
          } ).html( option );

          $select.append( $option );
        }
      };

    $select.html( "" );

    let $option = $( "<option>", {
      value: "",
      title: "( Blank )"
    } ).html( "( Blank )" );

    $select.append( $option );

    if ( typeof options === "string" ) {
      try {
        options = JSON.parse( options );

        if ( typeof options === "string" ) {
          stringToOptions( options );
        } else {
          for ( let option of options ) {
            $option = $( "<option>", {
              value: option.value,
              title: option.label
            } ).html( option.label );

            if ( option?.secondaryText ) {
              $option.attr( "data-mdb-secondary-text", option.secondaryText );
            }

            $select.append( $option );
          }
        }
      } catch ( e ) {
        stringToOptions( options );
      }
    }

    if ( this.selectInstance ) {
      let value = this.conf.value;

      if ( this.hasAttribute( "multiple" ) && value ) {
        for ( const option of value ) {
          $select
            .find( `option[value='${option}']` )
            .attr( "selected", "selected");
        }
      }

      this.selectInstance.setValue( value );

      $( this ).find( "select" ).trigger( "change" );
    }

    if ( this._value && ! this.value ) {
      this?.selectInstance?.setValue( this._value );
    }

    super.updateLabel();
  }

  set multiple ( value ) {
    $( this ).find( "select" ).prop( "multiple", value ? true : false );

    $(this).find( "option[value='']" ).remove();

    if ( this.selectInstance ) {
      this.selectInstance.dispose();
      this.initSelect();
    }
  }

  set value ( value ) {
    //value = value.toLowerCase();

    if ( this.hasAttribute( "multiple" ) && value ) {
      try {
        value = JSON.parse( value );
      } catch ( e ) {
        value = [ value ];
      }
    }
    
    this._value = value;

    this?.selectInstance?.setValue( value );

    $( this ).find( ".display-wrapper" )
      .append( DGDropdown.getDisplayValue( value, this.multiple ) );

    this.conf.value = value;

    $( this ).find( "select" ).trigger( "change" );
  }
  
  static getDisplayValue ( value, multiple ) {
    let html = "";
    
    if ( typeof value == "boolean" || value == "[]") {
      return "";
    }

    if ( multiple && Array.isArray( value ) ) {
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

  initSelect () {
    let $select = $( this ).find( 'select' ),
      config = { filter: true, optionHeight: 60 },
      $modal = $select.closest( ".modal" );

    if ( $modal.length > 0 ) {
      config.container = "#" + $modal.attr( "id" );
    }

    if ( this.required ) {
      config.validation = true;
      config.invalidFeedback = "This field is required";
    }    

    if ( this.multiple ) {
      config.multiple = true;
    }

    config.autoSelect = true;

    this.selectInstance = new Select( $select[0], config );
  }
    
  ready () {
    this.initSelect();

    $( this ).find( ".select-input" ).attr( "role", "listbox" );

    $( this ).find( "input" ).attr( "pattern", "^(?!\( Blank \)$).*$" );

    super.ready();
  }
}

window.customElements.define('dg-dropdown', DGDropdown);