<script>
    import EditPinFormComponent from "$lib/components/feed/EditPinFormComponent.svelte";

    export let data;
</script>

<EditPinFormComponent pin={data.pin}/>
<h1>{JSON.stringify(data.pin)}</h1>
