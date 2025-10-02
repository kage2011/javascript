(async () => {
    fetch(`https://d37ksuq96l.execute-api.us-east-1.amazonaws.com/product/kintoneWebform/manualviewer`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            records = data.body.records;
            members = records.sort((a, b) =>
                a.ふりがな.value.localeCompare(b.ふりがな.value, 'ja')
            );
        })
        .catch(error => console.error('取得失敗:', error));
}
})();
