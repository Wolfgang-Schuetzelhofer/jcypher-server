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

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.codahale.metrics.annotation.Timed;

import iot.jcypher.facade.JSONDBFacade;
import iot.jcypher.query.writer.Format;
import iot.jcypher.server.config.Neo4jConfig;

@Path("/{db}/domains")
@Produces(MediaType.APPLICATION_JSON)
public class Domains {

	private Neo4jConfig neo4jConfig;

	public Domains(Neo4jConfig neo4jConfig) {
		super();
		this.neo4jConfig = neo4jConfig;
	}
	
	@GET
    @Timed
	public String getDomains(@PathParam("db") String db) {
		JSONDBFacade dbf = new JSONDBFacade(neo4jConfig.getDBAccess(db).getDBAccess());
		if (neo4jConfig.isPrettyJSON())
			dbf.setPrettyFormat(Format.PRETTY_1);
		return dbf.getDomains();
	}
}