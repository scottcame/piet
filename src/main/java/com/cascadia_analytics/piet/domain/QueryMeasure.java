package com.cascadia_analytics.piet.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QueryMeasure {
	
	@JsonProperty("_uniqueName")
	private String uniqueName;

	public String getUniqueName() {
		return uniqueName;
	}

	public void setUniqueName(String uniqueName) {
		this.uniqueName = uniqueName;
	}

}
