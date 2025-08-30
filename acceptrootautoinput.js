(function () {
  'use strict';

  const EMPLOYEE_APP_ID = 221;
  const FIELD_CODES = {
    MANAGER: 'manager_user', // 課長用ユーザー選択フィールド
    DIRECTOR: 'director_user' // 部長用ユーザー選択フィールド
  };

  kintone.events.on('app.record.create.show', async function (event) {
    const record = event.record;

    // 1. ログインユーザー情報取得
    const loginUser = kintone.getLoginUser();
    const userCode = loginUser.code;

    // 2. 社員名簿アプリから所属部署と肩書を取得
    const querySelf = `社員番号 = "${userCode}"`;
    const selfResp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: EMPLOYEE_APP_ID,
      query: querySelf
    });

    if (selfResp.records.length === 0) return event;

    const department = selfResp.records[0].department.value;
    const title = selfResp.records[0].title.value;

    // 3. 同じ部署で肩書が「課長」「部長」のレコードを検索
    const queryLeaders = `department = "${department}" and (title = "課長" or title = "部長")`;
    const leadersResp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: EMPLOYEE_APP_ID,
      query: queryLeaders
    });

    // 4. 該当するユーザーのcodeを抽出してフィールドに設定
    leadersResp.records.forEach(rec => {
      const leaderCode = rec.user_code.value;
      const leaderName = rec.user_name.value;
      const title = rec.title.value;

      const userObj = { code: leaderCode, name: leaderName };

      if (title === '課長') {
        record[FIELD_CODES.MANAGER].value = [userObj];
      } else if (title === '部長') {
        record[FIELD_CODES.DIRECTOR].value = [userObj];
      }
    });

    return event;
  });
})();

