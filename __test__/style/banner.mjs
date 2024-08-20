import banner from 'figlet';


/**
 * https://github.com/patorjk/figlet.js
 */

class Banner {

  static show(text) {
    console.log(
      banner.textSync(text, {
        horizontalLayout: "default",
        whitespaceBreak: true,
      })
    )
  }
}


Banner.show("temp-cli");