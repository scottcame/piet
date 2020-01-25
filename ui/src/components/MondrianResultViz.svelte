<!--
  Copyright 2020 National Police Foundation
  Copyright 2020 Scott Came Consulting LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

<script>

  import vegaEmbed from 'vega-embed';

  export let mondrianResultVegaViz;
  let vegaLiteSpec = mondrianResultVegaViz.vegaLiteSpec;

  mondrianResultVegaViz.addMondrianResultVizModelChangeListener({
    mondrianResultVizModelChanged: function(event) {
      vegaLiteSpec = mondrianResultVegaViz.vegaLiteSpec
    }
  });

  $: if (vegaLiteSpec) {
    vegaEmbed("#viz", vegaLiteSpec);
  }

</script>

<div class="h-full w-full">
  <div class="p-2 text-xxs {vegaLiteSpec ? 'hidden' : ''}">
    <div class="p-2 text-xs">
      This query cannot be visualized because of one of the following:
      <ul class="list-disc">
        <div  class="ml-8 mt-1">
        <li>The query did not produce results</li>
        <li>The query includes only measure(s) but no dimensions</li>
        <li>The query includes more than two dimensions</li>
        <li>The query includes one dimension on each "axis" (rows and columns) but more than one measure</li>
        <li>The query includes more than one dimension on the same "axis"</li>
        </div>
      </ul>
    </div>
  </div>
  <div id="viz" class="h-screen-67 w-full {vegaLiteSpec ? '' : 'hidden'}"></div>
</div>
