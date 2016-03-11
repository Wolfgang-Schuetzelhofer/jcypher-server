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

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.codahale.metrics.annotation.Timed;

import iot.jcypher.database.IDBAccess;
import iot.jcypher.query.result.JcError;
import iot.jcypher.server.config.DBAccessConfig;
import iot.jcypher.server.config.Neo4jConfig;
import iot.jcypher.server.util.LoadUtil;

@Path("/{db}/{resourceToAct}")
@Produces(MediaType.APPLICATION_JSON)
public class Neo4jDBSetup {

	private static final String SAMPLE_DATA = "sampleData";
	
	private Neo4jConfig neo4jConfig;
	
	public Neo4jDBSetup(Neo4jConfig neo4jConfig) {
		super();
		this.neo4jConfig = neo4jConfig;
	}

	@POST
    @Timed
	public String actOnResource(@PathParam("db") String db, @PathParam("resourceToAct") String resourceToAct,
			String data) {
		if (SAMPLE_DATA.equals(resourceToAct)) {
			DBAccessConfig acc = neo4jConfig.getDBAccess(db);
			IDBAccess dba = acc.getDBAccess();
			List<JcError> errs = dba.clearDatabase();
			acc.clearDomainCache();
			if (errs.size() > 0)
				throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
			LoadUtil.loadSampleDate(dba, data);
		}
		return "[\"success\"]";
	}
}
