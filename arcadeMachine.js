export class ArcadeMachine {

  // sub components
  gameScreen;
  controlPanel;
  gameDeck;

  gameClass;
  game;


  constructor(gameScreen, controlPanel, gameDeck){

    this.gameScreen = gameScreen;
    this.controlPanel = controlPanel;
    this.gameDeck = gameDeck;

    this.controlPanel.output = this.readInput.bind(this);
    this.controlPanel.init();

    this.gameDeck.onRead = this.setGameClass.bind(this);
  }

  // good, sensible functions:

  readInput(input){
    switch (input){
      case 'restart':
        this.restartGame();
        break;
      case 'pause':
        this.pauseGame();
        break;
      // case 'settings':
      //   this.loadGame();
      //   break;
      case 'info':
        this.showInfo();
        break;
      default:
        console.log('bad input?');
    }
  }

  setGameClass(gameClass){
    this.gameClass = gameClass;
    this.game = null;
    this.loadGame();
  }

  loadGame(){
    if (this.gameClass){
      this.game = new this.gameClass();
      this.gameScreen.attachView(this.game.getView());
      this.gameScreen.makeOverlay([], [{text: 'Start', logic: this.startGame.bind(this)}]);
    }
  }

  startGame(){
    this.gameScreen.clearOverlay();
    if (this.game) this.game.startGame(this.gameOver.bind(this));
  }

  pauseGame(){
    if (this.game) {
      this.game.pause();
      this.gameScreen.makeOverlay(
        [], 
        [{
          text: 'Resume',
          logic: this.resumeGame.bind(this)
        }]
      );
    }
  }

  resumeGame(){
    this.game.resume();
    this.gameScreen.clearOverlay();
  }

  restartGame(){
    this.gameScreen.clearWindow();
    this.loadGame();
  }

  gameOver(win){
    this.gameScreen.makeOverlay(
      [{
        text: (win ? 'Victory' : 'Failure')
      }], 
      [{
        text: 'New Game',
        logic: this.restartGame.bind(this)
      }]
    );
  }


  showInfo(){
    this.gameScreen.makeOverlay(
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

};