<script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
(function() {
  "use strict";

  // MQTTエンドポイント (AWS IoTの「設定」→「デバイスデータエンドポイント」)
  const AWS_IOT_ENDPOINT = "wss://a3tx70s9scyp4r-ats.iot.us-east-1.amazonaws.com/mqtt";

  // MQTT接続オプション
  const options = {
    clientId: "kintone-client-" + Math.floor(Math.random() * 100000),
    protocol: "wss",  // WebSocket Secure
    username: "", // AWS IoTでは空
    password: ""  // AWS IoTでは空
  };

  // MQTTクライアント作成
  const client = mqtt.connect(AWS_IOT_ENDPOINT, options);

  // 接続成功時
  client.on("connect", function() {
    console.log("Connected to AWS IoT");

    // メッセージをパブリッシュ
    const topic = "sdk/test/kintone";
    const message = JSON.stringify({ text: "Hello from Kintone!" });

    client.publish(topic, message, { qos: 0 }, function(err) {
      if (!err) {
        console.log(`Message sent: ${message}`);
      } else {
        console.error("Publish error:", err);
      }
    });

    // 5秒後に切断
    setTimeout(() => client.end(), 5000);
  });

  // エラーハンドリング
  client.on("error", function(err) {
    console.error("MQTT Connection Error:", err);
  });
})();
