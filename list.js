window.addEventListener('load', function() {
    // 前回保存されたデータをlocalStorageから読み込む
    var savedData = localStorage.getItem('inputData');
    if (savedData) {
        var data = JSON.parse(savedData);
        var inputs = document.querySelectorAll('input');
        var i = 0;
        data.forEach(function(item) {
            var inputField = inputs[i];
            if (inputField) {
                inputField.value = item.value;
            }
            i++;
        });
    }

    setTimeout(function() {
        // 入力フィールドとボタンを作成
        var saveButton = document.createElement('button');
        saveButton.id = 'saveButton';
        saveButton.textContent = '保存';
        var title = document.querySelectorAll('.kb-injector-header-title');
        title[0].appendChild(saveButton);
    
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
    
            // データをlocalStorageに保存
            localStorage.setItem('inputData', JSON.stringify(data));
            alert('データが保存されました');
        });
    }, 2000);
});
