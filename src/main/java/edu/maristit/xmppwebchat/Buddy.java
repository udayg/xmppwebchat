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

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringEscapeUtils;
import org.json.JSONArray;

public class Buddy extends Object {

    private String name;
    private String email;
    private String presence;
    private String status;
    private List<String> group;

    public Buddy(String name, String email, String presence) {
        this.name = name;
        this.email = email;
        this.presence = presence;
        this.status = "";
        this.group = new ArrayList<String>();
    }

    public Buddy(String name, String email, String presence, List<String> group) {
        this.name = name;
        this.email = email;
        this.presence = presence;
        this.status = "";
        this.group = group;
    }

    @Override
    public String toString() {
        if(this.name==null) this.name=this.email;
        if(this.email==null) this.email="";
        if(this.presence==null) this.presence="";
        if(this.status==null) this.status="";
        if(this.group==null) this.group= new ArrayList<String>();
        //StringEscapeUtils utils = new StringEscapeUtils();
        return "{ 'name' : '" + this.name.replaceAll("'", "\\\\'") + "'," + "'email' : '" + this.email
                + "'," + " 'presence' : '" + this.presence + "',"
                + "'status' : '" + StringEscapeUtils.escapeJavaScript(this.status) + "', 'group' : " + new JSONArray(this.group) + " }";
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPresence() {
        return presence;
    }

    public void setPresence(String presence) {
        this.presence = presence;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getGroup() {
        return group;
    }

    public void setGroup(List<String> group) {
        this.group = group;
    }
}
