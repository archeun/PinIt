<script>
    import {enhance} from '$app/forms';
    import moment from "moment";

    export let pin = {};
    export let mode;
    export let onDeletePin;
    export let onToggleStar;

</script>

<div class="card card-compact w-full shadow mb-4 rounded-none">
    <div class="card-body bg-base-300 h-[155px] max-h-[155px] text-sm">
        <div class="grid grid-cols-12">
            <div class="col-span-2 h-[120px] max-h-[120px] flex justify-center">
                <img class="max-h-[120px]"
                     src={pin.image ? pin.image: 'https://placehold.co/200x120?text=No+Image+Available'}
                     alt={pin.title}>
            </div>
            <div class="col-span-10 ml-2">
                <div class="h-24">
                    <div class="grid grid-cols-12">
                        <div class="card-title text-info col-span-11 break-words break-all mb-4">
                            <a class="text-sm line-clamp-2" target="_blank" href="{pin.url}">{pin.title}</a>
                        </div>
                        {#if pin.isOwnPin && mode !== 'preview'}
                            <div class="justify-self-end col-span-1 text-xs flex h-fit">
                                <a href={`/app/pin/${pin.id}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
                                    </svg>
                                </a>
                                <div class="dropdown dropdown-bottom dropdown-end ml-2">
                                    <div tabindex="0" class="cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                                        </svg>
                                    </div>
                                    <div tabindex="0"
                                         class="dropdown-content card card-compact w-64 p-2 shadow bg-warning">
                                        <div class="card-body">
                                            <p class="text-black">Do you really want to delete this pin?</p>
                                            <div class="card-actions justify-end">
                                                <form name="delete-pin-form" method="POST" action="/app/feed?/deletePin"
                                                      use:enhance={onDeletePin}>
                                                    <input name="pin-id" type="hidden" value={pin.id}/>
                                                    <button class="btn btn-error btn-xs">Yes, delete</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <p class="whitespace-pre-wrap break-words line-clamp-3 text-xs">
                        {#if (!pin.description || pin.description.length === 0)}
                            <em>No description provided ...</em>
                        {:else }
                            {pin.description}
                        {/if}
                    </p>
                </div>

                {#if mode !== 'preview'}
                    <div class="mt-1">
                        <div class="grid grid-cols-12">
                            <div class="col-span-6">
                                <div class="badge badge-success text-xs">{pin.boards?.name}</div>
                            </div>
                            <div class="col-span-6 place-self-end flex">
                                <div class="badge text-xs mt-0.5">
                                    <em>{pin.profiles?.username}
                                        , {moment(pin.created_at).format('MMMM Do YYYY, h:mm:ss a')}</em>
                                </div>
                                <form name="toggle-pin-star-form" method="POST" action="/app/feed?/toggleStar"
                                      use:enhance={onToggleStar} class="ml-2">
                                    <input name="pin-id" type="hidden" value={pin.id}/>
                                    <button class="btn btn-xs btn-outline" class:btn-warning={pin.hasStarred}
                                            class:btn-ghost={!pin.hasStarred}>
                                        {#if pin.hasStarred}
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                 fill="currentColor" class="w-4 h-4">
                                                <path fill-rule="evenodd"
                                                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                      clip-rule="evenodd"/>
                                            </svg>
                                        {:else }
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                                            </svg>
                                        {/if}
                                        <span class="ml-1">{pin.pin_stars.length}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>