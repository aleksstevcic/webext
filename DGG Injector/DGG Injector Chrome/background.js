//REGULATORY
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	
});

//WHEN THE BUTTON IS CLICKED ON THE MENU, DO SHIT
chrome.browserAction.onClicked.addListener((tab) =>{
	//send a message called "toggle"
	chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
		chrome.tabs.sendMessage(tabs[0].id, {message: "--dgg--toggle"}, function(response){});
	});
	
<<<<<<< Updated upstream
});
=======
});

function displayList(){
	chrome.storage.sync.get(["--dgg--Whitelist"], (data) => {for(var i=0; i<data["--dgg--Whitelist"].length; i++)console.log(data["--dgg--Whitelist"][i])});
}
>>>>>>> Stashed changes
