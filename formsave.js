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
                        
                        // 前回保存されたデータをlocalStorageから読み込む
                        var savedData = localStorage.getItem(pageKey);
                        if (savedData) {
                            var data = JSON.parse(savedData);
                            var inputs = document.querySelectorAll('input, select, textarea');
                            var i = 0;
                            data.fields.forEach(function (item) {
                                var inputField = inputs[i];
                                if (inputField) {
                                    if (inputField.type === 'checkbox' || inputField.type === 'radio') {
                                        inputField.checked = item.checked;
                                    } else {
                                        inputField.value = item.value;
                                    }
                                }
                                i++;
                            });
                        }

                        // 保存ボタンを作成
                        var saveButton = document.createElement('button');
                        saveButton.id = 'saveButton';
                        saveButton.textContent = '保存';
                        saveButton.style.backgroundColor = 'lime';
                        saveButton.style.marginLeft = '10px';
                        saveButton.style.verticalAlign = 'text-bottom';

                        // クリアボタンを作成
                        var clearButton = document.createElement('button');
                        clearButton.id = 'clearButton';
                        clearButton.textContent = 'クリア';
                        clearButton.style.backgroundColor = 'red';
                        clearButton.style.marginLeft = '10px';
                        clearButton.style.verticalAlign = 'text-bottom';

                        var title = document.querySelectorAll('.kb-injector-header-title');
                        if (title[0]) {
                            title[0].appendChild(saveButton);
                            title[0].appendChild(clearButton);
                        }

                        // 各ボタンにクリックイベントを追加
                        var buttons = document.querySelectorAll('.kb-injector-button');
                        buttons.forEach(function (button) {
                            button.addEventListener('click', function () {
                                localStorage.removeItem(pageKey);
                            });
                        });

                        // ユーザーエージェントでモバイル端末を確認
                        function isMobile() {
                            return /Mobi/.test(navigator.userAgent);
                        }

                        if (!isMobile()) {
                            saveButton.disabled = true;
                            saveButton.style.opacity = 0.5;
                        }

                        // 保存ボタンがクリックされたときの処理
                        saveButton.addEventListener('click', function () {
                            if (isMobile()) {
                                var confirmSave = confirm('共有のデバイス（職場のパソコンなど）では保存したデータが第三者に見られる危険があります。それでも保存しますか？');
                                if (confirmSave) {
                                    var inputFields = document.querySelectorAll('input, select, textarea');
                                    var data = {
                                        url: pageKey,
                                        fields: []
                                    };

                                    inputFields.forEach(function (inputField) {
                                        if (inputField.type === 'checkbox' || inputField.type === 'radio') {
                                            data.fields.push({ checked: inputField.checked });
                                        } else {
                                            data.fields.push({ value: inputField.value });
                                        }
                                    });

                                    localStorage.setItem(pageKey, JSON.stringify(data));
                                    var mainElement = document.querySelector('.kb-injector-body');
                                    if (mainElement) {
                                        mainElement.removeAttribute('unsaved');
                                    }
                                    alert('データが保存されました');
                                } else {
                                    alert('保存がキャンセルされました');
                                }
                            } else {
                                alert('このデバイスでは保存機能は利用できません。');
                            }
                        });

                        // クリアボタンがクリックされたときの処理
                        clearButton.addEventListener('click', function () {
                            var confirmClear = confirm('現在のページの保存データをクリアしますか？');
                            if (confirmClear) {
                                localStorage.removeItem(pageKey);
                                alert('保存データがクリアされました');
                                window.location.reload();
                            } else {
                                alert('クリアがキャンセルされました');
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
