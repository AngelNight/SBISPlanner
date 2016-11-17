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
    findUserByName(name,function(response) {
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
