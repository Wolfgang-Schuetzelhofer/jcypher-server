![](https://github.com/Wolfgang-Schuetzelhofer/jcypher-server/blob/master/src/test/resources/img/jcypher_server_logo_1.png)
=======
# JCypher-Server
A server-side implementation of [**JCypher**](http://wolfgang-schuetzelhofer.github.io/jcypher/)  
**Status: Pre-release development**  

## Getting Started
- Download, install and run a [**Neo4J™ Server**](http://www.neo4j.org/) (the Community Edition is for free).
- Download a JCypher-Server Distribution from the [**releases page**](https://github.com/Wolfgang-Schuetzelhofer/jcypher-server/releases).
The file to download is named **jcypher-server-x.y.z-dist.zip**, where x.y.z is a release number.
- Unpack the **.zip** file. You will find three files: **jcypher-server-x.y.z.jar**, **jcypher-server.yml**, **neo4j-server.yml**.
The two **.yml** files are configuration files you may need to edit.
- Edit the configuration file **jcypher-server.yml** - at the top of the file you will find:
```yaml
server:
  type: simple
  connector:
    type: http
    port: 8080
```
You can modify the port where to run the JCypher-Server.
- Edit the configuration file **neo4j-server.yml**. You can specify one or more Neo4J Servers to which you want to connect.
```yaml
neo4jConnections:
# name is case insensitive
   - name: db-0
     url: http://localhost:7474
   - name: db-1
     url: http://localhost:7475
     userId: userId
     password: password
```
- From the directory where you have unzipped JCypher-Server you can run the Sever by calling: **java -jar jcypher-server-x.y.z.jar**.
This will expect the two configuration files in the directory from where you start the server.
Alternatively you can specify a directory where to look for the configuration files as command line parameter like so:
**java -jar jcypher-server-x.y.z.jar -cfgdir=a-relative-or-absolute-directory**
This allows to manage multiple configurations.
- Connect with a browser to **http://localhost:8080/graph_view_neo/**. Note to use the port you have specified in your configuration.
- Start experimenting with the WEB-UI.

## License & Copyright

Copyright (c) 2016 IoT-Solutions e.U.

License:
								Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/
