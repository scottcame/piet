package com.cascadia_analytics.piet.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection="analysis")
public class Analysis {
	
	@Id
	private String id;
	
	private String name;
	private String description;
	private DatasetRef datasetRef;
	
	@JsonProperty("_query")
	private Query query;

	public String getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getDescription() {
		return description;
	}

	public DatasetRef getDatasetRef() {
		return datasetRef;
	}

	public Query getQuery() {
		return query;
	}

	public void setId(String id) {
		this.id = id;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public void setDatasetRef(DatasetRef datasetRef) {
		this.datasetRef = datasetRef;
	}

	public void setQuery(Query query) {
		this.query = query;
	}
	
}
