var myId = 0;
var todoArr = [];
var inProgressArr = [];
var completedArr = [];
window.onload = function() {
	// Handle upgrade from older version.
	handleUpgrade();

	// Retrieve data
	refreshData();

	document.getElementById("due-input").valueAsDate = new Date(Date.now());

	// Register various listeners.

	$("#deleteTask").droppable({
		hoverClass: "trash-hover",
		drop: function ( event, ui ) {
			var removableId = ui.draggable.context.id;
			var i;
			for(i = 0; i < todoArr.length; i+=1){
				if(todoArr[i].id == removableId){
					todoArr.splice(i, 1);
					break;
				}
			}
			for(i = 0; i < inProgressArr.length; i+=1){
				if(inProgressArr[i].id == removableId){
					inProgressArr.splice(i, 1);
					break;
				}
			}for(i = 0; i < completedArr.length; i+=1){
				if(completedArr[i].id == removableId){
					completedArr.splice(i, 1);
					break;
				}
			}
			ui.draggable.remove();
		}
	});


	// List change listener.
	$('.dropzone').sortable({
		connectWith: '.dropzone',
   		start: function(){
   			// console.log("Drag started");
   		},
		stop: function(e,ui){

			console.log(ui);

			if(ui.item.context.parentElement == null){
				console.log("hello");
				var removableId = ui.item.context.id;
				var i;
				for(i = 0; i < todoArr.length; i+=1){
					if(todoArr[i].id == removableId){
						todoArr.splice(i, 1);
						break;
					}
				}
				for(i = 0; i < inProgressArr.length; i+=1){
					if(inProgressArr[i].id == removableId){
						inProgressArr.splice(i, 1);
						break;
					}
				}for(i = 0; i < completedArr.length; i+=1){
					if(completedArr[i].id == removableId){
						completedArr.splice(i, 1);
						break;
					}
				}
				ui.item.remove();
				saveData(e);
				return;
			}

			droppedId = ui.item.context.parentElement.id;
			removableId = ui.item.context.id;

			var item;
			for(i = 0; i < todoArr.length; i+=1){
				if(todoArr[i].id == removableId){
					item = todoArr[i];
					todoArr.splice(i, 1);
					break;
				}
			}
			for(i = 0; i < inProgressArr.length; i+=1){
				if(inProgressArr[i].id == removableId){
					item = inProgressArr[i];
					inProgressArr.splice(i, 1);
					break;
				}
			}
			for(i = 0; i < completedArr.length; i+=1){
				if(completedArr[i].id == removableId){
					item = completedArr[i];
					completedArr.splice(i, 1);
					break;
				}
			}

			if(droppedId == "todo"){
				todoArr.push(item);
			}
			if(droppedId == "in_progress"){
				inProgressArr.push(item);
			}
			if(droppedId == "completed"){
				completedArr.push(item);
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
	// This is only to maintain upgrades from v1.3
	chrome.storage.sync.get("version", function(data) {
		console.log(data.version);
		const version = data.version;
		if (version == null || version == 'undefined' || version == NaN || version != "1.4") {
			// update handling is needed
			console.log("Version is undefined or is older version");
		} else {
			// no upgrade handling is needed.
			console.log("Version is 1.4");
		}
	});
	// end support for upgrade from v1.3
}

function refreshData() {

	chrome.storage.sync.get("id", function(data) {
		myId = data.id;
		if (myId == null || myId == 'undefined' || myId == NaN) {
			console.log("My id is " + myId + " resetting it to 0");
			myId = 0;
		}
		console.log(myId);
	});

	chrome.storage.sync.get("todo", function(data) {
		var i;
		for(i = 0; i < data.todo.length; i+=1){
			todoArr.push(data.todo[i]);
			createBlock("todo", data.todo[i]);
		}
	});
	chrome.storage.sync.get("in_progress", function(data) {
		var i;
		for(i = 0; i < data.in_progress.length; i+=1){
			inProgressArr.push(data.in_progress[i])
			createBlock("in_progress", data.in_progress[i]);
		}
	});
	chrome.storage.sync.get("completed", function(data) {
		var i;
		for(i = 0; i < data.completed.length; i+=1){
			completedArr.push(data.completed[i]);
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
			"id": data + "-" + (myId+1).toString(10),
			"data": data,
			"created": created,
			"due": due.split("-")[1] + "/" + due.split("-")[2] + "/" + due.split("-")[0]
		}

		// var date1 = new Date(val.created);
		// var date2 = new Date(val.due);
		// console.log(date1);
		// console.log(date2);
		// console.log((date2-date1)/(1000));


		todoArr.push(val);
		createBlock("todo", val);
		myId +=1;
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
	// var arr1 = [];
	// for(var currDiv = 0; currDiv < document.getElementById("todo").children.length; currDiv += 1){
	// 	arr1.push(toJSON(document.getElementById("todo").children[currDiv]));
	// }
	// console.log(arr1);

	// var arr2 = [];
	// for(var currDiv = 0; currDiv < document.getElementById("in_progress").children.length; currDiv += 1){
	// 	arr2.push(toJSON(document.getElementById("in_progress").children[currDiv]));
	// }

	// var arr3 = [];
	// for(var currDiv = 0; currDiv < document.getElementById("completed").children.length; currDiv += 1){
	// 	arr3.push(toJSON(document.getElementById("completed").children[currDiv]));
	// }

	chrome.storage.sync.set({"todo" : todoArr});
	chrome.storage.sync.set({"in_progress" : inProgressArr});
	chrome.storage.sync.set({"completed" : completedArr});
	chrome.storage.sync.set({"id" : myId});
	// chrome.storage.sync.remove({"version") : "1.4"});

	console.log(todoArr);
	console.log(inProgressArr);
	console.log(completedArr);
	console.log("saveData: " + myId.toString());
}

// function toJSON(taskDiv) {
// 	const data = taskDiv.childNodes[0].innerHTML;
// 	const created = taskDiv.childNodes[1].innerHTML;
// 	const invisible = taskDiv.childNodes[2].innerHTML;

// 	var val = {
// 		"data": data,
// 		"created": created,
// 		"invisible": invisible
// 	}

// 	// console.log(val);
// 	return val;
// }

function checkStorage() {
	chrome.storage.sync.get("todo", function(data) {
		// console.log(data);
	});
	chrome.storage.sync.get("in_progress", function(data) {
		// console.log(data);
	});
	chrome.storage.sync.get("completed", function(data) {
		// console.log(data);
	});
	chrome.storage.sync.get("id", function(data) {
		// console.log(data);
	});

	chrome.storage.sync.get("version", function(data) {
		// console.log(data);
	});
}

function clearData(){
	// console.log("Clearning data in storage");
	todoArr = [];
	inProgressArr = [];
	completedArr = [];
	chrome.storage.sync.set({'todo' : todoArr});
	chrome.storage.sync.set({'in_progress' : inProgressArr});
	chrome.storage.sync.set({'completed' : completedArr});
}