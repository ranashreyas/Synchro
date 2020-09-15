var myId = 0;
window.onload=function() {
	var states = ["todo", "in_progress", "completed"];

	var state;
	for (state of states) {
		document.getElementById(state).addEventListener("dragover", function(event){
			event.preventDefault();
		});

		document.getElementById(state).addEventListener("drop", function(event){
			event.preventDefault();
			const id = event
				.dataTransfer
				.getData("text");

			const taskElement = document.getElementById(id);
			document.getElementById(event.target.id).appendChild(taskElement);

			event
			  	.dataTransfer
			  	.clearData();

			saveData();

			document.getElementById("trash-icon").style.width = "30px";
			document.getElementById("trash-icon").style.height = "30px";
		});
	}

	document.getElementById("deleteTask").addEventListener("dragover", function(event){
		event.preventDefault();
	});

	document.getElementById("deleteTask").addEventListener("dragenter", function(event){
		document.getElementById("trash-icon").style.width = "35px";
		document.getElementById("trash-icon").style.height = "35px";
	});
	// document.getElementById("deleteTask").addEventListener("dragleave", function(event){
	// 	document.getElementById("trash-icon").style.width = "30px";
	// 	document.getElementById("trash-icon").style.height = "30px";
	// });
	document.getElementById("deleteTask").addEventListener("drop", function(event){
		event.preventDefault();
		const id = event
			// .originalEvent
			.dataTransfer
			.getData("text");
		const taskElement = document.getElementById(id);
		const dropzone = event.target;
		dropzone.appendChild(taskElement);
		document.getElementById(id).remove();
		event
			.dataTransfer
			.clearData();
		saveData();
		document.getElementById("trash-icon").style.width = "30px";
		document.getElementById("trash-icon").style.height = "30px";
	});
	
	document.getElementById("add-task").addEventListener("click", function(){
		myId += 1;

		// setAllIdData();

		if(document.getElementById("task").value.toString().length > 0){
			var val = document.getElementById("task").value;
			document.getElementById("task").value = "";

			createBlock("todo", val);

			setAllIdData();
		}
	});

	document.onkeypress = function(evt) {
		evt = evt || window.event;
		var charCode = evt.keyCode || evt.which;
		// var charStr = String.fromCharCode(charCode);

		myId += 1;
		if(charCode == 13 && document.getElementById("task").value.toString().length > 0){
			var val = document.getElementById("task").value;
			document.getElementById("task").value = "";

			createBlock("todo", val);

			setAllIdData();
		}
	};

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
		setAllIdData();
	});
	chrome.storage.sync.get("id", function(data) {
		myId = data.id;
	});

	// document.getElementById("checkStorage").addEventListener("click", function(){
	// 	chrome.storage.sync.get("todo", function(data) {
	// 		console.log(data);
	// 	});
	// 	chrome.storage.sync.get("in_progress", function(data) {
	// 		console.log(data);
	// 	});
	// 	chrome.storage.sync.get("completed", function(data) {
	// 		console.log(data);
	// 	});
	// 	chrome.storage.sync.get("id", function(data) {
	// 		console.log(data);
	// 	});
		
	// });
	
}

function createBlock(location, val){
	const div = document.createElement('div');
	const newContent = document.createTextNode(val.toString());
	div.appendChild(newContent);

	div.id = (val.toString() + "-" + myId.toString(10));

	div.setAttribute("class", "task");
	div.setAttribute("draggable", true);

	div.addEventListener("dblclick", function(event) {
		div.setAttribute("contenteditable", true);
	});

	div.addEventListener("clickout", function(event) {
		div.setAttribute("contenteditable", false);
	});
	// div.setAttribute("contenteditable", true);
	
	document.getElementById(location).appendChild(div);

	saveData();
}


function setAllIdData(){
	console.log("setting all the data!!!")
	var items = document.getElementsByClassName("task");
	var i;
	for (i = 0; i < items.length; i+=1){
		items[i].addEventListener("dragstart", function(event){
			event
				.dataTransfer
				.setData('text/plain', event.target.id);
		});
	}
	// saveData();
}

function saveData(){

	var todoArray = [];
	for(var currDiv = 0; currDiv < document.getElementById('todo').children.length; currDiv += 1){
		todoArray.push(document.getElementById('todo').children[currDiv].innerHTML);
	}

	chrome.storage.sync.set({'todo' : todoArray}, function() {
	});


	todoArray = [];
	for(var currDiv = 0; currDiv < document.getElementById('in_progress').children.length; currDiv += 1){
		todoArray.push(document.getElementById('in_progress').children[currDiv].innerHTML);
	}

	chrome.storage.sync.set({'in_progress' : todoArray}, function() {
	});


	todoArray = [];
	for(var currDiv = 0; currDiv < document.getElementById('completed').children.length; currDiv += 1){
		todoArray.push(document.getElementById('completed').children[currDiv].innerHTML);
	}

	chrome.storage.sync.set({'completed' : todoArray}, function() {
	});



	chrome.storage.sync.set({'id' : myId}, function() {
	});
}