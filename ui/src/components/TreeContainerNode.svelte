<script>

	import QueryLevelTreeLeafNode from './QueryLevelTreeLeafNode.svelte';
	import QueryMeasureTreeLeafNode from './QueryMeasureTreeLeafNode.svelte';
	import { TreeModelNode, TreeModelLeafNode, TreeModelContainerNode } from '../js/ui/model/Tree';
	import { createEventDispatcher } from 'svelte';

	export let treeModelNode;
	export let collapsable = true;
	export let currentAnalysis;
	export let enabled = true;

	let expanded = true;
	let hidden = false;
	const dispatch = createEventDispatcher();

	if (collapsable === "false") {
		collapsable = false;
	}

	function toggle() {
		if (enabled && collapsable) {
			expanded = !expanded;
		}
	}

	function getLabelClassString(treeModelNode) {
		let ret = null;
		if (treeModelNode.root) {
			ret = "font-semibold w-full text-center uppercase";
		} else if (treeModelNode.header) {
			ret = "font-medium pl-1 py-px w-full bg-gray-300 uppercase"
		} else {
			ret = "font-medium";
		}
		return ret;
	}

	function dispatchNodeChangeEvent(event) {
		if (enabled) {
			dispatch('nodeEvent', event);
		}
	}

	$: hidden = treeModelNode && treeModelNode.children.length <= 1 && !treeModelNode.header;


</script>

<div class="text-xs">

	{#if treeModelNode}

		<div class="flex inline items-center text-gray-900 ml-1 {hidden ? 'hidden' : (treeModelNode.header ? 'my-2' : 'my-1')}">
			<span on:click={toggle} class="{getLabelClassString(treeModelNode)}">{treeModelNode.label}</span>
		</div>

		{#if expanded}
			<ul class="{collapsable ? 'border-l border-grey-300' : ''} {hidden ? '' : 'ml-2'}">
				{#each treeModelNode.children as child}
					<li>
						{#if child.hasChildren()}
							<svelte:self treeModelNode={child} collapsable={collapsable} on:nodeEvent={dispatchNodeChangeEvent} currentAnalysis={currentAnalysis} enabled={enabled}/>
						{:else}
							{#if child.type === "level"}
								<QueryLevelTreeLeafNode treeModelNode={child} on:nodeEvent={dispatchNodeChangeEvent} currentAnalysis={currentAnalysis} enabled={enabled}/>
							{:else}
								<!-- currently only these two types of leaf -->
								<QueryMeasureTreeLeafNode treeModelNode={child} on:nodeEvent={dispatchNodeChangeEvent} currentAnalysis={currentAnalysis} enabled={enabled}/>
							{/if}
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

	{/if}

</div>
