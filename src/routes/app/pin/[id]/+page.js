import {getSupabase} from "@supabase/auth-helpers-sveltekit";
import {error} from '@sveltejs/kit';

export async function load(event) {
    const params = event.params;
    const {supabaseClient} = await getSupabase(event);
    let {data: pins, error: dbError} = await supabaseClient
        .from('pins')
        .select(`
                id,
                title,
                url,
                description,
                boards (
                  name
                ),
                profiles (
                  username
                ),
                created_at
        `)
        .eq('id', params.id)

    if (!pins || pins.length === 0) {
        throw error(404, 'Not found');
    }
    return {
        pin: pins[0]
    };
}