function hello(){
    console.log("ok");
}
window.onload = hello;

document.addEventListener('DOMContentLoaded', function() {
    // MutationObserverを作成
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    // .kb-injector-bodyが追加されたかチェック
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        (node.classList.contains('kb-injector-body') || 
                         (node.querySelector && node.querySelector('.kb-injector-body')))) {
                        
                        // オブザーバーを停止
                        observer.disconnect();
                        
                        // デバイス特有の情報を取得
                        var deviceInfo = navigator.userAgent;
                        
                        // 前回保存されたデータをlocalStorageから読み込む
                        var savedData = localStorage.getItem(deviceInfo);
                        if (savedData) {
                            var data = JSON.parse(savedData);
                            var inputs = document.querySelectorAll('input, select');
                            var i = 0;
                            data.forEach(function(item) {
                                var inputField = inputs[i];
                                if (inputField) {
                                    inputField.value = item.value;
                                }
                                i++;
                            });
                        }
                        
                        // 入力フィールドとボタンを作成
                        var saveButton = document.createElement('button');
                        saveButton.id = 'saveButton';
                        saveButton.textContent = '保存';
                        saveButton.style.backgroundColor = 'lime';
                        saveButton.style.marginLeft = '10px';
                        saveButton.style.verticalAlign = 'text-bottom';
                        
                        var title = document.querySelectorAll('.kb-injector-header-title');
                        if (title.length > 0) {
                            title[0].appendChild(saveButton);
                        }
                    
                        // ボタンがクリックされたときの処理を追加
                        saveButton.addEventListener('click', function() {
                            // 警告を表示してユーザーに確認
                            var confirmSave = confirm('共有のデバイス（職場のパソコンなど）では保存したデータが第三者に見られる危険があります。それでも保存しますか？');
                            if (confirmSave) {
                                // IDに'input'を含むすべてのinputタグを取得
                                var inputFields = document.querySelectorAll('input, select');
                                var data = [];
                    
                                // 各inputタグのclassと値をセットにしたオブジェクトを作成
                                inputFields.forEach(function(inputField) {
                                    data.push({
                                        value: inputField.value
                                    });
                                });
                
                                // データをlocalStorageに保存
                                localStorage.setItem(deviceInfo, JSON.stringify(data));
                                
                                // classが'test'のmain要素を取得
                                var mainElement = document.querySelector('.kb-injector-body');
                                
                                if (mainElement) {
                                    // 'unsaved'属性を削除
                                    mainElement.removeAttribute('unsaved');
                                }
                                alert('データが保存されました');
                            } else {
                                alert('保存がキャンセルされました');
                            }
                        });
                    }
                });
            }
        });
    });

    // bodyの直下の変更を監視
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
