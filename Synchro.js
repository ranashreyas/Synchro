var myId = 0;
window.onload = function() {
	// Handle upgrade from older version.
	handleUpgrade();

	// Retrieve data
	refreshData();

	document.getElementById("due-input").valueAsDate = new Date(Date.now());

	// Register various listeners.

	// List change listener.
	$('.dropzone').sortable({
		connectWith: '.dropzone',
   		start: function(){
   			console.log("Drag started");
   		},
		stop: function(e,ui){
   			console.log("Drag stopped");
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
	$("#deleteTask").droppable({
		hoverClass: "trash-hover",
		drop: function ( event, ui ) {			
			ui.draggable.remove();
		}
	});
	
	// Add new task listners
	document.getElementById("add-task").addEventListener("click", function() {
		addNewTask();
	});

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

	// document.getElementById("checkStorage").addEventListener("click", function(){
	// 	checkStorage();
	// });
	
	// document.getElementById("clearData").addEventListener("click", function() {
	// 	clearData();
	// });
}

function handleUpgrade() {
	// This is only to maintain upgrades from v1.0
	chrome.storage.sync.get("Completed", function(data) {
		if (data.Completed.length == 0) {
			return;
		}

		console.log("Upgrading from version 1.0 with data " + data.Completed);

		var arr = data.Completed;
		console.log("Data in arr " + arr);

		chrome.storage.sync.get("completed", function(data1) {
			console.log("Starting arr " + arr);

			var i;
			for(i = 0; i < data1.completed.length; i+=1) {
				arr.push(data1.completed[i]);
			}

			console.log("New arr " + arr);

			if (arr.length > 0) {
				chrome.storage.sync.remove('Completed');
				chrome.storage.sync.set({'completed' : arr});
				
				console.log("Upgrade from version 1.0 complete");

				val = true;
			}
		});
	});
	// end support for upgrade from v1.0
}

function refreshData() {
	chrome.storage.sync.get("todo", function(data) {
		var i;
		for(i = 0; i < data.todo.length; i+=1){
			createBlock("todo", data.todo[i]);
		}
	});
	chrome.storage.sync.get("in_progress", function(data) {
		var i;
		for(i = 0; i < data.in_progress.length; i+=1){
			createBlock("in_progress", data.in_progress[i]);
		}
	});
	chrome.storage.sync.get("completed", function(data) {
		var i;
		for(i = 0; i < data.completed.length; i+=1){
			createBlock("completed", data.completed[i]);
		}
	});

	chrome.storage.sync.get("id", function(data) {
		myId = data.id;
		if (myId == null || myId == 'undefined' || myId == NaN) {
			console.log("My id is " + myId + " resetting it to 0");
			myId = 0;
		}
	});	
}

function addNewTask() {
	if(document.getElementById("task-input").value.toString().length > 0) {
		const data = document.getElementById("task-input").value;
		const due = document.getElementById("due-input").value;
		document.getElementById("task-input").value = "";
		// document.getElementById("due-input").value = "";

		var now = new Date(Date.now());
		const created = $.datepicker.formatDate('mm/dd/yy', now);


		var val = new Object();
		val.data = data;
		val.created = created + " -- " + due.split("-")[1] + "/" + due.split("-")[2] + "/" + due.split("-")[0];


		var date1 = new Date(val.created.split(" ")[0]);
		var date2 = new Date(val.created.split(" ")[2]);
		console.log(date1);
		console.log(date2);
		console.log((date2-date1)/(1000));

		createBlock("todo", val);
		saveData();
	}

}

function createBlock(location, val) {
	myId += 1;

	const taskDiv = document.createElement('div');
	taskDiv.className = "task";

	document.getElementById(location).appendChild(taskDiv);

	const dataDiv = document.createElement('div');
	dataDiv.className = "data";
	dataDiv.id = "dataid";


	var data = val.data;
	// if (data == null || data == 'undefined') {
	// 	data = val.toString();
	// }
	dataDiv.innerHTML = data;
	taskDiv.id = (data + "-" + myId.toString(10));
	taskDiv.appendChild(dataDiv);





	const createdDiv = document.createElement('div');
	var dates = val.created;
	
	createdDiv.innerHTML = dates;
	createdDiv.className = "created";
	taskDiv.appendChild(createdDiv);

	console.log(dates.split(" "));
	if(dates.split(" ").length != 3){
		return;
	}

	var date1 = new Date(dates.split(" ")[0]);
	var date2 = new Date(dates.split(" ")[2]);
	console.log(date1);
	console.log(date2);
	console.log((date2-date1)/(1000));

	var animation = "myanimation " + ((date2-date1)/(1000) + 86400).toString() + "s 1";
	var delay = ((new Date(Date.now()) - date1)/-1000).toString() + "s";

	console.log(animation);
	console.log(delay);

	taskDiv.style.animation = animation;
	taskDiv.style.animationDelay = delay;
	

	


}

function saveData(event) {
	var arr1 = [];
	for(var currDiv = 0; currDiv < document.getElementById("todo").children.length; currDiv += 1){
		arr1.push(toJSON(document.getElementById("todo").children[currDiv]));
	}
	console.log(arr1);

	var arr2 = [];
	for(var currDiv = 0; currDiv < document.getElementById("in_progress").children.length; currDiv += 1){
		arr2.push(toJSON(document.getElementById("in_progress").children[currDiv]));
	}

	var arr3 = [];
	for(var currDiv = 0; currDiv < document.getElementById("completed").children.length; currDiv += 1){
		arr3.push(toJSON(document.getElementById("completed").children[currDiv]));
	}

	chrome.storage.sync.set({"todo" : arr1});
	chrome.storage.sync.set({"in_progress" : arr2});
	chrome.storage.sync.set({"completed" : arr3});
	chrome.storage.sync.set({"id" : myId});
}

function toJSON(taskDiv) {
	const data = taskDiv.childNodes[0].innerHTML;
	const created = taskDiv.childNodes[1].innerHTML;

	var val = {
		"data": data,
		"created": created
	}

	// console.log(val);
	return val;
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
}

function clearData(){
	console.log("Clearning data in storage");
	var arr = [];
	chrome.storage.sync.set({'todo' : arr});
	chrome.storage.sync.set({'in_progress' : arr});
	chrome.storage.sync.set({'completed' : arr});
}