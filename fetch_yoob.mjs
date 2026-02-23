import fs from 'fs';

async function run() {
    try {
        const res = await fetch('https://pocketverse.herokuapp.com/LS_API/bloggo/profile?username=yoob');
        if (!res.ok) {
            console.error("Fetch failed", res.status, await res.text());
            return;
        }
        const data = await res.json();
        fs.writeFileSync('yoob_profile.json', JSON.stringify(data, null, 2));
        console.log("Saved to yoob_profile.json");
        console.log("Total blogs:", data.blogs?.length);
        if (data.blogs) {
            data.blogs.forEach(b => {
                console.log(`Title: ${b.title}, Key: ${b.blogKey}, Status: ${b.status}`);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

run();
