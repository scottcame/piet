package com.cascadia_analytics.piet.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Query {
	
	private boolean nonEmpty;
	private boolean filterParentAggregates;
	
	@JsonProperty("_measures")
	private QueryMeasure[] measures;
	
	@JsonProperty("_levels")
	private QueryLevel[] levels;
	
	@JsonProperty("_filters")
	private QueryFilter[] filters;

	public boolean isNonEmpty() {
		return nonEmpty;
	}

	public boolean isFilterParentAggregates() {
		return filterParentAggregates;
	}

	public QueryMeasure[] getMeasures() {
		return measures;
	}

	public QueryLevel[] getLevels() {
		return levels;
	}

	public QueryFilter[] getFilters() {
		return filters;
	}

	public void setNonEmpty(boolean nonEmpty) {
		this.nonEmpty = nonEmpty;
	}

	public void setFilterParentAggregates(boolean filterParentAggregates) {
		this.filterParentAggregates = filterParentAggregates;
	}

	public void setMeasures(QueryMeasure[] measures) {
		this.measures = measures;
	}

	public void setLevels(QueryLevel[] levels) {
		this.levels = levels;
	}

	public void setFilters(QueryFilter[] filters) {
		this.filters = filters;
	}

}
