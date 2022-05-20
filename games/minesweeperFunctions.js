class Minesweeper {

  static description = `
  Minesweeper is a classic computer game where a number of mines are hidden on a grid. The player can reveal spaces of the board or mark them with flags. To solve a minesweeper board, the player must find the location of each mine. This can be done be revealing each space that is not a mine, or placing a flag on each space that has a mine.  If a player attempts to reveal a space with a mine, they lose. Each revealed space has a number that shows exactly how many mines are adjacent to that space.

  A counter shows how many mines are present on the board. Each flag placed lowers the mine count by one, regardless of whether a mine was on the space flagged. This means with a sufficient number of flags, the counter will display a negative number. `;

  static options ={
    size: {
      type: 'number',
      range: 'static',
      min: 4,
      max: 16,
    },
    mines: {
      type: 'number',
      range: 'relative', //figure this part out later
      min: 1,
      max: 64

    }   
  }

  flags = 0;

  constructor(boardID = null){

    if (!boardID) boardID = generateMinesweeperID(8, 10);

    // Get some simple values
    this.size = parseInt(boardID.substr(0, 1), 16)+1;
    this.startCell = boardID.substr(1, 2);


    // the following logic should get shipped off somewhere at some point
    let minecount = document.createElement('div');
    minecount.setAttribute('id', 'minecount');
    let gameBoard = document.createElement('div');
    gameBoard.setAttribute('id', 'board')
    gameBoard.innerHTML = this.makeHTMLTable();
    document.getElementById('game').appendChild(minecount);
    document.getElementById('game').appendChild(gameBoard);
    document.getElementById('game').classList.add('minesweeper');


    // define 2d array of cells
    let boardLines = [];
    this.cells = [];
    this.mines = 0;
    for (let i = 0;  i < this.size; i++){
      boardLines.push(
        parseInt(
          boardID.substring(
            i*Math.ceil(this.size/4)+3, 
            (i+1)*Math.ceil(this.size/4)+3
          ),
          16
        ).toString(2).padStart(this.size ,"0")
      ); 
    }
  
    for (let row = 0; row < this.size; row++){
      this.cells[row] = [];
      for (let col = 0; col < this.size; col++){
        let mine = parseInt(boardLines[row].substring(col, col+1));
        this.cells[row].push(new Cell(row.toString(16)+col.toString(16), !!mine, this));
        this.mines += mine;
        
      }
    }
    
    // assign adjacencies
    [].concat(...this.cells).forEach(cell=>{
      cell.setAdjacents(); 
    });

    this.updateMineCount();
  }


  idToCell(id){
    return this.cells[parseInt(id.substr(0,1), 16)][parseInt(id.substr(1,1), 16)];
  }

  makeHTMLTable(){
    let boardHTML = '<table>';
    for (let row = 0;  row < this.size; row++){
      boardHTML = boardHTML+'<tr>';
      for (let col = 0;  col < this.size; col++){
        boardHTML = boardHTML+`<td id="${row.toString(16)+col.toString(16)}" class="unchecked"></td>`;
      }
      boardHTML = boardHTML+'</tr>';
    }
    boardHTML = boardHTML+'</table>';
    return boardHTML;
  }

  startGame(endGameCallback){
    this.endGameCallback = endGameCallback;
    this.runGame();
  }

  runGame(){
    this.idToCell(this.startCell).expose();
    this.updateMineCount();
  }

  checkForVictory(){
    let allCells = [].concat(...this.cells);
    if (
      allCells.every(cell=> cell.flagged === cell.mine) || 
      allCells.every(cell=> cell.checked !== cell.mine)
    ) {
      this.endGame(true);
    }
  }

  endGame(win){
    this.endGameCallback(win);
  }

  changeFlagCount(flagAdded){
    !!flagAdded ? this.flags++ : this.flags--;
    this.updateMineCount();
  }

  updateMineCount(){
    document.getElementById("minecount").innerText = 'Mines: ' + (this.mines-this.flags).toString();
  }
  
}



class Cell{
  adjacents = 0;
  flagged = false;
  checked = false;
 constructor(id, mine, board){
    this.id = id;
   this.mine = mine;
    this.board = board;
    this.element = document.getElementById(id);
    this.element.addEventListener("mouseup", this.check.bind(this));
 }
  setAdjacents(){
    if (this.mine) {
      this.adjacents = 9;
    } else {
      this.getNeighbours().forEach(neighbour=>{
        if (neighbour.mine) this.adjacents++;
      });
    }
  }
  getNeighbours(){
    let adjacent = [];
    
    // x and y coordinates of inputted id within the grid
    let y = parseInt(this.id.substr(0,1), 16);
    let x = parseInt(this.id.substr(1,1), 16);
    
    for (let row = Math.max(y-1, 0); row < Math.min(y+2, this.board.size); row++){
      for (let col = Math.max(x-1, 0); col < Math.min(x+2, this.board.size); col++){ // min and max are used here to prevent off-board IDs from being used
        adjacent.push(this.board.cells[row][col]);
      }
    }
    return adjacent;
  }
  check(e){
    if (!this.checked) {
      if (e.button == 2){ // right click flags
        this.flag();
      } else if (e.button == 0 && !this.flagged) { // left click exposes
        this.expose();
      }
      this.board.checkForVictory();
    }
  }
  flag(){
    this.flagged = !this.flagged;
    this.element.classList.toggle("flagged");
    this.element.innerText = (this.flagged ? '!' : '' );
    this.board.changeFlagCount(this.flagged);
  }
  expose(){
    this.checked = true;
    if (this.flagged) this.flag();
    this.element.classList.remove("unchecked");
    this.element.classList.add("checked");
    this.element.removeEventListener("mouseup", this.check.bind(this));
    if (this.mine){
      this.element.classList.add("mine");
      this.element.innerText = '*';
      this.board.endGame(false);
    } else if (this.adjacents > 0) {
      this.element.classList.add("adjacent".concat(this.adjacents.toString()));
      this.element.innerText = this.adjacents.toString();
    } else {
      this.getNeighbours().forEach(neighbour=>{
        if (!neighbour.checked) neighbour.expose();
      });
    }
    
  }
}


function makeMinesweeperGame(settings){
  let {size = 4, mines = 1} = settings;

  return new Minesweeper(generateMinesweeperID(size, mines));


  }

// this function represents, in the end, a straight algorithm. It is currently crudely implemented, but this is a good candidate for experimenting with algorithms in the future.
function generateMinesweeperID(size, mines){
		
		
  /*
  Quick explanation of Board IDs
  The first character of a board id represents the size of the board in hex. 
  A board's size is one greater than this digit. A size 16 board has id that starts with f.
  The next two digits of the ID represent where the first automatically clicked cell is
  The remaining digits represent where the mines are
  */
  
  
  // declarations 
  let prefixes = []; // this holds 
  let dummyBoard = []; // for generating a board
  
  do {
    
    //board generation code
    
    dummyBoard = [];
    
    // defining an initial 2 dimensional array the right size
    for (let i = 0; i < size; i++){
      let row = [];
      for (let t = 0; t < size; t++){
        row.push(0);
      }
      dummyBoard.push(row);
    }
    
    // placing mines
    for (let i = 0; i < mines; i=i){
      // A random location on the board is rolled, and if a mine isn't already there then one is placed
      let row = Math.floor(Math.random()*size); 
      let col = Math.floor(Math.random()*size); 
      if (dummyBoard[row][col] == 0){
        dummyBoard[row][col] = 1;				
        i++;
      }
    }
    
    
    // determine adjacencies 
    for (let row = 0; row < size; row++){
      for (let col = 0; col < size; col++){
        
        let adjacentMine = false;
        // Check if any neighbours have a mine
        for (let i = Math.max(row-1, 0); i < Math.min(row+2, size) && !adjacentMine; i++){
          for (let j = Math.max(col-1, 0); j < Math.min(col+2, size) && !adjacentMine; j++){
            if (dummyBoard[i][j] == 1){
              adjacentMine = true;
            }
          }
        }
        // if no neighbours have mines, add the hex coords to the prefixes array
        if (!adjacentMine){
          prefixes.push(row.toString(16) + col.toString(16));
        }

        
      }
    }
    
  } while (prefixes.length < 1); // if the prefixes array is empty, generate new board
  
  
  
  // convert mine array to very special code
  
  
  let boardID = (size - 1).toString(16) + prefixes[Math.floor(Math.random()*prefixes.length)];
  
  
  for (let i = 0; i < size; i++){
    let row = "";
    for (let t = 0; t < size; t++){
      row += dummyBoard[i][t].toString();
    }
    boardID += parseInt(row, 2).toString(16).padStart( Math.ceil(size/4),'0');
    //boardID += parseInt(row, 2).toString(16);
  }
  
  
  // return code
  
  return boardID;
  
}