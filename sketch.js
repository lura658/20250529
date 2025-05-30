let video;
let handpose;
let predictions = [];
let gameState = "start";
let startReady = false;
let correctAnswer = "A";
let startButton = { x: 220, y: 200, w: 200, h: 100 };

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("canvas-container");
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, () => console.log("Handpose ready"));
  handpose.on("predict", results => {
    predictions = results;
  });
}

function draw() {
  image(video, 0, 0, width, height);
  drawHandKeypoints();

  if (gameState === "start") {
    drawStartScreen();
    checkStartButtonTouch();
  }

  if (gameState === "question") {
    drawQuestion();
    checkAnswer();
  }
}

function drawStartScreen() {
  fill(0, 180);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("\u6b61\u8fce\u4f86\u5230 EduMind Lab", width / 2, 100);

  fill(0, 150, 255);
  rect(startButton.x, startButton.y, startButton.w, startButton.h, 20);
  fill(255);
  textSize(24);
  text("\u958b\u59cb\u904a\u6232", width / 2, startButton.y + startButton.h / 2);
}

function checkStartButtonTouch() {
  for (let hand of predictions) {
    for (let pt of hand.landmarks) {
      let x = pt[0];
      let y = pt[1];
      if (
        x > startButton.x &&
        x < startButton.x + startButton.w &&
        y > startButton.y &&
        y < startButton.y + startButton.h
      ) {
        gameState = "question";
      }
    }
  }
}

function drawQuestion() {
  fill(255, 230);
  rect(20, 20, width - 40, 100, 20);
  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("ADDIE \u6a21\u578b\u7684\u7b2c\u4e00\u6b65\u662f\u4ec0\u9ebc\uff1f", width / 2, 60);

  fill(0, 100, 255, 180);
  rect(60, 150, 200, 100, 20);
  fill(255);
  text("A. \u5206\u6790\u9700\u6c42", 160, 200);

  fill(0, 200, 100, 180);
  rect(width - 260, 150, 200, 100, 20);
  fill(255);
  text("B. \u88fd\u4f5c\u6559\u6750", width - 160, 200);
}

function checkAnswer() {
  for (let hand of predictions) {
    let fingers = hand.annotations;
    if (isPeace(hand)) {
      fill(0, 255, 0);
      text("\u9078\u64c7 A", width / 2, 400);
      if (correctAnswer === "A") gameState = "correct";
    } else if (isPointing(hand)) {
      fill(0, 255, 0);
      text("\u9078\u64c7 B", width / 2, 400);
      if (correctAnswer === "B") gameState = "correct";
    }
  }
}

function isPeace(hand) {
  let index = hand.annotations.indexFinger;
  let middle = hand.annotations.middleFinger;
  let ring = hand.annotations.ringFinger;
  let pinky = hand.annotations.pinky;
  let indexUp = index[3][1] < index[0][1];
  let middleUp = middle[3][1] < middle[0][1];
  let ringDown = ring[3][1] > ring[0][1];
  let pinkyDown = pinky[3][1] > pinky[0][1];
  return indexUp && middleUp && ringDown && pinkyDown;
}

function isPointing(hand) {
  let index = hand.annotations.indexFinger;
  let middle = hand.annotations.middleFinger;
  let indexUp = index[3][1] < index[0][1];
  let middleDown = middle[3][1] > middle[0][1];
  return indexUp && middleDown;
}

function drawHandKeypoints() {
  for (let i = 0; i < predictions.length; i++) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j++) {
      const [x, y, z] = prediction.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 8, 8);
    }
  }
}
