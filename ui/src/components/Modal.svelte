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
  export let visible = false;
</script>

<div class="{visible ? '' : 'hidden'}">
  <div class="h-screen w-full fixed top-0 left-0 bg-gray-300 opacity-50 z-0">
  </div>
  <div class="h-screen w-full fixed flex items-center justify-center top-0 left-0 z-10">
    <div class="bg-white rounded shadow w-1/3 max-h-full overflow-visible select-none border border-gray-500">
      <div class="bg-gray-300 p-2 font-semibold">
          <slot name="header">Title</slot>
      </div>
      <div class="p-6">
          <slot name="body">This is the body of the modal dialog, perhaps this line will be long enough to wrap.</slot>
      </div>
      <slot name="buttons">
        <div class="flex flex-inline justify-center mb-4 flex-none">
          <div class="border-2 mr-2 p-2 hover:bg-gray-200">OK</div>
          <div class="border-2 ml-2 p-2 hover:bg-gray-200">Cancel</div>
        </div>
      </slot>
    </div>
  </div>
</div>
