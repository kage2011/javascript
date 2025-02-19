// crypto-jsライブラリをCDNから読み込む
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js";
document.head.appendChild(script);

window.addEventListener('load', function () {
    function decrypt(encryptedText, password) {
        try {
            console.log("🔹 URLエンコードされた暗号化データ:", encryptedText);
            
            encryptedText = decodeURIComponent(encryptedText);
            console.log("🔹 デコード後のデータ:", encryptedText);
    
            const parts = encryptedText.split(':');
            if (parts.length !== 2) {
                throw new Error('無効なデータ形式です。');
            }
    
            const iv = CryptoJS.enc.Hex.parse(parts[0]);
            const encryptedData = CryptoJS.enc.Hex.parse(parts[1]);
            const key = CryptoJS.SHA256(password); // AESキーを生成
    
            const decryptedBytes = CryptoJS.AES.decrypt(
                { ciphertext: encryptedData },
                key,
                { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
            );
    
            let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
            console.log("🔹 復号後の文字列:", decryptedText);
    
            // 修正: URLデコード
            decryptedText = decodeURIComponent(decryptedText);
            console.log("🔹 URLデコード後の文字列:", decryptedText);
    
            // 修正: クエリ文字列をオブジェクトに変換
            const params = new URLSearchParams(decryptedText);
            const decryptedData = {};
            params.forEach((value, key) => {
                decryptedData[key] = value.replace(/^"|"$/g, ''); // 余計な " を削除
            });
    
            console.log("🔹 パース後のデータ:", decryptedData);
            
            return decryptedData;
        } catch (error) {
            console.error("❌ 復号エラー:", error);
            return null;
        }
    }
    // 現在のページのURLを取得（キーとして使用）
    var pageKey = window.location.href;

    setTimeout(function () {
        // 付与されたパラメータを取得
        var params = new URLSearchParams(window.location.search);
        const encryptedText = params.get('data');
        const password = 'og-ogsas';
        if(params){
            try {
                const decryptedData = decrypt(encryptedText, password);
                console.log('複合化されたデータ:', decryptedData);
    
                // 復号したデータをパースして各入力フィールドに反映
                const paramsObject = Object.fromEntries(new URLSearchParams(decryptedData));
                for (const [key, value] of Object.entries(paramsObject)) {
                    var inputField = document.querySelector(`.kb-field[field-id="${key}"] input[data-type="text"]`);
                    if (inputField) {
                        inputField.value = value;
                    }
                }
            } catch (error) {
                console.error(error.message);
            }
        }
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
