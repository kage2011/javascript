(() => {
    'use strict';
    const CONFIG = {
        ATTACH_FILE_FIELD: '添付ファイル',     // 添付ファイル
        CONTENT_FIELD: '本文',                // 本文
        TITLE_FIELD: 'タイトル',              // タイトル
        RECIPIENT_FIELD: '宛先',              // 宛先
        CREATOR_FIELD: '作成者',              // 作成者
        CREATED_AT_FIELD: '作成日時'          // 作成日時
    };
    // レコード詳細画面表示時のイベント
    kintone.events.on('app.record.create.show', (event) => {
        const record = event.record;
        const user = kintone.getLoginUser();            
        record[CONFIG.RECIPIENT_FIELD].value = [{code:user.code}];

    });
})();