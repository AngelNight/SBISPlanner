function addTasksInCalendar(taskGUIUserCalendar, taskGUIDoc, taskGUIKindWork, date, startDate, endDate) {
    var arrayDataTask_D;
    var arrayDataTask_S;

    // create record
    var createNewTaskForCalendar = jQuery.ajax({
        url: 'https://fix-online.sbis.ru/service/',
        data: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "Работа.Создать",
            params: {
                ИмяМетода: "БазовоеРасширение",
                Фильтр: {
                    d: [],
                    s: []
                }
            },
            protocol: 4,
        }), success: function (res) {
            console.log(res);
            arrayDataTask_D = res.result.d;
            arrayDataTask_S = res.result.s;


        }, dataType: "json", type: "post", contentType: 'application/json; charset=utf-8'
    })

    if (createNewTaskForCalendar) {
        var currentDate = date;//"2016-11-19";
        var currentStartTime = startDate;//"11:11:00+03";
        var currentEndTime = endDate;//"12:12:00+03";
        arrayDataTask_D.push(currentDate);
        arrayDataTask_D.push(currentStartTime);
        arrayDataTask_D.push(currentEndTime);

        arrayDataTask_D[15] = currentDate;
        arrayDataTask_D[16] = currentStartTime;
        arrayDataTask_D[17] = currentEndTime;

        arrayDataTask_D[21] = "01:01:00+03";
        arrayDataTask_D[24] = false;
        arrayDataTask_D[25] = 121;
        arrayDataTask_D[30] = 121;
        arrayDataTask_D[34] = 121;
        arrayDataTask_D[48] = "cd839d08-8a78-4530-9e2e-ea05c55956f5";//taskGUIUserCalendar; //КалендарьПользователя.Идентификатор
        arrayDataTask_D[54] = false;
        arrayDataTask_D[56] = false;
        arrayDataTask_D[80] = taskGUIDoc;//"587d3dd2-4c81-47ab-a1a1-713eb4a19120"; //Документ.ИдентификаторДокумента
        arrayDataTask_D[82] = false;
        arrayDataTask_D[180] = "72d4ce30-9ec2-4e0d-bd52-9ec45ea600a4";//taskGUIKindWork;//"72d4ce30-9ec2-4e0d-bd52-9ec45ea600a4"; //ВидРаботы.Идентификатор


        var currentDateString = {t: "Строка", n: "DataString"};
        var currentStartTimeString = {t: "Строка", n: "TimeStartString"};
        var currentEndTimeString = {t: "Строка", n: "TimeEndString"};
        arrayDataTask_S.push(currentDateString);
        arrayDataTask_S.push(currentStartTimeString);
        arrayDataTask_S.push(currentEndTimeString);

        var result;


        // Save record
        var sendRecord = jQuery.ajax({
            url: 'https://fix-online.sbis.ru/service/',
            data: JSON.stringify({
                id: 1,
                jsonrpc: "2.0",
                method: "Работа.Записать",
                params: {
                    Запись: {
                        _key: null,
                        _mustRevive: true,
                        _type: "record",
                        d: arrayDataTask_D,
                        s: arrayDataTask_S
                    }
                },
                protocol: 4,
            }), success: function (res) {
                console.log(res);
                result = res;


            }, dataType: "json", type: "post", contentType: 'application/json; charset=utf-8'
        })

        //list working tasks
        jQuery.ajax({
            url: 'https://fix-online.sbis.ru/service/',
            data: JSON.stringify({
                id: 1,
                jsonrpc: "2.0",
                method: "Работа.СписокРаботСотрудникаРабочееВремя",
                params: {
                    ДопПоля: [],
                    Навигация: {
                        d: [0, 20, false],
                        s: [{n: "Страница", t: "Число целое"}, {n: "РазмерСтраницы", t: "Число целое"}, {
                            n: "ЕстьЕще",
                            t: "Логическое"
                        }]
                    },
                    Сортировка: null,
                    Фильтр: {
                        d: [true, "2016-11-19", "3393319", "14451157"],
                        s: [
                            {n: "ВсеСотрудники", t: "Логическое"},
                            {n: "Дата", t: "Строка"},
                            {n: "Документ", t: "Строка"},
                            {n: "Исполнитель", t: "Строка"}
                        ]
                    },

                },
                protocol: 4,
            }), success: function (res) {
                console.log(res);
            }, dataType: "json", type: "post", contentType: 'application/json; charset=utf-8'
        })


        jQuery.ajax({
            url: 'https://fix-online.sbis.ru/service/',
            data: JSON.stringify({
                id: 1,
                jsonrpc: "2.0",
                method: "Работа.ПодобратьВремяНачала",
                params: {
                    Дата: "2016-11-19",
                    Календарь: -1,
                    ЧастноеЛицо: 121

                },
                protocol: 4,
            }), success: function (res) {
                console.log(res);
            }, dataType: "json", type: "post", contentType: 'application/json; charset=utf-8'
        })
    }
}