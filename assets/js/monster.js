(function(window) {
    function Monster(monsterName, imgMonster, x_end) {
        this.initialize(monsterName, imgMonster, x_end);
    }
    Monster.prototype = new createjs.BitmapAnimation();

    // public properties:
    Monster.prototype.IDLEWAITTIME = 40;
    Monster.prototype.bounds = 0; //visual radial size
    Monster.prototype.hit = 0; //average radial disparity
    Monster.prototype.dead = false;
    Monster.prototype.name = false;

    // constructor:
    Monster.prototype.BitmapAnimation_initialize = Monster.prototype.initialize; //unique to avoid overiding base class

    var quaterFrameSize;

    Monster.prototype.initialize = function(monsterName, imgMonster, x_end) {
        var localSpriteSheet = new createjs.SpriteSheet({
            images: [imgMonster],
            frames: {
                width: 80,
                height: 80,
                regX: 40,
                regY: 40
            },
            animations: {
                moving: [75, 78],
                jumping: [90, 104],
                dead: 68
            }
        });

        //createjs.SpriteSheetUtils.addFlippedFrames(localSpriteSheet, true, false, false);

        this.BitmapAnimation_initialize(localSpriteSheet);
        this.x_end = x_end;
        this.direction = 90;
        this.dimensions = {
            "width": 32,
            "height": 32,
            "offset": 24
        };
        this.vX = 7;
        this.vY = 0;
        this.x = Math.floor(Math.random() * dimensions["canvas"].width - 32) + 32;
        this.y = Math.floor(Math.random() * dimensions["canvas"].height - 32) + 32;
        this.bounds = 16;
        this.hit = this.bounds;
        this.dead = false;
        this.timeToWakeUpFrames = 0;
        this.timeToWakeUpFramesCurrent = 0;
        this.jumping = false;
        this.minSpeed = 2;
        this.maxSpeed = 6;
        this.speed = 2;
        this.killed = false;

        quaterFrameSize = this.spriteSheet.getFrame(0).rect.width / 4;

        // start playing the first sequence:
        this.gotoAndPlay("moving"); //animate
        this.name = monsterName;
        this.angle = 0;

    }

    Monster.prototype.tick = function() {

        var angle = this.rotation * Math.PI / 180;

        if (this.dead == false || this.timeToWakeUpFramesCurrent == this.timeToWakeUpFrames) {

            if (this.dead == true) {
                this.revive();
            }

            // todo: calculate based on heart rate?
            var makeAjump = Math.floor(Math.random() * 30) + 1 == 1 ? true : false;

            if (makeAjump == true && this.jumping == false) {
                this.direction = 0;
                this.gotoAndPlay("jumping");
                this.speed = this.speed * 2;
                this.onAnimationEnd = this.animationEnd;
                this.jumping = true;
            }

            // randoming moving check
            var timeToMove = Math.floor(Math.random() * 16) + 1 == 1 ? true : false;

            if (timeToMove == true) {

                var turning = Math.floor(Math.random() * 2) + 1 == 1 ? true : false;
                var rotation = Math.floor(Math.random() * 40) + 10;
                if (turning) {
                    this.rotation -= rotation;
                } else {
                    this.rotation += rotation;
                }

                //this.angle = this.rotation * Math.PI / 180;*/

                angle = this.rotation * Math.PI / 180;
            }


            //this.vX = Math.sin(angle) * this.speed;
            //this.vY = Math.cos(angle) * this.speed;

            //var angle = this.rotation * Math.PI / 180;
            var newX = Math.cos(angle) * this.speed;
            var newY = Math.sin(angle) * this.speed;
            var newRotation = 0;

            // collisions to canvas walls
            if (this.x - this.dimensions["width"] / 2 + newX < 0) {
                newX = this.dimensions["width"] / 2 - this.x;
                newRotation = 180;
            }
            if (this.x + newX > dimensions["canvas"].width - this.dimensions["width"] / 2) {
                newX = (dimensions["canvas"].width - this.dimensions["width"] / 2) - this.x;
                newRotation = 180;
            }
            if (this.y - this.dimensions["height"] / 2 + newY < 0) {
                newY = this.dimensions["height"] / 2 - this.y;
                newRotation = 180;
            }
            if (this.y + newY > dimensions["canvas"].height - this.dimensions["height"] / 2) {
                newY = (dimensions["canvas"].height - this.dimensions["height"] / 2) - this.y;
                newRotation = 180;
            }

            this.killed = false;

            // Collisions with other enemies or trees?
            for (var v = 0; v < enemies.length; v++) {

                if (enemies[v].dead == true) {
                    continue;
                }

                if (enemies[v].name != this.name && enemies[v].hitRadius(this.x, this.y, this.hit)) {
                    // they collides!
                    if (enemies[v].jumping == true && this.jumping == false) {
                        //createjs.SoundJS.play("nomnom", createjs.SoundJS.INTERUPT_LATE, 0, 0.8);
                        this.killed = true;
                        break;
                    } else if (enemies[v].jumping == false && this.jumping == true) {
                        //createjs.SoundJS.play("nomnom", createjs.SoundJS.INTERUPT_LATE, 0, 0.8);
                        enemies[v].kill();
                    }
                }

            }

            if (this.killed == false) {

                for (var t = 0; t < trees.length; t++) {

                    if (trees[t].hitRadius(this.x, this.y, this.hit)) {

                        // depending on which side tree is, we wither add or remove
                        if (trees[t].x > this.x) {
                            newX -= 3;
                        } else {
                            newX += 3;
                        }
                        if (trees[t].y > this.y) {
                            newY -= 3;
                        } else {
                            newY += 3;
                        }

                        newRotation = 180;
                    }


                }

            }

            this.rotation += newRotation;

            this.x += newX;
            this.y += newY;

            if (this.killed == true) {
                this.kill();
            }

        } else {
            this.timeToWakeUpFramesCurrent++;
        }

    }

    Monster.prototype.revive = function() {
        this.gotoAndPlay("moving");
        this.dead = false;
    }

    Monster.prototype.kill = function() {

        if (this.dead == false) {

            this.gotoAndStop("dead");
            this.dead = true;
            this.timeToWakeUpFrames = Math.floor(Math.random() * 80) + 220;
            this.timeToWakeUpFramesCurrent = 0;

        }


    }

    Monster.prototype.hitPoint = function(tX, tY) {
        return this.hitRadius(tX, tY, 0);
    }

    Monster.prototype.hitRadius = function(tX, tY, tHit) {

        //early returns speed it up
        if (tX - tHit > this.x + this.hit) {
            return;
        }
        if (tX + tHit < this.x - this.hit) {
            return;
        }
        if (tY - tHit > this.y + this.hit) {
            return;
        }
        if (tY + tHit < this.y - this.hit) {
            return;
        }

        //now do the circle distance test
        return this.hit + tHit > Math.sqrt(Math.pow(Math.abs(this.x - tX), 2) + Math.pow(Math.abs(this.y - tY), 2));
    }


    Monster.prototype.animationEnd = function(param, lastAnimationName) {

        if (lastAnimationName === "jumping" && this.jumping == true) {

            this.jumping = false;
            this.speed = this.minSpeed;
            this.gotoAndPlay("moving");

        }


    }

    window.Monster = Monster;
}(window));