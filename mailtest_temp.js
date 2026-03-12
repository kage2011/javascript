(function() {
    'use strict';

    let quoteType = '';

    const BASIC_BUTTON_STYLE = `
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

    async function createRecord(record){
        const body = {
            app : kintone.app.getId(),
            record : record
            // {
            //     [CONFIG.ATTACH_FILE_FIELD]:{
            //         value:attachFile
            //     },
            //     [CONFIG.CONTENT_FIELD]:{
            //         value:content
            //     },
            //     [CONFIG.TITLE_FIELD]:{
            //         value:title
            //     },
            //     [CONFIG.RECIPIENT_FIELD]:{
            //         value:recipient
            //     }
            // }
        }
        await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', body)
        .then(function(resp){
            // レコード作成画面を開く
            const recordID = parseInt(resp['id']);
            setTimeout(() => {
                 window.open(`/k/${appId}/show#record=${recordID}&mode=edit`, '_blank');
                console.log("3秒後に実行されました");
            }, 3000); // 単位はミリ秒（＝3秒）
            console.log(resp);
        });
        
    }

    // 詳細画面にボタンを追加
    kintone.events.on(['app.record.detail.show'], function(event) {
        const record = event.record;
        
        // ボタンを作成
        const button_forward = document.createElement('button');
        const button_reply = document.createElement('button');
        const button_allreply = document.createElement('button');
        button_forward.textContent = '転送する';
        button_reply.textContent = '返信する';
        button_allreply.textContent = '全員に返信';
        
        // ツールチップを設定（1秒後に表示）
        button_forward.title = button_forward.textContent;
        button_reply.title = button_reply.textContent;
        button_allreply.title = button_allreply.textContent;
        
        // CSSスタイルを適用
        button_forward.style.cssText = BASIC_BUTTON_STYLE;
        button_reply.style.cssText = BASIC_BUTTON_STYLE;
        button_allreply.style.cssText = BASIC_BUTTON_STYLE;
        
        // ホバー効果を追加
        button_forward.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f4f6f7';
        });
        button_reply.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f4f6f7';
        });
        button_allreply.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f4f6f7';
        });
        
        button_forward.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#f7f9fa';
        });
        button_reply.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#f7f9fa';
        });
        button_allreply.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#f7f9fa';
        });
        
        // クリック時の処理
        button_forward.onclick = function() {
            // 引用したい値をlocalStorageに保存
            const dataToQuote = {
                // 例：以下のフィールドコードを実際のものに変更してください
                タイトル: { value : 'Fw :' + record.タイトル.value },
                本文: { value : record.本文.value },
                添付ファイル: { value : record.添付ファイル.value },
                // 必要な分だけ追加
            };
            createRecord(dataToQuote);
        };
        button_reply.onclick = function() {
            // 引用したい値をlocalStorageに保存
            const dataToQuote = {
                // 例：以下のフィールドコードを実際のものに変更してください
                タイトル: { value : 'Re :' + record.タイトル.value },
                本文: { value : 
                        '\n\n-----------------------------------------------------\n' + 
                        record.本文.value +
                        '-----------------------------------------------------'
                        },
                宛先: { value : record.作成者.value },
                // 必要な分だけ追加
            };
            createRecord(dataToQuote);
        };
        button_allreply.onclick = function() {
            // 引用したい値をlocalStorageに保存
            let sendlist = []
            sendlist += record.作成者.value;
            sendlist += record.宛先.value;
            const dataToQuote = {
                // 例：以下のフィールドコードを実際のものに変更してください
                タイトル: { value : 'Re :' + record.タイトル.value },
                本文: { value : 
                        '\n\n-----------------------------------------------------\n' + 
                        record.本文.value +
                        '-----------------------------------------------------'
                        },
                宛先: { value : sendlist },
                // 必要な分だけ追加
            };
            createRecord(dataToQuote);
        };
        
        // gaia-app-statusbar-actionlistに配置
        const actionList = document.querySelector('.gaia-app-statusbar-actionlist');
        if (actionList) {
            actionList.appendChild(button_forward);
            actionList.appendChild(button_reply);
            actionList.appendChild(button_allreply);
        } else {
            // フォールバック：actionlistが見つからない場合はヘッダーメニューに配置
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(button);
        }
        
        return event;
    });
        
})();