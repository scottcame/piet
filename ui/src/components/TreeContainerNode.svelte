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
	const dispatch = createEventDispatcher();

	if (collapsable === "false") {
		collapsable = false;
	}

	function toggle() {
		if (enabled && collapsable) {
			expanded = !expanded;
		}
	}

	function getLabelWeightClass(treeModelNode) {
		let ret = "font-light";
		if (treeModelNode.type === "dataset") {
			ret = "font-semibold";
		} else if (/measures|dimensions?|hierarchy/.test(treeModelNode.type)) {
			ret = "font-medium";
		}
		return ret;
	}

	function dispatchNodeChangeEvent(event) {
		if (enabled) {
			dispatch('nodeEvent', event);
		}
	}

</script>

<div class="pl-2 text-xs">

	{#if treeModelNode }

		<div class="flex inline items-center text-gray-900 my-1">
			<span on:click={toggle} class="{getLabelWeightClass(treeModelNode)} uppercase">{treeModelNode.label}</span>
		</div>

		{#if expanded}
			<ul class="{collapsable ? 'border-l border-grey-300' : ''}">
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
