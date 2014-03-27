<!--
  Copyright (C) 2011  Adam Hocek. Contact: ahocek@gmail.com, Udaya K Ghattamaneni. 
  Contact: ghattamaneni.uday@gmail.com 
  
  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.
  
  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301 USA
-->
<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@ page import="edu.maristit.xmppwebchat.*,java.util.*" %>
<%@ page import="org.cometd.bayeux.server.BayeuxServer,org.cometd.server.*" %>
<html>
    <head>
        <title>Chat</title>
         <link rel="stylesheet" type="text/css" href="css/jquery.autocomplete.css" />
        <script type="text/javascript" src="jquery/jquery-1.6.2.js"></script>
        <script type="text/javascript" src="jquery/json2.js"></script>
        <script type="text/javascript" src="org/cometd.js"></script>
        <script type="text/javascript" src="jquery/jquery.cometd.js"></script>
        <!--script type="text/javascript" src="js/jquery-ui-1.8.14.custom.min.js"></script-->
        <script type='text/javascript' src='js/jquery.autocomplete.js'></script>
        <!--script type='text/javascript' src='js/lib/jquery.bgiframe.min.js'></script-->
        <script type='text/javascript' src='js/lib/jquery.ajaxQueue.js'></script>
        
        <script src="jquery-ui-1.8.16/external/jquery.bgiframe-2.1.2.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.ui.core.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.ui.widget.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.ui.mouse.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.ui.draggable.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.ui.position.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.ui.tabs.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.ui.resizable.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.ui.dialog.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.effects.core.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.effects.blind.js"></script>
        <script src="jquery-ui-1.8.16/ui/jquery.effects.explode.js"></script>
        <!--link rel="stylesheet" href="jquery-ui-1.8.16/demos/demos.css"/-->
        <!--link rel="stylesheet" href="jquery-ui-1.8.16/themes/base/jquery.ui.all.css"/-->
         <link type="text/css" href="css/redmond/jquery-ui-1.8.14.custom.css" rel="stylesheet" />
       <link type="text/css" href="chatMain.css" rel="stylesheet" />
        
        <script type="text/javascript">
           
        </script>

        <script type="text/javascript">
	
            <%
                //System.out.println( "Evaluating date now" );
                //Date date = new Date();

                String userName = request.getParameter("userName");
                String password = request.getParameter("password");
                String domain = request.getParameter("domain");
                userName = userName.trim().toLowerCase();
                domain = domain.trim().toLowerCase();
                if (!userName.contains("@")) {
                    userName = userName + "@" + domain;
                }
                out.println("var chatRoomName = \"" + userName + "\";");
                out.println("var domainName = \"" + domain + "\";");
                org.cometd.bayeux.server.BayeuxServer b = (BayeuxServer) getServletContext().getAttribute(BayeuxServer.ATTRIBUTE);

                List<edu.maristit.xmppwebchat.XmppManager> XMPPConnections = null;
                if (session.getAttribute("xmppConns") != null) {
                    XMPPConnections = (List<edu.maristit.xmppwebchat.XmppManager>) session.getAttribute("xmppConns");
                }
                if (XMPPConnections == null) {
                    XMPPConnections = new ArrayList<edu.maristit.xmppwebchat.XmppManager>();
                }
                boolean found = false;
                for (int i = 0; i < XMPPConnections.size(); i++) {
                    edu.maristit.xmppwebchat.XmppManager xmppManagerTemp = XMPPConnections.get(i);
                    try {
                        if (xmppManagerTemp.getUserName().equalsIgnoreCase(userName)) {
                            //xmppManagerTemp.destroy();
                            //xmppManagerTemp.getChatListener().sendHistory();
                            userName=xmppManagerTemp.getUserName();
                            found = true;
                            if(xmppManagerTemp.getConnection()==null){
                                XMPPConnections.remove(xmppManagerTemp);
                                found = false;
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                }
                if (!found) {
                    if (domain == null || domain.toString().equals("")) {
                        domain = "";
                    }
                    XmppManager xmppManager1 = null;
                    if (domain.toString().equalsIgnoreCase("gmail.com")) {
                        xmppManager1 = new XmppManager(domain, b);
                    } else {
                        xmppManager1 = new XmppManager(domain, 5222, b);
                    }

                    try {
                        if (domain.toString().equalsIgnoreCase("chat.facebook.com")) {
                            xmppManager1.init(request.getParameter("userName").trim().toLowerCase(), password);
                            xmppManager1.setStatus(true, "");
                        } else {
                            xmppManager1.init(userName, password);
                            xmppManager1.setStatus(true, "");
                        }

                        XMPPConnections.add(xmppManager1);
                        session.setAttribute("xmppConns", XMPPConnections);
                        out.println("var userName='" + userName + "';");
                    } catch (Exception e) {
                        String redirectURL = "error.jsp";
                        e.printStackTrace();
                        response.sendRedirect(redirectURL + "?msg=Login Failed!!");
                    }
                }
            %>
               
                /************/
                //dojo.require("dojox.cometd");
                var config = {
                    contextPath: '${pageContext.request.contextPath}'
                };
                // var cometd = dojox.cometd;
               var imagesPath="images"
        </script>
        <script src="chatMain.js"></script>
        <style>
            
        </style>
    </head>
    <body onunload="">
        <div style ="font-size:150%;">
            <img id="myStatusImg" width='17px' height='17px' src='images/available.ico'/> <%=userName%>
            <select style="align:bottom;background:url('images/dropdown.ico');background-size:12px 12px;background-repeat:no-repeat;padding-left:20px;position:relative;z-index:9;width:7px;height:15px" id="mode" onchange="changeStatus()" >
                <option style="background:url('images/available.ico');background-repeat:no-repeat;background-size:15px 15px;" value="available">Available</option>
                <option style="background:url('images/busy.ico');background-repeat:no-repeat;background-size:15px 15px;" value="dnd">Busy</option>
                <option style="background:url('images/away.ico');background-repeat:no-repeat;background-size:15px 15px;" value="away">Away</away>
            </select>
            <input type="button" value="Sign out" onclick="logoff()"><br/>
            <span style ="font-size:80%;">Status: <input style="border: 1px solid #006;font-size:80%;" type="text" id="status">
                <input type="button" value="Change" onclick="changeStatus()">
            </span>
        </div>
        <br/>
        <div style="width:1000px">
            <% if (!domain.equalsIgnoreCase("chat.facebook.com")) {
            %>
            <fieldset>
                <legend>Add User</legend>
                <label>UserName:</label><input type="text" id="newEmail"><br/>
                <!--NewUserName:<input type="text" id="newName"><br/>-->
                <label>Group:</label><input type="text" id="newGroup"><br/>
                Enter group names separated by comma (,) <br/>
                <input type="button" value="Add" onclick="addUser()">
            </fieldset>
            <% if (!domain.equalsIgnoreCase("gmail.com")) {
            %>
            <fieldset>
                <legend>Chat Room</legend>
                <label>Room:</label><input type="text" id="roomName">
                <label>Server:</label><input type="text" id="server" value=""><br/>
                <label>Users to Invite:</label><input type="text" id="usersInvite">
                <input type="button" value="Start" onclick="startConf()"><br/>
            </fieldset>
            <% }
                }%>
        </div>
        <div >
            <div id="tabs">
                <ul>
                    <li><a href="#main">Contacts</a></li>
                </ul>
                <div id="main">
                    <div id="notaccordion">
                        <h3 ><a href="#">DEFAULT</a></h3>
                        <div id="USER_GROUP_" style="display: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--<textarea id="chatMessages" rows="1" cols="1" style="position: absolute;visiblity: hidden"></textarea>-->
    </div>
    <div id='GROUPS_LIST'>
    </div>
    <div id='body' style ="font-size:80%">
    </div>
    <div style ="font-size:90%;position:relative;top:105%;left:40%;">
        © Copyright 2012 Marist College,
        XMPPWebChat 1.2
    </div>
</body>
<script>

    function titleAlert(i){
        var flag = 0;
        $('#tabs ul li a').each(function(){
            var url = $(this).attr('className');
            var tit="";		
            if(url=="chatAlert"){
                flag=1;
		
            }
        });
        if(flag==1){
            if(i == 0){
                tit = "Chat";
                i = 1;
            }
            else if(i == 1){
                tit = "**Chat**";
                i = 0;
            }
            document.title = tit;
        }else{
            document.title = "Chat";
        }
        timer = window.setTimeout("titleAlert("+i+")",500);
    }
    titleAlert(1);

</script>

</html>

