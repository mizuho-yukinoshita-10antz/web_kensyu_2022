const minoCount = new Vector2(10, 20);
const minoSize = new Vector2(25, 25);
const fieldSize = new Vector2(minoSize.x * minoCount.x, minoSize.y * minoCount.y);


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

window.onload = onLoad;

function clearField() {
    canvas.fillStyle = "#000";
    canvas.fillRect(0, 0, fieldSize.x, fieldSize.y);
}

function onLoad(){
    clearField();
    fieldArray = [];            //ゲームフィールド初期化(全部"black")
    for(let y=0; y < minoCount.y; y++){
        let sub = [];
        for(let x=0; x < minoCount.x; x++){sub.push("black");}
        fieldArray.push(sub);
    }
    minoArray = Array(4).fill(0).map(() => Mino.randomMino());
    $("#startButton").css("visibility", "visible");  //スタートボタン表示
}

//ゲームフィールドをクリアしてから描画する関数
function drawField(){
    clearField();
    for(let y=0; y<minoCount.y; y++){                    //フィールド描画
        for(let x=0; x<minoCount.x; x++){
            canvas.fillStyle = fieldArray[y][x];
            canvas.fillRect(x * minoSize.x, y * minoSize.y, minoSize.x,  minoSize.y);
            canvas.strokeStyle = "black";
            canvas.strokeRect(x * minoSize.x, y * minoSize.y, minoSize.x,  minoSize.y);
        }
    }
    for(let i=0; i<4; i++){                     //テトロミノ描画
        let data = minoArray[0].data;
        let vertex = data.vertices[i];
        canvas.fillStyle = data.color;
        let x = (vertex.x + minoArray[0].position.x) * minoSize.x;
        let y = (vertex.y + minoArray[0].position.y) * minoSize.y;
        canvas.fillRect(x, y, minoSize.x,  minoSize.y);
        canvas.strokeStyle = "black";
        canvas.strokeRect(x, y, minoSize.x,  minoSize.y);
    }
}

//ネクストフィールドをクリアして再描画する関数
function drawNext(){
    canvas.fillStyle = "#008";
    canvas.fillRect(250, 0, 100, 500);
    for(let i=1; i<4; i++){
        let data = minoArray[i].data;
        canvas.fillStyle = data.color;
        for(let j=0; j<4; j++){
            let vertex = data.vertices[j];
            let x = (vertex.x + 1) * 15 + 260;
            let y = (vertex.y + i * 5 - 2) * 15;
            canvas.fillRect(x, y, 15, 15);
            canvas.strokeStyle = "white";
            canvas.strokeRect(x, y, 15, 15);
        }
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
    drawNext();                                                     //ネクストフィールド描画
    timer1 = setInterval(drawField, 10);                            //セットインターバル
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
    let afterMino = minoArray[0].data.copy();
    let position = minoArray[0].getPosition();

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
        minoArray[0].data = afterMino;
        minoArray[0].position = position;
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

    let afterMino = minoArray[0].data.copy();
    let position = minoArray[0].getPosition();

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
        minoArray[0].data = afterMino;
        minoArray[0].position = position;
    }
}
function touchEnd(e){
    e.preventDefault();
    fastDown = false;
}

//高速落下を制御する関数
function highSpeedDown(){
    if(fastDown){
        let afterMino = minoArray[0].data.copy();
        let position = minoArray[0].getPosition();
        position.y += 1;
        if(isValidPosition(afterMino, position)){
            minoArray[0].data = afterMino;
            minoArray[0].position = position;
            score += 1;
            updateScoreText();
        }
        else{fixedMino();}
    }
}

//自然落下を制御する関数
function normalDown(){
    let afterMino = minoArray[0].data.copy();
    let position = minoArray[0].getPosition();
    position.y += 1;
    if(isValidPosition(afterMino, position)){
        minoArray[0].data = afterMino;
        minoArray[0].position = position;
    }
    else{fixedMino();}
}

//フィールドにテトロミノを固定する関数
function fixedMino(){
    let beforeX, beforeY, color;

    for(let i=0; i<4; i++){
        beforeX = minoArray[0].data.vertices[i].x + minoArray[0].position.x;
        beforeY = minoArray[0].data.vertices[i].y + minoArray[0].position.y;
        color = minoArray[0].data.color;
        fieldArray[beforeY][beforeX] = color;

    }

    checkLine();
    changeMino();
}

//ラインがそろっているか確認する関数
function checkLine(){
    let point = [0, 40, 100, 300, 1200];
    let lineCount = 0;
    for(let i=0; i<minoCount.y; i++){
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
        for(let j=0; j<minoCount.x; j++){
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
    let position = minoArray[0].position;
    position.y += 1;
    if(!isValidPosition(minoArray[0].data, position)) {
        gameOver();
    }
    drawNext();
}

//ゲームオーバー処理の関数
function gameOver(){
    drawField();
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