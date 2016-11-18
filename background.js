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

// FirstBy - a little lib to sort arrays by multiply fields
firstBy = (function() {

    function identity(v){return v;}

    function ignoreCase(v){return typeof(v)==="string" ? v.toLowerCase() : v;}

    function makeCompareFunction(f, opt){
     opt = typeof(opt)==="number" ? {direction:opt} : opt||{}; 
     if(typeof(f)!="function"){
        var prop = f;
        // make unary function
        f = function(v1){return !!v1[prop] ? v1[prop] : "";}
      }
      if(f.length === 1) {
        // f is a unary function mapping a single item to its sort score
        var uf = f; 
        var preprocess = opt.ignoreCase?ignoreCase:identity;
        f = function(v1,v2) {return preprocess(uf(v1)) < preprocess(uf(v2)) ? -1 : preprocess(uf(v1)) > preprocess(uf(v2)) ? 1 : 0;}
      }
      if(opt.direction === -1)return function(v1,v2){return -f(v1,v2)};
      return f;
    }

    function tb(func, opt) {
        var x = typeof(this) == "function" ? this : false;
        var y = makeCompareFunction(func, opt);
        var f = x ? function(a, b) {
                        return x(a,b) || y(a,b);
                    } 
                  : y;
        f.thenBy = tb;
        return f;
    }
    return tb;
})();



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
    if (xhr.readyState != 4) return;
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
function getTasks(callback){
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
    if(err) callback(err);
    callback(false,response.result.d);
});
}


// Сортирует задания по дате окончания и по приоритету
function sortTasks(err,tasks,callback){
    if(err) {console.log('Error'); callback(err);}
    //console.log(tasks);
    callback(false,
        tasks.sort(
            firstBy(function sortByDealine(v1,v2) {
                const DEADLINE_INDEX = 5;
                var firstDate = new Date(v1[DEADLINE_INDEX]);
                var secondDate = new Date(v2[DEADLINE_INDEX]);
                return new Date(firstDate) - new Date(secondDate);
            }).thenBy(function sortByPriority(v1,v2) {
                const PRIORITY_INDEX = 30;
                return ( v1[PRIORITY_INDEX] > v2[PRIORITY_INDEX] ) ? -1 :
                       ( v1[PRIORITY_INDEX] < v2[PRIORITY_INDEX] ) ? 1 : 0;

            })
        )
    );
}

// Пример сортировки данных и вывода их в консоль.
function doSort(){
    getTasks( function(err,tasks) { 
        sortTasks(err,tasks,
            function(err,sorted_array){
                sorted_array.forEach(consoleTaskInfo)
            })
    })
}

function consoleTaskInfo(one_task_array){
    var item = one_task_array;
    console.log("Срок завершения: %s \n Приоритет: %s\n Тип: %s",item[5],item[30],item[10]);
}

// Фильтруем данные от совещаний
function filterСonference(task_array,callback){
    const TASK_TYPE_INDEX = 10;
    const CONFERENCE_STATUS_NAME = "Совещание";
    callback(
        task_array.filter(function (item) { 
            return item[TASK_TYPE_INDEX] != CONFERENCE_STATUS_NAME
        })
    );
}

// Получаем массив совещаний
function getСonference(task_array,callback){
    const TASK_TYPE_INDEX = 10;
    const CONFERENCE_STATUS_NAME = "Совещание";
    callback(
        task_array.filter(function (item) { 
            return item[TASK_TYPE_INDEX] == CONFERENCE_STATUS_NAME
        })
    );
}

// Функция для вынесения из вехи. На вход может принимать либо id задачи, либо массив задачи (id достанет сама)
function deleteFromMilestone(task,callback){
    const TASK_ID_INDEX = 13
    if(Array.isArray(task)) task = task[TASK_ID_INDEX]
    var url = getDomain()+'service/';
    var body = {"jsonrpc":"2.0","protocol":4,"method":"Веха.ЗаписатьВехуДокумента",
                "params":{"ДокументСледствие":task,"Вехи":[],"Добавить":false},"id":1};
    
    var headers = [
        {key:'x-calledmethod',value:'Veha.ZapisatVehuDokumenta'},
        {key:'x-originalmethodname',value:'0JLQtdGF0LAu0JfQsNC/0LjRgdCw0YLRjNCS0LXRhdGD0JTQvtC60YPQvNC10L3RgtCw'},
        {key:'content-type',value:'application/json; charset=utf-8'}
    ];
    
    request('POST',url,body,headers,function(err,response){
    if(callback){
        if(err) callback(err);
        callback(false,response);
    }
    });
}

function doVideoCallByTask(task_id,callback){
    getTaskInfo(task_id,function(err,data){

    }
}


function getUserIdByTask(task,callback){
    //res.result.d[296].d[0][0]
    getTaskInfo(task,function(err,data){
        if(err) callback(err);
        callback(false,data.result.d[296].d[0][0])
    })      
}

function testUserIdByTask(task){
    getUserIdByTask(task,function(err,task) { console.log(task)});
}


// Метод для получения информации о задаче по ей номеру
function getTaskInfo(task,callback){
    const TASK_ID_INDEX = 13
    if(Array.isArray(task)) task = task[TASK_ID_INDEX];

    var url = getDomain()+'service/';
    var body = {"jsonrpc":"2.0","protocol":4,"method":"СлужЗап.Прочитать","params":{"ИдО":task,"ИмяМетода":"СлужЗап.Список"},"id":1}
    
    var headers = [
        {key:'x-calledmethod',value:'SlujZap.Prochitat'},
        {key:'x-originalmethodname',value:'0KHQu9GD0LbQl9Cw0L8u0J/RgNC+0YfQuNGC0LDRgtGM'},
        {key:'content-type',value:'application/json; charset=utf-8'}
    ];
    
    request('POST',url,body,headers,function(err,response){
    if(callback){
        if(err) callback(err);
        callback(false,response);
    }
    });
}

/*function testTaskInfo(taskid){
    getTaskInfo(taskid, function(err,data){ console.log(data)});
}*/

function createGUID() {
    var a = 0
      , b = 0
      , c = (new Date).getTime().toString(16);
    c = "000000000000".substr(0, 12 - c.length) + c;
    var d = function() {
        return (c.substring(b, b += a++ % 2 ? 2 : 1) + (65536 * (1 + Math.random()) | 0).toString(16)).substring(0, 4)
    }
    ;
    return d() + d() + "-" + d() + "-" + d() + "-" + d() + "-" + d() + d() + d();
}

function callUser(userId){
    var url = '/webrtc/static/window.html#room=' + createGUID() + '&toInvite={"faceId":'+userId+',"clientId":3}&video=true';
    window.open(url, '', 'width=1110,height=832,top=52,left=405,target=window');
}