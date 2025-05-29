// 淡江教科系 Teaching Tetris 遊戲
let video;
let facemesh;
let predictions = [];

let handpose;
let handPredictions = [];

let blocks = []; // 存放所有掉落中的方塊
let categories = ["教育基礎", "教學實務", "評量研究", "教育趨勢"];
let activeBlock;
let dropSpeed = 2;
let gesture = "";
let score = 0;

function setup() {
  createCanvas(640, 480).position((windowWidth - 640) / 2, (windowHeight - 480) / 2);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => predictions = results);

  handpose = ml5.handpose(video, handModelReady);
  handpose.on('predict', results => handPredictions = results);

  newBlock();
}

function modelReady() {}
function handModelReady() {}

function draw() {
  image(video, 0, 0, width, height);
  drawDropZones();

  // 手勢判斷
  if (handPredictions.length > 0) {
    const hand = handPredictions[0];
    gesture = detectGesture(hand.landmarks);
    drawHandPoints(hand.landmarks);
  }

  // 移動方塊
  if (activeBlock) {
    if (gesture === "剪刀") activeBlock.x -= 5;
    else if (gesture === "布") activeBlock.x += 5;
    else if (gesture === "石頭") activeBlock.y += dropSpeed * 2;

    activeBlock.y += dropSpeed;

    // 降落到分類區
    if (activeBlock.y > height - 50) {
      let zoneWidth = width / categories.length;
      let index = floor(activeBlock.x / zoneWidth);
      if (categories[index] === activeBlock.category) {
        score++;
      }
      newBlock();
    }

    drawBlock(activeBlock);
  }

  // 畫分數
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("分數: " + score, 10, 10);
}

function newBlock() {
  let categoryIndex = floor(random(categories.length));
  let label = "";
  switch (categories[categoryIndex]) {
    case "教育基礎": label = "建構主義"; break;
    case "教學實務": label = "學習單"; break;
    case "評量研究": label = "問卷設計"; break;
    case "教育趨勢": label = "文化資本"; break;
  }
  activeBlock = {
    x: random(50, width - 50),
    y: 0,
    label: label,
    category: categories[categoryIndex]
  };
}

function drawBlock(block) {
  fill(255, 204, 0);
  rect(block.x, block.y, 100, 40, 8);
  fill(0);
  textAlign(CENTER, CENTER);
  text(block.label, block.x + 50, block.y + 20);
}

function drawDropZones() {
  let zoneWidth = width / categories.length;
  for (let i = 0; i < categories.length; i++) {
    noFill();
    stroke(255);
    rect(i * zoneWidth, height - 50, zoneWidth, 50);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text(categories[i], i * zoneWidth + zoneWidth / 2, height - 25);
  }
}

function drawHandPoints(landmarks) {
  for (let i = 0; i < landmarks.length; i++) {
    const [x, y] = landmarks[i];
    fill(0, 255, 0);
    noStroke();
    ellipse(x, y, 10, 10);
  }
}

function detectGesture(landmarks) {
  let isIndexExtended = landmarks[8][1] < landmarks[6][1];
  let isMiddleExtended = landmarks[12][1] < landmarks[10][1];
  let isRingExtended = landmarks[16][1] < landmarks[14][1];
  let isPinkyExtended = landmarks[20][1] < landmarks[18][1];
  let thumbExtended = landmarks[4][0] > landmarks[3][0];

  if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && !thumbExtended) {
    return "石頭";
  }
  if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended && !thumbExtended) {
    return "剪刀";
  }
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return "布";
  }
  return "";
}
