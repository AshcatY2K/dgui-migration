import * as util from '/src/js/util.js';
import Modal from '/src/js/classes/modal.js';
import * as chatController from '/src/js/controllers/chat.js';
import { whoAmI } from "/src/js/auth.js"

import { toastSuccess, toastError, screenReaderAlert } from '/src/js/alerts.js';

import Autocomplete from '.././components/mdb/pro/autocomplete';

let modals = {};

export default class chat extends Modal {
	constructor ( database, table, id ) {
		super( "chatModal", "Chat", "right" );// shadow-1-strong

		this.database = database;
		this.table = table;
		this.id = id;
		this.lastPaint = false;
		this.timeZoneOffset = 2 * 60 * 60 * 1000;
		
		chatController.message.get( 
				this.database, 
				this.table, 
				this.id, 
				this.lastPaint 
			);

		chatController.person.get( this.database );

		this.paint();
		this.refreshId = setInterval( () => this.paint(), 10000 );

    if ( "chat" in modals ) {
      modals.chat.close().destroy();
    }

    modals.chat = this;

		return this;
	}

	destroy () {
		clearInterval( this.refreshId );

		super.destroy();
	}

	async paint ( ) {
		let messages = await chatController.message.get( 
				this.database, 
				this.table, 
				this.id, 
				this.lastPaint 
			);

		if ( ! this.lastPaint ) {
			this.$modal.find( ".modal-body" ).html( `<div class="chat-messages">
			    	<p class="no-messages">There are no messages.</p>
		    </div>
		    <span class="loader" style="position: relative; border-width: 1.5rem; margin: 2rem 0; display: none;"></span>` );

			this.$modal.find( ".modal-body" ).css( { "max-height": "274px" } );

			let iam = await whoAmI();

			if ( iam.data?.user?.userId ) {
				this.userId = iam.data.user.userId;
			} else {
				this.userId = iam.data.userId;
			}

			this.$modal.find( ".modal-footer" ).html( `<div id="chat-message-container" class="input-group">
	  				<input type="text" id="chat-message" class="form-control" 
	  					placeholder="message" aria-label="message" 
	  					aria-describedby="button-addon2" style="height: 2.4rem;"/>
						<button type="submit" class="btn btn-info chat-send-message" 
		  					aria-label="send message">
							<i class="far fa-paper-plane"></i>
						</button>
				</div>` );
		}

		if ( messages.length > 0 ) {
			let $messages = this.$modal.find( ".modal-body .chat-messages" );

			this.$modal.find( ".modal-body .no-messages" ).remove();

			messages.forEach( message => {
				if ( this.$modal.find( `.chat-message[data-id="${message.ID}"]` ).length > 0 ) {
					return;
				}

				let format = { date: "yyyy/mm/dd", clock: "hh:mm a" },
					dateTime = util.time().display().dateTime( message.dateTime, format),
					currentDate = dateTime.split( "," )[0],
					currentTime = dateTime.split( "," )[1],
					messageClass = "";

				if ( this.date !== currentDate ) {
					this.date = currentDate;

					$messages.append( `<div class="date-seperator">
							<hr>
							<span class="date">${this.date}</span>
						</div>` )
				}

				if ( this.userId == message.userId ) {
					messageClass = "me"
				}

				messageClass += " slide-in";

				$messages.append( `<div class="chat-message ${messageClass}" 
						data-id="${message.ID}">
						<p class="header m-0">
							<span class="sender"><b>${message.Person}:</b></span>
							<span class="time">${currentTime}</span>
						</p>

						<p class="message py-2 px-3">
							${message.Message}
						</p>
					</div>` )
			} );
		}

		if ( ! this.lastPaint ) {
			this.ready();
		}
	}

	submit ( e ) {
		e.preventDefault();
		e.stopImmediatePropagation();
		
		let message = this.$modal.find( "#chat-message" ).val(),
			$sendBtn = $( ".chat-send-message" ),
			body = this.$modal.find(".modal-body")[0],
			mentions = [];

		this.$modal.find( ".loader" ).show();
		body.scrollTo( 0, body.scrollHeight );

		$sendBtn.prop( "disabled", true );

		this.persons.forEach( ( person, index ) => {
			let name = person.Name.trim();

			if ( ! name ) {
				return;
			}

			let regex = new RegExp(`@${name}`, 'gi');

			if ( message.match( regex ) ) {
				mentions.push( person.id );
			}
		} );
		
		chatController.message.add( this.database, this.table, this.id, {
				message: message,
				mentions: mentions
			} )
			.then( async res => {
				await this.paint();
		
				this.$modal.find( ".loader" ).hide();

				$sendBtn.prop( "disabled", false );

				body.scrollTo( 0, body.scrollHeight );
			} );

		this.$modal.find( "#chat-message" ).val( "" );

		super.submit( e );
	}

	async ready () {
		this.lastPaint = true;

		this.persons = await chatController.person.get( this.database );

		let persons = this.persons.map( person => person.Name ),
			dataFilter = value => {
				let match = value.match( /(@[^ ]*)$/g );

				if ( match ) {
					match = match[0].replace( /^@/g, "" );

					return persons.filter( item => {
						return item.toLowerCase().startsWith( match.toLowerCase() );
					});
				}

				return [];
			},
			$container = this.$modal.find( '#chat-message-container' );

		persons = this.persons.map( person => person.Name );

		new Autocomplete( $container[0], { filter: dataFilter, noResults: "" } );

		let submit = this.submit.bind( this ),
			destroy = this.destroy.bind( this ),
			body = this.$modal.find(".modal-body")[0];

		body.scrollTo( 0, body.scrollHeight );

		this.$modal
			.off( "click", "button[type='submit']", submit )
			.off( "hidden.mdb.modal", destroy )

			.on( "click", "button[type='submit']", submit )
			.on( "hidden.mdb.modal", destroy );
	}
}

$( document )
	.on( "show.mdb.modal", "#chatModal", ( e ) => {
		$( "#chatModal" ).css( {
			display: "inline-block",
			right: "10px",
			position: "absolute",
			bottom: "10px",
			width: "400px",
			height: "400px",
			left: "auto",
			"z-index": "9999",
			top: "auto"
		} );

		$( "#chatModal .modal-dialog" ).css( { right: 0, bottom: 0 } );
	} )
	.on( "shown.mdb.modal", "#chatModal", ( e ) => {
		$( ".modal-backdrop, .modal.fill-screen" ).hide();
	} )
	.on( "itemSelect.mdb.autocomplete", "#chat-message-container", e => {
		let txt = $("#chat-message").val();

		setTimeout( () => {
			txt = txt.replace( /(@[^ ]*)$/g, "@" + e.value );

			$("#chat-message").val( txt );
		}, 10 );
	} )
	.on( "update.mdb.autocomplete", "#chat-message-container", e => {
		let $dropdown = $( ".autocomplete-dropdown-container" );
		
		if ( e.results.length > 0 ) {
			$dropdown.show();
		} else {
			$dropdown.hide();
		}
	} );