window.addEventListener('load', function () {
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                // テキストノードの変更検知（Done!が追加された場合）
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'Done!') {
                    // 社員番号フィールドのdivを取得
                    const fieldDiv = document.querySelector('[field-id="社員番号"]');

                    if (fieldDiv) {
                    // kb-guideクラスのspanを探す
                    const guideSpan = fieldDiv.querySelector('span.kb-guide');

                    if (guideSpan) {
                        const guideText = guideSpan.textContent.trim();
                        console.log('社員番号のガイドテキスト:', guideText);
                    } else {
                        console.warn('kb-guideクラスのspanが見つかりませんでした');
                    }
                    } else {
                        console.warn('field-id="社員番号" のdivが見つかりませんでした');
                    }
                    // const doneDiv = node.parentElement;
                    // const container = doneDiv.parentElement;

                    // const targetButton = Array.from(container.querySelectorAll('button'))
                    //     .find(btn => btn.textContent.trim() === 'OK');

                    // if (targetButton) {
                    //     const newButton = targetButton.cloneNode(true);
                    //     targetButton.replaceWith(newButton);

                    //     newButton.addEventListener('click', function () {
                    //         // 社員番号フィールドのdivを取得
                    //         const fieldDiv = document.querySelector('[field-id="社員番号"]');

                    //         if (fieldDiv) {
                    //         // kb-guideクラスのspanを探す
                    //         const guideSpan = fieldDiv.querySelector('span.kb-guide');

                    //         if (guideSpan) {
                    //             const guideText = guideSpan.textContent.trim();
                    //             console.log('社員番号のガイドテキスト:', guideText);
                    //         } else {
                    //             console.warn('kb-guideクラスのspanが見つかりませんでした');
                    //         }
                    //         } else {
                    //         console.warn('field-id="社員番号" のdivが見つかりませんでした');
                    //         }
                    //     });
                    // }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
