import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('ecocode.analyze', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('EcoCode AI: Open a code file first!');
            return;
        }

        const selectedText = editor.document.getText(editor.selection);
        const language = editor.document.languageId;

        if (!selectedText) {
            vscode.window.showWarningMessage('EcoCode AI: Please highlight a piece of code to analyze.');
            return;
        }

        vscode.window.showInformationMessage('EcoCode AI: Running algorithmic sustainability check...');

        const API_KEY = "AQ.Ab8RN6KCbqex-vsg2EI7c4HDtjTfqX_DyW46s9_YEcozyjYGqw";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        // 1. Upgraded Prompt: Forces Gemini to structure output with beautiful markdown layouts
        const promptText = `You are EcoCode AI, a digital sustainability and green computing expert.
Analyze the following ${language} code for environmental efficiency and performance bugs.

Provide your output in this EXACT Markdown layout:
# 🌿 EcoCode AI Sustainability Report

## 📊 Green Efficiency Rating
| Metric | Assessment |
|---|---|
| **Carbon Grade** | **[Insert A through F here]** |
| **Est. Energy Saved** | [Insert estimate % here, e.g. 35%] fewer CPU cycles |
| **Algorithmic Complexity** | O(...) |

---

## 🔍 Identified Environmental Anti-Patterns
* [List specific issues here like nested loops, memory leaks, or unnecessary lookups...]

---

## 🚀 Refactored Green Code
Code optimization alternative:
\`\`\`${language}
[Insert fully optimized, clean, refactored code here]
\`\`\`

---
*EcoCode AI Engine • Green Computing Initiative*

Code to analyze:
\`\`\`${language}
${selectedText}
\`\`\``;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }]
                })
            });

            if (!response.ok) {
                throw new Error(`API Status ${response.status}`);
            }

            const rawData = await response.json() as any;
            const aiMarkdownResponse = rawData.candidates[0].content.parts[0].text;

            // 2. Open an in-memory virtual Markdown file
            const doc = await vscode.workspace.openTextDocument({
                content: aiMarkdownResponse,
                language: 'markdown'
            });

            // 3. ✨ MAGIC STEP: Tell VS Code to execute its official side-by-side Markdown viewer
            // This replaces the messy raw text editor window with a gorgeous HTML preview dashboard!
            await vscode.commands.executeCommand('markdown.showPreviewToSide', doc.uri);
            
            vscode.window.showInformationMessage('EcoCode AI: Report generated beautifully!');

        } catch (error: any) {
            vscode.window.showErrorMessage(`EcoCode AI Error: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}