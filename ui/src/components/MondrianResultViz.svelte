<script>

  import vegaEmbed from 'vega-embed';

  export let mondrianResultVegaViz;
  let vegaLiteSpec = mondrianResultVegaViz.vegaLiteSpec;

  mondrianResultVegaViz.addMondrianResultVizModelChangeListener({
    mondrianResultVizModelChanged: function(event) {
      vegaLiteSpec = mondrianResultVegaViz.vegaLiteSpec
    }
  });

  if (vegaLiteSpec) {
    vegaEmbed("#viz", vegaLiteSpec);
  }

</script>

<div class="h-full w-full">
  <div class="p-2 text-xxs {vegaLiteSpec ? 'hidden' : ''}">This query cannot be visualized (some queries are too complex for visualization in the current version).</div>
  <div id="viz" class="h-screen-67 w-full"></div>
</div>