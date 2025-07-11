let records = [];
let members = [];
let tasks = [];
let schedule_readed = false;

// 色定義
const colors = {
    '計画': '#27ae60',
    'ロス取り': '#3498db',
    '改造': '#95a5a6',
    'OCS': '#f39c12',
    '保全カレンダー': '#e74c3c',
    '休み': '#f1c40f',
    '出張': '#8e44ad',
    '研修': '#2c3e50',
    'その他': '#7f8c8d',
};

// メンバー取得
function member_load() {
    fetch(`https://d37ksuq96l.execute-api.us-east-1.amazonaws.com/product/kintoneWebform/`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            records = data.body.records;
            members = records.sort((a, b) =>
                a.ふりがな.value.localeCompare(b.ふりがな.value, 'ja')
            );
        })
        .catch(error => console.error('取得失敗:', error));
}

// スケジュール取得
function schedule_load() {
    fetch(`https://d37ksuq96l.execute-api.us-east-1.amazonaws.com/product/kintoneWebform/schedule`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            tasks = data.body;
            schedule_readed = true;
        })
        .catch(error => console.error('取得失敗:', error));
}

function schedule_load_promise() {
    return new Promise((resolve, reject) => {
        fetch(`https://d37ksuq96l.execute-api.us-east-1.amazonaws.com/product/kintoneWebform/schedule`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                tasks = data.body;
                schedule_readed = true;
                resolve(data);
            })
            .catch(error => {
                console.error('取得失敗:', error);
                reject(error);
            });
    });
}

member_load();
schedule_load();

// 共通：メンバー選択ダイアログ
function showMemberSelectDialogCommon(selected, onOk) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5); z-index: 2147480000;
        display: flex; justify-content: center; align-items: center;
    `;
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white; border-radius: 8px; padding: 20px;
        max-width: 500px; max-height: 600px; overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    dialog.innerHTML = `<h3 style="margin-top:0;margin-bottom:20px;color:#333;">メンバーを選択してください</h3>`;
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginBottom = '20px';
    let selectedMembers = [...selected];

    members.forEach(member => {
        const name = member['氏名'].value;
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.type = 'button';
        const isSelected = selectedMembers.includes(name);
        btn.style.cssText = `
            margin:5px; padding:8px 12px;
            background-color:${isSelected ? '#3498db' : '#ecf0f1'};
            color:${isSelected ? 'white' : '#2c3e50'};
            border:2px solid ${isSelected ? '#2980b9' : '#bdc3c7'};
            border-radius:4px; cursor:pointer; font-size:14px; transition:all 0.2s;
        `;
        btn.onclick = () => {
            const idx = selectedMembers.indexOf(name);
            if (idx === -1) {
                selectedMembers.push(name);
                btn.style.backgroundColor = '#3498db';
                btn.style.color = 'white';
                btn.style.borderColor = '#2980b9';
            } else {
                selectedMembers.splice(idx, 1);
                btn.style.backgroundColor = '#ecf0f1';
                btn.style.color = '#2c3e50';
                btn.style.borderColor = '#bdc3c7';
            }
        };
        buttonContainer.appendChild(btn);
    });
    dialog.appendChild(buttonContainer);

    // ボタンエリア
    const buttonArea = document.createElement('div');
    buttonArea.style.cssText = 'text-align:right;border-top:1px solid #eee;padding-top:15px;';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.type = 'button';
    cancelBtn.style.cssText = `
        margin-right:10px; padding:8px 16px; background:#95a5a6;
        color:white; border:none; border-radius:4px; cursor:pointer;
    `;
    cancelBtn.onclick = () => document.body.removeChild(overlay);
    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.type = 'button';
    okBtn.style.cssText = `
        padding:8px 16px; background:#27ae60; color:white;
        border:none; border-radius:4px; cursor:pointer;
    `;
    okBtn.onclick = () => {
        onOk(selectedMembers);
        document.body.removeChild(overlay);
    };
    buttonArea.appendChild(cancelBtn);
    buttonArea.appendChild(okBtn);
    dialog.appendChild(buttonArea);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.onclick = e => { if (e.target === overlay) document.body.removeChild(overlay); };
}

// 共通：記入者選択ダイアログ（1人だけ選択可）
function showWriterSelectDialog(inputElem, onOk) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5); z-index: 2147483647;
        display: flex; justify-content: center; align-items: center;
    `;
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white; border-radius: 8px; padding: 20px;
        max-width: 500px; max-height: 600px; overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    dialog.innerHTML = `<h3 style="margin-top:0;margin-bottom:20px;color:#333;">記入者を選択してください（1人）</h3>`;
    let selectedWriter = inputElem.value || '';
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginBottom = '20px';

    members.forEach(member => {
        const name = member['氏名'].value;
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.type = 'button';
        const isSelected = selectedWriter === name;
        btn.style.cssText = `
            margin:5px; padding:8px 12px;
            background-color:${isSelected ? '#3498db' : '#ecf0f1'};
            color:${isSelected ? 'white' : '#2c3e50'};
            border:2px solid ${isSelected ? '#2980b9' : '#bdc3c7'};
            border-radius:4px; cursor:pointer; font-size:14px; transition:all 0.2s;
        `;
        btn.onclick = () => {
            Array.from(buttonContainer.children).forEach(b => {
                b.style.backgroundColor = '#ecf0f1';
                b.style.color = '#2c3e50';
                b.style.borderColor = '#bdc3c7';
            });
            selectedWriter = name;
            btn.style.backgroundColor = '#3498db';
            btn.style.color = 'white';
            btn.style.borderColor = '#2980b9';
        };
        buttonContainer.appendChild(btn);
    });
    dialog.appendChild(buttonContainer);

    // ボタンエリア
    const buttonArea = document.createElement('div');
    buttonArea.style.cssText = 'text-align:right;border-top:1px solid #eee;padding-top:15px;';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.type = 'button';
    cancelBtn.style.cssText = `
        margin-right:10px; padding:8px 16px; background:#95a5a6;
        color:white; border:none; border-radius:4px; cursor:pointer;
    `;
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        if (onOk) onOk(null);
    };
    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.type = 'button';
    okBtn.style.cssText = `
        padding:8px 16px; background:#27ae60; color:white;
        border:none; border-radius:4px; cursor:pointer;
    `;
    okBtn.onclick = () => {
        if (!selectedWriter) {
            alert('記入者を選択してください');
            return;
        }
        inputElem.value = selectedWriter;
        document.body.removeChild(overlay);
        if (onOk) onOk(selectedWriter);
    };
    buttonArea.appendChild(cancelBtn);
    buttonArea.appendChild(okBtn);
    dialog.appendChild(buttonArea);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.onclick = e => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            if (onOk) onOk(null);
        }
    };
}

// メンバー選択ボタン追加
function addbutton(node) {
    const button = document.createElement('button');
    button.textContent = 'メンバー選択';
    button.className = 'kb-button kb-button-primary';
    button.style.cssText = `
        padding: 10px 24px;
        background-color: #3498db;
        color: #fff;
        border: none;
        border-radius: 20px;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s;
        margin-bottom: 8px;
    `;
    button.onmouseenter = () => button.style.backgroundColor = '#217dbb';
    button.onmouseleave = () => button.style.backgroundColor = '#3498db';
    button.onclick = () => {
        const inputElem = node.querySelector('input');
        const current = inputElem.value.split(',').map(s => s.trim()).filter(Boolean);
        showMemberSelectDialogCommon(current, selected => {
            inputElem.value = selected.join(', ');
        });
    };
    node.appendChild(button);
}

// スケジュール確認ボタン追加
function addScheduleButton() {
    if (document.getElementById('schedule-check-btn')) return;

    // 固定用ラッパーを作成
    let wrapper = document.getElementById('schedule-check-btn-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'schedule-check-btn-wrapper';
        wrapper.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            width: auto;
            display: flex;
            justify-content: flex-end;
            z-index: 2147483646; /* ベース(2147483647)より一つ下 */
            pointer-events: none; /* ボタン以外はクリックを通す */
        `;
        document.body.appendChild(wrapper);
    }

    const btn = document.createElement('button');
    btn.id = 'schedule-check-btn';
    btn.textContent = 'スケジュール確認';
    btn.style.cssText = `
        padding: 10px 24px;
        background-color: #27ae60;
        color: #fff;
        border: none;
        border-radius: 20px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s;
        margin-bottom: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        pointer-events: auto; /* ボタンはクリック可能 */
    `;
    btn.onclick = showScheduleDialog;

    // 既存ボタンがあれば削除
    const oldBtn = document.getElementById('schedule-check-btn');
    if (oldBtn) oldBtn.remove();

    wrapper.appendChild(btn);
}

// スケジュールダイアログ
async function showScheduleDialog() {
    const exist = document.getElementById('schedule-dialog-overlay');
    if (exist) exist.remove();

    // ★ スケジュール確認ボタンを非表示
    const scheduleBtn = document.getElementById('schedule-check-btn');
    if (scheduleBtn) scheduleBtn.style.display = 'none';

    // メンバー抽出
    const memberList = new Set();
    const rebuildedTasks = [];

    // ローディング
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'schedule-loading-overlay';
    loadingOverlay.style.cssText = `
        position: fixed; top:0; left:0; width:100vw; height:100vh;
        background:rgba(0,0,0,0.5); z-index:9999; display:flex; justify-content:center; align-items:center;
    `;
    loadingOverlay.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="
                border: 6px solid #f3f3f3;
                border-top: 6px solid #3498db;
                border-radius: 50%;
                width: 48px;
                height: 48px;
                animation: spin 1s linear infinite;
                margin-bottom: 16px;
            "></div>
            <div style="color:white; font-size:18px; font-weight:bold;">スケジュール読込中...<br>しばらくお待ちください</div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg);}
                100% { transform: rotate(360deg);}
            }
        </style>
    `;
    document.body.appendChild(loadingOverlay);

    while (!schedule_readed) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    loadingOverlay.remove();

    tasks.forEach(task => {
        const taskMembers = task['参加メンバー']?.split(',').map(m => m.trim()) || [];
        taskMembers.forEach(m => {
            if (!m) return;
            rebuildedTasks.push({
                '氏名': m,
                '開始日時': task['開始日時'] ? new Date(task['開始日時']) : null,
                '終了日時': task['終了日時'] ? new Date(task['終了日時']) : null,
                '内容': task['内容'] || '',
                '場所': task['場所'] || '',
                '備考': task['備考'] || '',
                'タスク': task['タスク'] || '',
                '記入者': task['記入者'] || '',
                'レコード番号': task['レコード番号'] || '',
                '参加メンバー': task['参加メンバー']
            });
            memberList.add(m);
        });
    });
    const memberArray = Array.from(memberList);

    // オーバーレイ
    const overlay = document.createElement('div');
    overlay.id = 'schedule-dialog-overlay';
    overlay.style.cssText = `
        position: fixed; top:0; left:0; width:100vw; height:100vh;
        background:rgba(0,0,0,0.5); z-index:9999; display:flex; justify-content:center; align-items:center;
    `;

    // ダイアログ
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #fff; border-radius: 8px; padding: 24px; max-width: 900px; width: 95vw; max-height: 90vh; overflow-y: auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    // タイトル
    const title = document.createElement('h2');
    title.textContent = '人ごと計画表';
    title.style.cssText = 'margin:0 0 16px 0; font-size:20px; font-weight:bold; color:#333; border-bottom:2px solid #3498db; padding-bottom:10px;';
    dialog.appendChild(title);

    // コントロールパネル
    const controlPanel = document.createElement('div');
    controlPanel.style.cssText = 'display:flex; gap:15px; align-items:center; flex-wrap:wrap; margin-bottom:16px;';

    // 期間選択
    const periodSelect = document.createElement('select');
    periodSelect.innerHTML = `
        <option value="day">今日</option>
        <option value="week" selected>今週</option>
        <option value="month">今月</option>
    `;
    periodSelect.style.cssText = 'padding:5px 10px; border-radius:4px; border:1px solid #ccc;';
    controlPanel.appendChild(periodSelect);

    // メンバー選択
    const memberSelect = document.createElement('select');
    memberSelect.innerHTML = '<option value="">全員</option>' + memberArray.map(m => `<option value="${m}">${m}</option>`).join('');
    memberSelect.style.cssText = 'padding:5px 10px; border-radius:4px; border:1px solid #ccc;';
    controlPanel.appendChild(memberSelect);

    dialog.appendChild(controlPanel);

    // チャートエリア
    const chartArea = document.createElement('div');
    chartArea.id = 'schedule-chart-area';
    chartArea.style.cssText = 'overflow-x:auto; border:1px solid #ddd; background:#fafafa;';
    dialog.appendChild(chartArea);

    // 閉じるボタン
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '閉じる';
    closeBtn.style.cssText = `
        margin-top:16px; padding:8px 24px; background:#95a5a6; color:#fff; border:none; border-radius:4px; cursor:pointer;
        float:right;
    `;

    closeBtn.onclick = () => {
        overlay.remove();
        // ★ スケジュール確認ボタンを再表示
        if (scheduleBtn) scheduleBtn.style.display = '';
    }

    dialog.appendChild(closeBtn);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // チャート描画
    function renderChart() {
        const period = periodSelect.value;
        const member = memberSelect.value;
        let filtered = rebuildedTasks;
        if (member) filtered = filtered.filter(r => (r['氏名'] === member));
        let start, end;
        const today = new Date();
        if (period === 'day') {
            start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            end = new Date(start); end.setHours(23,59,59,999);
        } else if (period === 'week') {
            const day = today.getDay() || 7;
            start = new Date(today); start.setDate(today.getDate() - day + 1); start.setHours(0,0,0,0);
            end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
        } else {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23,59,59,999);
        }
        filtered = filtered.filter(r => {
            const s = r['開始日時'];
            const e = r['終了日時'];
            return e >= start && s <= end;
        });

        chartArea.innerHTML = '';
        const table = document.createElement('table');
        table.style.cssText = 'width:100%; border-collapse:collapse; font-size:14px;';
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const th1 = document.createElement('th');
        th1.textContent = 'メンバー';
        th1.style.cssText = 'background:#34495e; color:white; padding:12px; min-width:100px;';
        tr.appendChild(th1);
        let colCount = 0;
        if (period === 'day') {
            colCount = 24;
            for (let h = 0; h < 24; h++) {
                const th = document.createElement('th');
                th.textContent = `${h}:00`;
                th.style.cssText = 'background:#3498db; color:white; padding:8px 4px; font-size:11px;';
                tr.appendChild(th);
            }
        } else if (period === 'week') {
            colCount = 7;
            const d = new Date(start);
            for (let i = 0; i < 7; i++) {
                const th = document.createElement('th');
                th.textContent = `${d.getMonth() + 1}/${d.getDate()}`;
                th.style.cssText = 'background:#3498db; color:white; padding:8px 4px; font-size:11px;';
                tr.appendChild(th);
                d.setDate(d.getDate() + 1);
            }
        } else {
            colCount = end.getDate();
            for (let i = 1; i <= colCount; i++) {
                const th = document.createElement('th');
                th.textContent = i;
                th.style.cssText = 'background:#3498db; color:white; padding:8px 2px; font-size:11px;';
                tr.appendChild(th);
            }
        }
        thead.appendChild(tr);
        table.appendChild(thead);

        (member ? [member] : memberArray).forEach(m => {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.textContent = m;
            td.style.cssText = 'background:#f8f9fa; padding:12px; font-weight:bold;';
            tr.appendChild(td);

            const cells = [];
            for (let c = 0; c < colCount; c++) {
                const cell = document.createElement('td');
                cell.style.cssText = 'padding:0; min-width:30px; height:30px; position:relative;';
                cells.push(cell);
                tr.appendChild(cell);
            }

            // タスクバー
            const bars = filtered.filter(r => r['氏名'] === m).map(r => {
                let s = r['開始日時'];
                let e = r['終了日時'];
                let startIdx = 0, endIdx = 0;
                if (period === 'day') {
                    startIdx = Math.max(0, s.getHours());
                    endIdx = Math.min(23, e.getHours());
                } else if (period === 'week') {
                    const base = new Date(start);
                    base.setHours(0,0,0,0);
                    startIdx = Math.max(0, Math.floor((s - base) / (1000*60*60*24)));
                    endIdx = Math.min(6, Math.floor((e - base) / (1000*60*60*24)));
                } else {
                    startIdx = Math.max(0, s.getDate() - 1);
                    endIdx = Math.min(colCount - 1, e.getDate() - 1);
                }
                return {
                    record: r,
                    startIdx,
                    endIdx,
                    color: colors[r['タスク']] || '#7f8c8d'
                };
            });

            // レイヤー割り当て
            const layers = [];
            bars.forEach(bar => {
                let layer = 0;
                while (true) {
                    if (!layers[layer]) layers[layer] = [];
                    const overlap = layers[layer].some(b =>
                        !(bar.endIdx < b.startIdx || bar.startIdx > b.endIdx)
                    );
                    if (!overlap) {
                        layers[layer].push(bar);
                        bar.layer = layer;
                        break;
                    }
                    layer++;
                }
            });

            bars.forEach(bar => {
                const barDiv = document.createElement('div');
                barDiv.textContent = bar.record['タスク'];
                barDiv.style.cssText = `
                    position:absolute;
                    left:2px;
                    top:${2 + bar.layer * 24}px;
                    height:22px;
                    background:${bar.color};
                    color:white;
                    border-radius:3px;
                    font-size:11px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    cursor:pointer;
                    z-index:2;
                    box-shadow:0 1px 3px rgba(0,0,0,0.15);
                `;
                barDiv.style.width = `calc(${bar.endIdx - bar.startIdx + 1}00% - 4px)`;
                barDiv.onclick = () => showDetailDialog(bar.record);
                cells[bar.startIdx].appendChild(barDiv);
            });

            table.appendChild(tr);
        });

        chartArea.appendChild(table);
    }

    periodSelect.onchange = renderChart;
    memberSelect.onchange = renderChart;
    renderChart();
}

// 詳細ダイアログ
function showDetailDialog(record) {
    const exist = document.getElementById('task-detail-dialog');
    if (exist) exist.remove();

    const overlay = document.createElement('div');
    overlay.id = 'task-detail-dialog';
    overlay.style.cssText = `
        position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:10001; display:flex; justify-content:center; align-items:center;
    `;
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background:white; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3); max-width:500px; width:90vw; max-height:80vh; overflow-y:auto; padding:24px;
    `;

    // タイトル
    const title = document.createElement('h3');
    title.textContent = 'タスク詳細';
    title.style.cssText = 'margin:0 0 16px 0; font-size:18px;';
    dialog.appendChild(title);

    // 詳細テーブル
    const table = document.createElement('table');
    table.style.cssText = 'width:100%; border-collapse:collapse; font-size:14px;';
    const fields = [
        { label: 'レコード番号', key: 'レコード番号' },
        { label: 'タスク名', key: 'タスク' },
        { label: '参加メンバー', key: '参加メンバー' },
        { label: '開始日時', key: '開始日時' },
        { label: '終了日時', key: '終了日時' },
        { label: '内容', key: '内容' },
        { label: '場所', key: '場所' },
        { label: '備考', key: '備考' },
        { label: '記入者', key: '記入者' }
    ];
    fields.forEach(f => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.textContent = f.label;
        td1.style.cssText = 'background:#f8f9fa; padding:12px; font-weight:bold; border:1px solid #dee2e6; width:30%;';
        const td2 = document.createElement('td');
        if ((f.key === '開始日時' || f.key === '終了日時') && record[f.key]) {
            const date = record[f.key];
            if (!isNaN(date)) {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const hh = String(date.getHours()).padStart(2, '0');
                const mi = String(date.getMinutes()).padStart(2, '0');
                td2.textContent = `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
            } else {
                td2.textContent = '-';
            }
        } else {
            td2.textContent = record[f.key] || '-';
        }
        td2.style.cssText = 'padding:12px; border:1px solid #dee2e6;';
        tr.appendChild(td1); tr.appendChild(td2);
        table.appendChild(tr);
    });
    dialog.appendChild(table);

    // 変更ボタン
    const editBtn = document.createElement('button');
    editBtn.textContent = '変更';
    editBtn.style.cssText = `
        margin-top:20px; padding:8px 24px; background:#e67e22; color:#fff; border:none; border-radius:4px; cursor:pointer; float:right;
    `;
    editBtn.onclick = () => showEditDialog(record, overlay);
    dialog.appendChild(editBtn);
    
    // 削除ボタン
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '削除';
    deleteBtn.style.cssText = `
        margin-top:20px; margin-right:10px; padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; float:right;
    `;
    deleteBtn.onclick = async () => {
        // 確認ダイアログ
        if (!window.confirm('本当にこのスケジュールを削除しますか？')) return;

        // ローディング表示
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'schedule-loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed; top:0; left:0; width:100vw; height:100vh;
            background:rgba(0,0,0,0.5); z-index:99999; display:flex; justify-content:center; align-items:center;
        `;
        loadingOverlay.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="
                    border: 6px solid #f3f3f3;
                    border-top: 6px solid #e74c3c;
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 16px;
                "></div>
                <div style="color:white; font-size:18px; font-weight:bold;">削除中...<br>しばらくお待ちください</div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg);}
                    100% { transform: rotate(360deg);}
                }
            </style>
        `;
        document.body.appendChild(loadingOverlay);

        try {
            await fetch('https://d37ksuq96l.execute-api.us-east-1.amazonaws.com/product/kintoneWebform/schedule', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'レコード番号': record['レコード番号'] })
            });

            overlay.remove();
            loadingOverlay.querySelector('div:last-child').innerHTML = 'スケジュール更新中...<br>しばらくお待ちください';

            schedule_readed = false;
            await schedule_load_promise();

            loadingOverlay.remove();

            alert('削除しました');
            showScheduleDialog();

        } catch (e) {
            console.error('Error:', e);
            alert('削除に失敗しました');
            loadingOverlay.remove();
        }
    };
    dialog.appendChild(deleteBtn);

    // 閉じるボタン
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '閉じる';
    closeBtn.style.cssText = `
        margin-top:20px; margin-right:10px; padding:8px 24px; background:#95a5a6; color:#fff; border:none; border-radius:4px; cursor:pointer; float:right;
    `;
    closeBtn.onclick = () => overlay.remove();
    dialog.appendChild(closeBtn);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

// 編集ダイアログ
function showEditDialog(record, parentOverlay) {
    const exist = document.getElementById('task-edit-dialog');
    if (exist) exist.remove();

    const overlay = document.createElement('div');
    overlay.id = 'task-edit-dialog';
    overlay.style.cssText = `
        position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:10002; display:flex; justify-content:center; align-items:center;
    `;
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background:white; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3); max-width:500px; width:90vw; max-height:80vh; overflow-y:auto; padding:24px;
    `;

    // タイトル
    const title = document.createElement('h3');
    title.textContent = '予定編集';
    title.style.cssText = 'margin:0 0 16px 0; font-size:18px;';
    dialog.appendChild(title);

    // 編集フォーム
    const form = document.createElement('form');

    // 分類（タスク）ドロップダウン
    const divTask = document.createElement('div');
    divTask.style.marginBottom = '12px';
    const labelTask = document.createElement('label');
    labelTask.textContent = '分類';
    labelTask.style.display = 'block';
    labelTask.style.marginBottom = '4px';
    const selectTask = document.createElement('select');
    selectTask.name = 'タスク';
    selectTask.style.cssText = 'width:100%; padding:6px; border-radius:4px; border:1px solid #ccc;';
    Object.keys(colors).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key;
        if (record['タスク'] === key || record['タスク']?.value === key) opt.selected = true;
        selectTask.appendChild(opt);
    });
    divTask.appendChild(labelTask);
    divTask.appendChild(selectTask);
    form.appendChild(divTask);

    // 参加メンバー（readonly）＋ボタン
    const divMember = document.createElement('div');
    divMember.style.marginBottom = '12px';
    const labelMember = document.createElement('label');
    labelMember.textContent = '参加メンバー';
    labelMember.style.display = 'block';
    labelMember.style.marginBottom = '4px';
    const inputMember = document.createElement('input');
    inputMember.name = '参加メンバー';
    inputMember.value = record['参加メンバー'] || '';
    inputMember.readOnly = true;
    inputMember.style.cssText = 'width:calc(100% - 120px); padding:6px; border-radius:4px; border:1px solid #ccc; margin-right:8px;';
    divMember.appendChild(labelMember);
    divMember.appendChild(inputMember);

    // メンバー選択ボタン
    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.textContent = 'メンバー選択';
    selectBtn.style.cssText = `
        padding: 8px 16px;
        background-color: #3498db;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        margin-left: 4px;
    `;
    selectBtn.onclick = function() {
        showMemberSelectDialogCommon(
            inputMember.value.split(',').map(s => s.trim()).filter(Boolean),
            function(selected) { inputMember.value = selected.join(', '); }
        );
    };
    divMember.appendChild(selectBtn);
    form.appendChild(divMember);

    // その他フィールド
    const fields = [
        { label: '開始日時', key: '開始日時', type: 'datetime-local' },
        { label: '終了日時', key: '終了日時', type: 'datetime-local' },
        { label: '内容', key: '内容', type: 'textarea' },
        { label: '場所', key: '場所', type: 'text' },
        { label: '備考', key: '備考', type: 'textarea' }
    ];
    fields.forEach(f => {
        const div = document.createElement('div');
        div.style.marginBottom = '12px';
        const label = document.createElement('label');
        label.textContent = f.label;
        label.style.display = 'block';
        label.style.marginBottom = '4px';
        let input;
        if (f.type === 'textarea') {
            input = document.createElement('textarea');
        } else {
            input = document.createElement('input');
            input.type = f.type;
        }
        input.name = f.key;
        if ((f.key === '開始日時' || f.key === '終了日時') && record[f.key]) {
            const date = record[f.key];
            if (!isNaN(date)) {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const hh = String(date.getHours()).padStart(2, '0');
                const mi = String(date.getMinutes()).padStart(2, '0');
                input.value = `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
            } else {
                input.value = '';
            }
        } else {
            input.value = record[f.key] || '';
        }
        input.style.cssText = 'width:100%; padding:6px; border-radius:4px; border:1px solid #ccc;';
        div.appendChild(label); div.appendChild(input);
        form.appendChild(div);
    });

    // 保存ボタン
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '保存';
    saveBtn.type = 'button';
    saveBtn.style.cssText = 'padding:8px 24px; background:#27ae60; color:#fff; border:none; border-radius:4px; cursor:pointer;';
    saveBtn.onclick = async () => {
        showWriterSelectDialog({ value: '' }, async function(writerName) {
            if (writerName) {
                const loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'schedule-loading-overlay';
                loadingOverlay.style.cssText = `
                    position: fixed; top:0; left:0; width:100vw; height:100vh;
                    background:rgba(0,0,0,0.5); z-index:99999; display:flex; justify-content:center; align-items:center;
                `;
                loadingOverlay.innerHTML = `
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="
                            border: 6px solid #f3f3f3;
                            border-top: 6px solid #3498db;
                            border-radius: 50%;
                            width: 48px;
                            height: 48px;
                            animation: spin 1s linear infinite;
                            margin-bottom: 16px;
                        "></div>
                        <div style="color:white; font-size:18px; font-weight:bold;">保存中...<br>しばらくお待ちください</div>
                    </div>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg);}
                            100% { transform: rotate(360deg);}
                        }
                    </style>
                `;
                document.body.appendChild(loadingOverlay);

                try {
                    const newRecord = { ...record };
                    newRecord['タスク'] = form['タスク'].value;
                    newRecord['参加メンバー'] = form['参加メンバー'].value;
                    ['開始日時','終了日時','内容','場所','備考'].forEach(key => {
                        if (form[key]) newRecord[key] = form[key].value;
                    });
                    newRecord['記入者'] = writerName;

                    await fetch('https://d37ksuq96l.execute-api.us-east-1.amazonaws.com/product/kintoneWebform/schedule', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ record: newRecord })
                    });

                    overlay.remove();
                    parentOverlay.remove();

                    loadingOverlay.querySelector('div:last-child').innerHTML = 'スケジュール更新中...<br>しばらくお待ちください';

                    schedule_readed = false;
                    await schedule_load_promise();

                    loadingOverlay.remove();

                    alert('変更しました');
                    showScheduleDialog();

                } catch (e) {
                    console.error('Error:', e);
                    alert('変更に失敗しました');
                    loadingOverlay.remove();
                }
            }
        });
    };
    form.appendChild(saveBtn);

    // キャンセル
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.type = 'button';
    cancelBtn.style.cssText = 'margin-left:10px; padding:8px 24px; background:#95a5a6; color:#fff; border:none; border-radius:4px; cursor:pointer;';
    cancelBtn.onclick = () => overlay.remove();
    form.appendChild(cancelBtn);

    dialog.appendChild(form);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

// DOM監視
window.addEventListener('load', function () {
    const parentNode = document.body;
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
            mutation.addedNodes.forEach(elem => {
                if (elem.nodeType === Node.ELEMENT_NODE && elem.querySelector('[field-id="参加メンバー"]')) {
                    var node = elem.querySelector('[field-id="参加メンバー"]');
                    node.querySelector('input').disabled = true;
                    addbutton(node);
                    addScheduleButton();
                }
            });
        });
    });
    observer.observe(parentNode, config);
});
