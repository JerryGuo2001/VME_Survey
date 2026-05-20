/*
  task.js

  This file stores the main task timeline.
  Odd-one-out trials are defined separately in odd_one_out.js.
  Post-survey code is defined separately in post_survey.js.
  To add more real-picture trials later, add more objects to TIMELINE.
*/

const app = document.getElementById("app");

const PARTICIPANT_ID = makeParticipantId();

const DATA = [];

const SELECTION_FEEDBACK_MS = 1500;

const ODD_ONE_OUT_TIMELINE =
  typeof buildOddOneOutTimeline === "function" ? buildOddOneOutTimeline() : [];

const TIMELINE = [
  {
    type: "instructions",
    title: "Task Instructions",
    text: "You will first complete an odd-one-out phase."
  },

  ...ODD_ONE_OUT_TIMELINE,

  {
    type: "instructions",
    title: "Real Picture Judgment Task",
    text: "Now you will see two pictures. Please judge which picture is the real picture."
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
    type: "post_survey"
  },

  {
    type: "end"
  }
];

let timelineIndex = 0;
let currentChoiceInfo = null;
let trialStartTime = null;
let activePictureKeyHandler = null;
let selectionFeedbackTimer = null;

function runTimeline() {
  const event = TIMELINE[timelineIndex];

  if (event.type === "instructions") {
    showInstructions(event);
  } else if (event.type === "odd_one_out_instructions") {
    showOddOneOutInstructions(event);
  } else if (event.type === "odd_one_out_trial") {
    showOddOneOutTrial(event);
  } else if (event.type === "real_picture_trial") {
    showPictureTrial(event);
  } else if (event.type === "post_survey") {
    showPostSurvey();
  } else if (event.type === "end") {
    showEndScreen();
  }
}

function showInstructions(event) {
  app.innerHTML = `
    <div class="screen">
      <h1>${event.title}</h1>
      <p>${event.text}</p>
      <button id="start-button">Continue</button>
    </div>
  `;

  document.getElementById("start-button").addEventListener("click", () => {
    timelineIndex++;
    runTimeline();
  });
}

function showOddOneOutInstructions(event) {
  app.innerHTML = `
    <div class="screen">
      <h1>Odd One Out</h1>
      <p>${event.text}</p>
      <p>Use the keyboard to respond:</p>
      <p><strong>1</strong> = left picture</p>
      <p><strong>2</strong> = middle picture</p>
      <p><strong>3</strong> = right picture</p>
      <button id="odd-one-out-start-button">Start odd-one-out phase</button>
    </div>
  `;

  document.getElementById("odd-one-out-start-button").addEventListener("click", () => {
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

function clearSelectionFeedbackTimer() {
  if (selectionFeedbackTimer !== null) {
    clearTimeout(selectionFeedbackTimer);
    selectionFeedbackTimer = null;
  }
}

function showOddOneOutTrial(trial) {
  removePictureKeyHandler();
  clearSelectionFeedbackTimer();
  currentChoiceInfo = null;
  trialStartTime = performance.now();

  app.innerHTML = `
    <div class="screen">
      <h2>Which picture is the odd one out?</h2>

      <div class="ooo-image-row">
        <div class="ooo-choice-card" id="odd-choice-1">
          <img src="${trial.images[0]}" alt="Option 1">
          <div class="ooo-choice-label">1</div>
        </div>

        <div class="ooo-choice-card" id="odd-choice-2">
          <img src="${trial.images[1]}" alt="Option 2">
          <div class="ooo-choice-label">2</div>
        </div>

        <div class="ooo-choice-card" id="odd-choice-3">
          <img src="${trial.images[2]}" alt="Option 3">
          <div class="ooo-choice-label">3</div>
        </div>
      </div>

      <p class="small-text">Press 1, 2, or 3.</p>
    </div>
  `;

  activePictureKeyHandler = event => {
    if (["1", "2", "3"].includes(event.key)) {
      event.preventDefault();
      handleOddOneOutChoice(trial, Number(event.key));
    }
  };

  document.addEventListener("keydown", activePictureKeyHandler);
}

function showOddOneOutFeedback(choice) {
  const selectedCard = document.getElementById(`odd-choice-${choice}`);
  if (selectedCard === null) return;

  selectedCard.classList.add("selected-choice");

  const selectedLabel = selectedCard.querySelector(".ooo-choice-label");
  if (selectedLabel !== null) {
    selectedLabel.textContent = `Selected ${choice}`;
  }
}

function handleOddOneOutChoice(trial, choice) {
  if (currentChoiceInfo !== null) return;

  removePictureKeyHandler();

  const choiceRT = Math.round(performance.now() - trialStartTime);
  const hasCorrectOption = trial.correct_option !== "" && trial.correct_option !== undefined && trial.correct_option !== null;
  const correctOption = hasCorrectOption ? Number(trial.correct_option) : "";

  currentChoiceInfo = {
    participant_id: PARTICIPANT_ID,
    phase: "odd_one_out",
    trial_index: timelineIndex,
    trial_id: trial.trial_id,
    option_1_image: trial.images[0],
    option_2_image: trial.images[1],
    option_3_image: trial.images[2],
    choice: choice,
    selected_image: trial.images[choice - 1],
    correct_option: trial.correct_option,
    correct: hasCorrectOption ? (choice === correctOption ? 1 : 0) : "",
    rt_ms: choiceRT,
    timestamp: new Date().toISOString()
  };

  DATA.push(currentChoiceInfo);

  showOddOneOutFeedback(choice);

  selectionFeedbackTimer = setTimeout(() => {
    selectionFeedbackTimer = null;
    timelineIndex++;
    runTimeline();
  }, SELECTION_FEEDBACK_MS);
}

function showPictureTrial(trial) {
  removePictureKeyHandler();
  clearSelectionFeedbackTimer();
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

function showSelectionFeedback(choice) {
  const selectedCard = document.getElementById(`${choice}-choice`);
  if (selectedCard === null) return;

  selectedCard.classList.add("selected-choice");

  const selectedLabel = selectedCard.querySelector(".choice-label");
  if (selectedLabel !== null) {
    selectedLabel.textContent = choice === "left" ? "Selected Left ←" : "Selected Right →";
  }
}

function handlePictureChoice(trial, choice) {
  if (currentChoiceInfo !== null) return;

  removePictureKeyHandler();

  const choiceRT = Math.round(performance.now() - trialStartTime);

  currentChoiceInfo = {
    participant_id: PARTICIPANT_ID,
    phase: "real_picture",
    trial_index: timelineIndex,
    trial_id: trial.trial_id,
    left_image: trial.left_image,
    right_image: trial.right_image,
    correct_side: trial.correct_side,
    choice: choice,
    correct: choice === trial.correct_side ? 1 : 0,
    selection_rt_ms: choiceRT,
    choice_rt_ms: choiceRT,
    confidence: "",
    confidence_rt_ms: "",
    timestamp: new Date().toISOString()
  };

  showSelectionFeedback(choice);

  selectionFeedbackTimer = setTimeout(() => {
    selectionFeedbackTimer = null;
    buildConfidenceSurvey(app, handleConfidenceSubmit);
  }, SELECTION_FEEDBACK_MS);
}

function handleConfidenceSubmit(confidenceInfo) {
  currentChoiceInfo.confidence = confidenceInfo.confidence;
  currentChoiceInfo.confidence_rt_ms = confidenceInfo.confidence_rt_ms;

  DATA.push(currentChoiceInfo);

  timelineIndex++;
  runTimeline();
}


function showPostSurvey() {
  removePictureKeyHandler();
  clearSelectionFeedbackTimer();
  currentChoiceInfo = null;

  buildPostSurvey(app, postSurveyInfo => {
    DATA.push(postSurveyInfo);
    timelineIndex++;
    runTimeline();
  });
}

function showEndScreen() {
  removePictureKeyHandler();
  clearSelectionFeedbackTimer();

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
