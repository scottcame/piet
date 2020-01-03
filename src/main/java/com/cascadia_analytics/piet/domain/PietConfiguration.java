package com.cascadia_analytics.piet.domain;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

@Component
@PropertySource("classpath:mvn-resources-application.properties")
public class PietConfiguration {
	
	public static final String DEFAULT_APPLICATION_TITLE = "Piet";
	public static final String DEFAULT_LOGO_IMAGE_URL = "img/piet-logo.jpg";
	public static final String DEFAULT_LOG_LEVEL = "error";
	
	@Value("${piet.ui.applicationTitle:" + DEFAULT_APPLICATION_TITLE + "}")
	private String applicationTitle;
	
	@Value("${piet.ui.logoImageUrl:" + DEFAULT_LOGO_IMAGE_URL + "}")
	private String logoImageUrl;
	
	@Value("${piet.ui.logLevel:" + DEFAULT_LOG_LEVEL + "}")
	private String logLevel;
	
	@Value("${piet.ui.apiVersion}")
	private String apiVersion;

	public String getApplicationTitle() {
		return applicationTitle;
	}

	public String getLogoImageUrl() {
		return logoImageUrl;
	}

	public String getLogLevel() {
		return logLevel;
	}

	public void setApplicationTitle(String applicationTitle) {
		this.applicationTitle = applicationTitle;
	}

	public void setLogoImageUrl(String logoImageUrl) {
		this.logoImageUrl = logoImageUrl;
	}

	public void setLogLevel(String logLevel) {
		this.logLevel = logLevel;
	}

	public String getApiVersion() {
		return apiVersion;
	}

	public void setApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
	}
	
}
