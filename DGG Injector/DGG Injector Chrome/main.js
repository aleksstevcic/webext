let whitelist = [];
let currChannel = "";
const DEFAULT_WIDTH = "340px";

//this interval gets the current whitelist and saves it locally
let datagetter = setInterval(() => {
	const head = getTwitch();

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
//not efficient xd
//will slam in dgg for you if you have it toggled on for this specified channel
let cont_evt = setInterval(() => {
	const dggExists = findDGG();
	const head = getTwitch();

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
			//new
			fixTwitchsShit();

			//if it is enabled, show dgg, otherwise default to twitch
			if(enable) toggleDGG("dgg");
			else toggleDGG("twitch");
			//runResizerAnimation();
		}

		clearInterval(cont_evt);
		cont_evt = undefined;
	}
}, 750);

//in a new twitch update,
//they decided it was a great idea that the width of the player and the description should be //HARD CODED// to account for the width of the chat,
//so adding an iframe presses the width of the window out, and then even furthermore by 34em by the hardcoded css calc value of (100% - 34em).
//lmao.
function fixTwitchsShit(){
	
	//setting the width of the channel root player with chat causes fucky resizing of my chat, but fixes the issue. hmm..
	document.querySelectorAll(".channel-root--hold-chat+.persistent-player, .channel-root--watch-chat+.persistent-player, .channel-root__info--with-chat .channel-info-content, .channel-root__player--with-chat")
	.forEach( (dom, i) => {
		console.log(dom);
		dom.style.width = "100%";
	});
		
}

function updateIFrames(channel){
	const oldchat = findChatIFrame();

	oldchat.setAttribute("src", "https://www.twitch.tv/popout/" + channel + "/chat");
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
	const swaptype = which ? which : null; 
	const dgg = findDGGIFrame();
	const chat = findChatIFrame();

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
	const dom = findChat();
	if(dom){
		let dgg = "<div class='dggPepeLaugh' visible='true' style='display:block; height: 100% !important; width: "+width+";'><iframe class = 'boringChat' src='https://www.twitch.tv/popout/" + getTwitch().channel + "/chat' style = 'height: 100% !important; width: 100% !important; display: none;'></iframe><iframe class = 'funChat' src='https://www.destiny.gg/embed/chat' style='height: 100% !important; width: 100% !important; display: block;'></iframe></div>";

		let resizer = "<span class='dggResizer' md='false' hover='false' style='opacity:0'></span>";

		let swapper = "<span class='dggSwapper'><img src='" + chrome.runtime.getURL("icons/swapicon.png") + "' width='50' height='50'></img></span>";

		dom.setAttribute("style", "display: none !important");

		dom.parentNode.innerHTML += resizer + swapper + dgg;
		//add the event handler DOM (takes up whole screen)
	}
}

function removeDGG(){
	const parent = findChat().parentNode;

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

function addEvents(){
	const resizer = findResizer();
	const dgg = findDGGIFrame().contentDocument ? findDGGIFrame().contentDocument : findDGGIFrame().contentWindow.document;
	const swapper = findSwapper();
	const lamechat = findChatIFrame().contentDocument ? findChatIFrame().contentDocument : findChatIFrame().contentWindow.document;

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
				const dgg = findDGG();
				const posx = e.clientX - findResizer().style.width/2;
				const val = window.screen.width - posx;

				dgg.style.width = val + "px";
			}
		});
	});

	//button to swap DGG and normal chat
	swapper.addEventListener("click", () => {
		const enable = toggleDGG() === "dgg" ? true : false;

		const head = getTwitch();

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
	
	const channel = getTwitch().channel;
	
	const width = w ? w : findDGG().style.width;

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


//message handler
/*
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		//toggle dgg based on if it is enabled or not on the current channel
		//event will trigger when you click the extension icon
		if(request.message === "--dgg--enable"){
			
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
		else if(request.message === "--dgg--getTwitch"){
			chrome.runtime.sendMessage({message: "--dgg--sendTwitch", data: getTwitch()}, () => {});
			//sendResponse(getTwitch());
		}
});
*/