package com.cascadia_analytics.piet.repository;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.BasicQuery;

import com.cascadia_analytics.piet.domain.Analysis;
import com.cascadia_analytics.piet.domain.DatasetRef;

@DataMongoTest
public class AnalysisRepositoryTest {
	
    @Autowired
    private AnalysisRepository analysisRepository;
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Test
    public void testMongoSetup() throws Exception {
    	assertNotNull(analysisRepository);
    	assertNotNull(mongoTemplate);
    }
    
    @Test
    public void testCount() throws Exception {
    	assertEquals(analysisRepository.count(), 0);
    }
    
    @Test
    public void testInsertAndFind() throws Exception {
    	
    	Analysis analysis = new Analysis();
    	analysis.setName("Analysis 1");
    	analysis.setDescription("Description for Analysis 1");
    	DatasetRef datasetRef = new DatasetRef();
    	analysis.setDatasetRef(datasetRef);
    	datasetRef.setId("DatasetRef1");
    	datasetRef.setCube("Cube 1");
    	
    	Analysis dbAnalysis = analysisRepository.save(analysis);
    	
    	assertEquals(analysisRepository.count(), 1);
    	assertNotNull(dbAnalysis);
    	assertEquals(dbAnalysis.getName(), analysis.getName());
    	
    	Optional<Analysis> foundAnalysis = analysisRepository.findById(dbAnalysis.getId());
    	assertTrue(foundAnalysis.isPresent());
    	assertEquals(foundAnalysis.get().getId(), dbAnalysis.getId());
    	
    	// old school mongo searching...
    	
    	BasicQuery q = new BasicQuery("{ _id : '" + dbAnalysis.getId() + "' }");
    	Analysis dbAnalysis2 = mongoTemplate.findOne(q, Analysis.class);
    	assertNotNull(dbAnalysis2);
    	assertEquals(dbAnalysis2.getId(), dbAnalysis.getId());
    	
    }

}
