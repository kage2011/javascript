(function () {
  'use strict';

  // 修理依頼書の設定値
  const CONFIG = {
      CREATOR_FIELD: '作成者',     
      CREATED_AT_FIELD: '作成日時' ,
      REPAIR_TECHNICIAN: '修理担当者' ,
      OCCURRENCE_DATE: '発生日時',
      REQUEST_FORM_NO: '依頼書No',
      URGENCY:  '緊急度',
      REQUEST_TYPE: '依頼分類',
      PREFERRED_COMPLETION_SELECT:  '修理完了希望日選択',
      PREFERRED_COMPLETION_DATE:  '修理完了希望日',
      MACHINE_NO: '設備番号',
      MACHINE_LOCATE_FACTRY:  '設置工場',
      MACHINE_LOCATE_LINE:  '設置ライン',
      MACHINE_MANUFACTURING_DATE: '製造日',
      MACHINE_NAME: '設備名称',
      MACHINE_MODEL:  '型式',
      MACHINE_MAKER:  'メーカー',
      MACHINE_SERIAL_NO:  '製造番号',
      OCCURRENCE_TIMING:  '発生タイミング',
      OCCURRENCE_FREQUENCY:  '発生頻度',
      OCCURRENCE_INTERVAL:  '発生間隔',
      FAULT_SYMPTOM1: '症状1',
      FAULT_SYMPTOM2: '症状2',
      FAULT_SYMPTOM3: '症状3',
      FAULT_SYMPTOM4: '症状4',
      SYMPTOM_DETAIL: '症状詳細',
      ATTACH_FILE_FIELD: '添付ファイル',
      WORKER_FIELD: '作業者'            
  };

  // 修理依頼書の設定値
  const COMPLETION_CONFIG = {
      CREATOR_FIELD: '作成者',     
      CREATED_AT_FIELD: '作成日時' ,
      REPAIR_TECHNICIAN: '修理担当者' ,
      OCCURRENCE_DATE: '発生日時',
      REQUEST_FORM_NO: '依頼書No',
      URGENCY:  '緊急度',
      REQUEST_TYPE: '依頼分類',
      PREFERRED_COMPLETION_SELECT:  '修理完了希望日選択',
      PREFERRED_COMPLETION_DATE:  '修理完了希望日',
      MACHINE_NO: '設備番号',
      MACHINE_LOCATE_FACTRY:  '設置工場',
      MACHINE_LOCATE_LINE:  '設置ライン',
      MACHINE_MANUFACTURING_DATE: '製造日',
      MACHINE_NAME: '設備名称',
      MACHINE_MODEL:  '型式',
      MACHINE_MAKER:  'メーカー',
      MACHINE_SERIAL_NO:  '製造番号',
      OCCURRENCE_TIMING:  '発生タイミング',
      OCCURRENCE_FREQUENCY:  '発生頻度',
      OCCURRENCE_INTERVAL:  '発生間隔',
      FAULT_SYMPTOM: '症状',
      SYMPTOM_DETAIL: '症状詳細',
      ATTACH_FILE_FIELD: '添付ファイル',
      WORKER_FIELD: '作業者'            
  };

  const TEST_MODE = false;
  const EMPLOYEE_APP_ID = 221;

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
    const sectionDirector = [{'code':userInfo[0]['部門調整'].value[0].code,'name':userInfo[0]['部門調整'].value[0].name}];
    var kokiFirst = [];
    var kokiSecond = [];
    var kaizenFirst = [];
    var kaizenSecond = [];
    var kaihatsuFirst = [];
    var kaihatsuSecond = [];

    const departmentData = {
      '工機': { first: kokiFirst, second: kokSecond },
      '改善推進': { first: kaizenFirst, second: kaizenSecond },
      '開発': { first: kaihatsuFirst, second: kaihatsuSecond }
    };

    selfResp.records.forEach(record => {
      if (record['役職'].value.includes('一般')) return;

      const org = record['組織選択'].value[0].name;
      const dept = Object.keys(departmentData).find(key => org.includes(key));

      if (dept) {
        if (record['役職'].value.includes('課長')){
          const firstItem = {'code': record['社員番号'].value, 'name': record['氏名'].value};
          departmentData[dept].first.some(item => item.code === firstItem.code) || departmentData[dept].first.push(firstItem);
        }
        if (record['役職'].value.includes('係長')){
          const secondItem = {'code': record['社員番号'].value, 'name': record['氏名'].value};
          departmentData[dept].second.some(item => item.code === secondItem.code) || departmentData[dept].second.push(secondItem);
        }

      }
    })
    if (TEST_MODE){
      record['工機課係長'].value = loginUserData;
      record['工機課課長'].value = loginUserData;
      record['改善推進課係長'].value = loginUserData;
      record['改善推進課課長'].value = loginUserData;
      record['開発課係長'].value = loginUserData;
      record['開発課課長'].value = loginUserData;
      record['提出部署課長'].value = loginUserData;
      record['提出部署部長'].value = loginUserData;
    }else{
      record['工機課係長'].value = kokiFirst;
      record['工機課課長'].value = kokiSecond;
      record['改善推進課係長'].value = kaizenFirst;
      record['改善推進課課長'].value = kaizenSecond;
      record['開発課係長'].value = kaihatsuFirst;
      record['開発課課長'].value = kaihatsuSecond;
      record['提出部署課長'].value = sectionManager;
      record['提出部署部長'].value = sectionDirector;
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
      selfResp.records.forEach( record => {
      // headerSpace.innerHTML = ''; // ← 既存要素を消したくない場合は削除
        const button = document.createElement('button');
        const chargedname = record['氏名'].value;
        button.textContent = record['氏名'].value;
        button.style.margin = '10px';
        button.style.padding = '8px 16px';
        button.style.backgroundColor = '#007bff';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        ;

        // ボタン押下時の処理
        button.onclick = function() {
          const record = kintone.app.record.get().record;
          const body = {
            app: kintone.app.getId(),
            id: kintone.app.record.getId(),
            record: {
              '修理担当者': {
                value: chargedname
              }
            }
          };

          kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body, function(resp) {
            console.log('修理担当者を保存しました');
            location.reload();
          });
        }  
        
        headerSpace.appendChild(button);
        // console.log(item);
      })
    }

    if (status === "修理担当者決定"){
      const headerSpace = kintone.app.record.getHeaderMenuSpaceElement();
      // ボタンの重複を避けるため、既にボタンが存在していた場合は削除
      const existingButtons = document.querySelectorAll('.reportCreationButton');
      existingButtons.forEach(btn => btn.remove());
      
      // ボタンを生成
      const button = document.createElement('button');
      button.textContent = "報告書を作成";
      button.style.margin = '10px';
      button.style.padding = '8px 16px';
      button.style.backgroundColor = '#007bff';
      button.style.color = '#fff';
      button.style.border = 'none';
      button.style.borderRadius = '4px';
      button.style.cursor = 'pointer';
      button.className = 'reportCreationButton';

      button.addEventListener('click', () => reportCreation(event.record, kintone.app.getId(), event.recordId));
      
      headerSpace.appendChild(button);

    }

  });

  // 報告書レコードを作成し、移動する
  async function reportCreation(record, appId, fromId) {
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
          const creator = record[CONFIG.CREATOR_FIELD]?.value || '';
          const creatDate = record[CONFIG.CREATED_AT_FIELD]?.value || '';
          const repairTech = record[CONFIG.REPAIR_TECHNICIAN]?.value || '';
          const occurrenceDate = record[CONFIG.OCCURRENCE_DATE]?.value || '';
          const requestNo = record[CONFIG.REQUEST_FORM_NO]?.value || '';
          const urgency = record[CONFIG.URGENCY]?.value || '';
          const requestType = record[CONFIG.REQUEST_TYPE]?.value || '';
          const compSelect = record[CONFIG.PREFERRED_COMPLETION_SELECT]?.value || '';
          const compDate = record[CONFIG.PREFERRED_COMPLETION_DATE]?.value || '';
          const machineNo = record[CONFIG.MACHINE_NO]?.value || '';
          const machineFactory = record[CONFIG.MACHINE_LOCATE_FACTRY]?.value || '';
          const machineLine = record[CONFIG.MACHINE_LOCATE_LINE]?.value || '';
          const machineDate = record[CONFIG.MACHINE_MANUFACTURING_DATE]?.value || '';
          const machineName = record[CONFIG.MACHINE_NAME]?.value || '';
          const machineModel = record[CONFIG.MACHINE_MODEL]?.value || '';
          const machineMaker = record[CONFIG.MACHINE_MAKER]?.value || '';
          const machineSerial = record[CONFIG.MACHINE_SERIAL_NO]?.value || '';
          const occurrenceTiming = record[CONFIG.OCCURRENCE_TIMING]?.value || '';
          const occurrenceInterval = record[CONFIG.OCCURRENCE_INTERVAL]?.value || '';
          const faultSympton1 = record[CONFIG.FAULT_SYMPTOM1]?.value || '';
          const faultSympton2 = record[CONFIG.FAULT_SYMPTOM2]?.value || '';
          const faultSympton3 = record[CONFIG.FAULT_SYMPTOM3]?.value || '';
          const faultSympton4 = record[CONFIG.FAULT_SYMPTOM4]?.value || '';
          const symptonDetail = record[CONFIG.SYMPTOM_DETAIL]?.value || '';
          const filekeys = [];
          processedAttachments.forEach(item =>{
              filekeys.push({fileKey:item})
          })
          const user = kintone.getLoginUser();
          const body = {
              app: appId,
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
              app:appId,
              id:recordID,
              assignees: [user.code]
          }
          kintone.api(kintone.api.url('/k/v1/record/assignees.json', true), 'PUT', signee);
          // 新規作成レコードのIDを保存しておく
          sessionStorage.setItem('copiedFrom', fromId);
          sessionStorage.setItem('copiedTo', recordID);
          window.open(`/k/${appId}/show#record=${recordID}&mode=edit`, '_blank');
          
          console.log('転送レコード作成完了:', response);
          
      } catch (error) {
          console.error('転送処理でエラーが発生しました:', error);
          alert('転送処理中にエラーが発生しました: ' + error.message);
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
      }
      
      return processedFiles;
  }

})();

