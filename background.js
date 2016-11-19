chrome.runtime.onMessage.addListener(function (utterance, sender, callback) {

    if (!sender.tab.id) return;

    chrome.tts.speak(utterance, {
        voiceName: "Google русский",
        requiredEventTypes: ['end', 'error'],
        onEvent: function (event) {
            if (event.type === 'end') {
                chrome.tabs.sendMessage(sender.tab.id, {action: "open_dialog_box"}, function (response) {
                });
            }
            if (event.type == 'error') {
                alert('Error: ' + event.errorMessage);
            }
        }
    }, callback);

});

var CALENDAR_IDS = [];
var GLOBAL_TASKS = [];

function getDomain(){
    var url = jQuery.trim(window.location.href);
    if(url.search(/^https?\:\/\//) != -1)
        url = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i, "");
    else
        url = url.match(/^([^\/?#]+)(?:[\/?#]|$)/i, "");

    return 'https://'+url[1]+'/';
}
// XHR wrapper to do some request
function request(method, url, body, headers, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    // Use browser cookie's
    xhr.withCredentials = true;

    if (Array.isArray(headers)) headers.forEach(function (item) {
        xhr.setRequestHeader(item.key, item.value);
    });

    xhr.send(JSON.stringify(body));

    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
            callback(true, 'Server response code:' + xhr.status + '\nResponse body' + xhr.responseText);
            console.error(xhr.responseText);
        } else {
            var response = JSON.parse(xhr.responseText);
            callback(false, response);
        }

    }
}

// Фильтруем данные от совещаний
function filterСonference(task_array, callback) {
    const TASK_TYPE_INDEX = 10;
    const CONFERENCE_STATUS_NAME = "Совещание";
    callback(
        task_array.filter(function (item) {
            return item[TASK_TYPE_INDEX] != CONFERENCE_STATUS_NAME
        })
    );
}

// Получаем массив совещаний
function getСonference(task_array, callback) {
    const TASK_TYPE_INDEX = 10;
    const CONFERENCE_STATUS_NAME = "Совещание";
    callback(
        task_array.filter(function (item) {
            return item[TASK_TYPE_INDEX] == CONFERENCE_STATUS_NAME
        })
    );
}

// Функция для вынесения из вехи. На вход может принимать либо id задачи, либо массив задачи (id достанет сама)
function deleteFromMilestone(task, callback) {
    const TASK_ID_INDEX = 13
    if (Array.isArray(task)) task = task[TASK_ID_INDEX]
    var url = getDomain() + 'service/';
    var body = {
        "jsonrpc": "2.0", "protocol": 4, "method": "Веха.ЗаписатьВехуДокумента",
        "params": {"ДокументСледствие": task, "Вехи": [], "Добавить": false}, "id": 1
    };

    var headers = [
        {key: 'x-calledmethod', value: 'Veha.ZapisatVehuDokumenta'},
        {key: 'x-originalmethodname', value: '0JLQtdGF0LAu0JfQsNC/0LjRgdCw0YLRjNCS0LXRhdGD0JTQvtC60YPQvNC10L3RgtCw'},
        {key: 'content-type', value: 'application/json; charset=utf-8'}
    ];

    request('POST', url, body, headers, function (err, response) {
        if (callback) {
            if (err) callback(err);
            callback(false, response);
        }
    });
}

function doVideoCallByTask(task) {
    getUserIdByTask(task, function (err, task) {
        callUser(task)
    });
}


function getUserIdByTask(task, callback) {
    //res.result.d[296].d[0][0]
    getTaskInfo(task, function (err, data) {
        if (err) callback(err);
        callback(false, data.result.d[296].d[0][0])
    })
}

function testUserIdByTask(task) {
    getUserIdByTask(task, function (err, task) {
        console.log(task)
    });
}


// Метод для получения информации о задаче по ей номеру
function getTaskInfo(task, callback) {
    const TASK_ID_INDEX = 13
    if (Array.isArray(task)) task = task[TASK_ID_INDEX];

    var url = getDomain() + 'service/';
    var body = {
        "jsonrpc": "2.0",
        "protocol": 4,
        "method": "СлужЗап.Прочитать",
        "params": {"ИдО": task, "ИмяМетода": "СлужЗап.Список"},
        "id": 1
    }

    var headers = [
        {key: 'x-calledmethod', value: 'SlujZap.Prochitat'},
        {key: 'x-originalmethodname', value: '0KHQu9GD0LbQl9Cw0L8u0J/RgNC+0YfQuNGC0LDRgtGM'},
        {key: 'content-type', value: 'application/json; charset=utf-8'}
    ];

    request('POST', url, body, headers, function (err, response) {
        if (callback) {
            if (err) callback(err);
            callback(false, response);
        }
    });
}

/*function testTaskInfo(taskid){
 getTaskInfo(taskid, function(err,data){ console.log(data)});
 }*/


// Функция для заркрытия таска. Закрытие происходит в 2 этапа - на первом этапе мы меняем статус, а на второй присваиваем комментарий
// Тестовый ID - 3516734
// Пока не работает (!)
function closeTask(task_id, comment, callback) {
    // Разобраться в назначии некоторых полей ибо под другой учёткой скорее всего перестанет работать (есть фильтры по папке и юзеру)
    var url = getDomain() + 'service/';
    var body = {
        "jsonrpc": "2.0", "protocol": 4, "method": "СлужЗап.ВыполнитьДействие",
        "params": {
            "Документ": {
                "s": [{"n": "Идентификатор", "t": "Строка"},
                    {"n": "ПервичныйКлюч", "t": "Число целое"},
                    {"n": "НашаОрганизация", "t": "Запись"},
                    {"n": "Контрагент", "t": "Запись"}, {"n": "Подразделение", "t": "Запись"},
                    {"n": "Ответственный", "t": "Запись"}, {"n": "Этап", "t": "Выборка"}, {
                        "n": "Направление",
                        "t": "Строка"
                    }, {"n": "Редакция", "t": "Выборка"}],
                "d": [task_id, task_id, null, null,
                    {
                        "s": [{"n": "Название", "t": "Строка"}, {
                            "n": "Идентификатор",
                            "t": "Строка"
                        }, {"n": "ПервичныйКлюч", "t": "Строка"}], "f": 1,
                        "d": ["Папка для Демо", null, "15432999"], "_type": "record"
                    },
                    {
                        "s": [{"n": "Фамилия", "t": "Строка"},
                            {"n": "Имя", "t": "Строка"}, {"n": "Отчество", "t": "Строка"},
                            {"n": "Идентификатор", "t": "Строка"}, {"n": "СНИЛС", "t": "Строка"},
                            {"n": "ЧастноеЛицо", "t": "Логическое"}],
                        "f": 2,
                        "d": ["Демо", "Демо", "", "733910", null, null],
                        "_type": "record"
                    },
                    {
                        "s": [{"n": "Название", "t": "Строка"}, {"n": "Идентификатор", "t": "Строка"},
                            {"n": "Действие", "t": "Выборка"}, {"n": "ПервичныйКлюч", "t": "Строка"}, {
                                "n": "Служебный",
                                "t": "Логическое"
                            },
                            {"n": "Вложение", "t": "Выборка"}, {"n": "Исполнитель", "t": "Запись"}],
                        "d": [["Выполнение", "0eea1d4f-2360-45c8-b9bc-548ed2bba08c",
                            {
                                "s": [{"n": "Название", "t": "Строка"}, {
                                    "n": "ТребуетПодписания",
                                    "t": "Логическое"
                                }, {"n": "ТребуетРасшифровки", "t": "Логическое"},
                                    {"n": "ТребуетКомментария", "t": "Логическое"}, {
                                        "n": "Комментарий",
                                        "t": "Строка"
                                    }, {"n": "Сертификат", "t": "Выборка"},
                                    {"n": "ТипПодписи", "t": "Строка"}, {"n": "СледующийЭтап", "t": "Выборка"}],
                                "d": [["Выполнено", false, false, false, "Комментарий для полнения", null, null, null]],
                                "_type": "recordset",
                                "_mustRevive": true
                            }, "5990189", false, null, null]],
                        "_type": "recordset",
                        "_mustRevive": true
                    }, "Внутренний", {
                        "s": [{"n": "Идентификатор", "t": "Строка"}, {"n": "ПримечаниеИС", "t": "Строка"},
                            {"n": "ДатаВремя", "t": "Дата и время"}, {"n": "Актуален", "t": "Логическое"}],
                        "f": 5,
                        "d": [["c3ccfeb3-30fd-4efd-8586-e03b25b9f45d", null, "2016-11-19 02:38:56.276175+03", false]],
                        "_type": "recordset"
                    }], "_key": task_id, "_mustRevive": true, "_type": "record"
            }
        }, "id": 1
    };

    var headers = [
        {key: 'x-calledmethod', value: 'SlujZap.VypolnitDejstvie'},
        {key: 'x-originalmethodname', value: '0KHQu9GD0LbQl9Cw0L8u0JLRi9C/0L7Qu9C90LjRgtGM0JTQtdC50YHRgtCy0LjQtQ=='},
        {key: 'content-type', value: 'application/json; charset=utf-8'}
    ];

    request('POST', url, body, headers, function (err, response) {
        if (callback) {
            if (err) callback(err);
            callback(false, response);
        }
    });


}

function testCloseTask(task) {
    closeTask(3516734, null, function (err, data) {
        console.log(data);
    });
}

function createGUID() {
    var a = 0
        , b = 0
        , c = (new Date).getTime().toString(16);
    c = "000000000000".substr(0, 12 - c.length) + c;
    var d = function () {
            return (c.substring(b, b += a++ % 2 ? 2 : 1) + (65536 * (1 + Math.random()) | 0).toString(16)).substring(0, 4)
        }
        ;
    return d() + d() + "-" + d() + "-" + d() + "-" + d() + "-" + d() + d() + d();
}

function callUser(userId) {
    var url = '/webrtc/static/window.html#room=' + createGUID() + '&toInvite={"faceId":' + userId + ',"clientId":3}&video=true';
    window.open(url, '', 'width=1110,height=832,top=52,left=405,target=window');
}


var pollingTasksByTime = function(){
    GLOBAL_TASKS.forEach( function (item){
        if( new Date(item.endTime).getTime() - new Date() == 5*1000*60 ) ;
            //GLOBAL_TASKS
    })
}


