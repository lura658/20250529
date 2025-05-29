let video;
let handpose;
let predictions = [];

let questions = [
  {
    question: "誰提出多元智慧理論？",
    left: "史金納",
    right: "賀華德・嘉納",
    answer: "右"
  },
  {
    question: "教學媒體屬於哪類支援？",
    left: "外在學習資源",
    right: "內在認知策略",
    answer: "左"
  },
  {
    question: "何者是教學設計模型？",
    left: "ADDIE",
    right: "AGILE",
    answer: "左"
  }
];

let currentIndex = 0;
let score = 0;
let gameState = "start"; // "start", "question", "result"
let selected = null;
let feedbackTimer = 0;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, () => console.log("Handpose ready!"));
  handpose.on("predict", results => predictions = results);
}

function draw() {
  background(255);
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  if (gameState === "start") {
    showStartScreen();
  } else if (gameState === "question") {
    showQuestion();
    detectHandGesture();
  } else if (gameState === "result") {
    showResult();
  }
}

function showStartScreen() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(0);
  text("EduStorm：知識風暴手勢戰", width/2, height/2 - 40);
  textSize(20);
  text("請按任意鍵開始遊戲", width/2, height/2 + 20);
}

function showQuestion() {
  let q = questions[currentIndex];
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(q.question, width/2, 40);

  // 選項區域
  fill(240);
  rect(0, height - 100, width/2, 100);
  rect(width/2, height - 100, width/2, 100);

  fill(0);
  textSize(20);
  text(q.left, width/4, height - 50);
  text(q.right, (3*width)/4, height - 50);

  if (selected) {
    textSize(28);
    if (selected === q.answer) {
      fill(0, 150, 0);
      text("✅ 正確！", width/2, height/2);
    } else {
      fill(200, 0, 0);
      text("❌ 錯誤！", width/2, height/2);
    }
  }

  fill(100);
  textSize(16);
  text(`第 ${currentIndex+1} 題 / ${questions.length}｜分數: ${score}`, width - 150, 20);
}

function showResult() {
  textAlign(CENTER, CENTER);
  textSize(28);
  fill(0);
  text("🎉 遊戲結束 🎉", width/2, height/2 - 40);
  text(`你總共答對了 ${score} 題！`, width/2, height/2);
  textSize(18);
  text("按任意鍵重新開始", width/2, height/2 + 40);
}

function detectHandGesture() {
  if (predictions.length > 0 && !selected) {
    let hand = predictions[0];
    let x = hand.landmarks[9][0];
    let y = hand.landmarks[9][1];

    if (y > height - 120) {
      if (x < width / 2) {
        selected = "左";
      } else {
        selected = "右";
      }
      checkAnswer();
    }
  }

  if (selected && millis() - feedbackTimer > 1500) {
    nextQuestion();
  }
}

function checkAnswer() {
  let q = questions[currentIndex];
  if (selected === q.answer) {
    score++;
  }
  feedbackTimer = millis();
}

function nextQuestion() {
  selected = null;
  currentIndex++;
  if (currentIndex >= questions.length) {
    gameState = "result";
  }
}

function keyPressed() {
  if (gameState === "start") {
    gameState = "question";
    currentIndex = 0;
    score = 0;
  } else if (gameState === "result") {
    gameState = "start";
  }
}
