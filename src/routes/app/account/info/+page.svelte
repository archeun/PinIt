<script>
    import {page} from '$app/stores'
    import {onMount} from 'svelte'
    import {supabaseClient} from '$lib/supabaseClient'
    import dbUtil from "$lib/dbUtil";
    import toast from "svelte-french-toast";

    const session = $page.data.session;
    let loading = false
    let username = null
    let avatarUrl = null

    onMount(() => {
        getProfile()
    })

    const getProfile = async () => {
        try {
            loading = true
            const {user} = session

            const {data, error, status} = await dbUtil(supabaseClient).profiles.getOne(user.id, 'username, avatar_url')

            if (data) {
                username = data.username
                avatarUrl = data.avatar_url
            }

            if (error && status !== 406) throw error
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message)
            }
        } finally {
            loading = false
        }
    }

    async function updateProfile() {
        try {
            loading = true
            const {user} = session

            let {error} = await dbUtil(supabaseClient).profiles.update(user.id, {
                username,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            })

            if (error) throw error
            toast.success('Successfully updated')
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message)
            }
        } finally {
            loading = false
        }
    }
</script>

<svelte:head>
    <title>Supabase + SvelteKit</title>
    <meta name="description" content="SvelteKit using supabase-js v2"/>
</svelte:head>

<div class="flex justify-center">
    <div class="card w-96 bg-primary mt-[5%] shadow-lg">
        <figure class="pt-16"><img alt="{username}" src="{avatarUrl}"></figure>
        <div class="card-body">
            <form class="form-widget" on:submit|preventDefault="{updateProfile}">
                <div class="form-control">
                    <label class="input-group input-group-vertical">
                        <span>Email</span>
                        <input id="email" type="text" class="input w-full max-w-xs" value="{session.user.email}"
                               disabled/>
                    </label>
                </div>
                <div class="form-control mt-2">
                    <label class="input-group input-group-vertical">
                        <span>Name</span>
                        <input required id="username" type="text" class="input w-full max-w-xs"
                               bind:value="{username}"/>
                    </label>
                </div>
                <div class="card-actions justify-end mt-5">
                    <input type="submit" class="btn btn-success" value={loading ? 'Loading...' : 'Update'}
                           disabled={loading}/>
                </div>
            </form>
        </div>
    </div>
</div>
