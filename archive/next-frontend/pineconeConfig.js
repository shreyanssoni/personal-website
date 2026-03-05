import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey: process.env.NEXT_PINECONE_API
});

const indexName = "docs-quickstart-index"

await pc.createIndex({
  name: indexName,
  dimension: 2,
  metric: 'cosine',
  spec: { 
    serverless: { 
      cloud: 'aws', 
      region: 'us-east-1' 
    }
  } 
});