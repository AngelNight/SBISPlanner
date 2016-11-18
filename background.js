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

function getDomain(){
    return 'https://'+window.location.hostname+'/';    
}


// XHR wrapper to do some request
function request(method,url,body,headers,callback){
    var xhr = new XMLHttpRequest();
    xhr.open(method,url,true);
    // Use browser cookie's
    xhr.withCredentials = true;

    if(Array.isArray(headers)) headers.forEach( function(item){
        xhr.setRequestHeader(item.key,item.value);
    });

    xhr.send(JSON.stringify(body));

    xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) callback(true,'Request error.Ready state:'+x.readyState);
    if (xhr.status != 200) {
        callback(true,'Server response code:'+xhr.status+'\nResponse body'+xhr.responseText);
        console.error(xhr.responseText);
    } else {
        var response = JSON.parse(xhr.responseText);
        callback(false,response);
    }

    }
}



// Function to get task list

function getTasks(){
var url = getDomain()+'service/';
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

var headers = [
    {key:'x-calledmethod',value:'SvyazPapok.DokumentyVPapke'},
    {key:'x-originalmethodname',value:'0KHQstGP0LfRjNCf0LDQv9C+0Lou0JTQvtC60YPQvNC10L3RgtGL0JLQn9Cw0L/QutC1'},
    {key:'content-type',value:'application/json; charset=utf-8'}
];

request('POST',url,body,headers,function(err,response){
    if(err) console.err(response);
    console.log(response);
    response.result.d.forEach(function(item) {
        console.log('Приоритет %s\nТип задачи: %s \nСрок: %s',item[30],item[10],item[5])
    });
});
}
