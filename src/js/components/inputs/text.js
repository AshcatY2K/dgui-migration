import DGInput from './input.js';

export default class DGText extends DGInput {
  constructor() {
    super();

    this.html = `<div class="form-outline">
        <input type="text" class="form-control" data-mdb-showcounter="true"
          maxlength="250"/>
        <label class="form-label"></label>
        <div class="invalid-feedback"></div>
        <div class="form-helper"></div>
      </div>
      <div class="form-text"></div>`;

    // this.groupHtml = `<label class="form-label"></label>
    //   <div class="input-group">
    //     <input type="text" class="form-control" id="input-input-mask">
    //     <span class="input-group-text"></span>
    //     <div class="invalid-feedback"></div>
    //     <div class="form-helper"></div>
    //   </div>
    //   <div class="form-text"></div>`;
  }

  static htmlEncode ( str ) {
    return String(str).replace(/[^\w. ]/gi, function(c){
      return '&#'+c.charCodeAt(0)+';';
    });
  }

  get format () { return $( this ).attr( "format" ); }
  get value () { return $( this ).find( "select, input" ).val(); }

  set value ( value ) {
    $( this ).find( "input, select, textarea" ).val( value );
    
    this?.inputInstance?.update();

    $( this ).find( "input, select, textarea" ).trigger( "change" );
  }

  set format ( mask ) {
    let $input = $( this ).find( "input" ),
      pattern = mask
        .replace( /([^\\])\?/g, "$1\\w?" )
        .replace( /([^\\w])\?/g, "$1\\w?" )
        .replace( /([^\\])0/g, "$1\\d" )
        .replace( /([^\\])0/g, "$1\\d" )
        .replace( /([^\\])9/g, "$1\\d?" )
        .replace( /([^\\])9/g, "$1\\d?" )
        .replace( /([^\\])#/g, "$1[\\d\\+\\- ]" )
        .replace( /([^\\])#/g, "$1[\\d\\+\\- ]" )
        .replace( /([^\\])L/g, "$1\\w" )
        .replace( /([^\\])L/g, "$1\\w" )
        .replace( /([^\\])A/g, "$1[\\w\\d]" )
        .replace( /([^\\])A/g, "$1[\\w\\d]" )
        .replace( /([^\\])a/g, "$1[\\w\\d]?" )
        .replace( /([^\\])a/g, "$1[\\w\\d]?" )

        .replace( /^0/g, "\\d" )
        .replace( /^9/g, "\\d?" )
        .replace( /^#/g, "[\\d\\+\\- ]" )
        .replace( /^L/g, "\\w" )
        .replace( /^A/g, "[\\w\\d]" )
        .replace( /^a/g, "[\\w\\d]?" )

        .replace( /\\\?/g, "\\?" )
        .replace( /\\0/g, "0" )
        .replace( /\\9/g, "9" )
        .replace( /\\#/g, "#" )
        .replace( /\\L/g, "L" )
        .replace( /\\A/g, "A" )
        .replace( /\\a/g, "a" );

    $input.attr( "pattern", pattern);
    $( this ).find( ".form-text" ).html( `Pattern: ${mask}
      <a href="https://www.mydatagrowsblog.com/post/input-mask-explained" 
        target="_blank" aria-label='more information'>
        <i class="far fa-question-circle"></i>
      </a>` );

    $( this ).find( ".invalid-feedback" )
      .html( `Please match the specified pattern` );
  }

  static getDisplayValue ( value ) {
    if ( value && typeof value == "boolean" ) {
      return "";
    }
    
    try {
      value = JSON.parse( value );

      if ( value.link ) {
        return DGInteger.getThroughLink( value.link, value.value );
      }

      if ( value?.value ) value = value.value;
    } catch ( e ) {}

    value = DGText.htmlEncode( value );
    
    return DGInput.getDisplayValue( value );
  }
}

window.customElements.define('dg-text', DGText);