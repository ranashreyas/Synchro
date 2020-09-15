var myId = 0;
window.onload = function() {
	// Retrieve data
	refreshData();

	// Register various listeners.

	// List change listener.
	$('.dropzone').sortable({
		connectWith: '.dropzone',
		stop: function(e,ui){
			saveData(e);
    	}
	});

	// $('.task').droppable()
	// 	.click(function() {
	// 	}).dblclick(function() {
	// 		alert("double click");
	// 	});

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

	document.getElementById("checkStorage").addEventListener("click", function(){
		checkStorage();
	});
	
	document.getElementById("clearData").addEventListener("click", function() {
		clearData();
	});
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
	if(document.getElementById("task-input").value.toString().length > 0){
		var val = document.getElementById("task-input").value;
		document.getElementById("task-input").value = "";

		createBlock("todo", val);
		saveData();
	}

}

function createBlock(location, val) {
	myId += 1;

	const myDiv = document.createElement('div');
	myDiv.className = "task";
	myDiv.innerHTML = val.toString();
	myDiv.id = (val.toString() + "-" + myId.toString(10));
	
	document.getElementById(location).appendChild(myDiv);
}

function saveData(event) {
	var arr1 = [];
	for(var currDiv = 0; currDiv < document.getElementById("todo").children.length; currDiv += 1){
		arr1.push(document.getElementById("todo").children[currDiv].innerHTML);
	}

	var arr2 = [];
	for(var currDiv = 0; currDiv < document.getElementById("in_progress").children.length; currDiv += 1){
		arr2.push(document.getElementById("in_progress").children[currDiv].innerHTML);
	}

	var arr3 = [];
	for(var currDiv = 0; currDiv < document.getElementById("completed").children.length; currDiv += 1){
		arr3.push(document.getElementById("completed").children[currDiv].innerHTML);
	}

	chrome.storage.sync.set({"todo" : arr1});
	chrome.storage.sync.set({"in_progress" : arr2});
	chrome.storage.sync.set({"completed" : arr3});
	chrome.storage.sync.set({"id" : myId});
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