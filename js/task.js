/*
  task.js

  This file stores the main task timeline.
  To add more trials later, add more objects to TIMELINE.
  Each trial should have:
    - type: "real_picture_trial"
    - trial_id
    - left_image
    - right_image
    - correct_side: "left" or "right"
*/

const app = document.getElementById("app");

const PARTICIPANT_ID = makeParticipantId();

const DATA = [];

const TIMELINE = [
  {
    type: "instructions",
    text: "In this task, you will see two pictures. Please judge which picture is the real picture."
  },

  {
    type: "real_picture_trial",
    trial_id: "trial_001",
    left_image: "image_set/Apple_Manipulation1.jpg",
    right_image: "image_set/Apple_Manipulation2.jpg",
    correct_side: "left"
  },

  {
    type: "real_picture_trial",
    trial_id: "trial_002",
    left_image: "image_set/Bic_Manipulation1.jpg",
    right_image: "image_set/Bic_Manipulation2.jpg",
    correct_side: "right"
  },

  {
    type: "end"
  }
];

let timelineIndex = 0;
let currentChoiceInfo = null;
let trialStartTime = null;
let activePictureKeyHandler = null;

function runTimeline() {
  const event = TIMELINE[timelineIndex];

  if (event.type === "instructions") {
    showInstructions(event);
  } else if (event.type === "real_picture_trial") {
    showPictureTrial(event);
  } else if (event.type === "end") {
    showEndScreen();
  }
}

function showInstructions(event) {
  app.innerHTML = `
    <div class="screen">
      <h1>Real Picture Judgment Task</h1>
      <p>${event.text}</p>
      <p>Use the keyboard to respond:</p>
      <p><strong>Left Arrow</strong> = choose left picture</p>
      <p><strong>Right Arrow</strong> = choose right picture</p>
      <p><strong>1-5</strong> = confidence rating</p>
      <button id="start-button">Start</button>
    </div>
  `;

  document.getElementById("start-button").addEventListener("click", () => {
    timelineIndex++;
    runTimeline();
  });
}

function removePictureKeyHandler() {
  if (activePictureKeyHandler !== null) {
    document.removeEventListener("keydown", activePictureKeyHandler);
    activePictureKeyHandler = null;
  }
}

function showPictureTrial(trial) {
  removePictureKeyHandler();
  currentChoiceInfo = null;
  trialStartTime = performance.now();

  app.innerHTML = `
    <div class="screen">
      <h2>Which picture is real?</h2>

      <div class="image-row">
        <div class="choice-card" id="left-choice">
          <img src="${trial.left_image}" alt="Left picture">
          <div class="choice-label">Left ←</div>
        </div>

        <div class="choice-card" id="right-choice">
          <img src="${trial.right_image}" alt="Right picture">
          <div class="choice-label">Right →</div>
        </div>
      </div>

      <p class="small-text">Press Left Arrow for left. Press Right Arrow for right.</p>
    </div>
  `;

  document.getElementById("left-choice").addEventListener("click", () => handlePictureChoice(trial, "left"));
  document.getElementById("right-choice").addEventListener("click", () => handlePictureChoice(trial, "right"));

  activePictureKeyHandler = event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePictureChoice(trial, "left");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      handlePictureChoice(trial, "right");
    }
  };

  document.addEventListener("keydown", activePictureKeyHandler);
}

function handlePictureChoice(trial, choice) {
  if (currentChoiceInfo !== null) return;

  removePictureKeyHandler();

  const choiceRT = Math.round(performance.now() - trialStartTime);

  currentChoiceInfo = {
    participant_id: PARTICIPANT_ID,
    trial_index: timelineIndex,
    trial_id: trial.trial_id,
    left_image: trial.left_image,
    right_image: trial.right_image,
    correct_side: trial.correct_side,
    choice: choice,
    correct: choice === trial.correct_side ? 1 : 0,
    choice_rt_ms: choiceRT,
    confidence: "",
    confidence_rt_ms: "",
    timestamp: new Date().toISOString()
  };

  buildConfidenceSurvey(app, handleConfidenceSubmit);
}

function handleConfidenceSubmit(confidenceInfo) {
  currentChoiceInfo.confidence = confidenceInfo.confidence;
  currentChoiceInfo.confidence_rt_ms = confidenceInfo.confidence_rt_ms;

  DATA.push(currentChoiceInfo);

  timelineIndex++;
  runTimeline();
}

function showEndScreen() {
  removePictureKeyHandler();

  app.innerHTML = `
    <div class="screen">
      <h1>Task complete</h1>
      <p>Thank you for participating.</p>
      <button id="download-button">Download CSV</button>
    </div>
  `;

  document.getElementById("download-button").addEventListener("click", () => {
    const filename = `${PARTICIPANT_ID}_real_picture_task.csv`;
    downloadCSV(DATA, filename);
  });
}

runTimeline();
