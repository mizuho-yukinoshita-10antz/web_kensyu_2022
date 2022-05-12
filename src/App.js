const mainCellCount = new Vector2(10, 20);
const mainCellSize = new Vector2(25, 25);
const mainFieldSize = new Vector2(mainCellSize.x * mainCellCount.x, mainCellSize.y * mainCellCount.y);
const nextMinoCount = 3;
const nextCellSize = new Vector2(15, 15);
const nextFieldSize = new Vector2(nextCellSize.x * 6, mainFieldSize.y);


//サウンドファイルをインスタンス化
const audioPath = "resource/audio/";
let bgm = new Audio(audioPath + "game_bgm.mp3");
bgm.addEventListener("ended", () => bgm.play());
let gameOverAudio = new Audio(audioPath + "game_over.mp3");
let minoInAudio = new Audio(audioPath + "mino_in.mp3");
let deletionAudio = new Audio(audioPath + "deletion.mp3");

let canvas = $("#gameCanvas")[0].getContext("2d");

let fieldArray = [];    //ゲームフィールドの状態を格納
let minoArray = [];     //操作するテトロミノとNext表示の３つを格納
let _score = 0;              //スコアを格納
function getScore() {
    return _score;
}
function setScore(value) {
    _score = value;
    updateScoreText();
}
let fastDownEnabled = false;  //ダウンキー状態初期値
let gameSpeed = 500;    //ゲーム速度初期値
let timer1, timer2, timer3;

function currentMino() {
    return minoArray[0];
}

window.onload = onLoad;

function clearMainField() {
    canvas.fillStyle = "#000";
    canvas.fillRect(0, 0, mainFieldSize.x, mainFieldSize.y);
}

function resetGame() {
    setScore(0);
    fastDownEnabled = false;
    fieldArray = [];            //ゲームフィールド初期化(全部"black")
    for (let y = 0; y < mainCellCount.y; y++) {
        let sub = [];
        for (let x = 0; x < mainCellCount.x; x++) {
            sub.push("black");
        }
        fieldArray.push(sub);
    }
    minoArray = Array(nextMinoCount + 1).fill(0).map(() => Mino.randomMino());
}

function onLoad(){
    clearMainField();
    let $startButton = $("#startButton");
    $startButton.css("visibility", "visible");  //スタートボタン表示
    $startButton.on("click", gameStart);  //スタートボタン表示
}

function drawCurrentMino() {
    currentMino().data.vertices.map(vertex => {
        canvas.fillStyle = currentMino().data.color;
        let x = (vertex.x + currentMino().position.x) * mainCellSize.x;
        let y = (vertex.y + currentMino().position.y) * mainCellSize.y;
        canvas.fillRect(x, y, mainCellSize.x, mainCellSize.y);
        canvas.strokeStyle = "black";
        canvas.strokeRect(x, y, mainCellSize.x, mainCellSize.y);
    })
}

function drawMainField(){
    clearMainField();
    for(let y=0; y<mainCellCount.y; y++){
        for(let x=0; x<mainCellCount.x; x++){
            canvas.fillStyle = fieldArray[y][x];
            canvas.fillRect(x * mainCellSize.x, y * mainCellSize.y, mainCellSize.x,  mainCellSize.y);
            canvas.strokeStyle = "black";
            canvas.strokeRect(x * mainCellSize.x, y * mainCellSize.y, mainCellSize.x,  mainCellSize.y);
        }
    }
    drawCurrentMino();
}

function clearNextField() {
    canvas.fillStyle = "#008";
    canvas.fillRect(mainFieldSize.x, 0, nextFieldSize.x, nextFieldSize.y);
}

function drawNextMinos(){
    clearNextField();
    for(let i=1; i<minoArray.length; i++){
        let data = minoArray[i].data;
        canvas.fillStyle = data.color;
        data.vertices.map(vertex => {
            let x = (vertex.x + 2) * nextCellSize.x + mainFieldSize.x;
            let y = (vertex.y + i * 5) * nextCellSize.y;
            canvas.fillRect(x, y, nextCellSize.x, nextCellSize.y);
            canvas.strokeStyle = "white";
            canvas.strokeRect(x, y, nextCellSize.x, nextCellSize.y);
        })
    }
}

function gameStart(){
    resetGame();

    $('#startButton').css("visibility", "hidden");   //スタートボタン非表示
    bgm.play();
    $(document).on("keydown", keyDown);
    $(document).on("keyup", keyUp);
    $('#backButton').on("touchstart", gameOver);
    drawNextMinos();                                                     //ネクストフィールド描画
    timer1 = setInterval(drawMainField, 10);                            //セットインターバル
    timer2 = setInterval(fastDown, 80);
    timer3 = setInterval(normalDown, gameSpeed);
}

function keyDown(e){
    let afterMino = currentMino().data.copy();
    let position = currentMino().getPosition();

    if(e.key==="ArrowRight" || e.key==="Right"){      //右キー(右移動)
        position.x += 1;
    }
    if(e.key==="ArrowLeft" || e.key==="Left"){        //左キー(左移動)
        position.x -= 1;
    }
    if(e.key==="ArrowUp" || e.key==="Up"){            //上キー(時計回転)
        afterMino.vertices = afterMino.vertices.map(v => new Vector2(-v.y, v.x));
    }
    if(e.key===" "){                                 //スペースキー(反時計回転)
        afterMino.vertices = afterMino.vertices.map(v => new Vector2(v.y, -v.x));
    }
    if(e.key==="ArrowDown" || e.key==="Down"){        //下キー(押下中落下加速True)
        fastDownEnabled = true;
    }

    if(afterMino.validPosition(position, fieldArray)){
        currentMino().data = afterMino;
        currentMino().position = position;
    }
}

function keyUp(e) {
    if(e.key==="ArrowDown" || e.key==="Down"){
        fastDownEnabled = false;
    }
}

function normalDown() {
    if(currentMino().move(new Vector2(0, 1), fieldArray)) {
        return true;
    }
    else {
        fixCurrentMino();
        return false;
    }
}

function fastDown(){
    if(!fastDownEnabled) {
        return;
    }
    if (normalDown()) {
        setScore(getScore() + 1);
    }
}

function fixCurrentMino(){
    currentMino().data.vertices.map(vertex => {
        let position = Vector2.sum(vertex, currentMino().position);
        fieldArray[position.y][position.x] = currentMino().data.color;
    })
    checkLine();
    changeMino();
}

function checkLine(){
    let point = [0, 40, 100, 300, 1200];
    fieldArray = fieldArray.filter(line => line.indexOf("black") >= 0);
    let delta = mainCellCount.y - fieldArray.length;
    if (delta > 0) {
        setScore(getScore() + point[delta]);
        deletionAudio.play();
        for(let i=0; i<delta; i++){
            let sub = [];
            for(let j=0; j<mainCellCount.x; j++){
                sub.push("black");
            }
            fieldArray.unshift(sub);
        }
    }
}

function changeMino(){
    minoArray.shift();
    minoArray.push(Mino.randomMino());
    minoInAudio.play();
    if (!currentMino().move(new Vector2(0, 1), fieldArray)) {
        gameOver();
    }
    drawNextMinos();
}

//ゲームオーバー処理の関数
function gameOver(){
    drawMainField();
    bgm.pause();
    bgm.currentTime = 0;
    gameOverAudio.play();
    clearInterval(timer1);
    clearInterval(timer2);
    clearInterval(timer3);
    $('#startButton').css('visibility', 'visible');   //スタートボタン非表示
    $(document).off("keydown");
    $(document).off("keyup");
    $(document).off("touchstart");
    $(document).off("touchend");
}

function updateScoreText() {
    $("#scoreText").html("SCORE: " + getScore());
}