//REGULATORY
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.message === "--dgg--sendPageData"){
		/*
		console.log('received!');
		let channelName = request.data.channel;
		console.log(channelName);
		//get whitelist
		chrome.storage.sync.get(["--dgg--Whitelist"], (data) => {
			console.log('a');
			let temp = data["--dgg--Whitelist"] === undefined ? [] : data["--dgg--Whitelist"];
			//if the current channel isnt in whitelist, include it
			if(!temp.includes(channelName)){
				//add to array then set the value
				temp.push(channelName);
				
			}
			chrome.storage.sync.set({"--dgg--Whitelist": temp}, () => {});
			sendResponse({data: temp});
		});
		*/
	}

});

//WHEN THE BUTTON IS CLICKED ON THE MENU, DO SHIT
chrome.browserAction.onClicked.addListener((tab) =>{
	//send a message called "toggle"
	chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
		chrome.tabs.sendMessage(tabs[0].id, {message: "--dgg--toggle"}, function(response){});
	});
	
});