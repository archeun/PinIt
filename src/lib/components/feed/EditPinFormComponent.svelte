<script>
    import {enhance} from '$app/forms';

    export let pin = {};
    let title = pin.title;
    let url = pin.url;
    let description = pin.description;
</script>

<div class="p-4 mb-4 flex">
    <form name="edit-pin-form" method="POST" class="flex w-full flex-col" use:enhance>
        <input name="pin-title" type="text" placeholder="Title of the pin..." value={title}
               class="input-info input rounded-none w-full"/>
        <input name="pin-url" type="text" placeholder="Paste the URL here..." value={url}
               class="input-info input rounded-none w-full"/>
        <textarea name="pin-description" placeholder="Description of the pin...">{description}</textarea>

        <button class="btn gap-2 rounded-none btn-info text-white font-bold">Save</button>
    </form>
</div>