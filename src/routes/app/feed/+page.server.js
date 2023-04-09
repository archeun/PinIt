import {getSupabase} from "@supabase/auth-helpers-sveltekit";

export const actions = {
    default: async (event) => {
        const {supabaseClient} = await getSupabase(event);
        const formData = await event.request.formData();
        const {data, error} = await supabaseClient
            .from('pins')
            .insert([
                {title: formData.get('pin-url'), url: formData.get('pin-url')},
            ])
        console.error(data)
    }
};