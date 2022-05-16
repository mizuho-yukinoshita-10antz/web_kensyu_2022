const refreshRate = 60;
const fastDownInterval = 60;
let normalDownInterval = 500;

const mainCellCount = new Vector2(10, 20);
const mainCellSize = new Vector2(30, 30);
const mainFieldSize = new Vector2(mainCellSize.x * mainCellCount.x, mainCellSize.y * mainCellCount.y);
const nextMinoCount = 3;
const nextCellSize = new Vector2(20, 20);
const nextFieldSize = new Vector2(nextCellSize.x * 6, mainFieldSize.y);

const audioPath = "/resource/audio/";

const multilinePoints = [0, 40, 60, 100, 200];