<script>
    import {onMount} from "svelte";
    import {supabaseClient} from "$lib/supabaseClient";
    import {enhance} from '$app/forms';
    import dbUtil from "$lib/dbUtil";
    import {page} from "$app/stores";

    let showPinCount = 10
    let pins = [];
    let boards = [];
    let profiles = [];
    let allPinsCount = 0;
    let searchParams = {}
    let showSearchModal = false

    const searchPins = async () => {
        const {data} = await dbUtil(supabaseClient).pins.search(
            `id,title,url,description,owner_id,boards (name),profiles (username),pin_stars (profiles (id,username)),created_at`,
            searchParams,
            {by: 'created_at', opts: {ascending: false}},
            {start: pins.length, end: pins.length + showPinCount - 1}
        );
        allPinsCount = (await dbUtil(supabaseClient).pins.search(`*`, searchParams, {}, {}, true)).count
        pins = [...pins, ...populateExtraData(data)]
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
            const pinIdx = pins.findIndex(pin => pin.id === pinId)
            pins[pinIdx].hasStarred = !pins[pinIdx].hasStarred
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
            <input type="checkbox" bind:checked={showSearchModal} id="search-pins-modal" class="modal-toggle"/>
            <div class="modal">
                <div class="modal-box relative">
                    <label for="search-pins-modal" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                    <form name="search-pin-form" method="POST" class="flex w-full flex-col"
                          on:submit|preventDefault={handleSearch}>
                        <input name="pin-title" type="text" placeholder="Search by title..."
                               bind:value={searchParams.title}
                               class="input-info input rounded-none"/>
                        <input name="pin-url" type="text" placeholder="Search by URL..."
                               bind:value={searchParams.url}
                               class="input-info input rounded-none"/>
                        <textarea name="pin-description" placeholder="Search by description..."
                                  bind:value={searchParams.description}></textarea>
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
                    <div class="card w-full bg-base-100 shadow mb-4 rounded-none">
                        <div class="card-body text-sm">
                            <div class="grid grid-cols-12">
                                <div class="card-title text-info col-span-11 break-words break-all">
                                    <a target="_blank" href="{pin.url}">{pin.title}</a>
                                </div>
                                {#if pin.isOwnPin}
                                    <div class="justify-self-end">
                                        <a href={`/app/pin/${pin.id}`}>Edit</a>
                                        <div class="dropdown dropdown-bottom dropdown-end">
                                            <div tabindex="0" class="m-1 cursor-pointer">Delete</div>
                                            <div tabindex="0"
                                                 class="dropdown-content card card-compact w-64 p-2 shadow bg-warning">
                                                <div class="card-body">
                                                    <p>Do you really want to delete this pin?</p>
                                                    <div class="card-actions justify-end">
                                                        <form name="delete-pin-form" method="POST" action="?/deletePin"
                                                              use:enhance={handleDeletePin}>
                                                            <input name="pin-id" type="hidden" value={pin.id}/>
                                                            <button class="btn btn-error btn-xs">Yes, delete</button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                            <p class="whitespace-pre-wrap break-words">{pin.description}</p>
                            <div class="card-actions justify-end text-xs">
                                {pin.boards?.name}
                                {pin.profiles?.username}
                                {pin.created_at}
                                {pin.pin_stars.length}
                                <form name="toggle-pin-star-form" method="POST" action="?/toggleStar"
                                      use:enhance={handleStarToggle}>
                                    <input name="pin-id" type="hidden" value={pin.id}/>
                                    <button class="btn btn-xs">
                                        {#if pin.hasStarred}
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                 fill="currentColor" class="w-6 h-6">
                                                <path fill-rule="evenodd"
                                                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                      clip-rule="evenodd"/>
                                            </svg>
                                        {:else }
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                                            </svg>
                                        {/if}
                                    </button>
                                </form>

                            </div>
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
        <button class:hidden={pins.length >= allPinsCount} class="btn btn-link" on:click={searchPins}>
            Load more
        </button>
    </div>
</div>
