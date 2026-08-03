import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('ecocode.analyze', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('EcoCode AI: Open a code file first!');
            return;
        }

        // 1. Detect highlighted code and file language
        const selectedText = editor.document.getText(editor.selection);
        const language = editor.document.languageId; // Automatically detects 'javascript', 'cpp', 'java', etc.

        if (!selectedText) {
            vscode.window.showWarningMessage('EcoCode AI: Please highlight a piece of code to analyze.');
            return;
        }

        vscode.window.showInformationMessage(`EcoCode AI: Analyzing ${language} code for sustainability...`);

        const API_KEY = "AQ.Ab8RN6KCbqex-vsg2EI7c4HDtjTfqX_DyW46s9_YEcozyjYGqw";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        // 2. Strict Prompt enforcing the target programming language
        const promptText = `You are EcoCode AI, an expert in digital sustainability and green computing.

CRITICAL LANGUAGE CONSTRAINT:
- The input code is written in: **${language}**.
- Your output refactored code MUST be written strictly in **${language}**.
- DO NOT convert or translate the code into Python, C++, Java, JavaScript, or any other language. Match the input language (**${language}**) exactly!

Provide your output in this EXACT Markdown layout:

# 🌿 EcoCode AI Sustainability Report

## 📊 Green Efficiency Rating
| Metric | Assessment |
|---|---|
| **Detected Language** | **${language}** |
| **Carbon Grade** | [Insert A through F here] |
| **Est. Energy Saved** | [Insert estimate %, e.g., 35%] fewer CPU cycles |
| **Algorithmic Complexity** | O(...) |

---

## 🔍 Identified Environmental Anti-Patterns
* [List specific memory leaks, nested loops, or performance bottlenecks in the code]

---

## 🚀 Refactored Green Code (${language})
\`\`\`${language}
[Insert fully optimized, clean, refactored ${language} code here]
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

            // 3. Render side-by-side Markdown
            const doc = await vscode.workspace.openTextDocument({
                content: aiMarkdownResponse,
                language: 'markdown'
            });

            await vscode.commands.executeCommand('markdown.showPreviewToSide', doc.uri);
            vscode.window.showInformationMessage(`EcoCode AI: ${language.toUpperCase()} report generated!`);

        } catch (error: any) {
            vscode.window.showErrorMessage(`EcoCode AI Error: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}