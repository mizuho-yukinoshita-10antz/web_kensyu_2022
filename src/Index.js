let bgm = new Audio(audioPath + "title_bgm.mp3");
bgm.autoplay = true;
bgm.loop = true;
window.onload = onLoad;

function onLoad() {
    let canvas = $("#titleCanvas")[0].getContext("2d");
    canvas.strokeStyle = "black";
    canvas.strokeRect(0, 0, mainFieldSize.x, mainFieldSize.y);
    bgm.play().catch(() => HTMLUtils.onInteractOnce($(document),() => bgm.play()));
    $("#startButton").on("click", () => location.href = "game.html");
}