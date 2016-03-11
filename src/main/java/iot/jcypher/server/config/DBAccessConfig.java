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

package iot.jcypher.server.config;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import com.fasterxml.jackson.annotation.JsonProperty;

import iot.jcypher.database.DBAccessFactory;
import iot.jcypher.database.DBProperties;
import iot.jcypher.database.DBType;
import iot.jcypher.database.IDBAccess;
import iot.jcypher.domain.IDomainAccessFactory;
import iot.jcypher.domain.IGenericDomainAccess;
import iot.jcypher.server.resources.Neo4jDBInfo;

public class DBAccessConfig {

	private String name;
	private String url;
	private String userId;
	private String password;
	private IDBAccess dbAccess;
	private Map<String, IGenericDomainAccess> domainAccessMap;
	
	@JsonProperty
	public String getName() {
		return name;
	}
	
	@JsonProperty
	public void setName(String name) {
		this.name = name;
	}
	
	@JsonProperty
	public String getUrl() {
		return url;
	}
	
	@JsonProperty
	public void setUrl(String url) {
		this.url = url;
	}
	
	@JsonProperty
	public String getUserId() {
		return userId;
	}

	@JsonProperty
	public void setUserId(String userId) {
		this.userId = userId;
	}

	@JsonProperty
	public String getPassword() {
		return password;
	}

	@JsonProperty
	public void setPassword(String password) {
		this.password = password;
	}

	public IDBAccess getDBAccess() {
		if (this.dbAccess == null) {
			Properties props = new Properties();
			
			props.setProperty(DBProperties.SERVER_ROOT_URI, getUrl());
			
			if (this.userId != null && this.password != null)
				dbAccess = DBAccessFactory.createDBAccess(DBType.REMOTE, props, userId, password);
			else
				dbAccess = DBAccessFactory.createDBAccess(DBType.REMOTE, props);
		}
		return dbAccess;
	}
	
	public IGenericDomainAccess getDomainAccess(String domainName) {
		if (this.domainAccessMap == null)
			this.domainAccessMap = new HashMap<String, IGenericDomainAccess>();
		IGenericDomainAccess da = this.domainAccessMap.get(domainName);
		if (da == null) {
			da = IDomainAccessFactory.INSTANCE.createGenericDomainAccess(getDBAccess(), domainName);
			this.domainAccessMap.put(domainName, da);
		}
		return da;
	}
	
	public void clearDomainCache() {
		this.domainAccessMap = null;
	}
	
	public Neo4jDBInfo getDBInfo() {
		Neo4jDBInfo ret = new Neo4jDBInfo();
		ret.setName(name);
		ret.setUrl(url);
		return ret;
	}
}
