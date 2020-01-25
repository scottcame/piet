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
