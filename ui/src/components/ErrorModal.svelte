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
  export let message;
  export let includeRefreshHint = true;
</script>

<div class="absolute top-0 left-0 h-full w-full items-center">
  <div class="h-full w-full absolute flex items-center justify-center top-0 left-0 text-center z-10">
    <div class="flex flex-col p-8 border border-gray-500">
      <div class="ml-4">{message}</div>
      {#if includeRefreshHint}
        <div class="ml-4">Once the problem is resolved, refresh the page to restore your workspace.</div>
      {/if}
    </div>
  </div>
</div>
