
console.log("ВЫВОЛ ИЗ ПЛАГИНА");
console.log(window);

var DEBUG = 0,
    allow = true;
// ключевые фразы помеченные знаком /*!DANGER!*/
// не распознаются или распознаются с ошибками

var pageUrls = {
    'документы': 'edo.html',
    'задачи': 'mydoc.html',
    'задаче': 'mydoc.html',
    'календарь':'calendar.html'
};

var SpeechHandler = function() {
   return {
      _handlers : {
         'добавить задачу': function (text){
             if (localStorage['isTired'] == 0){
                 addTask(text);
             } else {
                 localStorage['isTired'] = 0;
                 Say("Я слишком устала. Может быть позже");
             }

         }
      },
      _log: function(text){
         console.log(text);
      },

      parse: function(text){
         text = (text.toLowerCase()).trim();

         console.log(text);
         if(DEBUG) Say(text);

         //if(!allow) return false;

         for( var handlerName in this._handlers ){
            if( text.indexOf(handlerName) + 1 ){
               this._log(handlerName);
               this._handlers[handlerName].call(this, text.replace(handlerName, '').trim());
               break;
            }
         }

         //allow = false;
      }
   };
};

// Cтарый метод. Работоспособность в текущий момент не гарантируется
function addTask(text) {
    var getnumber = new XMLHttpRequest();
    var settext = new XMLHttpRequest();
    var setempl = new XMLHttpRequest();

    getnumber.open('POST', getDomain()+'/service/sbis-rpc-service300.dll', true);
    settext.open('POST', getDomain()+'/service/sbis-rpc-service300.dll', true);
    setempl.open('POST', getDomain()+'/service/sbis-rpc-service300.dll', true);

    getnumber.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    settext.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    setempl.setRequestHeader('Content-type', 'application/json; charset=utf-8');


    text = text.trim();
    var name = text.split(' ')[0]+" "+ text.split(' ')[1];
    text = text.split(' ').slice(2).join(' ');
    // Номер рабоника для назначения задачи
    var empl;
    var number; //Номер документа
    var json_number = JSON.stringify({"jsonrpc":"2.0","protocol":3,"method":"СлужЗап.Создать",
            "params":{"Фильтр":{"d":["612693,ПапкаДокументов",false,"-1","-1","Все","true",
            "С узлами и листьями","ПапкаДокументов","Без разворота",true,"Название",false,"ПорНомер","true","1321","15","js!SBIS3.EDO.Task","СлужЗап",true],
            "s":[{"n":"ПапкаДокументов","t":"Строка"},{"n":"ФильтрУдаленные","t":"Логическое"},{"n":"ФильтрАвторИлиОтвОтдел","t":"Строка"},{"n":"ФильтрАвторИлиОтветственный","t":"Строка"},{"n":"ФильтрВладелец","t":"Строка"},{"n":"ФильтрРассчитатьВД","t":"Строка"},{"n":"ВидДерева","t":"Строка"},{"n":"HierarchyField","t":"Строка"},{"n":"Разворот","t":"Строка"},{"n":"ПутьКУзлу","t":"Логическое"},{"n":"ЗаголовокИерархии","t":"Строка"},{"n":"ЕстьДочерние","t":"Логическое"},{"n":"_ПорНомер__","t":"Строка"},{"n":"ПоказИерархии","t":"Строка"},{"n":"Регламент","t":"Строка"},{"n":"ТипДокумента","t":"Строка"},{"n":"ТипДокумента.ИмяДиалога","t":"Строка"},
                {"n":"ТипДокумента.ИмяОбъекта","t":"Строка"},
                {"n":"ВызовИзБраузера","t":"Логическое"}]},
                "ИмяМетода":"СлужЗап.Список"},"id":1});
    getEmployee(name,function(err,response) {
        response = response.result.d[0];
        if (response) {
            console.log(response[9]);
            empl = response[9];
            getnumber.send(json_number);
        } else {
            console.log('Сотрудник не найден.');
        }
    });


    getnumber.onreadystatechange = function () {
        if (getnumber.readyState != 4) return;

        if (getnumber.status != 200) {
            // обработать ошибку
            Say(getnumber.status + ': ' + getnumber.statusText);
        } else {
            try {
                console.log("Запрос на получение номера вернул: "+getnumber.responseText);
                var information = JSON.parse(getnumber.responseText);
                number = information.result.d[0];
                var json_empl = JSON.stringify({"jsonrpc":"2.0","protocol":3,"method":"ФункциональнаяОбласть.ЗаписатьЗонуОтветственностиИИсполнителей","params":{"Документ":number,"ЗонаОтветственности":null,"Исполнители":[empl.toString()]},"id":1});
                setempl.send(json_empl);
            } catch (e) {
                Say("Некорректный ответ " + e.message);
            }
        }};

    setempl.onreadystatechange = function () {

        if (setempl.readyState != 4) return;

        if (setempl.status != 200) {
            // обработать ошибку
            Say(setempl.status + ': ' + setempl.statusText);
        } else {
            try {
                console.log("Назначен работник");
                var json_text = JSON.stringify(
                    {"jsonrpc":"2.0","protocol":3,"method":"СлужЗап.Записать",
                        "params":{"Запись":{"s":[{"n":"@Документ","t":"Число целое"},
                            {"n":"Раздел","t":"Идентификатор","s":"Иерархия"},
                            {"n":"Раздел@","t":"Логическое","s":"Иерархия"},
                            {"n":"Раздел$","t":"Логическое","s":"Иерархия"},
                            {"n":"РазличныеДокументы.Информация","t":"Текст"},
                            {"n":"Подразделение.Раздел","t":"Идентификатор","s":"Иерархия"},
                            {"n":"Подразделение.Раздел@","t":"Логическое","s":"Иерархия"},
                            {"n":"Подразделение.Раздел$","t":"Логическое","s":"Иерархия"},
                            {"n":"ТипДокумента.Раздел","t":"Идентификатор","s":"Иерархия"},
                            {"n":"ТипДокумента.Раздел@","t":"Логическое","s":"Иерархия"},
                            {"n":"ТипДокумента.Раздел$","t":"Логическое","s":"Иерархия"},
                            {"n":"Регламент.Раздел","t":"Идентификатор","s":"Иерархия"},
                            {"n":"Регламент.Раздел@","t":"Логическое","s":"Иерархия"},
                            {"n":"Регламент.Раздел$","t":"Логическое","s":"Иерархия"},
                            {"n":"Контрагент.Раздел","t":"Идентификатор","s":"Иерархия"},
                            {"n":"Контрагент.Раздел@","t":"Логическое","s":"Иерархия"},
                            {"n":"Контрагент.Раздел$","t":"Логическое","s":"Иерархия"},
                            {"n":"ДокументНашаОрганизация.Контрагент.Раздел","t":"Идентификатор","s":"Иерархия"},
                            {"n":"ДокументНашаОрганизация.Контрагент.Раздел@","t":"Логическое","s":"Иерархия"},
                            {"n":"ДокументНашаОрганизация.Контрагент.Раздел$","t":"Логическое","s":"Иерархия"},
                            {"n":"РП.ИдСпискаРассылки","t":"Текст"},
                            {"s":"Иерархия","t":"Идентификатор","n":"ПапкаДокументов"},
                            {"s":"Иерархия","t":"Логическое","n":"ПапкаДокументов@"},
                            {"s":"Иерархия","t":"Логическое","n":"ПапкаДокументов$"}],
                            "d":[number,[null],null,null,text,[62],true,null,[-4],null,null,[null],false,null,[null],null,null,[null],null,null,empl,[9556,"ПапкаДокументов"],false,false],"_type":"record","_key":number}},"id":1});
                settext.send(json_text);
                console.log("Отправлен текст:"+text+"в задачу #"+number);

            } catch (e) {
                Say("Некорректный ответ " + e.message);
            }
        }

    };

    settext.onreadystatechange = function () {

        if (settext.readyState != 4) return;

        if (settext.status != 200) {
            // обработать ошибку
            Say(settext.status + ': ' + settext.statusText);
        } else {
            try {
                //Say("Задача с текстом "+text+" успешно добавлена");
                document.location.href = getDomain()+'mydoc.html';
            } catch (e) {
                Say("Некорректный ответ " + e.message);
            }

        }

    }

}

function getDomain(){
    var url = jQuery.trim(window.location.href);
    if(url.search(/^https?\:\/\//) != -1)
        url = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i, "");
    else
        url = url.match(/^([^\/?#]+)(?:[\/?#]|$)/i, "");

    return 'https://'+url[1]+'/';
}

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

// Function to get employee list
function getEmployee(name,callback) {
    var url = getDomain() + 'service/';
    var body = {
        "jsonrpc": "2.0", "protocol": 4,
        "method": "Staff.List",
        "params": {
            "Фильтр": {
                "s": [{"n": "СтрокаПоиска", "t": "Строка"}],
                "d": [name], "_type": "record"
            },
            "Сортировка": null, "Навигация": {
                "s": [{"n": "ЕстьЕще", "t": "Логическое"},
                    {"n": "РазмерСтраницы", "t": "Число целое"}, {"n": "Страница", "t": "Число целое"}],
                "d": [true, 25, 0], "_type": "record"
            }, "ДопПоля": []
        }, "id": 1
    };
 
    var headers = [
        {key:'x-calledmethod',value:'Staff.List'},
        {key:'x-originalmethodname',value:'U3RhZmYuTGlzdA=='},
        {key:'content-type',value:'application/json; charset=utf-8'}
    ];
 
    request('POST',url,body,headers,function(err,response){
        if(err) console.err(response);
        console.log(response);
        if (Array.isArray(response.result.d)) {
            if(response.result.d.length == 0) callback(response.result,null);
            //console.log(name + ' найден.');
            var curUser = response.result.d.filter(function(item) { return item[3] != true;})[0];
            callback(null,curUser);

        } else {
            //console.log('Сотрудник не найден.');
            callback(response.result);
            //Say('Сотрудник не найден.');
            //return null;
        }
    });
};


function addConference(user_name,theme){
    //var endTime = startTime + 30 мин
    const MINUTES = 30;
    var curDate = new Date();
    var startTime = curDate.toLocaleTimeString();
    var endTime = new Date(curDate.getTime()+1000*60*MINUTES).toLocaleTimeString();



    // documentID
    createConference(function(err,conference_id){
        const USER_ID_INDEX = 7;
        if(err) console.log(err);
        getEmployee(user_name, 
            function(err,emplyee_data){
                var userID;
                if(Array.isArray(emplyee_data)) userID = emplyee_data[USER_ID_INDEX];
                else userID = emplyee_data;
                addUserToConference(conference_id,userID,function(err,addUserInfo){
                    saveConference(conference_id,startTime,endTime,theme,function(err,data) { console.log (data)})
                })
            }
        );

    })
    
}

// Функция создаёт пустую задачу для заполнения
function createConference(callback){
    var url = getDomain() + 'service/';

    var body = {"jsonrpc":"2.0","protocol":4,"method":"Совещание.Создать",
                "params":{"Фильтр":{"d":[true,"6a5f3cd0-0a72-4ceb-b4ed-1081250056db",null,"2040","js!SBIS3.Meetings.MeetingDialog","Совещание"],
                "s":[{"n":"ВызовИзБраузера","t":"Логическое"},{"n":"ИдРегламента","t":"Строка"},{"n":"Регламент","t":"Строка"},{"n":"ТипДокумента","t":"Строка"},
                {"n":"ТипДокумента.ИмяДиалога","t":"Строка"},{"n":"ТипДокумента.ИмяОбъекта","t":"Строка"}]},"ИмяМетода":"Совещание.Список"},"id":1};

    var headers = [
        {key:'x-calledmethod',value:'Soveschanie.Sozdat'},
        {key:'x-originalmethodname',value:'0KHQvtCy0LXRidCw0L3QuNC1LtCh0L7Qt9C00LDRgtGM'},
        {key:'content-type',value:'application/json; charset=utf-8'}
    ];
 
    request('POST',url,body,headers,function(err,response){
        console.log(response);
        callback(null,response.result.d[0]) // Скорее всего id созданной конференции.
    });
}


function addUserToConference(conferenceid,userid,callback){
    var url = getDomain() + 'service/';
    var body = {"jsonrpc":"2.0","protocol":4,"method":"Совещание.СоздатьУчастниковСовещания",
                "params":{"ИдСовещания":conferenceid,
                "Участники":[userid],
                "Тип":1,"Дата":"2016-11-19"
                },"id":1
    };

    var headers = [
        {key:'x-calledmethod',value:'Soveschanie.Sozdat'},
        {key:'x-originalmethodname',value:'0KHQvtCy0LXRidCw0L3QuNC1LtCh0L7Qt9C00LDRgtGM'},
        {key:'content-type',value:'application/json; charset=utf-8'}
    ];

    request('POST',url,body,headers,function(err,response){
        callback(null,response); // Скорее всего id созданной конференции.
    });
}

function saveConference(confreneId,startTime,endTime,theme,callback){
        var url = getDomain() + 'service/';
        var body = {"jsonrpc":"2.0","protocol":4,
        "method":"Совещание.Записать",
        "params":{"Запись":{"s":[{"n":"@Документ","t":"Число целое"},
        {"n":"Раздел","t":"Идентификатор","s":"Иерархия"},{"n":"Раздел@","t":"Логическое","s":"Иерархия"},
        {"n":"Раздел$","t":"Логическое","s":"Иерархия"},{"n":"Совещание.Тема","t":"Текст"},
        {"n":"Совещание.ВремяНач","t":"Время"},{"n":"Совещание.ВремяКнц","t":"Время"},
        {"n":"ТипДокумента.Раздел","t":"Идентификатор","s":"Иерархия"},
        {"n":"ТипДокумента.Раздел@","t":"Логическое","s":"Иерархия"},
        {"n":"ТипДокумента.Раздел$","t":"Логическое","s":"Иерархия"},
        {"n":"Подразделение.Раздел","t":"Идентификатор","s":"Иерархия"},
        {"n":"Подразделение.Раздел@","t":"Логическое","s":"Иерархия"},
        {"n":"Подразделение.Раздел$","t":"Логическое","s":"Иерархия"},
        {"n":"Контрагент.Раздел","t":"Идентификатор","s":"Иерархия"},
        {"n":"Контрагент.Раздел@","t":"Логическое","s":"Иерархия"},
        {"n":"Контрагент.Раздел$","t":"Логическое","s":"Иерархия"},
        {"n":"ДокументНашаОрганизация.Контрагент.Раздел","t":"Идентификатор","s":"Иерархия"},
        {"n":"ДокументНашаОрганизация.Контрагент.Раздел@","t":"Логическое","s":"Иерархия"},
        {"n":"ДокументНашаОрганизация.Контрагент.Раздел$","t":"Логическое","s":"Иерархия"}],
        "d":[confreneId,[null],null,null,"<p>"+theme+"</p>",startTime,endTime,
        [2038],false,null,[199],true,null,[null],null,null,[null],null,null],"_mustRevive":true,"_type":"record","_key":confreneId}},"id":1}

    var headers = [
        {key:'x-calledmethod',value:'Soveschanie.Zapisat'},
        {key:'x-originalmethodname',value:'0KHQvtCy0LXRidCw0L3QuNC1LtCX0LDQv9C40YHQsNGC0Yw='},
        {key:'content-type',value:'application/json; charset=utf-8'}
    ];
    request('POST',url,body,headers,function(err,response){
        callback(null,response); // Скорее всего id созданной конференции.
    });
}

function closeTask(id, type, comment) {
    var id = id;
    var type = type;
    var comment = comment;
    var url = getDomain() + 'service/';
    var xhr = new XMLHttpRequest();
    var getnumber = new XMLHttpRequest();
    getnumber.open('POST', url, true);
    getnumber.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    var body = JSON.stringify({
        "jsonrpc": "2.0", "protocol": 4,
        "method": "СлужЗап.ВыполнитьДействие",
        "params": {
            "Документ": {
                "s": [{"n": "Идентификатор", "t": "Строка"}, {"n": "ПервичныйКлюч", "t": "Число целое"}, {"n": "Этап", "t": "Выборка"}],
                "d": [id + "", id,
                {
                    "s": [ 
                        {"n": "Действие","t": "Выборка"}
                        ],
                    "d": [[ 
                        {"s": [ 
                                {"n": "Название", "t": "Строка"}, 
                                {"n": "Комментарий", "t": "Строка"}
                              ],
                          "d": [[type, null]],
                          "_type": "recordset",
                          "_mustRevive": true
                        }]],
                    "_type": "recordset",
                    "_mustRevive": true
                }],
                "_key": id + "",
                "_mustRevive": true,
                "_type": "record"
            }
        }
    });
    getnumber.send(body);
}