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
    // const querySelf = `社員番号 = "${userCode}"`;
    const querySelf = `就労状況 in ("在職") limit 500`;
    const selfResp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: EMPLOYEE_APP_ID,
      query: querySelf,
      fields: ['組織選択', '役職','社員番号','一次考課者','課長調整','部門調整']
    });

    if (selfResp.records.length === 0) return event;
    const userInfo = selfResp.records.filter(item => item["社員番号"].value === userCode);
    const sectionManager = {'code':userInfo[0]['課長調整'].value[0].code};
    var kokiManager = [];
    var kokiChief = [];
    var kokiLeader = [];
    var kaizenManager = [];
    var kaizenChief = [];
    var kaizenLeader = [];
    var kaihatsuManager = [];
    var kaihatsuChief = [];
    var kaihatsuLeader = [];

    selfResp.records.forEach( record =>{
      if (record['組織選択'].value[0].name.includes('工機') && record['役職'].value.includes('課長')){
        kokiManager.push({'code':record['社員番号'].value});
      }
      if (record['組織選択'].value[0].name.includes('工機') && record['役職'].value.includes('係長')){
        kokiChief.push({'code':record['社員番号'].value});
      }
      if (record['組織選択'].value[0].name.includes('工機') && record['役職'].value.includes('班長')){
        kokiLeader.push({'code':record['社員番号'].value});
      }
      if (record['組織選択'].value[0].name.includes('改善推進') && record['役職'].value.includes('課長')){
        kaizenManager.push({'code':record['社員番号'].value});
      }
      if (record['組織選択'].value[0].name.includes('改善推進') && record['役職'].value.includes('係長')){
        kaizenChief.push({'code':record['社員番号'].value});
      }
      if (record['組織選択'].value[0].name.includes('改善推進') && record['役職'].value.includes('班長')){
        kaizenLeader.push({'code':record['社員番号'].value});
      }
      if (record['組織選択'].value[0].name.includes('開発') && record['役職'].value.includes('課長')){
        kaihatsuManager.push({'code':record['社員番号'].value});
      }
      if (record['組織選択'].value[0].name.includes('開発') && record['役職'].value.includes('係長')){
        kaihatsuChief.push({'code':record['社員番号'].value});
      }
      if (record['組織選択'].value[0].name.includes('開発') && record['役職'].value.includes('班長')){
        kaihatsuLeader.push({'code':record['社員番号'].value});
      }
    })
    record['工機課課長'].value = kokiManager;
    record['工機課係長'].value = kokiChief;
    record['改善推進課課長'].value = kaizenManager;
    record['改善推進課係長'].value = kaizenChief;
    record['開発課課長'].value = kaihatsuManager;
    record['開発課係長'].value = kaihatsuChief;
    record['提出部署課長承認'].value = sectionManager;
  //   const filtered = selfResp.records.filter(record => {
  //     const orgName = record['組織選択']?.value?.[0]?.name || '';
  //     const title = record['役職']?.value || '';

  //     return (
  //       (orgName.includes('工機') && (title === '課長' || title === '係長')) ||
  //       (orgName.includes('改善推進') && (title === '課長' || title === '係長')) ||
  //       (orgName.includes('開発') && (title === '課長' || title === '係長'))
  //     );
  //   });

  // // 抽出した社員番号一覧を表示
  // const employeeCodes = filtered.map(record => record['社員番号']?.value);
  // console.log(employeeCodes);

  //   const department = selfResp.records[0].department.value;
  //   const title = selfResp.records[0].title.value;

  //   // 工機課長、係長取得
  //   // 改善推進課長、係長取得
  //   // 開発課長、係長取得


  //   // 3. 同じ部署で肩書が「課長」「部長」のレコードを検索
  //   const queryLeaders = `department = "${department}" and (title = "課長" or title = "部長")`;
  //   const leadersResp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
  //     app: EMPLOYEE_APP_ID,
  //     query: queryLeaders
  //   });

  //   // 4. 該当するユーザーのcodeを抽出してフィールドに設定
  //   leadersResp.records.forEach(rec => {
  //     const leaderCode = rec.user_code.value;
  //     const leaderName = rec.user_name.value;
  //     const title = rec.title.value;

  //     const userObj = { code: leaderCode, name: leaderName };

  //     if (title === '課長') {
  //       record[FIELD_CODES.MANAGER].value = [userObj];
  //     } else if (title === '部長') {
  //       record[FIELD_CODES.DIRECTOR].value = [userObj];
  //     }
  //   });

    return event;
  });
})();

