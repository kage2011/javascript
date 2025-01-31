document.addEventListener('load', function() {
    // 入力フィールドとボタンを作成
    var saveButton = document.createElement('button');
    saveButton.id = 'saveButton';
    saveButton.textContent = '保存';
    var title = document.querySelectorAll('kb-injector');
    title.appendChild(saveButton);

    // ボタンがクリックされたときの処理を追加
    saveButton.addEventListener('click', function() {
        // IDに'input'を含むすべてのinputタグを取得
        var inputFields = document.querySelectorAll('input');
        var data = [];

        // 各inputタグのclassと値をセットにしたオブジェクトを作成
        inputFields.forEach(function(inputField) {
            data.push({
                id: inputField.id,
                class: inputField.className,
                value: inputField.value
            });
        });

        // Blobオブジェクトを作成
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

        // ダウンロードリンクを作成
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'data.json';

        // ダウンロードリンクをクリックしてファイルを保存
        link.click();

        // オブジェクトURLを解放
        window.URL.revokeObjectURL(link.href);
    });
});
