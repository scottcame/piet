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

import java.util.Date;
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
import com.cascadia_analytics.piet.domain.PietConfiguration;
import com.cascadia_analytics.piet.repository.AnalysisRepository;

@RestController
public class PietRestController {

	private final Log log = LogFactory.getLog(PietRestController.class);

	@Autowired
	private AnalysisRepository analysisRepository;

	@Autowired
	private PietConfiguration pietConfiguration;

	public PietRestController() {
		log.trace("Created " + this.getClass().getName());
//		pietConfiguration = new PietConfiguration();
	}

	@GetMapping(path="/config", produces="application/json")
	public PietConfiguration getConfiguration() throws Exception {
		return pietConfiguration;
	}

	@GetMapping(path="/analyses", produces="application/json")
	public Analysis[] getAnalyses() throws Exception {
		Analysis[] ret = analysisRepository.findAll().toArray(new Analysis[0]);
		// TODO: handle read counter...actually need to rethink this and return just "summary attributes"
		//  on browseAnalyses(), then use GET /analysis by id to get the specific one requested by user.
		return ret;
	}

	@GetMapping(path="/analysis", produces="application/json")
	public Analysis getAnalysis(String id) throws Exception {
		Analysis ret = null;
		Optional<Analysis> foundAnalysis = analysisRepository.findById(id);
		if (foundAnalysis.isPresent()) {
			ret = saveAnalysis(foundAnalysis.get(), true, false);
		}
		return ret;
	}

	@PostMapping(path="/analysis", consumes="application/json", produces="application/json")
	public IdContainer saveAnalysis(@RequestBody Analysis analysis) throws Exception {
		Analysis savedAnalysis = saveAnalysis(analysis, false, true);
		return new IdContainer(savedAnalysis.getId());
	}

	private Analysis saveAnalysis(Analysis analysis, boolean updateReadCounter, boolean updateTime) {
		Date now = new Date();
		if (analysis.getCreateDateTime() == null) {
			analysis.setCreateDateTime(now);
		}
		if (updateTime) {
			analysis.setUpdateDateTime(now);
		}
		if (updateReadCounter) {
			analysis.setReadCounter(analysis.getReadCounter() + 1);
		}
		Analysis savedAnalysis = analysisRepository.save(analysis);
		return savedAnalysis;
	}

	@DeleteMapping(path="/analysis/{id}")
	public void deleteAnalysis(@PathVariable String id) throws Exception {
		analysisRepository.deleteById(id);
	}



}
