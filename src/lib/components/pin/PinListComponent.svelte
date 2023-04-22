<script>
    import {onMount} from "svelte";
    import {supabaseClient} from "$lib/supabaseClient";
    import dbUtil from "$lib/dbUtil";
    import {page} from "$app/stores";
    import PinComponent from "$lib/components/pin/PinComponent.svelte";

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

    function handleSearch(event) {
        if (event.submitter.id === 'reset-btn') {
            searchParams = {}
        }
        pins = []
        searchPins()
        showSearchModal = false
    }

    const handleDeletePin = (params) => {
        return async (opts) => {
            const formData = new FormData(params.form);
            const pinId = Object.fromEntries(formData)['pin-id'];
            pins = pins.filter(pin => pin.id !== pinId)
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
        <div class="flex">
            <label for="search-pins-modal" class="btn">Search</label>
            {#if isFiltered}
                <a on:click={resetFilters}>Reset Filters</a>
            {/if}
            <input type="checkbox" bind:checked={showSearchModal} id="search-pins-modal" class="modal-toggle"/>
            <div class="modal">
                <div class="modal-box relative">
                    <label for="search-pins-modal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <form name="search-pin-form" method="POST" class="flex w-full flex-col"
                          on:submit|preventDefault={handleSearch}>
                        <input maxlength="250" name="pin-title" type="text" placeholder="Search by title..."
                               bind:value={searchParams.title}
                               class="input-info input rounded-none"/>
                        <input maxlength="2048" name="pin-url" type="text" placeholder="Search by URL..."
                               bind:value={searchParams.url}
                               class="input-info input rounded-none"/>
                        <input maxlength="400" name="pin-description" placeholder="Search by description..."
                               class="input-info input rounded-none"
                               bind:value={searchParams.description}/>
                        <select name="pin-board-id" class="select select-bordered"
                                bind:value={searchParams.board_id}>
                            {#each boards as board}
                                <option value={board.id}>{board.name}</option>
                            {/each}
                        </select>
                        <select name="pin-owner-id" class="select select-bordered"
                                bind:value={searchParams.owner_id}>
                            {#each profiles as profile}
                                <option value={profile.id}>{profile.username}</option>
                            {/each}
                        </select>
                        <label for="pin-created-at-from">From</label>
                        <input id="pin-created-at-from" type="date" name="pin-created-at-from" class="input"
                               bind:value={searchParams.fromDate}/>
                        <label for="pin-created-at-to">To</label>
                        <input id="pin-created-at-to" type="date" name="pin-created-at-to" class="input"
                               bind:value={searchParams.toDate}/>
                        <button id="search-btn" class="btn gap-2 rounded-none btn-info text-white font-bold">Search
                        </button>
                        <button id="reset-btn" class="btn gap-2 rounded-none btn-info text-white font-bold">Reset
                        </button>
                    </form>
                </div>
            </div>
        </div>
        <ul>
            <li><span class="float-right">Showing {pins.length} pins out of {allPinsCount}</span></li>
            {#each pins as pin}
                <li>
                    <PinComponent pin={pin} onDeletePin={handleDeletePin} onToggleStar={handleStarToggle}/>
                </li>
            {/each}
        </ul>
        <button class:hidden={pins.length >= allPinsCount} class="btn btn-link" on:click={searchPins}>
            Load more
        </button>
    </div>
</div>
