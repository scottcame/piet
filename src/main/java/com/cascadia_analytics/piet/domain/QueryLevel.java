package com.cascadia_analytics.piet.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QueryLevel {
	
	@JsonProperty("_uniqueName")
	private String uniqueName;

	@JsonProperty("_rowOrientation")
	private boolean rowOrientation;

	public String getUniqueName() {
		return uniqueName;
	}

	public boolean isRowOrientation() {
		return rowOrientation;
	}

	public void setUniqueName(String uniqueName) {
		this.uniqueName = uniqueName;
	}

	public void setRowOrientation(boolean rowOrientation) {
		this.rowOrientation = rowOrientation;
	}
	
}
