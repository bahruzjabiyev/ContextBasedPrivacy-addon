const assignManager = {

	NEW_TAB_PAGES: new Set([
	    "about:startpage",
	    "about:newtab",
	    "about:home",
	    "about:blank"
  	]),

  	ifResponseNotRedirection(pageurl){
  		return new Promise((resolve, reject) => {
  			let xhr = new XMLHttpRequest;
  			try {
  				xhr.open('GET', pageurl, true);
  				xhr.send();
  			} catch (e) {
  				reject(e);
  			}
  			
  			xhr.onerror = (evt) => {
	        	reject(evt);
	    	};
	    
  			xhr.onreadystatechange = function () {
			  if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			  	if(pageurl == xhr.responseURL){
			  		resolve(pageurl);
			  	}
			  }
			};
  		});
  	},

  	onError(e) {
	  console.error(e);
	},


	async onBeforeRequest(options) {
		if (options.frameId !== 0 || options.tabId === -1) {
      		return {};
    	}

    	//console.error(options.url);
    	let linkCategory, _name, _color, _icon, _csid; // csid is short of cookieStoreId 
    	this.ifResponseNotRedirection(options.url).then((req_url) => {
    		if (req_url.search("https") !== -1){
    			linkCategory = "Secure";
    		} else linkCategory = "Insecure";
    		//console.error(`This link category is: ${linkCategory}`);
    		browser.contextualIdentities.query({name: linkCategory}).then((cids) => { //cids is short for contextualIdentities
    			if (cids.length === 0){
    				console.error(`There is no such a container: ${linkCategory}`);
    				
    				if (linkCategory == "Secure"){
    					_name = "Secure";
    					_color = "blue";
    					_icon = "fingerprint";
    				} else {
    					_name = "Insecure";
    					_color = "red";
    					_icon = "circle";
    				}

    				browser.contextualIdentities.create({
					  name: _name,
					  color: _color,
					  icon: _icon
					}).then((cid) => {
						console.error(`Created the category with CID: ${cid.cookieStoreId}`);  //Secure => firefox-container-144
					}, this.onError);
    			} else {
    				//console.error(`Site has the CID: ${cids[0].cookieStoreId}`);
    				_csid = cids[0].cookieStoreId;
    			}
    		}, this.onError);
    		
    		browser.tabs.get(options.tabId).then((tab) => {
    			if(tab.cookieStoreId !== _csid){
	    			browser.tabs.create({
	    				url: options.url,
	    				cookieStoreId: _csid,
	    				index: tab.index + 1
	    			}).then((new_tab) => {
			  			console.error(`A new tab of ${new_tab.url} created at tabindex ${new_tab.index}`);
			  		}).catch((ex) => {
			  			
			  		});	
		  		}

		  		if (this.NEW_TAB_PAGES.has(tab.url) || tab.cookieStoreId !== _csid){
		  			//console.error(tab.url);
		  			browser.tabs.remove(tab.id);
		  		}
    		}, this.onError);

    	}, this.onError);


 
	},

	init(){
		browser.webRequest.onBeforeRequest.addListener((options) => {
      		return this.onBeforeRequest(options);
		},{urls: ["<all_urls>"], types: ["main_frame"]}, ["blocking"]);
		//this.createContainer();
		
	},

	identifyContext(url) {
	    var xhr = new XMLHttpRequest();
	    xhr.onreadystatechange = () => {
	        if (xhr.readyState == 4 && xhr.status == 200) {
	            var response = JSON.parse(xhr.response);
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
	        xhr.send('url='+url);
	    }
	    catch (ex) {
	        console.log(ex);
	    }
	}

}
assignManager.init();
