<script>
    import EditPinFormComponent from "$lib/components/feed/EditPinFormComponent.svelte";
    import {page} from '$app/stores'

    const mode = $page.url.searchParams.get('newPin') === 'true' ? 'NEW' : 'EXISTING'
    export let data;
</script>

<EditPinFormComponent pin={data.pin} mode={mode}/>

