<script>
    import {onMount} from "svelte";
    import {supabaseClient} from "$lib/supabaseClient";

    let pins = [];

    onMount(async () => {
        let {data, error} = await supabaseClient
            .from('pins')
            .select(`
                id,
                title,
                url,
                description,
                boards (
                  name
                ),
                profiles (
                  username
                ),
                created_at
            `);
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
