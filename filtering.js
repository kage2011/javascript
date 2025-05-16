
window.addEventListener('load', function () {
    // 監視対象の親要素を取得
    const parentNode = document.body; // 親要素を監視

    // オプション設定
    const config = { childList: true, subtree: true };

    // コールバック関数
    const callback = function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches('div.kb-injector')) {
                        console.log('行が生成されました！');

                        // 行が生成されたらtargetElementの監視を開始
                        startObservingTargetElement();
                        
                        observer.disconnect(); // 監視を停止
                        return;
                    }
                });
            }
        }
    };

    // オブザーバーインスタンスを生成
    const observer = new MutationObserver(callback);

    // 監視を開始
    observer.observe(parentNode, config);

    function startObservingTargetElement() {
        // 監視対象の親要素を取得
        const parentNode = document.body; // 親要素を監視
        // オプション設定
        const config = { childList: true, subtree: true };
        // MutationObserverを設定
        const Observer = new MutationObserver((mutationsList) => {
            console.log(mutationsList);
            mutationsList.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.innerText.includes("種類")) {
                        console.log("種類が含まれる要素:", node);
                    }
                });
            });
        });
        Observer.observe(parentNode, config);
        const targetElements = document.querySelectorAll('body > div');
        // すべてのbody > div要素を取得
        // const allDivs = document.querySelectorAll('body > div');
        const allDivs = document.querySelectorAll('[品名]');
        
        // 条件を満たすdiv要素をフィルタリング
        const matchingDivs = Array.from(allDivs).filter(div => {
            // 指定された構造のtable > thead > tr > th > divを探す
            const targetDiv = div.querySelector('div > div > table > thead > tr > th > div');
            return targetDiv && targetDiv.textContent === '品名'; // textが「品名」か確認
        });
        
        // 結果をコンソールに表示
        console.log('条件に一致した要素:', matchingDivs);
        
        targetElements.forEach(element => {
            if (element) {
                // displayの変更を監視
                const styleObserver = new MutationObserver((mutationsList) => {
                    mutationsList.forEach(mutation => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                            const displayStyle = window.getComputedStyle(targetElement).display;
                            if (displayStyle === 'flex') {
                                console.log('displayがflexに変更されました！');
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
