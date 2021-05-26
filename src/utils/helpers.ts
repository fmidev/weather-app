import moment from 'moment';

// 60 minutes = 3600 seconds
const STEP_60 = 3600;
// 30 minutes = 1800 seconds
const STEP_30 = 1800;
// 15 minutes = 900 seconds
const STEP_15 = 900;

export const getSliderMaxUnix = (sliderStep: number): number => {
  const now = moment.utc().unix();

  if (sliderStep === 60) {
    return now + 5 * STEP_60;
  }
  if (sliderStep === 30) {
    return now + 5 * STEP_30;
  }
  return now + 5 * STEP_15;
};

export const getSliderMinUnix = (sliderStep: number): number => {
  const now = moment.utc().unix();

  if (sliderStep === 60) {
    return now - 5 * STEP_60;
  }
  if (sliderStep === 30) {
    return now - 5 * STEP_30;
  }
  return now - 18 * STEP_15;
};

export const getSliderStepSeconds = (sliderStep: number): number => {
  if (sliderStep === 60) return STEP_60;
  if (sliderStep === 30) return STEP_30;
  return STEP_15;
};
