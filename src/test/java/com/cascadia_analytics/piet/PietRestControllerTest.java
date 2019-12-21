package com.cascadia_analytics.piet;

import static org.junit.Assert.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;

import com.cascadia_analytics.piet.domain.Analysis;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class PietRestControllerTest {
	
	@LocalServerPort
	private int port;
	
	@Autowired
    private TestRestTemplate restTemplate;
	
	@Test
	public void testGetAnalyses() throws Exception {
		Analysis[] analyses = restTemplate.getForObject("http://localhost:" + port + "/analyses", Analysis[].class);
	    assertEquals(analyses.length, 0);
	}

}
