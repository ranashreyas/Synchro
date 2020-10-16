var myId = 0;
var todoArr = {};
var inProgressArr = {};
var completedArr = {};

window.onload = function() {
	// Handle upgrade from older version.
	handleUpgrade();

	// Retrieve data
	refreshData();

	document.getElementById("due-input").valueAsDate = new Date(Date.now());

	// Register various listeners.

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
			console.log(ui);

			if(ui.item.context.parentElement == null) {
				console.log("hello");
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

	document.getElementById("clear").addEventListener("click", function() {
		clearData();
	});

	document.getElementById("checkStorage").addEventListener("click", function(){
		checkStorage();
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
}

function handleUpgrade() {
	var dfd = new jQuery.Deferred();

	chrome.storage.sync.get("version", function(data) {
		console.log(data.version);
		const version = data.version;
		if (version == null || version == 'undefined' || version == NaN || version != "1.4") {
			// update handling is needed
			console.log("Upgrading from older version");
		} else {
			// no upgrade handling is needed.
			console.log("Version is 1.4");
			dfd.notify();
		}
	});
}

function refreshData() {

	chrome.storage.sync.get("id", function(data) {
		myId = data.id;
		if (myId == null || myId == 'undefined' || myId == NaN) {
			console.log("My id is " + myId + " resetting it to 0");
			myId = 1;
		}
		console.log(myId);
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

			completedArr[data.completed[i].id] = data.completed[i];
			createBlock("completed", data.completed[i]);
		}
	});
}

function addNewTask() {

	console.log(myId);

	if(document.getElementById("task-input").value.toString().length > 0) {
		const data = document.getElementById("task-input").value;
		const due = document.getElementById("due-input").value;
		document.getElementById("task-input").value = "";

		var now = new Date(Date.now());
		const created = $.datepicker.formatDate('mm/dd/yy', now);
		const dueNew = due.split("-")[1] + "/" + due.split("-")[2] + "/" + due.split("-")[0];

		var val = {
			"id": myId.toString(10),
			"data": data,
			"created": created,
			"due": due.split("-")[1] + "/" + due.split("-")[2] + "/" + due.split("-")[0]
		}

		// var date1 = new Date(val.created);
		// var date2 = new Date(val.due);
		// console.log(date1);
		// console.log(date2);
		// console.log((date2-date1)/(1000));


		todoArr[val.id] = val;
		createBlock("todo", val);
		myId += 1;
		saveData();
	}

}

function createBlock(location, val) {

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
	taskDiv.id = (val.id);
	taskDiv.appendChild(dataDiv);

	



	const createdDiv = document.createElement('div');
	var end = val.due;
	
	createdDiv.innerHTML = end;
	createdDiv.className = "created";

	taskDiv.appendChild(createdDiv);

	var date1 = new Date(val.created);
	var date2 = new Date(val.due);
	// console.log(date1);
	// console.log(date2);
	// console.log((date2-date1)/(1000));

	var animation = "myanimation " + ((date2-date1)/(1000) + 86400).toString() + "s 1";
	var delay = ((new Date(Date.now()) - date1)/-1000).toString() + "s";

	// console.log(animation);
	// console.log(delay);

	taskDiv.style.animation = animation;
	taskDiv.style.animationDelay = delay;
}

function saveData(event) {
	var arr1 = [];
	for(var currDiv = 0; currDiv < document.getElementById("todo").children.length; currDiv += 1){
		const id = document.getElementById("todo").children[currDiv].id;
		arr1.push(todoArr[id]);
	}
	console.log(arr1);

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

	console.log(arr1);
	console.log(arr2);
	console.log(arr3);
	console.log("saveData: " + myId.toString());
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