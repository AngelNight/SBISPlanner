function addTasksInCalendar(date, startDate, endDate) {
    var arrayDataTask_D = [];
    var arrayDataTask_S = [];

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

            arrayDataTask_D.push(date);
            arrayDataTask_D.push(startDate);
            arrayDataTask_D.push(endDate);

            arrayDataTask_D[15] = date;
            arrayDataTask_D[16] = startDate;
            arrayDataTask_D[17] = endDate;

            arrayDataTask_D[21] = getTimeInterval(startDate, endDate)
            arrayDataTask_D[24] = false;
            arrayDataTask_D[25] = 121;
            arrayDataTask_D[30] = 121;
            arrayDataTask_D[34] = 121;
            arrayDataTask_D[48] = createGUID();//taskGUIUserCalendar; //КалендарьПользователя.Идентификатор
            arrayDataTask_D[54] = false;
            arrayDataTask_D[56] = false;
            arrayDataTask_D[80] = createGUID();//"587d3dd2-4c81-47ab-a1a1-713eb4a19120"; //Документ.ИдентификаторДокумента
            arrayDataTask_D[82] = false;
            arrayDataTask_D[180] = createGUID();//taskGUIKindWork;//"72d4ce30-9ec2-4e0d-bd52-9ec45ea600a4"; //ВидРаботы.Идентификатор


            var dateString = {t: "Строка", n: "DataString"};
            var startDateString = {t: "Строка", n: "TimeStartString"};
            var endDateString = {t: "Строка", n: "TimeEndString"};
            arrayDataTask_S.push(dateString);
            arrayDataTask_S.push(startDateString);
            arrayDataTask_S.push(endDateString);


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
                }, dataType: "json", type: "post", contentType: 'application/json; charset=utf-8'
            })

        }, dataType: "json", type: "post", contentType: 'application/json; charset=utf-8'
    });
}

function getTimeInterval(startDate, endDate){
    var hoursInterval = parseInt(endDate.split(":")[0]) - parseInt(startDate.split(":")[0]);
    if (hoursInterval < 10){
        hoursInterval = "0" + hoursInterval;
    }

    var minutesInterval = parseInt(endDate.split(":")[1]) - parseInt(startDate.split(":")[1]);
    if (minutesInterval < 10){
        minutesInterval = "0" + minutesInterval;
    }

    return hoursInterval + ":" + minutesInterval + ":" + startDate.split(":")[2];
}
