import {
	App,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { generateAiSummary } from "./ollama";

interface AiSummaryPluginSettings {
	endpoint: string;
	model: string;
	token: string;
}

const DEFAULT_SETTINGS: AiSummaryPluginSettings = {
	endpoint: "https://api.openai.com",
	model: "gpt-4o-mini",
	token: "",
};

export default class AiSummaryPlugin extends Plugin {
	settings: AiSummaryPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "ai-summary-create",
			name: "Create AI Summary",
			callback: async () => {
				try {
					const markdownView =
						this.app.workspace.getActiveViewOfType(MarkdownView);
					const fileName =
						this.app.workspace.getActiveFile()?.basename;

					if (!markdownView) {
						new Notice("No active markdown view.");
						return;
					}

					const markdownContent = markdownView.editor.getValue();

					if (!markdownContent.trim()) {
						new Notice("The current note is empty.");
						return;
					}

					console.log("fileName", fileName);

					new Notice("Generating summary...");

					const summary = await generateAiSummary(
						fileName || "Untitled",
						markdownContent,
						{
							endpoint: this.settings.endpoint,
							token: this.settings.token,
							modelName: this.settings.model,
						}
					);

					new SummaryModal(this.app, summary).open();
				} catch (error) {
					console.error("Error generating summary:", error);
					new Notice(
						"Failed to generate summary. Please check the console for details."
					);
				}
			},
		});

		this.addSettingTab(new AiSummarySettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SummaryModal extends Modal {
	summary: string;

	constructor(app: App, summary: string) {
		super(app);
		this.summary = summary;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "AI Generated Summary" });

		// Add summary text
		const summaryEl = contentEl.createEl("div", { cls: "summary-content" });
		summaryEl.createEl("p", { text: this.summary });

		// Add copy button
		const buttonContainer = contentEl.createEl("div", {
			cls: "button-container",
		});
		const copyButton = buttonContainer.createEl("button", {
			text: "Copy to Clipboard",
		});
		const insertButton = buttonContainer.createEl("button", {
			text: "Add to Note",
		});

		copyButton.addEventListener("click", () => {
			navigator.clipboard.writeText(this.summary);
			new Notice("Summary copied to clipboard!");
		});

		insertButton.addEventListener("click", async () => {
			const activeView =
				this.app.workspace.getActiveViewOfType(MarkdownView);

			if (!activeView) {
				new Notice("No active markdown view.");
				return;
			}

			const editor = activeView.editor;
			editor.replaceRange(this.summary + "\n\n", { line: 0, ch: 0 });
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class AiSummarySettingTab extends PluginSettingTab {
	plugin: AiSummaryPlugin;

	constructor(app: App, plugin: AiSummaryPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "AI Summary Settings" });

		new Setting(containerEl).setName("Endpoint").addText((text) =>
			text
				.setPlaceholder("Enter URL")
				.setValue(this.plugin.settings.endpoint)
				.onChange(async (value) => {
					this.plugin.settings.endpoint = value;
					await this.plugin.saveSettings();
				})
		);

		new Setting(containerEl)
			.setName("Model")
			.setDesc("The model to use for summaries.")
			.addText((text) =>
				text
					.setPlaceholder("Enter model name")
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Token")
			.setDesc("API token to use for authentication.")
			.addText((text) =>
				text
					.setPlaceholder("Enter API token")
					.setValue(this.plugin.settings.token)
					.onChange(async (value) => {
						this.plugin.settings.token = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
