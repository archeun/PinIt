import {getSupabase} from "@supabase/auth-helpers-sveltekit";
import dbUtil from "$lib/dbUtil";

export const actions = {
    submitPin: async (event) => {
        const {supabaseClient} = await getSupabase(event);
        const formData = await event.request.formData();
        const {data, error} = await dbUtil(supabaseClient).pins.insert({url: formData.get('pin-url')})
        if (data && data[0] && data[0].id) {
            return data[0]
        }
        return error
    },
    deletePin: async (event) => {
        const pinId = (await event.request.formData()).get('pin-id');
        const {supabaseClient} = await getSupabase(event);
        await dbUtil(supabaseClient).pins.delete(pinId)
    },
    toggleStar: async (event) => {
        const pinId = (await event.request.formData()).get('pin-id');
        const {supabaseClient} = await getSupabase(event);
        const existingStar = await dbUtil(supabaseClient).pinStars.getStarByCurrentUserForPin(pinId)
        if(existingStar && existingStar.data && existingStar.data.length > 0) {
            await dbUtil(supabaseClient).pinStars.removeStarByCurrentUserForPin(pinId)
        } else {
            await dbUtil(supabaseClient).pinStars.addStarByCurrentUserForPin(pinId)
        }
    }
};