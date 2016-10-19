// System
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var FRAMETIME = 1000 / 60;
ctx.imageSmoothingEnabled = false;
fitViewport(canvas);


// Input
// Async pressing keys and mouse stuff
var asyncPressingRight = false,
    asyncPressingLeft = false,
    asyncPressingS = false,
    asyncPressingA = false,
    asyncPressingEnter = false,
    asyncPressingLMB = false,
    asyncPressingQ = false,
    mousePos = new vec2(0.0, 0.0),
    leftStickDeadZone = 0.3;
    leftStick = 0.0,
    rightTrigger = 0.0;

// Sync pressing keys
var pressingRight = false,
    pressingLeft = false,
    pressingS = false,
    pressingA = false,
    pressingEnter = false,
    pressingLMB = false,
    pressingQ = false,
    pressingGamepadA = false,
    pressingGamepadStart = false;

// Old sync pressing keys (for pressed state)
var oldPressingS = false,
    oldPressingEnter = false,
    oldPressingLMB = false,
    oldPressingQ = false
    oldPressingGamepadA = false,
    oldPressingGamepadStart = false;

// Sync pressed keys
var pressedS = false,
    pressedEnter = false,
    pressedLMB = false,
    pressedQ = false,
    pressedGamepadA = false,
    pressedGamepadStart = false;

// Fields
var LEVEL = 0,
    RUMBLE = false,
    LIVES = 5,
    LEVELNAME = "Unknown",
    SCORE = 0,
    HIGHSCORE = 0,
    MULTIPLIER = 0,
    SHOWTUTORIAL = true,
    RESET_GAME = true,
    PAUSED = false;

// Tools
Math.clamp = function(number, min, max) {
    return number < min ? min : (number > max ? max : number);
}
Math.degtorad = function(angle) {
    return angle * Math.PI / 180;
}
Math.radtodeg = function(angle) {
    return angle * 180 / Math.PI;
}

function setFontSize(fontSize) {
    ctx.font = (fontSize * canvas.width / 720) + "px GohuFont";
}
function fitViewport(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


// vec2 Class
function vec2() {}

function vec2(x, y) {
    this.x = x;
    this.y = y;
}

vec2.prototype.x = 0.0;
vec2.prototype.y = 0.0;
vec2.prototype.clamp =
    function(min, max) {
        this.x = Math.clamp(this.x, min.x, max.x);
        this.y = Math.clamp(this.y, min.y, max.y)
    }

// Block class
function Block(x, y) {
    var width = canvas.width;
    var height = canvas.height;
    this.position = new vec2(x, y);
    this.orig_position = new vec2(x, y);
    this.size = new vec2(width * 0.06, height * 0.0520845);
    this.displace_ratio = height / 45;

    this.randomizeColors();
}
Block.prototype.randomizeColors =
    function() {
        // Make these blocks VISIBLE!
        var minimumVal = 135;
        var valRange = 256 - minimumVal;

        var redSeed = Math.random();
        var greenSeed = Math.random();
        var blueSeed = Math.random();

        var calcVal = function(seed, div) {
            return Math.floor((minimumVal / div) +
                (seed * (valRange / div)));
        }

        this.c = "rgba(" + calcVal(redSeed, 1) + ", " +
            calcVal(greenSeed, 1) + ", " +
            calcVal(blueSeed, 1) + ", 1.0";
        this.c_mediumtones = "rgba(" + calcVal(redSeed, 2) + ", " +
            calcVal(greenSeed, 2) + ", " +
            calcVal(blueSeed, 2) + ", 1.0";
        this.c_darktones = "rgba(" + calcVal(redSeed, 4) + ", " +
            calcVal(greenSeed, 4) + ", " +
            calcVal(blueSeed, 4) + ", 1.0";
    }
Block.prototype.position = new vec2();
Block.prototype.orig_position = new vec2();
Block.prototype.size = new vec2(0.0, 0.0);
Block.prototype.c = "#FFF";
Block.prototype.c_mediumtones = "#777";
Block.prototype.c_darktones = "#333";
Block.prototype.topedge = 0.0;
Block.prototype.bottomedge = 0.0;
Block.prototype.leftedge = 0.0;
Block.prototype.rightedge = 0.0;
Block.prototype.displace_ratio = 0.0;
Block.prototype.update =
    function() {
        if (RUMBLE) {
            this.position.x = this.orig_position.x +
                (Math.random() * this.displace_ratio) - (this.displace_ratio / 2);
            this.position.y = this.orig_position.y +
                (Math.random() * this.displace_ratio) - (this.displace_ratio / 2);

            this.randomizeColors();
        }

        this.topedge = this.position.y - (this.size.y / 2);
        this.bottomedge = this.position.y + (this.size.y / 2);
        this.leftedge = this.position.x - (this.size.x / 2);
        this.rightedge = this.position.x + (this.size.x / 2);
    }
Block.prototype.draw =
    function() {
        // Upper triangle
        ctx.beginPath();
        ctx.moveTo(this.position.x - (this.size.x / 2), this.position.y - (this.size.y / 2));
        ctx.lineTo(this.position.x + (this.size.x / 2), this.position.y - (this.size.y / 2));
        ctx.lineTo(this.position.x, this.position.y);
        ctx.fillStyle = this.c;
        ctx.fill();
        ctx.closePath();
        // Left triangle
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x - (this.size.x / 2), this.position.y + (this.size.y / 2));
        ctx.lineTo(this.position.x - (this.size.x / 2), this.position.y - (this.size.y / 2));
        ctx.fillStyle = this.c_mediumtones;
        ctx.fill();
        ctx.closePath();
        // Right triangle
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + (this.size.x / 2), this.position.y + (this.size.y / 2));
        ctx.lineTo(this.position.x + (this.size.x / 2), this.position.y - (this.size.y / 2));
        ctx.fillStyle = this.c_mediumtones;
        ctx.fill();
        ctx.closePath();
        // Bottom triangle
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + (this.size.x / 2), this.position.y + (this.size.y / 2));
        ctx.lineTo(this.position.x - (this.size.x / 2), this.position.y + (this.size.y / 2));
        ctx.fillStyle = this.c_darktones;
        ctx.fill();
        ctx.closePath();
    }


// Ball class
function Ball() {
    var width = canvas.width;
    var height = canvas.height;

    this.position = new vec2(0.0, 21.0 * height / 24.0);
    this.maxspeed = height / 72;
    this.stopped = true;
    this.diameter = height * 0.034723;
}
Ball.prototype.stopped = true;
Ball.prototype.position = new vec2(0, 0);
Ball.prototype.speed = new vec2(0, 0);
Ball.prototype.diameter = 0.0;
Ball.prototype.c = 0xFFFFFF;
Ball.prototype.trackedPad = null;
Ball.prototype.trackedBlocks = [];
Ball.prototype.removalBlocks = []
Ball.prototype.afterImages = [];
Ball.prototype.maxspeed = 0.0;
Ball.prototype.topedge = 0.0;
Ball.prototype.bottomedge = 0.0;
Ball.prototype.leftedge = 0.0;
Ball.prototype.rightedge = 0.0;
Ball.prototype.theta = 0.0;
Ball.prototype.TrackPad =
    function(pad) {
        this.trackedPad = pad;
    }
Ball.prototype.TrackBlocks =
    function(blockList) {
        this.trackedBlocks = blockList;
    }
Ball.prototype.wakeUp =
    function() {
        if (this.stopped) {
            this.stopped = false;
            var initial_angle = 67.5 + (Math.random() * 46);
            this.speed.x = this.maxspeed * Math.cos(Math.degtorad(initial_angle));
            this.speed.y = -this.maxspeed * Math.sin(Math.degtorad(initial_angle));
        }
    }
Ball.prototype.update =
    function() {
        var width = canvas.width;
        var height = canvas.height;
        var frameRate = 60.0; // Deal with it.

        // Positioning when stopped
        if (this.stopped) {
            if (this.trackedPad != null)
                this.position.x = this.trackedPad.position.x;
            return;
        }

        // Afterimages
        this.afterImages.push(new vec2(this.position.x, this.position.y));
        if (this.afterImages.length >= 7)
            this.afterImages.splice(0, 1);

        // Limit speed
        this.speed.clamp(new vec2(-this.maxspeed, -this.maxspeed),
            new vec2(this.maxspeed, this.maxspeed));

        // Transform position
        this.position.x += this.speed.x * 60.0 / frameRate;
        this.position.y += this.speed.y * 60.0 / frameRate;

        // Hitboxes
        this.topedge = this.position.y - (this.diameter / 2.0);
        this.bottomedge = this.position.y + (this.diameter / 2.0);
        this.leftedge = this.position.x - (this.diameter / 2.0);
        this.rightedge = this.position.x + (this.diameter / 2.0);

        // Boundary collisions
        if (this.topedge <= 0.0 && this.speed.y < 0.0)
            this.speed.y *= -1.0;
        else if ((this.leftedge <= 0.0 && this.speed.x < 0.0) ||
            (this.rightedge >= width && this.speed.x > 0.0))
            this.speed.x *= -1.0;

        // Pad Collision
        if (this.trackedPad != null) {
            if (this.bottomedge >= this.trackedPad.topedge &&
                this.bottomedge <= this.trackedPad.bottomedge &&
                this.speed.y > 0.0) {
                if (this.rightedge >= this.trackedPad.leftedge &&
                    this.leftedge <= this.trackedPad.rightedge) {
                    var ratio = (-2.0 * (this.position.x - this.trackedPad.leftedge) / (this.trackedPad.rightedge - this.trackedPad.leftedge)) + 1.0;

                    theta = 90.0 + (ratio * 45.0);

                    // Set the speed to respective values
                    this.speed.x = this.maxspeed * Math.cos(Math.degtorad(theta));
                    this.speed.y = -this.maxspeed * Math.sin(Math.degtorad(theta));

                    // Reset multiplier
                    if (MULTIPLIER >= 2)
                        SCORE += Math.floor(Math.pow(2, MULTIPLIER));
                    MULTIPLIER = 0;
                }
            }
        }

        // Respawning
        if (this.topedge > height) {
            LIVES--;
            MULTIPLIER = 0;
            // Game over and such
            if (LIVES <= 0) RESET_GAME = true;

            this.respawn();
        }

        // Block collision
        var that = this; // Yeah, I know. WTF, right?
        if (this.trackedBlocks != null) {
            this.trackedBlocks.forEach(function(block) {
                if (that.intersectsBlock(block)) {
                    var touched = false;
                    // Left collision
                    if ((that.rightedge >= block.leftedge &&
                            that.rightedge < block.position.x &&
                            that.speed.x > 0.0)
                        // Right collision
                        ||
                        (that.leftedge <= block.rightedge &&
                            that.leftedge > block.position.x &&
                            that.speed.x < 0.0)) {
                        that.speed.x *= -1.0;
                        touched = true;
                    }

                    // Top collision
                    if ((that.bottomedge >= block.topedge &&
                            that.bottomedge < block.position.y &&
                            that.speed.y > 0.0)
                        // Bottom collision
                        ||
                        (that.topedge <= block.bottomedge &&
                            that.topedge > block.position.y &&
                            that.speed.y < 0.0)) {
                        that.speed.y *= -1.0;
                        touched = true;
                    }

                    if (touched) {
                        var gain = RUMBLE ? 20 : 10;
                        SCORE += gain + (MULTIPLIER >= 2 ? gain * MULTIPLIER : 0);
                        if (MULTIPLIER < 4) MULTIPLIER++;
                        that.removalBlocks.push(block);
                    }
                }
            });
        }

        // Remove blocks from collection
        while (this.removalBlocks.length > 0) {
            var idx = this.trackedBlocks.indexOf(this.removalBlocks[this.removalBlocks.length - 1]);
            this.trackedBlocks.splice(idx, 1);
            this.removalBlocks.pop();
        }
    };
Ball.prototype.respawn =
    function() {
        var height = canvas.height;
        this.stopped = true;
        this.speed.x = 0.0;
        this.speed.y = 0.0;
        this.position.y = 21.0 * height / 24.0;
        if (this.trackedPad != null)
            this.position.x = this.trackedPad.position.x;
        this.afterImages = [];
    };
Ball.prototype.draw =
    function() {
        // Afterimages
        var opacity = 2.0;
        var that = this;
        this.afterImages.forEach(function(value, index, array) {
            opacity *= 2.0;
            ctx.beginPath();
            ctx.arc(value.x, value.y, that.diameter / 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, " + (opacity / 255.0) + ")";
            ctx.fill();
            ctx.closePath();
        });

        // Ball itself
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.diameter / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#' + this.c.toString(16);
        ctx.fill();
        ctx.closePath();
    };
Ball.prototype.intersectsBlock =
    function(block) {
        var compare_point = new vec2();
        compare_point.x = Math.clamp(this.position.x, block.leftedge, block.rightedge);
        compare_point.y = Math.clamp(this.position.y, block.topedge, block.bottomedge);
        // Shall we use square distance instead of distance?
        // JavaScript is already expensive enough.
        if ((Math.pow(this.position.x - compare_point.x, 2) +
                Math.pow(this.position.y - compare_point.y, 2)) <= Math.pow(this.diameter / 2.0, 2))
            return true;
        return false;
    };


// Pad class
function Pad() {
    var width = canvas.width;
    var height = canvas.height;

    this.position = new vec2(width / 2, 11 * height / 12.0);
    this.size = new vec2(width * 0.12, height * 0.034723);
    this.truemaxspeed = height / 72.0 * 0.75;
};
Pad.prototype.position = new vec2(0.0, 0.0);
Pad.prototype.size = new vec2(0.0, 0.0);
Pad.prototype.c = "#FFF";
Pad.prototype.xspeed = 0.0;
Pad.prototype.tracking = false;
Pad.prototype.maxspeed = 0.0;
Pad.prototype.truemaxspeed = 0.0;
Pad.prototype.topedge = 0.0;
Pad.prototype.bottomedge = 0.0;
Pad.prototype.leftedge = 0.0;
Pad.prototype.rightedge = 0.0;
Pad.prototype.TrackInput =
    function() {
        this.tracking = true;
    };
Pad.prototype.UntrackInput =
    function() {
        this.tracking = false;
    };
Pad.prototype.setPosition =
    function(x) {
        var width = canvas.width;
        this.position.x = Math.clamp(x, this.size.x / 2.0, width - (this.size.x / 2.0));
    };
Pad.prototype.update =
    function() {
        var width = canvas.width;
        var frameRate = 60.0; // deal. with. it.

        if (this.tracking) {
            // Keyboard stuff
            var displaceX = 0.0;
            displaceX += pressingRight ? 1.0 : 0.0;
            displaceX -= pressingLeft ? 1.0 : 0.0;
            this.maxspeed = this.truemaxspeed + (this.truemaxspeed * (pressingA ? 1.0 : 0.0));

            // Controller override
            displaceX = (leftStick == 0.0) ? displaceX : leftStick;
            this.maxspeed = (rightTrigger == 0.0) ? this.maxspeed : (this.truemaxspeed + (this.truemaxspeed * rightTrigger));

            this.position.x += this.maxspeed * displaceX * 60.0 / frameRate;
        }
        this.position.x = Math.clamp(this.position.x, this.size.x / 2, width - (this.size.x / 2));

        // Boundaries
        this.topedge = this.position.y - (this.size.y / 2.0);
        this.bottomedge = this.position.y + (this.size.y / 2.0);
        this.leftedge = this.position.x - (this.size.x / 2.0);
        this.rightedge = this.position.x + (this.size.x / 2.0);

    };
Pad.prototype.draw =
    function() {
        ctx.beginPath();
        ctx.rect(this.position.x - (this.size.x / 2),
            this.position.y - (this.size.y / 2),
            this.size.x, this.size.y);
        ctx.fillStyle = this.c;
        ctx.fill();
        ctx.closePath();
    };

// -------------------

// Ball
var ball = new Ball();

// Paddle
var pad = new Pad();

// Block test
var blockList = [];

function BuildLevel(lvlLayout) {
    var width = canvas.width;
    var height = canvas.height;

    var blocksize = new vec2(width * 0.06, height * 0.0520845);
    var gridStart = new vec2(blocksize.x / 2.0, blocksize.y / 2.0);

    gridStart.x += blocksize.x / 4;
    gridStart.y += blocksize.y / 2;

    var maxXblocks = Math.floor(width / blocksize.x);
    var maxYblocks = Math.floor(height / blocksize.y) / 2;

    blockList = [];
    for (i = 0; i < lvlLayout.length; i++) {
        var ypos = Math.floor(lvlLayout[i] / maxXblocks);
        var xpos = lvlLayout[i] - (ypos * maxXblocks);

        if (RUMBLE && LEVEL < 9) {
            xpos = maxXblocks - xpos - 1;
            ypos = maxYblocks - ypos + 1;
        }

        blockList.push(new Block(gridStart.x + (xpos * blocksize.x),
            gridStart.y + (ypos * blocksize.y)));
    }
}

function checkResetGame() {
    if (!RESET_GAME) return;
    if (SCORE > HIGHSCORE) {
        HIGHSCORE = SCORE;
        // At least we can save high score here right?
        localStorage.setItem("highscore", HIGHSCORE);
    }
    LEVEL = -1;
    SCORE = 0;
    LIVES = 5;
    blockList = [];
    SHOWTUTORIAL = true;
    RUMBLE = false;
    RESET_GAME = false;
}

function displayHUD() {
    var width = canvas.width;
    var height = canvas.height;

    var ballDiameter = height * 0.034723;
    var ballRadius = ballDiameter / 2;
    for (i = 0; i < LIVES; i++) {
        ctx.beginPath();
        ctx.arc((width - ballDiameter) - ((ballDiameter + 5) * i),
            (height - ballDiameter),
            ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "white"
        ctx.fill();
        ctx.closePath();
    }

    // Text
    ctx.fillStyle = "white";

    // Level name
    ctx.textAlign = "left";
    setFontSize(16);

    switch (LEVEL) {
        case 0:
            LEVELNAME = "Starter";
            break;
        case 1:
            LEVELNAME = "Three Ways";
            break;
        case 2:
            LEVELNAME = "Diamond";
            break;
        case 3:
            LEVELNAME = "Smiley";
            break;
        case 4:
            LEVELNAME = "Stickmen";
            break;
        case 5:
            LEVELNAME = "Stairway to Heaven";
            break;
        case 6:
            LEVELNAME = "Fortress";
            break;
        case 7:
            LEVELNAME = "Bow & Arrow";
            break;
        case 8:
            LEVELNAME = "Full House";
            break;
        case 9:
            LEVELNAME = "This is Not the End";
            break;
    }

    if (RUMBLE) {
        if (LEVEL == 9) LEVELNAME = "Thanks for Playing";
        else if (LEVEL == 10) LEVELNAME = "Bonus Stage";
        else LEVELNAME = "Mirror " + LEVELNAME;
    }

    ctx.fillText("Level " + LEVEL + ": " + LEVELNAME,
        ballRadius, height - ballRadius);

    // Score
    ctx.textAlign = "center";
    var ScoreText = function(score) {
        var s = "0000000000" + score;
        return s.substr(s.length - 10);
    }
    ctx.fillText(ScoreText(SCORE), width / 2, height - ballRadius);

    // Multiplier
    if (MULTIPLIER >= 2)
        ctx.fillText("Chain Bonus x" + MULTIPLIER, (3 * width / 4), height - ballRadius);

    // Tutorial
    if (SHOWTUTORIAL) {
        // Credits
        ctx.textAlign = "end"
        setFontSize(12);
        ctx.fillText("©2016 IronPlay", width, ballDiameter);

        // High Score
        ctx.textAlign = "center";
        setFontSize(16);
        ctx.fillText("HIGH SCORE: " + ScoreText(HIGHSCORE), width / 2, height / 4);

        // Title
        setFontSize(32);
        ctx.fillText("SUPER BRICKBREAK", width / 2, height / 2);
        setFontSize(12);
        ctx.textAlign = "end";
        ctx.fillText("Online Edition", (11 * width / 16),
            (height / 2) + (25 / 720 * height));

        setFontSize(16);
        ctx.textAlign = "center";
        var lineHeight = height * 0.038888889;

        /*var tutorialLines = [
            "       LEFT/RIGHT, MOUSE = MOVE PADDLE             ",
            "     S, LEFT MOUSE CLICK = RELEASE BALL            ",
            "                  HOLD A = FASTER PADDLE           ",
            "                   ENTER = PAUSE                   "
        ];*/
        var tutorialLines = [
            "  KEYBOARD  &   MOUSE    |  X360 PAD  |    ACTION     ",
            "------------------------------------------------------",
            " LEFT/RIGHT    MOVEMENT  | LEFT STICK | MOVE PADDLE   ",
            "      S       LEFT CLICK |     A      | RELEASE BALL  ",
            "   HOLD A         -      |     RT     | FASTER PADDLE ",
            "    ENTER         -      |    START   | PAUSE         "
        ];

        var startY = (13 * height / 16) - (lineHeight * (tutorialLines.length - 1));

        for (i = 0; i < tutorialLines.length; i++) {
            ctx.fillText(tutorialLines[i],
                width / 2, startY + (i * lineHeight));
        }
    }

    // Paused
    if (PAUSED) {
        setFontSize(32);
        ctx.textAlign = "center";
        ctx.fillText("PAUSE", width / 2, height / 2);
    }
}

function updateInput() {
    // Store old synced states
    oldPressingS = pressingS;
    oldPressingEnter = pressingEnter;
    oldPressingLMB = pressingLMB;
    oldPressingQ = pressingQ;

    // Sync from async input
    pressingLeft = asyncPressingLeft;
    pressingRight = asyncPressingRight;
    pressingA = asyncPressingA;
    pressingS = asyncPressingS;
    pressingEnter = asyncPressingEnter;
    pressingLMB = asyncPressingLMB;
    pressingQ = asyncPressingQ;

    // Get pressed events comparing old and new synced states
    pressedS = !oldPressingS && pressingS;
    pressedEnter = !oldPressingEnter && pressingEnter;
    pressedLMB = !oldPressingLMB && pressingLMB;
    pressedQ = !oldPressingQ && pressingQ;

    // Gamepad stuff
    var gamepads = navigator.getGamepads();
    if(gamepads[0] != null) {
        var gamePad = gamepads[0];
        leftStick = Math.abs(gamePad.axes[0]) < leftStickDeadZone ? 0.0 : gamePad.axes[0];
        rightTrigger = gamePad.buttons[7].value;

        // Old states, new states
        oldPressingGamepadA = pressingGamepadA;
        oldPressingGamepadStart = pressingGamepadStart;
        pressingGamepadA = gamePad.buttons[0].pressed;
        pressingGamepadStart = gamePad.buttons[9].pressed;
        // Button single presses
        pressedGamepadA = !oldPressingGamepadA && pressingGamepadA;
        pressedGamepadStart = !oldPressingGamepadStart && pressingGamepadStart;
    }
    else {
        leftStick = 0.0;
        rightTrigger = 0.0;
        oldPressingGamepadA = false;
        pressingGamepadA = false;
        oldPressingGamepadStart = false;
        pressingGamepadStart = false;
        pressedGamepadA = false;
        pressedGamepadStart = false;
    }
}

// Initialization stuff
function initialize() {
    // Retrieve High Score
    var highscore = localStorage.getItem("highscore");
    if (highscore != null) HIGHSCORE = highscore;

    pad.TrackInput();
    ball.TrackPad(pad);
}

// Update routines
function update() {
    updateInput();
    ball.TrackBlocks(blockList);

    if (!PAUSED) {
        // Update paddle, ball, and blocks
        pad.update();
        ball.update();
        blockList.forEach(function(block) {
            block.update();
        });

        // Wake ball up, hide tutorial if necessary
        if (pressedS || pressedLMB || pressedGamepadA) {
            ball.wakeUp();
            SHOWTUTORIAL = false;
        }
    }

    // Pause/unpause when required
    if ((pressedEnter || pressedGamepadStart) && !SHOWTUTORIAL)
        PAUSED = !PAUSED;

    // Programatically hide or show cursor.
    // We don't want it hidden when the game is paused,
    // or tutorial is shown.
    canvas.style.cursor =
        (SHOWTUTORIAL || PAUSED) ? "default" : "none";

    // If level is cleared, move up to the next
    if (blockList.length == 0) {
        if (LEVEL < (RUMBLE ? 10 : 9)) LEVEL++;
        else {
            LEVEL = 0;
            RUMBLE = !RUMBLE;
        }

        // Win some points for it
        if (LEVEL > 0) SCORE += RUMBLE ? 1000 : 500;

        // Reset some stuff, build next level
        ball.respawn();
        if (LEVEL != 10) BuildLevel(levels[LEVEL]);
        // Bonus stage
        else BuildLevel(function() {
            var bonusStage = [];
            var amount = 10 + Math.floor(Math.random() * 166);
            while (amount >= 0) {
                var randomblock = Math.floor(Math.random() * 176);
                bonusStage.push(randomBlock);
                amount--;
            }
            return bonusStage;
        });
    }

    // Clamp score
    SCORE = Math.clamp(SCORE, 0, 9999999999);

    // Check if game needs to be reset
    checkResetGame();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pad.draw();
    ball.draw();
    blockList.forEach(function(block) {
        block.draw();
    });
    displayHUD();
}


// Input related
document.addEventListener("keydown",
    function(e) {
        if (e.keyCode == 39) asyncPressingRight = true;
        else if (e.keyCode == 37) asyncPressingLeft = true;
        else if (e.keyCode == 83) asyncPressingS = true;
        else if (e.keyCode == 65) asyncPressingA = true;
        else if (e.keyCode == 13) asyncPressingEnter = true;
        else if (e.keyCode == 81) asyncPressingQ = true;
    }, false);

document.addEventListener("keyup",
    function(e) {
        if (e.keyCode == 39) asyncPressingRight = false;
        else if (e.keyCode == 37) asyncPressingLeft = false;
        else if (e.keyCode == 83) asyncPressingS = false;
        else if (e.keyCode == 65) asyncPressingA = false;
        else if (e.keyCode == 13) asyncPressingEnter = false;
        else if (e.keyCode == 81) asyncPressingQ = false;
    }, false);

document.addEventListener("mousemove",
    function(e) {
        if (!PAUSED) {
            var rect = canvas.getBoundingClientRect();
            mousePos.x = e.clientX - rect.left;
            mousePos.y = e.clientY - rect.top;
            pad.setPosition(mousePos.x);
        }
    }, false);

document.addEventListener("mousedown",
    function(e) {
        if (e.which == 1) asyncPressingLMB = true;
    }, false);

document.addEventListener("mouseup",
    function(e) {
        if (e.which == 1) asyncPressingLMB = false;
    }, false);

document.addEventListener("resize",
    function() {
        fitViewport(canvas);
    }, false);


// More system stuff
function gameLoop() {
    update();
    draw();
}
initialize();
setInterval(gameLoop, FRAMETIME);


// Finally, the levels
// Visual formations for levels got messed up when porting so whatever.
var levels = [
    // Level 0: Starter
    [84, 87, 90],
    // Level 1: Three Ways
    [0, 1, 2, 3, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19, 22, 23, 24, 25,
        28, 29, 30, 31
    ],

    // Level 2: Diamond
    [23, 38, 39, 40, 53, 54, 55, 56, 57, 68, 69, 70, 71, 72, 73, 74, 85, 86,
        87, 88, 89, 102, 103, 104, 119
    ],

    // Level 3: Smiley
    [6, 7, 8, 21, 22, 23, 24, 25, 37, 39, 41, 52, 53, 55, 57, 58, 68, 69, 70,
        71, 72, 73, 74, 84, 87, 90, 100, 101, 105, 106, 117, 118, 120, 121, 134,
        135, 136, 151
    ],

    // Level 4: Stickmen
    [2, 7, 12, 17, 19, 22, 24, 27, 29, 33, 35, 38, 40, 43, 45, 50, 55, 60, 66,
        71, 76, 81, 82, 83, 86, 87, 88, 91, 92, 93, 96, 98, 100, 101, 103, 105,
        106, 108, 110, 114, 119, 124, 129, 131, 134, 136, 139, 141, 145, 147, 150,
        152, 155, 157, 161, 163, 166, 168, 171, 173
    ],

    // Level 5: Stairway to Heaven
    [0, 1, 2, 3, 4, 5, 6, 10, 11, 12, 16, 17, 18, 19, 20, 21, 25, 26, 27, 31,
        32, 33, 34, 35, 36, 40, 41, 42, 46, 47, 48, 49, 50, 51, 55, 56, 57, 61, 62,
        63, 64, 65, 66, 70, 71, 72, 76, 77, 78, 79, 80, 81, 85, 86, 87, 91, 92, 93,
        94, 95, 96, 100, 101, 102, 106, 107, 108, 109, 110, 111, 115, 116, 117,
        121, 122, 123, 124, 125, 126, 127
    ],

    // Level 6: Fortress
    [0, 1, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 20, 27, 30, 31, 32, 33,
        36, 38, 39, 40, 41, 43, 46, 47, 48, 49, 52, 54, 55, 56, 57, 59, 62, 63, 64,
        65, 68, 70, 71, 72, 73, 75, 78, 79, 80, 81, 84, 86, 87, 88, 89, 91, 94, 95,
        96, 97, 100, 102, 103, 104, 105, 107, 110, 111, 112, 113, 116, 123, 126,
        127, 128, 129, 132, 133, 134, 135, 136, 137, 138, 139, 142, 143, 160, 161,
        162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175
    ],

    // Level 7: Bom & Arrow
    [0, 2, 7, 17, 19, 23, 24, 25, 32, 34, 36, 39, 42, 45, 49, 51, 53, 55, 58,
        61, 62, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
        81, 83, 85, 87, 90, 93, 94, 96, 98, 100, 103, 106, 109, 113, 115, 119, 120,
        121, 128, 130, 135
    ],

    // Level 8: Full House
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
        59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77,
        78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
        97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112,
        113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127,
        128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142,
        143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157,
        158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172,
        173, 174, 175
    ],

    // Level 9: Bye-Bye
    [34, 35, 38, 40, 42, 43, 44, 50, 52, 54, 56, 58, 66, 67, 71, 74, 75, 76,
        82, 84, 87, 90, 98, 99, 103, 106, 107, 108
    ]
];