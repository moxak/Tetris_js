// Tetris
// move left : A
// move right: D
// turn left : O
// turn right: P
// drop      : Enter

class Block {
    constructor(x, y, c='#CFD8DC'){
        this.x = x;
        this.y = y;
        this.c = c;
    }
    draw() {
        push();
        let s = 40;  
        fill(this.c); 
        rect(s*this.x, s*this.y, s, s);
        pop();
    }   
}

class Mino {
    constructor(x, y, rot, shape) {
        this.x = x;
        this.y = y;
        this.rot = rot;
        this.shape = shape;
    }
    calcBlocks() {
        let blocks = [];
        const colors = {
            0:'#BA68C8', 
            1:'#EF5350',
            2:'#4CAF50',
            3:'#F57C00',
            4:'#F57C00',
            5:'#FFCA28',
            6:'#00B0FF',
            10:'#FAFAFA'
        };
        // switch
        switch(this.shape) {
            case 0: blocks = [
                new Block(-1, 0), 
                new Block(0, 0), 
                new Block(0, -1),
                new Block(1, 0)];break; // T
            case 1: blocks = [
                new Block(-1, -1), 
                new Block(0, -1), 
                new Block(0, 0),
                new Block(1, 0)];break; // Z
            case 2: blocks = [                
                new Block(-1, 0), 
                new Block(0, 0), 
                new Block(0, -1),
                new Block(1, -1)];break; // S
            case 3: blocks = [
                new Block(-1, -2), 
                new Block(-1, -1), 
                new Block(-1, 0),
                new Block(0, 0)];break; // L
            case 4: blocks = [
                new Block(0, -2), 
                new Block(0, -1), 
                new Block(-1, 0),
                new Block(0, 0)];break; // J
            case 5: blocks = [
                new Block(-1, -1), 
                new Block(-1, 0), 
                new Block(0, 0),
                new Block(0, -1)];break; // O
            case 6: blocks = [
                new Block(-2, 0), 
                new Block(-1, 0), 
                new Block(0, 0),
                new Block(1, 0)];break; // I
        }
        blocks = blocks.map(b => new Block(b.x, b.y, colors[this.shape]))
        let rot = (40000000 + this.rot) % 4;
        for(let r=0; r<rot; r++) {
            // rotate 90
            blocks = blocks.map(b => new Block(-b.y, b.x, colors[this.shape]));
        }
        blocks.forEach(b => (b.x+=this.x, b.y+=this.y, colors[this.shape]));
        return blocks;
    }
    draw() {
        let blocks = this.calcBlocks();
        for(let b of blocks) {
            b.draw();
        }
    }
    copy() {
        return new Mino(this.x, this.y, this.rot, this.shape);
    }
}

class Field {
    constructor(){
        this.tiles = [
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        this.color = '#FAFAFA'
    }
    tileAt(x, y) {
        if (x<0 || x >= 12 || y<0 || y>=21) return 1;
        return this.tiles[y][x];
    }
    putBlock(x, y) {
        this.tiles[y][x] = 1;
    }
    findLineField() {
        for(let y=0; y<20; y++) {
            let isFilled = this.tiles[y].every(t => t===1);
            if (isFilled) return y;
        }
        return -1;
    }
    cutLine(y){
        this.tiles.splice(y, 1);
        this.tiles.unshift([1,0,0,0,0,0,0,0,0,0,0,1]);
    }
    draw() {
        for(let y=0; y<21; y++) {
            for(let x=0; x<12; x++){
                if (this.tileAt(x, y) === 0) continue;
                new Block(x, y).draw();
            }
        }
    }
}

class Game {
    constructor() {
        this.mino = Game.makeMino();
        this.minoVx = 0;
        this.minoDrop = false;
        this.minoVr = 0;
        this.field = new Field();
        this.fc = 0;
    }
    static makeMino() {
        return new Mino(5, 2, 0, floor(random(0,7)));
    }
    // calculation function for collision detection
    static isMinoMovable(mino, field) {
        let blocks = mino.calcBlocks();
        return blocks.every(b => field.tileAt(b.x, b.y) === 0);
    }
    proc() {
        // fall
        if (this.minoDrop || (this.fc % 20) === 19) {
            // calculation of tetraminoes to be moved
            let futureMino = this.mino.copy();
            futureMino.y += 1;
            if (Game.isMinoMovable(futureMino, this.field)) {
                this.mino.y += 1;
            }else{
                // touch a ground
                for(let b of this.mino.calcBlocks()) {
                    this.field.putBlock(b.x, b.y);
                    this.mino = Game.makeMino();
                }
            }
            // delete
            let line;
            while ((line = this.field.findLineField()) !== -1) {
                this.field.cutLine(line);
            }
            this.minoDrop = false;
        }
        // move left and right
        if (this.minoVx !== 0) {
            // calculation of tetraminoes to be moved
            let futureMino = this.mino.copy();
            futureMino.x += this.minoVx;
            // if the destination is not blocked by a field blocks
            if (Game.isMinoMovable(futureMino, this.field)) {
                this.mino.x += this.minoVx;
            }    
            this.minoVx = 0;
        }

        // turn
        if (this.minoVr !== 0) {
            let futureMino = this.mino.copy();
            futureMino.rot += this.minoVr;
            if (Game.isMinoMovable(futureMino, this.field)) {
                this.mino.rot += this.minoVr;
            }
            this.minoVr = 0;
        }

        // draw
        background(64);
        this.mino.draw();
        this.field.draw();
        this.fc++;
    }
}
let game;

function keyPressed() {
    if (keyCode === 65) game.minoVx = -1;
    if (keyCode === 68) game.minoVx = 1;
    if (keyCode === 79) game.minoVr = -1;
    if (keyCode === 80) game.minoVr = 1;
    if (keyCode === 13) game.minoDrop = true;
}

function setup() {
    createCanvas(480, 840   );
    background(64);
    game = new Game();
}

function draw() {
    game.proc();
} 