import {getSupabase} from "@supabase/auth-helpers-sveltekit";
import dbUtil from "$lib/dbUtil";
import {fail} from "@sveltejs/kit";

export const actions = {
    default: async (event) => {
        const {supabaseClient} = await getSupabase(event);
        const formData = await event.request.formData();
        const result = await dbUtil(supabaseClient).pins.update(event.params.id, {
            title: formData.get('pin-title'),
            url: formData.get('pin-url'),
            description: formData.get('pin-description'),
            image: formData.get('pin-image'),
            board_id: formData.get('pin-board-id')
        });
        if (result.error) {
            return fail(400, result.error);
        }
        return result.data
    }
};