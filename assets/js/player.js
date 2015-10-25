(function(window) {
  function Player(name, imgPlayer, x_start, x_end) {
    this.initialize(name, imgPlayer, x_start, x_end);
  }

  Player.prototype = new createjs.BitmapAnimation();

  // public properties:
  Player.prototype.bounds = 0;
  Player.prototype.hit = 0;
  Player.prototype.alive = true;
  Player.prototype.leftHeld = false;
  Player.prototype.rightHeld = false;
  Player.prototype.downHeld = false;
  Player.prototype.upHeld = false;
  Player.prototype.jumping = false;

  // constructor:
  Player.prototype.BitmapAnimation_initialize = Player.prototype.initialize; //unique to avoid overiding base class

  var quaterFrameSize;

  Player.prototype.initialize = function(name, imgPlayer, x_start, x_end) {
    var localSpriteSheet = new createjs.SpriteSheet({
      images: [imgPlayer],
      frames: {
        width: 80,
        height: 80,
        regX: 40,
        regY: 40
      },
      animations: {
        moving: [0, 3],
        jumping: [15, 29],
        dead: 68
      }
    });

    //createjs.SpriteSheetUtils.addFlippedFrames(localSpriteSheet, true, false, false);

    this.BitmapAnimation_initialize(localSpriteSheet);
    this.x_end = x_end;

    quaterFrameSize = this.spriteSheet.getFrame(0).rect.width / 4;

    //Size of the Bounds for the collision's tests
    this.bounds = 16;
    this.hit = this.bounds;
    this.gotoAndPlay("moving"); //animate
    this.angle = 0;
    this.name = name;
    this.direction = 90;
    this.vX = this.speed;
    this.vY = 0;
    this.dimensions = {
      "width": 32,
      "height": 32,
      "offset": 24
    };
    this.x = 100; //Math.random()*(w-220)+60|0;
    this.y = 100; //Math.random()*(h-220)+0|0;
    this.leftHeld = false;
    this.rightHeld = false;
    this.downHeld = false;
    this.upHeld = false;
    this.jumpHeld = false;
    this.jumping = false; // state
    this.jumpSpeed = 0;
    this.minSpeed = 1;
    this.maxSpeed = 6;
    this.speed = this.minSpeed;
    this.newSpeedDown = 0;
    this.newSpeedUp = 0;
    this.heartRate = 109;
    this.speedFactor = 0;
    this.dead = false;
    this.gameOver = false;
    this.score = 0;
    this.killed = false;
  }

  Player.prototype.tick = function() {

    if (this.dead == false) {

      var speedCurrent = this.speed;

      if (this.jumpHeld && this.jumping == false) {

        this.jumping = true;
        this.direction = 0;
        this.gotoAndPlay("jumping");
        this.speed = this.speed * 2;
        this.onAnimationEnd = this.animationEnd;
        this.heartRate += 10;

      } else if (this.jumping == false) {

        //handle turning
        if (this.leftHeld) {
          this.rotation -= 7;
        } else if (this.rightHeld) {
          this.rotation += 7;
        }

        if (this.downHeld) {

          //this.newSpeedDown = this.speed;
          //this.newSpeedDown -= 0.15;

          if (this.speed > this.minSpeed) {
            this.speed -= 0.15;
          }

          this.heartRate -= 0.15;

        } else if (this.upHeld) {

          //this.newSpeedUp = this.speed;
          //this.newSpeedUp += 0.15;

          //console.log("going up");

          if (this.speed < this.maxSpeed) {
            //console.log("we are setting it!: " + this.newSpeedUp);
            this.speed += 0.15;
          }

          this.heartRate += 0.15;
        }


        if (this.downHeld == false && this.upHeld == false && this.speed > 3) {
          this.heartRate += this.speed * 0.01;
        } else if (this.downHeld == false && this.upHeld == false && this.speed < 3) {
          this.heartRate -= 0.15 / this.speed;
        }

        this.heartRate = this.heartRate < 104 ? 104 : this.heartRate;
        this.updateHeartRateGraph();

        //console.log("hr is: " + Math.floor(this.heartRate));

        //this.speedFactor
        //this.speedOffset = 
        //console.log("speed is: " + this.speedOffset);

        if (this.heartRate > 190) {
          //alert("you have been died!");
          this.kill();
        }

      }

      var angle = this.rotation * Math.PI / 180;
      var newX = Math.cos(angle) * this.speed;
      var newY = Math.sin(angle) * this.speed;

      // collisions to canvas walls
      if (this.x - this.dimensions["width"] / 2 + newX < 0) {
        newX = this.dimensions["width"] / 2 - this.x;
      }
      if (this.x + newX > dimensions["canvas"].width - this.dimensions["width"] / 2) {
        newX = (dimensions["canvas"].width - this.dimensions["width"] / 2) - this.x;
      }
      if (this.y - this.dimensions["height"] / 2 + newY < 0) {
        newY = this.dimensions["height"] / 2 - this.y;
      }
      if (this.y + newY > dimensions["canvas"].height - this.dimensions["height"] / 2) {
        newY = (dimensions["canvas"].height - this.dimensions["height"] / 2) - this.y;
      }


      // Collisions with other enemies or trees?
      for (var v = 0; v < enemies.length; v++) {

        if (enemies[v].dead == true) {
          continue;
        }

        if (enemies[v].hitRadius(this.x, this.y, this.hit)) {
          // they collides!
          if (enemies[v].jumping == true && this.jumping == false) {
            createjs.SoundJS.play("nomnom", createjs.SoundJS.INTERUPT_LATE, 0, 0.8);
            this.killed = true;
            break;
          } else if (enemies[v].jumping == false && this.jumping == true) {
            createjs.SoundJS.play("nomnom", createjs.SoundJS.INTERUPT_LATE, 0, 0.8);
            enemies[v].kill();
            this.score += 100;
          }
        }

      }

      for (var t = 0; t < trees.length; t++) {

        if (trees[t].hitRadius(this.x, this.y, this.hit)) {

          // depending on which side tree is, we wither add or remove
          if (trees[t].x > this.x) {
            newX = -1;
          } else {
            newX = 1;
          }
          if (trees[t].y > this.y) {
            newY = -1;
          } else {
            newY = 1;
          }

        }

      }

      this.x += newX;
      this.y += newY;

      if (this.killed == true) {
        this.kill();
      }

    }

  }

  Player.prototype.updateHeartRateGraph = function() {

    var d = document.getElementById('hr-pointer');

    if (this.heartRate < 114) {

      d.style.bottom = hrPointerPositions["VERYLIGHT"];

    } else if (this.heartRate < 133) {

      d.style.bottom = hrPointerPositions["LIGHT"];

    } else if (this.heartRate < 152) {

      d.style.bottom = hrPointerPositions["AVERAGE"];

    } else if (this.heartRate < 172) {

      d.style.bottom = hrPointerPositions["HEAVY"];

    } else if (this.heartRate < 190) {

      d.style.bottom = hrPointerPositions["HIGH"];

    }


  }

  Player.prototype.kill = function() {

    if (this.dead == false && this.gameOver == false) {

      this.gotoAndStop("dead");
      this.dead = true;
      this.gameOver = true;
      //this.timeToWakeUpFrames = Math.floor(Math.random() * 180) + 420;
      //this.timeToWakeUpFramesCurrent = 0;  

      var self = this;

      var xx = setTimeout(function() {

        var last = document.getElementById('last-score');
        last.textContent = self.score;
        document.getElementById("game-over").className = "";

      }, 200);

      var yy = setTimeout(function() {
        location.reload(true);
      }, 3000);

    }

  }

  Player.prototype.animationEnd = function(param, lastAnimationName) {
    if (lastAnimationName === "jumping" && this.jumping == true) {

      this.jumping = false;
      this.speed = this.minSpeed;
      this.gotoAndPlay("moving");

    }
  }

  window.Player = Player;
}(window));