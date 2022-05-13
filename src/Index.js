window.onload = onLoad;

function onLoad(){
    let startButton = $("#startButton");
    startButton.on("click", () => location.href = "game.html");
}