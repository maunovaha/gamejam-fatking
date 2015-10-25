// static variables
var KEYCODE_ENTER = 13; //usefull keycode
var KEYCODE_SPACE = 32; //usefull keycode
var KEYCODE_DOWN = 40; //usefull keycode
var KEYCODE_UP = 38; //usefull keycode
var KEYCODE_LEFT = 37; //usefull keycode
var KEYCODE_RIGHT = 39; //usefull keycode
var KEYCODE_W = 87; //usefull keycode
var KEYCODE_A = 65; //usefull keycode
var KEYCODE_D = 68; //usefull keycode
var KEYCODE_S = 83; //usefull keycode

var hrPointerPositions = {
  "HIGH": "417px",
  "HEAVY": "321px",
  "AVERAGE": "225px",
  "LIGHT": "129px",
  "VERYLIGHT": "33px"
};

// register key functions
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

var game_tiles;

var enemies = [];
var trees = [];
var player;
var dimensions = {
  "canvas": {
    "width": 0,
    "height": 0
  }
};

var stage;
var preload;
var scoreField;

function init() {

  if (!createjs.SoundJS.checkPlugin(true)) {
    //document.getElementById("error").style.display = "block";
    //document.getElementById("content").style.display = "none";
    return;
  }

  // begin loading content (only sounds to load)
  var manifest = [{
    id: "nomnom",
    src: "assets/others/om.mp3|assets/others/om.ogg"
  }];

  preload = new createjs.PreloadJS();
  preload.onComplete = preLoadComplete;
  preload.installPlugin(createjs.SoundJS);
  preload.loadManifest(manifest);

  game_tiles = new Image();
  game_tiles.src = "assets/others/characterSprite.png";
  game_tiles.onload = handleImageLoad;

}

function preLoadComplete() {
  // what to do?
}

function stop() {
  createjs.Ticker.removeListener(window);
}

function handleImageLoad() {

  var canvas = document.getElementById("gameCanvas");
  stage = new createjs.Stage(canvas);
  //stage.autoClear = true;

  dimensions["canvas"].width = canvas.width;
  dimensions["canvas"].height = canvas.height;

  scoreField = new createjs.Text("0", "bold 14px Arial", "#FFFFFF");
  scoreField.textAlign = "left";
  scoreField.x = 16;
  scoreField.y = 16;
  scoreField.maxWidth = 400;
  scoreField.text = "Scores: 0";
  stage.addChild(scoreField);

  /**
   * Our enemies
   */
  for (var e = 0; e < 15; e++) {
    enemies.push(new Monster(e, game_tiles, 0));
    stage.addChild(enemies[e]);
  }

  /**
   * Our tree objects
   */
  //for(var y=0; y<1; y++) {
  trees.push(new Tree(67, 129, game_tiles));
  stage.addChild(trees[0]);

  trees.push(new Tree(555, 83, game_tiles));
  stage.addChild(trees[1]);

  trees.push(new Tree(337, 206, game_tiles));
  stage.addChild(trees[2]);

  trees.push(new Tree(107, 319, game_tiles));
  stage.addChild(trees[3]);

  trees.push(new Tree(274, 421, game_tiles));
  stage.addChild(trees[4]);

  trees.push(new Tree(532, 319, game_tiles));
  stage.addChild(trees[5]);

  trees.push(new Tree(569, 322, game_tiles));
  stage.addChild(trees[6]);

  //}

  /**
   *  Our player object
   */
  player = new Player("unnamed_player", game_tiles, 0);

  stage.addChild(player);
  stage.update();

  createjs.Ticker.addListener(window);
  createjs.Ticker.useRAF = true;
  // Best Framerate targeted (60 FPS)
  createjs.Ticker.setFPS(60);
}

function tick() {

  // Ticking enemies
  for (var v = 0; v < enemies.length; v++) {
    enemies[v].tick();
  }

  // Ticking player
  player.tick();

  scoreField.text = "Scores: " + Number(player.score).toString();

  stage.update();
}

//allow for WASD and arrow control scheme
function handleKeyDown(e) {
  //cross browser issues exist
  if (!e) {
    var e = window.event;
  }
  switch (e.keyCode) {
    case KEYCODE_SPACE:
      player.jumpHeld = true;
      return false;
    case KEYCODE_A:
    case KEYCODE_LEFT:
      player.leftHeld = true;
      return false;
    case KEYCODE_D:
    case KEYCODE_RIGHT:
      player.rightHeld = true;
      return false;
    case KEYCODE_W:
    case KEYCODE_UP:
      player.upHeld = true;
      return false;
    case KEYCODE_S:
    case KEYCODE_DOWN:
      player.downHeld = true;
      return false;
      //case KEYCODE_ENTER:  if(canvas.onclick == handleClick){ handleClick(); }return false;
  }
}

function handleKeyUp(e) {
  //cross browser issues exist
  if (!e) {
    var e = window.event;
  }
  switch (e.keyCode) {
    case KEYCODE_SPACE:
      player.jumpHeld = false;
      break;
    case KEYCODE_A:
    case KEYCODE_LEFT:
      player.leftHeld = false;
      break;
    case KEYCODE_D:
    case KEYCODE_RIGHT:
      player.rightHeld = false;
      break;
    case KEYCODE_W:
    case KEYCODE_UP:
      player.upHeld = false;
      break;
    case KEYCODE_S:
    case KEYCODE_DOWN:
      player.downHeld = false;
      break;
  }
}