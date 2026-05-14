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
      <p>Click the left or right image to choose which one is real.</p>
      <button id="start-button">Start</button>
    </div>
  `;

  document.getElementById("start-button").addEventListener("click", () => {
    timelineIndex++;
    runTimeline();
  });
}

function showPictureTrial(trial) {
  currentChoiceInfo = null;
  trialStartTime = performance.now();

  app.innerHTML = `
    <div class="screen">
      <h2>Which picture is real?</h2>

      <div class="image-row">
        <div class="choice-card" id="left-choice">
          <img src="${trial.left_image}" alt="Left picture">
          <div class="choice-label">Left</div>
        </div>

        <div class="choice-card" id="right-choice">
          <img src="${trial.right_image}" alt="Right picture">
          <div class="choice-label">Right</div>
        </div>
      </div>

      <p class="small-text">Choose the real picture.</p>
    </div>
  `;

  document.getElementById("left-choice").addEventListener("click", () => handlePictureChoice(trial, "left"));
  document.getElementById("right-choice").addEventListener("click", () => handlePictureChoice(trial, "right"));
}

function handlePictureChoice(trial, choice) {
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
