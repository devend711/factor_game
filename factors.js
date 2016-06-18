(function () {
  document.addEventListener("DOMContentLoaded", function () {
    window.requestAnimationFrame(function () {
      var manager = new GameManager(6, 2);
    });
  });

  function GameManager(size, numPlayers) {
    this.size = size || 5;
    this.numPlayers = numPlayers || 2;
    this.reset();
  }

  GameManager.prototype.reset = function () {
    this.players = [];
    this.started = false;
    this.gameOver = false;
    this.grid = new Grid(this.size);
    this.domManager = new DOMManager(this);
    this.grid.init();

    for(var i=0; i < this.numPlayers; i++) {
      this.players.push(new Player(i))
    }

    this.inputManager = new InputManager;
    this.domManager.initGrid();

    this.currentPlayerIndex = 0;
    this.currentPlayer = this.players[this.currentPlayerIndex];

    this.currentNumber = null;
    this.donePickingFactors = true;
  }

  GameManager.prototype.hasValue = function (value) {
    return (value < (this.size*this.size) + 1);
  }

  GameManager.prototype.getCellByValue = function (value) {
    if(this.hasValue(value)) {
      var cell = this.grid.cells[value-1];
      return cell;
    }
  }

  GameManager.prototype.selectCellValue = function (value) {
    if(this.hasValue(value)) {
      var cell = this.getCellByValue(value);
      this.selectCell(cell);

      if(!this.currentNumber) {
        this.setCurrentNumberByValue(value);
      }
    }
  }

  GameManager.prototype.selectCell = function (cell) {
    if(cell.taken) {
      console.log('cell ' + cell.value + ' is already taken');
      return;
    }

    if(this.currentNumber % cell.value != 0) {
      console.log(cell.value + ' is not a factor of ' + this.currentNumber);
      return;
    }


    cell.taken = true;
    cell.owner = this.currentPlayer;
    cell.needsUpdate = true;
    console.log('player ' + this.currentPlayer.id + ' chose ' + cell.value)
    this.domManager.updateGrid();
  }

  GameManager.prototype.setCurrentNumberByValue = function (value) {
    if(this.hasValue(value)) {
      this.currentNumber = value;
      this.domManager.updateHUD();
    }
  }

  GameManager.prototype.endCurrentPlayerTurn = function () {
    this.currentPlayerIndex += 1;

    if(this.currentPlayerIndex > this.players.length) this.currentPlayerIndex = 0;

    this.currentPlayer = this.players[this.currentPlayerIndex];

    this.updateHUD();
  }

  function InputManager() {

  }

  function Grid(size) {
    this.size = size;
    this.cells = []
  }

  Grid.prototype.init = function () {
    for(var i = 1; i < (this.size*this.size) + 1; i++) {
      this.cells.push(new Cell(i))
    }
  }

  function Cell(value) {
    this.value = value || 0;
    this.taken = false;
    this.owner = null; // player object
    this.needsUpdate = false;
  }

  function Player(id, name, colorName) {
    this.id = id;
    this.name = name || ('Player ' + id);
    this.score = 0;
    this.colorName = colorName || 'blue';
  }

  function DOMManager(gameManager) {
    this.gameManager = gameManager;
    this.grid = gameManager.grid;
  }

  DOMManager.prototype.handleCellClick = function (e) {
    var value = e.currentTarget.innerHTML;
    this.gameManager.selectCellValue(value);
  }

  DOMManager.prototype.initGrid = function() {
    var container = document.getElementsByClassName("grid-container")[0];
    var row = document.createElement("div");
    row.className = 'row';
    var that = this;

    this.grid.cells.forEach(function (cell) {
      var element = document.createElement("div");
      element.innerHTML = cell.value;
      element.className = 'cell';
      element.id = 'cell-' + cell.value;

      element.addEventListener("click", that.handleCellClick.bind(that));

      row.appendChild(element);

      if(cell.value % that.grid.size === 0) {
        container.appendChild(row);
        row = document.createElement("div");
        row.className = 'row';
      }
    });
  }

  DOMManager.prototype.updateGrid = function() {
    this.grid.cells.forEach(function (cell) {
      if(!cell.needsUpdate) return;

      var element = document.getElementById("cell-" + cell.value);

      if(cell.taken && cell.owner) {
        element.className += (' taken color-' + cell.owner.colorName);
      }
    });
  }

  DOMManager.prototype.updateHUD = function() {
    var container = document.getElementsByClassName("hud-container")[0];
    container.innerHTML = 'Current Player: ' + this.gameManager.currentPlayer.name;
    container.innerHTML += ' Chosen Number: ' + this.gameManager.currentNumber;
  }
})();