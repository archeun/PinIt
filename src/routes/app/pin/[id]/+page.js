import {getSupabase} from "@supabase/auth-helpers-sveltekit";
import {error} from '@sveltejs/kit';
import {supabaseClient} from "$lib/supabaseClient";
import {browser} from '$app/environment';
import dbUtil from "$lib/dbUtil";

export async function load(event) {
    const params = event.params;
    let sbClient = supabaseClient;
    if (!browser) {
        const {supabaseClient} = await getSupabase(event);
        sbClient = supabaseClient
    }
    const {data} = await dbUtil(sbClient).pins.getOne(
        params.id,
        `id,title,url,description,board_id,created_at,boards (name),profiles (username)`
    )
    const pin = data
    if (!pin) {
        throw error(404, 'Not found');
    }
    return {pin};
}