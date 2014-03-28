XMPPWebChat
===========

XMPPWebChat is a Web Application which enables chat in a webpage and is capable to connect with any standard XMPP chat servers and enable chat related features. Currently it can be used to connect Gtalk and Facebook chat which are widely used chat servers and use XMPP standards.

####Introduction
The client-side implementation is based on jquery (dojox), while the server-side java implementation is based on [Cometd](http://cometd.org/) push technology. 


You can download the War archive from this [Google code repository](https://xmppwebchat.googlecode.com/files/XMPPWebChat-1.2.war)  and deploy in your application server(Tested on Tomcat). After successful deploy browse through the application (eg: http://localhost:8080/XMPPWebChat-1.2/ )which will take you to the login page.


####Features 
  * Point-to-Point Instant Messaging
  * Chat room support
  * Change presence status (e.g. available, busy ,…)
  * Custom presence status
  * Auto accept invitation requests
  * Auto log off user from any active session upon logging into a new session
  * Search capability with user name auto complete
  * File transfer capability


####To Do
  * add support for IE browser
  * allow users to be added to groups with delta (right now you must re-enter all groups that a user belongs to,)
 

Note: This project is developed at [Marist College](http://marist.edu) as a working proof of concept to use [Comet](http://en.wikipedia.org/wiki/Comet_%28programming%29) to see push notifications for any web based applications. To make it more useful application we planned to build xmpp client which is web based. 

