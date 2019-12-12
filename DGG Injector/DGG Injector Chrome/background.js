//REGULATORY
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	console.log(request);
	if(request.message === "--dgg--enableIcon")
		chrome.browserAction.setIcon({path: "icon.png"});
	if(request.message === "--dgg--disableIcon")
		chrome.browserAction.setIcon({path: "icon_disable.png"});
	if(request.message === "--dgg--sendData"){
		if(request.enabled)
			chrome.browserAction.setIcon({path: "icon.png"});
		else
			chrome.browserAction.setIcon({path: "icon_disable.png"});
	}
});

//WHEN THE BUTTON IS CLICKED ON THE MENU, DO SHIT
chrome.browserAction.onClicked.addListener((tab) =>{
	//send a message called "toggle"
	chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
		chrome.tabs.sendMessage(tabs[0].id, {message: "--dgg--toggle"}, (response) => {});
	});
	
});

