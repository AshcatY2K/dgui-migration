import { columnToInput } from './inputGenerator.js';

export function jsonToForm ( form, columns, database, guid = false ) {
  let rowCount = Math.max.apply( Math, form.map( cell => cell.pos.y ) ),
    $form = $( "<div>", { class: "container-cq" } ),
    idColumn = columns.filter( column => column.columnName == "id" )[0],
    $idColumn = columnToInput( idColumn, database, guid );

  $form.append( $idColumn );

  for ( let i = 0; i <= rowCount; i++ ) {
    let $row = $( "<div>", { class: "row" } ),
      cells = form.filter( cell => cell.pos.y == i );

    cells.sort( ( a, b ) => ( parseInt( a.pos.x ) > parseInt( b.pos.x ) ) ? 1 : -1 );

    for ( const cell of cells ) {
      let mdW = Math.min( Math.ceil( cell.size.w * 2 ), 12 ),
        smW = Math.min( Math.ceil( mdW * 2 ), 12 ),
        $col = $( "<div>", { 
            class: `col-sm-${smW} col-md-${mdW} col-lg-${cell.size.w}` 
          } ).css( { position: "relative" } );

      switch ( cell.type ) {
        case "heading":
          $col.append( $( "<h2>", { class: 'mb-4 mt-3' } ).html( cell.content ) );
          break;
        case "seperator-ln":
          $col.append( $( "<hr>" ) );
          break;
        default:
          if ( "config" in cell ) {
            let column = columns.filter( column => column.id == cell.config["column-id"] ),
              $input;
              
            if ( column.length < 1 ) {
              continue;
            }

            column = column[0];

            if ( column.ReadOnly == 1 ) {  
              column.mandatory = false;
            }

            $input = columnToInput( column, database, guid );

            $col.attr( "data-id", column.id );

            if ( $input ) {
              $input.css( { position: "relative", bottom: 0 } );
              $col.append( $input.outerHTML() );
            }
          }

          break;
      }

      $row.append( $col );
    }
    
    $form.append( $row );
  }

  return $form;
}