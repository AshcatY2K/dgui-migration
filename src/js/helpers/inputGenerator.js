import '../components/inputs/input.js';

import DGText from '../components/inputs/text.js';
import DGLongtext from '../components/inputs/longtext.js';

import DGEmbedded from '../components/inputs/embedded.js';
import DGHyperlink from '../components/inputs/hyperlink.js';
import DGPhoneNumber from '../components/inputs/phoneNumber.js';

import DGCurrency from '../components/inputs/currency.js';
import DGInteger from '../components/inputs/integer.js';
import DGNumber from '../components/inputs/number.js';

import DGClock from '../components/inputs/clock.js';
import DGDate from '../components/inputs/date.js';
import DGDateTime from '../components/inputs/dateTime.js';
import DGTimer from '../components/inputs/timer.js';

import DGDropdown from '../components/inputs/dropdown.js';
import DGFromTable from '../components/inputs/fromTable.js';

import DGCheckbox from '../components/inputs/checkbox.js';
import '../components/inputs/file.js';

function getConfig ( column ) {
  let config = {
      "id": column.id,
      "label": column.columnName
    }

  if ( column.mandatory ) config.required = true;
  if ( column.ReadOnly || column.formula ) config.disabled = true;
  if ( column.Tooltip ) config.tooltiptxt = column.Tooltip;
  if ( column[ "default value" ] && column[ "default value" ] !== "undefined" ) {
    config.value = column[ "default value" ];
  }
  if ( column[ "before html" ] ) config.beforehtml = column[ "before html" ];
  if ( column[ "after html" ] ) config.afterhtml = column[ "after html" ];
  if ( column[ "multiple" ] ) config.multiple = column[ "multiple" ];

  if ( column.mask ) {
    let mask;

    try {
      mask = JSON.parse( column.mask );
    } catch ( e ) {
      mask = {};
    }

    if ( mask.minChar ) config[ "minlength" ] = mask.minChar;
    if ( mask.maxChar ) config[ "maxlength" ] = mask.maxChar;
    if ( mask.symbol ) config[ "symbol" ] = mask.symbol;
    if ( mask.seperator ) config[ "seperator" ] = mask.seperator;
    if ( mask.format ) config[ "format" ] = mask.format;
    if ( mask.date ) config[ "dateMask" ] = mask.date;
    if ( mask.clock ) config[ "timeMask" ] = mask.clock;
  }

  if ( column.mask ) {
    switch ( column.type ) {
      case "clock":
      case "date":
        config[ "mask" ] = column.mask.replace( /"/g, "" );
        break;

      case "timer":
        config[ "mask" ] = column.mask;
        config[ "format" ] = column.mask;

        break;
    }
  }

  switch ( column.type ) {
    case "drop down list":
    case "drop down list multi select":
      if ( column.dropdownValues ) 
        config[ "options" ] = column.dropdownValues;

      if ( column.type == "drop down list multi select" )
        config[ "multiple" ] = true;

      break;

    case "from table":
      if ( column.fromTableId ) config[ "table" ] = column.fromTableId;

      break;
  }

  return config;
}

export function columnToInput ( column, databaseId = -1, guid = false ) {
  let $input,
    config = getConfig( column );

  if ( guid ) {
    config.guid = guid;
  }
  
  if ( column.displayLogic ) {
    config.displaylogic = column.displayLogic;
  }

  switch ( column.type ) {
    case "checkbox":
      $input = $( "<dg-checkbox>", config );
      break;
    case "clock":
      $input = $( "<dg-clock>", config );
      break;
    case "currency":
      $input = $( "<dg-currency>", config );
      break;

    case "date":
      $input = $( "<dg-date>", config );
      break;
    case "date time":
      $input = $( "<dg-date-time>", config );
      break;

    case "drop down list":
    case "drop down list multi select":
      $input = $( "<dg-dropdown>", config );
      break;

    case "embedded":
      $input = $( "<dg-embedded>", config );
      break;

    case "from table":
      config[ "database" ] = databaseId;
    
      $input = $( "<dg-from-table>", config );
      break;

    case "hyperlink":
      $input = $( "<dg-hyperlink>", config );
      break;

    case "integer":
      $input = $( "<dg-integer>", config );
      break;

    case "longtext":
      $input = $( "<dg-longtext>", config );
      break;

    case "number":
      $input = $( "<dg-number>", config );
      break;

    case "phone number":
      $input = $( "<dg-phone-number>", config );
      break;

    case "text":
      $input = $( "<dg-text>", config );
      break;
    case "timer":
      if ( ! config.mask ) config.mask = "hh:mm"
        
      $input = $( "<dg-input-timer>", config );
      break;
    case "file":
      $input = $( "<dg-file-input>", config );
      break;
  }

  // if ( column?.hiden ) {
  //   $input.hide();
  // }

  return $input;
}

export function fieldToDisplay ( value, column, databaseId = -1, guid = false ) {
  let input,
    config = getConfig( column );

  switch ( column.type ) {
    case "checkbox":
      input = DGCheckbox.getDisplayValue( value );
      break;
    case "clock":
      input = DGClock.getDisplayValue( value, config.mask );
      break;
    case "currency":
      input = DGCurrency.getDisplayValue( value, config.symbol, config.seperator );
      break;

    case "date":
      input = DGDate.getDisplayValue( value, config.mask );
      break;
    case "date time":
      input = DGDateTime.getDisplayValue( value, config.dateMask, config.timeMask );
      break;

    case "drop down list multi select":
      value = JSON.parse( value );
    case "drop down list":
      input = DGDropdown.getDisplayValue( value, config.multiple );
      break;

    case "embedded":
      input = DGEmbedded.getDisplayValue( value );
      break;

    case "from table":
      input = DGFromTable.getDisplayValue( value, config.multiple );
      break;

    case "hyperlink":
      input = DGHyperlink.getDisplayValue( value );
      break;

    case "integer":
      input = DGInteger.getDisplayValue( value, config.seperator ) ;
      break;

    case "longtext":
      input = DGLongtext.getDisplayValue( value );
      break;

    case "number":
      input = DGNumber.getDisplayValue( value, config.seperator ) ;
      break;

    case "phone number":
      input = DGPhoneNumber.getDisplayValue( value );
      break;

    case "text":
      input = DGText.getDisplayValue( value );
      break;
    case "timer":
      input = DGTimer.getDisplayValue( value, config.mask );
      break;
    case "file":
      break;
  }
  
  return input;
}