<script>
    import {onMount} from "svelte";
    import {supabaseClient} from "$lib/supabaseClient";
    import dbUtil from "$lib/dbUtil";
    import {page} from "$app/stores";
    import PinComponent from "$lib/components/pin/PinComponent.svelte";
    import PinLoadingSkeletonComponent from "$lib/components/pin/PinLoadingSkeletonComponent.svelte";
    import toast from 'svelte-french-toast';

    const pinAttributes = `id,title,url,description,owner_id,image,boards (name),profiles (username),pin_stars (profiles (id,username)),created_at`;
    let showPinCount = 10
    let pins = [];
    let boards = [];
    let profiles = [];
    let allPinsCount = 0;
    let searchParams = {}
    let isListLoading = true
    let showSearchModal = false
    let isFiltered = false
    let isSorted = false
    let sortedByAndOrder = 'Newest first'

    const searchPins = async (fullListLoad = true) => {
        isListLoading = fullListLoad
        const {data} = await dbUtil(supabaseClient).pins.search(
            pinAttributes,
            searchParams,
            searchParams.order ?? {by: 'created_at', opts: {ascending: false}},
            {start: pins.length, end: pins.length + showPinCount - 1}
        );
        allPinsCount = (await dbUtil(supabaseClient).pins.search(`*`, searchParams, {}, {}, true)).count
        pins = [...pins, ...populateExtraData(data)]
        isFiltered = Object.values(searchParams).some(p => typeof p !== 'object' && !!p);
        isSorted = Object.values(searchParams).some(p => typeof p === 'object' && !(p.by === 'created_at' && !p.opts.ascending));
        isListLoading = false
    }

    function resetSearchParams() {
        searchParams = {
            order: {by: 'created_at', opts: {ascending: false}}
        }
    }

    async function newlyFetchPins() {
        pins = []
        await searchPins()
    }

    function handleSearch(event) {
        if (event.submitter.id === 'reset-btn') {
            resetSearchParams()
        }
        newlyFetchPins()
        showSearchModal = false
    }

    const handleDeletePin = (params) => {
        return async (opts) => {
            await newlyFetchPins()
            toast.success('Successfully deleted the Pin')
        };
    }

    const handleStarToggle = (params) => {
        return async (opts) => {
            const formData = new FormData(params.form);
            const pinId = Object.fromEntries(formData)['pin-id'];
            const pinIdx = pins.findIndex(pin => pin.id === pinId);
            const {data} = await dbUtil(supabaseClient).pins.getOne(pinId, pinAttributes)
            pins[pinIdx] = data
            pins = populateExtraData(pins)
        };
    }

    const populateExtraData = (pins) => {
        const loggedInUserId = $page.data.session.user.id;
        pins = pins.map(pin => {
            pin.isOwnPin = pin.owner_id === loggedInUserId
            pin.hasStarred = pin.pin_stars.some(pin_star => pin_star.profiles.id === loggedInUserId)
            return pin
        })
        return pins;
    }

    const resetFilters = () => {
        sortedByAndOrder = 'Newest first'
        handleSearch({submitter: {id: 'reset-btn'}})
    }

    const onSortAction = (sortBy, sortOrder, sortText) => {
        searchParams = {
            ...searchParams,
            order: {by: sortBy, opts: {ascending: sortOrder}}
        }
        newlyFetchPins()
        sortedByAndOrder = sortText
    }

    onMount(async () => {
        resetSearchParams()
        await newlyFetchPins()
        const boardsData = await dbUtil(supabaseClient).boards.getAll()
        const profilesData = await dbUtil(supabaseClient).profiles.getAll()
        boards = boardsData.data
        profiles = profilesData.data
    });
</script>

<div class="flex pl-4 pr-4" id="pin-list-container">
    <div class="w-full">
        <div class="grid grid-cols-12">
            <div class="col-span-10">
                <div class="flex">
                    <label for="search-pins-modal" class="btn btn-xs btn-success mt-1" class:btn-outline={!isFiltered}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" class="w-3.5 h-3.5 mr-2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"/>
                        </svg>
                        Filter Pins
                    </label>
                    <div class="dropdown ml-2 mt-1 dropdown-hover">
                        <label tabindex="0" class="btn btn-xs btn-outline btn-primary" class:btn-outline={!isSorted}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                 stroke="currentColor" class="w-3.5 h-3.5 mr-2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"/>
                            </svg>
                            Sort by
                        </label>
                        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                            <li class="text-xs">
                                <a on:click={() => onSortAction('created_at', false, 'Newest first')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
                                    </svg>
                                    Newest first <em>(Default)</em>
                                </a>
                            </li>
                            <li class="text-xs">
                                <a on:click={() => onSortAction('created_at', true, 'Oldest first')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25"/>
                                    </svg>
                                    Oldest first
                                </a>
                            </li>
                            <li class="text-xs">
                                <a on:click={() => onSortAction('pin_stars_count', false, 'Highest starred first')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
                                    </svg>
                                    Highest starred first
                                </a>
                            </li>
                            <li class="text-xs">
                                <a on:click={() => onSortAction('pin_stars_count', true, 'Lowest starred first')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                                    </svg>
                                    Lowest starred first
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div class="text-xs ml-2 mt-2">
                        (<em>{sortedByAndOrder}</em>)
                    </div>
                    {#if (isFiltered || isSorted)}
                        <a class="text-warning text-sm font-bold underline cursor-pointer mt-1.5 ml-2"
                           on:click={resetFilters}>
                            Reset filters/sorting
                        </a>
                    {/if}
                </div>
                <input type="checkbox" bind:checked={showSearchModal} id="search-pins-modal" class="modal-toggle"/>
                <div class="modal">
                    <div class="modal-box relative">
                        <h3 class="font-bold text-lg">Filter Pins</h3>
                        <label for="search-pins-modal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                        <form name="search-pin-form" method="POST" class="flex w-full flex-col mt-5"
                              on:submit|preventDefault={handleSearch}>
                            <label class="text-sm font-bold mb-1" for="pin-board-id">Title</label>
                            <input maxlength="250" name="pin-title" type="text" placeholder="Search by title..."
                                   bind:value={searchParams.title}
                                   class="input-bordered input rounded-none mb-2 input-sm"/>
                            <label class="text-sm font-bold mb-1" for="pin-board-id">URL</label>
                            <input maxlength="2048" name="pin-url" type="text" placeholder="Search by URL..."
                                   bind:value={searchParams.url}
                                   class="input-bordered input rounded-none mb-2 input-sm"/>
                            <label class="text-sm font-bold mb-1" for="pin-board-id">Description</label>
                            <input maxlength="400" name="pin-description" placeholder="Search by description..."
                                   class="input-bordered input rounded-none mb-2 input-sm"
                                   bind:value={searchParams.description}/>
                            <div class="grid grid-cols-12">
                                <div class="grid col-span-6">
                                    <label class="text-sm font-bold mb-1" for="pin-board-id">Board</label>
                                    <select name="pin-board-id" id="pin-board-id"
                                            class="select select-bordered rounded-none mb-2 select-sm"
                                            bind:value={searchParams.board_id}>
                                        {#each boards as board}
                                            <option value={board.id}>{board.name}</option>
                                        {/each}
                                    </select>
                                </div>
                                <div class="grid col-span-6">
                                    <label class="text-sm font-bold mb-1" for="pin-owner-id">Owner</label>
                                    <select name="pin-owner-id" id="pin-owner-id"
                                            class="select select-bordered rounded-none mb-2 select-sm"
                                            bind:value={searchParams.owner_id}>
                                        {#each profiles as profile}
                                            <option value={profile.id}>{profile.username}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-12">
                                <div class="grid col-span-6">
                                    <label class="text-sm font-bold mb-1" for="pin-created-at-from">From</label>
                                    <input id="pin-created-at-from" type="date" name="pin-created-at-from"
                                           class="input input-bordered rounded-none mb-2 input-sm"
                                           bind:value={searchParams.fromDate}/>
                                </div>
                                <div class="grid col-span-6">
                                    <label class="text-sm font-bold mb-1" for="pin-created-at-to">To</label>
                                    <input id="pin-created-at-to" type="date" name="pin-created-at-to"
                                           class="input input-bordered rounded-none mb-2 input-sm"
                                           bind:value={searchParams.toDate}/>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="grid grid-cols-12 gap-2">
                                <button id="search-btn"
                                        class="btn rounded-none btn-sm col-span-10 btn-primary text-white font-bold">
                                    Search
                                </button>
                                <button id="reset-btn"
                                        class="btn rounded-none btn-sm col-span-2 btn-secondary text-white font-bold">
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="text-xs col-span-2 mt-1 self-center place-self-end">Showing {pins.length} pins out
                of {allPinsCount}</div>
        </div>
        <ul class="mt-2">

            {#if isListLoading}
                {#each [1, 2] as i}
                    <PinLoadingSkeletonComponent/>
                {/each}
            {:else if (pins.length === 0)}
                <div class="hero mt-[5%]">
                    <div class="hero-content text-center">
                        <div class="max-w-md">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 stroke-width="1.5" stroke="currentColor" class="w-52 h-52 inline-block">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/>
                            </svg>
                            <h1 class="text-5xl font-bold">No Pins found!</h1>
                            <p class="py-6">
                                If you have searched the list, please try a different search criteria :)
                            </p>
                        </div>
                    </div>
                </div>
            {:else }
                {#each pins as pin}
                    <li>
                        <PinComponent pin={pin} onDeletePin={handleDeletePin} onToggleStar={handleStarToggle}/>
                    </li>
                {/each}
            {/if}
        </ul>
        <button class:hidden={pins.length >= allPinsCount} class="btn btn-link" on:click={() => searchPins(false)}>
            Load more
        </button>
    </div>
</div>
