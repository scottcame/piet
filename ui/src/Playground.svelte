<script>

  import vegaEmbed from 'vega-embed';

  let mA=62;
	let mB=30;
	let vA=100;
	let vB=180;

  let a=[];
	for(let i = 0; i < 100; i++){
		let yA=Math.exp(-Math.pow((i-mA),2)/vA);
		let yB=Math.exp(-Math.pow((i-mB),2)/vB);
		a.push({Trait: i, Frequency: yA, Gender: "Group A"});
		a.push({Trait: i, Frequency:yB, Gender: "Group B"});
		a.push({Trait: i, Proportion:yA/(yA+yB), Gender: "A"});
		a.push({Trait: i, Proportion:yB/(yA+yB), Gender: "B"});
	};

  let vegaLiteSpec = {
			$schema: 'https://vega.github.io/schema/vega-lite/v2.0.json',
			config: {
				"width": 600,
				"height": 200,
				description: 'A simple bar chart with embedded data.'
			},
			data: {
				values: a
			},
			"vconcat": [
				{
					transform: [{filter: {field: 'Gender', oneOf: ['Group A', 'Group B']}}],
					width: 600,
					mark: 'line',
					encoding: {
						x: {field: 'Trait', type: 'quantitative'},
						y: {field: 'Frequency', type: 'quantitative'},
						color: {field: 'Gender', type: 'nominal'}
					}
				},
				{
					transform: [{filter: {field: 'Gender', oneOf: ['A','B']}}],
					width: 600,
					mark: 'area',
					encoding: {
						x: {field: 'Trait', type: 'quantitative'},
						y: {field: 'Proportion', type: 'quantitative',"axis": null,
      "stack": "normalize"},
						color: {field: 'Gender', type: 'nominal'}
					}
				}
			]
		};

  vegaEmbed("#viz", vegaLiteSpec);

</script>

<div id="viz"></div>
