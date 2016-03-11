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

import io.dropwizard.configuration.ConfigurationFactory;
import io.dropwizard.configuration.ConfigurationSourceProvider;
import io.dropwizard.configuration.FileConfigurationSourceProvider;
import io.dropwizard.jackson.Jackson;

public class ConfigReader {

	public <T> T readConfiguration(Class<T> clazz, String path) throws Exception {
		ConfigurationFactory<T> cfact = new ConfigurationFactory<>(clazz, null, Jackson.newObjectMapper(), "dw.");
		ConfigurationSourceProvider cprov = new FileConfigurationSourceProvider();
		T ret = cfact.build(cprov, path);
		return ret;
	}

}
