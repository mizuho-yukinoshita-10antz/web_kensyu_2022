let bgm = new Audio(audioPath + "game_bgm.mp3");
bgm.addEventListener("ended", () => bgm.play());
let gameOverAudio = new Audio(audioPath + "game_over.mp3");
let minoInAudio = new Audio(audioPath + "mino_in.mp3");
let deletionAudio = new Audio(audioPath + "deletion.mp3");
let canvas = $("#gameCanvas")[0].getContext("2d");
let fieldArray = [];
let minoArray = [];

let _score = 0;
function getScore() {
    return _score;
}
function setScore(value) {
    _score = value;
    updateScoreText();
}

let timer1, timer2, timer3;
let fastDownEnabled = false;

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
    bgm.currentTime = 0;

    fieldArray = [];
    for (let y = 0; y < mainCellCount.y; y++) {
        let sub = [];
        for (let x = 0; x < mainCellCount.x; x++) {
            sub.push("black");
        }
        fieldArray.push(sub);
    }

    minoArray = Array(nextMinoCount + 1).fill(0).map(() => Model.randomMino());
}

function onLoad(){
    clearMainField();
    $("#pauseButton").on("click", pauseGame);
    $("#titleButton").on("click", () => location.href = "index.html");
    gameStart();
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


function resumeGame() {
    $('.menuButton').css("visibility", "hidden");   //スタートボタン非表示
    $(document).on("keydown", keyDown);
    $(document).on("keyup", keyUp);
    $('#pauseButton').on("click", pauseGame);

    drawNextMinos();
    bgm.play();

    timer1 = setInterval(drawMainField, 1000 / refreshRate);
    timer2 = setInterval(fastDown, fastDownInterval);
    timer3 = setInterval(normalDown, normalDownInterval);
}

function gameStart(){
    resetGame();
    resumeGame();
}

function keyDown(e){
    let afterMino = currentMino().data.copy();
    let position = currentMino().getPosition();

    if(e.key==="ArrowRight" || e.key==="Right"){
        position.x += 1;
    }
    if(e.key==="ArrowLeft" || e.key==="Left"){
        position.x -= 1;
    }
    if(e.key==="ArrowUp" || e.key==="Up"){
        afterMino.vertices = afterMino.vertices.map(v => new Vector2(-v.y, v.x));
    }
    if(e.key===" "){
        afterMino.vertices = afterMino.vertices.map(v => new Vector2(v.y, -v.x));
    }
    if(e.key==="ArrowDown" || e.key==="Down"){
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
    minoArray.push(Model.randomMino());
    minoInAudio.play();
    if (!currentMino().move(new Vector2(0, 1), fieldArray)) {
        gameOver();
    }
    drawNextMinos();
}

function rebindButton(html, events, handler, htmlString=null) {
    let button = $(html);
    button.off(events);
    button.on(events, handler);
    if (htmlString !== null) {
        button.html(htmlString);
    }
}

function pauseGame() {
    drawMainField();
    bgm.pause();
    clearInterval(timer1);
    clearInterval(timer2);
    clearInterval(timer3);
    $(document).off("keydown");
    $(document).off("keyup");
    rebindButton("#startButton", "click", resumeGame, "RESUME");
    $(".menuButton").css('visibility', 'visible');
}

function gameOver(){
    pauseGame();
    gameOverAudio.play();
    rebindButton("#startButton", "click", gameStart, "START");
}

function updateScoreText() {
    $("#scoreText").html("SCORE: " + getScore());
}