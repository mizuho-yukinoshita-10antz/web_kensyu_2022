class Vector2 {
    x = 0;
    y = 0;

    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    static sum(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    rotate(degree) {
        let rad = degree / 180 * Math.PI;
        let cos = Math.cos(rad);
        let sin = Math.sin(rad);
        return new Vector2(Math.round(cos * this.x - sin * this.y), Math.round(sin * this.x + cos * this.y));
    }
}

class MinoData {
    vertices = [new Vector2()];
    color = "";

    constructor(vertices, color) {
        if (vertices != null) {
            this.vertices = Array.from(vertices);
        }
        this.color = color;
    }

    static forge(x1, y1, x2, y2, x3, y3, x4, y4, color) {
        let vertices = [new Vector2(x1, y1), new Vector2(x2, y2), new Vector2(x3, y3), new Vector2(x4, y4)];
        return new MinoData(vertices, color);
    }
    
    copy() {
        return new MinoData(this.vertices, this.color);
    }

    validPosition(position, boardArray){
        for(let i=0; i<4; i++) {
            let vertexPosition = Vector2.sum(this.vertices[i], position);
            if(vertexPosition.x < 0 || vertexPosition.y < 0 || vertexPosition.x >= mainCellCount.x || vertexPosition.y >= mainCellCount.y || boardArray[vertexPosition.y][vertexPosition.x] !== "black") {
                return false;
            }
        }
        return true;
    }
}

class Mino {
    static types = {
        "Z" : MinoData.forge(-1,-1, 0,-1, 0, 0, 1, 0, "red"),
        "S" : MinoData.forge(0,-1, 1,-1,-1, 0, 0, 0, "green"),
        "L" : MinoData.forge(1,-1,-1, 0, 0, 0, 1, 0, "orange"),
        "J" : MinoData.forge(-1,-1,-1, 0, 0, 0, 1, 0, "blue"),
        "O" : MinoData.forge(-1,-1, 0,-1,-1, 0, 0, 0, "yellow"),
        "T" : MinoData.forge(0,-1,-1, 0, 0, 0, 1, 0, "magenta"),
        "I" : MinoData.forge(-1, 0, 0, 0, 1, 0, 2, 0, "cyan"),
    };

    position = new Vector2(4, 0)
    data = new MinoData();

    constructor(data){
        this.data = data.copy();   //７種類の中からランダムに選択
    }

    static randomMino() {
        let allData = Object.values(this.types);
        return new Mino(allData[Math.floor(Math.random() * allData.length)]);
    }

    move(displacement, boardArray) {
        let destination = Vector2.sum(this.position, displacement);
        if(this.data.validPosition(destination, boardArray)) {
            this.position = destination;
            return true;
        }
        return false;
    }

    rotate(degree, boardArray) {
        let originData = this.data.copy();
        this.data.vertices = this.data.vertices.map(v => v.rotate(degree));
        if (!this.data.validPosition(this.position, boardArray)) {
            this.data = originData;
        }
    }
}