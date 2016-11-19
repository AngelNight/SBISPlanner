window.dateOfTheLastTask = "";

var timerId = setInterval(function() {
    getTasks(function(err, data) {

        var dataSort = [];
        dataSort = BubbleSort(data);
        if(window.dateOfTheLastTask !== ""){
            var newDateOfTheLastTask = "";
            for (var i = 0, countArray = dataSort.length; i < countArray; i++) {
                if(dataSort[i][3].split(".")[0] === window.dateOfTheLastTask) {
                    break;
                }
                else {
                    if(newDateOfTheLastTask === "") {
                        newDateOfTheLastTask = dataSort[i][3].split(".")[0];
                    }
                    //пришла новая задача!!!!!!! Saw
                    //createDayList();
                    doSort();
                    alert( "!!!!!!!!!!!!!!NEW TASK!!!!!!!!!!!!" );
                }
            }

            if(newDateOfTheLastTask !== "") {
                window.dateOfTheLastTask = newDateOfTheLastTask;
            }

        } else {
            window.dateOfTheLastTask = dataSort[0][3].split(".")[0];
        }
    });
    console.log(dateOfTheLastTask); // hard
}, 30000);

function BubbleSort(A)
{
    var n = A.length;
    for (var i = 0; i < n-1; i++) {
        for (var j = 0; j < n-1-i; j++) {
            if (parseInt(A[j+1][1]) > parseInt(A[j][1])) {
                var t = A[j+1];
                A[j+1] = A[j];
                A[j] = t;
            }
        }
    }
    return A;
}
