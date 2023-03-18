// Swap two nodes
function swap ( nodeA, nodeB ) {
  const parentA = nodeA.parentNode,
    siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
  // Move `nodeA` to before the `nodeB`
  nodeB.parentNode.insertBefore(nodeA, nodeB);
  // Move `nodeB` to before the sibling of `nodeA`
  parentA.insertBefore(nodeB, siblingA);
}
// Check if `nodeA` is above `nodeB`
function isAbove ( nodeA, nodeB ) {
  // Get the bounding rectangle of nodes
  const rectA = nodeA.getBoundingClientRect(),
    rectB = nodeB.getBoundingClientRect();

  return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
}

export default function draggableTable () {
  const table = $( 'table.draggable-row' )[0];

  let draggingEle,
    draggingRowIndex,
    placeholder,
    list,
    isDraggingStarted = false,
    // The current position of mouse relative to the dragging element
    x = 0, y = 0;
  
  const 
    cloneTable = function () {
      const rect = table.getBoundingClientRect(),
        width = parseInt(window.getComputedStyle(table).width);

      list = document.createElement('div');
      list.classList.add('clone-list1');
      list.style.left = `0px`;
      list.style.top = `0px`;
      table.parentNode.insertBefore(list, table);
      // Hide the original table
      table.style.visibility = 'hidden';

      table.querySelectorAll('tr').forEach(function (row) {
          // Create a new table from given row
          const item = document.createElement('div');
          item.classList.add('draggable');

          const newTable = document.createElement('table');
          newTable.setAttribute('class', 'clone-table');
          newTable.style.width = `${width}px`;

          const newRow = document.createElement('tr');
          const cells = [].slice.call(row.children);
          cells.forEach(function (cell) {
              const newCell = cell.cloneNode(true);
              newCell.style.width = `${parseInt(window.getComputedStyle(cell).width)}px`;
              newRow.appendChild(newCell);
          });

          newTable.appendChild(newRow);
          item.appendChild(newTable);
          list.appendChild(item);
      });
      
      table.style.position = 'absolute';
      table.style.left = '-100%';
    },
    mouseDownHandler = function ( e ) {
      $( this ).closest( "table" ).find( ".moved" ).removeClass( "moved" );
      // Get the original row
      if (
        $( this ).hasClass( ".sort-options" ) || 
        $( this ).closest( "td" ).hasClass( ".sort-options" ) 
      ) {
        return;
      }

      const originalRow = e.target.parentNode;
      draggingRowIndex = [].slice.call(table.querySelectorAll('tr')).indexOf(originalRow);
      // Determine the mouse position
      x = e.clientX;
      y = e.clientY;
      // Attach the listeners to `document`
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    },
    mouseMoveHandler = function (e) {
      if (!isDraggingStarted) {
          isDraggingStarted = true;

          cloneTable();

          draggingEle = [].slice.call(list.children)[draggingRowIndex];
          draggingEle.classList.add('dragging');

          // Let the placeholder take the height of dragging element
          // So the next element won't move up
          placeholder = document.createElement('div');
          placeholder.classList.add('placeholder');
          draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
          placeholder.style.height = `${draggingEle.offsetHeight}px`;
      }
      // Set position for dragging element
      draggingEle.style.position = 'absolute';
      draggingEle.style.top = `${draggingEle.offsetTop + e.clientY - y}px`;
      draggingEle.style.left = `${draggingEle.offsetLeft + e.clientX - x}px`;
      // Reassign the position of mouse
      x = e.clientX;
      y = e.clientY;
      // The current order
      // prevEle
      // draggingEle
      // placeholder
      // nextEle
      const prevEle = draggingEle.previousElementSibling,
        nextEle = placeholder.nextElementSibling;
      // The dragging element is above the previous element
      // User moves the dragging element to the top
      // We don't allow to drop above the header
      // (which doesn't have `previousElementSibling`)
      if (prevEle && prevEle.previousElementSibling && isAbove(draggingEle, prevEle)) {
          // The current order    -> The new order
          // prevEle              -> placeholder
          // draggingEle          -> draggingEle
          // placeholder          -> prevEle
          swap(placeholder, draggingEle);
          swap(placeholder, prevEle);
          return;
      }
      // The dragging element is below the next element
      // User moves the dragging element to the bottom
      if (nextEle && isAbove(nextEle, draggingEle)) {
          // The current order    -> The new order
          // draggingEle          -> nextEle
          // placeholder          -> placeholder
          // nextEle              -> draggingEle
          swap(nextEle, placeholder);
          swap(nextEle, draggingEle);
      }
    },
    mouseUpHandler = function () {
      // Remove the placeholder
      placeholder && placeholder.parentNode.removeChild(placeholder);

      draggingEle.classList.remove('dragging');
      draggingEle.style.removeProperty('top');
      draggingEle.style.removeProperty('left');
      draggingEle.style.removeProperty('position');
      // Get the end index
      const endRowIndex = [].slice.call(list.children).indexOf(draggingEle);

      isDraggingStarted = false;
      // Remove the `list` element
      list.parentNode.removeChild(list);
      // Move the dragged row to `endRowIndex`
      let rows = [].slice.call(table.querySelectorAll('tr'));
      
      draggingRowIndex > endRowIndex
          ? rows[endRowIndex].parentNode.insertBefore(rows[draggingRowIndex], rows[endRowIndex])
          : rows[endRowIndex].parentNode.insertBefore(
                rows[draggingRowIndex],
                rows[endRowIndex].nextSibling
            );
      // Bring back the table
      table.style.removeProperty('visibility');
      table.style.removeProperty('position');
      table.style.removeProperty('left');
      table.querySelector( `tbody tr:nth-child(${endRowIndex})` )
        .classList.add('moved');
      // Remove the handlers of `mousemove` and `mouseup`
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

  $( table ).find( 'tbody tr td.draggable').on('mousedown', mouseDownHandler);
}