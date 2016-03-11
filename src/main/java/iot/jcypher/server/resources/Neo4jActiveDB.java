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

package iot.jcypher.server.resources;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;

import com.codahale.metrics.annotation.Timed;

import iot.jcypher.server.config.DBAccessConfig;
import iot.jcypher.server.config.Neo4jConfig;

@Path("/{dbId}")
@Produces(MediaType.APPLICATION_JSON)
public class Neo4jActiveDB {

	private Neo4jConfig neo4jConfig;

	public Neo4jActiveDB(Neo4jConfig neo4jConfig) {
		super();
		this.neo4jConfig = neo4jConfig;
	}
	
	@POST
    @Timed
	public String selectDB(@PathParam("dbId") String dbId) throws Exception {
		DBAccessConfig dba = this.neo4jConfig.getDBAccess(dbId);
		if (dba == null)
			throw new WebApplicationException("database connection: " + dbId + " not configured");
		dba.clearDomainCache();
		this.neo4jConfig.setActiveConnection(dba);
		return "{ \"activeDB\":\"" + dbId + "\"}";
	}
	
	/**
	 * dbid must be 'db-config'
	 * @param dbId
	 * @return
	 */
	@GET
    @Timed
	public List<Neo4jDBInfo> getDBInfos(@PathParam("dbId") String dbId) {
		if (!"db-config".equals(dbId))
			throw new WebApplicationException("unknown resource: " + dbId + " on GET request");
		return this.neo4jConfig.getDBInfos();
	}
}
