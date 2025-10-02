(async () => {
  const url = "https://d37ksuq96l.execute-api.us-east-1.amazonaws.com/product/kintoneWebform/manualviewer";

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // セッション認証が必要な場合に備えて
      }
    });

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    const data = await response.json();
    console.log("取得したデータ:", data);
  } catch (error) {
    console.error("リクエスト失敗:", error);
  }
})();
