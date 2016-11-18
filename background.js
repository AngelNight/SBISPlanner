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
