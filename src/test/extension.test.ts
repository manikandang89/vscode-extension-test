import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
// Appended tests for activate

test('activate pushes a disposable into context.subscriptions', () => {
	const subscriptions: any[] = [];
	const context: any = { subscriptions };

	myExtension.activate(context);

	// At least one disposable should have been pushed
	if (subscriptions.length === 0) {
		throw new Error('No disposables were pushed to context.subscriptions');
	}

	const last = subscriptions[subscriptions.length - 1];
	if (!last || typeof last.dispose !== 'function') {
		throw new Error('Pushed item is not a disposable with a dispose() method');
	}

	// Cleanup
	try {
		last.dispose();
	} catch {
		// ignore dispose errors in cleanup
	}
});

test('registered command executes and shows information message', async () => {
	const subscriptions: any[] = [];
	const context: any = { subscriptions };

	// Stub showInformationMessage
	const originalShow = (vscode.window as any).showInformationMessage;
	let calledWith: any = undefined;
	(vscode.window as any).showInformationMessage = (msg: any) => {
		calledWith = msg;
		return Promise.resolve(undefined);
	};

	try {
		myExtension.activate(context);

		// Execute the command that should have been registered by activate
		await vscode.commands.executeCommand('my-test-extension.helloWorld');

		if (calledWith !== 'Hello World from my-test-extension!') {
			throw new Error(`showInformationMessage was not called with expected text. Actual: ${String(calledWith)}`);
		}
	} finally {
		// Restore original
		(vscode.window as any).showInformationMessage = originalShow;

		// Dispose any registered disposables
		for (const d of subscriptions) {
			try {
				if (d && typeof d.dispose === 'function') {
					d.dispose();
				}
			} catch {
				// ignore
			}
		}
	}
});
