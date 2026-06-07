export async function syndicateBlog(post) {
    const results = { medium: false, devto: false, hashnode: false };
    const canonicalUrl = `https://eyepune.com/blog/${post.slug}`;

    console.log('[Syndication] Starting auto-syndication for:', post.title);

    // Medium Auto-Syndication
    if (process.env.MEDIUM_INTEGRATION_TOKEN) {
        try {
            // First get the user ID
            const meRes = await fetch('https://api.medium.com/v1/me', {
                headers: { 'Authorization': `Bearer ${process.env.MEDIUM_INTEGRATION_TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });
            const meData = await meRes.json();
            if (meData?.data?.id) {
                const authorId = meData.data.id;
                // Publish post
                const postRes = await fetch(`https://api.medium.com/v1/users/${authorId}/posts`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${process.env.MEDIUM_INTEGRATION_TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        title: post.title,
                        contentFormat: "html",
                        content: `<h1>${post.title}</h1>\n<p><em>${post.excerpt}</em></p>\n${post.content}\n<hr><p><em>Originally published at <a href="${canonicalUrl}">EyE PunE</a>.</em></p>`,
                        canonicalUrl: canonicalUrl,
                        tags: post.tags,
                        publishStatus: "public"
                    })
                });
                if (postRes.ok) results.medium = true;
            }
        } catch (e) {
            console.warn('[Syndication] Medium failure:', e.message);
        }
    }

    // Dev.to Auto-Syndication
    if (process.env.DEVTO_API_KEY) {
        try {
            const devRes = await fetch('https://dev.to/api/articles', {
                method: 'POST',
                headers: { 'api-key': process.env.DEVTO_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    article: {
                        title: post.title,
                        published: true,
                        body_markdown: `**${post.excerpt}**\n\n${post.content}\n\n*Originally published on [EyE PunE](${canonicalUrl})*`,
                        tags: post.tags.slice(0, 4).map(t => t.replace(/[^a-zA-Z0-9]/g, '')),
                        canonical_url: canonicalUrl
                    }
                })
            });
            if (devRes.ok) results.devto = true;
        } catch (e) {
            console.warn('[Syndication] Dev.to failure:', e.message);
        }
    }
    // Hashnode Auto-Syndication
    if (process.env.HASHNODE_API_KEY) {
        try {
            // Get publication ID (Hashnode GraphQL V2)
            const meQuery = await fetch('https://gql.hashnode.com/', {
                method: 'POST',
                headers: { 'Authorization': process.env.HASHNODE_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `query { me { publications(first: 1) { edges { node { id } } } } }`
                })
            });
            const meData = await meQuery.json();
            const pubId = meData?.data?.me?.publications?.edges?.[0]?.node?.id;

            if (pubId) {
                const publishMutation = await fetch('https://gql.hashnode.com/', {
                    method: 'POST',
                    headers: { 'Authorization': process.env.HASHNODE_API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: `mutation PublishPost($input: PublishPostInput!) { publishPost(input: $input) { post { id url } } }`,
                        variables: {
                            input: {
                                title: post.title,
                                publicationId: pubId,
                                contentMarkdown: `**${post.excerpt}**\n\n${post.content}\n\n*Originally published on [EyE PunE](${canonicalUrl})*`,
                                originalArticleURL: canonicalUrl
                            }
                        }
                    })
                });
                if (publishMutation.ok) results.hashnode = true;
            }
        } catch (e) {
            console.warn('[Syndication] Hashnode failure:', e.message);
        }
    }

    return results;
}
