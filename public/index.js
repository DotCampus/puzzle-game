class Puzzle {
  constructor(numberOfTiles = 8) {
    const allTilesPlusBlank = numberOfTiles + 1;
    const numberOfTilesPerRow = Math.sqrt(allTilesPlusBlank); // number of tiles per row
    this.initialArrangement = [];
    for (let i = 1; i <= allTilesPlusBlank; i += 1) {
      this.initialArrangement.push(i);
    }
    this.currentArrangement = [...this.initialArrangement];
    const blankTileID = allTilesPlusBlank;
    let blankTilePosition = blankTileID - 1; // initially the last item
    let hasBeenSolved = false;
    const winningTimeout = 3000;

    const showAlert = (message) => {
      return alert(message);
    };

    const releaseConfetti = () => {
      const jsConfetti = new JSConfetti();
        jsConfetti.addConfetti();
        setTimeout(() => {
          jsConfetti.addConfetti();
        }, 1000);
        setTimeout(() => {
          jsConfetti.addConfetti();
        }, winningTimeout);
    }

    const playWinningApplause = () => {
      const sound = new Howl({
        src: ['assets/applause1.mp3']
      });
      
      const sound1 = sound.play();
      sound.fade(1, 0, winningTimeout * 2, sound1);
    };

    const playTileMovementSound = () => {
      const sound = new Howl({
        src: ['assets/button_click1.mp3']
      });
      
      sound.play();
    }

    /**
     * @description swaps the tile at the tilePosition with the blank tile.
     *
     * @param {number} tilePosition
     */
    const swapTiles = (tilePosition) => {
      const temp = this.currentArrangement[tilePosition];
      this.currentArrangement[tilePosition] =
        this.currentArrangement[blankTilePosition];
      this.currentArrangement[blankTilePosition] = temp;
      blankTilePosition = tilePosition;
    };

    const isSolved = () => {
      for(let i = 0; i < this.currentArrangement.length; i += 1) {
        if (this.currentArrangement[i] !== this.initialArrangement[i]) {
          return false;
        };
      }
      return true;
    }

    const moveTile = (currentTilePosition) => {
      if (hasBeenSolved) { 
        return showAlert('Please restart the game');
      }

      /**
       * @description This checks whether the tile is at the left edge.
       *
       * @returns {boolean}
       */
      const isTileAtLeftEdge = () =>
        currentTilePosition % numberOfTilesPerRow === 0;

      /**
       * @description This checks whether the tile is at the right edge.
       *
       * @returns {boolean}
       */
      const isTileAtRightEdge = () =>
        (currentTilePosition + 1) % numberOfTilesPerRow === 0;

      const blankOnTheLeft = currentTilePosition - 1 === blankTilePosition;
      const blankOnTheRight = currentTilePosition + 1 === blankTilePosition;
      const blankAtTheTop =
        currentTilePosition - numberOfTilesPerRow === blankTilePosition;
      const blankAtTheBottom =
        currentTilePosition + numberOfTilesPerRow === blankTilePosition;

      if (
        (!isTileAtLeftEdge() && blankOnTheLeft) || // is blank on the left of the current tile which is not at the edge
        (!isTileAtRightEdge() && blankOnTheRight) || // is blank on the right of the current tile which is not at the edge
        blankAtTheTop || // is blank at the top of the current tile
        blankAtTheBottom // is blank at the bottom of the current tile
      ) {
        swapTiles(currentTilePosition);
        playTileMovementSound();
      }
      
      if (isSolved()) {
        // confetti
        releaseConfetti();

        // applause
        playWinningApplause();

        hasBeenSolved = true;
      }
      return '';
    };

    const renderTiles = (tilesArrangement = this.currentArrangement) => {
      blankTilePosition = tilesArrangement.findIndex((item) => item === blankTileID);
      const allTiles = tilesArrangement.reduce(
        (tiles, currentTile, index) => {
          tiles += `<li 
                      id="${currentTile}"
                      class="${
                        currentTile === blankTileID ? 'blank-tile' : 'tile'
                      }"
                      data-position="${index}"
                      >${currentTile}</li>`;
          return tiles;
        },
        ''
      );
      const puzzle = document.querySelector('.puzzle');
      puzzle.innerHTML = allTiles;
      // set the puzzle's max width
      const maxWidth = 400 + 120 * (numberOfTilesPerRow - 3);
      puzzle.style.maxWidth = `${maxWidth}px`;
      puzzle.style.minWidth = `${maxWidth}px`;

      const tiles = document.getElementsByClassName('tile');

      // add the event listener
      Array.from(tiles).forEach((node) => {
        node.addEventListener('click', (event) => {
          const tilePosition = parseInt(
            event.target.getAttribute('data-position'),
            10
          );
          moveTile(tilePosition);
          renderTiles();
        });
      });

    };

    /**
     * @description shuffles the tiles
     */
    const shuffleTiles = () => {
      this.currentArrangement.forEach((item, currentIndex) => {
        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex);

        // And swap it with the current element.
        [
          this.currentArrangement[currentIndex],
          this.currentArrangement[randomIndex],
        ] = [
          this.currentArrangement[randomIndex],
          this.currentArrangement[currentIndex],
        ];
      });
      hasBeenSolved = false;
      renderTiles(this.currentArrangement);
    };

    /**
     * @description initialize the tiles
     */
    this.init = () => {
      const restartButton = document.querySelector('button#restart');
      const solveButton = document.querySelector('button#solve');
      solveButton.addEventListener('click', () => renderTiles(this.initialArrangement));
      restartButton.addEventListener('click', shuffleTiles);
      shuffleTiles();
    };
  }
}

const difficultySelect = document.querySelector('select#difficulty');
difficultySelect.addEventListener('change', (event) => {
    const difficulties = {
        easy: 8,
        medium: 15,
        hard: 24,
        harder: 35,
    };
    const { value } = event.target;
    const difficulty = difficulties[value];

    const newPuzzle = new Puzzle(difficulty);
    newPuzzle.init();
});

const puzzle = new Puzzle(8);
puzzle.init();
