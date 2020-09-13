var myId = 0;
window.onload=function(){
	
	document.getElementById("todo").addEventListener("dragover", function(event){
		event.preventDefault();
	});
	document.getElementById("todo").addEventListener("drop", function(event){
		event.preventDefault();
		const id = event
			// .originalEvent
			.dataTransfer
			.getData("text");
		const draggableElement = document.getElementById(id);
		const dropzone = event.target;
		if(dropzone.className.toString().localeCompare("example-draggable") != 0){
			dropzone.appendChild(draggableElement);
		}
		event
			.dataTransfer
			.clearData();

		saveData();

		document.getElementById("trash-icon").style.width = "30px";
		document.getElementById("trash-icon").style.height = "30px";
	});



	document.getElementById("in_progress").addEventListener("dragover", function(event){
		event.preventDefault();
	});
	document.getElementById("in_progress").addEventListener("drop", function(event){
		event.preventDefault();
		// console.log(event.dataTransfer.getData("text"));
		const id = event
			.dataTransfer
			.getData("text");
		const draggableElement = document.getElementById(id);
		const dropzone = event.target;

		console.log(dropzone.className.toString());
		if(dropzone.className.toString().localeCompare("example-draggable") != 0){
			dropzone.appendChild(draggableElement);
		}

		
		event
			.dataTransfer
			.clearData();
		saveData();

		document.getElementById("trash-icon").style.width = "30px";
		document.getElementById("trash-icon").style.height = "30px";
	});



	document.getElementById("Completed").addEventListener("dragover", function(event){
		event.preventDefault();
	});
	document.getElementById("Completed").addEventListener("drop", function(event){
		event.preventDefault();
		const id = event
			// .originalEvent
			.dataTransfer
			.getData("text");
		const draggableElement = document.getElementById(id);
		const dropzone = event.target;
		if(dropzone.className.toString().localeCompare("example-draggable") != 0){
			dropzone.appendChild(draggableElement);
		}
		event
			.dataTransfer
			.clearData();
		saveData();

		document.getElementById("trash-icon").style.width = "30px";
		document.getElementById("trash-icon").style.height = "30px";
	});


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
		const draggableElement = document.getElementById(id);
		const dropzone = event.target;
		dropzone.appendChild(draggableElement);
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

		if(document.getElementById("fname").value.toString().length > 0){
			var val = document.getElementById("fname").value;
			document.getElementById("fname").value = "";

			createBlock("todo", val);

			setAllIdData();
		}
	});

	// document.getElementById("checkStorage").addEventListener("click", function(){
	// 	chrome.storage.sync.get("todo", function(data) {
	// 		console.log(data);
	// 	});
	// 	chrome.storage.sync.get("in_progress", function(data) {
	// 		console.log(data);
	// 	});
	// 	chrome.storage.sync.get("Completed", function(data) {
	// 		console.log(data);
	// 	});
	// 	chrome.storage.sync.get("id", function(data) {
	// 		console.log(data);
	// 	});
		
	// });


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
	chrome.storage.sync.get("Completed", function(data) {
		var i;
		for(i = 0; i < data.Completed.length; i+=1){
			createBlock("Completed", data.Completed[i]);
		}
		setAllIdData();
	});
	chrome.storage.sync.get("id", function(data) {
		myId = data.id;
	});


	
}


function createBlock(location, val){
	const div = document.createElement('div');
	const newContent = document.createTextNode(val.toString());
	div.appendChild(newContent);

	div.id = (val.toString() + "-" + myId.toString(10));

	div.setAttribute("class", "example-draggable");
	div.setAttribute("draggable", true);
	// div.setAttribute("contenteditable", true);
	
	
	document.getElementById(location).appendChild(div);

	saveData();
}


function setAllIdData(){
	console.log("setting all the data!!!")
	var items = document.getElementsByClassName("example-draggable");
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
	for(var currDiv = 0; currDiv < document.getElementById('Completed').children.length; currDiv += 1){
		todoArray.push(document.getElementById('Completed').children[currDiv].innerHTML);
	}

	chrome.storage.sync.set({'Completed' : todoArray}, function() {
	});



	chrome.storage.sync.set({'id' : myId}, function() {
	});
}