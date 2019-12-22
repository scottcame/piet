package com.cascadia_analytics.piet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class PietApplication extends SpringBootServletInitializer {
	
	public static void main(String ... args) {
		SpringApplication.run(PietApplication.class, args);
	}

}
