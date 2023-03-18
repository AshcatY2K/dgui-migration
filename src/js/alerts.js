import Toast from './components/mdb/pro/toast';

function toastAlert ( title, content, color, css = '' ) {
	try {
		content = JSON.parse( content );
	} catch ( e ) { }

	if ( typeof content === 'object' && "errors" in content ) {
		content = content.errors
	}

	if ( Array.isArray( content ) ) {
		content.forEach( ( error, index ) => toastError( title, error ) );

		return;
	}

	if ( typeof content === 'object' ) {
		for ( const [ key, value ] of Object.entries( content ) ) {
			if ( key === "msg" ) {
				toastError( title, value );
				break;
			}
		}

		return;
	}

	const time = Date.now(),
		$toast = $( '<div>', { 
				class: "toast fade", 
				id: `${time}-toast`, 
				role: "alert"
			} )
			.html( `<div class="toast-header">
					<strong class="me-auto">${title}</strong>
					<small></small>
					<button type="button" class="btn-close"
						data-mdb-dismiss="toast" aria-label="Close"></button>
				</div>
				<div class="toast-body">${content}</div>` );

	$toast.attr( "style", css );

	$( ".alert-wrapper" ).append( $toast );

	let delay = ( color === "danger" ) ? 7000 : 3500;
	
	const toastInstance = new Toast( $( `#${time}-toast` )[0], {
		stacking: true,
		hidden: true,
		width: '450px',
		position: 'top-left',
		autohide: true,
		delay: delay,
  	color: color
	});

	toastInstance.show();

	delay = 500000

	setTimeout( () => $( `#${time}-toast` ).remove(), delay );
}

export function toastSuccess ( title, content, css ='' ) {
	toastAlert( title, content, "success", css );
}

export function toastError ( title, content ) {
	toastAlert( title, content, "danger" );
}

export function screenReaderAlert ( msg, delay = 1000 ) {
	$( "#pseudo-alert" ).html( "" );

	setTimeout( () => {
		if ( msg ) {
			$( "#pseudo-alert" ).html( msg );
		}
	}, delay );
}