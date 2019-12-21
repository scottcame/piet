package com.cascadia_analytics.piet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cascadia_analytics.piet.domain.Analysis;
import com.cascadia_analytics.piet.repository.AnalysisRepository;

@RestController
public class PietRestController {
	
	@Autowired
	private AnalysisRepository analysisRepository;
	
	@GetMapping(path="/analyses", produces="application/json")
	public Analysis[] getAnalyses() throws Exception {
		return analysisRepository.findAll().toArray(new Analysis[0]);
	}

}
