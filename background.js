// var d = new Date();
// console.log(d);
var timeouts = [];

chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {

    for (var i=0; i<timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    timeouts = [];

    // console.log(response);
    for (var col = 0; col < 2; col++){
        for(var i = 0; i < response[col].length; i++){
            var date1 = new Date(response[col][i]['created']);
            var date2 = new Date(response[col][i]['due']);

            var taskInterval = (date2-date1) + 86400000;
            
            var name = response[col][i]['data'];

            var timeNow = Date.now();
            // alert("Time passed today: " + (timeNow - date1.getTime())/(1000 * 60 * 60) + ", time since begining of task: " + timeTilDue/(1000 * 60 * 60));
            var timePassedSinceStart = (timeNow - date1.getTime());
            var task60 = 0.6 * taskInterval;
            var task90 = 0.9 * taskInterval;

            var timeTil60 = task60-timePassedSinceStart;
            var timeTil90 = task90-timePassedSinceStart;
            if(timeTil60 > 0){
                timeouts.push(setTimeout(function(){ alert("You are about halfway to your deadline for " + name + "!"); }, timeTil60));
            } else {
                timeTil60 = -1;
            }

            if(timeTil90 > 0){
                timeouts.push(setTimeout(function(){ alert(name + " is almost due!"); }, timeTil90));
            } else {
                timeTil90 = -1;
            }
            if(taskInterval-timePassedSinceStart > 0){
                timeouts.push(setTimeout(function(){ alert( name + " is due!"); }, taskInterval-timePassedSinceStart));
            }
            console.log(timeTil60);
            console.log(timeTil90);
            console.log(taskInterval-timePassedSinceStart);
        }
    }
})