// Copyright 2020 National Police Foundation
// Copyright 2020 Scott Came Consulting LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
	public static final String DEFAULT_MONDRIAN_REST_URL = "/mondrian-rest";
	public static final int DEFAULT_TABLE_FONT_INCREASE = 1;

	@Value("${piet.ui.applicationTitle:" + DEFAULT_APPLICATION_TITLE + "}")
	private String applicationTitle;

	@Value("${piet.ui.logoImageUrl:" + DEFAULT_LOGO_IMAGE_URL + "}")
	private String logoImageUrl;

	@Value("${piet.ui.logLevel:" + DEFAULT_LOG_LEVEL + "}")
	private String logLevel;

	@Value("${piet.ui.apiVersion}")
	private String apiVersion;

	@Value("${piet.ui.mondrian.rest.url:" + DEFAULT_MONDRIAN_REST_URL + "}")
	private String mondrianRestUrl;
	
	@Value("${piet.ui.tableFontIncrease:" + DEFAULT_TABLE_FONT_INCREASE + "}")
	private int tableFontIncrease;
	
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

	public String getMondrianRestUrl() {
		return mondrianRestUrl;
	}

	public void setMondrianRestUrl(String mondrianRestUrl) {
		this.mondrianRestUrl = mondrianRestUrl;
	}

	public int getTableFontIncrease() {
		return tableFontIncrease;
	}

	public void setTableFontIncrease(int tableFontIncrease) {
		this.tableFontIncrease = tableFontIncrease;
	}

}
