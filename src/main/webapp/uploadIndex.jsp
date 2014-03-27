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
<html>
<body>
<form action="upload.jsp" method="post" enctype="multipart/form-data" name="form1" id="form1">
<%
String user =  request.getParameter("userName");
out.println("<input type='hidden' name='userName' value='"+user+"'/>");
%>
<input type="file" name="file" id="file" /><input type="submit" value="Send" />
</form> 
</body>
<html>
