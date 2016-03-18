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

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import iot.jcypher.server.resources.Neo4jDBInfo;

public class Neo4jConfig {

	private List<DBAccessConfig> neo4jConnections = new ArrayList<DBAccessConfig>();
	private boolean prettyJSON = false;

	@JsonProperty("neo4jConnections")
	public List<DBAccessConfig> getNeo4jConnection() {
		return neo4jConnections;
	}

	@JsonProperty("neo4jConnections")
	public void setNeo4jConnection(List<DBAccessConfig> neo4jConns) {
		this.neo4jConnections = neo4jConns;
	}

	@JsonProperty
	public boolean isPrettyJSON() {
		return prettyJSON;
	}

	@JsonProperty
	public void setPrettyJSON(boolean prettyJSON) {
		this.prettyJSON = prettyJSON;
	}

	/**
	 * database id is case insensitive
	 * @param dbId
	 * @return
	 */
	public DBAccessConfig getDBAccess(String dbId) {
		for (DBAccessConfig cfg : this.neo4jConnections) {
			if (cfg.getName().equalsIgnoreCase(dbId))
				return cfg;
		}
		return null;
	}
	
	public List<Neo4jDBInfo> getDBInfos() {
		List<Neo4jDBInfo> ret = new ArrayList<Neo4jDBInfo>();
		for (DBAccessConfig ac : this.neo4jConnections) {
			Neo4jDBInfo dbi = ac.getDBInfo();
			ret.add(dbi);
		}
		return ret;
	}
}
