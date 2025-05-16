
window.addEventListener('load', function () {
    let isinit = false;
    let showidx = 0;
    let added = false;
    // 監視対象の親要素を取得
    const parentNode = document.body; // 親要素を監視

    // オプション設定
    const config = { childList: true, subtree: true };

    function addevent(mutationsList){
        added = false;
        mutationsList.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE && node.innerText.includes("種類")) {
                    console.log("種類が含まれる要素:", node);
                    if (!isinit){
                        startObservingTargetElement();
                    };
                    // 目的のボタン要素を取得
                    const targetElement = node.querySelector('.kb-icon.kb-icon-lookup.kb-search');
                    if (targetElement && isinit && !added) {
                        targetElement.addEventListener('click', () => {
                            // 親要素をたどり、`row-idx`を取得
                            let current = targetElement;
                            while (current && !current.hasAttribute('row-idx')) {
                                current = current.parentElement;
                            }
                            if (current && current.hasAttribute('row-idx')) {
                                const rowIdx = current.getAttribute('row-idx');
                                console.log("取得した row-idx 値:", rowIdx);
                                showidx = parseInt(rowIdx);
                                startObservingDispleychange();
                            } else {
                                console.log("row-idx 属性が見つかりませんでした。");
                            }
                        });
                        added = true;
                    }
                    isinit = true;
                }
            });
        });
    }

    // オブザーバーインスタンスを生成
    const observer = new MutationObserver((mutationsList) => {
        addevent(mutationsList);
    });

    // 監視を開始
    observer.observe(parentNode, config);

    function startObservingTargetElement() {
        // 監視対象の親要素を取得
        const parentNode = document.body; // 親要素を監視
        // オプション設定
        const config = { childList: true, subtree: true };
        // MutationObserverを設定
        const Observer = new MutationObserver((mutationsList) => {
            addevent(mutationsList);
        });

        // Observerを開始
        Observer.observe(parentNode, config);
    }

    function startObservingDispleychange() {
        const targetElements = document.querySelectorAll('body > div');
        targetElements.forEach(element => {
            if (element) {
                // displayの変更を監視
                const styleObserver = new MutationObserver((mutationsList) => {
                    mutationsList.forEach(mutation => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                            const displayStyle = window.getComputedStyle(element).display;
                            if (displayStyle === 'flex') {
                                console.log("displayがflexになった要素:", mutation);

                                // 子要素に"品名"が含まれるか確認
                                const has品名 = [...mutation.querySelectorAll("*")].some(el => el.textContent.includes("品名"));
                                if (has品名) {
                                    console.log("品名が含まれる要素が見つかりました:", mutation);

                                    // row-idxと一致する値を検索
                                    const rows = document.querySelectorAll("body > div.kb-injector > div > main > table:nth-child(3) > tbody > tr");
                                    rows.forEach((row) => {
                                        if (row.getAttribute("row-idx") === showidx) {
                                            const targetValue = row.querySelector("td:nth-child(1) > div > div.kb-field-value.kb-dropdown > span")?.textContent;
                                            if (targetValue) {
                                                console.log("取得した値:", targetValue);
                                            }
                                        }
                                    });
                                }
                                runAdditionalProcess(); // フィルタリング処理を実行
                            }
                        }
                    });
                });
    
                // オプション設定：style属性の変更を監視
                const styleConfig = { attributes: true, attributeFilter: ['style'] };
                styleObserver.observe(element, styleConfig);
            } else {
                console.error('対象の要素が見つかりませんでした！');
            }
        });
        // // displayが"flex"になることを監視
        // const observer = new MutationObserver((mutationsList) => {
        //     mutationsList.forEach((mutation) => {
        //         mutation.addedNodes.forEach((node) => {
        //             if (node.nodeType === Node.ELEMENT_NODE) {
        //                 const computedStyle = getComputedStyle(node);
        //                 if (computedStyle.display === "flex") {
        //                     console.log("displayがflexになった要素:", node);

        //                     // 子要素に"品名"が含まれるか確認
        //                     const has品名 = [...node.querySelectorAll("*")].some(el => el.textContent.includes("品名"));
        //                     if (has品名) {
        //                         console.log("品名が含まれる要素が見つかりました:", node);

        //                         // row-idxと一致する値を検索
        //                         const rows = document.querySelectorAll("body > div.kb-injector > div > main > table:nth-child(3) > tbody > tr");
        //                         rows.forEach((row) => {
        //                             if (row.getAttribute("row-idx") === showidx) {
        //                                 const targetValue = row.querySelector("td:nth-child(1) > div > div.kb-field-value.kb-dropdown > span")?.textContent;
        //                                 if (targetValue) {
        //                                     console.log("取得した値:", targetValue);
        //                                 }
        //                             }
        //                         });
        //                     }
        //                 }
        //             }
        //         });
        //     });
        // });

        // // 監視を開始
        // observer.observe(document.body, { childList: true, subtree: true });    
}



    function runAdditionalProcess() {
        const typeDropdown = document.querySelector('[field-id="種類"] .kb-field-value.kb-dropdown > span');
        const sizeTable = document.querySelectorAll('body > div > div > div > table > tbody');
        
        if (typeDropdown && sizeTable) {
            let selectedType = typeDropdown.textContent;
            selectedType = selectedType.split('（')[0].trim(); // '('の前を取得してトリム
            if (selectedType === "兼用帽子"){
                selectedType = "帽子";
            }
            const rows = Array.from(sizeTable.querySelectorAll('tr'));
            rows.forEach(row => {
                const spanElement = row.querySelector('td > div > div > span');
                const spanText = spanElement ? spanElement.textContent : '';
                if (spanText.includes(selectedType)) {
                    row.style.display = ''; // 表示
                } else {
                    row.style.display = 'none'; // 非表示
                }
            });
        } else {
            console.error('「種類」のドロップダウンまたはテーブルが見つかりませんでした！');
        }
    }
});
