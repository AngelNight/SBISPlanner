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

// FirstBy - a little lib to sort arrays by multiply fields
firstBy = (function () {

    function identity(v) {
        return v;
    }

    function ignoreCase(v) {
        return typeof(v) === "string" ? v.toLowerCase() : v;
    }

    function makeCompareFunction(f, opt) {
        opt = typeof(opt) === "number" ? {direction: opt} : opt || {};
        if (typeof(f) != "function") {
            var prop = f;
            // make unary function
            f = function (v1) {
                return !!v1[prop] ? v1[prop] : "";
            }
        }
        if (f.length === 1) {
            // f is a unary function mapping a single item to its sort score
            var uf = f;
            var preprocess = opt.ignoreCase ? ignoreCase : identity;
            f = function (v1, v2) {
                return preprocess(uf(v1)) < preprocess(uf(v2)) ? -1 : preprocess(uf(v1)) > preprocess(uf(v2)) ? 1 : 0;
            }
        }
        if (opt.direction === -1)return function (v1, v2) {
            return -f(v1, v2)
        };
        return f;
    }

    function tb(func, opt) {
        var x = typeof(this) == "function" ? this : false;
        var y = makeCompareFunction(func, opt);
        var f = x ? function (a, b) {
            return x(a, b) || y(a, b);
        }
            : y;
        f.thenBy = tb;
        return f;
    }

    return tb;
})();

function getDomain() {
    return 'https://' + window.location.hostname + '/';
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


// Function to get task list
function getTasks(callback) {
    var url = getDomain() + 'service/';
    var body = {
        "jsonrpc": "2.0", "protocol": 4,
        "method": "СвязьПапок.ДокументыВПапке",
        "params": {
            "Фильтр": {
                "s": [{"n": "ВключитьСписокИсполнителей", "t": "Логическое"},
                    {"n": "ВнешняяИерархия", "t": "Логическое"},
                    {"n": "ПапкаДокументов", "t": "Строка"}, {"n": "ПоказИерархии", "t": "Логическое"},
                    {"n": "ПростыеВД", "t": "Логическое"}, {"n": "РассчитатьФото", "t": "Логическое"}],
                "d": [true, true, "", false, true, true], "_type": "record"
            },
            "Сортировка": null, "Навигация": {
                "s": [{"n": "ЕстьЕще", "t": "Логическое"},
                    {"n": "РазмерСтраницы", "t": "Число целое"}, {"n": "Страница", "t": "Число целое"}],
                "d": [true, 25, 0], "_type": "record"
            }, "ДопПоля": []
        }, "id": 1
    };

    var headers = [
        {key: 'x-calledmethod', value: 'SvyazPapok.DokumentyVPapke'},
        {key: 'x-originalmethodname', value: '0KHQstGP0LfRjNCf0LDQv9C+0Lou0JTQvtC60YPQvNC10L3RgtGL0JLQn9Cw0L/QutC1'},
        {key: 'content-type', value: 'application/json; charset=utf-8'}
    ];

    request('POST', url, body, headers, function (err, response) {
        if (err) callback(err);
        callback(false, response.result.d);
    });
}

// Сортирует задания по дате окончания и по приоритету
function sortTasks(err, tasks, callback) {
    if (err) {
        console.log('Error');
        callback(err);
    }
    //console.log(tasks);
    callback(false,
        tasks.sort(
            firstBy(function sortByDealine(v1, v2) {
                const DEADLINE_INDEX = 5;
                var firstDate = new Date(v1[DEADLINE_INDEX]);
                var secondDate = new Date(v2[DEADLINE_INDEX]);
                return new Date(firstDate) - new Date(secondDate);
            }).thenBy(function sortByPriority(v1, v2) {
                const PRIORITY_INDEX = 30;
                return ( v1[PRIORITY_INDEX] > v2[PRIORITY_INDEX] ) ? -1 :
                    ( v1[PRIORITY_INDEX] < v2[PRIORITY_INDEX] ) ? 1 : 0;

            })
        )
    );
}

var GLOBAL_TASKS = [];

// Пример сортировки данных и вывода их в консоль.
function doSort() {
    getTasks(function (err, tasks) {
        sortTasks(err, tasks,
            function (err, sorted_array) {
                createDayList(err, sorted_array, new Date());
            })
    })
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function createDayList(err, tasks, date) {

    var startDate = (date == null) ? new Date() : date;
    var day = formatDate(startDate);
    if (err) console.log(err);
    var hoursStart = 9;
    var hoursEnd = 10;
    var minutesStart = 0;
    var minutesEnd = 0;

    tasks.forEach(function (task, index) {
        var stringStartTime = ((hoursStart < 10 ) ? "0" + hoursStart : hoursStart.toString()) + ":" +
            ((minutesStart < 10 ) ? "0" + minutesStart : minutesStart.toString()) + ":00+03";

        var stringEndTime = ((hoursEnd < 10 ) ? "0" + hoursEnd : hoursEnd.toString()) + ":" +
            ((minutesEnd < 10 ) ? "0" + minutesEnd : minutesEnd.toString()) + ":00+03";

        addTasksInCalendar(task[1], formatDate(day), stringStartTime, stringEndTime);

        hoursStart = hoursEnd;
        hoursEnd++;

        if (hoursEnd > 17) {
            startDate.setMonth(parseInt(day.split("-")[1]) - 1, parseInt(day.split("-")[2]) + 1);
            day = formatDate(startDate);
            hoursStart = 9;
            hoursEnd = 10;
            minutesStart = 0;
            minutesEnd = 0;
        }

        console.log(day)
    })
}

function consoleTaskInfo(one_task_array) {
    var item = one_task_array;
    console.log("Срок завершения: %s \n Приоритет: %s\n Тип: %s", item[5], item[30], item[10]);
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
