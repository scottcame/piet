<script>

	import TreeLeafNode from './TreeLeafNode.svelte';
	import { TreeModelNode, TreeModelLeafNode, TreeModelContainerNode } from '../js/ui/model/Tree';

	export let treeModelNode;
	export let collapsable = true;
	let expanded = true;

	if (collapsable === "false") {
		collapsable = false;
	}

	function toggle() {
		if (collapsable) {
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
							<svelte:self treeModelNode={child} collapsable={collapsable}/>
						{:else}
							<TreeLeafNode treeModelNode={child}/>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

	{/if}

</div>
