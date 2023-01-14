//datetime picker
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
//for custom non-blocking alerts/notifications
import { Notify } from 'notiflix/build/notiflix-notify-aio';

export default class Timer {
  static flatpickrOptions = {
    enableTime: true,
    time_24hr: true,
    minuteIncrement: 1,
  };
  #selectedDate = new Date();
  #timerEl;
  #startBtnEl;
  #timerDataElements;
  #timerIntervalId = null;

  constructor(timerClass, userFlatPickrOptions = Timer.flatpickrOptions) {
    this.#getSelectedDateFromStorage();
    userFlatPickrOptions.onClose = this.#onClose;
    userFlatPickrOptions.defaultDate = this.#selectedDate;
    console.log('selected date: ', this.#selectedDate);
    flatpickr('#datetime-picker', userFlatPickrOptions);

    this.#timerEl = document.querySelector('.' + timerClass);
    this.#startBtnEl = this.#timerEl.querySelector('[data-start]');
    this.#timerDataElements = {
      daysEl: this.#timerEl.querySelector('[data-days]'),
      hoursEl: this.#timerEl.querySelector('[data-hours]'),
      minutesEl: this.#timerEl.querySelector('[data-minutes]'),
      secondsEl: this.#timerEl.querySelector('[data-seconds]'),
    };
    this.#startBtnEl.addEventListener(
      'click',
      this.#onStartBtnElClick.bind(this)
    );
  }

  //return user`s selected date (Date obj)
  get selectedDate() {
    return this.#selectedDate;
  }

  //disable start/stop timer button
  inactivateBtn() {
    this.#startBtnEl.disabled = true;
  }

  //enable start/stop timer button
  activateBtn() {
    this.#startBtnEl.disabled = false;
  }

  //callback function for flatpickr settings object - defines behaviour when date selection window is closed
  #onClose(selectedDates) {
    const startBtn = document.querySelector('[data-start]');
    const dateNow = new Date();
    const dateToCheck = new Date(selectedDates[0]);
    if (dateToCheck - dateNow <= 0) {
      Notify.failure('Please choose a date in the future!');
      startBtn.disabled = true;
      return false;
    }
    localStorage.selectedDate = dateToCheck;
    startBtn.disabled = false;
    return true;
  }

  #onStartBtnElClick() {
    //if the timer is on - then the button is the stop button - it stops the timer and transforms to the start button
    if (this.#timerIntervalId) {
      clearInterval(this.#timerIntervalId);
      this.#changeBtnText(this.#startBtnEl, 'Start');
      this.#timerIntervalId = null;
      return;
    }
    this.#getSelectedDateFromStorage();
    if (!this.#checkDate()) return;
    this.#timerIntervalId = setInterval(this.#countTimer.bind(this), 1000);
    this.#changeBtnText(this.#startBtnEl, 'Stop');
  }

  #checkDate() {
    return this.#onClose([this.#selectedDate]);
  }

  //to change textContent of start/stop timer button
  #changeBtnText(btnEl, text) {
    btnEl.textContent = text;
  }

  //to get user`s selected date from local storage and write it to this.#selectedDate
  #getSelectedDateFromStorage() {
    this.#selectedDate = localStorage.selectedDate
      ? new Date(localStorage.selectedDate)
      : new Date();
  }

  //callback for timer setInterval
  #countTimer() {
    const timeDifference = this.convertMs(this.#selectedDate - new Date());
    this.#showTimeDifference(timeDifference);
  }

  //to change textContent of days/minutes/seconds timer elements
  #showTimeDifference(timeDifference) {
    const { days, hours, minutes, seconds } = timeDifference;
    this.#timerDataElements.daysEl.textContent = this.#addLeadingZero(
      String(days)
    );
    this.#timerDataElements.hoursEl.textContent = this.#addLeadingZero(
      String(hours)
    );
    this.#timerDataElements.minutesEl.textContent = this.#addLeadingZero(
      String(minutes)
    );
    this.#timerDataElements.secondsEl.textContent = this.#addLeadingZero(
      String(seconds)
    );
  }

  #addLeadingZero(value) {
    return value.length < 2 ? value.padStart(2, '0') : value;
  }

  //convert miliseconds to { days, hours, minutes, seconds } object (and returns it)
  convertMs(ms) {
    // Number of milliseconds per unit of time
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    // Remaining days
    const days = Math.floor(ms / day);
    // Remaining hours
    const hours = Math.floor((ms % day) / hour);
    // Remaining minutes
    const minutes = Math.floor(((ms % day) % hour) / minute);
    // Remaining seconds
    const seconds = Math.floor((((ms % day) % hour) % minute) / second);

    return { days, hours, minutes, seconds };
  }
}
