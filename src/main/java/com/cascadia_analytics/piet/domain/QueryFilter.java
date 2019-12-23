package com.cascadia_analytics.piet.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QueryFilter {
	
	@JsonProperty("_levelUniqueName")
	private String levelUniqueName;

	@JsonProperty("_filterOnlyHierarchy")
	private boolean filterOnlyHierarchy;
    
	@JsonProperty("_include")
	private boolean include;
	
	private String[] levelMemberNames;

	public String getLevelUniqueName() {
		return levelUniqueName;
	}

	public boolean isFilterOnlyHierarchy() {
		return filterOnlyHierarchy;
	}

	public boolean isInclude() {
		return include;
	}

	public String[] getLevelMemberNames() {
		return levelMemberNames;
	}

	public void setLevelUniqueName(String levelUniqueName) {
		this.levelUniqueName = levelUniqueName;
	}

	public void setFilterOnlyHierarchy(boolean filterOnlyHierarchy) {
		this.filterOnlyHierarchy = filterOnlyHierarchy;
	}

	public void setInclude(boolean include) {
		this.include = include;
	}

	public void setLevelMemberNames(String[] levelMemberNames) {
		this.levelMemberNames = levelMemberNames;
	}

}
