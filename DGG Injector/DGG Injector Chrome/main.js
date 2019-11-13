let whitelist = [];
const DEFAULT_WIDTH = "300px";

//this interval gets the current whitelist and saves it locally
let datagetter = setInterval(() => {
	let head = getTwitch();

	if(head.isTwitch){
		chrome.storage.sync.get(["--dgg--Whitelist"], (data) => {
			if(typeof data["--dgg--Whitelist"] != "undefined") whitelist = data["--dgg--Whitelist"];
			chrome.runtime.sendMessage({message: "--dgg--sendData", enabled: isEnabled()}, () => {});
			console.log(data);
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
		let found = false;
		let width = DEFAULT_WIDTH;
		let enable = false;
		for(let i=0; i<whitelist.length; i++){
			if(head.channel === whitelist[i].channel) {
				found=true;
				width = whitelist[i].width;
				enable = whitelist[i].enabled;
				break;
			}
		}
		if(found){
			addDGG(width);
			addEvents();
			//if it is enabled, show dgg, otherwise default to twitch
			if(enable) toggleDGG("dgg");
			else toggleDGG("twitch");
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

				//set our global whitelist
				whitelist = data["--dgg--Whitelist"] === undefined ? [] : data["--dgg--Whitelist"];

				let obj = {
					channel: head.channel,
					width: dgg ? dgg.style.width : DEFAULT_WIDTH,
					enabled: null
				};

				let found = false;
				//go through the whitelist
				for(let i=0; i<whitelist.length; i++){
					//if we find a match
					if(head.channel === whitelist[i].channel) {
							whitelist.splice(i, 1);
							found = true;
							chrome.runtime.sendMessage({message: "--dgg--disableIcon"}, () => {});
							break;
					}
				}

				//if we end up not finding anything, then immediately add it to the list
				if(!found){
					obj.enabled = true;
					whitelist.push(obj);
				}

				//set the local whitelist var to the new edited list, and set the profile storage
				chrome.storage.sync.set({"--dgg--Whitelist": whitelist}, () => {
					chrome.runtime.sendMessage({message: "--dgg--enableIcon"}, () => {});
				});
				
			});
		}
});

function isEnabled(){
	let head = getTwitch();

	for(let i=0; i< whitelist.length; i++){
		if(head.channel === whitelist[i].channel)
			return true;
	}
	return false;
}

function toggleDGG(which){
	let swaptype = which ? which : null; 
	let dgg = findDGGIFrame();
	let chat = findChatIFrame();

	if(swaptype != null){
		if(swaptype == "dgg"){
			dgg.style.display = "block";
			chat.style.display = "none";
			dgg.setAttribute("visible", "true");
			return "dgg";
		}
		else if(swaptype == "twitch"){
			dgg.style.display = "none";
			chat.style.display = "block";
			dgg.setAttribute("visible", "false");
			return "twitch";
		}
	}
	else{
		if(dgg.getAttribute("visible") === "true"){
			dgg.style.display = "none";
			chat.style.display = "block";
			dgg.setAttribute("visible", "false");
			return "twitch";
		}else{
			dgg.style.display = "block";
			chat.style.display = "none";
			dgg.setAttribute("visible", "true");
			return "dgg";
		}
	}
}

function addDGG(width){
	let dom = findChat();
	if(dom){
		let dgg = "<div class='dggPepeLaugh' visible='true' style='display:block; height: 100% !important; width: "+width+";'><iframe class = 'boringChat' src='https://www.twitch.tv/popout/k4iley/chat' style = 'height: 100% !important; width: 100% !important; display: none;'></iframe><iframe class = 'funChat' src='https://www.destiny.gg/embed/chat' style='height: 100% !important; width: 100% !important; display: block;'></iframe></div>";

		let resizer = "<span class='dggResizer' md='false' hover='false' style='opacity:0'></span>";

		let swapper = "<span class='dggSwapper'><img src='" + chrome.runtime.getURL("swapicon.png") + "' width='50' height='50'></img></span>";

		dom.setAttribute("style", "display: none !important");

		dom.parentNode.innerHTML += resizer + swapper + dgg;
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

function findChatIFrame(){
	return document.querySelector(".boringChat");
}

function findDGGIFrame(){
	return document.querySelector(".funChat");
}

function findChat(){
	return document.querySelector("div[data-a-target^='right-column-chat-bar']");
}

function findResizer(){
	return document.querySelector(".dggResizer");
}

function findSwapper(){
	return document.querySelector(".dggSwapper");
}

function getTwitch(){
	let isTwitch = document.querySelector("meta[property^='og:site_name']") ? (document.querySelector("meta[property^='og:site_name']").getAttribute("content") == "Twitch") : null;
	let channelName = null;
	if(document.querySelector("meta[property^='og:url']")){
		let htmlname = document.querySelector("meta[property^='og:url']").getAttribute("content").split("twitch.tv/")[1];
		let href = window.location.href;

		if(href.indexOf(htmlname) > -1)
			channelName = htmlname;
		else //janky. can be exploited
			channelName = href.split("twitch.tv/")[1];
	}
	return obj = {
		isTwitch: (isTwitch) ? true : false,
		channel: (channelName) ? channelName: null
	};
}

function addEvents(){
	let resizer = findResizer();
	let dgg = findDGG().childNodes[0].contentDocument ? findDGG().childNodes[0].contentDocument : findDGG().childNodes[0].contentWindow.document;
	let swapper = findSwapper();
	//if the resizer div exists
	if(resizer){
		//on mouse down, change the DOM's property of "md" (mousedown) to true
		resizer.addEventListener("mousedown", e => {
			(resizer.getAttribute("md") === "true") ? null : resizer.setAttribute("md", "true");
		});

		//COSMETIC HOVER EVENTS (does nothing rn im too smoothbrain to figure it out)
		resizer.addEventListener("mouseenter", e => {
			resizer.setAttribute("hover", "true");
		});
		resizer.addEventListener("mouseleave", e => {
			resizer.setAttribute("hover", "false");
		});

		//button to swap DGG and normal chat
		swapper.addEventListener("click", () => {
			let enable = toggleDGG() === "dgg" ? true : false;

			let head = getTwitch();

			let found = false;
			for(let i=0; i<whitelist.length; i++){
				if(head.channel == whitelist[i].channel){
					found = true;
					whitelist[i].enabled = enable;
					break;
				}
			}

			if(found)
				chrome.storage.sync.set({"--dgg--Whitelist": whitelist}, () => {});

		});
		swapper.addEventListener("mouseenter", () => {
			swapper.style.cursor = "pointer";
		});
		swapper.addEventListener("mouseleave", () => {
			swapper.style.cursor = "default";
		});

		//apply an event on the whole document to turn it off on mouseup
		document.body.addEventListener("mouseup", e => {
			(resizer.getAttribute("md") === "true") ? resizer.setAttribute("md", "false") : null;

			let channel = getTwitch().channel;

			let width = findDGG().style.width;

			let found = false;

			for(let i=0; i<whitelist.length; i++){
				if(obj.channel == whitelist[i].channel){
					whitelist[i].width = width;
					found = true;
					break;
				}
			}

			if(!found)
				whitelist.push(obj);

			chrome.storage.sync.set({"--dgg--Whitelist": whitelist}, () => {});
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

		dgg.body.addEventListener("mouseup", e => {
			(resizer.getAttribute("md") === "true") ? resizer.setAttribute("md", "false") : null;
		});
		//when the mouse moves along the page, get the mouse position and change the width according to the the distance from the right side of the screen
		dgg.body.addEventListener("mousemove", e => {
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

function lerp(start, end, percent){
	console.log(start + " " + end + " " + percent + " " + start + ((end-start)*percent));
	return start + ((end-start)*percent);
}