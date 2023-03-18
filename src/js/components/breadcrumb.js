export default class DGBreadcrumb extends HTMLElement {
  constructor() {
    super();

    this.html = `<ol class="breadcrumb"></ol>`;
  }

  get config () {
    let breadcrumb = window.localStorage.getItem( 'breadcrumb' );

    return breadcrumb ? JSON.parse( breadcrumb ) : null;
  }

  async load () {
    let $ol = $( this ).find( ".breadcrumb" );
    
    if ( ! this.config ) {
      return;
    }

    for ( let crumb of this.config ) {
      crumb.name = decodeURI( crumb.name );

      $ol.append( `<li class="breadcrumb-item">
          <a href="${crumb.link}" data-link data-table="${crumb.tableId}">
            ${crumb.name}
          </a>
        </li>` );
    }

    this.app.tableConfig.then( tableConfig => {
      $ol.append( `<li class="breadcrumb-item">${tableConfig.tabelName}</li>` );

      $( this ).append( $ol );
    } );
  }

  connectedCallback () {
    $( this ).html( this.html );

    this.app = $( this ).closest( "dg-app" )[0];

    $( this )
      .on( "click", ".breadcrumb-item a", function ( e ) {
        let id = $( this ).attr( "data-table" ),
          found = false,
          crumbs = [];

        if ( this.config ) {
          for ( let crumb of this.config ) {
            if ( crumb.tableId == id ) {
              found = true;
            } else if ( ! found ) {
              crumbs.push( crumb );
            }
          }
        }

        if ( crumbs.length == 0 ) {
          window.localStorage.removeItem( 'breadcrumb' );
        } else {
          window.localStorage.setItem( 'breadcrumb', JSON.stringify( crumbs ) );
        }
      } )
  }
}

window.customElements.define('dg-breadcrumb', DGBreadcrumb);