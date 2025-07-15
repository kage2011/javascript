// kintone HEIC to JPEG変換コード
// 事前にheic2anyライブラリをカスタマイズ/JavaScriptでアップロードしてください

(() => {
    'use strict';

    // レコード表示画面でHEICファイルをチェック・変換
    kintone.events.on('app.record.detail.show', async (event) => {
        const record = event.record;
        const appId = kintone.app.getId();
        const recordId = record.$id.value;
        
        // 添付ファイルフィールドを取得（フィールドコードは適宜変更してください）
        const attachmentField = record.添付ファイル; // 'attachment'は添付ファイルフィールドのコード
        
        if (!attachmentField || !attachmentField.value || attachmentField.value.length === 0) {
            return event;
        }
        
        let hasHEIC = false;
        let convertedFiles = [];
        
        // HEICファイルをチェック
        for (const file of attachmentField.value) {
            if (file.name.toLowerCase().endsWith('.heic')) {
                hasHEIC = true;
                try {
                    const convertedFile = await convertHEICtoJPEG(file);
                    if (convertedFile) {
                        convertedFiles.push(convertedFile);
                    }
                } catch (error) {
                    console.error('HEIC変換エラー:', error);
                }
            }
        }
        
        // 変換されたファイルがある場合、レコードを更新
        if (hasHEIC && convertedFiles.length > 0) {
            await updateRecordWithConvertedFiles(appId, recordId, attachmentField.value, convertedFiles);
        }
        
        return event;
    });

    // レコード作成・更新時にもHEICファイルをチェック
    kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], async (event) => {
        const record = event.record;
        const attachmentField = record.attachment;
        
        if (!attachmentField || !attachmentField.value || attachmentField.value.length === 0) {
            return event;
        }
        
        let hasHEIC = false;
        let convertedFiles = [];
        
        // HEICファイルをチェック・変換
        for (const file of attachmentField.value) {
            if (file.name.toLowerCase().endsWith('.heic')) {
                hasHEIC = true;
                try {
                    const convertedFile = await convertHEICtoJPEG(file);
                    if (convertedFile) {
                        convertedFiles.push(convertedFile);
                    }
                } catch (error) {
                    console.error('HEIC変換エラー:', error);
                }
            }
        }
        
        // 変換されたファイルを元の配列に追加
        if (hasHEIC && convertedFiles.length > 0) {
            // HEICファイルを除去して変換されたJPEGファイルを追加
            const nonHEICFiles = attachmentField.value.filter(file => 
                !file.name.toLowerCase().endsWith('.heic')
            );
            
            record.attachment.value = [...nonHEICFiles, ...convertedFiles];
        }
        
        return event;
    });

    // HEIC → JPEG変換関数
    async function convertHEICtoJPEG(heicFile) {
        try {
            // ファイルをダウンロード
            const fileBlob = await downloadFile(heicFile.fileKey);
            
            // heic2anyライブラリを使用してJPEGに変換
            const convertedBlob = await heic2any({
                blob: fileBlob,
                toType: 'image/jpeg',
                quality: 0.8
            });
            
            // 新しいファイル名を生成
            const originalName = heicFile.name;
            const newName = originalName.replace(/\.heic$/i, '.jpg');
            
            // ファイルをkintoneにアップロード
            const uploadedFile = await uploadFile(convertedBlob, newName);
            
            return uploadedFile;
        } catch (error) {
            console.error('HEIC変換エラー:', error);
            return null;
        }
    }

    // ファイルダウンロード関数
    async function downloadFile(fileKey) {
        return new Promise((resolve, reject) => {
            const url = kintone.api.url('/k/v1/file', true) + '?fileKey=' + fileKey;
            
            fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('ファイルダウンロードに失敗しました');
                }
                return response.blob();
            })
            .then(blob => resolve(blob))
            .catch(error => reject(error));
        });
    }

    // ファイルアップロード関数
    async function uploadFile(blob, filename) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', blob, filename);
            
            const url = kintone.api.url('/k/v1/file', true);
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('ファイルアップロードに失敗しました');
                }
                return response.json();
            })
            .then(data => {
                resolve({
                    fileKey: data.fileKey,
                    name: filename,
                    contentType: 'image/jpeg',
                    size: blob.size
                });
            })
            .catch(error => reject(error));
        });
    }

    // レコード更新関数
    async function updateRecordWithConvertedFiles(appId, recordId, originalFiles, convertedFiles) {
        try {
            // HEICファイルを除去して変換されたJPEGファイルを追加
            const nonHEICFiles = originalFiles.filter(file => 
                !file.name.toLowerCase().endsWith('.heic')
            );
            
            const updatedFiles = [...nonHEICFiles, ...convertedFiles];
            
            const updateData = {
                app: appId,
                id: recordId,
                record: {
                    attachment: {
                        value: updatedFiles
                    }
                }
            };
            
            await kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', updateData);
            
            // 画面を再読み込み
            location.reload();
        } catch (error) {
            console.error('レコード更新エラー:', error);
            alert('ファイル変換は完了しましたが、レコードの更新に失敗しました。');
        }
    }

    // 変換進捗を表示する関数（オプション）
    function showProgress(message) {
        const progressDiv = document.getElementById('heic-progress');
        if (progressDiv) {
            progressDiv.textContent = message;
        } else {
            const div = document.createElement('div');
            div.id = 'heic-progress';
            div.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #007bff;
                color: white;
                padding: 10px;
                border-radius: 5px;
                z-index: 9999;
            `;
            div.textContent = message;
            document.body.appendChild(div);
            
            // 3秒後に消去
            setTimeout(() => {
                div.remove();
            }, 3000);
        }
    }

})();