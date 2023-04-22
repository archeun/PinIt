<script>
    import {enhance} from '$app/forms';
    import {onMount} from "svelte";
    import {supabaseClient} from "$lib/supabaseClient";
    import dbUtil from "$lib/dbUtil";
    import PinComponent from "$lib/components/pin/PinComponent.svelte";
    import {validateForm} from "$lib/formUtil";
    import FormFieldErrorsComponent from "$lib/components/core/FormFieldErrorsComponent.svelte";

    export let pin = {};
    export let mode = 'EXISTING';
    let boards = [];
    let validationErrors = []

    onMount(async () => {
        if (mode === 'NEW') {
            await autoGenerateMetadata()
        }
        const {data} = await dbUtil(supabaseClient).boards.getAll()
        boards = data
    })

    const autoGenerateMetadata = async () => {
        const response = await fetch(`/api/url-metadata?url=${pin.url}`);
        const urlMetadata = await response.json();
        pin.title = urlMetadata.title
        pin.description = urlMetadata.description
        pin.image = urlMetadata.images ? urlMetadata.images[0] : ''
    }

    const validateEditPinForm = () => {
        validationErrors = validateForm(Object.fromEntries(new FormData(document.querySelector('form'))));
    }

    const formEnhanceCallback = ({form, data, action, cancel, submitter}) => {
        validateEditPinForm()
        if (Object.keys(validationErrors).length) {
            cancel();
        }
        return async (res) => {
        };
    }

</script>

<div class="p-4 mb-4 flex flex-col">
    <form name="edit-pin-form" method="POST" class="flex w-full flex-col" use:enhance={formEnhanceCallback}>
        <input on:change={validateEditPinForm} name="pin-url" type="text" placeholder="Paste the URL here..."
               bind:value={pin.url}
               class="input-info input rounded-none w-full"/>
        <FormFieldErrorsComponent errors={validationErrors['pin-url']}/>
        <a class="btn btn-xs mt-2 mb-2" on:click={autoGenerateMetadata}>Auto Generate Metadata</a>
        <input on:change={validateEditPinForm} name="pin-title" type="text" placeholder="Title of the pin..."
               bind:value={pin.title}
               class="input-info input rounded-none w-full"/>
        <FormFieldErrorsComponent errors={validationErrors['pin-title']}/>
        <input name="pin-image" type="hidden" bind:value={pin.image}/>
        <textarea on:change={validateEditPinForm} name="pin-description" placeholder="Description of the pin..."
                  bind:value={pin.description}></textarea>
        <FormFieldErrorsComponent errors={validationErrors['pin-description']}/>
        <select name="pin-board-id" class="select select-bordered w-full max-w-xs" bind:value={pin.board_id}>
            {#each boards as board}
                <option value={board.id}>{board.name}</option>
            {/each}
        </select>
        <PinComponent pin={pin} mode="preview"/>
        <button class="btn gap-2 rounded-none btn-info text-white font-bold">Save</button>
    </form>
</div>