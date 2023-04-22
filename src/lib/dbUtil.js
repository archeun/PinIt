export default function dbUtil(supabase) {

    return {
        profiles: {
            async getAll(attributes = '*') {
                const {data, error} = await supabase
                    .from('profiles')
                    .select(attributes);
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
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
        pins: {
            async getAllCount() {
                const {count, error} = await supabase
                    .from('pins')
                    .select('*', {count: 'exact', head: true})
                if (error) {
                    console.error(error)
                }
                return count
            },
            async search(
                attributes = '*',
                searchParams = {},
                order = {by: 'created_at', opts: {ascending: false}},
                range = {start: 0, end: 9},
                countOnly = false
            ) {
                let dataset = supabase
                    .from('pins');

                if (countOnly) {
                    dataset = dataset.select(attributes, {count: 'exact', head: true});
                } else {
                    dataset = dataset.select(attributes);
                }

                if (searchParams) {
                    if (searchParams.title) {
                        dataset = dataset.ilike('title', `%${searchParams.title}%`);
                    }
                    if (searchParams.url) {
                        dataset = dataset.ilike('url', `%${searchParams.url}%`);
                    }
                    if (searchParams.description) {
                        dataset = dataset.ilike('description', `%${searchParams.description}%`);
                    }
                    if (searchParams.board_id) {
                        dataset = dataset.eq('board_id', searchParams.board_id);
                    }
                    if (searchParams.owner_id) {
                        dataset = dataset.eq('owner_id', searchParams.owner_id);
                    }
                    if (searchParams.fromDate) {
                        dataset = dataset.gte('created_at', searchParams.fromDate);
                    }
                    if (searchParams.toDate) {
                        dataset = dataset.lte('created_at', searchParams.toDate);
                    }
                }
                if (!countOnly) {
                    dataset = await dataset.order(order.by, order.opts).range(range.start, range.end);
                }
                if (dataset.error) {
                    console.error(dataset.error)
                }
                return dataset
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
                        {title: pinData.title, url: pinData.url},
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
        pinStars: {
            async getStarByCurrentUserForPin(pinId) {
                const userId = (await supabase.auth.getUser()).data.user.id
                const {data, error} = await supabase
                    .from('pin_stars')
                    .select('*')
                    .eq('pin_id', pinId)
                    .eq('profile_id', userId);
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
            async removeStarByCurrentUserForPin(pinId) {
                const userId = (await supabase.auth.getUser()).data.user.id
                const {data, error} = await supabase
                    .from('pin_stars')
                    .delete()
                    .eq('pin_id', pinId)
                    .eq('profile_id', userId);
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
            async addStarByCurrentUserForPin(pinId) {
                const userId = (await supabase.auth.getUser()).data.user.id
                const {data, error} = await supabase
                    .from('pin_stars')
                    .insert([
                        {profile_id: userId, pin_id: pinId},
                    ]).select();
                if (error) {
                    console.error(error)
                }
                return {data, error}
            },
        }
    }

}