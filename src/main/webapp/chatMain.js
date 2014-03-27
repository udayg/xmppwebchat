/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
$.fx.speeds._default = 1000;
            
$(function() {
                
    var $tabs =$( "#tabs" ).tabs();
		
    $( "#tabs" ).tabs( "option", "tabTemplate", "<li><a class='chatAlert' id='tag-\#{href}' href='\#{href}'>\#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>" );
		
    $( "#tabs span.ui-icon-close" ).live( "click", function() {
        var index = $( "li", $tabs ).index( $( this ).parent() );
        $tabs.tabs( "remove", index );
    });

    $( "#tabs" ).bind('tabsselect',
        function(event, ui) {
            if(ui.index>0){
                var i = ui.tab.href.substr(ui.tab.href.length-1);
                //alert(i); 
                //focusText(i);
                //alert(ui.tab.className);
                ui.tab.className="";
            //alert($('#tabs').getTabs());
            }
        });
});

var counter = 1;
var cometd = $.cometd;
var focusedWindow=0;
            
/*************/
function logoff(){
    var userNameJson = {
        logout:'true'
    };
    cometd.publish("/"+chatRoomName, userNameJson);
    //hub.unsubscribe(chatRoomName);
    cometd.disconnect();
    alert("Logging out "+chatRoomName);
    window.location = "logout.jsp?userName="+chatRoomName;
}
                


function getBuddies()
{
    cometd.publish("/"+chatRoomName, {
        request:'USERS'
    });
// alert("getting buddies");
}
function chatUpdated(data) {
    //alert("data:"+data.data);
    data=data.data;
    if (!!data.chat) {
        //	chatMessagesBox.value += "\n" + data.user + ": " + data.chat;
                        
        openChatTab(data.user,'false');
        updateChat(data.user,data.user,data.chat,'true');
    } else if(!!data.confChat) {
        //alert("confchat");
        if(!document.getElementById('GROUPCHATINDEX_'+data.roomName)){
            addChatRoom(data.roomName,data.server);
        }
        openGroupChatTab(data.roomName,'false');
        updateChat(data.fromUser,data.roomName,data.confChat,'true');

    } else if (!!data.buddyStatus) {
        //	chatMessagesBox.value += "\n>>>" + data.user+"<-changed to->"+data.buddyStatus;
        eval("buddyStatus="+data.buddyStatus);
        var x = document.getElementsByName('USER_STATUS_'+buddyStatus.email)
        if(x.length==0) 
            addAutomaticUser(buddyStatus.email);
        for(var y=0;y<x.length;y++){
            var img = x[y].childNodes[0];
			
            if(buddyStatus.presence.indexOf("dnd")!=-1){
                img.src=imagesPath+"/busy.ico";
            }else if (buddyStatus.presence.indexOf("away")!=-1){
                img.src=imagesPath+"/away.ico";				
            }else if (buddyStatus.presence=="unavailable"){
                img.src=imagesPath+"/unavailable.ico";
            }else if (buddyStatus.presence.indexOf("available")!=-1){
                img.src=imagesPath+"/available.ico";
            }
            var statusDiv = x[y].getElementsByTagName("span");
            for(var i=0;i<statusDiv.length;i++){
                if(statusDiv[i].id=="STATUS"){
                    if (buddyStatus.status.length>0) buddyStatus.status="( "+buddyStatus.status+" )";
                    statusDiv[i].innerHTML=buddyStatus.status;
                }
            }
            document.getElementById("USER_STATUS_IMG_POPUP_"+buddyStatus.email).src=img.src;
        }
    }else if (!!data.groups) {
        //alert("Groups"+data.data.groups);
        eval("groups="+data.groups);
        $("#newGroup").autocomplete(groups, {
            multiple: true,
            autoFill: true,
            minChars: 0,
            width: 310,
            matchContains: true,
            highlightItem: false
        });
        var mainDiv = document.getElementById('notaccordion');
        for(var i=0;i< groups.length;i++){
	
            if(groups[i]!=""){
                //alert(""+groups[i]);
                var divGroup = "<h3><a href='#'>"+groups[i]+"</a></h3><div style='display: none;' id='USER_GROUP_"+groups[i]+"' ></div>";
                mainDiv.innerHTML=mainDiv.innerHTML+divGroup;			
            }

        }
        $("#notaccordion").addClass("ui-accordion ui-widget ui-helper-reset ui-accordion-icons")
        .find("h3")
        .addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom")
        .prepend('<span class="ui-icon ui-icon-triangle-1-e"/ >')
        .click(function() {
            $(this).toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom")
            .find("> .ui-icon").toggleClass("ui-icon-triangle-1-s")
            .end().next().toggleClass("ui-accordion-content-active ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom").toggle();
            return false;
        });

    }else if (!!data.buddies) {
			
        eval("buddies="+data.buddies);
        //alert("buddies"+data.buddies);
        $("#usersInvite").autocomplete(buddies, {
            multiple: true,
            autoFill: true,
            minChars: 0,
            width: 310,
            matchContains: true,
            highlightItem: false,
            formatItem: function(row) {
                return row.email;
            },
            formatResult: function(row) {
                return row.email;
            }
        });
        eval("allUsers="+data.allUsers);
        $("#newEmail").autocomplete(allUsers, {
            minChars: 0,
            width: 310,
            matchContains: true,
            highlightItem: false,
            formatItem: function(row, i, max, term) {
                return row.name.replace(new RegExp("(" + term + ")", "gi"), "<strong>$1</strong>") + "<br><span style='font-size: 80%;'>Email: &lt;" + row.email + "&gt;</span>";
            },
            formatResult: function(row) {
                return row.email;
            }
        });

			
			
			
        for(var i=0;i< buddies.length;i++){
            //alert("User:"+buddies[i].email+" belongs to :"+buddies[i].group.length);
            if(buddies[i].group.length==0){
                var mainDiv = document.getElementById('USER_GROUP_');
                //alert(buddies[i].presence);
                var presence="unavailable";
                if(buddies[i].presence.indexOf("dnd")!=-1){
                    presence="busy";
                }else if (buddies[i].presence.indexOf("away")!=-1){
                    presence="away";
                }else if (buddies[i].presence=="unavailable"){
                    presence="unavailable";
                }else if (buddies[i].presence.indexOf("available")!=-1){
                    presence="available";
                }
                if (buddies[i].status.length>0) buddies[i].status="( "+buddies[i].status+" )";
                var newdiv = document.createElement('div');
                newdiv.setAttribute('id','USER_STATUS_'+buddies[i].email);
                newdiv.setAttribute('name','USER_STATUS_'+buddies[i].email);
                newdiv.setAttribute('style','cursor:pointer;cursor:hand');
                newdiv.innerHTML = "<img src='"+imagesPath+"/"+presence+".ico' id='USER_IMG' width='17px' height='17px' >"
                +" <span id='USER_NAME' style='vertical-align:top' onclick='openChatTab(\""+buddies[i].email+"\",\"true\")'>"+buddies[i].name
                +"</span> <span id='STATUS' style='vertical-align:top'>"+buddies[i].status+"</span>"
                +"<img src='"+imagesPath+"/delete-icon.png' alt='Delete' onclick='removeUser(\""+buddies[i].email+"\",\"\")'>"
                +"<input type='hidden' id='TABINDEX' value='"+counter+"'>";
                mainDiv.appendChild(newdiv);
            }else{
                for(var j=0;j< buddies[i].group.length;j++){
                    var mainDiv = document.getElementById('USER_GROUP_'+buddies[i].group[j]);
                    //alert(buddies[i].presence);
                    var presence="unavailable";
                    if(buddies[i].presence.indexOf("dnd")!=-1){
                        presence="busy";
                    }else if (buddies[i].presence.indexOf("away")!=-1){
                        presence="away";
                    }else if (buddies[i].presence=="unavailable"){
                        presence="unavailable";
                    }else if (buddies[i].presence.indexOf("available")!=-1){
                        presence="available";
                    }
                    if (buddies[i].status.length>0) buddies[i].status="( "+buddies[i].status+" )";
                    var newdiv = document.createElement('div');
                    newdiv.setAttribute('id','USER_STATUS_'+buddies[i].email);
                    newdiv.setAttribute('name','USER_STATUS_'+buddies[i].email);
                    newdiv.setAttribute('style','cursor:pointer;cursor:hand');
                    newdiv.innerHTML = "<img src='"+imagesPath+"/"+presence+".ico' id='USER_IMG' width='17px' height='17px' >"
                    +" <span id='USER_NAME' style='vertical-align:top' onclick='openChatTab(\""+buddies[i].email+"\",\"true\")'>"+buddies[i].name
                    +"</span> <span id='STATUS' style='vertical-align:top'>"+buddies[i].status+"</span>"
                    +"<img src='"+imagesPath+"/delete-icon.png' alt='Delete' onclick='removeUser(\""+buddies[i].email+"\",\""+buddies[i].group[j]+"\")'>"
                    +"<input type='hidden' id='TABINDEX' value='"+counter+"'>";
                    mainDiv.appendChild(newdiv);
                }
            }
            counter++;
        }
    } else{
        //                        var tabsOpen = document.getElementsByName("sendButton");
        //                        val i=0;
        //alert("history");     
        var history = eval('(' +data+ ')');
        for(var i=0;i< history.length;i++){
            //alert("User:"+buddies[i].email+" belongs to :"+buddies[i].group.length);
            //alert(history[i].name);
            openChatTab(history[i].name,history[i].open);
            if(history[i].type=='conference'){
                if(!document.getElementById('GROUPCHATINDEX_'+history[i].name)){
                   addChatRoom(history[i].name,history[i].server);
                 }
                updateChat(history[i].name,history[i].name,history[i].confChat,history[i].open);
            }else
                updateChat(history[i].name,history[i].name,history[i].chat,history[i].open);
        }
                         
    }

//chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
}
	
function chat(username) {
    //var username = document.getElementById('touser').value;
    if(document.getElementById('GROUPCHATINDEX_'+username)){
        groupChat(username);
    }else{
        var message = document.getElementById(username+'_ChatText').value;
        var json = {
            chat:  escapeQuotes(message)  ,
            touser: escapeQuotes(username)
            };
        cometd.publish("/"+chatRoomName, json);
        document.getElementById(username+'_ChatText').value="";
        updateChat(chatRoomName,username,message,'true');
    }
}
function sendFileMessage(username,file) {
    //var username = document.getElementById('touser').value;
    var message = "Sent a file: <a href='tmp/"+file+"' target='_blank' >"+file+"</a>";
    if(document.getElementById('GROUPCHATINDEX_'+username)){
        var server = document.getElementById('GROUPCHATSERVER_'+username).value;
        var statusJson = {
            confMessage:escapeQuotes(message) ,
            confName:username,
            confServer:server
        };
        cometd.publish("/"+chatRoomName, statusJson);
    //document.getElementById(room+'_ChatText').value="";
    }else{
        //var message = document.getElementById(username+'_ChatText').value;
        var json = {
            chat:  escapeQuotes(message)  ,
            touser: escapeQuotes(username)
            };
        cometd.publish("/"+chatRoomName, json);
        //document.getElementById(username+'_ChatText').value="";
        updateChat(chatRoomName,username,message,'true');
    }
}
function groupChat(room){
    var message = document.getElementById(room+'_ChatText').value;
    //var room = document.getElementById('roomName').value;
    var server = document.getElementById('GROUPCHATSERVER_'+room).value;
    var statusJson = {
        confMessage:escapeQuotes(message) ,
        confName:room,
        confServer:server
    };
    cometd.publish("/"+chatRoomName, statusJson);
    document.getElementById(room+'_ChatText').value="";

}
function updateChat(fromUser,inUser,chat,flag){
    //alert(user+":"+chat);
    // var index = getMyTab(inUser);
    if(!$( "#"+escape_selector(inUser) ).dialog( "isOpen" )){
        newChatPopup(inUser,flag);
    }
    if(document.getElementById(inUser+"_ChatMessages")){
        var chatArea = document.getElementById(inUser+"_ChatMessages");
        //                    if(document.getElementById('tab-'+index)){
        //                        var chatArea = document.getElementById('tab-'+index).getElementsByTagName("DIV");
        //alert(chatArea[0]);
        //alert("called");
        var currentTime = new Date();
        var month = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        chatArea.innerHTML+="<br/><b>"+"("+month+"/"+day+"/"+year+" "+hours+":"+minutes+":"+seconds+") "+getDisplayName(fromUser) + ":</b> "
        +"<span style='font-style:oblique'>"+ chat+"</span>";
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    var index = getMyTab(inUser);
    if(index!=focusedWindow){
        document.getElementById('ui-dialog-title-'+inUser).className="chatAlert";
    }
//----
//var selected = $( "#tabs" ).tabs('option', 'selected');
		
// var thisIndex = getIndexForId("tab-"+index);
//alert(selected+";"+thisIndex);
//                    if(selected!=thisIndex)
//                        document.getElementById('tag-#tab-'+index).className="chatAlert";
		
}
function updateConfChat(fromUser,roomName,chat){
    //alert(fromUser+":"+chat+":"+roomName);
    var index = document.getElementById('GROUPCHATINDEX_'+roomName).value;
    //alert(index);
    if(document.getElementById('tab-'+index)){
        var chatArea = document.getElementById('tab-'+index).getElementsByTagName("DIV");
        //alert(chatArea[0]);
        //alert("called");
        var currentTime = new Date();
        var month = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        chatArea[0].innerHTML+="<br/><b>"+"("+month+"/"+day+"/"+year+" "+hours+":"+minutes+":"+seconds+") "+fromUser + ":</b> " + chat;
        chatArea[0].scrollTop = chatArea[0].scrollHeight;
    }
		
    var selected = $( "#tabs" ).tabs('option', 'selected');
		
    var thisIndex = getIndexForId("tab-"+index);
    //alert(selected+";"+thisIndex);
    if(selected!=thisIndex)
        document.getElementById('tag-#tab-'+index).className="chatAlert";
		
}
function getIndexForId(searchId){     
    var $MainTabs = $("#tabs").tabs();                                                                                       
    var existingIndex = $MainTabs.tabs('option','selected');                                                                  
    var myIndex = $MainTabs.tabs("select",
        searchId).tabs('option','selected');                                            
    $MainTabs.tabs("select", existingIndex);                                                                                
    return myIndex;
} 
//                function changeUserName() {
//                    var userName = document.getElementById('userName').value;
//                    if (userName != null && userName.length > 0) {
//                        var userNameJson = {user: escapeQuotes(userName) };
//                        cometd.publish("/"+chatRoomName, userNameJson);
//                        hub.unsubscribe(chatRoomName);
//                        chatRoomName = userName;
//                        hub.subscribe(chatRoomName, chatUpdated);
//                    }
//                }
function changeStatus() {
    var status1 = document.getElementById('status').value;
		
    //if (status == null) {
		
    var mode1 = document.getElementById('mode').value;
    var statusJson = {
        status: escapeQuotes(status1),
        mode:mode1
    };
    cometd.publish("/"+chatRoomName, statusJson);
		
    var statusImg = document.getElementById('myStatusImg');
    if(mode1=="dnd"){
        statusImg.src=imagesPath+"/busy.ico";
    }else if (mode1=="away"){
        statusImg.src=imagesPath+"/away.ico";				
    }else if (mode1=="available"){
        statusImg.src=imagesPath+"/available.ico";
    }

}
function changeStatusText(e){
    var e = e || event;
    var key = e.keyCode || e.charCode;
    if(key == 13){
        changeStatus();
    }
    return true;
}
function removeUser(email,group){
    //alert('remove'+email);
    var r=confirm("Confirm Removing User "+email+" from your contacts");
    if (r==true){
        var statusJson = {
            removeUser: escapeQuotes(email)
            };
        cometd.publish("/"+chatRoomName, statusJson);

        var x = document.getElementsByName('USER_STATUS_'+email);
        for(var y=0;x.length!=0;){
            x[y].parentNode.removeChild(x[y]);
        }
    }
}
function addUser(){
    var newEmail = document.getElementById('newEmail').value;
    //var newName = document.getElementById('newName').value;
    var newGroup = document.getElementById('newGroup').value;
    var groups = newGroup.split(",");
    if(newEmail.indexOf("@")==-1)
        newEmail = newEmail+"@"+domainName;
    //var newGroup = '';
    //if (status == null) {
    var x = document.getElementsByName('USER_STATUS_'+newEmail);
    for(var y=0;x.length!=0;){
        x[y].parentNode.removeChild(x[y]);
    }
    var mode = document.getElementById('mode').value;
    var statusJson = {
        addUser:escapeQuotes(newEmail) ,
        name:newEmail,
        groups:newGroup
    };
    cometd.publish("/"+chatRoomName, statusJson);
    var presence="unavailable";
    if(groups.length==0){
        var mainDiv = document.getElementById('USER_GROUP_');		
        var newdiv = document.createElement('div');
        newdiv.setAttribute('id','USER_STATUS_'+newEmail);
        newdiv.setAttribute('name','USER_STATUS_'+newEmail);
        newdiv.setAttribute('style','cursor:pointer;cursor:hand');
        newdiv.innerHTML = "<img src='"+imagesPath+"/"+presence+".ico' id='USER_IMG' width='17px' height='17px' >"
        +" <span id='USER_NAME' style='vertical-align:top' onclick='openChatTab(\""+newEmail+"\",\"true\")'>"+newEmail
        +"</span> <span id='STATUS' style='vertical-align:top'></span><img src='"+imagesPath+"/delete-icon.png' alt='Delete' onclick='removeUser(\""+newEmail+"\",\"\")'>"
        +"<input type='hidden' id='TABINDEX' value='"+counter+"'>";
        mainDiv.appendChild(newdiv);
    }else{
        for(var i=0;i<groups.length;i++){
            groups[i]=$.trim(groups[i]);
            if(!document.getElementById('USER_GROUP_'+groups[i])){
                var mainDiv = document.getElementById('notaccordion');
                var divGroup = "<h3><a href='#'>"+groups[i]+"</a></h3><div style='display: none;' id='USER_GROUP_"+groups[i]+"' ></div>";
                mainDiv.innerHTML=mainDiv.innerHTML+divGroup;			

                $("#notaccordion").addClass("ui-accordion ui-widget ui-helper-reset ui-accordion-icons")
                .find("h3")
                .addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom")
                .prepend('<span class="ui-icon ui-icon-triangle-1-e"/ >')
                .click(function() {
                    $(this).toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom")
                    .find("> .ui-icon").toggleClass("ui-icon-triangle-1-s")
                    .end().next().toggleClass("ui-accordion-content-active ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom").toggle();
                    return false;
                });
            }
            var mainDiv = document.getElementById('USER_GROUP_'+groups[i]);		
            var newdiv = document.createElement('div');
            newdiv.setAttribute('id','USER_STATUS_'+newEmail);
            newdiv.setAttribute('name','USER_STATUS_'+newEmail);
            newdiv.setAttribute('style','cursor:pointer;cursor:hand');
            newdiv.innerHTML = "<img src='"+imagesPath+"/"+presence+".ico' id='USER_IMG' width='17px' height='17px' >"
            +" <span id='USER_NAME' style='vertical-align:top' onclick='openChatTab(\""+newEmail+"\",\"true\")'>"+newEmail
            +"</span> <span id='STATUS' style='vertical-align:top'></span><img src='"+imagesPath+"/delete-icon.png' alt='Delete' onclick='removeUser(\""+newEmail+"\",\""+groups[i]+"\")'>"
            +"<input type='hidden' id='TABINDEX' value='"+counter+"'>";
            mainDiv.appendChild(newdiv);
        }
    }
    counter++;
}
function addAutomaticUser(newEmail){
		
    //if (status == null) {
	
    var presence="unavailable";
    var mainDiv = document.getElementById('USER_GROUP_');		
    var newdiv = document.createElement('div');
    newdiv.setAttribute('id','USER_STATUS_'+newEmail);
    newdiv.setAttribute('name','USER_STATUS_'+newEmail);
    newdiv.setAttribute('style','cursor:pointer;cursor:hand');
    newdiv.innerHTML = "<img src='"+imagesPath+"/"+presence+".ico' id='USER_IMG' width='17px' height='17px' >"
    +" <span id='USER_NAME' style='vertical-align:top' onclick='openChatTab(\""+newEmail+"\",\"true\")'>"+newEmail
    +"</span> <span id='STATUS' style='vertical-align:top'></span><img src='"+imagesPath+"/delete-icon.png' alt='Delete' onclick='removeUser(\""+newEmail+"\",\"\")'>"
    +"<input type='hidden' id='TABINDEX' value='"+counter+"'>";
    mainDiv.appendChild(newdiv);
    counter++;
}
function addChatRoom(roomName,server){
    var mainDiv = document.getElementById('GROUPS_LIST');	
    mainDiv.innerHTML = mainDiv.innerHTML+"<input type='hidden' id='GROUPCHATINDEX_"+roomName+"' value='"+counter+"'>";
    mainDiv.innerHTML = mainDiv.innerHTML+"<input type='hidden' id='GROUPCHATSERVER_"+roomName+"' value='"+server+"'>";
    counter++;
		
}
function removeChatRoom(roomName){
    var input = document.getElementById('GROUPCHATINDEX_'+roomName);	
    input.parentNode.removeChild(input);
}
function escapeQuotes(sString) {
    return sString.replace(/(\')/gi, "\\$1").replace(/(\\\\\')/gi, "\\'");
}
	
function checkForEnter(e,userName){
    var e = e || event;
    var key = e.keyCode || e.charCode;
    if(key == 13){
        chat(userName);
    }
    return true;
}
               
function getMyTab(userName){
    var index=0;
    if(document.getElementById('USER_STATUS_'+userName)){
        var statusDiv = document.getElementById('USER_STATUS_'+userName).getElementsByTagName("input");
        for(var i=0;i<statusDiv.length;i++){
            if(statusDiv[i].id=="TABINDEX"){
                index=statusDiv[i].value;
                break;
            }
        }
        //return index;
    }else{
        if(document.getElementById('UROUPCHATINDEX_'+userName))
            index = document.getElementById('GROUPCHATINDEX_'+userName).value;
    }
    return index;
}
function getDisplayName(userName){
    if(document.getElementById('USER_STATUS_'+userName)){
        var statusDiv = document.getElementById('USER_STATUS_'+userName).getElementsByTagName("span");
        var displayName=userName;
        for(var i=0;i<statusDiv.length;i++){
            if(statusDiv[i].id=="USER_NAME"){
                displayName=statusDiv[i].innerHTML;
                break;
            }
        }
        return displayName;
    }
    return userName;
}
function openGroupChatTab(roomName,open){
		
    //var index = document.getElementById('GROUPCHATINDEX_'+roomName).value;

    //                    if(document.getElementById('tab-'+index)){
    //                        if(open){
    //                            focusTab(index);
    //                        }
    //                    }else{
    //newChatTab(roomName,index,open,roomName);
    newChatPopup(roomName,open);

//                        var parent =document.getElementById('tab-'+index);
//                        parent.innerHTML= parent.innerHTML+"<input type='text' id='"+roomName+"_joinUsers' >"
//                            +"<input type='button' value='Invite' onclick='invite(\""+roomName+"\")'>"
//                    }
}


function openChatTab(userName,open){

    var index = getMyTab(userName);

    if(document.getElementById('tab-'+index)){
        if(open){
            focusTab(index);
        }
    }else{
        // newChatTab(userName,index,open,displayName)

        newChatPopup(userName,open);
    }
}
function focusTab(index){
    $( "#tabs" ).tabs('select', index);
    focusText(index);
}
function focusText(index){
    var statusDiv = document.getElementById('tab-'+index).getElementsByTagName("input");
    for(var i=0;i<statusDiv.length;i++){
        if(statusDiv[i].type=='text'){
            statusDiv[i].focus();
            break;
        }
    }
}
function newChatTab(userName,index,open,displayName){
	
    $( "#tabs" ).tabs( "add" ,'#tab-'+index,displayName);
			
    var x = document.getElementsByName('USER_STATUS_'+userName)
			
    for(var y=0;y<x.length;y++){
        var statusDiv = x[y].getElementsByTagName("input");
        for(var i=0;i<statusDiv.length;i++){
            if(statusDiv[i].id=="TABINDEX"){
                statusDiv[i].value=index;
                break;
            }
        }
    }
    if(document.getElementById('tab-'+index)){
        (document.getElementById('tab-'+index)).innerHTML="<DIV id='"+userName+"_ChatMessages' style='width:100%;height:200px;overflow:auto;-webkit-box-shadow: 10px 10px 5px #888888;box-shadow: 2px 2px 1px #888888;border:1px solid black;'></DIV>"
        +"<br><input type='text' id='"+userName+"_ChatText' size='50' onkeypress='checkForEnter(event,\""+userName+"\")'>"
        +"<input type='button' name='sendButton' value='Send' onclick='chat(\""+userName+"\")'><br/><br/> ";
    //                        if(domainName!='gmail.com' && domainName!='chat.facebook.com')
    //                            (document.getElementById('tab-'+index)).innerHTML +="Send File:<br/><iframe src='uploadIndex.jsp?userName="+userName+"' frameborder='0' scrolling='no' width='400' height='50'></iframe>";
    }
    if(open){
        focusTab(index);
    }
}
                
function newChatPopup(userName,open){
    // if(message.data.greeting){
                       
    //var name = (message.data.greeting).split(" : "); 
    //$('body').append('<div>'+name[0]+' ::: ' + message.data.greeting + '</div>');
    if(userName==chatRoomName) return;
    var presence = "";
    if(document.getElementById('USER_STATUS_'+userName)){
        var x = document.getElementById('USER_STATUS_'+userName);
        var img = x.childNodes[0];
        presence = "<img src='"+img.src+"' id='USER_STATUS_IMG_POPUP_"+userName+"' width='17px' height='17px' style='position:relative;top:3px'>&nbsp;";
    }                        
                        
    var id = escape_selector(userName);
    if(!document.getElementById(userName)){ 
        // alert(getDisplayName(userName));
        var newDiv = document.createElement('div');
        newDiv.setAttribute("id", ""+userName);
        newDiv.setAttribute("title", presence
            +getDisplayName(userName));
        newDiv.setAttribute("style", "width:800px");
        newDiv.innerHTML = "<div id='"+userName+"_ChatMessages' style='width:100%;height:150px;overflow:auto;-webkit-box-shadow: 10px 10px 5px #888888;box-shadow: 2px 2px 1px #888888;border:1px solid black;'>"+
        "</div><br/><input type='text'  size='30' id='"+userName+"_ChatText'"+
        " onkeypress='checkForEnter(event,\""+userName+"\")'/>"+
        "<input type='button' value='Send' onclick='chat(\""+userName+"\")'/><br/><br/>";
        //                             newDiv.innerHTML +="Send File:<br/><iframe src='uploadIndex.jsp?userName="+userName
        //                                 +"' frameborder='0' scrolling='no' width='350' height='40'></iframe>";
        //alert(parent.document.getElementById('body'))
        parent.document.getElementById("body").appendChild(newDiv);
        document.getElementById(userName+"_ChatMessages").scrollTop = document.getElementById(userName+"_ChatMessages").scrollHeight;
                            
        var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],x=w.innerWidth||e.clientWidth||g.clientWidth,y=w.innerHeight||e.clientHeight||g.clientHeight;
        var index = getMyTab(userName);
                            
        var currX=(x/2)+(index*20)-250;
        var currY=(y/2)+(index*30)-200;
        focusedWindow=index;
        parent.$( "#"+id ).dialog({
            autoOpen: false,
            width: 500,
            show: "blind",
            hide: "explode",
            position: [currX,currY],
            close: function(event, ui) { 
                var json = {
                    closeChat:userName
                };
                cometd.publish("/"+chatRoomName, json);
            },
            focus: function(event, ui) { 
                //alert("Earlier focus"+focusedWindow+",currently"+index);
                document.getElementById('ui-dialog-title-'+userName).className="";
                focusedWindow=index;
            },
            dragStop: function(event, ui) {
                var position = parent.$( "#"+id ).dialog( "option", "position" );
                var json = {
                    moveChat:userName,
                    X:position[0],
                    Y:position[1]
                };
                cometd.publish("/"+chatRoomName, json);
            }
        });
                            
    //parent.$( "#"+id ).dialog( "open" );
    }
    if(!parent.$( "#"+id ).dialog( "isOpen" ) && open=="true"){
        parent.$( "#"+id).dialog( "open" );
        var json = {
            openChat:userName
        };
        cometd.publish("/"+chatRoomName, json);
    }
// $('#BODY_'+userName).append('<div>' + message.data.greeting + '</div>');
                        
// }
}
function escape_selector (str) {
    return str.replace(/\./gi,'\\.').replace(/\@/gi,'\\@');
}
function startConf(){
    var room = document.getElementById('roomName').value;
    var users = $.trim(document.getElementById('usersInvite').value);
    var server = document.getElementById('server').value;
    //alert(users);
    var invi = users.split(",");
    var emails ="";
    for(var i=0;i<invi.length;i++){
        if($.trim(invi[i])!=""){
            if(invi[i].indexOf("@")==-1)
                emails = emails+$.trim(invi[i])+"@"+domainName;
            else
                emails = emails+$.trim(invi[i]);
            if((i+1)<invi.length)
                emails = emails+"|";
        }
    }	
    var statusJson = {
        startConf:escapeQuotes(room) ,
        confUsers:emails,
        confServer:server
    };
    cometd.publish("/"+chatRoomName, statusJson);
    addChatRoom(room,server);
    openGroupChatTab(room,'true');
}
	
function invite(room){
    var txt = $.trim(document.getElementById(room+'_joinUsers').value);
    var invi = txt.split(",");
    var emails ="";
    for(var i=0;i<invi.length;i++){
        if($.trim(invi[i])!=""){
            if(invi[i].indexOf("@")==-1)
                emails = emails+$.trim(invi[i])+"@"+domainName;
            else
                emails = emails+$.trim(invi[i]);
            if((i+1)<invi.length)
                emails = emails+"|";
        }
    }	
    var statusJson = {
        inviteConf: escapeQuotes(room),
        confUsers:emails
    };
    cometd.publish("/"+chatRoomName, statusJson);
    document.getElementById(room+'_joinUsers').value="";
}
function sendFile(file,user){
	
    //alert(file+"-"+user);
    // var user = document.getElementById('FILEFRAME_'+selected).name;
    //alert(file);
    //alert(user);
    sendFileMessage(user,file) 
}
//alert(chatRoomName);
               
                
$(document).ready(function()
{
    var _connected = false;
    function _connectionSucceeded()
    {
        var d=new Date();
        $('#body').innerHTML += "<br/>Connected At:"+d;
    }

    function _connectionBroken()
    {
        var d=new Date();
        $('#body').innerHTML  += "<br/>Connection Broken At:"+d;
    // logoff();
    }

    function _metaConnect(message)
    {
        var wasConnected = _connected;
        _connected = message.successful === true;
        if (!wasConnected && _connected)
        {
            _connectionSucceeded();
        }
        else if (wasConnected && !_connected)
        {
            _connectionBroken();
        }
    }
                 
    // Function invoked when first contacting the server and
    // when the server has lost the state of this client
    function _metaHandshake(handshake)
    {
        if (handshake.successful === true)
        {
            cometd.batch(function()
            {
                //alert("Subscribing to channel"+chatRoomName);
                cometd.subscribe("/"+chatRoomName, chatUpdated);
            // Publish on a service channel since the message is for the server only
            //cometd.publish('/service/user', {name: 'User'});
            });
        }
    }

    /**/
    // Disconnect when the page unloads
    //dojo.addOnUnload(function()
    $(window).unload(function()
    {
        //logoff();
        cometd.disconnect();
    //alert("unloading");
    });

    var cometURL = config.contextPath + "/cometd";
    //alert(cometURL);
    cometd.configure({
        url: cometURL,
        logLevel: 'debug',
        backoffIncrement: 1000,
        maxBackoff: 60000
    });

    cometd.addListener('/meta/connect', _metaConnect);
    cometd.addListener('/meta/handshake', _metaHandshake);
    cometd.handshake();
    getBuddies();
//cometd.subscribe("/"+chatRoomName, chatUpdated);
});