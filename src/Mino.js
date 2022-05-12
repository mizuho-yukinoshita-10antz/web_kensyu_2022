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
}

class MinoData {
    vertices = [];
    color = "";

    constructor(vertices, color) {
        this.vertices = Array.from(vertices);
        this.color = color;
    }

    static forge(x1, y1, x2, y2, x3, y3, x4, y4, color) {
        let vertices = [new Vector2(x1, y1), new Vector2(x2, y2), new Vector2(x3, y3), new Vector2(x4, y4)];
        return new MinoData(vertices, color);
    }
    
    copy() {
        return new MinoData(this.vertices, this.color);
    }

    validPosition(position, fieldArray){
        for(let i=0; i<4; i++) {
            let vertexPosition = Vector2.sum(this.vertices[i], position);
            if(vertexPosition.x < 0 || vertexPosition.y < 0 || vertexPosition.x >= mainCellCount.x || vertexPosition.y >= mainCellCount.y || fieldArray[vertexPosition.y][vertexPosition.x] !== "black") {
                return false;
            }
        }
        return true;
    }


}

//テトロミノクラス
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
    data = null;

    constructor(data){
        this.data = data.copy();   //７種類の中からランダムに選択
    }

    static randomMino() {
        let allData = Object.values(this.types);
        return new Mino(allData[Math.floor(Math.random() * allData.length)]);
    }

    getPosition() {
        return new Vector2(this.position.x, this.position.y);
    }

    move(displacement, fieldArray) {
        let destination = Vector2.sum(this.position, displacement);
        if(this.data.validPosition(destination, fieldArray)) {
            this.position = destination;
            return true;
        }
        return false;
    }
}