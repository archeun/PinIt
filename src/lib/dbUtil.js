export default function dbUtil(supabase) {

    return {
        pins: {
            async getAllCount() {
                const { count, error } = await supabase
                    .from('pins')
                    .select('*', { count: 'exact', head: true })
                if (error) {
                    console.error(error)
                }
                return count
            },
            async getAll(
                attributes = '*',
                order = {by: 'created_at', opts: {ascending: false}},
                range = {start: 0, end: 9}
            ) {
                const {data, error} = await supabase
                    .from('pins')
                    .select(attributes)
                    .order(order.by, order.opts)
                    .range(range.start, range.end);
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
            async getOne(id, attributes = '*') {
                const {data, error} = await supabase
                    .from('pins')
                    .select(attributes)
                    .eq('id', id)
                    .single();
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
            async insert(pinData) {
                const {data, error} = await supabase
                    .from('pins')
                    .insert([
                        {title: pinData.url, url: pinData.url},
                    ]).select();
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
            async update(id, pinData) {
                const {data, error} = await supabase
                    .from('pins')
                    .update(pinData)
                    .eq('id', id);
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
            async delete(id) {
                const {data, error} = await supabase
                    .from('pins')
                    .delete()
                    .eq('id', id);
                if (error) {
                    console.error(error)
                }
                return {data, error}
            }
        },
        boards: {
            async getAll(attributes = '*') {
                const {data, error} = await supabase
                    .from('boards')
                    .select(attributes);
                if (error) {
                    console.error(error)
                }
                return {data, error}
            }
        },
        profiles: {
            async getOne(id, attributes = '*') {
                const {data, error} = await supabase
                    .from('profiles')
                    .select(attributes)
                    .eq('id', id)
                    .single();
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
            async update(id, profileData) {
                const {data, error} = await supabase
                    .from('profiles')
                    .update(profileData)
                    .eq('id', id);
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
        }
    }

}