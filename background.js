// "background": {
//     "scripts": ["background.js"]
// },
// var d = new Date();
// console.log(d);

chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
    chrome.notifications.getAll((items) => {
		if ( items ) {
			for (let key in items) {
				chrome.notifications.clear(key);
			}
		}
	});
    // console.log("recevied message");
    // for (var i=0; i<timeouts.length; i++) {
    //     clearTimeout(timeouts[i]);
    // }
    taskStarts = [];
    taskDues = [];

    // console.log(response);
    var name = "";
    for (var col = 0; col < 2; col++){
        for(var i = 0; i < response[col].length; i++){
            name += response[col][i]['data'] + ", ";
            // var message = name + " col: " + col.toString() + " pos: " + i.toString()
            // console.log(message);

            var date1 = new Date(response[col][i]['created']);
            var date2 = new Date(response[col][i]['due']);

            var datePair = {
                "start": date1.toString(),
                "due": date2.toString()
            };
            alreadyExists = false;
            if(taskStarts.includes(datePair["start"]) && taskDues.includes(datePair["due"])){
                alreadyExists = true;
            } else {
                taskStarts.push(datePair["start"]);
                taskDues.push(datePair["due"]);
            }
            // console.log(taskStarts);
            // console.log(taskDues);


            if (!alreadyExists){
                // taskDueDates.push(datePair);
                console.log("pushed unique date");
                var taskInterval = (date2-date1) + 86400000;

                var timeNow = Date.now();
                // alert("Time passed today: " + (timeNow - date1.getTime())/(1000 * 60 * 60) + ", time since begining of task: " + timeTilDue/(1000 * 60 * 60));
                var timePassedSinceStart = (timeNow - date1.getTime());
                var task60 = 0.6 * taskInterval;
                var task90 = 0.9 * taskInterval;

                var timeTil60 = task60-timePassedSinceStart;
                var timeTil90 = task90-timePassedSinceStart;
                var timeTilDue = taskInterval-timePassedSinceStart

                // timeTil60 = 1000;
                // timeTil90 = 5000;
                // timeTilDue = 10000;
                if(timeTil60 > 0){
                    // timeouts.push(setTimeout(function(){ alert("You are about halfway to your deadline for some tasks!"); }, 0));
                    // timeouts.push(setTimeout(function(){ alert("You are about halfway to your deadline for some tasks!"); }, timeTil60));
                    setTimeout(function() {
                        notification("You are about halfway to your deadline for some tasks!");
                    },timeTil60);

                } else {
                    timeTil60 = -1;
                    // setTimeout(function() {
                    //     notification("You are about halfway to your deadline for some tasks!");
                    // },3000);
                }

                if(timeTil90 > 0){
                    setTimeout(function() {
                        notification("Some tasks are almost due!");
                    },timeTil90);
                    // timeouts.push(setTimeout(function(){ alert("Some tasks are almost due!"); }, timeTil90));
                } else {
                    timeTil90 = -1;
                }
                if(taskInterval-timePassedSinceStart > 0){
                    setTimeout(function() {
                        notification("Some tasks are due!");
                    },timeTilDue);
                    // timeouts.push(setTimeout(function(){ alert("Some tasks are due!"); }, timeTilDue));
                }
                console.log(timeTil60);
                console.log(timeTil90);
                console.log(taskInterval-timePassedSinceStart);
            }
            // console.log(taskDueDates.length);
        }
    }
});

function notification(message){
    chrome.notifications.create(
        {
            title: "Task Reminder!",
            message: message,
            iconUrl: "images/synchro-logo.png",
            type: "basic",
            requireInteraction: true
        }
    );
}
