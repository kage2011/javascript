(async () => {
  // fileKey を指定（例：APIなどで取得済み）
  const fileKey = "202510020546310F64C750C36D40E6940B8DC8F8E8B82C081"; // ← ここを実際のfileKeyに置き換えてください

  // kintoneのファイルダウンロードAPI URLを生成
  const downloadUrl = `https://ogusu.cybozu.com/k/v1/file.json?fileKey=${fileKey}`;

  // 認証が必要な場合は、APIトークンやセッションが有効な状態で実行してください
  const response = await fetch(downloadUrl, {
    method: 'GET',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  if (!response.ok) {
    alert('ファイルの取得に失敗しました');
    return;
  }

  // Blobとして取得
  const blob = await response.blob();

  // ダウンロードリンクを生成
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'downloaded_file.pdf'; // 任意のファイル名に変更可能
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
})();
