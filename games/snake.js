import { Game } from './game.js';

export class Snake extends Game {

  view;
  gameInterval;
  keyInput;

  size = 10;

  food = { x: null, y: null};
  segments = [];
  direction = 0; 
  newDirection = 0;

  constructor(){
    super();
    this.view = this.buildView();
    this.keyInput = this.interpretKeypress.bind(this);
    window.addEventListener('keydown', this.keyInput);
  }

  runGame(){
    this.gameInterval = setInterval(this.gameTick.bind(this), 160);
    this.segments.unshift(new Segment(4,9,0,false, true));
    this.generateFood();
  }

  pause(){
    clearInterval(this.gameInterval);
  }

  resume(){
    this.gameInterval = setInterval(this.gameTick.bind(this), 100);
  }

  buildView(){
    let view = document.createElement('div');
    let tabletext ='<table>';
    for (let i = 0; i < this.size; i++) {
      tabletext+='<tr>';
      for (let j = 0; j < this.size; j++) {
        tabletext+=`<td id='${i.toString()+j.toString()}'></td>`;
      }
      tabletext+='</tr>';
    }
    tabletext+='</table>';
    view.innerHTML = tabletext;
    view.classList.add('snake');

    return view;
  }

  getView(){
    if (this.view) return this.view;
  }

  interpretKeypress(keyPressEvent){
    switch (keyPressEvent.key){
      case 'ArrowUp':
        this.setDirection(0);
        break;
      case 'ArrowRight':
        this.setDirection(1);
        break;
      case 'ArrowDown':
        this.setDirection(2);
        break;
      case 'ArrowLeft':
        this.setDirection(3);
        break;

    }
    
  }

  setDirection(direction){
    if (this.direction % 2 !== direction % 2){
      this.newDirection = direction;
    }
  }

  generateFood(){

    do { 
      this.food.x = Math.floor(Math.random()*this.size);
      this.food.y = Math.floor(Math.random()*this.size);
    } while (this.segments.find(segment=>segment.x === this.food.x && segment.y === this.food.y));

    document.getElementById(this.food.y.toString()+this.food.x.toString()).innerText = '*';

  }

  gameTick(){
    
    this.direction = this.newDirection;

    if (this.segments.length > 4) {
      let lastSegment = this.segments.pop();
      if (lastSegment.lump) {
        lastSegment.lump = false;
        this.segments.push(lastSegment);
      } else {
        lastSegment.remove();
      }  

      this.segments[this.segments.length-1].startDirection = null;
      this.segments[this.segments.length-1].generateImage();
    }

    let 
      {x: newX, y: newY} = this.segments[0],
      dY = [-1, 0, 1, 0],
      dX = [0, 1, 0, -1];

    newX += dX[this.direction];
    newY += dY[this.direction];

    if (
        newX < 0 || newX >= this.size || newY < 0 || newY >= this.size
        || this.segments.find(segment=>(segment.x === newX && segment.y === newY))
      ){
      clearInterval(this.gameInterval);
      this.endGame(false);
      return;
    }
    
    this.segments[0].setEndDirection(this.direction);
    this.segments[0].generateImage();

    let foodEaten = this.food.x === newX && this.food.y === newY

    this.segments.unshift(
      new Segment(
        newX, 
        newY, 
        this.direction,
        foodEaten
    ));

    if (foodEaten){
      this.generateFood();
    }
  }

}

class Segment {

  cyclesRemaining;
  x;
  y;
  element;
  startDirection = null;
  endDirection = null;
  lump;

  constructor(x, y, startDirection, lump, starting = false){
    this.x = x;
    this.y = y;
    this.startDirection = startDirection;
    this.element = document.getElementById(y.toString()+x.toString());
    this.lump = lump;
    this.generateImage();
  }

  remove(){
    this.element.innerText = '';
  }

  generateImage(){
    let image = '';
    let rotation = '';
    if (this.startDirection !== null && this.endDirection === null) {
      image = 'headSegment';
      rotation = this.startDirection*90;
    } else if (this.startDirection === null && this.endDirection !== null) {
      image = 'tailSegment';
      rotation = this.endDirection*90;
    } else if (this.startDirection === this.endDirection) {
      image = this.lump ? 'straightBumpSegment' : 'straightSegment';
      rotation = this.startDirection % 2 === 1 ? '90' : '0'; 
    } else {
      image = this.lump ? 'bendBumpSegment' : 'bendSegment';

      if (
          this.startDirection === 0 && this.endDirection === 3
          || this.startDirection === 1 && this.endDirection === 2
        ) {
          rotation = 0;
      } else if (
        this.startDirection === 1 && this.endDirection === 0
        || this.startDirection === 2 && this.endDirection === 3
      ) {
        rotation = 90;
      } else if (
        this.startDirection === 2 && this.endDirection === 1
        || this.startDirection === 3 && this.endDirection === 0
      ) {
        rotation = 180;
      } else if (
        this.startDirection === 0 && this.endDirection === 1
        || this.startDirection === 3 && this.endDirection === 2
      ) {
        rotation = 270;
      }

    }
    let imgElement = document.createElement('img');
    imgElement.setAttribute('src', `./games/assets/${image}.png`);
    imgElement.setAttribute('class', `rotate${rotation}`);
    this.element.innerHTML = '';
    this.element.appendChild(imgElement);
  }

  setEndDirection(endDirection){
    this.endDirection = endDirection;
  }
}