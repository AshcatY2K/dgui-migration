import * as timer from '/src/js/controllers/timer.js';
import * as table from '/src/js/controllers/table.js';

import * as util from '/src/js/util.js';

import Tooltip from '.././components/mdb/free/tooltip';

import Dialog from '/src/js/components/dialog.js';

class Timer extends HTMLElement {
	constructor() {
    super();

		this.html = `<span class="user-timer">
	      <span class="timer-time" style="font-size: 1.5rem;">
	        ––:––:––
	      </span>
	      <button class="btn btn-info btn-sm" disabled aria-label="start timer">
	        <i class="fas fa-play"></i>
	      </button>
	      <span class="timer-tooltip"></span>
	    </span>`;
	}

	get record () { return Timer._record; }
	get timer () { return Timer.timers[ this.app.database ]; }
	get timerObj () {
		return new Promise( ( resolve, reject ) => {
			if ( ! $.isEmptyObject( this.timer ) ) {
				resolve( this.timer )
			} else {
				timer.get( this.app.database ).then( timerObj => {
					this.timer = timerObj;

					resolve( this.timer );
				} );
			}
		} );
	}

	set timer ( timerObj ) {
		Timer.timers[ this.app.database ] = timerObj;
	}

	set record ( record ) {
		Timer._record = record;

		$( this ).find( "button" ).removeAttr( "disabled" );
	}

	async start () {
		if ( Timer.startTime ) {
			return;
		}

		delete Timer.timers[ this.app.database ];

		await timer.start( this.app.database, this.app.table, this.record );

		let timerObj = await this.timerObj;

		if ( $.isEmptyObject( timerObj ) ) {
			return;
		}

		Timer.startTime = this.isoToMilliseconds( timerObj.Start );

		$( "dg-timer" )[0].setReminder();

		$( "dg-timer" ).each( ( index, el ) => {
			if ( ! $.isEmptyObject( timerObj ) ) {
				el.startTime = el.isoToMilliseconds( timerObj.Start );
				el.description = timerObj.Description ? timerObj.Description : "";
				Timer.systemTimeDelta = Date.now() - el.isoToMilliseconds( timerObj.SystemTime );

				el.setTooltip();
			}

			el.run();
			el.toggleTimerBtn();
		} );
	}

	async stop () {
		timer.stop( this.app.database );

		Timer._record = false;

		delete Timer.timers[ this.app.database ];
		delete Timer.systemTimeDelta;
		delete this.app._timer;

		let tableConfig = await this.app.tableConfig;

		$( "dg-timer" ).each( async function ( index, el ) {
			clearInterval( window.reminderId );

			Timer.startTime = false;
			
			el.toggleTimerBtn();

     	$( el ).removeAttr( "record" );
			$( el ).find( "button" ).prop( "disabled", true );

			if ( tableConfig.TimeLog ) {
				$( el ).find( ".timer-time" ).html( "––:––:––" );
	    } else {
	    	$( el ).remove();
	    }
		} );
	}

	async click ( e ) {
		e.preventDefault();

		let timerObj = await this.timerObj;

		if ( $.isEmptyObject( this.timer ) ) {
			this.start();
		} else {
			this.stop();
		}
	}

	async run () {
		let timerObj = await this.timerObj;

		Timer.startTime = this.isoToMilliseconds( timerObj.Start );

		return this;
	}

	isoToMilliseconds ( time ) {
		time = time.replace("T", " ").replace(/\..*/, "");

		return ( new Date( time ) ).getTime();
	}

	toggleTimerBtn () {
		let $btn = $( this ).find( "button" );

		if ( ! Timer.startTime ) {
			$btn
				.addClass( "btn-info" )
				.removeClass( "btn-warning" )
				.find( "i" )
				.addClass( "fa-play" )
				.removeClass( "fa-stop" )
				.attr( "aria-label", "start timer" );
		} else {
			$btn
				.removeClass( "btn-info" )
				.addClass( "btn-warning" )
				.find( "i" )
				.removeClass( "fa-play" )
				.addClass( "fa-stop" )
				.attr( "aria-label", "stop timer" );
		}

		return this;
	}

	async init () {
		let timerObj = await this.timerObj;

		if ( $.isEmptyObject( timerObj ) ) return;

		$( this ).find( "button" ).removeAttr( "disabled" );

		Timer.startTime = this.isoToMilliseconds( timerObj.Start );
		this.description = timerObj.Description;

		if ( ! Timer.systemTimeDelta ) {
			Timer.systemTimeDelta = Date.now() - this.isoToMilliseconds( timerObj.SystemTime );
		}

		await this.run();
		
		this.setReminder().toggleTimerBtn().setTooltip();

		let delta = Date.now() - Timer.startTime - Timer.systemTimeDelta,
			txt = util.display.timer( delta, "hh:mm:ss" );

		$( this ).find( ".timer-time" ).html( txt );
	}

	static get observedAttributes () {
	   return [ "record" ];
	}

  attributeChangedCallback ( attribute, oldValue, newValue ) {
    this[ attribute ] = newValue;
  }

	async setTooltip () {
		let $tooltip = $( this ).find( ".timer-tooltip" ),
			timerObj = await this.timerObj;

		$tooltip
			.attr( "data-toggle", "tooltip" )
			.attr( "title", timerObj.Description );

    new Tooltip( $tooltip[0], { 
    		title: timerObj.Description,
				boundary: 'window',
				placement: 'right',
				popperConfig: {
					boundary: 'window',
					placement: 'right',
					modifiers: [ {
				      name: 'offset',
				      options: { offset: [1, 1] },
				    } ],
				}
    	} );

    return this;
	}

	setReminder () {
		if ( window.reminderId ) {
			clearInterval( window.reminderId );
		}

		window.reminderId = setInterval ( () => {
		    const dialog = new Dialog();

		    dialog.alert( `Your timer is still running for your current task`, {} );
			}, 60 * 60 * 1000 );

		return this;
	}
    
	connectedCallback () {
		$( this ).html( this.html );

		if ( this.record ) {
			this.record = this.record;
		}

	  $( this ).find( "button" ).on( "click", this.click.bind( this ) );

		if ( $( this ).closest( "dg-app" ).length > 0 ) {
			this.app = $( this ).closest( "dg-app" )[0];
		} else if ( $( this ).closest( "dg-panel" ).length > 0 ) {
			this.app = $( this ).closest( "dg-panel" )[0].app;
		}

		if ( ! Timer.tickerId ) {
			Timer.tickerId = setInterval( () => {
				if ( Timer.startTime ) {
					let delta = Date.now() - Timer.startTime - Timer.systemTimeDelta,
						txt = util.display.timer( delta, "hh:mm:ss" );

					$( "dg-timer .timer-time" ).html( txt );
				}
			}, 1000 );
		}

		this.init();
	}

	disconnectedCallback () {
		clearInterval( window.reminderId );
	}
}

Timer.timers = {};

window.customElements.define('dg-timer', Timer);