//REGULATORY
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	
});

//WHEN THE BUTTON IS CLICKED ON THE MENU, DO SHIT
chrome.browserAction.onClicked.addListener((tab) =>{
	//send a message called "toggle"
	chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
		chrome.tabs.sendMessage(tabs[0].id, {message: "--dgg--toggle"}, function(response){});
	});
	
});