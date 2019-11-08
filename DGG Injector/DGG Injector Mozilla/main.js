//message handler
browser.runtime.onMessage.addListener(request => {
	
	//toggle dgg by getting the current value, then set it to the inverse
	if(request.message === "--dgg--toggle"){
		let head = getTwitch();
		var dggExists = findDGG();
		if(head.isTwitch && findChat()){
			if(!dggExists)
				addDGG();
		}
	}
});

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
		let dgg = "<div class='dggPepeLaugh' visible='true' style='display:block; height: 100%; !important'><iframe src='https://www.destiny.gg/embed/chat' style='height: 100% !important'></iframe></div>";
		
		dom.setAttribute("style", "display: none !important");
		dom.parentNode.innerHTML += dgg;
	}
}

function findDGG(){
	return document.querySelector(".dggPepeLaugh");
}

function findChat(){
	return document.querySelector("div[data-a-target^='right-column-chat-bar']");
}

function getTwitch(){
	let isTwitch = document.querySelector("meta[property^='og:site_name']") ? (document.querySelector("meta[property^='og:site_name']").getAttribute("content") == "Twitch") : null;
	let channelName = document.querySelector("meta[property^='og:url']") ? document.querySelector("meta[property^='og:url']").getAttribute("content").split("twitch.tv/")[1] : null;
	return obj = {
		isTwitch: (isTwitch) ? true : false,
		channel: (channelName) ? channelName: null
	};
}

