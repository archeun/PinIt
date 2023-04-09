import {getSupabase} from "@supabase/auth-helpers-sveltekit";
import {error} from '@sveltejs/kit';
import {supabaseClient} from "../../../../lib/supabaseClient.js";
import {browser} from '$app/environment';

export async function load(event) {
    const params = event.params;
    let sbClient = supabaseClient;
    if (!browser) {
        const {supabaseClient} = await getSupabase(event);
        sbClient = supabaseClient
    }
    let {data: pins} = await sbClient
        .from('pins')
        .select(`id,title,url,description,board_id,created_at,boards (name),profiles (username)`)
        .eq('id', params.id)

    if (!pins || pins.length === 0) {
        throw error(404, 'Not found');
    }
    return {
        pin: pins[0]
    };
}