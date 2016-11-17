//Создание задачи в разработку (нужно находиться в разделе Задачи)
var butt = $ws.single.ControlStorage.getByName('AddTask');
var filter = butt.getBrowser() ? butt.getBrowser().getQuery() : {};
filter['ТипДокумента'] = 15;
filter['ТипДокумента.ИмяОбъекта'] = "СлужЗап";
filter['ТипДокумента.ИмяДиалога'] = "js!SBIS3.EDO.Task";
var res = butt._notify("onClick", filter);



jQuery.ajax({
    url:'https://fix-online.sbis.ru/service/',
    data: JSON.stringify({
        id:1,
        jsonrpc: "2.0",
        protocol: 3,
        method: "Персонал.СписокПерсонала",
        params:{
            ДопПоля: [],
            Сортировка: null,
            Навигация: null,
            Фильтр: {
                d: ["Демо", "С разворотом", "Только листья"],
                s:[{n: "СтрокаПоиска", t: "Строка"}, {n: "Разворот", t: "Строка"}, {n: "ВидДерева", t: "Строка"}]
            }
        }
    }),success: function(res){console.log(res);},dataType:"json",type:"post",contentType: 'application/json; charset=utf-8'})