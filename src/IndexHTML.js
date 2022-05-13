
let fieldWidth = mainFieldSize.x + nextFieldSize.x;


function setHTMLPosition(html, top, left) {
    $(html).css("top", `${top}px`);
    $(html).css("left", `${left}px`);
}

setHTMLPosition("#startButton", mainFieldSize.y / 2 - 50, mainFieldSize.x / 2 - 60);
setHTMLPosition("#title", 50, mainFieldSize.x / 2 - 60);
setHTMLPosition("#authorText", mainFieldSize.y - 50, mainFieldSize.x / 2 - 50);