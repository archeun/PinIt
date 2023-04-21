<script>
    import {enhance} from '$app/forms';
    import {onMount} from "svelte";
    import {supabaseClient} from "$lib/supabaseClient";
    import dbUtil from "$lib/dbUtil";

    export let pin = {};
    let boards = [];
    onMount(async () => {
        const {data} = await dbUtil(supabaseClient).boards.getAll()
        boards = data
    })
</script>

<div class="p-4 mb-4 flex">
    <form name="edit-pin-form" method="POST" class="flex w-full flex-col" use:enhance>
        <input required name="pin-title" type="text" placeholder="Title of the pin..." bind:value={pin.title}
               class="input-info input rounded-none w-full"/>
        <input required name="pin-url" type="text" placeholder="Paste the URL here..." bind:value={pin.url}
               class="input-info input rounded-none w-full"/>
        <textarea name="pin-description" placeholder="Description of the pin..."
                  bind:value={pin.description}></textarea>
        <select name="pin-board-id" class="select select-bordered w-full max-w-xs" bind:value={pin.board_id}>
            {#each boards as board}
                <option value={board.id}>{board.name}</option>
            {/each}
        </select>
        <button class="btn gap-2 rounded-none btn-info text-white font-bold">Save</button>
    </form>
</div>