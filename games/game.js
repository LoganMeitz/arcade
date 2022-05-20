export class Game {

  static options = {};

  static description = `Default game, this should only show up if the correct game could not properly be retrieved`

  endGameCallback;

  constructor(){}

  getView(){
    let view = document.createElement('div');

    console.log('getting view?');

    view.innerHTML='<span>Error: No Game View :(</span>';

    return view;
  }

  startGame(endGameCallback){
    this.endGameCallback = endGameCallback;
    this.runGame();
  }

  runGame(){
    console.log('Game started, but not for real, this is default logic');
    setTimeout(()=>this.endGame.call(this, [true]), 200);
  }

  endGame(win){
    console.log(`game ended with ${(win ? 'win' : 'loss')}`);
    this.endGameCallback(win);
  }

  pause(){
    console.log('game is now paused');
  }

  resume(){
    console.log('game is now unpaused');
  }

}