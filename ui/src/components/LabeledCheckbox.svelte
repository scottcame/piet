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

  import { createEventDispatcher } from 'svelte';

  export let value;
  export let label = "Checkbox label";

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('click');
  }


</script>

<div class="flex flex-inline items-center">
  <div class="mr-2 ml-1 border w-4 h-4 hover:bg-gray-300 {value ? 'bg-gray-900 hover:bg-gray-900' : ''}" on:click={ e => handleClick() }></div>
  <div>{label}</div>
</div>
