//REGULATORY
/*
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	
});
*/

//WHEN THE BUTTON IS CLICKED ON THE MENU, DO SHIT
browser.browserAction.onClicked.addListener(() =>{
	//send a message called "toggle"
	browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
		
		browser.tabs.sendMessage(tabs[0].id, {message: "--dgg--toggle"});
		
	}).catch(logError);
	
});