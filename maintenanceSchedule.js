// windowのloadイベントを使用して、ページの読み込みが完了した後にスクリプトを実行
window.addEventListener('load', function () {

    const apiToken = 'zYzPURN2dTGfQiM0lnB5M30O6RtOhiWQiB7SvkdQ';
    const appId = 50;
    const query = encodeURIComponent('所属 in ("工機")');

    let records = [];

    fetch(`https://d37ksuq96l.execute-api.us-east-1.amazonaws.com/product/kintoneWebform/`, {
    method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log('取得したレコード:', data.body.body.records);
        records = data.body.body.records; // 取得したレコードを保存
    })
    .catch(error => {
        console.error('取得失敗:', error);
    });

    function addbutton(node) {
        // ボタンを作成
        var button = document.createElement('button');
        button.textContent = 'メンバー選択';
        button.className = 'kb-button kb-button-primary'; // スタイルを適用

        // ボタンのクリックイベントを設定
        button.addEventListener('click', function () {
            // オーバーレイを作成
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
            `;

            // ダイアログを作成
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background-color: white;
                border-radius: 8px;
                padding: 20px;
                max-width: 500px;
                max-height: 600px;
                overflow-y: auto;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;

            // タイトル
            const title = document.createElement('h3');
            title.textContent = 'メンバーを選択してください';
            title.style.cssText = 'margin-top: 0; margin-bottom: 20px; color: #333;';
            dialog.appendChild(title);
            // 参加メンバーの要素を取得
            var membersValue = node.value;
            const currentSelectedMembers = membersValue.split(',').map(member => member.trim());
            // 選択されたメンバーを保存する配列（既存の選択状態で初期化）
            const selectedMembers = [...currentSelectedMembers];

            // メンバーボタンのコンテナ
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = 'margin-bottom: 20px;';

            // 各メンバーのボタンを作成
            members.forEach(function(member) {
                const memberName = member[CONFIG.EMPLOYEE_NAME_FIELD].value;
                
                const memberButton = document.createElement('button');
                memberButton.textContent = memberName;
                memberButton.type = 'button';
                
                // 既存の選択状態をチェック
                const isSelected = selectedMembers.includes(memberName);
                
                memberButton.style.cssText = `
                    margin: 5px;
                    padding: 8px 12px;
                    background-color: ${isSelected ? '#3498db' : '#ecf0f1'};
                    color: ${isSelected ? 'white' : '#2c3e50'};
                    border: 2px solid ${isSelected ? '#2980b9' : '#bdc3c7'};
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                `;

                // メンバーボタンクリックイベント
                memberButton.addEventListener('click', function() {
                    const index = selectedMembers.indexOf(memberName);
                    
                    if (index === -1) {
                        // 選択状態にする
                        selectedMembers.push(memberName);
                        memberButton.style.backgroundColor = '#3498db';
                        memberButton.style.color = 'white';
                        memberButton.style.borderColor = '#2980b9';
                    } else {
                        // 選択解除
                        selectedMembers.splice(index, 1);
                        memberButton.style.backgroundColor = '#ecf0f1';
                        memberButton.style.color = '#2c3e50';
                        memberButton.style.borderColor = '#bdc3c7';
                    }
                });

                buttonContainer.appendChild(memberButton);
            });

            dialog.appendChild(buttonContainer);

            // ボタンエリア
            const buttonArea = document.createElement('div');
            buttonArea.style.cssText = 'text-align: right; border-top: 1px solid #eee; padding-top: 15px;';

            // キャンセルボタン
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'キャンセル';
            cancelButton.type = 'button';
            cancelButton.style.cssText = `
                margin-right: 10px;
                padding: 8px 16px;
                background-color: #95a5a6;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
            cancelButton.addEventListener('click', function() {
                document.body.removeChild(overlay);
            });

            // OKボタン
            const okButton = document.createElement('button');
            okButton.textContent = 'OK';
            okButton.type = 'button';
            okButton.style.cssText = `
                padding: 8px 16px;
                background-color: #27ae60;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
            okButton.addEventListener('click', function() {
                // 選択されたメンバーをカンマ区切りで参加メンバーフィールドに設定
                const memberText = selectedMembers.join(', ');
                
                const record = kintone.app.record.get();
                record.record[CONFIG.MEMBER_FIELD].value = memberText;
                kintone.app.record.set(record);

                // ダイアログを閉じる
                document.body.removeChild(overlay);

                console.log('選択されたメンバー:', memberText);
            });

            buttonArea.appendChild(cancelButton);
            buttonArea.appendChild(okButton);
            dialog.appendChild(buttonArea);

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // オーバーレイクリックでダイアログを閉じる
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            });
        });
        const memberElement = node;;
        // ボタンを要素に追加
        memberElement.appendChild(button);
    }
    
    
    // 監視対象の親要素を取得
    const parentNode = document.body; // 親要素を監視

    // オプション設定
    const config = { childList: true, subtree: true };

    // オブザーバーインスタンスを生成
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
            mutation.addedNodes.forEach(elem => {
                if (elem.nodeType === Node.ELEMENT_NODE && elem.querySelector('[field-id="参加メンバー"]')) {
                    var node = elem.querySelector('[field-id="参加メンバー"]');
                    addbutton(node);
                }
            });
        });
    });

    // 監視を開始
    observer.observe(parentNode, config);
});
