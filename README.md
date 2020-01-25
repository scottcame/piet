Overview
--------

Piet is a user interface and exploratory query tool for online analytical processing (OLAP) data sources exposed by [Mondrian OLAP](http://community.pentaho.com/projects/mondrian/).

![Piet Screenshot](/PietScreenshot.png)

### Table of Contents

* [Name](#why-piet)
* [Usage](#usage)
* [Architecture](#architecture)
* [Building from source](#building-from-source)

### Why Piet

Piet is a front-end for Mondrian, so it seemed appropriate to use the given name of [Piet Mondrian](https://en.wikipedia.org/wiki/Piet_Mondrian) for the application. The Piet logo is an image of Mondrian's
[_Composition II in Red, Blue, and Yellow_](https://en.wikipedia.org/wiki/Piet_Mondrian#/media/File:Piet_Mondriaan,_1930_-_Mondrian_Composition_II_in_Red,_Blue,_and_Yellow.jpg) from 1930.

### Usage

#### Running Piet

The easiest way to run Piet is via Docker Compose:

```
curl -S https://raw.githubusercontent.com/scottcame/piet/master/docker/docker-compose.yaml | docker-compose -f - up -d
```

This Docker Compose file starts the Piet application container itself, as well as the accompanying [mongodb](https://www.mongodb.com/) container for storage of persisted analyses.

#### Features

Piet allows the user to create _Analyses_ from available _Datasets_. An instance of Piet is configured with a set of Mondrian connections (the configuration is actually a configuration of
[mondrian-rest](https://github.com/ojbc/mondrian-rest)). Each cube within each of the configured connections appears in Piet as an available dataset.

Datasets expose _measures_ and _dimensions_ from which the user constructs an _Analysis_.  (An analysis is essentially an MDX query, but consists of logical objects built graphically, rather than via coding
MDX syntax.) When the user creates an analysis (via the "New" menu item, under "Analyses"), they are presented with a dropdown control listing the available datasets. The user selects a dataset, and an
empty analysis opens in the application.

The user chooses one or more measures (i.e., a variable/value to be aggregated) and one or more dimension levels to form the analysis. Each dimension level can be placed on rows or columns (via a button
on the dimension level in the editor). The user can also elect to filter (via exclusion or inclusion) specific dimension level values, also via a button on the dimension level in the editor.

An analysis can be viewed in tabular form (the default) or in a simple graphical presentation by toggling a button above the results area.

The user can specify a name and description for the analysis via the dropdown-menu above and to the right of the results area.

Analyses are saved automatically (in local browser storage), but are not available across browser sessions (or to other users) unless explicitly saved via the dropdown-menu. The menu also allows the user
to delete analyses from the repository.

### Architecture

Piet is built with [Svelte](https://svelte.dev/) and Typescript on the front end (bundled with [RollupJS](https://rollupjs.org/guide/en/)), and Java / Spring Boot on the backend. Visualizations are provided through [Vega Lite](https://vega.github.io/vega-lite/).

The interface to mondrian is provided via [mondrian-rest](https://github.com/ojbc/mondrian-rest).

### Building from Source

Building requires [npm](https://www.npmjs.com/). Once `npm` is installed, pull the repo from git and:

1. From the `ui` directory: `npm install` then `npm run build`
1. From the root `piet` directory: `mvn install`
1. (If a docker image is desired) From the `docker/piet` directory: `docker build -t [image-name] .`

Unit tests for the typescript front-end can be run (from the `ui` directory): `npm run test`. Unit tests of the backend are run with maven automatically.

We have built and pushed Piet to DockerHub as `scottcame/piet`.
