![](https://github.com/Wolfgang-Schuetzelhofer/jcypher-server/blob/master/src/test/resources/img/jcypher_server_logo_1.png)
=======
# JCypher-Server
A server-side implementation of [**JCypher**](http://wolfgang-schuetzelhofer.github.io/jcypher/)  
**Status: Pre-release development**  
**A first pre-release will be published in April 2016**

## Getting Started
- Download, install and run a [**Neo4J™ Server**](http://www.neo4j.org/) (the Community Edition is for free).
- Download a JCypher-Server Distribution from the [**releases page**](https://github.com/Wolfgang-Schuetzelhofer/jcypher-server/releases).
The file to download is named **jcypher-server-x.y.z-dist.zip**, where x.y.z is a release number.
- Unpack the **.zip** file. You will find three files: **jcypher-server-x.y.z.jar**, **jcypher-server.yml**, **neo4j-server.yml**.
The two **.yml** files are configuration files you may need to edit.
- Edit the configuration files.
**jcypher-server.yml** - at the top of the file you will find:
```yaml
server:
  type: simple
  connector:
    type: http
    port: 8080
```
You can modify the port where to run the JCypher-Server.

## License & Copyright

Copyright (c) 2016 IoT-Solutions e.U.

License:
								Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/
