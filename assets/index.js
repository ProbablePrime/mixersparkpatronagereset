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
        this.start = new Date(resources.startTime);
        this.reset = new Date(resources.endTime);

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

  nth(d) {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  formatDate(date) {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    const dow = date.getDay();
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const time = `${
      date.getHours() > 12
        ? `${date.getHours() - 12}pm`
        : `${date.getHours()}am`
    }`;

    return `${dayNames[dow]} ${day + this.nth(day)} ${
      monthNames[monthIndex]
    } ${year} - ${time}`;
  }

  setTimes() {
    this.now = new Date();

    this.diff =
      100 -
      this.linearRemapPct(
        this.now.getTime(),
        this.start.getTime(),
        this.reset.getTime(),
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
    const duration = this.reset.getTime() - this.now.getTime();
    const days = parseInt(duration / 1000 / 60 / 60 / 24);
    const hours = parseInt(duration / 1000 / 60 / 60);
    const h = hours - days * 24;
    const minutes = parseInt(duration / 1000 / 60);
    const m = minutes - hours * 60;
    return `${days > 0 ? `${days}d` : ""}${h > 0 ? `, ${h}h` : ""}${
      m > 0 ? `, ${m}m` : ""
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

    document.querySelector(".malm .reset").textContent = `${this.formatDate(
      this.reset
    )} PT`;
  }
}();
