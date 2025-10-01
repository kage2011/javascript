window.addEventListener('load', function () {
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const doneDiv = Array.from(node.querySelectorAll('div'))
                        .find(div => div.textContent.trim() === 'Done!');
                    if (doneDiv) {
                        const container = doneDiv.parentElement;

                        // 同じコンテナ内のボタンを取得
                        const targetButton = Array.from(container.querySelectorAll('button'))
                            .find(btn => btn.textContent.trim() === 'OK');

                        if (targetButton) {
                            // イベントリスナーをリセット
                            const newButton = targetButton.cloneNode(true);
                            targetButton.replaceWith(newButton);

                            newButton.addEventListener('click', function () {
                                console.log('OKボタンがクリックされました');
                                // 任意の処理をここに追加
                            });
                        }
                    }
                }

                // テキストノードの変更も検知（Done!が後から追加される場合）
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'Done!') {
                    const doneDiv = node.parentElement;
                    const container = doneDiv.parentElement;

                    const targetButton = Array.from(container.querySelectorAll('button'))
                        .find(btn => btn.textContent.trim() === 'OK');

                    if (targetButton) {
                        const newButton = targetButton.cloneNode(true);
                        targetButton.replaceWith(newButton);

                        newButton.addEventListener('click', function () {
                            console.log('OKボタンがクリックされました（テキストノード検知）');
                        });
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
