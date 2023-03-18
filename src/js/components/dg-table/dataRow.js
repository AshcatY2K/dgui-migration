import edit from '/src/js/forms/record/edit.js';
import chat from '/src/js/forms/chat.js';
import mdbModal from '/src/js/components/mdb/pro/modal';

import Dialog from '/src/js/components/dialog.js';
import { remove } from '/src/js/controllers/record.js';

import DGTemporal from '/src/js/components/inputs/temporal.js';

import './cell.js';

export default class DGDataRow extends HTMLElement {
  constructor() {
    super();

    this.html = `<dg-cell class="checkbox-container" style="width: 30px;">
        <input type="checkbox" class="body-tr-checkbox" 
          aria-label="check record for bulk action">
      </dg-cell>
      <dg-cell class="chat-container" style="width: 32px;">
        <button class="open-chat btn btn-info" aria-label="Open chat dialog" 
          type="button">
          <i class="far fa-comments"></i>
        </button>
      </dg-cell>`;
  }

  static get observedAttributes () {
    return [ "record", "columns" ];
  }

  get id () {
    return this.record.id;
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  calculateDate ( val, calc ) {
    for ( const match of calc.matchAll(/([\+-])(\d*)$/g) ) {
        if ( match[1] == "+" ) {
          val.setDate( val.getDate() + parseInt( match[2] ) );
        } else if ( match[1] == "-" ) {
          val.setDate( val.getDate() - parseInt( match[2] ) );
        }
    }

    return val;
  }

  checkTrigger ( operation, logicValue, value, column ) {
    let regex;

    if ( column.type == "date" ) {
      let targetDate;

      if (
        value === "1970-01-01T00:00:00.000Z" || 
        value === "1900-01-01T00:00:00.000Z" || 
        value === "1900-01-30T00:00:00.000Z" 
      ) {
        return false;
      }

      value = new Date( value );

      if ( logicValue.includes( "NOW" ) ) {
        let temp = logicValue;

        logicValue = DGTemporal.getDateValue( "NOW", column.mask );
        logicValue = DGTemporal.getDateDataValue( logicValue, column.mask );

        logicValue = new Date( logicValue +"T00:00:00.000Z" );
        
        logicValue = this.calculateDate( logicValue, temp );
      } else {
        logicValue = value.match(/(\d{4}(-\d{2}){2}T(\d{2}:){2}\d{2}.\d{3}Z)/g)[0];
        logicValue = new Date( targetDate );
      }

      value = value.getTime();
      logicValue = logicValue.getTime();
    }
  
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
          regex += `${piece},|${piece}$`;
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

  init ( record, columns, app ) {
    let $cell;
    
    this.record = record;

    let $columns = $( this.app ).find( "dg-table dg-table-header dg-column:not(.checkbox-container):not(.chat-container):not(.delete-action-column)" );

    for ( const [ i, column ] of columns.entries() ) {
      let value = this.record[ column.columnName ];

      if ( this.record[ column.columnName + "|Lookup" ] ) {
        value = this.record[ column.columnName + "|Lookup" ];
      }

      if ( [ "drop down list", "drop down list multi select" ].includes( column.type ) ) {
        $cell = $( "<dg-cell>", {
          columnid: column.id,
          value: value ? value : "[]"
        } );
      } else if ( column.type !== "checkbox" ) {
        $cell = $( "<dg-cell>", {
          columnid: column.id,
          value: value ? value : ""
        } );
      } else {
        $cell = $( "<dg-cell>", {
          columnid: column.id,
          value: value ? "true" : "false"
        } );
      }

      $cell.width( $columns.eq( i ).outerWidth() )

      $( this ).append( $cell );
    }

    for ( const column of ( columns ) ) {
      if ( column.displayLogic ) {
        let $target = $( this ).find( `[columnid='${column.id}']` );

        for ( const logic of JSON.parse( column.displayLogic  ) ) {
          let $trigger = $( this ).find( `[columnid='${logic.columnId}']` ),
            style = $target.attr( "style" ),
            column = columns.filter( column => column.id == logic.columnId )[0];

          style = style ? style : "";

          switch ( logic?.action ) {
            case "style": 
              let trigger = this.checkTrigger( 
                  logic.operation, 
                  logic.value, 
                  this.record[column.columnName], 
                  column
                );
              
              if ( trigger && this.record[column.columnName] ) {
                style += logic.css + ";";
              }

              break;
          }

          $target.attr( "style", style );
        }
      }
    }
    
    app.tableConfig.then( tableConfig => {
      if ( tableConfig["Can Delete Record"] ) {
        $cell = $( "<dg-cell>", { class: "delete-row" } );

        $cell.append( `<button class="btn btn-lg text-dark" 
          aria-label="Delete row">
            <i class="far fa-trash-alt"></i>
          </button>` );

        $cell.css( { width: "30px" } );

        $( this ).append( $cell );
      }

      if ( this.app?.embedded ) {
        $cell = $( "<dg-cell>", { class: "link-row" } );
        $cell.css( { width: "30px" } );

        let idColumn = this.app.columns.filter( col => col.columnName == "id" )[0],
          $a = $( "<a>", {
              href: `/databases/${this.app.database}/tables/${this.app.table}`,
              class: "filtered-link",
              "aria-label": "open table containing current record",
              "data-table-id": this.app.table,
              "data-filter": JSON.stringify( [{
                  columnId: idColumn.id,
                  operator: "equals",
                  value: this.record.id
                }] )
            } ).html( '<i class="fas fa-external-link-alt"></i>' );

        $cell.append( $a );

        $( this ).append( $cell );
      }

      if ( this.app && this.app?.config?.lockFirstColumn ) {
        let $column = $( this ).closest( "dg-table" ).find( ".lock-column:visible" )
            .closest("dg-column"),
          index = $column.index() + 1;
        
        $( this )
          .find( `dg-cell:nth-child(${index})` )
          .toggleClass( "lock" );
      }
    } );
  }

  static get observedAttributes () {
    return [];
  }

  async click ( e ) {
    if ( 
      $( e.target ).hasClass( "checkbox-container" ) ||
      $( e.target ).closest( ".checkbox-container" ).length > 0 ||
      e.target.tagName == "A" || 
      e.target.tagName == "I" ||
      e.target.tagName == "BUTTON" ||
      window.isDragScrolling
    ) {
      return;
    }

    let $target = $( e.target ),
      $table = $target.closest( ".datatable" );
      
    if ( 
      $target.hasClass( "form-control" ) ||
      $target.hasClass( "popconfirm-toggle" ) ||
      $target.hasClass( "fa-trash-alt" ) || 
      (
        e.target.hasAttribute( "aria-label" ) && 
        $target.attr( "aria-label" ) == "Delete row" 
      ) ||
      $target.prop( "tagName" ) == "A" ||
      $target.parent().prop( "tagName" ) == "A"
    ) {
      return;
    }

    $( this.app ).find( "dg-data-row.active" ).removeClass( "active" );
    $( this ).addClass( "active" );

    this.app.activeRecord = {
        table: this.app.table,
        record: this.record
      };

    let database = this.app.database, 
      table = this.app.table, 
      columns = this.app.columns,
      form = this.app.form,
      dialog = new edit( database, table, columns, this.app, JSON.parse( form ), this.record, null, this.app.embedded );

    dialog.then( config => {
      $( this.app ).find( ".table-heading" ).trigger( "focus" );

      if ( ! config ) return;

      $( this.app ).find( "dg-table-body" )[0].loadRecords();
    } );

    let tableConfig = await this.app.tableConfig;

    if ( tableConfig.TimeLog ) {
      $( "dg-timer" ).attr( "record", this.record.id );
    }
  }

  remove ( e ) {
    e.preventDefault();

    const database = this.app.database, 
      table = this.app.table,
      dialog = new Dialog();

    dialog.confirm( `Are you sure you want to delete this entry?` )
      .then( res => {
        if( res ) {
          remove( database, table, this.record.id ).then( res => {
              $( this.app ).find( "dg-table-body" )[0].loadRecords();
            } );
        }
      } );
  }

  connectedCallback () {
    let click = this.click.bind( this ),
      remove = this.remove.bind( this ),
      index = $( this ).index() + 1; 

    $( this ).attr( "role", "row" ).prepend( this.html );

    this.app = $( this ).closest( "dg-app" )[0];
    this.table = $( this ).closest( "dg-table" )[0];

    $( this )
      .on( "click", click )
      .on( "click", ".delete-row button", remove )
      .on( "keydown", ".delete-row button", e => {
        e.stopImmediatePropagation();

        switch ( e.keyCode ) {
          case 32 :
          case 13:
            $( e.target ).trigger( "click" );
            e.preventDefault();
            break;
        }
      } )
      .on( "click", ".chat-container", e => {
        e.stopImmediatePropagation();

        new chat( this.app.database, this.app.table, this.id );

        $( "tr.active" ).removeClass( "active" );
        $( e.target ).closest( "tr" ).addClass( "active" );

        const modal = new mdbModal( $( '#chatModal' )[0] );
        modal.show();
      } )
      .on( "keydown", e => {
        switch ( e.keyCode ) {
          case 32 :
          case 13:
            this.click( e );
            e.preventDefault();
            break;
        }
      } )
      .on( "click", ".embedded", ( e ) => {
        e.preventDefault();
        e.stopPropagation();

        $( "#embeddedModal iframe" ).attr( "src", $( e.target ).data( "url" ) );
      } );
  }
}

window.customElements.define('dg-data-row', DGDataRow);