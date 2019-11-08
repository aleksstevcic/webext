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

