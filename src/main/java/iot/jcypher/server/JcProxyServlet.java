/************************************************************************
 * Copyright (c) 2016 IoT-Solutions e.U.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *  http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ************************************************************************/

package iot.jcypher.server;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.client.api.Response;
import org.eclipse.jetty.proxy.ProxyServlet;

import iot.jcypher.server.config.Neo4jConfig;

public class JcProxyServlet extends ProxyServlet {

	private static final long serialVersionUID = 1L;
	
	private static final String PROT_SEP = "//";
	private static final String HOST_SEP = "/";
	private static final String REFERER = "Referer";
	private static final String LOCATION = "Location";
	private static final String DB_MARK = "/jc__db/";
	private static final String LAST_ACTIVE = "jc_last_active";
	
	private Neo4jConfig neo4jConfig;

	public JcProxyServlet(Neo4jConfig neo4jConfig) {
		super();
		this.neo4jConfig = neo4jConfig;
	}

	@Override
	protected String rewriteTarget(HttpServletRequest clientRequest) {
		String target = clientRequest.getRequestURL().toString();
		int protIdx = target.indexOf(PROT_SEP);
		int hostIdx = target.indexOf(HOST_SEP, protIdx + PROT_SEP.length());
		String db = clientRequest.getHeader("jc_db");
		String url = null;
		if (db == null || db.trim().length() == 0) {
			int dbIdx = target.indexOf(DB_MARK);
			if (dbIdx > 0) {
				db = target.substring(dbIdx + DB_MARK.length());
				target = target.substring(0, dbIdx);
			}
		}
		ServletContext ctxt = clientRequest.getServletContext();
		if (db != null)
			ctxt.setAttribute(LAST_ACTIVE, db);
		else
			db = ctxt.getAttribute(LAST_ACTIVE).toString();
		url = this.neo4jConfig.getDBAccess(db).getUrl();
		StringBuilder trgt = new StringBuilder(url);
		if (hostIdx >= 0)
			trgt.append(target.substring(hostIdx));
        String query = clientRequest.getQueryString();
        if (query != null)
            trgt.append("?").append(query);
        return trgt.toString();
	}

	@Override
	protected void onProxyResponseSuccess(HttpServletRequest clientRequest, HttpServletResponse proxyResponse,
			Response serverResponse) {
		String refHost_Port = getHost_Port(clientRequest.getHeader(REFERER));
		String loc = proxyResponse.getHeader(LOCATION);
		if (loc != null) {
			String newLoc = replaceHost_Port(loc, refHost_Port);
			proxyResponse.setHeader(LOCATION, newLoc);
		}
		super.onProxyResponseSuccess(clientRequest, proxyResponse, serverResponse);
	}
	
	private String getHost_Port(String url) {
		int protIdx = url.indexOf(PROT_SEP);
		int hostIdx = url.indexOf(HOST_SEP, protIdx + PROT_SEP.length());
		if (hostIdx >= 0)
			return url.substring(protIdx + PROT_SEP.length(), hostIdx);
		else
			return url.substring(protIdx + PROT_SEP.length());
	}

	private String replaceHost_Port(String url, String host_port) {
		StringBuilder sb = new StringBuilder(url);
		int protIdx = url.indexOf(PROT_SEP);
		int hostIdx = url.indexOf(HOST_SEP, protIdx + PROT_SEP.length());
		hostIdx = hostIdx >= 0 ? hostIdx : url.length();
		sb.replace(protIdx + PROT_SEP.length(), hostIdx, host_port);
		return sb.toString();
	}
}
