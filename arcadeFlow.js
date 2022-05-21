import { ArcadeMachine } from './arcadeMachine.js';
import { Game } from './games/game.js';
import { Minesweeper } from './games/minesweeper.js';
import { Snake } from './games/snake.js';

function mobileNavigation() {
  const mobileWarning = `
    <div class='mobile-warning'>
      <p>Sorry, this page does not yet have a mobile friendly view</p>
      <button onclick="history.back()">Take Me Back</button>
    </div>
  `;

  const body = document.querySelector('body');
  body.innerHTML = mobileWarning;
}


function startMachine() {

  console.log('oh');
  
  const cartridgeContainer = document.getElementById("cartridge-container");

  const moveCard = function(card, destination){
    card.parentNode.removeChild(card);
    destination.appendChild(card);
  }

  let gameScreen = {
    screen: document.getElementById("game-screen"), 
    overlay: document.createElement('div'),
    clearOverlay: function(){
      this.overlay.innerHTML = ``;
      if (this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
    },
    clearWindow: function(){
      this.clearOverlay();
      this.screen.innerHTML = ``;
    },
    makeOverlay: function(textBlocks, buttons =[]){
      this.clearOverlay();
      textBlocks.forEach(block=>{
        let newBlock = document.createElement('p');
        newBlock.innerText = block.text;
        if (block.style) newBlock.classList.add(block.style)
        this.overlay.appendChild(newBlock)
      });
      buttons.forEach(button=>{
        let newButton = document.createElement('button');
        newButton.innerText = button.text;
        newButton.addEventListener('click', button.logic)
        this.overlay.appendChild(newButton)
      });
      this.screen.appendChild(this.overlay);
    },
    attachView: function(view){
      this.clearWindow();
      view.id = 'game'
      this.screen.appendChild(view);
    },
  };
  gameScreen.overlay.id = 'overlay';


  let controlPanel = {
    element: document.getElementById("settings"),
    output: function(output){
      console.log('default behaviour of control panel, likely in error');
      console.log(output);
    },
    init: function(){
      let pauseButton = document.createElement('button');
      let restartButton = document.createElement('button');
      let infoButton = document.createElement('button');
      let settingsButton = document.createElement('button');
  
      pauseButton.innerText = 'Pause'
      restartButton.innerText = 'New Game';
      infoButton.innerText = 'Info';
      settingsButton.innerText = 'Settings';
  
      pauseButton.addEventListener('click', ()=>{this.output('pause')});
      restartButton.addEventListener('click', ()=>{this.output('restart')});
      infoButton.addEventListener('click', ()=>{this.output('info')});
      settingsButton.addEventListener('click', ()=>{this.output('settings')});
  
      this.element.appendChild(restartButton);
      this.element.appendChild(pauseButton);
      //this.element.appendChild(infoButton);
      //this.element.appendChild(settingsButton);
    },
    // throw some settings form logic here eventually
  };


  let gameDeck = {
    element: document.getElementById("game-deck"),
    gameReader: function(gameTitle){
      if (gameTitle === 'minesweeper'){
        this.onRead(Minesweeper);
      } else if (gameTitle === 'snake') {
        this.onRead(Snake);
      } else {
        this.onRead(Game);
      }
    },
    onRead: function(gameClass){
      console.log('default execution, likely problem', gameClass);
    },
    eject: function(){
      this.element.childNodes.forEach(node=>{
        if (!!node.classList && node.classList.contains('game-cartridge')) {
          moveCard(node, cartridgeContainer);
        }
      })
    },
  };

  cartridgeContainer.dropCard = (card=>{
    moveCard(card, cartridgeContainer)
  });
  gameDeck.element.dropCard = (card=>{
    gameDeck.gameReader(card.attributes.data.value);
    gameDeck.eject();
    moveCard(card,  gameDeck.element);
  });

  document.getElementById('game-machine').addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown', e => e.preventDefault());

  let machine = new ArcadeMachine(gameScreen, controlPanel, gameDeck);

  function drag(e){
    this.style.top = `${e.pageY-Math.round(this.offsetHeight/2)}px`;
    this.style.left = `${e.pageX-Math.round(this.offsetWidth/2)}px`;
  }

  function startDrag(e){

    this.classList.add('dragging');
    
    
    let dragging = drag.bind(this);
    let stopDragging = endDrag.bind(this);

    window.addEventListener('mousemove', dragging);
    window.addEventListener('mouseup', stopDragging);

    function endDrag(e){

      window.removeEventListener('mousemove', dragging);
      window.removeEventListener('mouseup', stopDragging);

      let {top, left, bottom, right} = this.getBoundingClientRect();

      this.classList.remove('dragging');
      this.style.top = 0;
      this.style.left = 0;

      let droppedCorners = [
        ...document.elementsFromPoint(left,top),
        ...document.elementsFromPoint(right,top),
        ...document.elementsFromPoint(left,bottom),
        ...document.elementsFromPoint(right,bottom),
      ];

      let droppedAt = droppedCorners.find(element=>element.id==='game-deck'||element.id==='cartridge-container');

      if (!!droppedAt && droppedAt !== this.parentNode){
        droppedAt.dropCard(this);
      } else {
        moveCard(this, cartridgeContainer);
      }
    }

    dragging(e);
  }

  document.querySelectorAll(".game-cartridge").forEach(ele => ele.addEventListener('mousedown', startDrag));


}



window.addEventListener("load", function(){
  const screenWidth = window.screen.width;
  if (screenWidth > 600) startMachine();
  else mobileNavigation();
});