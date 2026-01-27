(() => {
    'use strict';
    // 設定値（実際の環境に合わせて変更してください）
    const CONFIG = {
        ATTACH_FILE_FIELD: '添付ファイル',     // 添付ファイル
        CONTENT_FIELD: '本文',                // 本文
        TITLE_FIELD: 'タイトル',              // タイトル
        RECIPIENT_FIELD: '宛先',              // 宛先
        CREATOR_FIELD: '作成者',              // 作成者
        CREATED_AT_FIELD: '作成日時' ,         // 作成日時
        WORKER_FIELD: '作業者',                 // 作業者
        URL_FIELD: 'リンク_0'                  // URLリンク
    };

    const MailappID = 402;

    function addbuttons(event){
        const record = event.record;
        const appId = kintone.mobile.app.getId();
        const fromId = event.recordId;
        
        // ボタンコンテナを作成
        const buttonContainer = createButtonContainer();
        
        // 転送ボタン
        const forwardButton = createKintoneButton('Mail(メール)で転送', 'forward');
        forwardButton.addEventListener('click', () => handleForward(record, appId, fromId));
        
        // 返信ボタン
        const replyButton = createKintoneButton('Mail(メール)で返信', 'reply');
        replyButton.addEventListener('click', () => handleReply(record, appId, fromId));
        
        // 全員に返信ボタン
        // const replyAllButton = createKintoneButton('全員に返信', 'reply-all');
        // replyAllButton.addEventListener('click', () => handleReplyAll(record, appId, fromId));
        
        // ボタンをコンテナに追加
        buttonContainer.appendChild(forwardButton);
        buttonContainer.appendChild(replyButton);
        // buttonContainer.appendChild(replyAllButton);
        
        // kintoneの標準ボタンエリアの下に挿入
        const statusbarAction = document.querySelector('.gaia-mobile-v2-viewpanel-footer');
        if (statusbarAction) {
            // 親要素を取得
            const parentElement = statusbarAction.parentElement;
            if (parentElement) {
                // statusbarActionの次の要素として挿入
                parentElement.insertBefore(buttonContainer, statusbarAction.nextSibling);
            } else {
                // 親要素がない場合は従来の方法
                statusbarAction.appendChild(buttonContainer);
            }
        }
    }

    kintone.events.on('mobile.app.record.edit.show', (event) => {
        // 処理中フラグを設定
        let isProcessing = false;
        
        const setupCancelHandler = () => {
            const cancelBtn = document.querySelector('.gaia-mobile-v2-app-record-edittoolbar-cancel');
            
            if (!cancelBtn) {
                // ボタンが見つからない場合は少し待ってから再試行
                setTimeout(setupCancelHandler, 100);
                return;
            }
            
            // 既存のクリックハンドラーを無効化
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            
            newCancelBtn.addEventListener('click', async (e) => {
                // 既に処理中の場合は何もしない
                if (isProcessing) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                
                const copiedTo = parseInt(sessionStorage.getItem('copiedTo'));
                const copiedFrom = parseInt(sessionStorage.getItem('copiedFrom'));
                const recordID = event.recordId;
                const fromappID = parseInt(sessionStorage.getItem('fromappID'));
                
                if (copiedTo === recordID) {
                    // 処理開始
                    isProcessing = true;
                    
                    // イベントをキャンセル
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    try {
                        // ボタンを無効化
                        newCancelBtn.disabled = true;
                        newCancelBtn.textContent = '処理中...';
                        
                        // レコード削除実行
                        await kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', {
                            app: MailappID,
                            ids: [copiedTo]
                        });
                        
                        // sessionStorageをクリア
                        sessionStorage.removeItem('copiedTo');
                        sessionStorage.removeItem('copiedFrom');
                        sessionStorage.removeItem('fromappID');
                        
                        // 画面遷移
                        location.href = `/k/m/${fromappID}/show?record=${copiedFrom}`;
                        
                    } catch (error) {
                        console.error('レコード削除エラー:', error);
                        
                        // エラーの場合もsessionStorageをクリア
                        sessionStorage.removeItem('copiedTo');
                        sessionStorage.removeItem('copiedFrom');
                        sessionStorage.removeItem('fromappID');
                        
                        // 画面遷移
                        location.href = `/k/m/${fromappID}/show?record=${copiedFrom}`;
                    } finally {
                        isProcessing = false;
                    }
                }
            }, { once: false, capture: true });
        };
        
        // 少し待ってからセットアップ
        setTimeout(setupCancelHandler, 200);
        
        return event;
    });

    // レコード詳細画面表示時のイベント
    kintone.events.on('mobile.app.record.detail.show', (event) => {
        let checkCount = 0;
        const maxChecks = 100; // 10秒間チェック

        const checkForField = () => {
            checkCount++;
            
            const targetElement = document.querySelector('.gaia-mobile-v2-viewpanel-footer');
            if (targetElement) {
                addbuttons(event);
                return; // 処理完了
            }
            
            if (checkCount < maxChecks) {
                setTimeout(checkForField, 100);
            } else {
                console.log('フィールドが見つかりませんでした');
            }
        };

        // 少し待ってからチェック開始
        setTimeout(checkForField, 100);
    });

    // レスポンシブボタンコンテナを作成
    function createButtonContainer() {
        const container = document.createElement('div');
        container.className = 'email-buttons-container';
        container.style.cssText = `
            display: flex;
            flex-direction: row;
            gap: 8px;
            justify-content: center;
            align-items: center;
            width: 100%;
            padding: 10px 5px;
            box-sizing: border-box;
            margin-top: 10px;
            border-top: 1px solid #e0e0e0;
            background-color: #f9f9f9;
        `;
        
        // メディアクエリのスタイルを動的に追加
        if (!document.getElementById('email-buttons-responsive-styles')) {
            const style = document.createElement('style');
            style.id = 'email-buttons-responsive-styles';
            style.textContent = `
                @media (max-width: 480px) {
                    .email-buttons-container {
                        gap: 4px !important;
                        padding: 8px 3px !important;
                    }
                    .email-button-span {
                        flex: 1 !important;
                        min-width: 0 !important;
                    }
                    .email-button {
                        font-size: 1.1rem !important;
                        padding: 6px 4px !important;
                        min-height: 36px !important;
                    }
                }
                @media (min-width: 481px) and (max-width: 768px) {
                    .email-buttons-container {
                        gap: 6px !important;
                        padding: 8px 5px !important;
                    }
                    .email-button-span {
                        flex: 1 !important;
                        min-width: 70px !important;
                    }
                    .email-button {
                        font-size: 1.2rem !important;
                        padding: 7px 8px !important;
                        min-height: 38px !important;
                    }
                }
                @media (min-width: 769px) {
                    .email-buttons-container {
                        gap: 8px !important;
                        padding: 10px 5px !important;
                    }
                    .email-button-span {
                        min-width: 90px !important;
                    }
                    .email-button {
                        font-size: 1.3rem !important;
                        padding: 8px 12px !important;
                        min-height: 40px !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        return container;
    }

    // kintone標準デザインのレスポンシブボタンを作成
    function createKintoneButton(text, type) {
        const span = document.createElement('span');
        span.className = 'email-button-span';
        span.style.cssText = `
            -webkit-text-size-adjust: 100%;
            margin: 0;
            vertical-align: baseline;
            cursor: pointer;
            -webkit-appearance: button;
            font: 99% sans-serif;
            outline: 0;
            text-decoration: none;
            font-family: "メイリオ",Meiryo,"Hiragino Kaku Gothic ProN","ヒラギノ角ゴ ProN W3","ＭＳ Ｐゴシック","Lucida Grande","Lucida Sans Unicode",Arial,Verdana,sans-serif;
            background-color: inherit;
            border: 0;
            padding: 0;
            flex: 1;
            min-width: 80px;
            max-width: 150px;
            display: flex;
        `;
        
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `${type}-button email-button`;
        button.title = button.textContent;
        button.style.cssText = `
            -webkit-text-size-adjust: 100%;
            cursor: pointer;
            font: 99% sans-serif;
            font-family: "メイリオ",Meiryo,"Hiragino Kaku Gothic ProN","ヒラギノ角ゴ ProN W3","ＭＳ Ｐゴシック","Lucida Grande","Lucida Sans Unicode",Arial,Verdana,sans-serif;
            color: #fff;
            background-color: #206694;
            font-size: 1.4rem;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            word-wrap: normal;
            display: block;
            border: 2px solid #206694;
            border-radius: 6px;
            line-height: 1.2;
            padding: 8px 12px;
            width: 100%;
            box-sizing: border-box;
            min-height: 40px;
            transition: all 0.2s ease;
        `;
        
        // ホバー・アクティブ効果
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#1a5578';
            button.style.borderColor = '#1a5578';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#206694';
            button.style.borderColor = '#206694';
        });
        
        button.addEventListener('mousedown', () => {
            button.style.backgroundColor = '#144461';
            button.style.borderColor = '#144461';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.backgroundColor = '#1a5578';
            button.style.borderColor = '#1a5578';
        });
        
        span.appendChild(button);
        return span;
    }

    // 添付ファイルをダウンロードして再アップロード
    async function processAttachments(attachments) {
        if (!attachments || attachments.length === 0) {
            return [];
        }

        const processedFiles = [];
        
        for (const attachment of attachments) {
            // 手順1で取得したfileKeyをurlに設定します。
            const urlForDownload = kintone.api.urlForGet('/k/v1/file.json', {fileKey: attachment.fileKey}, true);

            // ファイルダウンロードAPIを実行します。
            const headers = {
            'X-Requested-With': 'XMLHttpRequest',
            };
            const downresp = await fetch(urlForDownload, {
            method: 'GET',
            headers,
            });
            const blob = await downresp.blob();
            // Blob を File に変換して名前を付ける
            const namedFile = new File([blob], attachment.name, { type: blob.type });
            const formData = new FormData();
            formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
            formData.append('file', namedFile);
            
            const upresp = await fetch('/k/v1/file.json', {
                method: 'POST',
                headers,
                body: formData,
            });
            const updata = await upresp.json();
            processedFiles.push(updata.fileKey);
        }
        
        return processedFiles;
    }

    // 転送処理
    async function handleForward(record, appId, fromId) {
        try {
            // 添付ファイルの処理
            const originalAttachments = record[CONFIG.ATTACH_FILE_FIELD]?.value || [];
            let processedAttachments = [];
            
            if (originalAttachments.length > 0) {
                console.log('添付ファイルを処理中...');
                processedAttachments = await processAttachments(originalAttachments);
                console.log('添付ファイル処理完了:', processedAttachments);
            }
            
            // 元のレコードの値をコピー
            var content = record[CONFIG.CONTENT_FIELD]?.value || '';
            const url = record[CONFIG.URL_FIELD]?.value || '';
            if (url != '' ){
                content = content + '\nURLリンク: ' + url;
            }
            const title = '転送: ' + (record[CONFIG.TITLE_FIELD]?.value || '');
            const filekeys = [];
            processedAttachments.forEach(item =>{
                filekeys.push({fileKey:item})
            })
            const user = kintone.getLoginUser();
            const body = {
                app: MailappID,
                record: {
                    [CONFIG.ATTACH_FILE_FIELD]: {
                        value: filekeys
                    },
                    [CONFIG.CONTENT_FIELD]: {
                        value: content
                    },
                    [CONFIG.TITLE_FIELD]: {
                        value: title
                    }
                }
            };
            
            const response = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', body);
            const recordID = parseInt(response.id);            
            // レコード作成画面を開く
            const signee = {
                app:MailappID,
                id:recordID,
                assignees: [user.code]
            }
            // kintone.api(kintone.api.url('/k/v1/record/assignees.json', true), 'PUT', signee);
            // 新規作成レコードのIDを保存しておく
            sessionStorage.setItem('copiedFrom', fromId);
            sessionStorage.setItem('copiedTo', recordID);
            sessionStorage.setItem('fromappID', appId);
            // window.open(`/k/m/${appId}/show?record=${recordID}#mode=edit`, '_blank');
            // 転送処理の最後で
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms待機
            location.href = `/k/m/${MailappID}/show?record=${recordID}#mode=edit`;
            // location.href = `/k/m/${appId}/show?record=${recordID}#mode=edit`;
            console.log('転送レコード作成完了:', response);
            
        } catch (error) {
            console.error('転送処理でエラーが発生しました:', error);
            alert('転送処理中にエラーが発生しました: ' + error.message);
        }
    }
  
    // 返信処理
    async function handleReply(record, appId, fromId) {
        try{            
             const user = kintone.getLoginUser();
           // 元のレコードの値をコピー
            var content = record[CONFIG.CONTENT_FIELD]?.value || '';
            const url = record[CONFIG.URL_FIELD]?.value || '';
            if (url != '' ){
                content = content + '\nURLリンク: ' + url;
            }
            const title = '返信: ' + (record[CONFIG.TITLE_FIELD]?.value || '');
            const creator = record[CONFIG.CREATOR_FIELD]?.value || [];
            const body = {
                app: MailappID,
                record: {
                    [CONFIG.CONTENT_FIELD]: {
                        value: content
                    },
                    [CONFIG.TITLE_FIELD]: {
                        value: title
                    },
                    [CONFIG.RECIPIENT_FIELD]: {
                        value: [creator]
                    }
                }
            };
            
            const response = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', body);
            
            // レコードID取得
            const recordID = parseInt(response.id);

            // 作業者を設定
            const signee = {
                app:MailappID,
                id:recordID,
                assignees: [user.code]
            }
            // kintone.api(kintone.api.url('/k/v1/record/assignees.json', true), 'PUT', signee);
            
            // 新規作成レコードのIDを保存しておく
            sessionStorage.setItem('copiedFrom', fromId);
            sessionStorage.setItem('copiedTo', recordID);
            sessionStorage.setItem('fromappID', appId);

            // 作成画面を開く
            // window.open(`/k/m/${appId}/show?record=${recordID}#mode=edit`, '_blank');
            location.href = `/k/m/${MailappID}/show?record=${recordID}#mode=edit`
            console.log('返信レコード作成完了:', response);
            
        } catch (error) {
            console.error('返信処理でエラーが発生しました:', error);
            alert('返信処理中にエラーが発生しました: ' + error.message);
        }
    }
  
    // 全員に返信処理（現在は返信と同じ）
    async function handleReplyAll(record, appId, fromId) {
        try{
            const user = kintone.getLoginUser();            
            // 元のレコードの値をコピー
            var content = record[CONFIG.CONTENT_FIELD]?.value || '';
            const url = record[CONFIG.URL_FIELD]?.value || '';
            if (url != '' ){
                content = content + '\nURLリンク: ' + url;
            }
            const title = '返信: ' + (record[CONFIG.TITLE_FIELD]?.value || '');
            const creator = record[CONFIG.CREATOR_FIELD]?.value || [];
            const recipient = record[CONFIG.RECIPIENT_FIELD]?.value || [];
            const filteredrecipient = recipient.filter(pair=>pair.code != user.code);
            filteredrecipient.push(creator);
            const body = {
                app: MailappID,
                record: {
                    [CONFIG.CONTENT_FIELD]: {
                        value: content
                    },
                    [CONFIG.TITLE_FIELD]: {
                        value: title
                    },
                    [CONFIG.RECIPIENT_FIELD]: {
                        value: filteredrecipient
                    }
                }
            };
            
            const response = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', body);
            
            // レコードID取得
            const recordID = parseInt(response.id);

            // 作業者を設定
            const signee = {
                app:MailappID,
                id:recordID,
                assignees: [user.code]
            }
            // await kintone.api(kintone.api.url('/k/v1/record/assignees.json', true), 'PUT', signee);
            
            // 新規作成レコードのIDを保存しておく
            sessionStorage.setItem('copiedFrom', fromId);
            sessionStorage.setItem('copiedTo', recordID);
            sessionStorage.setItem('fromappID', appId);

            // 作成画面を開く
            // window.open(`/k/m/${appId}/show?record=${recordID}#mode=edit`, '_blank');
            location.href = `/k/m/${MailappID}/show?record=${recordID}#mode=edit`
            console.log('返信レコード作成完了:', response);
            
        } catch (error) {
            console.error('返信処理でエラーが発生しました:', error);
            alert('返信処理中にエラーが発生しました: ' + error.message);
        }
    }  
})();