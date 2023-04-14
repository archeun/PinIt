export default function dbUtil(supabase) {

    return {
        pins: {
            async getAll(attributes = '*') {
                let {data, error} = await supabase
                    .from('pins')
                    .select(attributes);
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
            async getOne(id, attributes = '*') {
                let {data, error} = await supabase
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
                let {data, error} = await supabase
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
                let {data, error} = await supabase
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