import { smoothScroll } from './modules/functional.js';

// File input
const uploadFile = document.querySelector('.upload-file');
const uploadFileInput = document.querySelector('.upload-file__input-hidden');

// active file input
uploadFileInput.addEventListener('dragenter', () => {
  uploadFile.classList.add('upload-file--active');
});
uploadFileInput.addEventListener('focus', () => {
  uploadFile.classList.add('upload-file--active');
});
uploadFileInput.addEventListener('click', () => {
  uploadFile.classList.add('upload-file--active');
});

// de-active file input
uploadFileInput.addEventListener('dragleave', () => {
  uploadFile.classList.remove('upload-file--active');
});
uploadFileInput.addEventListener('blur', () => {
  uploadFile.classList.remove('upload-file--active');
});
uploadFileInput.addEventListener('drop', () => {
  uploadFile.classList.remove('upload-file--active');
});

// Multi-Form
const multiForm = document.querySelector('.multi-form');
const frame = document.querySelector('.multi-form__steps');
const framePaddingY =
  getClearValue(frame, 'padding-top') + getClearValue(frame, 'padding-bottom');
const steps = Array.from(frame.querySelectorAll('.step'));
const progress = document.querySelector('.progress');
const progressBar = document.querySelector('.progress__bar');
const origElemSelector = '#header';
const scrollDuration = getClearValue(
  document.documentElement,
  '--change-step-scroll-up-duration-ms',
);
const scrollPause = getClearValue(
  document.documentElement,
  '--change-step-pause-duration-ms',
);

function getClearValue(elem, key, offsetRight = -2) {
  return +getComputedStyle(elem)
    .getPropertyValue(key)
    .trim()
    .slice(0, offsetRight);
}
function getStepsHeights() {
  return steps.map((elem) => elem.getBoundingClientRect().height);
}
function getCurrentStep() {
  return +getComputedStyle(document.querySelector(':root'))
    .getPropertyValue('--step')
    .trim();
}

function initTabindex() {
  [].forEach.call(document.querySelectorAll('[tabindex]'), (elem) =>
    elem.setAttribute('tabindex', '-1'),
  );
  [].forEach.call(
    document.querySelectorAll(`.step--${getCurrentStep()} [tabindex]`),
    (elem) => elem.setAttribute('tabindex', '0'),
  );
  document.activeElement.blur();
}
function updateWidth() {
  const width = progressBar.getBoundingClientRect().width;
  progress.style.setProperty('--width', `${width}px`);
}
function updateScrollbar() {
  let scrollbarIsNeeded = false;
  const reserved = frame.offsetTop + getClearValue(multiForm, 'padding-bottom');
  const heights = getStepsHeights();
  heights.forEach((value) => {
    if (reserved + value > window.innerHeight) {
      scrollbarIsNeeded = true;
    }
  });
  if (scrollbarIsNeeded) {
    document.body.classList.add('scrollbar-on');
  } else {
    document.body.classList.remove('scrollbar-on');
  }
}
function updateCurrentStep(delta) {
  const currentStep = getCurrentStep() + delta;
  const currentIndex = currentStep - 1;
  const heights = getStepsHeights();
  const currentHeight = heights[currentIndex] + framePaddingY;
  const gap = getClearValue(frame, 'row-gap');
  const offsetTop = heights.reduce(
    (accumulator, value, index) =>
      index < currentIndex ? accumulator + value : accumulator,
    currentIndex * gap,
  );
  document.querySelector(':root').style.setProperty('--step', currentStep);
  frame.style.setProperty('--height', `${currentHeight}px`);
  frame.style.setProperty('--step-offset-top', `-${offsetTop}px`);
}

function update() {
  // setTimeout(() => {
  //   updateWidth();
  //   updateScrollbar();
  //   updateCurrentStep(0);
  // }, 50);
  updateWidth();
  updateScrollbar();
  updateCurrentStep(0);
}

function move(delta) {
  smoothScroll(origElemSelector, scrollDuration);
  setTimeout(() => {
    updateCurrentStep(delta);
    initTabindex();
  }, scrollDuration + scrollPause);
}

// Action
multiForm.addEventListener('click', (event) => {
  if (event.target.dataset.controlButton == 'next') {
    move(+1);
  }
  if (event.target.dataset.controlButton == 'back') {
    move(-1);
  }
});

document.querySelector(':root').style.setProperty('--step', 1);
initTabindex();
window.addEventListener('load', () => update());
window.addEventListener('resize', () => update());

// Validate
class ValidateSchema {
  constructor(settings) {
    this.index = settings.index;
    this.root = document.querySelector(`.step--${this.index}`);
    this.selector = settings.selector;
    this.targets = [...this.root.querySelectorAll(this.selector)];
    this.check = settings.check;
    this.validateEvent = settings.validateEvent;
    this.invalidMessage = settings.invalidMessage;

    this.validate();
    this.bound();
  }

  get button() {
    return (
      this._button ??
      (this._button = this.root.querySelector(
        '[data-control-button="next"], [data-control-button="finish"]',
      ))
    );
  }

  get message() {
    return (
      this._message ??
      (this._message = this.root.querySelector('.step__message'))
    );
  }

  validate() {
    if (this.check()) {
      this.button.disabled = false;
      this.message.innerHTML = '';
    } else {
      this.button.disabled = true;
      this.message.innerHTML = this.invalidMessage;
    }
  }

  bound() {
    this.targets.forEach((elem) =>
      elem.addEventListener(this.validateEvent, () => this.validate()),
    );
  }
}

const validateSchemes = {
  1: new ValidateSchema({
    index: 1,
    selector: 'input[type=radio]',
    check: function () {
      return this.targets.some((elem) => elem.checked);
    },
    validateEvent: 'change',
    invalidMessage: 'Choose hub',
  }),

  2: new ValidateSchema({
    index: 2,
    selector: 'input[type=checkbox]',
    check: function () {
      return this.targets.filter((elem) => elem.checked).length >= 3;
    },
    validateEvent: 'change',
    invalidMessage: 'Select up to 3 objectives',
  }),

  5: new ValidateSchema({
    index: 5,
    selector: 'input[type=text], textarea',
    check: function () {
      return this.targets.every(
        (elem) => !(elem.value == null || elem.value.trim() == ''),
      );
    },
    validateEvent: 'input',
    invalidMessage: 'Fill the fields',
  }),
};

// Submit
const submitButton = document.querySelector('button[type="submit"]');

submitButton.addEventListener('click', (event) => {
  event.preventDefault();
  window.location.assign(submitButton.dataset.href);
});
