<script>

	import TreeLeafNode from './TreeLeafNode.svelte';
	import IconDatabase from './icons/IconDatabase.svelte';
	import IconCube from './icons/IconCube.svelte';
	import IconGauge from './icons/IconGauge.svelte';
	import IconLayers from './icons/IconLayers.svelte';
	import { TreeModelNode, TreeModelLeafNode, TreeModelContainerNode } from '../js/ui/model/Tree';

	export let treeModelNode;
	let expanded = true;

	function toggle() {
		expanded = !expanded;
	}

</script>

<div class="pl-3">

	{#if treeModelNode }

		<div class="flex inline items-center text-gray-900 mb-1">
			<div class="h-5 w-5 items-center flex">
				{#if treeModelNode.type === 'dataset'}
					<IconDatabase/>
				{:else if treeModelNode.type === 'cube'}
					<IconCube/>
				{:else if treeModelNode.type === 'measures'}
					<IconGauge/>
				{:else if treeModelNode.type === 'dimensions'}
					<IconLayers/>
				{/if}
			</div>
			<span on:click={toggle} class="ml-2 font-semibold">{treeModelNode.label}</span>
		</div>

		{#if expanded}
			<ul class="border-l border-grey-300">
				{#each treeModelNode.children as child}
					<li>
						{#if child.hasChildren()}
							<svelte:self treeModelNode={child}/>
						{:else}
							<TreeLeafNode treeModelNode={child}/>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

	{/if}

</div>
