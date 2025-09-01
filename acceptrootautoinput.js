(function () {
  'use strict';
  const TEST_MODE = true;
  const EMPLOYEE_APP_ID = 221;
  const FIELD_CODES = {
    MANAGER: 'manager_user', // 課長用ユーザー選択フィールド
    DIRECTOR: 'director_user' // 部長用ユーザー選択フィールド
  };

  kintone.events.on('app.record.create.show', async function (event) {
    const record = event.record;
    event.record['修理担当者'].disabled = true;
    // 1. ログインユーザー情報取得
    const loginUser = kintone.getLoginUser();
    const userCode = loginUser.code;

    // 2. 社員名簿アプリから所属部署と肩書を取得
    // const querySelf = `社員番号 = "${userCode}"`;
    const querySelf = `就労状況 in ("在職") limit 500`;
    const selfResp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: EMPLOYEE_APP_ID,
      query: querySelf,
      fields: ['組織選択', '役職','氏名','社員番号','一次考課者','課長調整','部門調整']
    });

    if (selfResp.records.length === 0) return event;
    const userInfo = selfResp.records.filter(item => item["社員番号"].value === userCode);
    const loginUserData = [{'code':loginUser.code,'name':loginUser.name}]
    const sectionManager = [{'code':userInfo[0]['課長調整'].value[0].code,'name':userInfo[0]['課長調整'].value[0].name}];
    var kokiFirst = [];
    var kokSecond = [];
    var kaizenFirst = [];
    var kaizenSecond = [];
    var kaihatsuFirst = [];
    var kaihatsuSecond = [];

    selfResp.records.forEach( record =>{
      if (record['組織選択'].value[0].name.includes('工機') && record['役職'].value.includes('一般')){
        kokiFirst.push({'code':record['課長調整'].value[0].code,'name':record['課長調整'].value[0].name});
        kokSecond.push({'code':record['一次考課者'].value[0].code,'name':record['一次考課者'].value[0].name});
      }
      if (record['組織選択'].value[0].name.includes('改善推進') && record['役職'].value.includes('一般')){
        kaizenFirst.push({'code':record['課長調整'].value[0].code,'name':record['課長調整'].value[0].name});
        kaizenSecond.push({'code':record['一次考課者'].value[0].code,'name':record['一次考課者'].value[0].name});
      }
      if (record['組織選択'].value[0].name.includes('開発') && record['役職'].value.includes('一般')){
        kaihatsuFirst.push({'code':record['課長調整'].value[0].code,'name':record['課長調整'].value[0].name});
        kaihatsuSecond.push({'code':record['一次考課者'].value[0].code,'name':record['一次考課者'].value[0].name});
      }
    })
    if (TEST_MODE){
      record['工機課一次受理'].value = loginUserData;
      record['工機課二次受理'].value = loginUserData;
      record['改善推進課一次受理'].value = loginUserData;
      record['改善推進課二次受理'].value = loginUserData;
      record['開発課一次受理'].value = loginUserData;
      record['開発課二次受理'].value = loginUserData;
      record['提出部署課長'].value = loginUserData;
    }else{
      record['工機課一次受理'].value = kokiFirst;
      record['工機課二次受理'].value = kokSecond;
      record['改善推進課一次受理'].value = kaizenFirst;
      record['改善推進課二次受理'].value = kaizenSecond;
      record['開発課一次受理'].value = kaihatsuFirst;
      record['開発課二次受理'].value = kaihatsuSecond;
      record['提出部署課長'].value = sectionManager;
    }

    return event;
  });
  kintone.events.on('app.record.detail.show', async function (event) {
    const status = event.record['ステータス'].value;
    var section = "";
    if (status.includes('受理') || status.includes('振分')){
      if (status.includes('工機')){
        section = '工機課';
      }
      if (status.includes('改善')){
        section = '改善推進課';
      }
      if (status.includes('開発')){
        section = '開発課';
      }
      // 2. 社員名簿アプリから所属部署と肩書を取得
      // const querySelf = `社員番号 = "${userCode}"`;
      const querySelf = `組織選択 in ("${section}") and 就労状況 in ("在職") limit 500`;
      const selfResp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
        app: EMPLOYEE_APP_ID,
        query: querySelf,
        fields: ['氏名','社員番号']
      });
      const headerSpace = kintone.app.record.getHeaderMenuSpaceElement();
      selfResp.forEach( item => {
      // headerSpace.innerHTML = ''; // ← 既存要素を消したくない場合は削除
        const button = document.createElement('button');
        button.textContent = item[氏名].value;
        button.style.margin = '10px';
        button.style.padding = '8px 16px';
        button.style.backgroundColor = '#007bff';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        headerSpace.appendChild(button);
        console.log(item);
      })
    }
  });
})();

