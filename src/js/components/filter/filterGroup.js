import * as util from '/src/js/util.js';

import * as Filter from './filter';

class FilterGroup extends HTMLElement {
  constructor() {
    super();

    let timestamp = window.performance.now();

    this.html = `<div class="d-flex">
        <div class="flex-fill pt-1 group-operator-container">
          <div class="btn-group">
            <input type="radio" class="btn-check" name="operator${timestamp}" 
              id="and${timestamp}" value="and" autocomplete="off" checked />
            <label class="btn btn-info btn-sm" for="and${timestamp}">AND</label>

            <input type="radio" class="btn-check" name="operator${timestamp}" 
              id="or${timestamp}" value="or" autocomplete="off" />
            <label class="btn btn-info btn-sm" for="or${timestamp}">OR</label>
          </div>
        </div>
        <div class="flex-fill">
          <button class="js-add-filter btn btn-link advanced-feature">
            <i class="fas fa-plus"></i> Add filter
          </button>
        </div>
        <div class="flex-fill advanced-feature">
          <button class="add-group btn btn-link">
            <i class="fas fa-layer-group"></i> Add group
          </button>
        </div>
        <div class="col-1">
          <button class="js-remove-group btn btn-link advanced-feature">
            <i class="far fa-trash-alt"></i>
          </button>
        </div>
      </div>`;
  }

  static get observedAttributes () {
    return [ "operator" ];
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  set operator ( operator ) {
    $( this ).find( `[id^='operator']:checked` ).removeAttr( "checked" );
    $( this ).find( `[id^='operator'][value=${operator}]` ).attr( "checked", "checked" );
  }

  remove ( e ) {
    e.preventDefault();
    $( this ).remove();
  }

  addGroup ( e ) {
    e.preventDefault();

    let $group = $( "<filter-group>", { class: 'mb-2 container' } );

    $( this ).append( $group );
  }

  addFilter ( e ) {
    e.preventDefault();

    let $filter = $( "<table-filter>", { class: 'container mb-2 px-0 pb-2 pt-3' } );

    $( this ).append( $filter );
  }

  toJson () {
    let $checkbox = $( this ).find( " > .d-flex > .group-operator-container [name^='operator']:checked:visible" ),
      json = { filters: [] };

    if ( $checkbox.length > 0 ) {
      json.operator = $checkbox.val();
    }

    $( this ).find( "> filter-group, > table-filter" ).each( ( index, el ) => {
      json.filters.push( el.toJson() );
    } );

    return json;
  }
    
  connectedCallback () {
    let html = $( this ).html();
    
    $( this ).html( this.html ).append( html );

    $( this ).find( "> .d-flex > div" )
      .on( "click", "> .add-group", this.addGroup.bind( this ) )
      .on( "click", "> .js-remove-group", this.remove.bind( this ) )
      .on( "click", "> .js-add-filter", this.addFilter.bind( this ) );
  }
}

window.customElements.define('filter-group', FilterGroup);