// crypto-jsライブラリをCDNから読み込む
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js";
document.head.appendChild(script);

var rowIndex = "";

async function fetchData(hash) {
    const url = 'https://urlshorter.kintonesendback.workers.dev/retrieve'; // Cloudflare WorkerのURL

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hash: hash }) // ハッシュ値をJSON形式で送信
    });

    if (!response.ok) {
        // レスポンスがエラーの場合
        console.error('Error fetching data:', response.status, response.statusText);
        return null;
    }

    const data = await response.json(); // レスポンスデータをJSON形式で取得
    return data; // 取得したデータを返す
}

function extractType(field,key,idx) {
    var query;
    var value;
    var inputtype = 0;
    switch (field[key]["type"]) {
        case 'SINGLE_LINE_TEXT':
            query = `${idx}.kb-field[field-id="${key}"] input`;
            value = field[key]["value"];
            inputtype = 1;
            break;
        case 'RADIO_BUTTON':
            query = `${idx}.kb-field[field-id="${key}"]`;
            value = field[key]["value"];
            inputtype = 2;
            break;
        case 'CHECK_BOX':
            query = `${idx}.kb-field[field-id="${key}"]`;
            value = field[key]["value"];
            inputtype = 2;
            break;
        case 'DROP_DOWN':
            query = `${idx}.kb-field[field-id="${key}"] select`;
            value = field[key]["value"];
            inputtype = 1;
            break;
        // case 'USER_SELECT':
        //     query = `.kb-field[field-id="${key}"] input`;
        //     value = field[key]["value"];
        //     break;
        case 'NUMBER':
            query = `${idx}.kb-field[field-id="${key}"] input`;
            value = field[key]["value"];
            inputtype = 1;
            break;
        // case 'ORGANIZATION_SELECT':
        //     query = `.kb-field[field-id="${key}"] input`;
        //     value = field[key]["value"];
        //     inputtype = 1;
        //     break;
        case 'DATE':
            query = `${idx}.kb-field[field-id="${key}"] input`;
            value = field[key]["value"];
            inputtype = 1;
            break;
        case 'TIME':
            query = `${idx}.kb-field[field-id="${key}"]`;
            value = field[key]["value"];
            inputtype = 3;
            break;
        case 'MULTI_LINE_TEXT':
            query = `${idx}.kb-field[field-id="${key}"] textarea`;
            value = field[key]["value"];
            inputtype = 1;
            break;
        case 'SUBTABLE':
            for (let i = 0; i < field[key]["value"].length; i++) {
                // 項目が複数ある場合は行を追加
                if (i > 0) {
                    var parent = document.querySelector(`${idx}table.kb-table[field-id="${key}"] tbody`);
                    var child = document.querySelector(`${idx}table.kb-table[field-id="${key}"] tbody tr`);
                    var clone = child.cloneNode(true);
                    clone.setAttribute('row-idx', i); // row-idx属性を変更
                    parent.appendChild(clone);
                    rowIndex = `row-idx="${i}" `;
                }
                Object.keys(field[key]["value"][i]).forEach(function(subkey) {
                    if (field[key]["value"][i][subkey]["type"] != 'NONE'){
                        extractType(field[key]["value"][i],subkey,rowIndex);
                    }
                });
            }
            // field[key]["value"].forEach(function(sub) {
            //     Object.keys(sub["value"]).forEach(function(subkey) {
            //         if (sub["value"][subkey]["type"] != 'NONE'){
            //             extractType(sub["value"],subkey);
            //         }
            //     });    
            // });
            // field[key]["value"].forEach(function(sub) {
            //     Object.keys(field[key]["value"]).forEach(function(subkey) {
            //         if (field[key]["value"][subkey]["type"] != 'NONE'){
            //             extractType(field[key]["value"],subkey);
            //         }
            //     });    
            // });
            return;
        default:
            break;
    }
    if (query) {
        switch (inputtype) {
            case 1:
                var inputField = document.querySelector(query);
                inputField.value = value;
            break;
            case 2:
                // var inputcheck = document.querySelector(query + " input[value='" + value + "']");
                var inputchecks = document.querySelectorAll(query + " input");
                inputchecks.forEach(element => {
                    element.checked = false;                    
                });
                var inputcheck = document.querySelector(query + " input[value='" + value + "']");
                var inputField = document.querySelector(query + " .kb-guide");
                inputField.textContent = value;
                inputcheck.checked = true;
            break;
            case 3:
                var inputhour = document.querySelector(query + " .kb-hour select");
                var inputminute = document.querySelector(query + " .kb-minute select");
                inputhour.value = value.split(":")[0];
                inputminute.value = value.split(":")[1];
            break;
            default:
            break;
        }
    }    
}

// 付与されたパラメータを取得
var params = new URLSearchParams(window.location.search);
var cryptoData;
const paramText = params.get('data');
if(params.size){
    fetchData(paramText)
        .then(data => {
            if (data) {
                cryptoData = data;
            } else {
                console.log('No data found for the given hash.');
            }
        });
}

window.addEventListener('load', function () {
    // 復号化関数
    function decrypt(encryptedText, password) {
        const parts = encryptedText.split(':'); // IVと暗号文を分割
        const iv = CryptoJS.enc.Hex.parse(parts[0]); // IVをHexからWordArrayに変換
        const ciphertext = CryptoJS.enc.Hex.parse(parts[1]); // 暗号文をHexからWordArrayに変換

        const key = CryptoJS.SHA256(password); // パスワードからキーを生成

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext },
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        return decrypted.toString(CryptoJS.enc.Utf8); // UTF-8形式で復号化されたテキストを返す
    }
    // 現在のページのURLを取得（キーとして使用）
    var pageKey = window.location.href;

    setTimeout(function () {
        // 付与されたパラメータを取得
        const password = 'og-ogsas';
        if(cryptoData){
            try {
                const decryptedData = decrypt(cryptoData, password);
                const jsonparam = JSON.parse(decryptedData);
                Object.keys(jsonparam).forEach(function(key) {
                    if (jsonparam[key]["type"] != 'NONE'){
                        extractType(jsonparam,key,"");
                    }
                });
                // // 復号したデータをパースして各入力フィールドに反映
                // const paramsObject = Object.fromEntries(new URLSearchParams(decryptedData));
                // for (const [key, value] of Object.entries(paramsObject)) {
                //     // var inputField = document.querySelector(`.kb-field[field-id="${key}"] input[data-type="text"]`);
                //     // var inputField = document.querySelector(`.kb-field[field-id="${key}"]`);// input[data-type="text"]`);
                //     var inputField = document.querySelector(`.kb-field[field-id="${key}"] input, .kb-field[field-id="${key}"] select, .kb-field[field-id="${key}"] textarea`);
                //     if (inputField) {
                //         inputField.value = value;
                //     }
                // }
            } catch (error) {
                console.error(error.message);
            }
        }
        if(!params.size){
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
