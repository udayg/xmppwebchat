var StreamHub=function(){this.pRequestQueue=[];
this.mTopicToListener={};
this.sDomain=StreamHub.DomainUtils.extractDomain(document.domain);
this.bIsResponseIFrameConnected=false;
this.bHasRequestIFrameConnected=false;
this.connectionMonitorId=null;
this.oLogger=new StreamHub.NullLogger();
this.sUid=new Date().valueOf();
this.pConnectionListeners=[];
this.bIsRequestInProgress=false
};
StreamHub.POLLING_CONNECTION="POLL";
StreamHub.STREAMING_CONNECTION="STREAM";
StreamHub.WEB_SOCKET_CONNECTION="WEBSOCKET";
StreamHub.prototype={connect:function(A){this.sUrl=A;
this.sConnectionType=StreamHub.STREAMING_CONNECTION;
if(window.WebSocket!==undefined&&window.WebSocket!==null){this.oConnection=new StreamHub.WebSocketConnection(this)
}else{document.domain=this.sDomain;
this.oConnection=new StreamHub.CometConnection(this)
}if(A.serverList===undefined){A={serverList:[this.sUrl]};
if(arguments.length==2){A.staticUID=arguments[1]
}}if(A.serverList){this.sUid=A.staticUID||this.sUid;
this.sFailoverAlgorithm=(A.failoverAlgorithm===undefined)?"ordered":A.failoverAlgorithm;
this.nReconnectDelayMillis=this.nInitialReconnectDelayMillis=(A.initialReconnectDelayMillis===undefined)?1000:A.initialReconnectDelayMillis;
this.nMaxReconnectDelayMillis=(A.maxReconnectDelayMillis===undefined)?-1:A.maxReconnectDelayMillis;
this.nMaxReconnectAttempts=(A.maxReconnectAttempts===undefined)?-1:A.maxReconnectAttempts;
this.bExponentialBackOff=(A.useExponentialBackOff===undefined)?false:A.useExponentialBackOff;
this.nBackOffMultiplier=(A.backOffMultiplier===undefined)?1:A.backOffMultiplier;
this.sConnectionType=(A.connectionType===undefined)?StreamHub.STREAMING_CONNECTION:A.connectionType;
this.nReconnectAttempts=0;
this.pServerList=A.serverList;
this.nServerIndex=0;
this.sUrl=A.serverList[this.nServerIndex];
if(this.sFailoverAlgorithm=="priority"){this.nServerIndex=-1
}}if(window.WebSocket!==undefined&&window.WebSocket!==null){this.sConnectionType=StreamHub.WEB_SOCKET_CONNECTION
}this.doConnect(this.sUrl)
},disconnect:function(){this.oConnection.disconnect()
},subscribe:function(B,A){this.oConnection.subscribe(B,A)
},unsubscribe:function(A){this.oConnection.unsubscribe(A)
},publish:function(A,B){this.oConnection.publish(A,B)
},setLogger:function(A){if(typeof A.log!=="function"){alert("Logger must have a function called 'log'")
}else{this.oLogger=A
}},addConnectionListener:function(A){this.pConnectionListeners.push(A)
},connectFrames:function(A){if(StreamHub.Browser.isIEFamily()){if(this.sConnectionType===StreamHub.STREAMING_CONNECTION){this.eResponseIFrame=this.addIFrame({id:"responseIFrame"+new Date().valueOf(),src:""});
this.connectResponseIFrame()
}this.eRequestIFrame=this.addIFrame({id:"requestFrame"+new Date().valueOf(),src:""});
this.connectRequestIFrame()
}else{this.eContainerIFrame=this.addIFrame({id:"containerIFrame"+new Date().valueOf(),src:this.sIFrameHtmlUrl})
}},doConnect:function(A){this.preConnectCleanUp();
window.x=this.buildOnResponseData(this);
if(this.sConnectionType===StreamHub.STREAMING_CONNECTION){if(StreamHub.Browser.isFirefoxFamily()){window.l=this.buildConnectionLost(this)
}else{window.l=function(){}
}}else{if(this.sConnectionType===StreamHub.WEB_SOCKET_CONNECTION){this.webSocketConnect(A);
return 
}}window.c=this.buildConnect(this);
window.onunload=this.buildCleanUp(this);
if(StreamHub.Browser.isIEFamily()||StreamHub.Browser.isFF3()){window.r=this.buildOnRequestComplete(this)
}this.buildUrls(A);
this.connectFrames(A);
if(this.sConnectionType===StreamHub.STREAMING_CONNECTION){this.startInitialConnectMonitor()
}},buildWebSocketOnMessage:function(oHub){return function(evt){try{oHub.oLogger.log("Web Socket Message Received: ["+evt.data+"]")
}catch(e){}var oData;
try{eval("oData = "+evt.data)
}catch(e){oHub.oLogger.log("Error decoding message: ["+evt.data+"]")
}if(oData.topic&&typeof oHub.mTopicToListener[oData.topic]=="function"){oHub.mTopicToListener[oData.topic](oData.topic,oData)
}}
},webSocketConnect:function(A){this.buildWebSocketUrls(A);
this.oLogger.log("Connecting Web Socket to ["+this.sResponseUrl+"]");
var B=this;
this.bIsWsOpen=false;
this.ws=new WebSocket(this.sResponseUrl);
this.ws.onopen=function(){B.bIsWsOpen=true;
B.notifyConnectionEstablishedListeners();
B.oConnection.onConnect()
};
this.ws.onmessage=this.buildWebSocketOnMessage(B);
this.ws.onerror=function(C){B.oLogger.log("Web Sockets Error: "+C)
};
this.ws.onclose=function(){B.bIsWsOpen=false;
B.oLogger.log("Web Socket Connection Closed");
B.notifyConnectionLostListeners()
}
},logObject:function(B){var A="";
for(var C in B){A+="oObject."+C+" = ["+B[C]+"]<br />"
}this.oLogger.log(A)
},startInitialConnectMonitor:function(){var A=this;
setTimeout(function(){if(!A.isResponseIFrameConnected()&&A.bHasRequestIFrameConnected===false){A.oLogger.log("Failing over to polling connection");
A.cancelConnectionMonitor.apply(A);
A.closeResponseChannel.apply(A);
A.sConnectionType=StreamHub.POLLING_CONNECTION;
A.startPolling.apply(A)
}},2000)
},buildConnect:function(A){return function(){if(A.bConnectCalled===false){A.bConnectCalled=true;
var B=A.eContainerIFrame.contentWindow.document.getElementsByTagName("frame");
A.eRequestIFrame=B[0];
A.eResponseIFrame=B[1];
A.connectRequestIFrame.apply(A);
if(A.sConnectionType===StreamHub.STREAMING_CONNECTION){A.connectResponseIFrame.apply(A)
}}}
},addSubscriptionListeners:function(C,B){if(C instanceof Array){for(var A=0;
A<C.length;
A++){this.addTopicListener(C[A],B)
}}else{this.addTopicListener(C,B)
}},buildSubscriptionList:function(D){var B=D;
if(D instanceof Array){B="";
for(var A=0;
A<D.length;
A++){var C=D[A];
B+=C;
if(A!=(D.length-1)){B+=","
}}}return B
},connectRequestIFrame:function(){this.oLogger.log("Connecting request iFrame to "+this.sRequestUrl);
this.request(this.sRequestUrl,"Connect",this.buildConnectionResponse(this))
},connectResponseIFrame:function(){this.oLogger.log("Connecting response iFrame to "+this.sResponseUrl);
if(StreamHub.Browser.isIEFamily()){this.eResponseIFrame.src=this.sResponseUrl
}else{if(this.eContainerIFrame.contentWindow.connect===undefined){this.oLogger.log("Could not connect to response iframe");
this.reconnect();
return 
}this.eContainerIFrame.contentWindow.connect(this.sResponseUrl)
}this.startConnectionMonitor()
},setOnLoad:function(A,B){if(A.addEventListener){A.onload=B
}else{if(A.attachEvent){A.onload=null;
A.attachEvent("onload",B)
}}},addTopicListener:function(B,A){this.mTopicToListener[B]=A
},buildPollingHandler:function(oHub){return function(sTopic,sResponse){try{var pMessages=eval("("+sResponse+")");
oHub.oLogger.log("Polling response is : "+sResponse+" for topic '"+sTopic+"'. Num messages: "+pMessages.length);
for(var i=0;
i<pMessages.length;
i++){x(pMessages[i])
}}catch(e){oHub.oLogger.log("Problem parsing poll response: "+e)
}}
},buildSubscriptionResponse:function(A){return function(C,B){A.oLogger.log("Subscription response is : "+B+" for topic '"+C+"'")
}
},buildUnSubscribeResponse:function(A){return function(C,B){A.oLogger.log("Unsubscribe response is : "+B+" for topic '"+C+"'")
}
},buildPublishResponse:function(A){return function(C,B){A.oLogger.log("Publish response is : "+B+" for topic '"+C+"'")
}
},buildConnectionResponse:function(A){return function(C,B){A.bHasRequestIFrameConnected=true;
A.oLogger.log("Connection response is : "+B);
if(A.sConnectionType===StreamHub.POLLING_CONNECTION){A.startPolling.apply(A)
}}
},buildDisconnectionResponse:function(A){return function(C,B){A.oLogger.log("Disconnection response is : "+B)
}
},reconnect:function(){if(this.isDeliberateDisconnect!==true&&!this.isResponseIFrameConnected()&&(this.nMaxReconnectAttempts==-1||this.nReconnectAttempts<this.nMaxReconnectAttempts)){try{var B=this;
clearTimeout(this.reconnectorId);
if(this.bExponentialBackOff&&this.nReconnectAttempts>0){this.nReconnectDelayMillis*=this.nBackOffMultiplier;
if(this.nMaxReconnectDelayMillis!=-1&&this.nReconnectDelayMillis>this.nMaxReconnectDelayMillis){this.nReconnectDelayMillis=this.nMaxReconnectDelayMillis
}}this.oLogger.log("Attempting reconnect in "+this.nReconnectDelayMillis+"ms");
this.reconnectorId=setTimeout(function(){if((B.nMaxReconnectAttempts==-1||B.nReconnectAttempts<B.nMaxReconnectAttempts)&&!B.isResponseIFrameConnected.apply(B)){if(B.sFailoverAlgorithm=="priority"){B.nServerIndex=(B.nServerIndex+1)%B.pServerList.length
}B.doReconnection.apply(B)
}},this.nReconnectDelayMillis)
}catch(A){this.oLogger.log("Error setting interval: "+A)
}}},doReconnection:function(){var B=this.sUrl;
if(this.nServerIndex!==undefined){var A=this.pServerList.length;
if(this.sFailoverAlgorithm=="ordered"){this.nServerIndex=(this.nServerIndex+1)%A
}else{if(this.sFailoverAlgorithm=="random"){this.nServerIndex=Math.floor(Math.random()*A)
}}B=this.pServerList[this.nServerIndex]
}this.nReconnectAttempts++;
this.oLogger.log("Reconnecting... Trying "+B);
this.doConnect(B);
this.reconnect()
},onReconnect:function(){try{clearTimeout(this.reconnectorId)
}catch(A){}if(this.sFailoverAlgorithm=="priority"){this.nServerIndex=-1
}this.nReconnectAttempts=0;
this.nReconnectDelayMillis=this.nInitialReconnectDelayMillis;
this.notifyConnectionEstablishedListeners()
},buildConnectionLost:function(A){return function(){A.oLogger.log("Lost connection to server");
A.notifyConnectionLostListeners.apply(A);
A.bIsResponseIFrameConnected=false;
A.reconnect.apply(A)
}
},notifyConnectionLostListeners:function(){for(var A=0;
A<this.pConnectionListeners.length;
A++){this.pConnectionListeners[A].onConnectionLost()
}},notifyConnectionEstablishedListeners:function(){for(var A=0;
A<this.pConnectionListeners.length;
A++){this.pConnectionListeners[A].onConnectionEstablished()
}},imageRequest:function(B){var A=document.createElement("img");
A.src=B;
document.body.appendChild(A)
},request:function(B,A,C){this.pRequestQueue.push({url:B,callback:C,topic:A});
if(this.isResponseIFrameConnected()){this.processRequestQueue()
}},processRequestQueue:function(){if(this.pRequestQueue.length>0&&!this.bIsRequestInProgress){this.bIsRequestInProgress=true;
if(!StreamHub.Browser.isIEFamily()&&!StreamHub.Browser.isFF3()){this.setOnLoad(this.eRequestIFrame,this.buildOnRequestComplete(this))
}var B=this.pRequestQueue[0].url;
this.oLogger.log("Requesting: "+B);
if(StreamHub.Browser.isIEFamily()){this.eRequestIFrame.src=B
}else{try{this.eContainerIFrame.contentWindow.request(B,this)
}catch(A){this.oLogger.log("Failed requesting: "+B+". Error was: "+A+". Trying again in 1 second.");
this.bIsRequestInProgress=false;
var C=this;
setTimeout(function(){C.processRequestQueue.apply(C)
},1000)
}}}},addIFrame:function(B){var A=document;
if(StreamHub.Browser.isIEFamily()){this.createHtmlFile();
A=this.transferDoc
}var C=this.createIFrame(A,B);
A.body.appendChild(C);
return C
},createElement:function(C,A,B){var D=C.createElement(A);
D.id=B;
return D
},createIFrame:function(B,A){var C=this.createElement(B,"IFRAME",A.id);
C.style.visibility="hidden";
C.style.display="none";
C.style.height="0px";
C.style.width="0px";
C.src=A.src;
if(A.onLoadFn!==undefined){this.setOnLoad(C,A.onLoadFn)
}return C
},createHtmlFile:function(){if(this.transferDoc===undefined){this.transferDoc=new ActiveXObject("htmlfile");
this.transferDoc.open();
this.transferDoc.write("<html>");
this.transferDoc.write("<script>document.domain='"+this.sDomain+"';<\/script>");
this.transferDoc.write("</html>");
this.transferDoc.close();
this.transferDoc.parentWindow.x=x;
this.transferDoc.parentWindow.r=this.buildOnRequestComplete(this)
}},startPolling:function(){this.oLogger.log("Starting polling...");
this.stopPolling();
var A=this;
this.oPollingId=setInterval(function(){A.request(A.sPollingUrl,"poll",A.buildPollingHandler(A))
},1000)
},stopPolling:function(){if(this.oPollingId!==undefined){clearInterval(this.oPollingId)
}},startConnectionMonitor:function(){if(StreamHub.Browser.isWebkitFamily()){this.setOnLoad(this.eResponseIFrame,this.buildConnectionLost(this))
}else{this.startDefaultConnectionMonitor(this)
}},startDefaultConnectionMonitor:function(A){if(A.connectionMonitorId==null){A.connectionMonitorId=setInterval(function(){var B=A.getIFrameReadyState(A.eResponseIFrame);
if(B=="complete"){clearInterval(A.connectionMonitorId);
A.connectionMonitorId=null;
(A.buildConnectionLost(A))()
}},1000)
}},closeResponseChannel:function(){this.oLogger.log("Closing response channel");
this.eResponseIFrame.src=this.sCloseResponseUrl
},cancelConnectionMonitor:function(){if(StreamHub.Browser.isWebkitFamily()){this.setOnLoad(this.eResponseIFrame,null)
}else{clearInterval(this.connectionMonitorId);
this.connectionMonitorId=null
}},getIFrameReadyState:function(B){if(StreamHub.Browser.isIEFamily()){return B.readyState
}try{return B.readyState||B.contentWindow.document.readyState
}catch(A){return"complete"
}},isResponseIFrameConnected:function(){return this.bIsResponseIFrameConnected||this.sConnectionType===StreamHub.POLLING_CONNECTION
},buildOnResponseData:function(A){return function(C){try{A.oLogger.log("onResponseData via response iFrame : ["+C+"]")
}catch(B){}if(C.topic&&typeof A.mTopicToListener[C.topic]=="function"){A.mTopicToListener[C.topic](C.topic,C)
}else{if(A.isResponseIFrameConnectionOk(C)){A.bIsResponseIFrameConnected=true;
A.eBlankIFrame=A.addIFrame({id:"blankIFrame"+new Date().valueOf(),src:"about:blank"});
A.onReconnect.apply(A);
A.processRequestQueue()
}}}
},isResponseIFrameConnectionOk:function(A){return A.toString().indexOf("response OK")>-1
},buildUrls:function(A){var B=new Date().valueOf();
this.sIFrameHtmlUrl=A+"iframe.html?uid="+this.sUid+"&domain="+this.sDomain+"&r="+B;
this.sRequestUrl=A+"request/?uid="+this.sUid+"&domain="+this.sDomain+"&r="+B;
this.sResponseUrl=A+"response/?uid="+this.sUid+"&domain="+this.sDomain+"&r="+B;
this.sPublishUrl=A+"publish/?uid="+this.sUid+"&domain="+this.sDomain+"&r="+B;
this.sSubscribeUrl=A+"subscribe/?uid="+this.sUid+"&domain="+this.sDomain+"&r="+B;
this.sUnSubscribeUrl=A+"unsubscribe/?uid="+this.sUid+"&domain="+this.sDomain+"&r="+B;
this.sDisconnectUrl=A+"disconnect/?uid="+this.sUid+"&domain="+this.sDomain+"&r="+B;
this.sCloseResponseUrl=A+"closeresponse/?uid="+this.sUid+"&domain="+this.sDomain+"&r="+B;
this.sPollingUrl=A+"poll/?uid="+this.sUid+"&domain="+this.sDomain+"&r="+B
},buildWebSocketUrls:function(A){var B=new Date().valueOf();
A=A.replace(/^http(s)?:\/\//,"ws://");
this.oLogger.log("sUrl = ["+A+"]");
if(A.lastIndexOf("/")===A.length-1){A=A.substring(0,A.length-1);
this.sResponseUrl=A+"ws/"
}else{this.sResponseUrl=A+"ws/"
}},buildOnRequestComplete:function(A){return function(){var C=A.pRequestQueue[0];
var B=null;
try{B=A.eRequestIFrame.contentWindow.document.body.innerHTML
}catch(D){A.oLogger.log("buildOnRequestComplete(): Error getting iFrame contents for url ["+C.url+"]: "+D)
}if(C!==undefined&&B!==null){C.callback(C.topic,B);
A.pRequestQueue.shift()
}A.bIsRequestInProgress=false;
A.processRequestQueue()
}
},preConnectCleanUp:function(){(this.buildCleanUp(this))()
},removeIFrame:function(B){if(B!==undefined&&B!==null){B.src="";
if(B.contentWindow!==undefined&&B.contentWindow!==null){B.contentWindow.document.close()
}if(B.parentNode!==undefined&&B.parentNode!==null){var A=B.parentNode.removeChild(B)
}B=null
}},buildCleanUp:function(A){return function(){try{if(A.isDeliberateDisconnect===false){A.imageRequest(A.sDisconnectUrl)
}A.bConnectCalled=false;
if(A.pRequestQueue!==undefined&&A.pRequestQueue.length>0){A.pRequestQueue=[]
}A.removeIFrame(A.eRequestIFrame);
A.removeIFrame(A.eResponseIFrame);
A.removeIFrame(A.eContainerIFrame);
A.removeIFrame(A.eBlankIFrame);
if(A.tranferDoc!==undefined){A.transferDoc=null
}if(window.x){window.x=null
}if(window.r){window.r=null
}if(window.CollectGarbage){CollectGarbage()
}}catch(C){try{A.oLogger.log("Error during cleanup '"+C+"'")
}catch(B){}}}
}};
StreamHub.ConnectionListener=function(){};
StreamHub.ConnectionListener.prototype={onConnectionEstablished:function(){},onConnectionLost:function(){}};
StreamHub.Browser={isWebkitFamily:function(){return navigator.userAgent.indexOf("WebKit/")>-1
},isIEFamily:function(){return navigator.userAgent.indexOf("MSIE")>-1
},isFirefoxFamily:function(){return navigator.userAgent.indexOf("Firefox/")>-1
},isFF3:function(){return navigator.userAgent.indexOf("Firefox/3")>-1
},isSafari:function(){return navigator.userAgent.indexOf("Safari/")>-1&&navigator.userAgent.indexOf("Chrome/")<0
},isChrome:function(){return navigator.userAgent.indexOf("Chrome/")>-1
},isIE6:function(){return navigator.userAgent.indexOf("MSIE 6")>-1
},isIE7:function(){return navigator.userAgent.indexOf("MSIE 7")>-1
},isIE8:function(){return navigator.userAgent.indexOf("MSIE 8")>-1
}};
StreamHub.ElementLogger=function(A){this.oDoc=document;
this.eLogContainer=this.oDoc.getElementById(A.elementId)
};
StreamHub.ElementLogger.prototype={log:function(B){var A=this.oDoc.createElement("DIV");
A.innerHTML=B;
this.eLogContainer.appendChild(A)
}};
StreamHub.NullLogger=function(){};
StreamHub.NullLogger.prototype={log:function(){}};
StreamHub.CountLogger=function(A){this.nCount=0;
this.eLogContainer=document.getElementById(A.elementId)
};
StreamHub.CountLogger.prototype={log:function(A){this.eLogContainer.innerHTML=(++this.nCount)+" messages logged"
}};
StreamHub.WebSocketConnection=function(A){this.oHub=A;
this.pMessageQueue=[]
};
StreamHub.WebSocketConnection.prototype={disconnect:function(){this.oHub.oLogger.log("Disconnecting");
this.oHub.isDeliberateDisconnect=true;
this.send("disconnect")
},subscribe:function(C,B){this.oHub.addSubscriptionListeners(C,B);
var A=this.oHub.buildSubscriptionList(C);
this.send("subscribe="+A)
},unsubscribe:function(B){var A=this.oHub.buildSubscriptionList(B);
this.send("unsubscribe="+A)
},publish:function(B,C){var A="publish("+B+","+C+")";
this.send(A)
},send:function(A){if(this.oHub.bIsWsOpen===true){this.oHub.oLogger.log("Sending WebSocket message: ["+A+"]");
this.oHub.ws.send(A)
}else{this.oHub.oLogger.log("Queueing WebSocket message: ["+A+"]");
this.pMessageQueue.push(A)
}},onConnect:function(){this.oHub.oLogger.log("Web Socket connected");
this.send("uid="+this.oHub.sUid);
this.sendQueuedMessages()
},sendQueuedMessages:function(){for(var A=0;
A<this.pMessageQueue.length;
A++){this.send(this.pMessageQueue[A])
}}};
StreamHub.CometConnection=function(A){this.oHub=A
};
StreamHub.CometConnection.prototype={disconnect:function(){this.oHub.oLogger.log("Disconnecting");
this.oHub.stopPolling.call(this.oHub);
this.oHub.request(this.oHub.sDisconnectUrl,"disconnect",this.oHub.buildDisconnectionResponse(this.oHub));
this.oHub.isDeliberateDisconnect=true
},subscribe:function(D,C){this.oHub.addSubscriptionListeners(D,C);
var B=this.oHub.buildSubscriptionList(D);
var A=this.oHub.sSubscribeUrl+"&topic="+B;
this.oHub.request(A,B,this.oHub.buildSubscriptionResponse(this.oHub))
},unsubscribe:function(C){var A=this.oHub.buildSubscriptionList(C);
var B=this.oHub.sUnSubscribeUrl+"&topic="+A;
this.oHub.request(B,A,this.oHub.buildUnSubscribeResponse(this.oHub))
},publish:function(A,C){var B=this.oHub.sPublishUrl+"&topic="+A+"&payload="+encodeURIComponent(C);
this.oHub.oLogger.log("Publishing to "+B);
this.oHub.request(B,A,this.oHub.buildPublishResponse(this.oHub))
}};
StreamHub.DomainUtils={pTLDs:["com","net","org","gov","co"],pNumbers:["0","1","2","3","4","5","6","7","8","9"],extractDomain:function(B){var C=B.charAt(B.length-1);
if(StreamHub.DomainUtils.isNumeric(C)){return B
}var D=B.split(".");
var E=D.length-2;
if(StreamHub.DomainUtils.isTLD(D[E])&&D.length>2){E=D.length-3
}var A=D.length-E;
return D.splice(E,A).join(".")
},isNumeric:function(B){for(var A=0;
A<StreamHub.DomainUtils.pNumbers.length;
A++){if(B===StreamHub.DomainUtils.pNumbers[A]){return true
}}return false
},isTLD:function(B){for(var A=0;
A<StreamHub.DomainUtils.pTLDs.length;
A++){if(B===StreamHub.DomainUtils.pTLDs[A]){return true
}}return false
}};