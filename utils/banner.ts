import banner from "figlet";

class Banner {

	static show(message: string) {
		banner.textSync(message, {
			horizontalLayout: "default",
			whitespaceBreak: true,
		})
	}
}

export default Banner;