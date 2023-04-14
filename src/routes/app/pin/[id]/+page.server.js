import {getSupabase} from "@supabase/auth-helpers-sveltekit";
import dbUtil from "$lib/dbUtil";

export const actions = {
    default: async (event) => {
        const {supabaseClient} = await getSupabase(event);
        const formData = await event.request.formData();
        await dbUtil(supabaseClient).pins.update(event.params.id, {
            title: formData.get('pin-title'),
            url: formData.get('pin-url'),
            description: formData.get('pin-description'),
            board_id: formData.get('pin-board-id')
        });
    }
};