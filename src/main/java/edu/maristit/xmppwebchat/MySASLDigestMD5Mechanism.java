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

import java.io.IOException;

import java.util.HashMap;

import javax.security.auth.callback.CallbackHandler;

import javax.security.sasl.Sasl;

import org.jivesoftware.smack.SASLAuthentication;

import org.jivesoftware.smack.XMPPException;

import org.jivesoftware.smack.sasl.SASLMechanism;

import org.jivesoftware.smack.packet.Packet;

import org.jivesoftware.smack.util.Base64;

public class MySASLDigestMD5Mechanism extends SASLMechanism {

    public MySASLDigestMD5Mechanism(SASLAuthentication saslAuthentication) {

        super(saslAuthentication);

    }

    @Override
    protected void authenticate()
            throws IOException, XMPPException {

        String mechanisms[] = {
            getName()
        };

        java.util.Map props = new HashMap();

        sc = Sasl.createSaslClient(mechanisms, null, "xmpp", hostname, props, this);

        super.authenticate();

    }

    @Override
    public void authenticate(String username, String host, String password)
            throws IOException, XMPPException {

        authenticationId = username;

        this.password = password;

        hostname = host;

        String mechanisms[] = {
            getName()
        };

        java.util.Map props = new HashMap();

        sc = Sasl.createSaslClient(mechanisms, null, "xmpp", host, props, this);

        super.authenticate();

    }

    @Override
    public void authenticate(String username, String host, CallbackHandler cbh)
            throws IOException, XMPPException {

        String mechanisms[] = {
            getName()
        };

        java.util.Map props = new HashMap();

        sc = Sasl.createSaslClient(mechanisms, null, "xmpp", host, props, cbh);

        super.authenticate();

    }

    @Override
    protected String getName() {

        return "DIGEST-MD5";

    }

    @Override
    public void challengeReceived(String challenge)
            throws IOException {

        byte response[];

        if (challenge != null) {
            response = sc.evaluateChallenge(Base64.decode(challenge));
        } else {
            response = sc.evaluateChallenge(new byte[0]);
        }

        Packet responseStanza;

        if (response == null) {
            responseStanza = new Response();
        } else {
            responseStanza = new Response(Base64.encodeBytes(response, Base64.DONT_BREAK_LINES));
        }

        getSASLAuthentication().send(responseStanza);

    }
}
