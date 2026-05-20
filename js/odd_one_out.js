/*
  odd_one_out.js

  This file stores the odd-one-out phase trial list.
  Put your images inside: image_set/odd_one_out/

  Browser JavaScript cannot automatically read all filenames inside a folder,
  so add each trial here as three image paths.

  correct_option is optional:
    - use 1, 2, or 3 if there is a correct answer
    - use "" if you only want to record the selected option
*/

const ODD_ONE_OUT_TRIALS = [
  {
    trial_id: "ooo_001",
    images: [
      "image_set/odd_one_out/ooo_001_1.jpg",
      "image_set/odd_one_out/ooo_001_2.jpg",
      "image_set/odd_one_out/ooo_001_3.jpg"
    ],
    correct_option: ""
  },
  {
    trial_id: "ooo_002",
    images: [
      "image_set/odd_one_out/ooo_002_1.jpg",
      "image_set/odd_one_out/ooo_002_2.jpg",
      "image_set/odd_one_out/ooo_002_3.jpg"
    ],
    correct_option: ""
  }
];

function buildOddOneOutTimeline() {
  return [
    {
      type: "odd_one_out_instructions",
      text: "You will see three pictures at a time. Pick the one that is most different from the other two."
    },
    ...ODD_ONE_OUT_TRIALS.map(trial => ({
      type: "odd_one_out_trial",
      trial_id: trial.trial_id,
      images: trial.images,
      correct_option: trial.correct_option
    }))
  ];
}
