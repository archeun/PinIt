const API_URL = 'https://jsonlink.io/api/extract?url=';
export async function GET({ url }) {
    const metadata = await fetch(`${API_URL}${url.searchParams.get('url')}`);
    return new Response(JSON.stringify(await metadata.json()));
}