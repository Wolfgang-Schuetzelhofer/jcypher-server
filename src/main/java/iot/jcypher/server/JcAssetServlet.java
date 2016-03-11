package iot.jcypher.server;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.Charset;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.dropwizard.servlets.assets.AssetServlet;

public class JcAssetServlet extends AssetServlet {

	public JcAssetServlet(String resourcePath, String uriPath, String indexFile, Charset defaultCharset) {
		super(resourcePath, uriPath, indexFile, defaultCharset);
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		System.out.println("++++++++++++++++++ GET");
		super.doGet(req, resp);
	}

	@Override
	protected URL getResourceUrl(String absoluteRequestedResourcePath) {
		String path = absoluteRequestedResourcePath;
		if (absoluteRequestedResourcePath.charAt(0) != '/')
			path = "/" + path;
		URL url = JcAssetServlet.class.getResource(path);
		return url;
	}

	@Override
	protected byte[] readResource(URL requestedResourceURL) throws IOException {
		// TODO Auto-generated method stub
		System.out.println("-------------" + requestedResourceURL.toString());
		return super.readResource(requestedResourceURL);
	}
	
}
