"use strict";

/*
** Import Packages
*/
const server = require("express")();
const line = require("@line/bot-sdk");
const dialogflow = require("apiai-promisified");
/*--*/
const bot_express = require("bot-express");

//environment & client config
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数Channel Secret
};
const bot = new line.Client(line_config);

/*
** web server
*/
var server_port = server.listen(process.env.PORT || 3000, function(){
    var port = server_port.address().port;
    console.log("App now running on port", port);
});

// Dialogflow create
const nlu = new dialogflow(process.env.DIALOGFLOW_CLIENT_ACCESS_TOKEN, {language: "en"});
/* web port*/
server.post("/webhook", line.middleware(line_config), (req, res, next) => {
    //line server default setting
    res.sendStatus(200);
    // array stores promises for all event processing.
    let events_processed = [];

    if(event.type == 'message' && event.message.type == "text"){
        events_processed.push(
            nlu.textRequest(event.message.text, {sessionId: event.source.userId}).then((response) => {
                if (response.result && response.result.action == "handle-delivery-order"){
                    let message;
                    if (response.result.parameters.menu && response.result.parameters.menu != ""){
                        message = {
                            type: "text",
                            text: `毎度！${response.result.parameters.menu}ね。どちらにお届けしましょ？`
                        }
                    } else {
                        message = {
                            type: "text",
                            text: `毎度！ご注文は？`
                        }
                    }
                    return bot.replyMessage(event.replyToken, message);
                }
            })
        )
    }
    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
})
