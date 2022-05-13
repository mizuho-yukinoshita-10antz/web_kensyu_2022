let gameCanvas = $("#gameCanvas");

let fieldWidth = mainFieldSize.x + nextFieldSize.x;
gameCanvas.attr("width",fieldWidth);
gameCanvas.attr("height",mainFieldSize.y);
gameCanvas.height(mainFieldSize.y);

function setHTMLPosition(html, top, left) {
    $(html).css("top", `${top}px`);
    $(html).css("left", `${left}px`);
}

setHTMLPosition("#startButton", mainFieldSize.y / 2 - 50, mainFieldSize.x / 2 - 60);
setHTMLPosition("#titleButton", mainFieldSize.y / 2 + 50, mainFieldSize.x / 2 - 50);