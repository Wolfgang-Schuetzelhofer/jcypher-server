/************************************************************************
 * Copyright (c) 2015 IoT-Solutions e.U.
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

package iot.jcypher.server.util;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;

import iot.jcypher.database.IDBAccess;
import iot.jcypher.query.JcQuery;
import iot.jcypher.query.JcQueryResult;
import iot.jcypher.query.api.IClause;
import iot.jcypher.query.factories.clause.NATIVE;
import iot.jcypher.query.result.JcResultException;
import iot.jcypher.util.Util;

public class LoadUtil {

	public static void loadSampleDate(IDBAccess dbAccess, String sampleId) {
		if (sampleId.equals("sample_01"))
			doLoad(dbAccess, "/sampledata/people_domain.txt");
	}
	
	private static void doLoad(IDBAccess dbAccess, String resource) {
		InputStreamReader ir = null;
		try {
			InputStream in = LoadUtil.class.getResourceAsStream(resource);
			ir = new InputStreamReader(in);
			
			LineNumberReader lnr = new LineNumberReader(ir);
			List<String> lns = new ArrayList<String>();
			String line = lnr.readLine();
			while(line != null) {
				lns.add(line);
				line = lnr.readLine();
			}
			String[] lines = lns.toArray(new String[lns.size()]);
			IClause[] clauses = new IClause[] {
					NATIVE.cypher(lines)
			};
			JcQuery q = new JcQuery();
			q.setClauses(clauses);
			
			JcQueryResult result = dbAccess.execute(q);
			if (result.hasErrors()) {
				throw new JcResultException(Util.collectErrors(result));
			}
			
		} catch(Throwable e) {
			throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
		} finally {
			try {
				ir.close();
			} catch (Throwable e) {}
		}
	}
}
