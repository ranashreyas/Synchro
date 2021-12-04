var uuid = 0;
var myId = 0;
var todoArr = {};
var inProgressArr = {};
var completedArr = {};
var notificationConsent = true;
var canvasConsent = true;
var futureDays = 1;
// this.use()

window.onload = function() {
	// Handle upgrade from older version.
	var manifestData = chrome.runtime.getManifest();
	// console.log(manifestData.version);
	document.getElementById("version").innerHTML = "Version: " + manifestData.version;

	// notification();

	handleUpgrade();

	// Retrieve data
	refreshData();

	document.getElementById("due-input").valueAsDate = new Date(Date.now());

	var modal = document.getElementById("myModal");
	var btn = document.getElementById("Settings");
	var span = document.getElementsByClassName("close")[0];
	btn.onclick = function() {
		modal.style.display = "block";
	}
	span.onclick = function() {
		modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}

	$("#notifications").change(function() {
		if(this.checked) {
			notificationConsent = true;
			chrome.storage.sync.set({"notifications" : notificationConsent});
		} else {
			notificationConsent = false;
			chrome.storage.sync.set({"notifications" : notificationConsent});
		}

		chrome.storage.sync.get("notifications", function(data) {
			console.log("Notifications Consent: " + data.notifications.toString());
		});

		saveData();
	});

	$("#canvasScraping").change(function() {
		if(this.checked) {
			canvasConsent = true;
			chrome.storage.sync.set({"canvas" : canvasConsent});
		} else {
			canvasConsent = false;
			chrome.storage.sync.set({"canvas" : canvasConsent});
		}

		chrome.storage.sync.get("canvas", function(data) {
			console.log("Canvas Assignments Consent: " + data.canvas.toString());
		});

		saveData();
	});

	document.getElementById("future").addEventListener('input', function() {
		futureDays = document.getElementById("future").value;
		chrome.storage.sync.set({"future" : futureDays});

		chrome.storage.sync.get("future", function(data) {
			console.log("Future Days: " + data.future.toString());
		});
	});

	// The task is being deleted.
	$("#deleteTask").droppable({
		hoverClass: "trash-hover",
		drop: function ( event, ui ) {
			var removableId = ui.draggable.context.id;
			delete todoArr[removableId];
			delete inProgressArr[removableId];
			delete completedArr[removableId];
			ui.draggable.remove();
		}
	});


	// The task is being moved from one column to another.
	$('.dropzone').sortable({
		connectWith: '.dropzone',
   		start: function(){
   			// console.log("Drag started");
   		},
		stop: function(e,ui){

			// console.log(ui);

			if(ui.item.context.parentElement == null) {
				// console.log("hello");
				var removableId = ui.item.context.id;
				delete todoArr[removableId];
				delete inProgressArr[removableId];
				delete completedArr[removableId];
				ui.item.remove();
				saveData(e);
				return;
			}

			const droppedId = ui.item.context.parentElement.id;
			const id = ui.item.context.id;

			var item = todoArr[id];
			delete todoArr[id];
			if (item == null) {
				item = inProgressArr[id];
				delete inProgressArr[id];
			}

			if (item == null) {
				item = completedArr[id];
				delete completedArr[id];
			}

			// console.log(item);
			const now = new Date(Date.now);
			item.lastUpdated = $.datepicker.formatDate('mm/dd/yy', now);

			if(droppedId == "todo") {
				todoArr[id] = item;
			} else if(droppedId == "in_progress"){
				inProgressArr[id] = item;
			} else if(droppedId == "completed"){
				completedArr[id] = item;
			}

			saveData(e);
    	}
	});

	// $('.dropzone div').draggable({
 //   		drag: function(){
 //   			console.log("Drag started");
 //   		},
 //   		stop: function(){
 //   			console.log("Drag stopped");
 //   		}
	// });

	$('#dataid').droppable()
		.dblclick(function() {
			alert("double click");
		});

	// Task remove listener
	
	// Add new task listners
	document.getElementById("add-task").addEventListener("click", function() {
		addNewTask();
	});

	// document.getElementById("clear").addEventListener("click", function() {
	// 	clearData();
	// });

	// document.getElementById("checkStorage").addEventListener("click", function(){
	// 	checkStorage();
	// });

	document.getElementById("task-input").addEventListener("keydown", function(event) {
		if (event.key === "Enter") {
        	event.preventDefault();
        	// Do more work

        	addNewTask();
    	}
	});

	document.getElementById("due-input").addEventListener("keydown", function(event) {
		if (event.key === "Enter") {
        	event.preventDefault();
        	// Do more work

        	addNewTask();
    	}
	});
}

function toggleCheckbox(element) {
	console.log("checkbox");
}

function handleUpgrade() {
	var dfd = new jQuery.Deferred();

	chrome.storage.sync.get("version", function(data) {
		// console.log(data.version);
		const version = data.version;
		if (version == null || version == 'undefined' || version == NaN || version != "1.4") {
			// update handling is needed
			console.log("Upgrading from older version");
		} else {
			// no upgrade handling is needed.
			// console.log("Version is 1.4");
			dfd.notify();
		}
	});
}

function getCanvasData() {
	chrome.storage.sync.get("canvas", function(data) {
		canvasConsent = data.canvas;
		if(canvasConsent){
			chrome.storage.sync.get("future", function(data) {
				futureDays = data.future;
				
		
				var now = new Date(Date.now());
				var tomorrow = new Date(Date.now());
		
		
				tomorrow.setDate(tomorrow.getDate() + parseInt(futureDays));
		
				var today = $.datepicker.formatDate('yy/mm/dd', now);
				var tomorrow = $.datepicker.formatDate('yy/mm/dd', tomorrow);
				today = today.split("/")[0] + "-" + today.split("/")[1] + "-" + today.split("/")[2]
				console.log(today);
				tomorrow = tomorrow.split("/")[0] + "-" + tomorrow.split("/")[1] + "-" + tomorrow.split("/")[2]
				console.log(tomorrow);
				
				let requestCourses = new XMLHttpRequest();
				requestCourses.open("GET", "https://lgsuhsd.instructure.com/api/v1/courses?enrollment_state=active");
				requestCourses.send();
				requestCourses.onload = () => {
					var n;
					for(n = 0; n < JSON.parse(requestCourses.response).length; n++){
						courseID = JSON.parse(requestCourses.response)[n].id;
						let request = new XMLHttpRequest();
						request.open("GET", "https://lgsuhsd.instructure.com/api/v1/calendar_events?end_date=" + tomorrow + "&type=assignment&context_codes[]=course_" + courseID.toString());
						// https://lgsuhsd.instructure.com/api/v1/calendar_events?type=assignment&context_codes[]=course_23188
						// https://reqres.in/api/users
						request.send();
						request.onload = () => {
							data = JSON.parse(request.response);
							console.log(data);
							var i;
							
							for (i = 0; i < data.length; i++) {
								taskName = data[i].title;
								all_day_date = data[i].all_day_date;
								courseName = data[i].context_name;
								
		
								contains = false;
								var taskNum;
		
								for(var currDiv = 0; currDiv < document.getElementById("todo").children.length; currDiv += 1){
									const id = document.getElementById("todo").children[currDiv];
									if(id.innerHTML.toString().toUpperCase().includes(taskName.replaceAll("&", "&AMP;").toUpperCase())){
										contains = true;
									}
								}
								// console.log(arr1);
							
								for(var currDiv = 0; currDiv < document.getElementById("in_progress").children.length; currDiv += 1){
									const id = document.getElementById("in_progress").children[currDiv];
									if(id.innerHTML.toString().replaceAll("&", "&AMP;").toUpperCase().toUpperCase().includes(taskName.replaceAll("&", "&AMP;").toUpperCase())){
										contains = true;
									}
								}
							
								for(var currDiv = 0; currDiv < document.getElementById("completed").children.length; currDiv += 1) {
									const id = document.getElementById("completed").children[currDiv];
									if(id.innerHTML.toString().replaceAll("&", "&AMP;").toUpperCase().toUpperCase().includes(taskName.replaceAll("&", "&AMP;").toUpperCase())){
										contains = true;
									}
								}
		
								if(contains == false){
									console.log(taskName + " " + all_day_date);
									includeCourseName = false;
									if(includeCourseName == true){
										addNewTaskFromCanvas(courseName + ": " + taskName, all_day_date);
									} else {
										addNewTaskFromCanvas(taskName, all_day_date);
									}
								}
							}
						}
					}
				}
			});	
		}
	});
	
}

function refreshData() {

	chrome.storage.sync.get("notifications", function(data) {
		console.log(data.notifications);
		notificationConsent = data.notifications;
		if (notificationConsent == null || notificationConsent == 'undefined' || notificationConsent == NaN) {
			notificationConsent = true;
			chrome.storage.sync.set({"notifications" : notificationConsent});
		}

		if(notificationConsent == true){
			document.getElementById("notifications").checked = true;
		} else {
			document.getElementById("notifications").checked = false;
		}
	});

	chrome.storage.sync.get("canvas", function(data) {
		// console.log(data.canvas);
		canvasConsent = data.canvas;
		if (canvasConsent == null || canvasConsent == 'undefined' || canvasConsent == NaN) {
			canvasConsent = true;
			chrome.storage.sync.set({"canvas" : canvasConsent});
		}

		if(canvasConsent == true){
			document.getElementById("canvasScraping").checked = true;
		} else {
			document.getElementById("canvasScraping").checked = false;
		}
		console.log(canvasConsent);
	});

	chrome.storage.sync.get("future", function(data) {
		// console.log(data.future);
		futureDays = data.future;
		if (futureDays == null || futureDays == 'undefined' || futureDays == NaN) {
			futureDays = 1;
			chrome.storage.sync.set({"future" : futureDays});
		}

		document.getElementById("future").value = futureDays;
		// console.log(futureDays);
	});

	chrome.storage.sync.get("id", function(data) {
		myId = data.id;
		if (myId == null || myId == 'undefined' || myId == NaN) {
			myId = 1;
		}
	});

	chrome.storage.sync.get("uuid", function(data) {
		uuid = data.uuid;
		if (uuid == null || uuid == 'undefined' || uuid == NaN) {
			uuid = createUUID();
			console.log("UUID is " + data.uuid + " setting it to " + uuid);
		}
		// console.log("UUID is: " + uuid);
	});

	chrome.storage.sync.get("todo", function(data) {
		var i;
		for(i = 0; i < data.todo.length; i+=1) {
			if (data.todo[i] == null) {
				continue;
			}
			if (!('id' in data.todo[i])) {
				data.todo[i].id = myId++;
			}
			if (!('lastUpdated' in data.todo[i])) {
				const now = new Date(Date.now);
				data.todo[i].lastUpdated = $.datepicker.formatDate('mm/dd/yy', now);
			}

			todoArr[data.todo[i].id] = data.todo[i];
			createBlock("todo", data.todo[i]);
		}
	});
	chrome.storage.sync.get("in_progress", function(data) {
		var i;
		for(i = 0; i < data.in_progress.length; i+=1){
			if (data.in_progress[i] == null) {
				continue;
			}
			if (!('id' in data.in_progress[i])) {
				data.in_progress[i].id = myId++;
			}
			if (!('lastUpdated' in data.in_progress[i])) {
				const now = new Date(Date.now);
				data.in_progress[i].lastUpdated = $.datepicker.formatDate('mm/dd/yy', now);
			}

			inProgressArr[data.in_progress[i].id] = data.in_progress[i];
			createBlock("in_progress", data.in_progress[i]);
		}
	});
	chrome.storage.sync.get("completed", function(data) {
		var i;
		for(i = 0; i < data.completed.length; i+=1){
			if (data.completed[i] == null) {
				continue;
			}

			if (!('id' in data.completed[i])) {
				data.completed[i].id = myId++;
			}
			if (!('lastUpdated' in data.completed[i])) {
				const now = new Date(Date.now);
				data.completed[i].lastUpdated = $.datepicker.formatDate('mm/dd/yy', now);
			} else {
				var lastUpdated = new Date(data.completed[i].lastUpdated);
				var now = new Date(Date.now());
				const diff = (now-lastUpdated)/1000/60/60;
				console.log('Id: ' + data.completed[i].id + ' last updated: ' + diff + ' hours back');				
			}
			
			completedArr[data.completed[i].id] = data.completed[i];
			createBlock("completed", data.completed[i]);
		}
	});

	console.log(todoArr);
	console.log(inProgressArr);
	console.log(completedArr);

	getCanvasData();
	
}

function addNewTaskFromCanvas(taskName, dueDate){
	var now = new Date(Date.now());
	const created = $.datepicker.formatDate('mm/dd/yy', now);
	const due = dueDate;
	// console.log(due);

	var val = {
		"id": myId.toString(10),
		"data": taskName,
		"created": created,
		"due": due.split("-")[1] + "/" + due.split("-")[2] + "/" + due.split("-")[0],
		"lastUpdate": created
	}

	todoArr[val.id] = val;
	createBlock("todo", val, true);
	myId += 1;
	saveData();
}

function addNewTask() {

	// console.log(myId);

	if(document.getElementById("task-input").value.toString().length > 0) {
		const data = document.getElementById("task-input").value;
		const due = document.getElementById("due-input").value;
		console.log(due);
		document.getElementById("task-input").value = "";

		var now = new Date(Date.now());
		const created = $.datepicker.formatDate('mm/dd/yy', now);

		var val = {
			"id": myId.toString(10),
			"data": data,
			"created": created,
			"due": due.split("-")[1] + "/" + due.split("-")[2] + "/" + due.split("-")[0],
			"lastUpdate": created
		}

		todoArr[val.id] = val;
		createBlock("todo", val, true);
		myId += 1;
		saveData();
	}

}

function createBlock(location, val) {
	createBlock(location, val, false);
}

function createBlock(location, val, top) {
	const taskDiv = document.createElement('div');
	taskDiv.className = "task";

	const locDiv = document.getElementById(location);
	if (top) {
		locDiv.insertBefore(taskDiv, locDiv.firstChild.nextSibling);
	} else {
		locDiv.appendChild(taskDiv);
	}

	const dataDiv = document.createElement('div');
	dataDiv.className = "data";
	dataDiv.id = "dataid";


	dataDiv.innerHTML = val.data;
	taskDiv.id = (val.id);

	taskDiv.appendChild(dataDiv);


	const dueDiv = document.createElement('div');
	dueDiv.className = "due";
	taskDiv.appendChild(dueDiv);	
	dueDiv.innerHTML = "Due: " + val.due;

	// Calculate the color of the block.
	var date1 = new Date(val.created);
	var date2 = new Date(val.due);

	// console.log((date2-date1)/(1000));

	var animation = "myanimation " + ((date2-date1)/(1000) + 86400).toString() + "s 1";
	var delay = ((new Date(Date.now()) - date1)/-1000).toString() + "s";

	taskDiv.style.animation = animation;
	taskDiv.style.animationDelay = delay;
}

function saveData(event) {
	chrome.storage.sync.get("notifications", function(data) {
		notificationConsent = data.notifications;
		var arr1 = [];
		for(var currDiv = 0; currDiv < document.getElementById("todo").children.length; currDiv += 1){
			const id = document.getElementById("todo").children[currDiv].id;
			arr1.push(todoArr[id]);
		}
		// console.log(arr1);

		var arr2 = [];
		for(var currDiv = 0; currDiv < document.getElementById("in_progress").children.length; currDiv += 1){
			const id = document.getElementById("in_progress").children[currDiv].id;
			arr2.push(inProgressArr[id]);
		}

		var arr3 = [];
		for(var currDiv = 0; currDiv < document.getElementById("completed").children.length; currDiv += 1) {
			const id = document.getElementById("completed").children[currDiv].id;
			arr3.push(completedArr[id]);
		}

		chrome.storage.sync.set({"todo" : arr1});
		chrome.storage.sync.set({"in_progress" : arr2});
		chrome.storage.sync.set({"completed" : arr3});
		chrome.storage.sync.set({"id" : myId});
		chrome.storage.sync.set({"version" : "1.4"});
		chrome.storage.sync.set({"uuid" : uuid});

		var dataPackage = [];
		if(notificationConsent){
			dataPackage.push(arr1);
			dataPackage.push(arr2);
			dataPackage.push(arr3);
		}
		chrome.runtime.sendMessage(dataPackage);
	});
	// console.log(arr1);
	// console.log(arr2);
	// console.log(arr3);
	// console.log("saveData: UUID: " + uuid.toString());
}

function checkStorage() {
	chrome.storage.sync.get("todo", function(data) {
		console.log(data);
	});
	chrome.storage.sync.get("in_progress", function(data) {
		console.log(data);
	});
	chrome.storage.sync.get("completed", function(data) {
		console.log(data);
	});
	chrome.storage.sync.get("id", function(data) {
		console.log(data);
	});

	chrome.storage.sync.get("version", function(data) {
		console.log(data);
	});
}

function clearData(){
	// console.log("Clearning data in storage");
	todoArr = {};
	inProgressArr = {};
	completedArr = {};
	const emptyArr = [];
	chrome.storage.sync.set({'todo' : emptyArr});
	chrome.storage.sync.set({'in_progress' : emptyArr});
	chrome.storage.sync.set({'completed' : emptyArr});
}

function createUUID(){
    var dt = new Date().getTime();
    var myuuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return myuuid;
}

// function notification(){
// 	chrome.notifications.getAll((items) => {
// 		if ( items ) {
// 			for (let key in items) {
// 				chrome.notifications.clear(key);
// 			}
// 		}
// 	});
// 	setTimeout(
// 		chrome.notifications.create(
// 			{
// 				title: "Title",
// 				message: "Synchro's message",
// 				iconUrl: "images/synchro-logo.png",
// 				type: "basic",
// 			}
// 		),
// 		10000
// 	)
	
// }