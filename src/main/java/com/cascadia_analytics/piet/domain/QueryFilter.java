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
