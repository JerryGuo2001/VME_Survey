/*
  post_survey.js

  This file stores the post-task survey.
  It asks for year of birth and past experience with Pokémon and Monopoly.
  The survey saves one row into DATA when submitted.
*/

const POST_SURVEY_TOPICS = [
  {
    key: "pokemon",
    label: "Pokémon"
  },
  {
    key: "monopoly",
    label: "Monopoly"
  }
];

function buildYearOptions() {
  const currentYear = new Date().getFullYear();
  let options = '<option value="">Select year</option>';

  for (let year = currentYear; year >= 1920; year--) {
    options += `<option value="${year}">${year}</option>`;
  }

  options += '<option value="prefer_not_to_say">Prefer not to say</option>';
  return options;
}

function makeRadioRow(name, options) {
  return options.map(option => `
    <label class="survey-option">
      <input type="radio" name="${name}" value="${option.value}">
      <span>${option.label}</span>
    </label>
  `).join("");
}

function makeExperienceSection(topic) {
  return `
    <section class="post-survey-section">
      <h3>${topic.label} experience</h3>

      <div class="survey-question">
        <p>Have you heard of or know ${topic.label}?</p>
        <div class="survey-option-row">
          ${makeRadioRow(`${topic.key}_know`, [
            { value: "no", label: "No" },
            { value: "heard_of_it", label: "Heard of it" },
            { value: "know_basic", label: "Know basic things" },
            { value: "know_well", label: "Know it well" }
          ])}
        </div>
      </div>

      <div class="survey-question">
        <p>Have you watched ${topic.label} or watched other people play it?</p>
        <div class="survey-option-row">
          ${makeRadioRow(`${topic.key}_watched`, [
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" }
          ])}
        </div>
      </div>

      <div class="survey-question">
        <p>Have you played ${topic.label}?</p>
        <div class="survey-option-row">
          ${makeRadioRow(`${topic.key}_played`, [
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" }
          ])}
        </div>
      </div>

      <div class="survey-question">
        <p>How much have you played ${topic.label}?</p>
        <div class="survey-option-row scale-row">
          ${makeRadioRow(`${topic.key}_play_amount`, [
            { value: "1", label: "1<br>Never" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5<br>A lot" }
          ])}
        </div>
      </div>

      <div class="survey-question">
        <p>How familiar are you with ${topic.label}?</p>
        <div class="survey-option-row scale-row">
          ${makeRadioRow(`${topic.key}_familiarity`, [
            { value: "1", label: "1<br>Not familiar" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5<br>Very familiar" }
          ])}
        </div>
      </div>
    </section>
  `;
}

function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "";
}

function collectPostSurveyData(startTime) {
  const row = {
    participant_id: PARTICIPANT_ID,
    phase: "post_survey",
    year_of_birth: document.getElementById("year-of-birth").value,
    post_survey_rt_ms: Math.round(performance.now() - startTime),
    timestamp: new Date().toISOString()
  };

  POST_SURVEY_TOPICS.forEach(topic => {
    row[`${topic.key}_know`] = getRadioValue(`${topic.key}_know`);
    row[`${topic.key}_watched`] = getRadioValue(`${topic.key}_watched`);
    row[`${topic.key}_played`] = getRadioValue(`${topic.key}_played`);
    row[`${topic.key}_play_amount`] = getRadioValue(`${topic.key}_play_amount`);
    row[`${topic.key}_familiarity`] = getRadioValue(`${topic.key}_familiarity`);
  });

  return row;
}

function findMissingPostSurveyFields(row) {
  const missing = [];

  if (row.year_of_birth === "") {
    missing.push("year of birth");
  }

  POST_SURVEY_TOPICS.forEach(topic => {
    if (row[`${topic.key}_know`] === "") missing.push(`${topic.label}: know it`);
    if (row[`${topic.key}_watched`] === "") missing.push(`${topic.label}: watched it`);
    if (row[`${topic.key}_played`] === "") missing.push(`${topic.label}: played it`);
    if (row[`${topic.key}_play_amount`] === "") missing.push(`${topic.label}: how much played`);
    if (row[`${topic.key}_familiarity`] === "") missing.push(`${topic.label}: familiarity`);
  });

  return missing;
}

function buildPostSurvey(container, onSubmit) {
  const startTime = performance.now();

  container.innerHTML = `
    <div class="screen post-survey-screen">
      <h2>Post Survey</h2>

      <div class="survey-question">
        <p>What year were you born?</p>
        <select id="year-of-birth" class="survey-select">
          ${buildYearOptions()}
        </select>
      </div>

      ${POST_SURVEY_TOPICS.map(makeExperienceSection).join("")}

      <p id="post-survey-warning" class="survey-warning"></p>
      <button id="post-survey-submit-button">Submit survey</button>
    </div>
  `;

  document.getElementById("post-survey-submit-button").addEventListener("click", () => {
    const row = collectPostSurveyData(startTime);
    const missing = findMissingPostSurveyFields(row);

    if (missing.length > 0) {
      document.getElementById("post-survey-warning").textContent =
        `Please answer: ${missing.join(", ")}.`;
      return;
    }

    onSubmit(row);
  });
}
