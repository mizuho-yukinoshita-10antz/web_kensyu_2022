const mainCellCount = new Vector2(10, 20);
const mainCellSize = new Vector2(25, 25);
const mainFieldSize = new Vector2(mainCellSize.x * mainCellCount.x, mainCellSize.y * mainCellCount.y);
const nextMinoCount = 3;
const nextCellSize = new Vector2(15, 15);
const nextFieldSize = new Vector2(nextCellSize.x * 6, mainFieldSize.y);


//サウンドファイルをインスタンス化
let bgm = new Audio("resource/bgm.wav");
bgm.addEventListener("ended", () => bgm.play());
let gameOverAudio = new Audio("resource/gameover.wav");

let canvas = $("#gameCanvas")[0].getContext("2d");

let fieldArray = [];    //ゲームフィールドの状態を格納
let minoArray = [];     //操作するテトロミノとNext表示の３つを格納
let score;              //スコアを格納
let fastDown = false;  //ダウンキー状態初期値
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

function onLoad(){
    clearMainField();
    fieldArray = [];            //ゲームフィールド初期化(全部"black")
    for(let y=0; y < mainCellCount.y; y++){
        let sub = [];
        for(let x=0; x < mainCellCount.x; x++){sub.push("black");}
        fieldArray.push(sub);
    }
    minoArray = Array(nextMinoCount + 1).fill(0).map(() => Mino.randomMino());
    $("#startButton").css("visibility", "visible");  //スタートボタン表示
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

//ゲームフィールドをクリアしてから描画する関数
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

//ネクストフィールドをクリアして再描画する関数
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

//ゲームスタート関数
function gameStart(){
    score = 0;
    fastDown = false;
    $('#startButton').css("visibility", "hidden");   //スタートボタン非表示
    //bgm.play();
    $(document).on("keydown", keyDown);
    $(document).on("keyup", keyUp);
    $(document).on("touchstart", {passive:false}, touchStart);
    $(document).on("touchend", {passive:false}, touchEnd);
    $('#backButton').on("touchstart", gameOver);
    drawNextMinos();                                                     //ネクストフィールド描画
    timer1 = setInterval(drawMainField, 10);                            //セットインターバル
    timer2 = setInterval(highSpeedDown, 80);
    timer3 = setInterval(normalDown, gameSpeed);
}

//移動(回転)可能判定をする関数
function isValidPosition(data, position){
    for(let i=0; i<4; i++) {
        let destination = Vector2.sum(data.vertices[i], position);
        if(destination.x < 0 || destination.y < 0 || destination.x > 9 || destination.y > 19 || fieldArray[destination.y][destination.x] !== "black") {
            return false;
        }
    }
    return true;
}

//イベントハンドラー(キーボード)
function keyDown(e){                                //キーが押されたとき
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
        fastDown = true;
    }

    if(isValidPosition(afterMino, position)){
        currentMino().data = afterMino;
        currentMino().position = position;
    }
}
function keyUp(e){                                  //キーが離されたとき
    if(e.key==="ArrowDown" || e.key==="Down"){        //下キー(リリースで落下加速False)
        fastDown = false;
    }
}

//イベントハンドラー(スマホタップ)
let startX = 0;
let startY = 0;
function touchStart(e){
    e.preventDefault();
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;

    let afterMino = currentMino().data.copy();
    let position = currentMino().getPosition();

    if(startY<500 && startY>200 && startX>85 && startX<165){
        afterMino.vertices = afterMino.vertices.map(v => new Vector2(-v.y, v.x));
    }
    if(startY>200 && startX<80){
        position.x -= 1;
    }
    if(startY>200 && startX>170){
        position.x += 1;
    }
    if(startY>500 && startX>85 && startX<165){
        fastDown = true;
    }
    if(isValidPosition(afterMino, position)){
        currentMino().data = afterMino;
        currentMino().position = position;
    }
}
function touchEnd(e){
    e.preventDefault();
    fastDown = false;
}

//高速落下を制御する関数
function highSpeedDown(){
    if(fastDown){
        let afterMino = currentMino().data.copy();
        let position = currentMino().getPosition();
        position.y += 1;
        if(isValidPosition(afterMino, position)){
            currentMino().data = afterMino;
            currentMino().position = position;
            score += 1;
            updateScoreText();
        }
        else{fixedMino();}
    }
}

//自然落下を制御する関数
function normalDown(){
    let afterMino = currentMino().data.copy();
    let position = currentMino().getPosition();
    position.y += 1;
    if(isValidPosition(afterMino, position)){
        currentMino().data = afterMino;
        currentMino().position = position;
    }
    else{fixedMino();}
}

//フィールドにテトロミノを固定する関数
function fixedMino(){
    let beforeX, beforeY, color;

    for(let i=0; i<4; i++){
        beforeX = currentMino().data.vertices[i].x + currentMino().position.x;
        beforeY = currentMino().data.vertices[i].y + currentMino().position.y;
        color = currentMino().data.color;
        fieldArray[beforeY][beforeX] = color;

    }

    checkLine();
    changeMino();
}

//ラインがそろっているか確認する関数
function checkLine(){
    let point = [0, 40, 100, 300, 1200];
    let lineCount = 0;
    for(let i=0; i<mainCellCount.y; i++){
        if(fieldArray[i].indexOf("black")===-1){lineCount++;}
    }
    score += point[lineCount];
    updateScoreText();

    for(let i=19; i>=0; i--){
        if(fieldArray[i].indexOf("black")===-1){
            fieldArray.splice(i, 1);
            //delSound.play();
        }
    }
    for(let i=0; i<lineCount; i++){
        let sub = [];
        for(let j=0; j<mainCellCount.x; j++){
            sub.push("black");
        }
        fieldArray.unshift(sub);
    }
}

//固定したテトロミノをリストから削除＆新テトロミノをインスタンス化する関数
function changeMino(){
    minoArray.shift();
    minoArray.push(Mino.randomMino());
    //inSound.play();
    let position = currentMino().position;
    position.y += 1;
    if(!isValidPosition(currentMino().data, position)) {
        gameOver();
    }
    drawNextMinos();
}

//ゲームオーバー処理の関数
function gameOver(){
    drawMainField();
    bgm.pause();
    bgm.currentTime = 0;
    //gameOver.play();
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
    $("#scoreText").html("SCORE: " + score);
}