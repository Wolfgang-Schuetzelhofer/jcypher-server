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

import com.google.common.base.Charsets;

import io.dropwizard.Application;
import io.dropwizard.server.DefaultServerFactory;
import io.dropwizard.server.ServerFactory;
import io.dropwizard.servlets.assets.AssetServlet;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import iot.jcypher.server.config.ConfigReader;
import iot.jcypher.server.config.Neo4jConfig;
import iot.jcypher.server.resources.Neo4jActiveDB;
import iot.jcypher.server.resources.Neo4jDBSetup;
import iot.jcypher.server.resources.DomainModel;
import iot.jcypher.server.resources.Domains;

public class JCypherServerApplication extends Application<JCypherServerConfig> {
	
	private static final String dw_config = "jcypher-server.yml";
	private static final String neo_config = "neo4j-server.yml";
	
	private String configDir;

	public JCypherServerApplication(String configDir) {
		super();
		this.configDir = configDir;
	}

	public static void main(String[] args) throws Exception {
		String cfg = null;
		String[] arguments = new String[2];
		arguments[0] = "server";
		boolean err = true;
		if (args != null) {
			if (args.length == 1) {
				if (args[0].startsWith("-cfgdir")) {
					int idx = args[0].indexOf('=');
					if (idx > 0) {
						err = false;
						cfg = args[0].substring(idx + 1, args[0].length()).trim();
						if (cfg.length() > 0 && cfg.indexOf('/') != cfg.length() - 1)
							cfg = cfg.concat("/");
					}
				}
			} else if (args.length == 0)
				err = false;
		} else
			err = false;
		
		if (!err) {
			if (cfg != null)
				arguments[1] = cfg.concat(dw_config);
			else
				arguments[1] = dw_config;
			new JCypherServerApplication(cfg).run(arguments);
		} else {
			System.out.println("commandline parameters: [-cfgdir=a-dir-containing-config-files]");
			System.out.println("required config files: jcypher-server.yml, neo4j-server.yml");
			System.exit(1);
		}
	}

	@Override
	public void run(JCypherServerConfig cfg, Environment env) throws Exception {
		String neocfgloc;
		if (this.configDir != null)
			neocfgloc = this.configDir.concat(neo_config);
		else
			neocfgloc = neo_config;
		Neo4jConfig neocfg = new ConfigReader().readConfiguration(Neo4jConfig.class, neocfgloc);
		
		ServerFactory fact = cfg.getServerFactory();
		((DefaultServerFactory)fact).setJerseyRootPath("/jcypher-api/*");
		//env.jersey().setUrlPattern("/api/*");
		final VersionInfoResource vir = new VersionInfoResource();
		final Neo4jActiveDB db = new Neo4jActiveDB(neocfg);
		final DomainModel dm = new DomainModel(neocfg);
		final Domains doms = new Domains(neocfg);
		final Neo4jDBSetup su = new Neo4jDBSetup(neocfg);
		final JCypherServerHealthCheck healthCheck = new JCypherServerHealthCheck();
		env.healthChecks().register("jcypher-server-health", healthCheck);
		env.jersey().register(vir);
		env.jersey().register(db);
		env.jersey().register(dm);
		env.jersey().register(doms);
		env.jersey().register(su);
		
		env.servlets().addServlet("assets", new AssetServlet("/assets", "/graph_view_neo/", "index.html", Charsets.UTF_8))
			.addMapping("/graph_view_neo/*", "/jcypher_gview/*");
		env.servlets().addServlet("JcProxyServlet", new JcProxyServlet(neocfg))
			.addMapping("/*");

		return;
	}

	@Override
	public void initialize(Bootstrap<JCypherServerConfig> bootstrap) {
//		bootstrap.addBundle(new AssetsBundle("/assets", "/", "index.html"));
	}

	@Override
	public String getName() {
		return "jcypher-server";
	}

}
