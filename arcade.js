class ArcadeMachine {

  gameWindow;
  settingsWindow;
  overlayScreen;

  settingsForm;

  gameClass;
  game;

  constructor(){
    this.gameClass = findGame();
    this.initGameWindow();
    this.overlayScreen = document.createElement('div');
    this.overlayScreen.id = 'overlay';
    this.settingsWindow = document.getElementById('settings');
  }

  setGameClass(gameClass){
    this.clearWindow();
    this.gameClass = gameClass;
    this.initSettings();
  }

  loadGame(){
    this.game = new this.gameClass();
    this.makeOverlay([], [{text: 'Start', logic: this.startGame.bind(this)}]);
  }

  startGame(){
    this.clearOverlay();
    if (this.game) this.game.startGame(this.gameOver.bind(this))
  }

  pauseGame(){
    // add pause logic
    this.makeOverlay(
      [], 
      [{
        text: 'Resume',
        logic: this.resumeGame.bind(this)
      }]
    );
  }

  resumeGame(){
    this.clearOverlay();
    //add logic
  }

  restartGame(){
    this.clearWindow();
    this.loadGame();
    this.makeOverlay([], [{text: 'Start', logic: this.startGame.bind(this)}]);
  }

  makeOverlay(textBlocks, buttons =[]){

    this.clearOverlay();

    textBlocks.forEach(block=>{
      let newBlock = document.createElement('p');
      newBlock.innerText = block.text;
      if (block.style) newBlock.classList.add(block.style)
      this.overlayScreen.appendChild(newBlock)
    });

    buttons.forEach(button=>{
      let newButton = document.createElement('button');
      newButton.innerText = button.text;
      newButton.addEventListener('click', button.logic)
      this.overlayScreen.appendChild(newButton)
    });

    this.window.appendChild(this.overlayScreen);
  }

  clearOverlay(){
    this.overlayScreen.innerHTML = ``;
    if (this.overlayScreen.parentNode) this.overlayScreen.parentNode.removeChild(this.overlayScreen);
  }

  showInfo(){
    this.makeOverlay(
      [{
        style: 'long',
        text: this.gameClass.description
      }], 
      [{
        text: 'Resume',
        logic: this.resumeGame.bind(this)
      }]
    );
  }

  gameOver(win){
    this.makeOverlay(
      [{
        text: (win ? 'Victory' : 'Failure')
      }], 
      [{
        text: 'New Game',
        logic: this.restartGame.bind(this)
      }]
    );
  }

  openSettings(){
    console.log('to be done later');

    /*
    if (this.settingsForm && this.settingsForm.parentNode) this.settingsForm.parentNode.removeChild(this.settingsForm);
    this.makeSettingsForm(this.gameClass.options);
    this.settingsWindow.appendChild(this.settingsForm);
    */
  }

  changeSettings(){
    this.settingsForm.parentNode.removeChild(this.settingsForm);

  }

  initGameWindow(){
    this.window = document.getElementById('game');
    //gameWindow = new GameWindow();
  }

  clearWindow(){
    this.clearOverlay();
    this.window.innerHTML = '';
  }

  clearSettings(){
    this.settingsWindow.innerHTML = '';
  }

  initSettings(){
    this.clearSettings();

    let pauseButton = document.createElement('button');
    let restartButton = document.createElement('button');
    let infoButton = document.createElement('button');
    let settingsButton = document.createElement('button');

    pauseButton.innerText = 'Pause'
    restartButton.innerText = 'New Game';
    infoButton.innerText = 'Info';
    settingsButton.innerText = 'Settings';

    pauseButton.addEventListener('click', this.pauseGame.bind(this));
    restartButton.addEventListener('click', this.restartGame.bind(this));
    infoButton.addEventListener('click', this.showInfo.bind(this));
    settingsButton.addEventListener('click', this.openSettings.bind(this));

    this.settingsWindow.appendChild(pauseButton);
    this.settingsWindow.appendChild(restartButton);
    this.settingsWindow.appendChild(infoButton);
    this.settingsWindow.appendChild(settingsButton);
  }
  
  makeSettingsForm(options){
    this.settingsForm = document.createElement('div');
  
    Object.keys(options).forEach(key=>{
      switch (options[key].type){
        case 'number':
          let row = document.createElement('div');
          let label = document.createElement('label');
          label.innerText=key;
          row.appendChild(label);
          row.appendChild(this.createNumberSetting(options[key]));
          this.settingsForm.appendChild(row);
      }
    });

    let changeSettingsButton = document.createElement('button');
    changeSettingsButton.addEventListener('click', this.changeSettings.bind(this));
    changeSettingsButton.innerText = 'Change Settings';
    this.settingsForm.appendChild(changeSettingsButton);
  
  }

  createNumberSetting(setting){
    let numberSetting = document.createElement('input');
    numberSetting.setAttribute('type', 'number');
    if (setting.min) numberSetting.setAttribute('min', setting.min);
    if (setting.max) numberSetting.setAttribute('max', setting.max);
    return numberSetting;
  
  }


}


function findGame(gameName = null){
  switch (gameName){
    case 'minesweeper':
      return Minesweeper;
    default:
      return Game;
  }    
}


window.addEventListener("load", function(){


  let machine = new ArcadeMachine();
  
  function play(e){
    const gameType = e.path[0].attributes.data?.value ?? e.path[1].attributes.data?.value;
    machine.setGameClass(findGame(gameType));
    machine.loadGame();
  }


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
      
      if (droppedAt === undefined) {
        this.parentNode.removeChild(this);
        document.getElementById('cartridge-container').appendChild(this);
      } else if (droppedAt.id === 'game-deck'){  
        droppedAt.appendChild(this);
        let gameType = this.attributes.data.value;
        machine.setGameClass(findGame(gameType));
        machine.loadGame();
      } else if (droppedAt.id === 'cartridge-container'){
        // could put more specific logic in here to move cartridges around within the holder
      }
    }

    dragging(e);
  }


  document.querySelectorAll(".game-cartridge").forEach(ele => ele.addEventListener('mousedown', startDrag));

  document.getElementById('game-machine').addEventListener('contextmenu', e => e.preventDefault());

});