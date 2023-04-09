<script>
    import {onMount} from "svelte";
    import {supabaseClient} from "$lib/supabaseClient";

    let pins = [];

    onMount(async () => {
        let {data, error} = await supabaseClient
            .from('pins')
            .select('title,url');
        pins = data
    });
</script>

<h1>Pin List</h1>
<ul>
    {#each pins as pin}
        <li>{pin.title}: {pin.url}</li>
    {/each}
</ul>