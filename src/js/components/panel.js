import * as util from '/src/js/util.js';
import * as focusTrap from '/src/js/components/focusTrap.js';
import PerfectScrollbar from './mdb/pro/perfect-scrollbar';

export default class DGPanel extends HTMLElement {
  constructor() {
    super();

    this.breakPoints = [ 576, 768, 992, 1200 ];

    this.html = `<button class="expand-panel" tab-index="0" aria-label="expand panel">
          <i class="fas fa-angle-left"></i>
        </button>
        <div class="card-header p-0">
          <div class="custom-content"></div>
          <button type="button" class="btn-close float-end" aria-label="Close">
        </div>
        </button>
        <div class="card-body p-3">
          <div aria-label="Loading page" class="loader"></div>
          <div class="custom-content"></div>
        </div>
        <div class="card-footer"></div>`;

  }

  static get observedAttributes () {
    return [ "primary", "secondary" ];
  }

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

  set header ( html ) {
    $( this ).find( ".card-header" ).show();
    $( this ).find( ".card-header .custom-content" ).html( html );
  }

  set body ( html ) {
    $( this ).find( ".card-body .custom-content" ).html( html );
  }

  set footer ( html ) {
    $( this ).find( ".card-footer" ).show().html( html );
  }

  set primary ( primary ) {
    $( "dg-panel.primary" ).each( ( index, el ) => { el.close(); } );

    $( this ).addClass( "primary" );
  }

  set secondary ( secondary ) {
    $( "dg-panel.secondary" ).each( ( index, el ) => { el.close(); } );

    $( this ).addClass( "secondary offset-right" );
    $( ".floating-panel.primary" ).addClass( "second-position" );
  }

  get header () { 
    return $( this ).find( ".card-header .custom-content" ).html(); 
  }

  get body () { return $( this ).find( ".card-body .custom-content" ).html(); }
  get footer () { return $( this ).find( ".card-footer" ).html(); }
  get primary () { return $( this ).attr( "primary" ); }
  get secondary () { return $( this ).attr( "secondary" ); }

  expand ( e ) {
    $( this )
      .toggleClass( "expanded" )
      .find( ".expand-panel .fas" )
      .toggleClass( "fa-angle-left fa-angle-right" );

    let lastWidth,
      resize = setInterval( () => {
        for ( const point of this.breakPoints ) {
          if ( point < $( this ).width() ) {
            $( this ).attr( "data-cq", "min-width:" + point + "px" );
          }
        }

        if ( lastWidth == $( this ).width() ) {
          clearInterval( resize );
        } else {
          lastWidth = $( this ).width();
        }
      }, 100 );

    $( this ).find( ".card-body" ).scrollTop = 0;
  }

  ready () {
    $( this ).find( ".loader" ).hide();
    $( this ).find( ".custom-content" ).show();
  }

  close ( e ) {
    $( this ).free();

    if ( this.primary ) {
      let openPanels = $( "dg-panel.secondary" );
      if ( openPanels.length ) {
        openPanels[0].close();
      }
    } else if ( this.secondary ) {
      $( "dg-panel.primary" ).removeClass( "second-position" );
    }

    $( this ).removeClass( "active" );
    
    setTimeout( () => $( this ).remove(), 1000 );
  }

  connectedCallback () {
    $( this ).addClass( "card floating-panel shadow-0 side-panel" )
      .attr( "role", "application" );

    let expand = this.expand.bind( this ),
      close = this.close.bind( this );

    $( this ).append( this.html );

    for ( const point of this.breakPoints ) {
      if ( point < $( this ).width() ) {
        $( this ).attr( "data-cq", "min-width:" + point + "px" );
      }
    }

    $( this ).addClass( "active" );

    $( this ).trap();

    $( this )
      .on( "click", ".expand-panel", expand )
      .on( "click", ".btn-close", close );
  }
}

window.customElements.define('dg-panel', DGPanel);