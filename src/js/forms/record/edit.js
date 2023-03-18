import Modal from './modal.js';
import * as record from '/src/js/controllers/record.js';
import * as doc from '/src/js/controllers/document.js';
import * as table from '/src/js/controllers/table.js';
import * as column from '/src/js/controllers/column.js';
import Tooltip from '/src/js/components/mdb/free/tooltip';
import Tab from '/src/js/components/mdb/free/tab';
import DGApp from '/src/js/components/app.js';
import Popover from '/src/js/components/mdb/free/popover';

import * as clipBoard from '/src/js/helpers/clipBoard.js';

import Dialog from '/src/js/components/dialog.js';
import { columnToInput } from '/src/js/helpers/inputGenerator.js';
import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

export default class edit extends Modal {
  constructor ( database, table, columns, app, form, record, guid = null, secondary = false ) {
    super( database, table, columns, form, secondary );

    this.record = record;
    this.app = app;

    this.modal.header = `<div class="tab-container" style="position: relative;">
        <ul class="nav nav-tabs -primary" id="record-card-tabs" role="tablist"
          style="overflow-x: overlay; overflow-y: hidden;">
          <li class="nav-item" role="presentation">
            <a class="nav-link active" data-mdb-toggle="tab" id="details-tab"
              href="#details" role="tab" aria-controls="details"
              aria-selected="true">
              Details
            </a>
          </li>
          <li class="nav-item" role="presentation">
            <a class="nav-link" data-mdb-toggle="tab" id="documents-tab"
              href="#documents" role="tab" aria-controls="documents">
              Documents
            </a>
          </li>
          <!--li class="nav-item" role="presentation">
            <a class="nav-link" data-mdb-toggle="tab" id="reports-tab"
              href="#reports" role="tab" aria-controls="reports">
              Reports
            </a>
          </li-->
        </ul>
      </div>
      <div class="tab-container -sub"></div>`;

    this.modal.footer = `<dg-spinner-button class="save">
        Save
      </dg-spinner-button>`;

    let $file = columnToInput( {
        "id": "file",
        "columnName": "File",
        "type": "file",
        "mandatory": true,
        "multiple": true
      } );

    this.$modal.find( ".card-body .tab-content" )
      .append( `<div class="tab-pane fade p-3" id="documents" role="tabpanel" 
          aria-labelledby="documents-tab">
          <form class="needs-validation" novalidate aria-live="polite">
            <ul class="document-list list-group list-group-flush mb-3"></ul>
            <span class="loader my-4" style="position: relative;top: 0;transform: none;left: 0;margin: auto;"></span>
          </form>
        </div>` );

    this.$modal.find( "#documents" ).append( $file );

    $file.find( "input" ).removeAttr( "data-mdb-accepted-extensions" ).removeAttr( "accept" )

    this.paint();

    this.$modal.off( "click", ".btn-close" );

    if ( ! guid ) {
      this.$modal.find( "#details form" ).prepend( 
        $( `<button type="button" 
            class="btn btn-sm btn-info request-guid mb-2" 
            data-mdb-toggle="popover"
            aria-label="Share edit record form"
            style="float: right;clear: both;display: block;">
            <i class="fas fa-share-alt fa-1x"></i>
          </button>
          <hr style="clear: both; background: none;">` )
      );

      this.populateTabs();
    }

    this.$modal.find( ".card-body" ).removeClass( "p-3" ).addClass( "p-0" );
    this.$modal.find( "#details" ).addClass( "p-3" );

    this.modal.app = this.app;

    return new Promise ( resolve => {
      this.resolve = resolve;

      this.$modal
        .on( "click", ".save", this.submit.bind( this ) )
        .on( "click", ".btn-close", this.close.bind( this ) )
        .on( "click", ".nav-tabs .nav-link", e => {
          e.preventDefault();
          let href = $( e.target ).attr( "href" );

          if ( ! href  ) return;

          if ( href == "#details" ) {
            this.$modal.find( ".card-footer" ).show();
          } else {
            this.$modal.find( ".card-footer" ).hide();
          }

          let target = href.replace( "#", "" ),
            $content = this.$modal.find( ".tab-content" );

          this.$modal.find( `.nav-tabs .nav-link.active` ).removeClass( "active" );
          $( e.target ).addClass( "active" );

          $content.find( `.tab-pane` ).removeClass( "active" ).addClass( "fade" );
          $content.find( `.tab-pane#${target}` ).removeClass( "fade" ).addClass( "active" );
        } )
        .on( "click", "#documents-tab", e => {
          e.preventDefault();

          this.populateDocuments();
        } )
        .on( "mouseenter", ".nav-tabs.-primary .nav-link", this.showSubMenu )
        .on( "mouseleave", ".nav-tab-sub-content", function ( e ) {
          $( this ).hide();
        } )
        .on( "click", ".filtered-link", async e => {
          e.preventDefault();

          let filters = $( e.currentTarget ).attr( "data-filter" ),
            table = $( e.currentTarget ).attr( "data-table-id" ),
            url = $( e.currentTarget ).attr( "href" ),
            tableConfig = await this.app.tableConfig;

          DGApp.addBreadcrumb( this.database, this.table, tableConfig.tabelName );
          $( e.currentTarget ).closest( "dg-app" )[0].throughLink( filters, table, url );

          this.close();
        } )
        .on( "fileAdd.mdb.fileUpload", "#input-file", e => {
          this.$modal.find( "#documents .loader" ).show();

          let fd = new FormData(),
            files = this.$modal.find( "[type='file']" )[0].files;
            
          for ( const [ index, file ] of Object.entries( files ) ) {
            let fd = new FormData();

            fd.append( `file`, file );

            doc.upload( this.database, this.table, this.record.id, fd )
              .then( res => {
                toastSuccess( "Success", "Your document has been uploaded" );

                this.populateDocuments();

                $( ".file-upload-remove-file-btn" ).trigger( "click" );

                this.$modal.trigger( "form::submit" );

                this.$modal.find( "#documents .loader" ).hide();
              } )
              .catch( error => {
                toastError( "Error", error ) 
              } );
          }
        } )
        .on( "click", "#documents .document-list .js-download", this.downloadDoc.bind( this ) )
        .on( "click", "#documents .document-list .js-delete", this.deleteDoc.bind( this ) )
        .on( "click", ".request-guid", this.getLink.bind( this ) );

        this.$modal.find( ".card-header .nav-tabs [data-related-table], .tab-container" )
          .on( "click", `[data-related-table]`, this.relatedTabClick.bind( this ) );
      } );
  }

  async getLink ( e ) {
    if ( ! e.currentTarget.hasAttribute( "data-guid" ) ) {
      e.preventDefault();

      let response = await record.getGuid( this.database, this.table, this.record.id ),
        url = location.protocol + '//' + 
        window.location.hostname + "/form/" + response.GUID;

      $( e.currentTarget ).attr( "data-guid", response.GUID );

      new Popover( e.currentTarget, {
        html: true,
        title : `<span class="text-info"><strong>Share URL</strong></span>`,
        content : '-'
      } );

      $( e.currentTarget ).popover()
        .on( 'shown.bs.popover', function() {
          $( ".popover-body" ).html( "" );

          let $input = columnToInput( {
            "id": "guid",
            "columnName": "Share link",
            "type": "text",
            "after html": `<button class="btn btn-sm copy-to-clipboard shadow-0" 
                type="button"
                aria-label="Copy sharable url"
                data-mdb-ripple-color="dark">
                <i class="fas fa-copy"></i>
              </button>`
          } );

          $( ".popover-body" ).append( $input );

          $input.find( ".input-group-text" ).addClass( "pe-0" );
          $input[0].value = url;

          if ( $( ".popover-header" ).find( ".close-popover" ).length < 1 ) {
            let $closeBtn = $( "<button>", {
                  "class": "btn btn-sm close-popover shadow-0",
                  "type": "button",
                  "aria-label": "close"
                } ).css( { float: "right" } ),
              $icon = $( "<i>", { class: "fas fa-times" } );
            
            $closeBtn.append( $icon );

            $( ".popover-header" ).append( $closeBtn );
          }
          
          $( ".popover" ).trap();


          $( ".popover-body" ).on( "click", ".copy-to-clipboard", function ( e ) {
            let txt = $( e.currentTarget ).closest(".custom-input")[0].value;

            clipBoard.copy( txt );

            toastSuccess( "Copied", "The URL has been copied" );
          } );
        } )
        .on( 'hidden.bs.popover', function() {
          $( ".popover" ).free();
        } );

      $( e.currentTarget ).trigger( "click" );
    }
  }

  paint () {
    this.app.tableConfig.then( tableConfig => {
      for ( let column of this.columns ) {
        delete column["default value"];

        if ( ! tableConfig["Can Edit Record"] ) {
          column.ReadOnly = 1;
        }
      }

      super.paint();

      super.ready();
      this.populate();
    } );


    return this;
  }

  deleteDoc ( e ) {
    const dialog = new Dialog();

    dialog.confirm( `Are you sure you want to delete this document?` )
      .then( res => {
        if ( ! res ) return;

        let $li = $( e.target ).closest( "li" ),
          guid = $li.attr( "data-guid" ),
          classes = {
            loading: "fas fa-spin fa-spinner",
            base: "far fa-trash-alt"
          };

        $( e.target ).removeClass( classes.base ).addClass( classes.loading );

        doc.remove( this.database, this.table, this.rowId, guid )
          .then( buffer => {
            screenReaderAlert( "Your document has been removed" )
            $li.remove();
          } )
          .catch( error => {
            toastError( "Error", error );

            $( e.target ).addClass( classes.base ).removeClass( classes.loading );
          } );
      } );
  }

  downloadDoc ( e ) {
    let $li = $( e.currentTarget ).closest( "li" ),
      guid = $li.attr( "data-guid" ),
      classes = {
        loading: "fa-spin fa-spinner",
        base: "fa-arrow-circle-down"
      };

    $( this ).removeClass( classes.base ).addClass( classes.loading );

    doc.download( this.database, this.table, this.record.id, guid )
      .then( async buffer => {
        let $link = $( "<a>", {
          href: window.URL.createObjectURL( buffer ),
          download: $li.find( ".js-filename" ).html(),
          class: "download-link"
        } );

        $( ".download-link" ).remove();
        $( "body" ).append( $link ); // Required for FF
        $( `a.download-link` )[0].click();

        $( this ).addClass( classes.base ).removeClass( classes.loading );
      } )
      .catch( error => {
        toastError( "Error", error );

        $( this ).addClass( classes.base ).removeClass( classes.loading );
      } );
  }

  async relatedTabClick ( e ) {
    $( e.target ).closest( ".floating-panel" ).find( ".card-body" )[0]
      .scrollTo( 0, 0 );

    let table = $( e.target ).attr( "data-table-id" ),
      columns = await column.get( this.database, table ),
      filter = this.$modal.find( "#details form" )
        .find( "input, select, textarea" )
        .eq( 0 ).val(),
      fromColumn = columns.filter( column => column.fromTableId == this.table ),
      filters = [{
          columnId: fromColumn[0].id, 
          comparative: "equals",
          filter: this.record.id,
          lookup: false,
          locked: true
        }],
      config = {
        parentTableId: this.table,
        clear_filters: true
      },
      relatedTable = $( e.target ).attr( "data-related-table" ),
      $app = this.$modal.find( `[id='${relatedTable}']`);
      
    DGApp.tempFilter( filters, this.database, table, true );

    $app.attr( "database", this.database )
      .attr( "table", table );

    this.$modal.find( ".js-through-link.filtered-link" )
      .attr( "href", `/databases/${this.database}/tables/${table}` )
      .attr( "data-databases-id", this.database )
      .attr( "data-table-id", table )
      .attr( "data-filter", JSON.stringify( [{
          columnId: fromColumn[0].id,
          operator: "equals",
          value: this.record.id,
          lookup: false
        }] ) );
  }

  showSubMenu ( e ) {
    let $item = $( e.target ).closest( ".nav-item" ),
      containerW = $item.closest( ".nav-tabs" ).width(),
      $link = $item.find( ".nav-link" ),
      $ul = $item.find( "[data-group]" ),
      left = $link.position().left,
      group = $( e.target ).attr( "data-group" ),
      $subContent = $( `.nav-tab-sub-content[data-group='${group}']` ),
      position = $item.position();

    $( ".nav-tab-sub-content" ).hide();

    $subContent.css( {
      left: position.left,
      top: position.top + $item.height()
    } ).show();
    
    $subContent.find( "li" ).eq( 0 ).find( "a" ).focus();

    if ( left + $ul.width() > containerW ) {
      $ul.css( { left: containerW - $ul.width() } );
    } else {
      $ul.css( { left: left } );
    }
  }

  close () {
    let changed = false;

    $( ".popover" ).remove();

    this.$modal.find( "#details-tab" ).trigger( "click" );

    this.$modal.find( "dg-spinner-button" )[0].finish();

    for (let [key, value] of Object.entries( super.formToJson() )) {
      if ( ! key ) continue;
   
      let recValue = this.record[key];

      if ( 
        recValue == "1900-01-01T00:00:00.000Z" ||
        recValue === "1900-01-01T00:00:00.000Z" || 
        recValue === "1900-01-30T00:00:00.000Z" || 
        recValue === "1970-01-01T00:00:00.000Z" 
      ) {
        recValue = "";
      }

      if ( [ null, '[""]', '[]' ].includes( recValue )  ) recValue = "";
      if ( [ null, '[""]', '[]' ].includes( value )  ) value = "";
      
      if ( recValue != value ) {
        if ( typeof recValue !== "string" ) {
        console.log(key, recValue, value, "#1" )
          changed = true; 
        } else if ( recValue.toLowerCase() != value.toLowerCase() ) {
        console.log(key, recValue, value )
          changed = true; 
        }
      }
    }

    if ( changed ) {
      const dialog = new Dialog();

      dialog.confirm( `You have unsaved changes. Would you like to save changes before exiting?`,{
        accept: 'Yes',
        cancel: 'No',
      } )
        .then( res => {
          if ( res ) {
            this.submit();
          } else {
            this.$modal[0].close();

            this.resolve( false );
          }
        } );
    } else {
      this.$modal[0].close();

      this.resolve( false );
    }
  }

  async populate () {
    for ( const [ column, value ] of Object.entries( this.record ) ) {
      let col = this.columns.filter( col => col.columnName == column )[0];

      if ( ! value || ! col ) continue;

      let id = col.id,
        input = this.$modal.find( `#details form #${id}` )[0];

      if ( this.record[ column + "|Lookup" ] ) {
        input.value = {
          label: this.record[ column + "|Lookup" ],
          value: value
        }
      } else if ( input ) {
        input.value = value;
      }

      if ( [ "date time", "time", "date" ].includes( col.type ) ) {
        this.record[ col.columnName ] = this.record[ col.columnName ]
          .replace( /\d{2}.\d{3}Z/, "00.000Z" );
      } else if ( col.type == "timer" ) {
        if ( 
          ( ! col.mask || col.mask == "hh:mm" ) && 
          this.record[ col.columnName ] < 60000
        ) {
          this.record[ col.columnName ] = 0;
        } else if ( this.record[ col.columnName ] < 1000 ) {
          this.record[ col.columnName ] = 0;
        }
      }
    }

    this.app.tableConfig.then( tableConfig => {
      if ( ! tableConfig.TimeLog && $.isEmptyObject( this.app._timer ) ) return;

      let $timer = $( `<dg-timer/>` );

      if ( tableConfig.TimeLog ) {
        $timer.attr( "data-record-id", this.record.id );
      }

      this.$modal.find( "#details form" ).prepend( $timer );
    } );
  }

  async populateDocuments () {
    this.$modal.find( "#documents .loader" ).show();

    let docs = await doc.get( this.database, this.table, this.record.id ),
      tableConfig = await this.app.tableConfig,
      $list = this.$modal.find( ".document-list" );

    $list.html( "" );

    for ( let i in docs ) {
      let $download = $( "<i>", { 
          class: "fas fa-arrow-circle-down me-2 js-download",
          role: "button",
          "aria-label": "Download document"
        } ),
        $delete = $( "<i>", { 
          class: "far fa-trash-alt js-delete popconfirm-toggle",
          role: "button",
          "aria-label": "Delete document"
        } ),
        $li = $( "<li>", {
          "data-guid": docs[i].ID,
          class: "list-group-item d-flex justify-content-between align-items-start"
        } ).html( `<div class="ms-2 me-auto js-filename">${docs[i].FileName}</div>` );

      $li.append( $download );

      if ( tableConfig["Can Delete Record"] ) {
        $li.append( $delete );
      }
      
      $list.append( $li );
    }

    this.$modal.find( "#documents .loader" ).hide();
  }

  tableToTab ( table ) {
    let $li = $( "<li>" ),
      $table = $( "#main-content > .container > .datatable" ),
      urlLabel = $table.attr( "data-table-name" ),
      name = urlLabel == table.tableName ? `${urlLabel}-${table.tableName}` : table.tableName,
      id = name.replace( / /g, "-" ).replace( /[^\w\d]/g, "" ),
      $a = $( "<a>", { 
        class: "nav-link",
        id: `${id}-tab`,
        role: "tab",
        href: `#${id}-content`,
        "data-table-id": table.tableId,
        "data-record-id": this.rowId,
        "data-mdb-toggle": "tab",
        "data-related-table": `${id}-datatable`,
        "aria-controls": `#${id}-content`
      } ).html( name ),
      groupName = table["Group Name"],
      $tabGroup = this.$modal.find( `ul[data-group='${groupName}']` );

    if ( table.Description ) {
      $li.attr( "data-mdb-toggle", "tooltip" )
        .attr( "data-mdb-placement", "bottom" )
        .attr( "title", table.Description )
        .attr( "data-mdb-original-title", table.Description );
    }

    if ( $tabGroup.length > 0 ) {
      let $tabGroup = this.$modal.find( `ul[data-group='${groupName}']` );

      $li.append( $a );

      $tabGroup.prepend( $li );
    } else {
      $li.attr( "role", "presentation" ).addClass( "nav-item temp" );

      $li.append( $a );
      this.$modal.find( "#record-card-tabs > li:first-child" ).after( $li );
    }
  }

  async populateTabs () {
    let activeTabId = this.$modal.find( "#record-card-tabs .nav-link.active" ).attr( "id" ),
      tables = await table.get( this.database ),
      $table = $( "#main-content > .container > .datatable" ),
      urlLabel = $table.attr( "data-table-name" ),
      groups = {},
      tabs = [],
      tabIds = [];

    this.app.relationships = await table.relationships( this.database, this.table );

    this.app.relationships.sort( ( a, b ) => a.tableName < b.tableName ? 1 : -1 );

    for ( const tab of this.app.relationships ) {
      if ( tabIds.includes( tab.tableId ) ) {
        continue;
      }

      let table = tables.filter( table => table.tabelName == tab.tableName ),
        groupName = table[0]["Group Name"].trim(),
        name = urlLabel == tab.tableName ? `${urlLabel}-${tab.tableName}` : tab.tableName,
        id = name.replace( / /g, "-" ).replace( /[^\w\d]/g, "" );

      tab.tabelName = table[0].tabelName;
      tab["Group Name"] = groupName;

      let $tabPane = $( "<div>", { 
          class:"tab-pane fade",
          id: `${id}-content`,
          role: "tabpanel",
          "aria-labelledby": `${id}-tab`
        } ),
        $app = $( `<dg-app>`, {
          id: `${id}-datatable`,
          class: "datatable loading" ,
          embedded: "true"
        } );

      if ( this.app.activeRecord ) {
        $app[0].activeRecord = this.app.activeRecord;
      }

      $tabPane.html( $app );

      this.$modal.find( ".card-body .tab-content" ).append( $tabPane );

      if ( 
        groupName && groupName.toLowerCase() !== "hidden" 
      ) {
        if ( ! ( groupName in groups ) ) {
          groups[ groupName ] = [];
        }

        groups[ groupName ].push( tab );
      } else {
        tabs.push( tab );
      }

      tabIds.push( tab.tableId );
    }

    Object.keys( groups ).sort().reverse()
      .forEach( ( groupName, index ) => {
        let $li = $( `<li class="nav-item temp" role="presentation">
              <button class="nav-link" tabindex="0" 
                data-group="${groupName}">
                ${groupName}
                <i class="fas fa-angle-down ms-3"></i>
              </button>
            </li>` ),
          $tabGroup = $( "<ul>", { 
            "data-group": groupName, 
            class: "shadow-2 nav-tab-sub-content nav nav-tabs"
          } );
    
        this.$modal.find( ".card-header .nav-tabs > li:first-child" ).after( $li );
        this.$modal.find( ".card-header .tab-container.-sub" ).append( $tabGroup );
  
        for ( const tab of groups[ groupName ] ) {
          let name = urlLabel == tab.tableName ? `${urlLabel}-${tab.tableName}` : tab.tableName,
            id = name.replace( / /g, "-" ).replace( /[^\w\d]/g, "" );

          this.tableToTab( tab );

          new Tab( this.$modal.find( `[id="${id}-tab"]` )[0] );
        }
      });

      for ( const tab of tabs ) {
        let name = urlLabel == tab.tableName ? `${urlLabel}-${tab.tableName}` : tab.tableName,
          id = name.replace( / /g, "-" ).replace( /[^\w\d]/g, "" );

        this.tableToTab( tab );

        new Tab( this.$modal.find( `[id="${id}-tab"]` )[0] );   
      }

      this.$modal.find(".nav-tabs [data-mdb-toggle='tooltip']").each( function( index ) {

      new Tooltip( this, { title: $( this ).attr( "title" ) } );
    } );

    this.$modal.find( `#${activeTabId}` ).addClass( "active" ).trigger( "click" );
  }

  submit () {
    super.submit();

    let btn = this.$modal.find( "dg-spinner-button" )[0];

    if ( ! this.valid ) {
      btn.finish();
      
      return;
    }

    let idColumnId = this.columns.filter( column => column.columnName == "id" )[0].id,
      id = this.$modal.find( `#details form #${idColumnId}` )[0].value;

    record.update( this.database, this.table, id, this.config ).then( res => {
      this.resolve( this.config );

      this.$modal[0].close();
    } )
    .catch( error => {
      btn.finish();

      if ( error?.errors ) {
        toastError( "Error", error.errors );
      } else {
        toastError( "Error", error );
      }
    } );
  }
}

$( document )
  .on( "click", function ( e ) {
    if ( 
      e.target.hasAttribute( "data-mdb-toggle" ) && 
      $( e.target ).attr( "data-mdb-toggle" ) == "popover"
    ) {
      return;
    }

    if ( $( e.target ).closest( ".popover" ).length < 1 ) {
      let id = $( '.popover' ).attr( "id" );

      $( `[aria-describedby='${id}']` ).trigger("click");
    }
  } )
  .on( "click", ".popover .close-popover", function ( e ) {
    let id = $( '.popover' ).attr( "id" );

    $( `[aria-describedby='${id}']` ).trigger("click");
  } );