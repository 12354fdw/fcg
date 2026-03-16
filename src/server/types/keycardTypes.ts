export type KeycardLevel =
	| "None"
	| "LnM"
	| "ComputerScientist"
	| "ReactorOperators"
	| "Security"
	| "Admin"
	| "Development";

export interface RankInfo {
	Level: string;
	DisplayName: string;
	Color: Color3;
}

const rankInformation: Record<KeycardLevel, RankInfo> = {
	Development: {
		Level: "6",
		DisplayName: "Development",
		Color: Color3.fromRGB(255, 0, 255),
	},

	Admin: {
		Level: "5",
		DisplayName: "Administration",
		Color: Color3.fromRGB(255, 0, 0),
	},

	Security: {
		Level: "4",
		DisplayName: "Security",
		Color: Color3.fromRGB(0, 170, 255),
	},

	ReactorOperators: {
		Level: "3",
		DisplayName: "Reactor Operator",
		Color: Color3.fromRGB(255, 170, 0),
	},

	ComputerScientist: {
		Level: "2",
		DisplayName: "Computer Scientist",
		Color: Color3.fromRGB(164, 255, 44),
	},

	LnM: {
		Level: "1",
		DisplayName: "Logi. & Manti.",
		Color: Color3.fromRGB(255, 242, 99),
	},

	None: {
		Level: "-",
		DisplayName: "None",
		Color: Color3.fromRGB(203, 203, 203),
	},
};

export default rankInformation;
