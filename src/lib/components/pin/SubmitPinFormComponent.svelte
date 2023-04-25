<script>
    import {enhance} from '$app/forms';
    import {goto} from "$app/navigation";
    import {validateForm} from "$lib/formUtil";
    import FormFieldErrorsComponent from "$lib/components/core/FormFieldErrorsComponent.svelte";

    let validationErrors = []

    const validateSubmitPinForm = () => {
        validationErrors = validateForm(Object.fromEntries(new FormData(document.querySelector('form'))));
    }

    const formEnhanceCallback = ({form, data, action, cancel, submitter}) => {
        validateSubmitPinForm()
        if (Object.keys(validationErrors).length) {
            cancel();
        }
        return async ({result, update}) => {
            if (result.status === 200 && result.type === 'success' && result.data && result.data.id) {
                await goto(`/app/pin/${result.data.id}?newPin=true`)
            }
        };
    }
</script>

<div class="pl-4 pr-4 pt-4">
    <div class="flex mb-2">
        <span class="bg-info pt-3 pl-3.5 pr-3.5 ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                 stroke="currentColor" class="w-6 h-6 text-white">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
            </svg>
        </span>
        <form name="submit-pin-form" method="POST" class="flex w-full" action="?/submitPin"
              use:enhance={formEnhanceCallback}>
            <input on:change={validateSubmitPinForm} name="pin-url" type="text" placeholder="Paste the URL here..."
                   class="input-info input rounded-none w-full"/>
            <button class="btn gap-2 rounded-none btn-info text-white font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                     stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                </svg>
                Pin-It
            </button>
        </form>
    </div>
    <FormFieldErrorsComponent errors={validationErrors ? validationErrors['pin-url']: []}/>
</div>
