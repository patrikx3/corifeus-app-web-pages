/// <reference lib="webworker" />

import { constructMarkdown } from './markdown-core';

onmessage = function (e: MessageEvent<any>): void {
    const data: any = {
        requestId: e.data.requestId
    };

    try {
        data.html = constructMarkdown(e.data);
        data.success = true;
    } catch (error: any) {
        console.error(error);
        data.success = false;
        data.errorMessage = error.message;
    }
    postMessage(data);
};
