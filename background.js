chrome.runtime.onMessage.addListener(function(utterance,sender,callback) {

    if(!sender.tab.id) return;

    chrome.tts.speak(utterance, {
        voiceName:"Google русский",
        requiredEventTypes: ['end','error'],
        onEvent: function(event) {
            if(event.type === 'end') {
                chrome.tabs.sendMessage(sender.tab.id, {action: "open_dialog_box"}, function(response) {});
            }
            if (event.type == 'error') {
                alert('Error: ' + event.errorMessage);
            }
        }
    },callback);

});

