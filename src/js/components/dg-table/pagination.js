import './dataRow.js';
import * as record from '/src/js/controllers/record.js';

export default class DGTableBody extends HTMLElement {
  constructor() {
    super();

    this.html = `
        <div class="row d-flex justify-content-end">
          <div class="col-3 col-sm-6 col-md-4 col-lg-3 text-center">
            <p class="me-3 hidden-mobile">
              <small>
                Rows per page:
              </small>
            </p>
            <select id="entries" class="select" 
              aria-label="Choose the amount of rows to display per page">
              <option value="50" selected="selected">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>

          <div class="col-9 col-sm-6 col-md-5 col-lg-4 col-xl-4 text-center">
            <button data-mdb-ripple-color="dark" 
              aria-label="First page of table" 
              class="btn btn-link first" 
              disabled="disabled" aria-disabled="true">
              <i class="fa fa-angle-double-left"></i>
            </button>
            <button data-mdb-ripple-color="dark" 
              aria-label="Previous page of table" 
              class="btn btn-link prev" 
              disabled="disabled" aria-disabled="true">
              <i class="fa fa-chevron-left"></i>
            </button>
            
            <div class="page-info" ></div>

            <button data-mdb-ripple-color="dark" 
              aria-label="Next page of table" 
              class="btn btn-link next" 
              disabled="disabled" aria-disabled="true">
              <i class="fa fa-chevron-right"></i>
            </button>
            <button data-mdb-ripple-color="dark" 
              aria-label="Last page of table" 
              class="btn btn-link last" 
              disabled="disabled" aria-disabled="true">
              <i class="fa fa-angle-double-right"></i>
            </button>
          </div>
        </div>`;
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  static get observedAttributes () {
    return [ ];
  }

  enableNavigation ( page, max ) {
    let $prev = $( this ).find( ".first, .prev" ),
      $next = $( this ).find( ".next, .last" );

    if ( page <= 1 ) {
      $prev.attr( "disabled", true ).attr( "aria-disabled", "true" );
    } else {
      $prev.removeAttr( "disabled" ).attr( "aria-disabled", "false" );
    }

    if ( page >= max ) {
      $next.attr( "disabled", true ).attr( "aria-disabled", "true" );
    } else {
      $next.removeAttr( "disabled" ).attr( "aria-disabled", "false" );
    }
  }

  connectedCallback () {
    $( this ).html( this.html ).addClass( "container" );

    this.$app = $( this ).closest( "dg-app" );
    this.app = this.$app[0];

    $( this ).find( "#entries" ).val( this.app.config.rows );

    $( this )
      .on( "click", ".first", () => { this.app.page = 1; } )
      .on( "click", ".prev", () => { this.app.page = this.app.config.page - 1; } )
      .on( "click", ".next", () => { this.app.page = this.app.config.page + 1; } )
      .on( "click", ".last", () => {
        this.app.page = Math.ceil( this.recordCount / this.app.config.rows );
      } )
      .on( "change", "#entries", () => {
        this.app.pageSize = parseInt( $( this ).find( "#entries" ).val() );
      } );

      this.$app.find( "dg-table-body" )
        .on( "load", ( e, records ) => {
          this.recordCount = records.count;

          let row = this.app.config.rows,
            page = this.app.config.page,
            pageMax = Math.ceil( this.recordCount / row ),
            upperValue = row * page,
            lowerValue = upperValue - row;

          if ( upperValue > this.recordCount ) {
            upperValue = this.recordCount;
          }

          $( this ).find( ".page-info" ).html(
            lowerValue + " - " + upperValue+ " of " + this.recordCount
          )

          this.enableNavigation( page, pageMax );
        } );
    }
  }

window.customElements.define('dg-pagination', DGTableBody);