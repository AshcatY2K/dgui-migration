import * as record from '/src/js/controllers/record.js';
import * as table from '/src/js/controllers/table.js';
import * as column from '/src/js/controllers/column.js';

import { columnToInput } from '/src/js/helpers/inputGenerator.js';
import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

import '/src/js/components/spinnerButton.js';

import { jsonToForm } from '/src/js/helpers/formBuilder.js';

document.title = "Form";

let path = window.location.pathname.split( "/" ),
  guid = path[2];

( async () => {
  let promises = [ table.getByGuid( guid ), column.getByGuid( guid ) ],
    tableObj,
    columnsObj,
    $form = $( "#details form" );

  Promise.all( promises )
    .then( async values => {
      tableObj = values[0][0];
      columnsObj = values[1];

      let form = JSON.parse( tableObj.Form );

      if ( form ) {
        $form.append( jsonToForm( form, columnsObj, -1, guid ) );
      } else {
        for ( const column of columnsObj ) {
          let $input = columnToInput( column, -1, guid );

          $form.append( $input );
        }
      }

      $form.find( "[label='id']" ).hide();
      $form.find( ".custom-input" ).trigger( "change" );

      record.getByGuid( guid, tableObj.id ).then( recordObj => {
        recordObj = recordObj.records[0];

        for ( const [ column, value ] of Object.entries( recordObj ) ) {
          let col = columnsObj.filter( col => col.columnName == column )[0];

          if ( ! value || ! col ) continue;

          let id = col.id,
            input = $form.find( `#${id}` )[0];

          if ( recordObj[ column + "|Lookup" ] ) {
            input.value = {
              label: recordObj[ column + "|Lookup" ],
              value: value
            }
          } else if ( input ) {
            input.value = value;
          }
        }
      } );

      $( "#details" ).addClass( "p-3" );
      $( ".save" ).show();
    } )
    .catch( e => { $( ".expired-wrapper" ).show() } );

  $( document ).on( "click", ".save", () => {
    let btn = $( "dg-spinner-button" )[0],
      config = {};
    
    $form.find( ".custom-input:visible" ).each( ( i, el ) => {
      let column = columnsObj.filter( column => column.id == el.id )[0];

      config[ column.columnName ] = el.value;
    } );

    $form.addClass('was-validated');

    if ( ! $form[0].checkValidity() ) {
      btn.finish();
      
      return;
    }

    record.updateByGuid( guid, config ).then( res => {
      toastSuccess( "Success", "Your record has been updated" );
    } )
    .catch( error => {
      btn.finish();
      
      toastError( error );
    } );
  } );
} )();