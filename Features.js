var timerId = setInterval(function() {
    var allTasksOnCalendar = $(".event");

    for(var i=0; i < allTasksOnCalendar.length; i++) {
        if(allTasksOnCalendar[i].title == "ОБЕД"){
            allTasksOnCalendar[i].style.backgroundColor = "#ff9304";
        }
    }
    console.log("lunch"); // hard
}, 1000);

var timerId = setInterval(function() {
    getTasks(function(err, data) {
        var allTasksOnCalendar = $(".event");

        for (var j = 0, countArray = data.length; j < countArray; j++) {
            if(data[j][74] != null) {
                var stringTitle = data[j][4].substring(3, data[j][4].length - 4);

                if (data[j][4].substring(3, data[j][4].length - 4) != "ОБЕД") {
                    if(data[j][74][0] == true){
                        for(var i=0; i < allTasksOnCalendar.length; i++) {
                            if(allTasksOnCalendar[i].title == stringTitle){
                                allTasksOnCalendar[i].getElementsByClassName("link")[0].style.color = "#3500ff";
                            }
                        }
                    }
                    if(data[j][74][2] == true){
                        for(var i=0; i < allTasksOnCalendar.length; i++) {
                            if(allTasksOnCalendar[i].title == stringTitle){
                                allTasksOnCalendar[i].style.backgroundColor = "#ff0000";
                            }
                        }
                    }
                    if(data[j][74][3] == true){
                        for(var i=0; i < allTasksOnCalendar.length; i++) {
                            if(allTasksOnCalendar[i].title == stringTitle){
                                allTasksOnCalendar[i].style.backgroundColor = "#00ff00";
                            }
                        }
                    }
                    if(data[j][74][4] == true){
                        for(var i=0; i < allTasksOnCalendar.length; i++) {
                            if(allTasksOnCalendar[i].title == stringTitle){
                                allTasksOnCalendar[i].style.backgroundColor = "#0bf";
                            }
                        }
                    }
                    if(data[j][74][5] == true){
                        for(var i=0; i < allTasksOnCalendar.length; i++) {
                            if(allTasksOnCalendar[i].title == stringTitle){
                                allTasksOnCalendar[i].style.backgroundColor = "#fff400";
                            }
                        }
                    }
                }
            }
        }
    });
    console.log(dateOfTheLastTask); // hard
}, 1000);
