<script>
    export let errors = []
</script>

{#if errors}
    <ul class="text-xs text-error">
        {#each errors as error}
            <li>{error}</li>
        {/each}
    </ul>
{/if}