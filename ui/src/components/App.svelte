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

  import MainNavbar from './MainNavbar.svelte';
  import MainContainer from './MainContainer.svelte';
  import ErrorModal from './ErrorModal.svelte';
  import { currentView } from '../js/Stores';
  import { List } from '../js/collections/List';
  import { Workspace } from '../js/model/Workspace';
  import { LocalRepository, RemoteRepository, RepositoryError } from '../js/model/Repository';

  export let remote;

  let initialized = false;
  let initializationFailureMessage = null;
  let includeErrorRefreshHint = true;
  let navBarController;
  let title;
  let logoImageUrl;

  // default nav
  currentView.set("analyses");

  const repository = remote ? new RemoteRepository("/piet") : new LocalRepository();

  repository.init().then(() => {
    initialized = true;
    title = repository.pietConfiguration.applicationTitle;
    logoImageUrl = repository.pietConfiguration.logoImageUrl;
    repository.log.info("Initialization complete");
  }).catch((reason) => {
    if (/dataset.+not found/.test(reason)) {
      reason = "The analyses in your workspace are out of sync with available datasets and cannot be restored. Refresh the page to continue.";
      repository.clearWorkspace();
      includeErrorRefreshHint = false;
    } else if (reason instanceof RepositoryError) {
      reason = reason.message;
    }
    initializationFailureMessage = reason;
  });

</script>

<div class="text-sm h-full">
  {#if !initialized && !initializationFailureMessage}
    <div class="absolute top-0 left-0 h-full w-full opacity-75 bg-gray-200 items-center">
      <div class="h-full w-full absolute flex items-center justify-center top-0 left-0 text-center z-10">
        <div class="flex p-8 border border-gray-500"><div class="spinner"></div><div class="ml-4">Initializing connections...</div></div>
      </div>
    </div>
  {/if}
  {#if initializationFailureMessage}
    <ErrorModal message={initializationFailureMessage} includeRefreshHint={includeErrorRefreshHint}/>
  {/if}
  {#if initialized}
  <MainNavbar
    initialized={initialized}
    applicationTitle={title}
    logoImageUrl={logoImageUrl}
    on:nav-new-analysis="{e => navBarController.handleNewAnalysis(e)}"
    on:nav-browse-analyses="{e => navBarController.handleBrowseAnalyses(e)}"
  />
  <MainContainer repository={repository} bind:navBarController={navBarController}/>
  {/if}
</div>
