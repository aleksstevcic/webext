<<<<<<< Updated upstream
=======
let whitelist = [];
let currChannel = "";
const DEFAULT_WIDTH = "340px";

//this interval gets the current whitelist and saves it locally
let datagetter = setInterval(() => {
	let head = getTwitch();

	if(head.isTwitch){
		chrome.storage.sync.get(["--dgg--Whitelist"], (data) => {
			if(typeof data["--dgg--Whitelist"] != "undefined"){
				whitelist = data["--dgg--Whitelist"];
				//REGULATORY CHECK
				trimName(whitelist, "isTwitch");
			}
			chrome.runtime.sendMessage({message: "--dgg--sendData", enabled: isEnabled()}, () => {});
		});


		clearInterval(datagetter);
		datagetter = undefined;
	}
}, 250);

//this runs parallel every 500 milliseconds
//will slam in dgg for you if you have it toggled on for this specified channel
let cont_evt = setInterval(() => {
	let dggExists = findDGG();
	let head = getTwitch();

	if(currChannel != head.channel){
		if(dggExists)
			updateIFrames(head.channel);

		currChannel = head.channel;
	}

	if(!dggExists){
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

>>>>>>> Stashed changes
//message handler
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	//toggle dgg by getting the current value, then set it to the inverse
	if(request.message === "--dgg--toggle"){
		let head = getTwitch();
		var dggExists = findDGG();
		if(head.isTwitch && findChat()){
			if(dggExists.length < 1)
				addDGG();
		}
	}
});

function toggleDGG(val){
	let dgg = findDGG();
	let chat = findChat();
	
	if(dgg){
		if(dgg.attr("visible") === "true"){
			dgg.attr("style", "display: none");
			dgg.attr("visible", "false");
			
			chat.attr("style", "display: block");
		}else{
			dgg.attr("style", "display: block");
			dgg.attr("visible", "true");
			
			chat.attr("style", "display: none");
		}
	}
}

function addDGG(){
	let dom = findChat();
	if(dom){
		let dgg = "<div class='dggPepeLaugh' visible='true' style='display:block; height: 100%; !important'><iframe src='https://www.destiny.gg/embed/chat' style='height: 100% !important'></iframe></div>";
		
		dom.attr("style", "display: none !important");
		dom.parent().html(dom.parent().html() + dgg);
	}
}

function findDGG(){
	return $(".dggPepeLaugh");
}

function findChat(){
	return $("div[data-a-target^='right-column-chat-bar']");
}

function getTwitch(){
	let isTwitch = $("meta[property^='og:site_name']") ? ($("meta[property^='og:site_name']").attr("content") == "Twitch") : null;
	let channelName = $("meta[property^='og:url']") ? $("meta[property^='og:url']").attr("content").split("twitch.tv/")[1] : null;
	return obj = {
		isTwitch: (isTwitch) ? true : false,
		channel: (channelName) ? channelName: null
	};
}

<<<<<<< Updated upstream
=======
function addEvents(){
	let resizer = findResizer();
	let dgg = findDGGIFrame().contentDocument ? findDGGIFrame().contentDocument : findDGGIFrame().contentWindow.document;
	let swapper = findSwapper();
	let lamechat = findChatIFrame().contentDocument ? findChatIFrame().contentDocument : findChatIFrame().contentWindow.document;

	//on mouse down, change the DOM's property of "md" (mousedown) to true
	resizer.addEventListener("mousedown", e => {
		(resizer.getAttribute("md") === "true") ? null : resizer.setAttribute("md", "true");
			findDGGIFrame().style.pointerEvents = "none";
			findChatIFrame().style.pointerEvents = "none";
	});
	
	//resets the width of the panel to default on double click
	resizer.addEventListener("dblclick", e => {
		findDGG().style.width = DEFAULT_WIDTH;
		setWidthToStorage(DEFAULT_WIDTH);
	});
	/* in progress
	resizer.addEventListener("dblclick", e => {
		
		let box = document.createElement("textarea");
		box.width = "50px";
		box.height = "50px";
		box.style.position = "absolute";
		box.style.opacity = ".6";
		box.style.top = e.clientY + "px";
		box.style.left = e.clientX + "px";
		box.addEventListener("enter", e => {
			let value = this.value;
			document.body.removeChild(this);
			//push changes
		});
		document.body.appendChild(box);
	});
	*/

	//apply an event on all elements in this made up array
	//turns out i only need it on document.body, and i dont want to re-make this code to not use foreach. whatever.
	[document.body]
	.forEach((dom, n) => {
		//when you let go of the mouse, save the width and put it in to the storage
		dom.addEventListener("mouseup", e => {
			findDGGIFrame().style.pointerEvents = "auto";
			findChatIFrame().style.pointerEvents = "auto";
			(resizer.getAttribute("md") === "true") ? resizer.setAttribute("md", "false") : null;
			
			setWidthToStorage();
		});

		//when the mouse moves, save the width
		dom.addEventListener("mousemove", e => {
			if(resizer.getAttribute("md") === "true"){
				let dgg = findDGG();
				let posx = e.clientX - findResizer().style.width/2;
				let val = window.screen.width - posx;

				dgg.style.width = val + "px";
			}
		});
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

		//REGULATORY CHECK
		trimName(whitelist, "isTwitch");

		if(found)
			chrome.storage.sync.set({"--dgg--Whitelist": whitelist}, () => {});
	});

	//COSMETIC HOVER EVENTS (does nothing rn im too smoothbrain to figure it out)
	resizer.addEventListener("mouseenter", e => {
		resizer.setAttribute("hover", "true");
	});
	resizer.addEventListener("mouseleave", e => {
		resizer.setAttribute("hover", "false");
	});

	swapper.addEventListener("mouseenter", () => {
		swapper.style.cursor = "pointer";
	});
	swapper.addEventListener("mouseleave", () => {
		swapper.style.cursor = "default";
	});
}

function setWidthToStorage(w){
	
	let channel = getTwitch().channel;
	
	let width = w ? w : findDGG().style.width;

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

	//REGULATORY CHECK
	trimName(whitelist, "isTwitch");

	chrome.storage.sync.set({"--dgg--Whitelist": whitelist}, () => {});
}

//had to make this function because i have no idea what the fuck is wrong with my code and it keeps adding isTwitch to random fucking entries
//is pass by reference, no need to return, it will do it all automatically
function trimName(arr, str){
	for(let i=0; i<arr.length; i++){
		if(arr[i].hasOwnProperty(str)){
			if(!arr[i].hasOwnProperty("enabled")){
				arr.splice(i, 1);
				//go back because fuck logic
				//no but seriously, splicing shifts everything ahead of it up one, so we want to go back one to really be where we were before
				i=-1;
			}
			else{
				delete arr[i][str];
			}
		}
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
>>>>>>> Stashed changes
