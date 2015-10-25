(function(window) {
    function Tree(x, y, img) {
        this.initialize(x, y, img);
    }
    Tree.prototype = new createjs.BitmapAnimation();

    // public properties:
    Tree.prototype.bounds = 0; //visual radial size
    Tree.prototype.hit = 0; //average radial disparity

    // constructor:
    Tree.prototype.BitmapAnimation_initialize = Tree.prototype.initialize; //unique to avoid overiding base class

    var quaterFrameSize;

    Tree.prototype.initialize = function(x, y, img) {
        var localSpriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: {
                width: 80,
                height: 80,
                regX: 40,
                regY: 40
            },
            animations: {
                stand: 74
            },
            paused: true
        });

        //createjs.SpriteSheetUtils.addFlippedFrames(localSpriteSheet, true, false, false);

        this.BitmapAnimation_initialize(localSpriteSheet);
        this.dimensions = {
            "width": 32,
            "height": 32,
            "offset": 24
        };

        this.x = x;
        this.y = y;

        this.bounds = 28;
        this.hit = this.bounds;

        quaterFrameSize = this.spriteSheet.getFrame(0).rect.width / 4;

        // start playing the first sequence:
        this.gotoAndStop("stand"); //animate

    }


    Tree.prototype.hitPoint = function(tX, tY) {
        return this.hitRadius(tX, tY, 0);
    }

    Tree.prototype.hitRadius = function(tX, tY, tHit) {

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

    window.Tree = Tree;
}(window));