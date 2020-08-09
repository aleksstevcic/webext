let whitelist = [];
let currChannel = "";
const DEFAULT_WIDTH = "300px";

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
			addAutoDestinyLiveButton();
		}
	}
}, 500);

const switchToDestiny = (timer) => setInterval(() => {
	if(location.pathname === "/destiny") clearInterval(this);
	else if (isDestinyOnline()) {
		chrome.storage.sync.set({"--dgg--WaitForDestiny": false}, () => {
			window.location = "/destiny";
		});	
	}
}, timer);

const isDestinyOnline = () => {
	const statusElementContent = document.querySelector('[href="/destiny"] .side-nav-card__live-status span')
	return statusElementContent && statusElementContent.textContent.toLowerCase() !== "offline" 
}

//message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		//toggle dgg based on if it is enabled or not on the current channel
		//event will trigger when you click the extension icon
		if(request.message === "--dgg--toggle"){
			
			let dgg = findDGG();
			let head = getTwitch();
			if(!dgg){
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
								break;
						}
					}

					//if we end up not finding anything, then immediately add it to the list
					if(!found){
						obj.enabled = true;
						whitelist.push(obj);
					}

					//REGULATORY CHECK
					trimName(whitelist, "isTwitch");

					//set profile storage
					chrome.storage.sync.set({"--dgg--Whitelist": whitelist}, () => {
						if(!found) chrome.runtime.sendMessage({message: "--dgg--enableIcon"}, () => {});
						else chrome.runtime.sendMessage({message: "--dgg--disableIcon"}, () => {});
					});
					
				});
			}
			else{
				removeFromWhitelist(head.channel);

				//REGULATORY CHECK
				trimName(whitelist, "isTwitch");

				chrome.storage.sync.set({"--dgg--Whitelist": whitelist}, () => {
					if(!found) chrome.runtime.sendMessage({message: "--dgg--enableIcon"}, () => {});
					else chrome.runtime.sendMessage({message: "--dgg--disableIcon"}, () => {});
				});

				//iframes fuck with everything in modern browsers. just reload page.
				window.location.reload();
			}
		}
});

function updateIFrames(channel){
	let oldchat = findChatIFrame();

	oldchat.setAttribute("src", "https://www.twitch.tv/popout/" + channel + "/chat");
}

function removeFromWhitelist(name){
	for(let i=0; i<whitelist.length; i++){
		if(whitelist[i].channel === name){
			whitelist.splice(i, 1);
			i-=1;
		}
	}
}

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
		let dgg = "<div class='dggPepeLaugh' visible='true' style='display:block; height: 100% !important; width: "+width+";'><iframe class = 'boringChat' src='https://www.twitch.tv/popout/" + getTwitch().channel + "/chat' style = 'height: 100% !important; width: 100% !important; display: none;'></iframe><iframe class = 'funChat' src='https://www.destiny.gg/embed/chat' style='height: 100% !important; width: 100% !important; display: block;'></iframe></div>";

		let resizer = "<span class='dggResizer' md='false' hover='false' style='opacity:0'></span>";

		let swapper = "<span class='dggSwapper'><img src='" + chrome.runtime.getURL("swapicon.png") + "' width='50' height='50'></img></span>";

		dom.setAttribute("style", "display: none !important");

		dom.parentNode.innerHTML += resizer + swapper + dgg;
		//add the event handler DOM (takes up whole screen)
	}
}

function removeDGG(){
	let parent = findChat().parentNode;

	parent.childNodes.forEach((dom) => {
		if(dom.getAttribute("data-a-target") != "right-column-chat-bar")
			parent.removeChild(dom);
	});
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
	let dgg = findDGGIFrame().contentDocument ? findDGGIFrame().contentDocument : findDGGIFrame().contentWindow.document;
	let swapper = findSwapper();
	let lamechat = findChatIFrame().contentDocument ? findChatIFrame().contentDocument : findChatIFrame().contentWindow.document;

	//on mouse down, change the DOM's property of "md" (mousedown) to true
	resizer.addEventListener("mousedown", e => {
		(resizer.getAttribute("md") === "true") ? null : resizer.setAttribute("md", "true");
	});

	//apply an event on all elements in this made up array
	[document.body, dgg.body, lamechat.body]
	.forEach((dom, n) => {
		//when you let go of the mouse, save the width and put it in to the storage
		dom.addEventListener("mouseup", e => {
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

			//REGULATORY CHECK
			trimName(whitelist, "isTwitch");

			chrome.storage.sync.set({"--dgg--Whitelist": whitelist}, () => {});
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

function addAutoDestinyLiveButton() {
	const destinyLiveButton = (() => {
		const destinyLiveButtonHTML = '<div class="top-nav__prime tw-align-self-center tw-flex-grow-0 tw-flex-nowrap tw-flex-shrink-0 tw-mg-x-05"><div class="DestinyLive tw-relative"><button class=""><div style="width: 2rem; height: 2rem;"><?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd"><svg id="destinyLiveLogo" version="1.0" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 114.000000 114.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,114.000000) scale(0.100000,-0.100000)" stroke="none"><path d="M0 570 l0 -570 570 0 570 0 0 570 0 570 -570 0 -570 0 0 -570z m1050 355 l0 -105 -64 0 -63 0 -94 96 c-52 52 -95 99 -97 105 -2 5 61 9 157 9 l161 0 0 -105z m-345 -12 l104 -108 0 -240 1 -240 -106 -112 -106 -113 -254 0 -254 0 0 460 0 460 256 0 255 0 104 -107z m345 -718 l0 -105 -166 0 -166 0 97 105 97 105 69 0 69 0 0 -105z"/><path d="M390 570 l0 -320 35 0 35 0 0 320 0 320 -35 0 -35 0 0 -320z"/></g></svg></div></button></div></div>';
		const div = document.createElement('div');
		div.innerHTML = destinyLiveButtonHTML.trim();
		return div.firstChild;
	})();

	const navBar = document.querySelector('.top-nav__menu > div:last-child ');
	navBar.insertBefore(destinyLiveButton, navBar.childNodes[0]);
	chrome.storage.sync.get(["--dgg--WaitForDestiny"], (data) => {
		const waitForDestiny = data["--dgg--WaitForDestiny"];
		const fillColor = waitForDestiny ? "red" : "white";
		destinyLiveButton.querySelector('svg').style.fill = fillColor;
		if(waitForDestiny) destinyLiveButton.timeOutScript = switchToDestiny(500);
	})

	destinyLiveButton.onclick = () => {
		chrome.storage.sync.get(["--dgg--WaitForDestiny"], (data) => {
			const waitForDestiny = !data["--dgg--WaitForDestiny"];
			const fillColor = waitForDestiny ? "red" : "white";
			destinyLiveButton.querySelector('svg').style.fill = fillColor;

			if(waitForDestiny) {
				destinyLiveButton.timeOutScript = switchToDestiny(500);
			} else {
				clearInterval(destinyLiveButton.timeOutScript);
			}
			chrome.storage.sync.set({"--dgg--WaitForDestiny": waitForDestiny});
		});
	};
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