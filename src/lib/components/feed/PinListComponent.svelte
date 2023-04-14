<script>
    import {onMount} from "svelte";
    import {supabaseClient} from "$lib/supabaseClient";
    import {enhance} from '$app/forms';
    import dbUtil from "$lib/dbUtil";

    let pins = [];

    onMount(async () => {
        const {data} = await dbUtil(supabaseClient).pins.getAll(
            `id,title,url,description,boards (name),profiles (username),created_at`
        )
        pins = data
    });
</script>

<div class="pl-2 mb-4 flex">
    <div class="overflow-x-auto">
        <ul>
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
                                                          use:enhance>
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
    </div>
</div>
