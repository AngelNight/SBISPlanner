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


// Function to get task list
function getTasks(callback) {
    var url = getDomain() + 'service/';


    var body =
            {
                "jsonrpc": "2.0", "protocol": 4,
                "method": "СвязьПапок.ДокументыВПапке",
                "params": {
                    "Фильтр": {
                        "s": [{"n": "ВключитьСписокИсполнителей", "t": "Логическое"}, {
                            "n": "ВнешняяИерархия",
                            "t": "Логическое"
                        }, {"n": "ПапкаДокументов", "t": "Строка"}, {
                            "n": "ПоказИерархии",
                            "t": "Логическое"
                        }, {"n": "ПростыеВД", "t": "Логическое"}, {"n": "РассчитатьФото", "t": "Логическое"}],
                        "d": [true, true, "", false, true, true],
                        "_type": "record"
                    }
                    ,
                    "Сортировка": null, "Навигация": {
                        "s": [{"n": "ЕстьЕще", "t": "Логическое"}, {"n": "РазмерСтраницы", "t": "Число целое"}, {
                            "n": "Страница",
                            "t": "Число целое"
                        }], "d": [true, 25, 0], "_type": "record"
                    }
                    ,
                    "ДопПоля": []
                }
                ,
                "id": 1
            }
        ;

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

            }).thenBy(function sortByImportance(v1, v2) {
                const IMPORTANCE_INDEX = 74;
                var v1_score = 0, v2_score = 0;
                [60, 50, 40, 30, 20, 10].forEach(function countScores(item, index) {
                    v1_score += (v1[IMPORTANCE_INDEX] == null) ? 0 : item * v1[IMPORTANCE_INDEX][index];
                    v2_score += (v2[IMPORTANCE_INDEX] == null) ? 0 : item * v2[IMPORTANCE_INDEX][index];
                })
                return v1_score - v2_score;
            })
        )
    );
}


// Пример сортировки данных и вывода их в консоль.
function doSort() {
    getTasks(function (err, tasks) {
        sortTasks(err, tasks,
            function (err, sorted_array) {
                createDayList(err, sorted_array, new Date());
            })
    })
}

function popLastTask() {
    var tasks = (localStorage.getItem("TASK_IDS") == "") ? [-1] : localStorage.getItem("TASK_IDS").split(",").map(function (el) {
        return parseInt(el);
    });
    var res = parseInt(tasks.shift());
    localStorage.setItem("TASK_IDS", tasks);
    return res;
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
    cleanUpCalendar();

    var store = (localStorage.getItem("CALENDAR_IDS") == "") ? [] : localStorage.getItem("CALENDAR_IDS").split(",").map(function (el) {
        return parseInt(el);
    });

    store.forEach(function (item) {
        deleteTaskFromCalendar(item);
    });

    localStorage.setItem("CALENDAR_IDS", store);

    localStorage.setItem("TASK_IDS", []);

    var startDate = (date == null) ? new Date() : date;
    var day = formatDate(startDate);
    if (err) console.log(err);
    var hoursStart = startDate.getHours() + 1;
    var hoursEnd = hoursStart + 1;
    var minutesStart = 0;
    var minutesEnd = 0;
    var rest = 0;

    GLOBAL_TASKS = [];
    tasks.forEach(function (task, index) {
        if (hoursEnd > 17 || hoursStart < 9) {
            startDate.setMonth(parseInt(day.split("-")[1]) - 1, parseInt(day.split("-")[2]) + 1);
            day = formatDate(startDate);
            hoursStart = 9;
            hoursEnd = 10;
            minutesStart = 0;
            minutesEnd = 0;
        }

        var tasks = (localStorage.getItem("TASK_IDS") == "") ? [] : localStorage.getItem("TASK_IDS").split(",").map(function (el) {
            return parseInt(el);
        });

        tasks.push(task[1]);

        localStorage.setItem("TASK_IDS", tasks);

        var stringStartTime = ((hoursStart < 10 ) ? "0" + hoursStart : hoursStart.toString()) + ":" +
            ((minutesStart < 10 ) ? "0" + minutesStart : minutesStart.toString()) + ":00+03";

        var stringEndTime = ((hoursEnd < 10 ) ? "0" + hoursEnd : hoursEnd.toString()) + ":" +
            ((minutesEnd < 10 ) ? "0" + minutesEnd : minutesEnd.toString()) + ":00+03";

        addTasksInCalendar(task[1], formatDate(day), stringStartTime, stringEndTime);

        GLOBAL_TASKS.push({task: task, start: stringStartTime, end: stringEndTime});

        hoursStart++;
        hoursEnd++;
        rest++;

        /**
         * Генерация перерыва после двух тяжелых часов работы.
         */
        if (rest == 4) {
            console.log("отдых c " + hoursStart + " до " + hoursEnd);
            rest = 0;
            hoursStart++;
            hoursEnd++;
        }
        console.log(day)
    })
}

function consoleTaskInfo(one_task_array) {
    var item = one_task_array;
    console.log("Срок завершения: %s \n Приоритет: %s\n Тип: %s", item[5], item[30], item[10]);
}
