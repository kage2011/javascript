window.addEventListener('load', function () {
    var pageKey = window.location.href;

    setTimeout(function () {
        var savedData = localStorage.getItem(pageKey);
        if (savedData) {
            var data = JSON.parse(savedData);
            data.fields.forEach(function (item) {
                var fieldElement = document.querySelector(`[field-id="${item.fieldId}"] input, [field-id="${item.fieldId}"] select, [field-id="${item.fieldId}"] textarea`);
                if (fieldElement) {
                    if (fieldElement.type === 'checkbox' || fieldElement.type === 'radio') {
                        fieldElement.checked = item.checked;
                    } else {
                        fieldElement.value = item.value;
                    }
                }
            });
        }

        var saveButton = document.createElement('button');
        saveButton.id = 'saveButton';
        saveButton.textContent = '保存';
        saveButton.style.backgroundColor = 'lime';
        saveButton.style.marginLeft = '10px';
        saveButton.style.verticalAlign = 'text-bottom';

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

        saveButton.addEventListener('click', function () {
            var confirmSave = confirm('共有のデバイスではデータが第三者に見られる危険があります。それでも保存しますか？');
            if (confirmSave) {
                var data = {
                    url: pageKey,
                    fields: []
                };

                var inputFields = document.querySelectorAll('.kb-field');
                inputFields.forEach(function (field) {
                    var fieldId = field.getAttribute('field-id');
                    var inputField = field.querySelector('input, select, textarea');
                    if (inputField) {
                        if (inputField.type === 'checkbox' || inputField.type === 'radio') {
                            data.fields.push({
                                fieldId: fieldId,
                                checked: inputField.checked
                            });
                        } else {
                            data.fields.push({
                                fieldId: fieldId,
                                value: inputField.value
                            });
                        }
                    }
                });

                localStorage.setItem(pageKey, JSON.stringify(data));
                
                // classが'.kb-injector-body'のmain要素を取得
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
    }, 2000);
});
