import * as inputHelper from '/src/js/helpers/input.js';
import { columnToInput } from '/src/js/helpers/inputGenerator.js';

import Datepicker from '/src/js/components/mdb/pro/datepicker';
import Datetimepicker from '/src/js/components/mdb/pro/date-time-picker';
import Timepicker from '/src/js/components/mdb/pro/timepicker';

class Filter extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes () {
    return [ 
      "column", "comparative", "value", "operator", "from", "to", "lookup", 
      "locked"
    ];
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  get column () { return this._column; }
  get comparative () { return this._comparative; }
  get value () { return this._value; }
  get operator () { return this._operator; }
  get from () { return this._from; }
  get to () { return this._to; }
  get lookup () { return this._lookup; }
  get locked () { return this._locked; }

  set comparative ( comparative ) { 
    this._comparative = comparative;
    
    if ( $( this ).find( "[id^='comparative']" ).length > 0 ) {
      let $select = $( this ).find( `[id^='comparative']` ),
        $option = $select.find( `option[value='${comparative}']` );
        
      if ( $option.length > 0 ) {
        $select[0].value = comparative;
      } else {
        $select[0].value = $select.find( "option:not([value=''])" ).eq( 0 ).val();
      }
    }
  }
  set from ( from ) { this._from = from; }
  set to ( to ) { this._to = to; }
  set lookup ( lookup ) { this._lookup = lookup; }

  set value ( value ) { 
    this._value = value;

    let modal = $( this ).closest( ".modal" )[0];

    if ( modal ) {
      let column = modal.columns.filter( column => column.id == this.column )[0];
    }

    if ( $( this ).find( "[id^=filter]" ).length < 1 ) {
      return;
    }

    $( this ).find( "[id^=filter]" )[0].value = value;
  }

  set column ( column ) {
    this._column = column;

    $( this ).find( "[id^=column]" ).attr( "value", column );
  }

  set operator ( operator ) {
    this._operator = operator;

    if ( operator ) {
      $( this ).find( `[name^='operator']:checked` ).prop( "checked", false );
      $( this ).find( `[name^='operator'][value=${operator}]` ).prop( "checked", true );
    }
  }

  set locked ( locked ) {
    this._locked = locked;

    if ( this.hasAttribute( "locked" ) ) {
      $( this ).find( "[id^=column], [id^=comparative], [id^=filter]" )
        .prop( "disabled", true );

      $( this ).find( ".remove" ).remove();
    }
  }

  set comparatives ( comparatives ) {
    this._comparatives = comparatives;
  }

  async columnSelect ( e ) {
    let id = $( this ).find( "[id^=column]" )[0].value,
      modal = $( this ).closest( ".modal" )[0],
      column = modal.columns.filter( column => column.id == id )[0],
      $inputContainer = $( this ).find( ".input-container" ),
      $inputToContainer = $( this ).find( ".js-input-to-container" ),
      $filterContainer = $( this ).find( ".comparative-container" ),
      $toInput;

    column = { 
      ...column,
      ReadOnly: 0,
      formula: false
    };

    $( this ).find( ".column-container" ).removeClass( "col-sm-3" )
      .addClass( "col-sm-4" );

    $inputContainer.html( "" ).hide();
    $inputToContainer.html( "" ).hide();
    $filterContainer.hide().find( "[id^='comparative']" )
      .removeAttr( "required" );

    column["default value"] = null;

    if ( [ "date time", "date", "clock" ].includes( column.type ) ) {
      let $fromInput = columnToInput( { ...column, id: `From${this.timestamp}`, columnName: "From" } );
      let $toInput = columnToInput( { ...column, id: `To${this.timestamp}`, columnName: "To" } );

      $inputContainer.append( $fromInput ).show();
      $inputToContainer.append( $toInput ).show();

      if ( this.from ) {
        $fromInput[0].value = this.from;
      }

      if ( this.to ) {
        $toInput[0].value = this.to;
      }

      let from = $( this ).find( "[id^=From]" )[0],
        to = $( this ).find( "[id^=To]" )[0];

      switch ( column.type ) {
        case "date time":
          $fromInput.on( "change datetimeChange.mdb.datetimepicker", e => {
            to.dateTimeInstance._datepicker.update( { min: from.dateTimeInstance._dateValue } );
          } );

          $toInput.on( "change datetimeChange.mdb.datetimepicker", e => {
            from.dateTimeInstance._datepicker.update( { max: to.dateTimeInstance._dateValue } );
          } );
          
          break;
        case "date":
          $fromInput.on( "change dateChange.mdb.datepicker", e => {
            to.dateInstance.update( { min: from.dateInstance._selectedDate } )
          } );

          $toInput.on( "change dateChange.mdb.datepicker", e => {
            from.dateInstance.update( { max: to.dateInstance._selectedDate } )
          } );

          break;
        case "clock":
          $fromInput.on( "change input.mdb.timepicker", e => {
            to.timerInstance.update( { minTime: $from[0].value } )
          } );

          $toInput.on( "change input.mdb.timepicker", e => {
            from.timerInstance.update( { maxTime: $to[0].value } )
          } );

          break;
      }

      if ( this.from ) {
        $fromInput.find( ".datetimepicker, .datepicker, .timepicker-input" )
          .trigger( "change" );
      }

      if ( this.to ) {
        $toInput.find( ".datetimepicker, .datepicker, .timepicker-input" )
          .trigger( "change" );
      }
    } else {
      let operations = [
            { value: "equals", label: "Equals" },
            { value: "not-equals", label: "Doesn't equal" },
            { value: "contains", label: "Contains", selected: true },
            { value: "not-contains", label: "Doesn't contain" },
            { value: "starts", label: "Starts with" },
            { value: "not-starts", label: "Doesn't start with" },
            { value: "ends", label: "Ends with" },
            { value: "not-ends", label: "Doesn't end with" }
          ],
        config = {
          ...column,
          columnName: "Value",
          label: "filter",
          id: `filter${this.timestamp}`
        };

      $filterContainer.show().find( "[id^='comparative']" )
        .attr( "required", "required" );

      if ( [ "number", "currency", "integer", "timer" ].includes( column.type ) ) {
        operations = [ 
            { value: "bigger-than", label: "Bigger than" },
            { value: "equals", label: "Equals" },
            { value: "smaller-than", label: "Smaller than" }
          ];
      } else if ( [ "drop down list", "drop down list multi select" ].includes( column.type ) ) {
        operations = [
            { value: "equals", label: "Equals" },
            { value: "not-equals", label: "Doesn't equal" },
            { value: "contains", label: "Contains", selected: true },
            { value: "not-contains", label: "Doesn't contain" }
          ];
      } else if ( [ "checkbox" ].includes( column.type ) ) {
        operations = [
            { value: "equals", label: "Equals" },
            { value: "not-equals", label: "Doesn't equal" }
          ];
      }

      if ( 
        [ 
          "drop down list", "embedded", "from table", "hyperlink", "longtext", 
          "phone number", "text" 
        ].includes( column.type ) 
      ) {
        config.type = "text";
      }
      
      let $input = columnToInput( config, modal.database );

      $inputContainer.append( $input ).show();

      $filterContainer.find( "dg-dropdown" )
        .attr( "options", JSON.stringify( operations ) );

      if ( this.filter && this.filter !== "false" ) {
        $inputContainer.find( "[id^=filter]" ).val( this.filter );
      }

      $( this ).removeAttr( "filter" )
  
      if ( ! Object.keys( column ).length ) {
        $inputContainer.find( "input, select" ).attr( "disabled", "disabled" );
        $filterContainer.find( "dg-dropdown" ).attr( "disabled", "disabled" );
      }
    }
    
    if ( this.filter ) {
      $( this ).removeAttr( "filter" );
    }
  }

  toJson () {
    let $checkbox = $( this ).find( "[name^='operator']:checked:visible" ),
      columnId = $( this ).find( "[id^=column]" )[0].value,
      json = {
        columnId: columnId,
      },
      modal = $( this ).closest( ".modal" )[0],
      column = modal.columns.filter( column => column.id == columnId )[0];

    if( $( this ).find( ".comparative-container" ).is( ":visible" ) ){
      json.comparative = $( this ).find( "[id^=comparative]" )[0].value;
    }

    if ( this.locked ) json.locked = true;
    if ( this.lookup ) json.lookup = false;
    
    if ( column.type && [ "date time", "date", "clock" ].includes( column.type ) ) {
      let $from = $( this ).find( "[id^=From]" ),
        $to = $( this ).find( "[id^=To]" );

      if ( $from[0].value ) json.from = $from[0].value;
      if ( $to[0].value ) json.to = $to[0].value;
    } else if ( [ "drop down list" ].includes( column.type ) ) {
      json.filter = $( this ).find( "[id^=filter]" )[0].value.replace( /[\[\]]/g, "" );
    } else {
      json.filter = $( this ).find( "[id^=filter]" )[0].value;
    }

    if ( $checkbox.length > 0 ) {
      json.operator = $checkbox[0].value;
    }
    
    return json;
  }

  initColumnInput () {
    let config = {
        "id": `column${this.timestamp}`,
        "columnName": "column",
        "type": "drop down list",
        "dropdownValues": [ ],
        "mandatory": true
      };

    for ( const column of $( this ).closest( ".modal" )[0].columns  ) {
      config.dropdownValues.push( {
        "label": decodeURI( column.columnName ),
        "value": column.id
      } );
    }

    config.dropdownValues = JSON.stringify( config.dropdownValues );

    let $column = columnToInput( config );

    $( this ).find( ".column-container" ).append( $column );
  }

  initComparitiveInput () {
    let $comparative = columnToInput( {
          "id": `comparative${this.timestamp}`,
          "columnName": "Filter",
          "type": "drop down list",
          "dropdownValues": "[]",
          "mandatory": true
        } );

    $( this ).find( ".comparative-container" ).append( $comparative );
  }
    
  connectedCallback () {
    this.timestamp = window.performance.now();

    this.html = `<div class="mb-3 operator-container">
        <div class="btn-group">
          <input type="radio" class="btn-check" name="operator${this.timestamp}" 
            id="and${this.timestamp}" value="and" autocomplete="off" checked />
          <label class="btn btn-info btn-sm" for="and${this.timestamp}">AND</label>

          <input type="radio" class="btn-check" name="operator${this.timestamp}" 
            id="or${this.timestamp}" value="or" autocomplete="off" />
          <label class="btn btn-info btn-sm" for="or${this.timestamp}">OR</label>
        </div>
      </div>
      <div class="row gx-2">
        <div class="col-12 col-sm-4 mb-3 mb-md-0 column-container"></div>
        <div class="col-12 col-sm-3 mb-3 mb-md-0 comparative-container"></div>
        <div class="col-12 col-sm-4 mb-3 mb-md-0 input-container"></div>
        <div class="col-12 col-sm-4 mb-3 mb-md-0 js-input-to-container" style="display: none;"></div>
        <div class="col-12 col-sm-1">
          <button class="remove advanced-feature btn btn-link py-1 px-3">
            <i class="far fa-trash-alt"></i>
          </button>
        </div>
      </div>`

    $( this ).html( this.html );

    if ( $( this ).closest( ".modal" ).length > 0 ) {
      this.initColumnInput();
    }

    this.initComparitiveInput();

    $( this )
      .on( "click", ".remove", e => { $( this ).remove(); } )
      .on( "change", "[id^=column]", this.columnSelect.bind( this ) );

    $( this ).find( "[id^=column]" ).trigger( "change" );

    for ( const attr of this.getAttributeNames() ) {
      let value = $( this ).attr( attr );

      if ( value ) {
        $( this ).attr( attr, value );
      } else {
        $( this ).prop( attr, true );
      }
    }
  }
}

window.customElements.define( 'table-filter', Filter );