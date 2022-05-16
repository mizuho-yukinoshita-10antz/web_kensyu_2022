window.onload = onLoad;

function onLoad(){
    let canvas = $("#titleCanvas")[0].getContext("2d");
    canvas.strokeStyle = "black";
    canvas.strokeRect(0, 0, mainFieldSize.x, mainFieldSize.y);

    $("#startButton").on("click", () => location.href = "game.html");
}