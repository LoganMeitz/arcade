# Arcade
A collection of pure JS games. Intended as a small project for my personal website to practice some vanilla JavaScript stuff. As of now, this is a work in progress.  

The Arcade has a view comprised of a 'Game Machine' and a series of 'Game Cartridges' which can be inserted into the game machine to be played. Planned features for the future include the ability to change a number of settings for each game and the ability to change colour schemes dynamically through a series of 'Theme Cartridges'   

One of my current goals with this project is to implement the games and game machine in a SOLID, objected oriented way. In my opinion, JavaScript is not the most natural language to use for object oriented work, so this does present some challenges. The Arcade, as I have currently designed it, gives a good canvas to work on things like encapsulation, generalizing implementation and working with inheritence etc. The game machine component of the arcade is intended to work with a generalized Game class, with specific implementation for each game being defined in a class that inherits base functionality from the Game class. This means that in the future, the game classes themselves should be playable in a different context with minimal extra effort  

## Game List  

### Minesweeper  

I originally created a javascript implementation of minesweeper as a school project. Since then I have refactored and reimplemented it a few times, but the same underlying principles remain in its current form. This version of minesweeper uses an html table to represent the squares in a minesweeper grid and in its current form this is done by attaching events directly to the td elements of the table to update when checked.  

In addition to basic game functionality, the minesweeper game component has the ability to generate consistent boards from "BoardIDs", which are hex strings representing a distribution of mines and a starting space of the board. The game machine does not currently have the ability to export or import these IDs but this is intended functionality for the future.

### Snake

Another classic game, the current implementation of snake is reminescient of the Snake game on old Blackberry products.

