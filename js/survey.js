/*
  survey.js

  This file stores reusable survey-building functions.
  Right now it only builds the 1-5 confidence scale after each picture choice.
*/

function buildConfidenceSurvey(container, onSubmit) {
  const startTime = performance.now();
  let submitted = false;

  container.innerHTML = `
    <div class="screen">
      <h2>How confident are you in your answer?</h2>
      <p>1 = Not confident at all, 5 = Very confident</p>

      <div class="confidence-row" id="confidence-options"></div>

      <p class="small-text">Press 1, 2, 3, 4, or 5.</p>
    </div>
  `;

  function submitConfidence(rating) {
    if (submitted) return;
    submitted = true;

    document.removeEventListener("keydown", confidenceKeyHandler);

    const rt = Math.round(performance.now() - startTime);
    onSubmit({
      confidence: rating,
      confidence_rt_ms: rt
    });
  }

  function confidenceKeyHandler(event) {
    if (["1", "2", "3", "4", "5"].includes(event.key)) {
      event.preventDefault();
      submitConfidence(Number(event.key));
    }
  }

  document.addEventListener("keydown", confidenceKeyHandler);

  const optionRow = document.getElementById("confidence-options");

  for (let rating = 1; rating <= 5; rating++) {
    const option = document.createElement("div");
    option.className = "confidence-button confidence-key-option";
    option.textContent = rating;
    option.setAttribute("aria-hidden", "true");
    optionRow.appendChild(option);
  }
}
