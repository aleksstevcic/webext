let whitelist;
document.addEventListener("DOMContentLoaded", (event) => {
	
	/*
	chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
		chrome.tabs.sendMessage(tabs[0].id, {message: "--dgg--toggle"}, (response) => {});
	});
	*/
	makeEvents();
	main();

});

function main(){

	chrome.storage.sync.get(["--dgg--Whitelist"], (data) => {
		if(typeof data["--dgg--Whitelist"] != "undefined"){
			whitelist = data["--dgg--Whitelist"];
			//REGULATORY CHECK
			trimName(whitelist, "isTwitch");

			makeEditor(whitelist);
		}
	});

}

function makeEditor(data){
	let mainDiv = document.querySelector(".dispArea");
	for(let dataIndex = 0; dataIndex < data.length; dataIndex++){
		mainDiv.appendChild(makeObj(data[dataIndex]));
	}
}

function makeObj(obj){
	//MAIN BLOCK
	let div = document.createElement("div");
	div.setAttribute("identifier", obj.channel);
	div.setAttribute("id", "row");
	div.setAttribute("class", "disp");

	//CHANNEL NAME
	let channelBlock = document.createElement("textarea");
	channelBlock.setAttribute("class", "channel");
	channelBlock.setAttribute("placeholder", "channel name");
	channelBlock.innerText = obj.channel;

	//WIDTH BOX
	let widthBlock = document.createElement("textarea");
	widthBlock.setAttribute("class", "width");
	widthBlock.setAttribute("placeholder", "width");
	widthBlock.innerText = obj.width.substring(0, obj.width.length - 2);

	//DGG OR TWITCH? BUTTON
	let typeBlock = document.createElement("button");
	typeBlock.setAttribute("class", "enabled");
	typeBlock.innerText = (obj.enabled ? "dgg" : "twitch");

	//DELETE BUTTON
	let deleteBlock = document.createElement("button");
	deleteBlock.setAttribute("class", "delete");
	deleteBlock.innerText = "Remove";


	channelBlock.onkeyup = channelBlock.onblur = channelBlock.onchange =
	widthBlock.onkeyup   = widthBlock.onblur   = widthBlock.onchange   = (e) => {

		let obj = makeEntry(e);

		//this will return false if there have been no changes, so as to not call chrome storage all the time

		let a = findAndReplace(e.srcElement.parentNode.getAttribute("identifier"), obj, whitelist);

		if(a){
			whitelist = a;
			pushToChromeStorage(whitelist);
			e.srcElement.parentNode.setAttribute("identifier",obj.channel);
		}
		
	};

	typeBlock.onclick = (e) => {
		let obj = makeEntry(e);

		//toggle
		obj.enabled = !obj.enabled;

		let a = findAndReplace(e.srcElement.parentNode.getAttribute("identifier"), obj, whitelist);

		if(a){
			whitelist = a;
			pushToChromeStorage(whitelist);
			e.srcElement.parentNode.querySelector(".enabled").innerText = obj.enabled ? "dgg" : "twitch";
		}
	};

	deleteBlock.onclick = (e) => {
		let obj = makeEntry(e);

		//pass-by reference. whitelist is edited directly
		removeFromList(obj.channel, whitelist);

		pushToChromeStorage(whitelist);
		let itm = e.srcElement.parentNode;
		
		itm.parentNode.removeChild(itm);
	};


	//APPEND THAT SHIT
	div.appendChild(channelBlock);
	div.appendChild(widthBlock);
	div.appendChild(typeBlock);
	div.appendChild(deleteBlock);

	//RETURN THAT SHIT
	return div;
}

function makeEntry(e){
	return {
		channel: e.srcElement.parentNode.querySelector(".channel").value,
		enabled: e.srcElement.parentNode.querySelector(".enabled").innerText === "dgg",
		width:   e.srcElement.parentNode.querySelector(".width").value + "px"
	};
}

function makeEvents(){
	let search = document.querySelector(".search");
	search.onkeyup = search.onblur = search.onchange = (e) => {
		
		let doms = document.querySelectorAll("#row");

		if(e.srcElement.value.length === 0){
			doms.forEach((item, i) => {
				item.setAttribute("class", "disp");
			});
		}
		else{
			doms.forEach((item, i) => {
				if(!(item.childNodes[0].value.indexOf(e.srcElement.value) > -1))
					item.setAttribute("class", "ndisp");
			});
		}
	};

	document.querySelector(".add").onclick = (e) => {
		
		chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
			let channel = tabs[0].url.split("twitch.tv/")[1];
			if(channel){
				channel = channel.split("?")[0];
				channel = channel.split("#")[0];
				channel = channel.split("&")[0];

				let obj = {};

				if(exists(channel, whitelist)){

					if(!exists("", whitelist)){
						obj = {
							channel: "",
							enabled: true,
							width: "340px"
						};

						whitelist.push(obj);
						makeObj(obj);
						pushToChromeStorage(whitelist);
						window.location.reload();
					}

				}
				else{

					obj = {
						channel: channel,
						enabled: true,
						width: "340px"
					};

					whitelist.push(obj);
					makeObj(obj);
					pushToChromeStorage(whitelist);
					window.location.reload();
				}
			}
		});
		/*
		if(exists(, whitelist))

		
		*/
	};
}

