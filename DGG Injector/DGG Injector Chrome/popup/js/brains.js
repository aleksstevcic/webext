let whitelist = [];

document.addEventListener("DOMContentLoaded", (event) => {
	
	/*
	chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
		chrome.tabs.sendMessage(tabs[0].id, {message: "--dgg--toggle"}, (response) => {});
	});
	*/
	makeEvents();
	main();

});

window.onbeforeunload = () =>{

	pushToChromeStorage(whitelist);

};

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
	const mainDiv = document.querySelector(".dispArea");
	const tbody = document.querySelector(".dispArea tbody");
	for(let dataIndex = 0; dataIndex < data.length; dataIndex++){
		tbody.appendChild(makeObj(data[dataIndex]));
	}
}

function makeObj(obj){
	//MAIN BLOCK
	const div = document.createElement("tr");
	div.setAttribute("identifier", obj.channel);
	div.setAttribute("id", "row");
	div.setAttribute("class", "disp");

	//CHANNEL NAME
	const ctd = document.createElement("td");
	const channelBlock = document.createElement("textarea");
	channelBlock.setAttribute("class", "channel");
	channelBlock.setAttribute("placeholder", "channel name");
	channelBlock.innerText = obj.channel;

	//WIDTH BOX
	const wtd = document.createElement("td");
	const widthBlock = document.createElement("textarea");
	widthBlock.setAttribute("class", "width");
	widthBlock.setAttribute("placeholder", "width");
	widthBlock.innerText = obj.width.substring(0, obj.width.length - 2);

	//DGG OR TWITCH? BUTTON
	const ttd = document.createElement("td");
	const typeBlock = document.createElement("button");
	typeBlock.setAttribute("class", "enabled");
	typeBlock.innerText = (obj.enabled ? "dgg" : "twitch");

	//DELETE BUTTON
	const dtd = document.createElement("td");
	const deleteBlock = document.createElement("button");
	deleteBlock.setAttribute("class", "delete");
	deleteBlock.innerText = "Remove";


	channelBlock.onblur = channelBlock.onchange =
	widthBlock.onblur   = widthBlock.onchange   = (e) => {

		const obj = makeEntry(e);

		//this will return false if there have been no changes, so as to not call chrome storage all the time

		const a = findAndReplace(getSrcElement(e).getAttribute("identifier"), obj, whitelist);

		if(a){
			whitelist = a;
			pushToChromeStorage(whitelist);
			getSrcElement(e).setAttribute("identifier",obj.channel);
		}
		
	};

	typeBlock.onclick = (e) => {
		let obj = makeEntry(e);

		//toggle
		obj.enabled = !obj.enabled;

		const a = findAndReplace(getSrcElement(e).getAttribute("identifier"), obj, whitelist);

		if(a){
			whitelist = a;
			pushToChromeStorage(whitelist);
			getSrcElement(e).querySelector(".enabled").innerText = obj.enabled ? "dgg" : "twitch";
		}
	};

	deleteBlock.onclick = (e) => {
		const obj = makeEntry(e);
		
		//pass-by reference. whitelist is edited directly
		removeFromList(obj.channel, whitelist);

		pushToChromeStorage(whitelist);
		const itm = getSrcElement(e);
		
		itm.parentNode.removeChild(itm);
	};


	//APPEND THAT SHIT


	ctd.appendChild(channelBlock);
	wtd.appendChild(widthBlock);
	ttd.appendChild(typeBlock);
	dtd.appendChild(deleteBlock);

	div.appendChild(ctd);
	div.appendChild(wtd);
	div.appendChild(ttd);
	div.appendChild(dtd);

	//RETURN THAT SHIT
	return div;
}

function getSrcElement(e){
	return e.srcElement.parentNode.parentNode;
}

function makeEntry(e){
	return {
		channel: getSrcElement(e).querySelector(".channel").value,
		enabled: getSrcElement(e).querySelector(".enabled").innerText === "dgg",
		width:   getSrcElement(e).querySelector(".width").value + "px"
	};
}

function makeEvents(){
	const search = document.querySelector(".search");
	search.onkeyup = search.onblur = search.onchange = (e) => {
		
		const doms = document.querySelectorAll("#row");

		if(e.srcElement.value.length === 0){
			doms.forEach((item, i) => {
				item.setAttribute("class", "disp");
			});
		}
		else{

			let regex;
			doms.forEach((item, i) => {
				//perhaps unoptimal for performance
				regex = new RegExp(e.srcElement.value, "gim");

				if(!regex.test(item.childNodes[0].childNodes[0].value)){
					item.setAttribute("class", "ndisp");
				}
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

