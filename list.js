async function waitForElement(selector) {
    return new Promise((resolve) => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.matches && node.matches(selector)) {
                        observer.disconnect();
                        resolve(node);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // 既に要素が存在する場合
        const existingNode = document.querySelector(selector);
        if (existingNode) {
            observer.disconnect();
            resolve(existingNode);
        }
    });
}

async function initialize() {
    // kb-injector-header-title要素が表示されるのを待つ
    const titleElement = await waitForElement('.kb-injector-header-title');

    // デバイス特有の情報を取得（ここではユーザーエージェントを使用）
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
    saveButton.style.backgroundColor = 'lime'; // ボタンの色を緑に設定
    saveButton.style.marginLeft = '10px'; // 左側にスペースを追加
    saveButton.style.verticalAlign = 'text-bottom';
    titleElement.appendChild(saveButton);

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

// ページがロードされたらinitialize関数を呼び出す
window.addEventListener('load', function() {
    initialize().catch(error => console.error(error));
});
// function hello(){
//     console.log("ok");
// }

// window.onload = hello;

// window.addEventListener('load', function() {
//     // デバイス特有の情報を取得（ここではユーザーエージェントを使用）
//     var deviceInfo = navigator.userAgent;
//     setTimeout(function() {
//         // 前回保存されたデータをlocalStorageから読み込む
//         var savedData = localStorage.getItem(deviceInfo);
//         if (savedData) {
//             var data = JSON.parse(savedData);
//             var inputs = document.querySelectorAll('input, select');
//             var i = 0;
//             data.forEach(function(item) {
//                 var inputField = inputs[i];
//                 if (inputField) {
//                     inputField.value = item.value;
//                 }
//                 i++;
//             });
//         }

//         // 入力フィールドとボタンを作成
//         var saveButton = document.createElement('button');
//         saveButton.id = 'saveButton';
//         saveButton.textContent = '保存';
//         saveButton.style.backgroundColor = 'lime'; // ボタンの色を緑に設定
//         saveButton.style.marginLeft = '10px'; // 左側にスペースを追加
//         saveButton.style.verticalAlign = 'text-bottom';
//         var title = document.querySelectorAll('.kb-injector-header-title');
//         title[0].appendChild(saveButton);
    
//         // ボタンがクリックされたときの処理を追加
//         saveButton.addEventListener('click', function() {
//             // 警告を表示してユーザーに確認
//             var confirmSave = confirm('共有のデバイス（職場のパソコンなど）では保存したデータが第三者に見られる危険があります。それでも保存しますか？');
//             if (confirmSave) {
//                 // IDに'input'を含むすべてのinputタグを取得
//                 var inputFields = document.querySelectorAll('input, select');
//                 var data = [];
        
//                 // 各inputタグのclassと値をセットにしたオブジェクトを作成
//                 inputFields.forEach(function(inputField) {
//                     data.push({
//                         value: inputField.value
//                     });
//                 });
    
//                 // データをlocalStorageに保存
//                 localStorage.setItem(deviceInfo, JSON.stringify(data));
//                     // classが'test'のmain要素を取得
//                 var mainElement = document.querySelector('.kb-injector-body');
                
//                 if (mainElement) {
//                     // 'unsaved'属性を削除
//                     mainElement.removeAttribute('unsaved');
//                 }
//                 alert('データが保存されました');
//             }else {
//                 alert('保存がキャンセルされました');
//             }
//         });
//     }, 2000);
// });
