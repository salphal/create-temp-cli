import banner from 'figlet';

/**
 * https://github.com/patorjk/figlet.js
 */

class Banner {
  static print(text) {
    console.log(
      banner.textSync(text, {
        horizontalLayout: 'default',
        whitespaceBreak: true,
      }),
    );
  }
}

Banner.print('front-cli');
