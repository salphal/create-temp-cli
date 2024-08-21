import ora from "ora";

class Loading {

	static spinner = ora({
		prefixText: "",
		suffixText: "...\n",
		color: 'yellow'
	});

	static start(message: string) {
		this.spinner.text = message;
		this.spinner.start();
	}

	static end() {
		this.spinner.stop();
	}
}

export default Loading;