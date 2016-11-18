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

// Function to get task list
function getTasks(){
var url = getDomain()+'service/';
var xhr = new XMLHttpRequest();
var body = {"jsonrpc":"2.0","protocol":4,
            "method":"СвязьПапок.ДокументыВПапке",
            "params":{"Фильтр":{"s":[{"n":"ВключитьСписокИсполнителей","t":"Логическое"},
            {"n":"ВнешняяИерархия","t":"Логическое"},
            {"n":"ПапкаДокументов","t":"Строка"},{"n":"ПоказИерархии","t":"Логическое"},
            {"n":"ПростыеВД","t":"Логическое"},{"n":"РассчитатьФото","t":"Логическое"}],
            "d":[true,true,"",false,true,true],"_type":"record"},
            "Сортировка":null,"Навигация":{"s":[{"n":"ЕстьЕще","t":"Логическое"},
            {"n":"РазмерСтраницы","t":"Число целое"},{"n":"Страница","t":"Число целое"}],
            "d":[true,25,0],"_type":"record"},"ДопПоля":[]},"id":1};

xhr.open('POST',url,true);
xhr.withCredentials = true;
xhr.setRequestHeader('x-calledmethod','SvyazPapok.DokumentyVPapke');
xhr.setRequestHeader('x-originalmethodname','0KHQstGP0LfRjNCf0LDQv9C+0Lou0JTQvtC60YPQvNC10L3RgtGL0JLQn9Cw0L/QutC1');
xhr.setRequestHeader('content-type','application/json; charset=utf-8');

xhr.send(JSON.stringify(body));

xhr.onreadystatechange = function() {
  if (xhr.readyState != 4) return;
  console.log("Cтатус"+xhr.status);
  if (xhr.status != 200) {  P
    console.error(xhr.responseText);
  } else {
    var body = xhr.responseText;
    var result = body.result.d;
    result.forEach( function(item) {console.log(item[10]); });
  }

}