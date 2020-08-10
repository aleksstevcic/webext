function removeFromList(name, list){
	let templist;
	if(!list)
		templist = whitelist;
	else
		templist = list;

	for(let i=0; i<templist.length; i++){
		if(templist[i].channel === name){
			templist.splice(i, 1);
			i-=1;
		}
	}

	console.log(list);
	console.log(templist);

	return templist;
}

//had to make this function because i have no idea what the fuck is wrong with my code and it keeps adding isTwitch to random fucking entries
//is pass by reference, no need to return, it will do it all automatically
function trimName(arr, str){
	for(let i=0; i<arr.length; i++){
		if(arr[i].hasOwnProperty(str)){
			if(!arr[i].hasOwnProperty("enabled")){
				arr.splice(i, 1);
				//go back because fuck logic
				//no but seriously, splicing shifts everything ahead of it up one, so we want to go back one to really be where we were before
				i=-1;
			}
			else{
				delete arr[i][str];
			}
		}
	}
}

function findAndReplace(name, obj, source){
	let tempsource = source;
	let found = false;
	for(let i=0; i<source.length; i++){
		
		if(source[i].channel === name){
			if(obj.channel != source[i].channel){
				tempsource[i] = obj;
				found = true;
			}
			else if(obj.width != source[i].width || obj.enabled != source[i].enabled){
				tempsource[i] = obj;
				found = true;
			}
		}

	}

	trimName(tempsource, "isTwitch");
	if(found)
		return tempsource;
	else
		return false;
}

function pushToChromeStorage(obj){
	chrome.storage.sync.set({"--dgg--Whitelist": obj}, () => {
		//if(!found) chrome.runtime.sendMessage({message: "--dgg--enableIcon"}, () => {});
		//else chrome.runtime.sendMessage({message: "--dgg--disableIcon"}, () => {});
	});
}

function exists(name, list){
	for(let i=0; i<list.length; i++){
		if(list[i].channel === name)
			return true;
	}
	return false;
}

function getTwitch(){
	const isTwitch = document.querySelector("meta[property^='og:site_name']") ? (document.querySelector("meta[property^='og:site_name']").getAttribute("content") == "Twitch") : null;
	let channelName = null;
	if(document.querySelector("meta[property^='og:url']")){
		let htmlname = document.querySelector("meta[property^='og:url']").getAttribute("content").split("twitch.tv/")[1];
		let href = window.location.href;

		if(href.indexOf(htmlname) > -1)
			channelName = htmlname;
		else //janky. can be exploited
			channelName = href.split("twitch.tv/")[1];
	}
	return obj = {
		isTwitch: (isTwitch) ? true : false,
		channel: (channelName) ? channelName: null
	};
}