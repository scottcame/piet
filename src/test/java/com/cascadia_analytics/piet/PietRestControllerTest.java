package com.cascadia_analytics.piet;

import static org.junit.Assert.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.annotation.DirtiesContext;

import com.cascadia_analytics.piet.domain.Analysis;
import com.cascadia_analytics.piet.domain.DatasetRef;
import com.cascadia_analytics.piet.domain.IdContainer;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD) // forces recreation of repository with fresh database after each test
public class PietRestControllerTest {
	
	private static final Log log = LogFactory.getLog(PietRestControllerTest.class);
	
	@LocalServerPort
	private int port;
	
	@Autowired
    private TestRestTemplate restTemplate;
	
	@BeforeAll
	public static void beforeAll() {
		log.trace("Before " + PietRestControllerTest.class.getName());
	}
	
	@Test
	public void testGetAnalyses() throws Exception {
		Analysis[] analyses = restTemplate.getForObject("http://localhost:" + port + "/analyses", Analysis[].class);
	    assertEquals(analyses.length, 0);
	}
	
	@Test
	public void testSaveAnalysis() throws Exception {
		Analysis analysis = getDemoAnalysis();
		IdContainer id = restTemplate.postForObject("http://localhost:" + port + "/analysis", analysis, IdContainer.class);
		Analysis foundAnalysis = restTemplate.getForObject("http://localhost:" + port + "/analysis?id=" + id.getId(), Analysis.class);
		assertNotNull(foundAnalysis);
		assertEquals(foundAnalysis.getName(), analysis.getName());
		foundAnalysis.setName("Updated name of A1");
		IdContainer id2 = restTemplate.postForObject("http://localhost:" + port + "/analysis", foundAnalysis, IdContainer.class);
		Analysis foundAnalysis2 = restTemplate.getForObject("http://localhost:" + port + "/analysis?id=" + id2.getId(), Analysis.class);
		assertNotNull(foundAnalysis2);
		assertEquals(foundAnalysis2.getName(), foundAnalysis.getName());
		
	}
	
	@Test
	public void testDeleteAnalysis() throws Exception {
		Analysis analysis = getDemoAnalysis();
		IdContainer id = restTemplate.postForObject("http://localhost:" + port + "/analysis", analysis, IdContainer.class);
		restTemplate.delete("http://localhost:" + port + "/analysis/{id}", id.getId());
		Analysis[] analyses = restTemplate.getForObject("http://localhost:" + port + "/analyses", Analysis[].class);
	    assertEquals(analyses.length, 0);
	}
	
	private static final Analysis getDemoAnalysis() {
		Analysis analysis = new Analysis();
		analysis.setName("Analysis 1");
		analysis.setDescription("Description for Analysis 1");
    	DatasetRef datasetRef = new DatasetRef();
    	analysis.setDatasetRef(datasetRef);
    	datasetRef.setId("DatasetRef1");
    	datasetRef.setCube("Cube 1");
    	return analysis;
	}

}
