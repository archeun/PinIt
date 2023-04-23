<script>
    import {enhance} from '$app/forms';
    import {onMount} from "svelte";
    import {supabaseClient} from "$lib/supabaseClient";
    import dbUtil from "$lib/dbUtil";
    import PinComponent from "$lib/components/pin/PinComponent.svelte";
    import {validateForm} from "$lib/formUtil";
    import FormFieldErrorsComponent from "$lib/components/core/FormFieldErrorsComponent.svelte";
    import toast, {Toaster} from 'svelte-french-toast';
    import PinLoadingSkeletonComponent from "$lib/components/pin/PinLoadingSkeletonComponent.svelte";

    export let pin = {};
    export let mode = 'EXISTING';
    let fetchingMetadata = true;
    let disableSaveBtn = true;
    let boards = [];
    let validationErrors = []

    onMount(async () => {
        if (mode === 'NEW') {
            await autoGenerateMetadata()
        }
        const {data} = await dbUtil(supabaseClient).boards.getAll()
        boards = data
        fetchingMetadata = false;
        disableSaveBtn = false;
    })

    const autoGenerateMetadata = async () => {
        fetchingMetadata = true
        disableSaveBtn = true;
        let response = {};
        try {
            response = await fetch(`/api/url-metadata?url=${pin.url}`);
            const urlMetadata = await response.json();
            if (!urlMetadata.title) {
                toast.error('Could not automatically fetch information from the given URL. Please check whether it is a valid URL.')
            }
            pin.title = urlMetadata.title ?? pin.title
            pin.description = urlMetadata.description ?? pin.description
            pin.image = urlMetadata.images ? urlMetadata.images[0] : '' ?? pin.image
        } catch (e) {
            toast.error('Could not fetch metadata from the given URL')
        }
        setTimeout(validateEditPinForm, 0)
        fetchingMetadata = false
        disableSaveBtn = false;
    }

    const validateEditPinForm = () => {
        validationErrors = validateForm(Object.fromEntries(new FormData(document.querySelector('form'))));
    }

    const formEnhanceCallback = ({form, data, action, cancel, submitter}) => {
        disableSaveBtn = true
        validateEditPinForm()
        if (Object.keys(validationErrors).length) {
            cancel();
        }
        return async ({result}) => {
            if (result.type === 'success') {
                toast.success('Successfully updated.')
            } else {
                toast.error('Something went wrong.')
            }
            disableSaveBtn = false;
        };
    }

    const onUrlChange = () => {
        validateEditPinForm()
        autoGenerateMetadata()
    }

</script>

<div class="p-4 mb-4 flex justify-center">
    <div class="card card-compact w-[80%] bg-base-200 shadow-xl">
        <div class="card-body">
            <h2 class="card-title border-b border-b-gray-700 pb-3">Make changes to your Pin!</h2>
            <form name="edit-pin-form" method="POST" class="col-span-12" use:enhance={formEnhanceCallback}>
                <label for="pin-url" class="text-xs font-bold">URL</label>
                <input on:change={onUrlChange} name="pin-url" id="pin-url" type="text"
                       placeholder="Paste the URL here..."
                       bind:value={pin.url}
                       class="input input-sm rounded-none w-full mb-2 mt-1"/>
                <FormFieldErrorsComponent errors={validationErrors['pin-url']}/>

                <label for="pin-title" class="text-xs font-bold">Title</label>
                <input on:keyup={validateEditPinForm} name="pin-title" id="pin-title" type="text"
                       placeholder="Title of the pin..."
                       bind:value={pin.title}
                       class="input input-sm rounded-none w-full mb-2 mt-1"/>
                <FormFieldErrorsComponent errors={validationErrors['pin-title']}/>

                <input name="pin-image" type="hidden" bind:value={pin.image}/>

                <label for="pin-description" class="text-xs font-bold">Description</label>
                <textarea on:keyup={validateEditPinForm} name="pin-description" id="pin-description"
                          class="textarea textarea-bordered w-full mb-2 mt-1" rows="3"
                          placeholder="Description of the pin..."
                          bind:value={pin.description}></textarea>
                <FormFieldErrorsComponent errors={validationErrors['pin-description']}/>

                <div class="grid grid-cols-12">
                    <div class="col-span-12 grid">
                        <label for="pin-board-id" class="text-xs font-bold">Board</label>
                        <select name="pin-board-id" id="pin-board-id"
                                class="select select-sm select-bordered w-full max-w-xs mb-2 mt-1"
                                bind:value={pin.board_id}>
                            {#each boards as board}
                                <option value={board.id}>{board.name}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                <div class="divider">Preview</div>
                {#if fetchingMetadata}
                    <PinLoadingSkeletonComponent/>
                {:else }
                    <PinComponent pin={pin} mode="preview"/>
                {/if}
                <button class:btn-disabled={disableSaveBtn} class:loading={disableSaveBtn} class="btn gap-2 rounded-none btn-info text-white font-bold w-full">Save</button>
            </form>
        </div>
    </div>

    <Toaster/>
</div>