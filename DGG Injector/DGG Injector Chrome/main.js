let whitelist = [];

//this interval gets the current whitelist and saves it locally
let datagetter = setInterval(() => {
	let head = getTwitch();

	if(head.isTwitch){
		chrome.storage.sync.get(["--dgg--Whitelist"], (data) => {
			whitelist = data["--dgg--Whitelist"];
		});

		clearInterval(datagetter);
		datagetter = undefined;
	}
}, 250);

//this runs parallel every 500 milliseconds
//will slam in dgg for you if you have it toggled on for this specified channel
let autoplacement = setInterval(() => {
	let dggExists = findDGG();
	if(!dggExists){
		let head = getTwitch();
		if(whitelist.includes(head.channel)){
			console.log('fouind');
			addDGG();
			addResizerEvent();
			//runResizerAnimation();
		}
	}
}, 500);

//message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		//toggle dgg based on if it is enabled or not on the current channel
		//event will trigger when you click the extension icon
		if(request.message === "--dgg--toggle"){
			
			//get the whitelist as stored on the profile
			chrome.storage.sync.get(["--dgg--Whitelist"], (data) => {
				
				let head = getTwitch();
				let dgg = findDGG();

				//make a temp version of the list
				let temp = data["--dgg--Whitelist"] === undefined ? [] : data["--dgg--Whitelist"];

				//if the current channel is not in the whitelist, then add it
				if(!temp.includes(head.channel))
					temp.push(head.channel);
				else{
					//otherwise remove it from the array
					removeFromArray(head.channel, temp);
					if(dgg)
						removeDGG();
				}

				//set the local whitelist var to the new edited list, and set the profile storage
				chrome.storage.sync.set({"--dgg--Whitelist": temp}, () => {
					whitelist = temp;
				});
				
			});
		}
});

function removeFromArray(val, arr){
	let index = arr.indexOf(val);
	if(index > -1)
		arr.splice(index, 1);
}

function toggleDGG(val){
	let dgg = findDGG();
	let chat = findChat();
	
	if(dgg){
		if(dgg.getAttribute("visible") === "true"){
			dgg.setAttribute("style", "display: none");
			dgg.setAttribute("visible", "false");
			
			chat.setAttribute("style", "display: block");
		}else{
			dgg.setAttribute("style", "display: block");
			dgg.setAttribute("visible", "true");
			
			chat.setAttribute("style", "display: none");
		}
	}
}

function addDGG(){
	let dom = findChat();
	if(dom){
		let dgg = "<div class='dggPepeLaugh' visible='true' style='display:block; height: 100% !important; width: 300px;'><iframe src='https://www.destiny.gg/embed/chat' style='height: 100% !important; width: 100% !important;'></iframe></div>";
		

		let resizer = "<span class='dggResizer' md='false'></span>";

		dom.setAttribute("style", "display: none !important");

		dom.parentNode.innerHTML += resizer + dgg;
		//add the event handler DOM (takes up whole screen)
	}
}

function removeDGG(){
	let dgg = findDGG();
	if(dgg){
		let chat = findChat();
		let resizer = findResizer();
		chat.parentNode.removeChild(dgg);
		chat.parentNode.removeChild(resizer);
		chat.style.display = "block";
	}
}

function findDGG(){
	return document.querySelector(".dggPepeLaugh");
}

function findChat(){
	return document.querySelector("div[data-a-target^='right-column-chat-bar']");
}

function findResizer(){
	return document.querySelector(".dggResizer");
}

function getTwitch(){
	let isTwitch = document.querySelector("meta[property^='og:site_name']") ? (document.querySelector("meta[property^='og:site_name']").getAttribute("content") == "Twitch") : null;
	let channelName = document.querySelector("meta[property^='og:url']") ? document.querySelector("meta[property^='og:url']").getAttribute("content").split("twitch.tv/")[1] : null;
	return obj = {
		isTwitch: (isTwitch) ? true : false,
		channel: (channelName) ? channelName: null
	};
}

function addResizerEvent(){
	let resizer = findResizer();

	//if the resizer div exists
	if(resizer){
		//on mouse down, change the DOM's property of "md" (mousedown) to true
		resizer.addEventListener("mousedown", e => {
			(resizer.getAttribute("md") === "true") ? null : resizer.setAttribute("md", "true");
		});
		//apply an event on the whole document to turn it off on mouseup
		document.body.addEventListener("mouseup", e => {
			(resizer.getAttribute("md") === "true") ? resizer.setAttribute("md", "false") : null;
		});
		//when the mouse moves along the page, get the mouse position and change the width according to the the distance from the right side of the screen
		document.body.addEventListener("mousemove", e => {
			if(resizer.getAttribute("md") === "true"){
				let dgg = findDGG();
				let posx = e.clientX;
				let val = window.screen.width - posx;

				dgg.style.width = val + "px";
			}
		});
	}
}



/* WORKING ON! IDK WHATS WRONG :)*/


function runResizerAnimation(){
	//hardcoded to '30'fps
	let initTime = new Date();
	let resizer = findResizer();

	let animationinterval = setInterval(() => {

		//the time is not reporting correctly, its weird?
		let t = new Date();
		let currTime = t.getMilliseconds();
		console.log(currTime);
		if(currTime < 1500){
			let radians = Math.PI*(currTime/180)*(360/1500);
			resizer.style.opacity = Math.abs(Math.sin(radians));
		}else{
			resizer.style.opacity = 0;
			clearInterval(animationinterval);
			animationinterval = null;
		}

	}, 33);
}