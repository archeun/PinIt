import {getSupabase} from "@supabase/auth-helpers-sveltekit";

export const actions = {
    default: async (event) => {
        const {supabaseClient} = await getSupabase(event);
        const formData = await event.request.formData();
        const {data, error} = await supabaseClient
            .from('pins')
            .update({
                title: formData.get('pin-title'),
                url: formData.get('pin-url'),
                description: formData.get('pin-description'),
                board_id: formData.get('pin-board-id')
            })
            .eq('id', event.params.id)
    }
};