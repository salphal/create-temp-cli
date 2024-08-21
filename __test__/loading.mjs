import ora from 'ora';


/**
 * https://github.com/sindresorhus/ora
 */


class Loading {

  static spinner = ora({
    prefixText: "",
    suffixText: "...",
    color: 'yellow'
  });

  static start(message) {
    this.spinner.text = message;
    this.spinner.start();
  }

  static end() {
    this.spinner.stop();
  }
}

Loading.start("loading");

setTimeout(() => {
  Loading.end();
}, 3000);

