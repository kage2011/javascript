// crypto-jsライブラリをCDNから読み込む
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js";
document.head.appendChild(script);

window.addEventListener('load', function () {
    // ライブラリが読み込まれた後に実行する処理
    function decrypt(encryptedText, password) {
        // IVと暗号文を分割
        const parts = encryptedText.split(':');
        if (parts.length !== 2) {
            throw new Error('無効なデータ形式です。');
        }

        const iv = CryptoJS.enc.Hex.parse(parts[0]);
        const encryptedData = parts[1];

        // AES複合化を実行
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(password), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return decryptedData;
    }

    // 現在のページのURLを取得（キーとして使用）
    var pageKey = window.location.href;

    setTimeout(function () {
        // URLのパラメータを取得
        var params = new URLSearchParams(window.location.search);

        // 使用例
        const encryptedText = params.get(name); // Node-REDから取得した暗号化データをここに設定
        const password = 'og-ogsas'; // 使用したパスワードを設定
    
        try {
            const decryptedData = decrypt(encryptedText, password);
            console.log('複合化されたデータ:', decryptedData);
        } catch (error) {
            console.error(error.message);
        }
        
        // 各パラメータに基づいて入力フィールドに値を設定
        decryptedData.forEach(function(value, key) {
            var inputField = document.querySelector(`.kb-field[field-id="${key}"] input[data-type="text"]`);
            if (inputField) {
                inputField.value = value; // パラメータの値を設定
            }
        });

        if(!params){
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
                            // checkboxの場合はchecked状態を復元
                            inputField.checked = item.checked;
                        } else {
                            // それ以外の場合はvalueを復元
                            inputField.value = item.value;
                        }
                    }
                    i++;
                });
            }
        
        }

        // 保存ボタンを作成
        var saveButton = document.createElement('button');
        saveButton.id = 'saveButton';
        saveButton.textContent = '保存';
        saveButton.style.backgroundColor = 'lime'; // ボタンの色を緑に設定
        saveButton.style.marginLeft = '10px'; // 左側にスペースを追加
        saveButton.style.verticalAlign = 'text-bottom';

        // クリアボタンを作成
        var clearButton = document.createElement('button');
        clearButton.id = 'clearButton';
        clearButton.textContent = 'クリア';
        clearButton.style.backgroundColor = 'red'; // ボタンの色を赤に設定
        clearButton.style.marginLeft = '10px'; // 左側にスペースを追加
        clearButton.style.verticalAlign = 'text-bottom';

        var title = document.querySelectorAll('.kb-injector-header-title');
        if (title[0]) {
            title[0].appendChild(saveButton);
            title[0].appendChild(clearButton);
        }

        // kb-injector-buttonクラスを持つすべての要素を取得
        var buttons = document.querySelectorAll('.kb-injector-button');

        // 各ボタンにクリックイベントを追加
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                localStorage.removeItem(pageKey);
            });
        });

        // 保存ボタンがクリックされたときの処理を追加
        saveButton.addEventListener('click', function () {
            // 警告を表示してユーザーに確認
            var confirmSave = confirm('共有のデバイス（職場のパソコンなど）では保存したデータが第三者に見られる危険があります。それでも保存しますか？');
            if (confirmSave) {
                // IDに'input'を含むすべてのinputタグを取得
                var inputFields = document.querySelectorAll('input, select, textarea');
                var data = {
                    url: pageKey, // 保存時に現在のページのURLを含む
                    fields: [] // 入力データを保存
                };

                // 各inputタグのclassと値をセットにしたオブジェクトを作成
                inputFields.forEach(function (inputField) {
                    if (inputField.type === 'checkbox' || inputField.type === 'radio') {
                        // checkboxの場合はchecked状態を保存
                        data.fields.push({
                            checked: inputField.checked
                        });
                    } else {
                        // それ以外の場合はvalueを保存
                        data.fields.push({
                            value: inputField.value
                        });
                    }
                });

                // データをlocalStorageに保存
                localStorage.setItem(pageKey, JSON.stringify(data));

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

        // クリアボタンがクリックされたときの処理を追加
        clearButton.addEventListener('click', function () {
            var confirmClear = confirm('現在のページの保存データをクリアしますか？');
            if (confirmClear) {
                localStorage.removeItem(pageKey);
                alert('保存データがクリアされました');
                window.location.reload(); // ページをリロードして入力フィールドを初期化
            } else {
                alert('クリアがキャンセルされました');
            }
        });
    }, 2000);
});
