import * as column from '../../controllers/column.js';

import { columnToInput } from '../../helpers/inputGenerator.js';

export default class DGCalculatedInput extends HTMLElement {
  constructor() {
    super();

    this.html = `
        <div class="row">
          <div class="col-6 col-sm-8">
            <p><b>Columns:</b></p>

            <div class="list-container mb-3"></div>
          </div>

          <div class="col-6 col-sm-4">
            <p><b>Functions:</b></p>
            <p class="js-clock-txt" style="display: none;">
              Calculated clock columns will calculate the 
              difference between two selected values
            </p>

            <div class="actions-container" role="group"
              aria-label="Column calculation options"></div>
          </div>
        </div>`;
  }

  static get observedAttributes () {
    return [ "type", "database", "table" ];
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  get database () { return $( this ).attr( "database" ) }
  get table () { return $( this ).attr( "table" ) }
  get type () { return this._type }

  set database ( database ) {}
  set table ( table ) {}

  set type ( type ) {
    this._type = type;

    let actions = {
        plus: { icon: "&plus;", "aria-label": "Plus" },
        minus: { icon: "&minus;", "aria-label": "Minus" },
        divide: { icon: "&divide;", "aria-label": "Divide" },
        times: { icon: "&times;", "aria-label": "Times" }
      },
      $listContainer = $( this ).find( ".list-container" ),
      $container = $( this ).find( ".actions-container" );

    switch ( type ) {
      case "number":
      case "currency":
      case "integer":
        $listContainer
          .find( ".badge[data-column-type='number'], .badge[data-column-type='currency'], .badge[data-column-type='integer']" )
          .show();

        break;
      case "timer":
        $listContainer.find( ".badge[data-column-type='timer']" ).show();

        actions = {
            plus: actions["plus"],
            minus: actions["minus"]
          };

        break;
      case "text":
      case "longtext":
      case "hyperlink":
        $listContainer.find( ".badge" ).show();
        $container.find( "button:not([data-action='plus'])" ).hide();

        actions = { 
          plus: actions["plus"]
        };
        break;
    }

    $container.html( "" );

    for (const [ key, value ] of Object.entries( actions )) {
      let $btn = $( "<button>", {
          class: "btn btn-primary btn-sm mb-2 me-2",
          "data-action": key,
          "aria-label": value["aria-label"],
          "type": "button",
          tabindex: "0"
        } ).html( value.icon );

      $container.append( $btn );
    }

    this.populateBadges();
  }

  async populateBadges () {
    let $container = $( this ).find( ".list-container" ),
      columns = await column.get( this.database, this.table ),
      allowedTypes = [ 
        "text", "longtext", "hyperlink", "number", "integer", "currency", 
        "date", "date time", "timer", "clock", "drop down list" , 
        "drop down list multi select", "phone number" 
      ],
      isSubColumn = false;

    if ( [ "number", "integer", "currency" ].includes( this.type ) ) {
      allowedTypes = [ "number", "integer", "currency" ];
    } else if ( [ "timer" ].includes( this.type ) ) {
      allowedTypes = [ "timer" ];
    }

    $container.html( "" );
    columns.forEach( async ( tblColumn, index ) => {
      let badgeConf = { 
          class: "badge bg-primary me-2 mb-1 p-2",
          "data-column-type": tblColumn.type,
          style: "cursor: pointer",
          tabindex: "0"
        };

      if ( tblColumn.fromTableId > 0 ) {
        let columns = await column.get( this.database, tblColumn.fromTableId ),
          curCol = "",
          fromCol = '';

        columns.forEach( ( subTblColumn, index ) => {
          if ( 
            ! allowedTypes.includes( subTblColumn.type ) || 
            subTblColumn.type == "clock" && subTblColumn.formula 
          ) {
            return;
          }

          if ( 
            tblColumn.columnName && 
            unescape( tblColumn.columnName ) !== fromCol 
          ) {
            if ( tblColumn.columnName && ! fromCol && ! isSubColumn ) {
              $container.append( `<hr>` );
              $container.append( `<p class="mt-2"><b>Sub Columns:</b></p>` );
              isSubColumn = true;               
            }

            fromCol = unescape( tblColumn.columnName );

            $container.append( `<p class="mt-2"><b>${fromCol}</b></p>` );
          }

          badgeConf["data-column-name"] = tblColumn.columnName;
          badgeConf["data-column-type"] = subTblColumn.type;
          badgeConf["data-alias"] = `[${fromCol}][` + unescape( subTblColumn.columnName ) + `]`;

          $container.append( 
            $( "<span>", badgeConf )
            .html( unescape( subTblColumn.columnName ) )
          );
        });
      }

      if ( allowedTypes.includes( tblColumn.type ) ) {
        if ( tblColumn.type == "clock" && tblColumn.formula ) {
          return;
        }

        badgeConf["data-alias"] = `[` + unescape( tblColumn.columnName ) + `]`;

        $container.append(
            $( "<span>", badgeConf ).html( unescape( tblColumn.columnName ) )
          );
      }
    } );
  }

  badgeClick( e ) {
    let target = e.currentTarget,
      badgeTxt = $( target ).html(),
      $calculated = $( this ).find( "#calculated" ),
      displayValue = $calculated.val().trim();

    if ( displayValue ) {
      if ( 
        [ "text", "longtext", "hyperlink" ].includes( this.type ) && 
        ! displayValue.endsWith("+") 
      ) {
        displayValue += "+";
      } else if ( this.type == "clock" && ! displayValue.endsWith(",") ) {
        displayValue += ",";
      }
    }

    if ( target.hasAttribute( "data-column-name" ) ) {
      badgeTxt = unescape( $( target ).attr( "data-column-name" ) ) + "][" + badgeTxt;
    }

    $calculated.val( `${displayValue}[${badgeTxt}]`).focus();
  }

  actionClick ( e ) {
    e.preventDefault();

    let target = e.currentTarget,
      action = $( target ).attr( "data-action" ),
      $calculated = $( this ).find( "#calculated" ),
      calculatedTxt = $calculated.val(),
      actions = {
        "plus": "+",
        "minus": "-",
        "times": "*",
        "divide": "/",
        "counter": "counter(String)"
      };

    calculatedTxt += actions[ action ];

    $calculated.val( calculatedTxt ).focus();
  }

  validate () {
    let value = $( this ).find( "#calculated" ).val();
      columns = value.match( /\[[^\/*\-\+\(\),]*\]/g ),
      availibleColumns = $( this ).find( ".list-container .badge:visible" );
    
    if ( columns ) {
      availibleColumns = availibleColumns.map( ( i, column ) => {
          let colName = $(column).attr( "data-alias");
        
          return colName;
        } ).get();

      let invalidColumns = columns.filter( column => ! availibleColumns.includes( column ) );

      if ( invalidColumns.length > 0 ) {
        return invalidColumns;
      }
    }

    return true
  }

  connectedCallback () {
    let badgeClick = this.badgeClick.bind( this ),
      actionClick = this.actionClick.bind( this );

    $( this ).html( this.html );

    $( this ).prepend( columnToInput( {
        "id": "calculated",
        "columnName": "Calculated value",
        "type": "text"
      } ) );

    $( this )
      .on( "click", ".list-container .badge", badgeClick )
      .on( "click", ".actions-container button", actionClick )
      .on( 'keyup', ".badge", function (e) {
        if ( e.which == 13 || e.keyCode == 32 ) {
          $( this ).trigger( "click" );
        }
      } );
  }
}

window.customElements.define('dg-calculated-input', DGCalculatedInput);