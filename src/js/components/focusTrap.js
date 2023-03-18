let $container;

function lockTabing ( e ) {
  if ( e.type == "focus" &&  ! $container ) {
      return;
  } else if ( e.type !== "focus" ) {
    if ( e.key !== 'Tab' || e.keyCode !== 9 || ! $container) {
        return;
    // if shift key pressed for shift + tab combination
    }
  }
  
  const content = $container.find( 'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])' );

  if ( e.shiftKey && content.first().is( ':focus' ) ) {
    content.last().focus();
    e.preventDefault();
  } else if ( 
    ( ! e.shiftKey && content.last().is( ':focus' ) ) || 
    ! $.contains( $container[0], e.target ) 
  ) {
    content.first().focus();
    e.preventDefault();
  }
}

function free ( e ) {
    $container = false;
    $( "body" ).off( 'keydown', lockTabing );
}

export default function init () {
  $.fn.trap = function () {
    $container = this;

    $( window )
      .off( 'keydown', lockTabing )
      .on( 'keydown', lockTabing )

    const content = $container.find( 'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])' );
    
    content.first().focus();
  };

  $.fn.free = free;

  $( document )
    .off( "cancel.mdb.popconfirm", free )
    .off( "confirm.mdb.popconfirm", free )
    .on( "cancel.mdb.popconfirm", free )
    .on( "confirm.mdb.popconfirm", free );
}

init();