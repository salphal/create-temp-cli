import banner from 'figlet';

export class Banner {
  static print(message: string) {
    banner.textSync(message, {
      horizontalLayout: 'default',
      whitespaceBreak: true,
    });
  }
}
