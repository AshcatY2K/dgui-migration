export default class DGSpinnerButton extends HTMLElement {
  constructor() {
    super();  

    this.label = $( this ).html();

    this.html = `<button type="submit" class="btn btn-primary slide-btn">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="label">${this.label}</span>
      </button>`;
  }

  load ( e ) {
    $( this ).find( "button" ).addClass( "loading" );
  }

  finish () {
    $( this ).find( "button" ).removeClass( "loading" );
  }

  connectedCallback () {
    let load = this.load.bind( this );

    $( this ).html( this.html );

    $( this ).find( "button" ).on( "click", load );
  }
}

window.customElements.define( 'dg-spinner-button', DGSpinnerButton );