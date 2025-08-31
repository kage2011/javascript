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
      fields: ['組織選択', '役職','社員番号']
    });

    if (selfResp.records.length === 0) return event;
    const userInfo = data.filter(item => item["社員番号"].value === usercode);
    var sectionManager;
    var generalManager;
    var kokiManager = [];
    var kokiChief = [];
    var kaizenManager = [];
    var kaizenChief = [];
    var kaihastuManager = [];
    var kaihastuChief = [];

    selfResp.records.forEach( record =>{
      if ( userInfo['組織選択'].value[0].name === record['組織選択'].value[0].name){
        if (record['役職'].value === '課長'){
          sectionManager = record;
        }
        if (record['役職'].value === '部長'){
          generalManager = record;
        }
        if (record['組織選択'].value[0].name.includes('工機') && (record['役職'].value === '課長' || record['役職'].value === '次長')){
          kokiManager.push(record);
        }
        if (record['組織選択'].value[0].name.includes('工機') && record['役職'].value === '係長'){
          kokiChief.push(record);
        }
        if (record['組織選択'].value[0].name.includes('改善推進') && (record['役職'].value === '課長' || record['役職'].value === '次長')){
          kaizenManager.push(record);
        }
        if (record['組織選択'].value[0].name.includes('改善推進') && record['役職'].value === '係長'){
          kaizenChief.push(record);
        }
        if (record['組織選択'].value[0].name.includes('開発') && (record['役職'].value === '課長' || record['役職'].value === '次長')){
          kaihastuManager.push(record);
        }
        if (record['組織選択'].value[0].name.includes('開発') && record['役職'].value === '係長'){
          kaihastuChief.push(record);
        }
      }
    })
    
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

