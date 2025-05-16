
window.addEventListener('load', function () {
    let showidx = 0;
    let selectedValue;
    // 監視対象の親要素を取得
    const parentNode = document.body; // 親要素を監視

    // オプション設定
    const config = { childList: true, subtree: true };

    function addevent(node){
        var dropdown = node.querySelector('select');
        dropdown.addEventListener('change', () => {
            var selectedValue = node.querySelector('tbody > tr > td > div > div > span').textContent;
            selectedType = selectedType.split('（')[0].trim(); // '('の前を取得してトリム
            if (selectedType === "兼用帽子"){
                selectedType = "帽子";
            }
            var targetElement = node.querySelector('[field-id="サイズ"] > div > input');
            targetElement.value = selectedValue;
        });
    }

    // オブザーバーインスタンスを生成
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
            mutation.addedNodes.forEach(elem => {
                if (elem.nodeType === Node.ELEMENT_NODE && elem.querySelector('[field-id="作業服"]')) {
                    var node = elem.innerText.includes("種類");
                    addevent(node);
                    startObservingTargetElement();
                }
            });
        });
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
            mutationsList.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.innerText.includes("種類")){
                        addevent(node);
                    }
                });
            });
        });
        // Observerを開始
        Observer.observe(parentNode, config);
    }

    // function startObservingDispleychange() {
    //     const targetElements = document.querySelectorAll('body > div');
    //     targetElements.forEach(element => {
    //         if (element) {
    //             // displayの変更を監視
    //             const styleObserver = new MutationObserver((mutationsList) => {
    //                 mutationsList.forEach(mutation => {
    //                     if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
    //                         const displayStyle = window.getComputedStyle(mutation.target).display; // mutation.target を使用
    //                         if (displayStyle === 'flex') {                                
    //                             // 子要素に"品名"が含まれるか確認
    //                             const has品名 = [...mutation.target.querySelectorAll("*")].some(el => el.textContent.includes("品名"));
    //                             if (has品名) {
    //                                 // row-idxと一致する値を検索
    //                                 const rows = document.querySelectorAll("body > div.kb-injector > div > main > table:nth-child(3) > tbody > tr");
    //                                 rows.forEach((row) => {
    //                                     if (parseInt(row.getAttribute("row-idx")) === showidx) {
    //                                         const targetValue = row.querySelector("td:nth-child(1) > div > div.kb-field-value.kb-dropdown > span")?.textContent;
    //                                         if (targetValue) {
    //                                             selectedValue = targetValue; 
    //                                         } else {
    //                                             selectedValue = "";
    //                                         }
    //                                     }
    //                                 });
    //                             }
    //                             styleObserver.disconnect();
    //                             runAdditionalProcess(mutation); // フィルタリング処理を実行
    //                         }
    //                     }
    //                 });
    //             });
                    
    //             // オプション設定：style属性の変更を監視
    //             const styleConfig = { attributes: true, attributeFilter: ['style'] };
    //             styleObserver.observe(element, styleConfig);
    //         }
    //     });
    // }

    // function runAdditionalProcess(mutation) {
    //     // 変更が起きた要素を取得
    //     const target = mutation.target;

    //     if (target instanceof HTMLElement) { // targetがHTML要素であることを確認
    //         // querySelectorAllを実行
    //         const rows = target.querySelectorAll('div > div > div > table > tbody > tr');
    //         if (selectedValue) {
    //             let selectedType = selectedValue;
    //             selectedType = selectedType.split('（')[0].trim(); // '('の前を取得してトリム
    //             if (selectedType === "兼用帽子"){
    //                 selectedType = "帽子";
    //             }
    //             rows.forEach(row => {
    //                 const spanElement = row.querySelector('td > div > div > span');
    //                 const spanText = spanElement ? spanElement.textContent : '';
    //                 if (spanText.includes(selectedType)) {
    //                     row.style.display = ''; // 表示
    //                 } else {
    //                     row.style.display = 'none'; // 非表示
    //                 }
    //             });
    //         }
    //     }        
    // }
});
