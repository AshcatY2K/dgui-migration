import Modal from '/src/js/classes/modal.js';
import * as focusTrap from '/src/js/components/focusTrap.js';

import Stepper from '.././components/mdb/pro/stepper';

export default class Onboarding extends Modal {
	constructor ( activeStep = 1, subStep = -1 ) {
		$( "#crmOnboarding" ).remove();

		super( "crmOnboarding", "" );

		this.activeStep = activeStep;
		this.subStep = subStep;

		this.$modal.find( ".modal-dialog" ).css( {
	    	"max-width": "95vw",
	    	"min-height": "90vh"
	     } );

		this.$modal.find( ".modal-body" ).css( {
	    	"max-width": "95vw",
	    	"min-height": "40vw"
	     } );

		this.$modal.find( ".modal-footer" ).remove();

		this.paint();

		return this;
	}

	stepElement ( step, label, title, content, active = false ) {
		let elClass = active ? "stepper-active" : "";

		return $( `<li class="stepper-step ${elClass}">
				<div class="stepper-head">
			        <span class="stepper-head-icon">${step}</span>
			        <span class="stepper-head-text">${label}</span>
			    </div>
			    <div class="stepper-content py-3" style="display: block;overflow: auto;height: calc( 95% - 75px );">
			    	<h5 style="display: none" class="modal-title">${title}</h5>
			        ${content}
			    </div>
		    </li>` );
	}

	accordianItem ( label, content, index, active = false ) {
		let bodyClass =  active ? "show" : "",
			btnClass = active ? "" : "collapsed",
			ariaExpanded = active ? "true" : "false";

		return `<div class="accordion-item">
			    <h2 class="accordion-header" id="flush-heading${index}">
			      <button class="accordion-button ${btnClass}" type="button"
			        data-mdb-toggle="collapse" data-mdb-target="#flush-collapse${index}"
			        aria-expanded="${ariaExpanded}" aria-controls="flush-collapse${index}">
			        ${label}
			      </button>
			    </h2>
			    <div id="flush-collapse${index}" class="accordion-collapse collapse ${bodyClass}"
			      aria-labelledby="flush-heading${index}" 
			      data-mdb-parent="#crmOnboardingAccordion">
			      <div class="accordion-body">${content}</div>
			    </div>
			</div>`;
	}

	embededYoutubeElement ( url, width, heigth ) {
		return `<div class="text-center">
			<iframe style="max-width: ${width}; width: 100%; height: ${heigth}; min-width: 290px;min-height: 165px;" src="${url}" 
	      		title="YouTube video player" frameborder="0" 
	      		allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" 
	      		allowfullscreen></iframe>
	      </div>`
	}

	ready () {
		super.ready();

		this.$modal.trigger( "modal:ready" );
	}

	async paint () {
		super.paint();

		let $stepper = $( "<ul>", {
				class: "stepper",
				id: "crm-onboarding-stepper"
			} ).css( { "max-height": "81vh" } ),
			steps = [
				{
					label: "Welcome",
					title: "Hi. Welcome to the Accounting CRM in DataGrows",
					content: this.embededYoutubeElement( "https://www.youtube.com/embed/v1Sn6wjClCA", "55vw", "31vw" )
				}, {
					label: "Set-up",
					title: "Setting Up",
					content: `<p>Great, now that you know your way around, let’s get you started.</p>
						<p>The setup process consists of 4 steps, listed below:</p>

						<div class="accordion accordion-flush" id="crmOnboardingAccordion">
						` + this.accordianItem( 
							"Overview ( optional )",
							"<p>Watch the video below to see the app in action</p>" +
							this.embededYoutubeElement( "https://www.youtube.com/embed/3o4waG96uIE", "55vw", "31vw" ),
							0, this.subStep == 0 ? true : false
						) + this.accordianItem( 
							"1) Firm Settings", 
							this.embededYoutubeElement( "https://www.youtube.com/embed/l6cqAuwiP-g", "55vw", "31vw" ),
							1, this.subStep == 1 ? true : false
						) + this.accordianItem( 
							"2) Adding Accountants", 
							this.embededYoutubeElement( "https://www.youtube.com/embed/OoqR7-XPKLE", "55vw", "31vw" ), 
							2, this.subStep == 2 ? true : false
						) + this.accordianItem( 
							`3) Prepping & importing your Client Data`, 
							`<p>
						        	This step takes a bit of time, but once it is done you are in the home 
						        	stretch and can enjoy the time-saving benefits of the Accounting CRM.
						        </p>

						        <p>
									If you get stuck at any point please email support@mydatagrows.com 
									or send a WhatsApp to 063 426 0080. Our staff members are always keen 
									to assist.
						        </p>

								<div class="accordion accordion-flush" id="crmOnboardingPrepDataAccordion">
								  <div class="accordion-item">
								    <h2 class="accordion-header" id="flush-headingOne">
								      <button class="accordion-button collapsed" type="button"
								        data-mdb-toggle="collapse" data-mdb-target="#flush-collapseOneSub"
								        aria-expanded="false" aria-controls="flush-collapseOneSub">
								        Option 1: Let’s do it! Upload all of my clients
								      </button>
								    </h2>
								    <div id="flush-collapseOneSub" class="accordion-collapse collapse"
								      aria-labelledby="flush-headingOne" data-mdb-parent="#crmOnboardingPrepDataAccordion">
								      <div class="accordion-body">
								        <p>
								        	Please download the Excel Spreadsheet called ‘Your Client import Data’ 
											then follow the steps in the video below.
										</p>
												
										<p>
											The ‘Client import data example’ is there as a visual reference if you need it.
								        </p>

								      	<div class="row mb-2 p-3 mx-0 stylized-link">
								      		<div class="col-1 d-flex justify-content-center pt-2">
								      			<i class="fas fa-file-excel link-primary"></i>
								      		</div>
								      		<div class="col-10">
								      			<p class="m-0">
								      				CLIENT IMPORT DATA EXAMPLE.xlsx<br>
								      				<small>Download XLSX &bull; 112 KB</small>
								      			</p>
								      		</div>
								      		<div class="col-1 d-flex align-items-center justify-content-center">
								      			<a href="/assets/xlsx/CLIENT IMPORT DATA EXAMPLE.xlsx" target="_blank">
								      				<i class="fas fa-download"></i>
								      			</a>
								      		</div>
								      	</div>

								      	<div class="row mb-2 p-3 mx-0 stylized-link">
								      		<div class="col-1 d-flex justify-content-center pt-2">
								      			<i class="fas fa-file-excel link-primary"></i>
								      		</div>
								      		<div class="col-10">
								      			<p class="m-0">
								      				YOUR CLIENT DATA.xlsx<br>
								      				<small>Download XLSX &bull; 105 KB</small>
								      			</p>
								      		</div>
								      		<div class="col-1 d-flex align-items-center justify-content-center">
								      			<a href="/assets/xlsx/YOUR CLIENT DATA.xlsx" target="_blank">
								      				<i class="fas fa-download"></i>
								      			</a>
								      		</div>
								      	</div>

								      	` + this.embededYoutubeElement( "https://www.youtube.com/embed/y9b5eUNsIAg", "55vw", "31vw" )  + `
								      </div>
								    </div>
								  </div>

								  <div class="accordion-item">
								    <h2 class="accordion-header" id="flush-headingOne">
								      <button class="accordion-button collapsed" type="button"
								        data-mdb-toggle="collapse" data-mdb-target="#flush-collapseTwoSub"
								        aria-expanded="false" aria-controls="flush-collapseTwoSub">
								        Option 2: Try it with a few clients first
								      </button>
								    </h2>
								    <div id="flush-collapseTwoSub" class="accordion-collapse collapse"
								      aria-labelledby="flush-headingOne" data-mdb-parent="#crmOnboardingPrepDataAccordion">
								      <div class="accordion-body">
								        <p>
								        	If you want to try the app with a few clients first, you can manually add 1 or 2 clients first. 
								        </p>

								        ` + this.embededYoutubeElement( "https://www.youtube.com/embed/4nbAjNQKg_k", "55vw", "31vw" ) + `
								      </div>
								    </div>
								  </div>
								</div>`, 
							3, this.subStep == 3 ? true : false
						) + this.accordianItem( 
							"4) Working in the app", 
							this.embededYoutubeElement( "https://www.youtube.com/embed/z0bu68tcWMc", "55vw", "31vw" ), 
							4, this.subStep == 4 ? true : false
						) + `</div>`
				}, {
					label: "What&apos;s Next?",
					title: "What&apos;s Next?",
					content: `<p>
					      	Your app is ready to go. To explore more visit the 
					      	links below.
					    </p>

					    <p>
					      	<a href="https://www.mydatagrowsblog.com/post/related-tabs-explained" 
					      		target="_blank">Related Tabs Explained</a><br>
							<a href="https://www.mydatagrowsblog.com/post/how-to-change-user-roles" 
								target="_blank">How To: Change User Roles</a><br>
							<a href="https://www.mydatagrowsblog.com/post/filters-explained" 
								target="_blank">Filters Explained</a><br>
							<a href="https://www.mydatagrowsblog.com/post/sars-tasks-table-explained" 
								target="_blank">SARS Tasks Explained</a><br>
							<a href="https://www.mydatagrowsblog.com/post/outstanding-tasks-unique-cases" 
								target="_blank">Outstanding Tasks &amp; Unique Cases</a>
						</p>

				      	<p>
				      		For any questions or suggestions, <br>
				      		email 
				      		<a href="mailto:support@mydatagrows.com">
				      			support@mydatagrows.com
				      		</a> or <br>
				      		send a WhatsApp to 
				      		<a href="tel:063-426-0080">063 426 0080</a>.
				      	</p>

				      	<p>Enjoy your journey with DataGrows!</p>`
				}
			];

		for ( var i = 0; i < steps.length; i++ ) {
			let active = false 
			
			if (i + 1 ==  this.activeStep ) {
				active = true;
			}

			let $step = this.stepElement( i + 1, steps[i].label, steps[i].title, steps[i].content, active )

			$stepper.append( $step )
		}

		this.$modal.find( ".modal-body" ).append( $stepper );

		$stepper.on('onChangeStep.mdb.stepper', (e) => {
			setTimeout( () => {
				let $content = $stepper.find( ".stepper-step.stepper-active .stepper-content" ),
					title = $content.find( ".modal-title" ).html();

			  $( "#crmOnboarding .modal-header .modal-title" ).html( title );
			}, 100 );
		});

		new Stepper( $stepper[0], {
			stepperMobileBreakpoint: 600,
			stepperMobileBarBreakpoint: 600
		} );

		this.ready();
	}
}