/**
 * Copyright (C) 2011  Adam Hocek. Contact: ahocek@gmail.com,  Udaya K Ghattamaneni. 
 * Contact: ghattamaneni.uday@gmail.com 
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301 USA
 */
package edu.maristit.xmppwebchat;

import java.io.Serializable;
import org.cometd.bayeux.server.BayeuxServer;
import org.jivesoftware.smack.ConnectionConfiguration;
import org.jivesoftware.smack.SASLAuthentication;
import org.jivesoftware.smack.SmackConfiguration;
import org.jivesoftware.smack.XMPPConnection;
import org.jivesoftware.smack.packet.Presence;
import org.jivesoftware.smack.packet.Presence.Type;

public class XmppManager implements Serializable{

    private static final int packetReplyTimeout = 1000; // millis
    private String server;
    private int port;
    private String service;
    private ConnectionConfiguration config;
    private XMPPConnection connection;
    private String userName;
    private BayeuxServer b;
    private ChatListener chatListener;

    public XmppManager(String server, BayeuxServer b) {
        this.server = server;
        this.port = -1;
        this.service = null;
        this.b = b;
    }

    public XmppManager(String server, int port, BayeuxServer b) {
        this.server = server;
        this.port = port;
        this.service = null;
        this.b = b;
    }

    public XmppManager(String server, int port, String service, BayeuxServer b) {
        this.server = server;
        this.port = port;
        this.service = service;
        this.b = b;
    }

    public void init(String username, String password) throws Exception {


        System.out.println(String.format("Initializing connection to server %1$s port %2$d", server, port));

        SmackConfiguration.setPacketReplyTimeout(packetReplyTimeout);
        if (service == null) {
            config = new ConnectionConfiguration(server, port);
        } else {
            config = new ConnectionConfiguration(server, port, service);
        }
        if (server.equalsIgnoreCase("chat.facebook.com")) {
            System.out.println("SASL Enbaled!");
            SASLAuthentication.registerSASLMechanism("DIGEST-MD5", MySASLDigestMD5Mechanism.class);
            config = new ConnectionConfiguration("chat.facebook.com", 5222);
            config.setRosterLoadedAtLogin(true);
            config.setSASLAuthenticationEnabled(true);
        } else if (server.equalsIgnoreCase("gmail.com")) {
            config = new ConnectionConfiguration("talk.google.com", 5222, "gmail.com");
            config.setSASLAuthenticationEnabled(false);
        }
        if (port == -1) {
            connection = new XMPPConnection(server);
        } else {
            connection = new XMPPConnection(config);
        }

        connection.connect();

        if (!username.equals("")) {
            connection.login(username, password);
        }
        this.userName = username;
        if (server.equalsIgnoreCase("chat.facebook.com")) {
            setChatListener(new ChatListener(b, username + "@chat.facebook.com"));
        } else {
            setChatListener(new ChatListener(b, username));
        }
        getChatListener().init(connection);
        connection.getChatManager().addChatListener(getChatListener());

    }

    public void setStatus(boolean available, String status) {

        Presence.Type type = available ? Type.available : Type.unavailable;
        Presence presence = new Presence(type);
        presence.setMode(Presence.Mode.available);
        presence.setStatus(status);
        connection.sendPacket(presence);

    }

    public void destroy() {
        try {

            if (connection != null) {
                connection.getChatManager().removeChatListener(getChatListener());
            }
            if (getChatListener() != null) {
                getChatListener().destroy();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public XMPPConnection getConnection() {
        if (connection != null && connection.isConnected()) {
            //connection.disconnect();
            return connection;
        }
        return null;
    }

    public String getUserName() {
        return this.userName;
    }

    /**
     * @return the chatListener
     */
    public ChatListener getChatListener() {
        return chatListener;
    }

    /**
     * @param chatListener the chatListener to set
     */
    public void setChatListener(ChatListener chatListener) {
        this.chatListener = chatListener;
    }
}
