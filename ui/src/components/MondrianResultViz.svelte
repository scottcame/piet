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