import * as report from '/src/js/controllers/report.js';

import * as util from '/src/js/util.js';
import Modal from '/src/js/classes/modal.js';

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

export default class PageSettings extends Modal {
	constructor ( config ) {
		super( "tinyMcePageSettingsModal", "Page settings" );

		this.paint( config );

		return this;
	}

	changePageSize ( e ) {
		let $customPageContainer = this.$modal.find( ".js-custom-page-size" );

		if ( $( e.target ).val() == "Custom" ) {
			$customPageContainer.removeClass( "hidden" );
		} else {
			$customPageContainer.addClass( "hidden" );
			$customPageContainer.find( "input" ).val( "" );
		}
	}

	async paint ( config ) {
		let inchTxt = `<div class="col-2">
				<span id="textExample2" class="form-text"> Inch </span>
			</div>`,
			changePageSize = this.changePageSize.bind( this );

		this.$modal
			.find( ".modal-body form" )
			.append( `<div class="form-outline mb-3">
					<select class="select" id="page-size" 
						aria-label="Page settings">
						<option value="A3">A3</option>
						<option value="A4" selected>A4</option>
						<option value="A5">A5</option>
						<option value="Legal">Legal</option>
						<option value="Letter">Letter</option>
						<option value="Tabloid">Tabloid</option>
						<option value="Custom">Custom</option>
					</select>
					<label class="form-label select-label" 
						for="page-size">Page Size</label>
				</div>

				<div class="row g-3 align-items-center mb-3 hidden js-custom-page-size">
					<div class="col-12">
						<p class="m-0"><b>Custom page size:</b></p>
					</div>

					<div class="col-4">
						<div class="form-outline">
							<input type="number" class="form-control" 
								id="page-height"/>
							<label for="page-height" class="form-label">
								Height
							</label>
						</div>
					</div>
					${inchTxt}

					<div class="col-4">
						<div class="form-outline">
							<input type="number" class="form-control" 
								id="page-width"/>
							<label for="page-width" class="form-label">
								Width
							</label>
						</div>
					</div>
					${inchTxt}
				</div>

				<p><b>Margin:</b></p>

				<div class="row g-3">
					<div class="col-4">
						<div class="form-outline">
							<input type="number" class="form-control" 
								id="margin-left"/>
							<label for="margin-left" class="form-label">
								Left
							</label>
						</div>
					</div>
					${inchTxt}

					<div class="col-4">
						<div class="form-outline">
							<input type="number" class="form-control" 
								id="margin-right"/>
							<label for="margin-right" class="form-label">
								Right
							</label>
						</div>
					</div>
					${inchTxt}

					<div class="col-4">
						<div class="form-outline">
							<input type="number" class="form-control" 
								id="margin-top"/>
							<label for="margin-top" class="form-label">
								Top
							</label>
						</div>
					</div>
					${inchTxt}

					<div class="col-4">
						<div class="form-outline">
							<input type="number" class="form-control" 
								id="margin-bottom"/>
							<label for="margin-bottom" class="form-label">
								Bottom
							</label>
						</div>
					</div>
					${inchTxt}
				</div>` );

		this.$modal.find( "#page-width" ).val( config.size.width );
		this.$modal.find( "#page-height" ).val( config.size.height );
		this.$modal.find( "#page-size" ).val( config.format );
		this.$modal.find( "#margin-left" ).val( config.margin.left );
		this.$modal.find( "#margin-right" ).val( config.margin.right );
		this.$modal.find( "#margin-bottom" ).val( config.margin.bottom );
		this.$modal.find( "#margin-top" ).val( config.margin.top );

		this.$modal.on( "change", "#page-size", changePageSize );

		this.$modal.find( "#page-size" ).trigger( "change" );

		super.paint();
		super.ready();
	}

	submit ( e ) {
		let $form = this.$modal.find( "form" );

		super.submit( e );
    
		this.$modal.trigger( "form::submit", [ {
				format: $form.find( "#page-size" ).val(),
				size: {
					width: $form.find( "#page-width" ).val(),
					height: $form.find( "#page-height" ).val() 
				},
				margin: {
					left: $form.find( "#margin-left" ).val(),
					right: $form.find( "#margin-right" ).val(),
					bottom: $form.find( "#margin-bottom" ).val(),
					top: $form.find( "#margin-top" ).val()
				}
			} ] );

		this.close();
	}
}
