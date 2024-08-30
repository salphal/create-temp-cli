import banner from "figlet";

class Banner {

	static print(message: string) {
		banner.textSync(message, {
			horizontalLayout: "default",
			whitespaceBreak: true,
		})
	}
}

export default Banner;
