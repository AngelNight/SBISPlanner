if(typeof(localStorage['isTired']) == 'undefined') localStorage['isTired'] = 1;

function Say(utterance, callback) {
  console.log('Говорю: ' + utterance);

  if (!callback){
	callback = function(){ };
  }

  chrome.runtime.sendMessage(utterance, callback);
    console.log('stop recording');
    if(rec.isRunning) rec.stop();

}

chrome.runtime.onMessage.addListener(function(request,sender,callback2) {
    console.log('start recording');
    if(!rec.isRunning) rec.start();
});


var bird = document.getElementById('logoCompany');
if(bird){
   bird.className += 'bird icon-32 icon-Microphone icon-primary';
   bird.title = 'SBIS Planner';
   document.getElementById('logoCompanyLink').href="#";

   // Google Web Speech API
   var rec = new webkitSpeechRecognition(),
         sHandler = new SpeechHandler();

   rec.continuous = true;
   rec.interimResults = true;
   rec.lang = 'ru';
   rec.onstart = function () {
      //Say("Привет, хозяин");
	  rec.isRunning = true;
   };
   rec.onend = function () {
	  //Say("До скорой встречи, хозяин");
      rec.isRunning = false;
   };
   rec.onresult = function (event) {
      for (var i = event.resultIndex; i < event.results.length; ++i) {
         if (event.results[i].isFinal) {
            sHandler.parse(event.results[i][0].transcript);
         }
      }
   };

   // так работает в ie8
   bird.onclick = function(){
      if( rec.isRunning ) rec.stop(); else rec.start();
   };
}