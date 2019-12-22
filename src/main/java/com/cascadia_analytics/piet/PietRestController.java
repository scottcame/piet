package com.cascadia_analytics.piet;

import java.util.Optional;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.cascadia_analytics.piet.domain.Analysis;
import com.cascadia_analytics.piet.domain.IdContainer;
import com.cascadia_analytics.piet.repository.AnalysisRepository;

@RestController
public class PietRestController {
	
	private final Log log = LogFactory.getLog(PietRestController.class);
	
	@Autowired
	private AnalysisRepository analysisRepository;
	
	public PietRestController() {
		log.trace("Created " + this.getClass().getName());
	}
	
	@GetMapping(path="/analyses", produces="application/json")
	public Analysis[] getAnalyses() throws Exception {
		return analysisRepository.findAll().toArray(new Analysis[0]);
	}
	
	@GetMapping(path="/analysis", produces="application/json")
	public Analysis getAnalysis(String id) throws Exception {
		Analysis ret = null;
		Optional<Analysis> foundAnalysis = analysisRepository.findById(id);
		if (foundAnalysis.isPresent()) {
			System.out.println(foundAnalysis.get().getId());
			ret = foundAnalysis.get();
		}
		return ret;
	}
	
	@PostMapping(path="/analysis", consumes="application/json", produces="application/json")
	public IdContainer saveAnalysis(@RequestBody Analysis analysis) throws Exception {
		Analysis savedAnalysis = analysisRepository.save(analysis);
		return new IdContainer(savedAnalysis.getId());
	}
	
	@DeleteMapping(path="/analysis/{id}")
	public void deleteAnalysis(@PathVariable String id) throws Exception {
		analysisRepository.deleteById(id);
	}

}
