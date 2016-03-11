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
import javax.ws.rs.core.Response;

import com.codahale.metrics.annotation.Timed;

import iot.jcypher.database.IDBAccess;
import iot.jcypher.domain.IGenericDomainAccess;
import iot.jcypher.domain.internal.IIntDomainAccess;
import iot.jcypher.facade.JSONDomainFacade;
import iot.jcypher.graph.GrNode;
import iot.jcypher.graph.GrProperty;
import iot.jcypher.query.JcQuery;
import iot.jcypher.query.JcQueryResult;
import iot.jcypher.query.api.IClause;
import iot.jcypher.query.factories.clause.DO;
import iot.jcypher.query.factories.clause.MATCH;
import iot.jcypher.query.factories.clause.MERGE;
import iot.jcypher.query.factories.clause.RETURN;
import iot.jcypher.query.values.JcNode;
import iot.jcypher.query.writer.Format;
import iot.jcypher.server.config.Neo4jConfig;

@Path("/{db}/{domainName}/{model_or_layout}")
@Produces(MediaType.APPLICATION_JSON)
//@Consumes(MediaType.APPLICATION_JSON)
public class DomainModel {

	private static final String MODEL = "model";
	private static final String LAYOUT = "layout";
	private static final String PROP_LAYOUT = "layout";
	private static final String EMPTY_LAYOUT = "{}";
	
	private Neo4jConfig neo4jConfig;
	
	public DomainModel(Neo4jConfig neo4jConfig) {
		super();
		this.neo4jConfig = neo4jConfig;
	}

	@GET
    @Timed
	public String getDomainModel(@PathParam("db") String db, @PathParam("domainName") String domainName,
			@PathParam("model_or_layout") String model_or_layout) {
		if (MODEL.equals(model_or_layout)) {
			IGenericDomainAccess da = neo4jConfig.getDBAccess(db).getDomainAccess(domainName);
			JSONDomainFacade df = new JSONDomainFacade(da);
			if (neo4jConfig.isPrettyJSON())
				df.setPrettyFormat(Format.PRETTY_1);
			String dm = df.getDomainModel();
			return dm;
		} else if (LAYOUT.equals(model_or_layout)) {
			IGenericDomainAccess da = neo4jConfig.getDBAccess(db).getDomainAccess(domainName);
			String label = ((IIntDomainAccess)da).getInternalDomainAccess().buildDomainLabel(domainName);
			label = label.concat("_").concat(LAYOUT);
			IDBAccess dbAccess = neo4jConfig.getDBAccess(db).getDBAccess();
			JcNode n = new JcNode("n");
			IClause[] clauses = new IClause[] {
				MATCH.	node(n).label(label),
				RETURN.value(n)
			};
			JcQuery q = new JcQuery();
			q.setClauses(clauses);
			JcQueryResult result = dbAccess.execute(q);
			if (result.hasErrors())
				throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
			List<GrNode> nl = result.resultOf(n);
			if (nl.size() > 0) {
				GrProperty layout = nl.get(0).getProperty(PROP_LAYOUT);
				if (layout != null)
					return layout.getValue().toString();
			}
//			String test = "{ \"domainName\" :  \"" + domainName + "\"," +
//					"\n  \"typeLayouts\" : [" +
//					"\n   {\"name\" : \"Person\", \"x\" :  100, \"y\" : 200} " +
//					"\n  ]" +
//					"\n}";
			return "{ }";
		} else {
			throw new WebApplicationException("no resource: " + model_or_layout, Response.Status.NOT_FOUND);
		}
	}
	
	@POST
    @Timed
	public String saveLayout(@PathParam("db") String db, @PathParam("domainName") String domainName,
			@PathParam("model_or_layout") String model_or_layout, String layout) {
		if (LAYOUT.equals(model_or_layout)) {
			IGenericDomainAccess da = neo4jConfig.getDBAccess(db).getDomainAccess(domainName);
			String label = ((IIntDomainAccess)da).getInternalDomainAccess().buildDomainLabel(domainName);
			label = label.concat("_").concat(LAYOUT);
			IDBAccess dbAccess = neo4jConfig.getDBAccess(db).getDBAccess();
			JcNode n = new JcNode("n");
			IClause[] clauses;
			if (EMPTY_LAYOUT.equals(layout)) { // delete
				clauses = new IClause[] {
						MATCH.node(n).label(label),
						DO.DELETE(n)
				};
			} else {
				clauses = new IClause[] {
						MERGE.node(n).label(label),
						DO.SET(n.property(LAYOUT)).to(layout)
				};
			}
			JcQuery q = new JcQuery();
			q.setClauses(clauses);
			JcQueryResult result = dbAccess.execute(q);
			if (result.hasErrors())
				throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
			
			return "[\"success\"]";
		} else {
			throw new WebApplicationException("no resource: " + model_or_layout, Response.Status.BAD_REQUEST);
		}
	}
}
