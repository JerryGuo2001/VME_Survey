/*
  survey.js

  This file stores reusable survey-building functions.
  Right now it only builds the 1-5 confidence scale after each picture choice.
*/

function buildConfidenceSurvey(container, onSubmit) {
  const startTime = performance.now();

  container.innerHTML = `
    <div class="screen">
      <h2>How confident are you in your answer?</h2>
      <p>1 = Not confident at all, 5 = Very confident</p>

      <div class="confidence-row" id="confidence-buttons"></div>

      <p class="small-text">Please select one number from 1 to 5.</p>
    </div>
  `;

  const buttonRow = document.getElementById("confidence-buttons");

  for (let rating = 1; rating <= 5; rating++) {
    const btn = document.createElement("button");
    btn.className = "confidence-button";
    btn.textContent = rating;

    btn.addEventListener("click", () => {
      const rt = Math.round(performance.now() - startTime);
      onSubmit({
        confidence: rating,
        confidence_rt_ms: rt
      });
    });

    buttonRow.appendChild(btn);
  }
}
