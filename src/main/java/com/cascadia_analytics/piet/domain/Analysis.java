package com.cascadia_analytics.piet.domain;

import java.util.Date;

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
	
	private Date createDateTime;
	private Date updateDateTime;
	private long readCounter;

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

	public Date getCreateDateTime() {
		return createDateTime;
	}

	public void setCreateDateTime(Date createDateTime) {
		this.createDateTime = createDateTime;
	}

	public Date getUpdateDateTime() {
		return updateDateTime;
	}

	public long getReadCounter() {
		return readCounter;
	}

	public void setUpdateDateTime(Date updateDateTime) {
		this.updateDateTime = updateDateTime;
	}

	public void setReadCounter(long readCounter) {
		this.readCounter = readCounter;
	}
	
}
