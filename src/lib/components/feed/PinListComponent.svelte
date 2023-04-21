<script>
    import {onMount} from "svelte";
    import {supabaseClient} from "$lib/supabaseClient";
    import {enhance} from '$app/forms';
    import dbUtil from "$lib/dbUtil";

    let showPinCount = 10
    let pins = [];
    let boards = [];
    let profiles = [];
    let allPinsCount = 0;
    let searchParams = {}
    let showSearchModal = false

    const searchPins = async () => {
        const {data} = await dbUtil(supabaseClient).pins.search(
            `id,title,url,description,boards (name),profiles (username),created_at`,
            searchParams,
            {by: 'created_at', opts: {ascending: false}},
            {start: pins.length, end: pins.length + showPinCount - 1}
        );
        allPinsCount = (await dbUtil(supabaseClient).pins.search(`*`, searchParams, {}, {}, true)).count
        pins = [...pins, ...data]
    }

    function handleSearch(event) {
        if (event.submitter.id === 'reset-btn') {
            searchParams = {}
        }
        pins = []
        searchPins()
        showSearchModal = false
    }

    const handleDeletePin = (paras) => {
        return async (opts) => {
            const formData = new FormData(paras.form);
            const deletedPinId = Object.fromEntries(formData)['pin-id'];
            pins = pins.filter(pin => pin.id !== deletedPinId)
        };
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
                            </div>
                            <p class="whitespace-pre-wrap break-words">{pin.description}</p>
                            <div class="card-actions justify-end text-xs">
                                {pin.boards?.name}
                                {pin.profiles?.username}
                                {pin.created_at}
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
