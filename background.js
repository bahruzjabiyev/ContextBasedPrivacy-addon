const assignManager = {


	storageArea: {
    area: browser.storage.local,
    exemptedTabs: {},

    getSiteStoreKey(pageUrl) {
      const url = new window.URL(pageUrl);
      const storagePrefix = "siteContainerMap@@_";
      return `${storagePrefix}${url.hostname}`;
    },

    set(pageUrl, data) {
      const siteStoreKey = this.getSiteStoreKey(pageUrl);
      return this.area.set({
        [siteStoreKey]: data
      });
    },

    get(pageUrl) {
      const siteStoreKey = this.getSiteStoreKey(pageUrl);
      return new Promise((resolve, reject) => {
        this.area.get([siteStoreKey]).then((storageResponse) => {
          if (storageResponse && siteStoreKey in storageResponse) {
          	//return whatever was stored with the key
          	//in our case storageResponse[siteStoryKey] == usercontextid
            resolve(storageResponse[siteStoreKey]);
          }
          resolve(null);
        }).catch((e) => {
          reject(e);
        });
      });
    },

    getUserContextIdFromCookieStoreId(cookieStoreId) {
    	if (!cookieStoreId) {
      		return false;
    	}
    	const container = cookieStoreId.replace("firefox-container-", "");
    	if (container !== cookieStoreId) {
      		return container;
    	}
    	return false;
  	},
    
  	reloadPageInContainer(options.url, cookieStoreId, index){

  		try{

  			await creating = browser.tabs.create({
    		url:options.url,
    		cookieStoreId: cookieStoreId,
        	index

  		});
  		}

  		catch(e) {

  			console.log(e)


  		}

  	},

	async onBeforeRequest(options) {
		if (options.frameId !== 0 || options.tabId === -1) {
      		return {};
    	}

    	let topic = 'News'
    	//access storage area
    	const [tab, siteSettings] = await Promise.all([
     	 	browser.tabs.get(options.tabId),
      		this.storageArea.get(options.url)//returns sitesettings -> siteSettings is an object {userContextId:1}
   		 ]);

    	let container;
  

    	try {
      		container = await browser.contextualIdentities.get(tab.cookieStoreId);
    	} catch (e) {
    		//first time this will be set
      	container = false;
   		}

    // The container we have in the assignment map isn't present any more so lets remove it
    //   then continue the existing load

    	if (!container){
		    try {
		    	let createContext = await browser.contextualIdentities.create({name: topic, color: "purple", icon: "briefcase"});
		    	this.storageArea.set(options.url, {userContextId: this.getUserContextIdFromCookieStore(tab.cookieStoreId)})
		    	//store the siteSettings inside localstorage
		    	//this.storageArea.set(options.url, {userContextualId: something })	
		    } catch (e) {
		    	console.log(e)
		    }
		}
		    

   		this.reloadPageInContainer(options.url, tab.cookieStoreId, tab.index + 1);
 
	},
 

	init(){
		browser.webRequest.onBeforeRequest.addListener((options) => {
      		return this.onBeforeRequest(options);
		},{urls: ["<all_urls>"], types: ["main_frame"]}, ["blocking"]);

		
	},

	getTopicFromURL(url) {
	    var xhr = new XMLHttpRequest();
	    xhr.onreadystatechange = () => {
	        if (xhr.readyState == 4 && xhr.status == 200) {
	            //var response = document.querySelector('#response');
	            var response = JSON.parse(xhr.response);
	            //var resultToSpeak = `With a confidence of ${Math.round(reponse.description.captions[0].confidence * 100)}%, I think it's ${reponse.description.captions[0].text}`;
	            /*#######
				Do something with the response. Extract the topic

	            */

	            console.error(response);
	        }
	    };
	    xhr.onerror = (evt) => {
	        console.log(evt);
	    };
	    try {
	        xhr.open('POST', 'https://api.aylien.com/api/v1/classify/iab-qag');
	        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	        xhr.setRequestHeader("X-AYLIEN-TextAPI-Application-Key", "98ee53012572f0d485dab2858158da44");
	        xhr.setRequestHeader("X-AYLIEN-TextAPI-Application-ID", "021b6ba8");
	        //var requestObject = { "url": url };
	        xhr.send('url='+url);
	    }
	    catch (ex) {
	        console.log(ex);
	    }
	}


}

assignManager.init();
//assign manager is a class
//
/*function logURL(requestDetails) {
  console.log("HEHEHHEHEEHEHEHEHHEHEEH: " + requestDetails.url);
}

browser.webRequest.onBeforeRequest.addListener(
  logURL,
  {urls: ["<all_urls>"], types: ["main_frame"]}
);*/
