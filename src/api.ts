import dotenv from 'dotenv';

dotenv.config();

export interface CodeProjectCard {
  title: string;
  slug: string;
  preview: {
    title: string;
    url: string;
  };
  tags: string[];
}

const CODE_PROJECT_CARDS_GRAPHQL_FIELDS = `
  title
  slug
  preview {
    title
    url
  }
  tagsCollection {
    items {
      text
    }
  }
`;

function extractCodeProjectCardEntries(fetchResponse: any): any[] {
  const entries = fetchResponse?.data?.featuredCodeProjectCollection?.items;
  const entiresWithExtractedTags = entries?.map((entry: any) => {
    const tags = entry?.tagsCollection?.items?.map((item: any) => item?.text);
    delete entry.tagsCollection;
    return {
      ...entry,
      tags,
    };
  });
  return entiresWithExtractedTags;
}

async function fetchGraphQL(query: string): Promise<any> {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    }
  ).then((response: any) => response.json());
}

export async function getCodeProjectCardsContent(): Promise<CodeProjectCard[]> {
  let entries: any[] = [];

  try {
    const unprocessedEntries = await fetchGraphQL(
      `query {
      featuredCodeProjectCollection(
        order: sys_publishedAt_DESC,
      ) {
        items {
          ${CODE_PROJECT_CARDS_GRAPHQL_FIELDS}
        }
      }
    }`
    );
    entries = extractCodeProjectCardEntries(unprocessedEntries);
  } catch (err) {
    console.error('Error fetching project content from contentful CMS', err);
    process.exit(1);
  }

  return entries;
}
