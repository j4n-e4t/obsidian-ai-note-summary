# AI Summaries Obsidian Plugin

The AI Summaries plugin for Obsidian allows you to generate summaries of your notes using AI. It currently supports any model that is available on the OpenAI API.

## Features

-   Generate short, one sentence summaries of your notes
-   Display them in a special callout block at the top of your note

## Installation

1.  Install the plugin via the Obsidian community plugin marketplace.
2.  Get an API key from OpenAI or any other privder with an API that is compatible with the OpenAI API (e.g. Azure AI).
3.  Enter your endpoint, the model name, and the API key in the plugin settings.
4.  Add the custom CSS snippet to your Obsidian vault to display the summaries in a special callout block.
5.  Use the `Create AI Summary` command to generate a summary of your note.

## Usage

To generate a summary of your note, use the `Create AI Summary` command. The summary will be displayed in a modal window. You can then copy the summary to your clipboard or insert it into your note.

## Custom CSS

To display the summaries in a special callout block, add the following custom CSS snippet to your Obsidian vault:

```css
.callout[data-callout="ai-summary"] {
	--callout-color: 122, 28, 172;
	--callout-icon: lucide-brain;
}
```

Of course, you can customize the color and icon to your liking. See the [official documentation](https://help.obsidian.md/Editing+and+formatting/Callouts) for more information on how to customize the callout block.
