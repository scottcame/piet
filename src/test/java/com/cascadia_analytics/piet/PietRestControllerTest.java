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

package com.cascadia_analytics.piet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
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
import com.cascadia_analytics.piet.domain.PietConfiguration;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT, properties={"piet.ui.logLevel=info"})
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
	public void testGetConfiguration() throws Exception {
		PietConfiguration pietConfiguration = restTemplate.getForObject("http://localhost:" + port + "/config", PietConfiguration.class);
		assertEquals(PietConfiguration.DEFAULT_APPLICATION_TITLE, pietConfiguration.getApplicationTitle());
		assertEquals("info", pietConfiguration.getLogLevel()); // note properties override on @SpringBootTest above
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
		assertNotNull(foundAnalysis.getCreateDateTime());
		assertEquals(foundAnalysis.getCreateDateTime(), foundAnalysis.getUpdateDateTime());
		assertEquals(1, foundAnalysis.getReadCounter());
		foundAnalysis.setName("Updated name of A1");
		IdContainer id2 = restTemplate.postForObject("http://localhost:" + port + "/analysis", foundAnalysis, IdContainer.class);
		Analysis foundAnalysis2 = restTemplate.getForObject("http://localhost:" + port + "/analysis?id=" + id2.getId(), Analysis.class);
		assertNotNull(foundAnalysis2);
		assertEquals(foundAnalysis2.getName(), foundAnalysis.getName());
		assertNotEquals(foundAnalysis2.getCreateDateTime(), foundAnalysis2.getUpdateDateTime());
		assertEquals(2, foundAnalysis2.getReadCounter());
	}

	@Test
	public void testReadCounter() throws Exception {
		Analysis analysis = getDemoAnalysis();
		IdContainer id = restTemplate.postForObject("http://localhost:" + port + "/analysis", analysis, IdContainer.class);
		Analysis foundAnalysis = restTemplate.getForObject("http://localhost:" + port + "/analysis?id=" + id.getId(), Analysis.class);
		assertNotNull(foundAnalysis);
		assertEquals(1, foundAnalysis.getReadCounter());
		foundAnalysis = restTemplate.getForObject("http://localhost:" + port + "/analysis?id=" + id.getId(), Analysis.class);
		assertEquals(2, foundAnalysis.getReadCounter());
		foundAnalysis = restTemplate.getForObject("http://localhost:" + port + "/analysis?id=" + id.getId(), Analysis.class);
		assertEquals(3, foundAnalysis.getReadCounter());
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
