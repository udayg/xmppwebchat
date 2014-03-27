<!--
  Copyright (C) 2011  Adam Hocek. Contact: ahocek@gmail.com,  Udaya K Ghattamaneni. 
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
<%@ page import="java.io.*" %>
<%@ page import="java.net.*" %>
<%@ page import="java.util.*" %>
<%@ page import="org.apache.commons.fileupload.*" %>
<%@ page import="org.apache.commons.fileupload.servlet.*" %>
<%@ page import="org.apache.commons.fileupload.disk.*" %>

<%
    boolean isMultipart = ServletFileUpload.isMultipartContent(request);

// check if the http request is a multipart request
// with other words check that the http request can have uploaded files
    if (isMultipart) {

        // String base_directory = "temp";

        // Create a factory for disk-based file items
        FileItemFactory factory = new DiskFileItemFactory();
        String user = request.getParameter("userName");
        // Create a new file upload handler
        ServletFileUpload servletFileUpload = new ServletFileUpload(factory);

        // Set upload parameters
        // See Apache Commons FileUpload for more information
        // http://jakarta.apache.org/commons/fileupload/using.html
        servletFileUpload.setSizeMax(-1);

        try {

            String directory = "";

            // Parse the request
            List items = servletFileUpload.parseRequest(request);

            // Process the uploaded items
            Iterator iter = items.iterator();

            while (iter.hasNext()) {
                FileItem item = (FileItem) iter.next();

                // the param tag directory is sent as a request parameter to the server
                // check if the upload directory is available
                if (item.isFormField()) {

                    String name = item.getFieldName();

                    if (name.equalsIgnoreCase("userName")) {

                        user = item.getString();
                    }

                    // retrieve the files
                } else {

                    try {
                        String itemName = item.getName();
                        if (!itemName.equals("")) {
                            File savedFile = new File(config.getServletContext().getRealPath("/") + "tmp/" + itemName);
                            item.write(savedFile);
                            out.println("<input type=\"hidden\" name=\"fileName\" value=\"" + itemName + "\" />");
                            out.println("<script>parent.sendFile('" + itemName + "','" + user + "');window.location='uploadIndex.jsp?userName=" + user + "';</script>");
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        out.println("<script>window.location='uploadIndex.jsp?userName=" + user + "'</script>");
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
%>

