window.addEventListener('load', function () {
    const parentNode = document.body;
    const config = { childList: true, subtree: true };

    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
            mutation.addedNodes.forEach(elem => {
                if (elem.nodeType === Node.ELEMENT_NODE) {
                    // 「Done!」と書かれたdivを探す
                    const doneDiv = Array.from(elem.querySelectorAll('div'))
                        .find(div => div.textContent.trim() === 'Done!');

                    if (doneDiv) {
                        const container = doneDiv.parentElement;

                        // 同じコンテナ内の別のdivの下にあるbuttonを探す
                        const targetButton = Array.from(container.querySelectorAll('button'))
                            .find(btn => btn.textContent.trim() === 'OK'); // 例：OKボタン

                        if (targetButton) {
                            // 既存イベント削除（関数参照が必要）
                            targetButton.replaceWith(targetButton.cloneNode(true));
                            const newButton = container.querySelector('button');

                            // 新しいイベント追加
                            newButton.addEventListener('click', function () {
                                console.log('新しいOKボタンイベントが発火しました');
                                // 任意の処理をここに書く
                            });
                        }
                    }
                }
            });
        });
    });

    observer.observe(parentNode, config);
});
