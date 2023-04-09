import {getSupabase} from "@supabase/auth-helpers-sveltekit";

export const actions = {
    submitPin: async (event) => {
        const {supabaseClient} = await getSupabase(event);
        const formData = await event.request.formData();
        const {data, error} = await supabaseClient
            .from('pins')
            .insert([
                {title: formData.get('pin-url'), url: formData.get('pin-url')},
            ]).select()
        if (data && data[0] && data[0].id) {
            return data[0]
        }
        return error
    },
    deletePin: async (event) => {
        const pinId = (await event.request.formData()).get('pin-id');
        const {supabaseClient} = await getSupabase(event);
        await supabaseClient
            .from('pins')
            .delete()
            .eq('id', pinId)
    }
};