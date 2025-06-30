(() => {
    'use strict';
    // 設定値（実際の環境に合わせて変更してください）
    const CONFIG = {
        ATTACH_FILE_FIELD: '添付ファイル',     // 添付ファイル
        CONTENT_FIELD: '本文',                // 本文
        TITLE_FIELD: 'タイトル',              // タイトル
        RECIPIENT_FIELD: '宛先',              // 宛先
        CREATOR_FIELD: '作成者',              // 作成者
        CREATED_AT_FIELD: '作成日時'          // 作成日時
    };
    
    // レコード詳細画面表示時のイベント
    kintone.events.on('app.record.detail.show', (event) => {
        const record = event.record;
        const appId = kintone.app.getId();
        
        // 既存のボタンが存在したら削除（重複防止）
        const existingButtons = document.querySelectorAll('.custom-reply-buttons');
        existingButtons.forEach(btn => btn.remove());
        
        // ボタンを配置するコンテナを作成
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'custom-reply-buttons';
        buttonContainer.style.cssText = `
        display: flex;
        gap: 8px;
        align-items: center;
        `;

        // 転送ボタン
        const forwardButton = createKintoneButton('転送する', 'forward');
        forwardButton.addEventListener('click', () => handleForward(record, appId));
        
        // 返信ボタン
        const replyButton = createKintoneButton('返信する', 'reply');
        replyButton.addEventListener('click', () => handleReply(record, appId));
        
        // 全員に返信ボタン
        const replyAllButton = createKintoneButton('全員に返信', 'reply-all');
        replyAllButton.addEventListener('click', () => handleReplyAll(record, appId));
        
        // ボタンをコンテナに追加
        buttonContainer.appendChild(forwardButton);
        buttonContainer.appendChild(replyButton);
        buttonContainer.appendChild(replyAllButton);
        
        // kintoneの標準ボタンエリアに挿入
        const statusbarAction = document.querySelector('.gaia-app-statusbar-actionlist');
        if (statusbarAction) {
            statusbarAction.appendChild(buttonContainer);
        }
    });
  
    // kintone標準デザインのボタンを作成
    function createKintoneButton(text, type) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `${type}-button`;
        // ツールチップを設定（1秒後に表示）
        button.title = button.textContent;
        button.style.cssText = `
          -webkit-text-size-adjust: 100%;
          word-wrap: break-word;
          font-family: "メイリオ","Hiragino Kaku Gothic ProN",Meiryo,sans-serif;
          position: relative;
          box-sizing: border-box;
          height: 40px;
          border: 1px solid #e3e7e8;
          background-color: #f7f9fa;
          box-shadow: 1px 1px 1px #fff inset;
          color: #3498db;
          text-overflow: ellipsis;
          display: inline-block;
          margin-right: 8px;
          padding: 0 40px 0 16px;
          min-width: 80px;
          max-width: 280px;
          font-size: 14px;
          line-height: 1;
          vertical-align: middle;
          margin-top: 3px;
          margin-bottom: 3px;
          overflow: visible;
          user-select: none;
          cursor: pointer;
          text-decoration: none;
          outline: none;
        `;
        // ホバー効果
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#f4f6f7';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#f7f9fa';
        });
        return button;
    }

    function fileDownload(filekey){
        return new Promise(function (resolve,reject){
            var url = kintone.api.url('/k/1/file',true) + '?filekey=' + filekey;
            var xhr = new XMLHttpRequest();
            xhr.open('GET',url);
            xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
            xhr.responseType = 'blob';
            xhr.onload = function () {
                if (xhr.status === 200){
                    resolve(xhr.response);
                }else{
                    reject(Error('ファイルダウンロードエラー：' + xhr.statusText));
                }
            };
            xhr.onerror = function () {
                reject(Error('ネットワークエラー'));
            };
        })
    }

    function fileUpload(fileName,contentType,data){
        var blob = new Blob([data],{type:contentType});

        var formData = new FormData();
        formData.append("__REQUEST_TOKEN__",kintone.getRequestToken());
        formData.append("file",blob,fileName);
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST",encodeURI('/k/v1/file.json'),false);
        xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
        xmlHttp.responseType = 'multiport/form-data';
        xmlHttp.send(formData);
        var key = JSON.parse(xmlHttp.responseText).fileKey;
        var PutPara = {
            "app":999,
            "updateKey":{ss}
        }
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
            // const fileKey = updata.fileKey;
            // const params = {
            // app: kintone.app.getId(),
            // id: kintone.app.record.getId(),
            // record: {
            //     file: {
            //     value: [{fileKey: fileKey}]
            //     }
            // }
            // };
            // kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', params);                
        }
        
        return processedFiles;
    }

    // 転送処理
    async function handleForward(record, appId) {
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
            const content = record[CONFIG.CONTENT_FIELD]?.value || '';
            const title = '転送: ' + (record[CONFIG.TITLE_FIELD]?.value || '');
            const filekeys = [];
            processedAttachments.forEach(item =>{
                filekeys.push({fileKey:item})
            })

            const body = {
                app: kintone.app.getId(),
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
            
            // レコード作成画面を開く
            const recordID = parseInt(response.id);
            window.open(`/k/${appId}/show#record=${recordID}&mode=edit`, '_blank');
            
            console.log('転送レコード作成完了:', response);
            
        } catch (error) {
            console.error('転送処理でエラーが発生しました:', error);
            alert('転送処理中にエラーが発生しました: ' + error.message);
        }
    }
  
    // 返信処理
    async function handleReply(record, appId) {
        try{            
            // 元のレコードの値をコピー
            const content = record[CONFIG.CONTENT_FIELD]?.value || '';
            const title = '返信: ' + (record[CONFIG.TITLE_FIELD]?.value || '');
            const creator = record[CONFIG.CREATOR_FIELD]?.value || [];
            const body = {
                app: kintone.app.getId(),
                record: {
                    [CONFIG.CONTENT_FIELD]: {
                        value: content
                    },
                    [CONFIG.TITLE_FIELD]: {
                        value: title
                    },
                    [CONFIG.RECIPIENT_FIELD]: {
                        value: creator
                    }
                }
            };
            
            const response = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', body);
            
            // レコード作成画面を開く
            const recordID = parseInt(response.id);
            window.open(`/k/${appId}/show#record=${recordID}&mode=edit`, '_blank');
            
            console.log('返信レコード作成完了:', response);
            
        } catch (error) {
            console.error('返信処理でエラーが発生しました:', error);
            alert('返信処理中にエラーが発生しました: ' + error.message);
        }
        // try {
        //     const newRecord = {};
        //     const loginUser = kintone.getLoginUser();
            
        //     // 送信先に元の作成者を設定
        //     const originalSender = record.作成者?.value || record.creator?.value;
        //     if (originalSender && newRecord.送信先) {
        //         newRecord.送信先 = { value: [originalSender] };
        //     } else if (originalSender && newRecord.to) {
        //         newRecord.to = { value: [originalSender] };
        //     }
            
        //     // 作成者を現在のユーザーに設定
        //     if (newRecord.作成者) {
        //         newRecord.作成者.value = loginUser.name;
        //     }
            
        //     // 件名に「Re:」を追加
        //     const originalSubject = record.件名?.value || record.subject?.value || '';
        //     const replySubject = originalSubject.startsWith('Re:') ? originalSubject : 'Re: ' + originalSubject;
            
        //     if (newRecord.件名) {
        //         newRecord.件名.value = replySubject;
        //     } else if (newRecord.subject) {
        //         newRecord.subject.value = replySubject;
        //     }
            
        //     // 元のメッセージを引用として追加
        //     const originalMessage = record.本文?.value || record.message?.value || '';
        //     const quotedMessage = `\n\n--- 元のメッセージ ---\n${originalMessage}`;
            
        //     if (newRecord.本文) {
        //         newRecord.本文.value = quotedMessage;
        //     } else if (newRecord.message) {
        //         newRecord.message.value = quotedMessage;
        //     }
            
        //     // レコード作成画面を開く
        //     window.open(`/k/${appId}/edit?${buildQueryString(newRecord)}`, '_blank');
            
        // } catch (error) {
        //     console.error('返信処理でエラーが発生しました:', error);
        //     alert('返信処理中にエラーが発生しました。');
        // }
    }
  
    // 全員に返信処理（現在は返信と同じ）
    async function handleReplyAll(record, appId) {
        try{
            const user = kintone.getLoginUser();            
            // 元のレコードの値をコピー
            const content = record[CONFIG.CONTENT_FIELD]?.value || '';
            const title = '返信: ' + (record[CONFIG.TITLE_FIELD]?.value || '');
            const creator = record[CONFIG.CREATOR_FIELD]?.value || [];
            const recipient = record[CONFIG.RECIPIENT_FIELD]?.value || [];
            const filteredrecipient = recipient.filter(pair=>pair[0].code != user.code);
            filteredrecipient.push(creator);
            const body = {
                app: kintone.app.getId(),
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
            
            // レコード作成画面を開く
            const recordID = parseInt(response.id);
            window.open(`/k/${appId}/show#record=${recordID}&mode=edit`, '_blank');
            
            console.log('返信レコード作成完了:', response);
            
        } catch (error) {
            console.error('返信処理でエラーが発生しました:', error);
            alert('返信処理中にエラーが発生しました: ' + error.message);
        }
    }
    
    // レコードデータをクエリ文字列に変換
    function buildQueryString(record) {
        const params = new URLSearchParams();
        
        Object.keys(record).forEach(fieldCode => {
            const field = record[fieldCode];
            if (field && field.value !== undefined) {
                if (Array.isArray(field.value)) {
                    // 配列の場合（ユーザー選択、チェックボックスなど）
                    field.value.forEach(val => {
                        params.append(fieldCode, typeof val === 'object' ? val.code || val.name : val);
                    });
                } else if (typeof field.value === 'object') {
                    // オブジェクトの場合
                    params.append(fieldCode, field.value.code || field.value.name || JSON.stringify(field.value));
                } else {
                    // 文字列、数値の場合
                    params.append(fieldCode, field.value);
                }
            }
        });
        
        return params.toString();
    }
  
})();