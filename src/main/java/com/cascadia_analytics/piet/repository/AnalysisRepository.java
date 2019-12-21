package com.cascadia_analytics.piet.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.cascadia_analytics.piet.domain.Analysis;

public interface AnalysisRepository extends MongoRepository<Analysis, String> {}
