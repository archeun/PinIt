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
    let showSearchModal = false
    let isFiltered = false

    const searchPins = async () => {
        const {data} = await dbUtil(supabaseClient).pins.search(
            pinAttributes,
            searchParams,
            {by: 'created_at', opts: {ascending: false}},
            {start: pins.length, end: pins.length + showPinCount - 1}
        );
        allPinsCount = (await dbUtil(supabaseClient).pins.search(`*`, searchParams, {}, {}, true)).count
        pins = [...pins, ...populateExtraData(data)]
        isFiltered = Object.values(searchParams).some(p => !!p);
    }

    async function resetAndSearchPins() {
        pins = []
        await searchPins()
    }

    function handleSearch(event) {
        if (event.submitter.id === 'reset-btn') {
            searchParams = {}
        }
        resetAndSearchPins()
        showSearchModal = false
    }

    const handleDeletePin = (params) => {
        return async (opts) => {
            await resetAndSearchPins()
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
        handleSearch({submitter: {id: 'reset-btn'}})
    }

    onMount(async () => {
        await searchPins()
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
                <label for="search-pins-modal" class="btn btn-xs btn-outline btn-success mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor" class="w-3.5 h-3.5 mr-2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"/>
                    </svg>
                    Filter Pins
                </label>
                {#if isFiltered}
                    <a class="text-warning text-sm font-bold underline cursor-pointer" on:click={resetFilters}>
                        Reset Filters
                    </a>
                {/if}
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
            {#if pins.length === 0}
                {#each [1, 2] as i}
                    <PinLoadingSkeletonComponent/>
                {/each}
            {:else }
                {#each pins as pin}
                    <li>
                        <PinComponent pin={pin} onDeletePin={handleDeletePin} onToggleStar={handleStarToggle}/>
                    </li>
                {/each}
            {/if}
        </ul>
        <button class:hidden={pins.length >= allPinsCount} class="btn btn-link" on:click={searchPins}>
            Load more
        </button>
    </div>
</div>
