import { default as columnAdd } from '/src/js/forms/column/add.js';
import { default as manageColumn } from '/src/js/forms/column/manage.js';
import { default as recordAdd } from '/src/js/forms/record/add.js';
import { default as recordEdit } from '/src/js/forms/record/edit.js';
import { default as upload } from '/src/js/forms/upload.js';
import inputFormModal from '/src/js/forms/editInputForm.js';

import * as macro from '/src/js/controllers/macro.js';
import * as preference from '/src/js/controllers/preferences.js';
import { download }from '/src/js/controllers/table.js';
import { bulkRemove }from '/src/js/controllers/record.js';

import { browser } from '/src/js/helpers/browser.js';

import mdbModal from '/src/js/components/mdb/pro/modal';
import '/src/js/components/filter/link';

import Dialog from '/src/js/components/dialog.js';
import DGBreadcrumb from '/src/js/components/breadcrumb.js';

import FilterModal from '/src/js/forms/filter.js';

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

export default class DGAppMenu extends HTMLElement {
  constructor() {
    super();

    this.html = `<nav class="navbar navbar-expand-md navbar-light bg-light p-0 px-3 shadow-0" 
        id="table-nav">
        <div class="container-fluid p-0 py-1">
          <ul class="navbar-nav">
            <!-- Dropdown -->
            <li class="nav-item dropdown">
              <a class="nav-link ps-0" href="#" id="table-options" aria-label="Table Menu" role="button" data-mdb-toggle="dropdown" aria-expanded="false">
                Menu
                <i class="fa fa-chevron-down" style="font-size: 0.7rem;"></i>
              </a>
              <ul class="dropdown-menu options shadow-1-strong" aria-labelledby="table-options" data-database-id="1350" data-table-id="36" data-type="table" data-label="">
                <li>
                  <a href="#" class="dropdown-item download" aria-label="Download">
                    Download
                  </a>
                </li>
                <li>
                  <a href="#" class="dropdown-item manage" aria-label="Manage columns">
                    Manage Columns
                  </a>
                </li>
                <li>
                  <a href="#" class="dropdown-item reset-table" aria-label="Reset Table Preferences">
                    Reset Table Preferences
                  </a>
                </li>            
              </ul>
            </li>
            <li class="nav-item dropdown" style="">
              <a class="nav-link" href="#" id="actions" role="button" data-mdb-toggle="dropdown" aria-expanded="false">
                Actions
                <i class="fa fa-chevron-down" style="font-size: 0.7rem;"></i>
              </a>
              <ul id="bulk-action" aria-labelledby="actions" class="dropdown-menu options shadow-1-strong"></ul>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link" href="#" id="filter-menu" role="button" data-mdb-toggle="dropdown" aria-expanded="false">
                Filters
                <i class="fa fa-chevron-down" style="font-size: 0.7rem;"></i>
              </a>
              <ul class="dropdown-menu js-filter-container shadow-1-strong" aria-labelledby="filter-menu">
                <li>
                  <a class="dropdown-item edit-filters" 
                    href="javascript:void(0)" disabled="">
                    Edit Filters
                  </a>
                </li>
                <li>
                  <a class="dropdown-item clear-filters" href="javascript:void(0)" disabled="">
                    Clear Filters
                  </a>
                </li>
              </ul>
            </li>
          </ul>

          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            <li class="nav-item js-breadcrumb pe-3 pt-1">
              <dg-breadcrumb></dg-breadcrumb>
            </li>
          </ul>
        </div>
      </nav>`;
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  static get observedAttributes () {
    return [];
  }

  get macros () { return this._macros; }
  get preferences () { return this._preferences; }

  set macros ( macros ) {
    let disabled = ( this.app.selectedRecords?.length > 0 ) ? "" : "disabled";

    this._macros = macros;

    for ( let macro of macros ) {
      $( this ).find( "#bulk-action" ).prepend( `<li>
          <a href="#" aria-label="Download" ${disabled}
            class="dropdown-item" data-macro-id="${macro.id}">
            ${macro.MacroName}
          </a>
        </li>` )
    }
  }

  set preferences ( preferences ) {
    let $container = $( this ).find( ".js-filter-container " );

    $container.find( "dg-filter-link" ).remove();

    this._preferences = preferences;
    
    for ( const preference of preferences ) {
      if ( preference.Type !== "filter" ) {
        continue;
      }

      let styleClass = "";
      
      if ( this.app.appliedFilterId == preference.id ) {
        styleClass = "bg-info";
      }

      let $link = $( "<dg-filter-link>", {
        class: `dropdown-item ${styleClass}`,
        id: preference.id,
        name: preference.Name
      } );

      $container.prepend( $link );
    }
  }

  addColumn ( e ) {
    e.preventDefault();
    
    let dialog = new columnAdd( this.app.database, this.app.table, this.app.embedded  );

    dialog.then( config => {
      $( this.app ).find( ".table-heading" ).trigger( "focus" );

      if ( ! config ) return;
      
      this.app.init();
    } );
  }

  addRecord ( e ) {
    e.preventDefault();
    
    let database = this.app.database, 
      table = this.app.table, 
      columns = this.app.columns,
      form = JSON.parse( this.app.form ),
      dialog = new recordAdd( database, table, columns, this.app, form, this.app.embedded );

    dialog.then( config => {
      if ( ! config ) {
        $( this.app ).find( ".table-heading" ).trigger( "focus" );
        return;
      }
      
      $( this.app ).find( "dg-table-body" )[0].loadRecords();

      if ( config?.action == "new" ) {
        $( this ).find( ".add-record" ).trigger( "click" );
      } else {
        let dialog = new recordEdit( 
            database, 
            table, 
            columns, 
            this.app, 
            form, 
            config.record, 
            null, 
            this.app.embedded 
          );

        this.app.activeRecord = {
            table: this.app.table,
            record: config.record
          };
          
        dialog.then( config => {
          $( this.app ).find( ".table-heading" ).trigger( "focus" );
          if ( ! config ) return;

          $( this.app ).find( "dg-table-body" )[0].loadRecords();
        } );
      }
    } );
  }

  manage ( e ) {
    e.preventDefault();

    this.app.tableConfig.then( tableConfig => {
      let dialog = new manageColumn( 
        this.app.database, 
        this.app.table, 
        tableConfig["Preference Designer"],
        this.app.columns, 
        this.app.embedded
      );

      dialog.then( config => {
        $( this.app ).find( ".table-heading" ).trigger( "focus" );

        if ( ! config ) return;

        this.app.columnPreference( config );
        this.app.init();
      } );
    } );
  }

  download ( e ) {
    e.preventDefault();

    download( this.app.database, this.app.table, this.app.config )
      .then( uri => {
        if ( browser() !== "safari" ) {
          window.open( uri ); 
        } else {
          const dialog = new Dialog();

          dialog.alert( `<a href='${uri}'>Click here to download file</a>` )
            .then( res => {
              $( this.app ).find( ".table-heading" ).trigger( "focus" );

              if ( res ) {
                this.$modal[0].close();

                resolve( false );
              }
            } );
        }
      } );
  }

  upload ( e ) {
      e.preventDefault();

      let dialog = new upload( this.app.database, this.app.table );

      dialog.then( config => {
        $( this.app ).find( ".table-heading" ).trigger( "focus" );

        if ( ! config ) return;

        $( this.app ).find( "dg-table-body" )[0].init();

        $( this.app ).find( "dg-table-body" )[0].loadRecords();
      } );
  }

  async getMacros () {
    if ( this.macros ) {
      return;
    }

    this.macros = [];

    this.macros = await macro.get( this.app.database, this.app.table );
  }

  async getPreferences () {
    let preferences = await this.app.preferences;

    if ( ! preferences ) {
      return;
    }

    this.preferences = preferences;
    
    if ( ! jQuery.isEmptyObject( this.app.config.filters ) ) {
      $( this ).find( ".edit-filters, .clear-filters" )
        .removeAttr( "disabled" ).attr( "href", "#" );
    }
  }

  execMacro ( e ) {
    e.preventDefault();

    let macroId = $( e.target ).attr( "data-macro-id" ),
      label = $( e.target ).html(),
      records = this.app.selectedRecords;

    macro.exec( this.app.database, this.app.table, macroId, records ).then( res => {
      $( this.app ).find( "dg-table-body" )[0].loadRecords();
    } )
  }

  bulkDelete ( e ) {
    e.preventDefault();

    const dialog = new Dialog();

    dialog.confirm( `You are about to delete multiple records. Do you wish to proceed?` )
      .then( res => {
        if( res ) {
          bulkRemove( this.app.database, this.app.table, this.app.selectedRecords )
            .then( res => this.app.init() )
            .catch( ( error ) => toastError( `Error deleting record`, error ) );
        }
      } );
  }

  editForm ( e ) {
    e.preventDefault();

    new inputFormModal( this.app.database, this.app.table, this.app.columns, this.app.form );
    
    const modal = new mdbModal( $( '#inputFormModal' )[0] );
    modal. show();
  }

  resetTable ( e ) {
    e.preventDefault();

    this._macros = undefined;

    this.app.resetConfig();
  }

  async editFilter ( e ) {
    e.preventDefault();

    new FilterModal( this.app );

    const modal = new mdbModal( $( '#columnFilterModal' )[0] );
    modal.show();
  }

  clearFilter () {
    this.app.filter( {} ); 

    $( this ).find( ".edit-filters, .clear-filters" )
      .attr( "disabled", true ).attr( "href", "javascript:void(0)");

    $( this ).trigger( "clear::filter" );
  }

  refresh () {
    $( this ).html( this.html );

    this._macros = false;
    this._preferences = false;
  }

  connectedCallback () {
    $( this ).attr( "tabindex", "0" ).html( this.html );

    this.app = $( this ).closest( "dg-app" )[0];

    this.app.tableConfig.then( tableConfig => {
      if ( tableConfig["Can Delete Record"] ) {
        $( this ).find( "#bulk-action" ).append(`<li>
            <button class="dropdown-item bulk-delete" disabled="" 
              aria-label="Delete Selected">
              Delete Selected
            </button>
          </li>`);
      }
      
      if ( tableConfig.Designer ) {
        $( this ).find( ".manage" ).parent().after( `<li tabindex="-1" 
            aria-hidden="true">
            <a href="#" class="dropdown-item form-edit" tabindex="-1" 
              aria-hidden="true">
              Edit input form
            </a>
          </li>` );
      }

      if ( tableConfig["Can Add Record"] ) {
        $( this ).find( ".navbar-nav .download" ).closest( "li" ).after(`<li>
            <a href="#" class="dropdown-item upload" aria-label="Upload to table">
              Upload
            </a>
          </li>`);

        $( this ).find( ".js-breadcrumb" ).after(`<li class="nav-item pe-3" 
            style="">
              <a class="add-record btn btn-info btn-sm" href="#" 
                aria-label="Add record">
                Add Record
              </a>
            </li>`);

        $( this ).prepend(`<a class="add-record mobile-btn btn btn-info btn-sm" href="#" 
              aria-label="Add record">
            <i class="fas fa-plus"></i>
          </a>`);
      }

      if ( tableConfig.Designer ) {
        $( this ).find( ".js-breadcrumb" ).parent().append( `<li class="nav-item" style="">
            <a class="add-column btn btn-info btn-sm" href="#" 
              aria-label="Add column">
              Add Column
            </a>
          </li>` );
      }
    } );

    this._macros = false;
    this._preferences = false;

    $( this )
      .on( "click", ".add-column", this.addColumn.bind( this ) )
      .on( "click", ".manage", this.manage.bind( this ) )
      .on( "click", ".add-record", this.addRecord.bind( this ) )
      .on( "click", ".download", this.download.bind( this ) )
      .on( "click", ".upload", this.upload.bind( this ) )
      .on( "click", ".reset-table", this.resetTable.bind( this ) )
      .on( "click", ".form-edit", this.editForm.bind( this ) )
      .on( "click", "#bulk-action a:not( .bulk-delete  )", this.execMacro.bind( this ) )
      .on( "click", "#bulk-action .bulk-delete", this.bulkDelete.bind( this ) )
      .on( "click mouseover", "#actions", this.getMacros.bind( this ) )
      .on( "click mouseover", "#filter-menu", this.getPreferences.bind( this ) )
      .on( "click", "#table-options, #actions, #filter-menu", e => {
        e.preventDefault();
      } )
      .on( "click", "dg-filter-link", e => {
        $( this ).find( ".edit-filters, .clear-filters" )
          .removeAttr( "disabled" ).attr( "href", "#");
      } )
      .on( "click", ".clear-filters", this.clearFilter.bind( this ) )
      .on( "click", ".edit-filters", this.editFilter.bind( this ) );

    $( this.app )
      .on( "click", "dg-table .checkbox-container [type='checkbox']", e => {
        let $actions = $( this ).find( "#bulk-action a, #bulk-action button" ),
          disabled = ! ( this.app.selectedRecords.length > 0 );

        if ( disabled ) {
          $actions.attr( "disabled", true );
        } else {
          $actions.removeAttr( "disabled" );
        }

        $actions.prop( "disabled", disabled );
      } );
  }
}

window.customElements.define('dg-app-menu', DGAppMenu);