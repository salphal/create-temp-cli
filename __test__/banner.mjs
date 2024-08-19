import banner from 'figlet';


/**
 * https://github.com/patorjk/figlet.js
 */


console.log(
  banner.textSync("temp-cli", {
    horizontalLayout: "default",
    whitespaceBreak: true,
  })
);


class Banner {
  static show(message) {
    banner.textSync("message", {
      horizontalLayout: "default",
      whitespaceBreak: true,
    })
  }
}


Banner.show('temp-cli');
