import Loading from './components/mdb/pro/loading-management';

export default class Loader {
	constructor () {
		this.html = `
		  <div class="loading-full">
		    <div class="spinner-border loading-icon text-succes"></div>
		    <span class="loading-text">Loading...</span>
		  </div>
		`;

		this.id = "full-backdrop";
	}

	show () {
		$( 'body' ).append( this.html );

		this.loadingFull = document.querySelector('.loading-full');

		const loading = new Loading( this.loadingFull, {
		    scroll: false,
		    backdropID: this.id
		} );
	}

	hide () {
	    const backdrop = document.querySelector(`#${this.id}`);

	    backdrop.remove();
	    this.loadingFull.remove();

	    document.body.style.overflow = ''
	}
}