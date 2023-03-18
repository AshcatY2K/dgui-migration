import * as report from '/src/js/controllers/report.js';
import * as preferences from '/src/js/controllers/preferences.js';

import * as util from '/src/js/util.js';
import Modal from '/src/js/classes/modal.js';

import * as FilterGroup from '.././components/filter/filterGroup';
import Autocomplete from '.././components/mdb/pro/autocomplete';

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

export default class FilterModal extends Modal {
  constructor ( app, column = false, comparative = false, filterValue = false ) {
    super( "columnFilterModal", `Filter &amp; Search
      <a href="https://www.mydatagrowsblog.com/post/advanced-filters" 
        target="_blank" style="font-size: 1.2rem;" aria-label='more information'>
        <i class="far fa-question-circle"></i>
      </a>` );

    this.app = app;

    if ( ! comparative ) {
      comparative = "contains";
    }
    
    this.comparative = comparative;
    this.filterValue = filterValue;
    this.column = column;

    this.$modal[0].columns = this.app.columns;
    this.$modal[0].database = this.app.database;

    this.$modal.find( ".modal-footer [type='submit']" ).html( "Apply" )
      .addClass( "float-end" );

    this.$modal.find( ".modal-footer" ).addClass( "align-items-end" );
    
    super.paint();
    this.paint();

    return this;
  }

  populate ( filters ) {
    let $filter;
    
    if ( Array.isArray( filters ) ) {
      let tempFilters = filters.filter( filter => filter.transitory  ),
        $filterGroup = $( "<filter-group>", {
           class: 'mb-2 container',
           operator: filters.operator
        } );

      if ( tempFilters.length > 0 ) {
        filters = tempFilters;
      }

      for ( let filter of filters  ) {
        if ( filter.filters ) {
          $filter = this.populate( filter.filters );
        } else {
          $filter = this.populate( filter );
        }

        $filterGroup.append( $filter );
      }

      return $filterGroup;
    }

    return $( "<table-filter>", {
        class: 'container mb-2 px-0 pb-2 pt-3 pe-0',
        column: filters.columnId,
        comparative: filters.comparative,
        value: filters.filter,
        operator: filters.operator,
        from: filters.from,
        to: filters.to,
        lookup: filters.lookup,
        locked: filters.locked
      } );
  }

  async paint () {    
    let $form = this.$modal.find( ".modal-body form" );

    this.preferences = await this.app.preferences;

    if ( $form.find( "#filter-name" ).length < 1 ) {
      $form.append( `<div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" 
            id="toggle-advanced-filter">
          <label class="form-label form-check-label" for="toggle-advanced-filter">
            Advanced Filter
          </label>
        </div>

        <div class="row d-flex">
          <div class="col-12 col-sm-8 advanced-feature">
            <div class="form-outline mb-3 filter-name-container">
              <input type="text" id="filter-name" class="form-control">
              <label class="form-label" for="filter-name">Title</label>
            </div>
          </div>
          <div class="col-12 col-sm-4 advanced-feature">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="global">
              <label class="form-label form-check-label" for="global">
                Global preference
              </label>
            </div>
          </div>
        </div>` );

      this.$modal.find( ".modal-footer" ).prepend( `<button disabled
          class="btn btn-info slide-btn advanced-feature me-3" id="save-filter" 
          aria-label="save filter" style="height: 34.64px;">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <span style="line-height: 1.6;">Save &amp; Apply</span>
        </button>`);

      util.initMDBElements( this.$modal.find( ".filter-name-container" ) );
    }

    let filter = this.app.config.filters;

    if ( 
      ! this.app.hasAttribute("embedded") && 
      this.app.config.tempFilters &&
      ! $.isEmptyObject( this.app.config.tempFilters )
    ) {
      filter = this.app.config.tempFilters;
    }

    if ( $.isEmptyObject( filter ) ) {
      $form.append( `<h4 class="advanced-feature">Filter List</h4>
        <filter-group class='container p-0' 
          style='background: none; border: none;'></filter-group>` );
    } else {
      let $filters = this.populate( filter );

      $form.find( "filter-group" ).remove();

      $form.append( $filters );

      if ( 
        filter.length > 1 || 
        filter.filters ||
        ( filter.length == 1 && this.columnId )
      ) {
        this.$modal.find( "#toggle-advanced-filter" ).prop( "checked", true );

        this.isAdvanced = true;
      }
    }

    if ( this.app.config.appliedFilterId ) {
      let preference = this.preferences.filter( preference => preference.id == this.app.config.appliedFilterId )[0];

      if ( preference ) {
        this.activePreference = preference;

        $form.find( "#filter-name" ).val( preference.Name );
          this.$modal.find( "#save-filter" ).prop( "disabled", false );

        if ( preference.Global ) {
          this.$modal.find( "#global" ).prop( "checked", true );
        }
      }
    }

    if ( this.column ) {
      let $filter = $( "<table-filter>", {
          class: 'container mb-2 px-0 pb-2 pt-3',
          column: this.column,
          comparative: this.comparative,
          filter: this.filterValue
        } );

      $form.find( "> filter-group" ).append( $filter );
     }

      
    this.ready();
  }

  toggleAdvancedSettings ( e ) {
    e.preventDefault();
    
    if ( $( e.target ).is(":checked") ) {
      this.$modal.addClass( "advanced" );
    } else {
      let $group = this.$modal.find( "filter-group" );

      this.$modal.removeClass( "advanced" );

      $group.find( "table-filter, filter-group" ).remove();

      $group.append( "<table-filter class='container mb-2 px-0 pb-2 pt-3 pe-0'></table-filter>" );
    }
  }

  ready () {
    super.ready();

    let instance = new Autocomplete( this.$modal.find( "#filter-name" ).parent()[0], { 
        filter: value => {
          return this.preferences.filter( preference => {
            return preference.Name.toLowerCase().startsWith( value.toLowerCase() );
          });
        },
        displayValue: preference => {
          return preference.Name 
        }
      } );

    this.$modal
      .on( "change", "#filter-name", e => {
        this.$modal.find( "#save-filter" ).prop( "disabled", false );
      } )
      .on( "itemSelect.mdb.autocomplete", ".filter-name-container", e => {
        this.activePreference = e.value;
        this.paint();
      } )
      .on( "change", "#toggle-advanced-filter", this.toggleAdvancedSettings.bind( this ) )
      .on( "click", "#save-filter", this.savePreference.bind( this ) );

    if ( this.isAdvanced) {
      this.$modal.find( "#toggle-advanced-filter" ).trigger( "change" );
    }
  }

  savePreference ( e ) {
    e.preventDefault();
    e.stopImmediatePropagation();

    let $form = this.$modal.find( ".modal-body form" ),
      preference = $form.find( "> filter-group" )[0].toJson(),
      name = $form.find( "#filter-name" ).val(),
      $saveBtn = this.$modal.find( "#save-filter" ),
      payload = {
          name: name,
          preference: JSON.stringify( preference ),
          global: false,
          type: "filter"
        },
      saveSuccess = () => {
          setTimeout( () => $saveBtn.removeClass( "success" ), 1500);

          this.submit( e );
      };

    if ( $form.find( "#global" ).is(':checked') ) {
      payload.global = true;
    }
      
    $saveBtn.addClass( "loading" );

    if ( this.activePreference?.Name == name ) {
      preferences.update( this.app.database, this.app.table, this.activePreference.id, payload )
        .then( res => {
          saveSuccess();

          toastSuccess( "Success", "Your filter has been updated" );
          screenReaderAlert( "Your filter has been updated" ) 
        } )
        .catch( error => { toastError( error ) } );
    } else {
      preferences.add( this.app.database, this.app.table, payload )
        .then( res => {
          saveSuccess();

          toastSuccess( "Success", "Your filter has been saved" );
          screenReaderAlert( "Your filter has been saved" ) 
        } )
        .catch( error => { toastError( error ) } );
    }
  }

  close () {
    super.close();
    this.destroy();
  }

  submit ( e ) {
    super.submit( e );
console.log("#1")  

    let $form = this.$modal.find( ".modal-body form" ),
      filters = $form.find( "> filter-group" )[0].toJson();

    $form.addClass('was-validated');
console.log("#2")
    if ( ! $form[0].checkValidity() ) {
console.log($form.find( ":invalid" ))
      $form.find( ":invalid" ).eq(0).focus();
      
      return;
    }
console.log("#3")
    if ( this?.activePreference?.id ) {
      this.app.filter( filters.filters, this.activePreference.id );
    } else {
      this.app.filter( filters.filters );
    }
console.log("#4")  
    this.close();
    this.destroy();
console.log("#5")  
  }
}