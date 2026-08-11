import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('ecocode.analyze', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('EcoCode AI: Please open a code file first!');
            return;
        }

        // 1. Capture highlighted code and current document language
        const selectedText = editor.document.getText(editor.selection);
        const language = editor.document.languageId;

        if (!selectedText) {
            vscode.window.showWarningMessage('EcoCode AI: Please highlight a block of code to analyze.');
            return;
        }

        vscode.window.showInformationMessage(`EcoCode AI: Running green computing evaluation for ${language}...`);

        // 2. Point to your live Cloud Proxy URL (from Step 1)
        const PROXY_URL = 'https://ecocode-proxy.vercel.app/api/analyze.js';

        try {
            // 3. Send payload to your private backend proxy
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: selectedText,
                    language: language
                })
            });

            if (!response.ok) {
                const errorPayload = await response.json() as any;
                throw new Error(errorPayload.error || `Server responded with status ${response.status}`);
            }

            const data = await response.json() as { result: string };

            // 4. Render the returned markdown string side-by-side using VS Code's previewer
            const doc = await vscode.workspace.openTextDocument({
                content: data.result,
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