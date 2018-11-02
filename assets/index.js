new class Malm {
  constructor() {
    this.resetsEvery = 14; // in days
    this.timer = null;

    fetch("https://mixer.com/api/v2/levels/patronage/channels/32709/status")
      .then(res => res.json())
      .then(status => {
        const mileStone = status.patronagePeriodId;
        return fetch(
          "https://mixer.com/api/v2/levels/patronage/resources/" + mileStone
        );
      })
      .then(res => res.json())
      .then(resources => {
        const s = new Date(resources.startTime);
        const r = new Date(resources.endTime);
        this.start = moment(s);
        this.reset = moment(r);

        this.setTimes();

        this.startTimer();
      });
  }

  linearRemapPct(value, oldMin, oldMax, newMin, newMax) {
    const newScale = newMax - newMin;
    const valueAsPct = (value - oldMin) / (oldMax - oldMin);
    const scaledValue = valueAsPct * newScale;
    const shiftedAndScaledValue = scaledValue + newMin;
    return shiftedAndScaledValue;
  }

  setTimes() {
    this.now = moment.tz("America/Los_Angeles");

    this.diff =
      100 -
      this.linearRemapPct(
        this.now.valueOf(),
        this.start.valueOf(),
        this.reset.valueOf(),
        0,
        100
      );
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.update();
    }, 1000);
  }

  getTime() {
    const duration = moment.duration(this.reset.diff(this.now));
    const days = parseInt(duration.asDays());
    const hours = parseInt(duration.asHours());
    const h = hours - days * 24;
    const minutes = parseInt(duration.asMinutes());
    const m = minutes - hours * 60;
    return `${days > 0 ? `${days}d, ` : ""}${h > 0 ? `${h}h, ` : ""}${
      m > 0 ? `${m}m` : ""
    }`;
  }

  update() {
    document.querySelector(
      ".crystal .inner"
    ).style.height = `${this.diff.toFixed()}%`;

    document.querySelector(".crystal .timer").style.display = "inline-block";
    document.querySelector(
      ".crystal .timer"
    ).style.top = `${this.diff.toFixed()}%`;
    document.querySelector(
      ".crystal .timer"
    ).textContent = `Resets in: ${this.getTime()}`;

    document.querySelector(".malm .reset").textContent = `${this.reset.format(
      "ddd Do MMM YYYY, ha"
    )} PT`;
  }
}();
