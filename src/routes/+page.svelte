<script>
    import {page} from '$app/stores'
    import {onMount} from "svelte";
    import {routeToPage} from '$lib/navigationUtil';
    import {supabaseClient} from "../lib/supabaseClient.js";

    onMount(() => {
        if ($page.data.session) {
            routeToPage('/app')
        }
    })

    async function signInWithGoogle() {
        const {data, error} = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
        })
    }
</script>

<div class="hero min-h-screen bg-base-100">
    <div class="hero-content text-center">
        <div class="max-w-lg">
            <h1 class="text-8xl font-bold text-accent">ARCHEUN</h1>
            <p class="py-6">Hello, what are you planning to accomplish today? Please login to access your apps ...</p>
            <button class="btn btn-primary" on:click={signInWithGoogle}>Sign in with Google</button>
        </div>
    </div>
</div>
