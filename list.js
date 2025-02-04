function hello() {
    console.log("ok");
}

window.onload = hello;

window.addEventListener('load', function () {
    // 現在のページのURLを取得（キーとして使用）
    var pageKey = window.location.href;

    setTimeout(function () {
        // 前回保存されたデータをlocalStorageから読み込む
        var savedData = localStorage.getItem(pageKey);
        if (savedData) {
            var data = JSON.parse(savedData);
            var inputs = document.querySelectorAll('input, select, textarea');
            var i = 0;
            data.fields.forEach(function (item) {
                var inputField = inputs[i];
                if (inputField) {
                    if (inputField.type === 'checkbox' || inputField.type === 'radio' ) {
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

        // 入力フィールドとボタンを作成
        var saveButton = document.createElement('button');
        saveButton.id = 'saveButton';
        saveButton.textContent = '保存';
        saveButton.style.backgroundColor = 'lime'; // ボタンの色を緑に設定
        saveButton.style.marginLeft = '10px'; // 左側にスペースを追加
        saveButton.style.verticalAlign = 'text-bottom';
        var title = document.querySelectorAll('.kb-injector-header-title');
        if (title[0]) {
            title[0].appendChild(saveButton);
        }

        // ボタンがクリックされたときの処理を追加
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
                    if (inputField.type === 'checkbox' || inputField.type === 'radio' ) {
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
    }, 2000);
});
