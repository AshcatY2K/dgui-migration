import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';
import { initMDBElements } from '/src/js/util.js';

export default class Modal {
	constructor ( id, title, position = "" ) {
		let $modal = $( "<div>", {
				class: `modal fade ${position}`,
				id: id ,
				tabindex: "-1" ,
				"data-mdb-backdrop": "static",
				"aria-labelledby": id ,
				"aria-hidden": "true"
			} ),
			dialogClass = "";

		if ( position == "right" ) {
			dialogClass = "modal-side modal-bottom-right";
		}

		$modal.append( `<div class="modal-dialog ${dialogClass}">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">${title}</h5>
						<button type="button" class="btn-close"
							data-mdb-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body" style="min-height: 150px;">
						<div aria-label="Loading page" class="loader"></div>
						<form style="display: none;"></form>
					</div>
					<div class="modal-footer">
						<button type="submit" class="btn btn-primary slide-btn">
						<div class="spinner-border text-light" role="status">
							<span class="visually-hidden">Loading...</span>
						</div>
						<span>Save</span>
					</button>
					</div>
				</div>
			</div>` );

		this.id = id;

		$( "body" ).append( $modal );

		this.$modal = $( $modal )
	}

	ready () {
		this.$modal.find( ".loader" ).hide();

		if( this.$modal.find( "form" ).length > 0 ) {
			this.$modal.find( "form" ).show();
		}
	}

	paint () {
		initMDBElements( this.$modal );

		let submit = this.submit.bind( this ),
			destroy = this.destroy.bind( this );

		this.$modal
			.off( "submit", "form", submit )
			.off( "click", "button[type='submit']", submit )
			.off( "hidden.mdb.modal", destroy )

			.on( "submit", "form", submit )
			.on( "click", "button[type='submit']", submit )
			.on( "hidden.mdb.modal", destroy );
	}

	populate ( ) { }

	submit ( e ) {
		e.preventDefault();

		let $submitBtn = this.$modal.find( ".slide-btn[type='submit']" );

		$submitBtn.addClass( "loading" );

		this.validate( e );
	}

	invalid () {
		let $submitBtn = this.$modal.find( ".slide-btn[type='submit']" );

		$submitBtn.removeClass( "loading" );
	}

	destroy ( ) {
		this.$modal.remove();

		return this;
	}

	clear ( ) {
		this.$modal.find( "form input, form select" ).val( "" );
	}

	close ( ) {
		$( `#${this.id} .btn-close` ).trigger( "click" );

		return this;
	}

	success ( msg ) {
		let $submitBtn = this.$modal.find( ".slide-btn[type='submit']" );

		$submitBtn.removeClass( "loading" ).addClass( "success" );

		setTimeout( () => $submitBtn.removeClass( "success" ), 1500);

		screenReaderAlert( msg );
	}

	error ( msg ) {
		let $submitBtn = this.$modal.find( ".slide-btn[type='submit']" );

		toastError( "Error", msg );

		$submitBtn.removeClass( "loading" );
	}

	validate ( e ) {
		let inputWithValueCount = 0,
			$inputs = this.$modal.find( "form").find( "select, textarea, input" );
		
		this.valid = true;
		
		this.$modal.find( "form *:invalid").each( ( index, el ) => {
			let $feedback = $( el ).parent().find( ".invalid-feedback" ),
				originalValue = $feedback.attr( "data-original-value" );

			if ( $( el ).val() == '' ) {
				$feedback.attr( "data-original-value", $feedback.html() )
					.html( "This field is required" );
			} else {
				$feedback.html( originalValue );
			}
		} );

		if ( $inputs.length > 0 ) {
			this.$modal.find( "form").find( "select, textarea, input" )
				.each( ( index, el ) => {
					if ( $( el ).val() ) {
						inputWithValueCount++;
					}
				} );

			this.$modal.find( "form").find( "select" )
				.each( ( index, el ) => {
					let $input = $( el ).parent().find( "input" );

					if ( 
						(
							el.hasAttribute( "required" ) || 
							$( el ).attr( "data-mdb-validation" ) 
						) &&
						$input.val() == "( Blank )"
					) {
						$input[0].setCustomValidity( 'false' );
					} else {
						$input[0].setCustomValidity( '' );
					}
				} );

			if ( inputWithValueCount == 0 ) {
				this.error( "Empty record" );

				this.valid = false;
			}
		}
	}
}