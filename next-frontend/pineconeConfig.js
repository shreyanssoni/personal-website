import { Pinecone } from '@pinecone-database/pinecone';

export default function initiate() {
  const pc = new Pinecone({
    apiKey: 'f418e1cd-77f6-42fe-a0ce-e0350715d656'
  });
  
  const index = pc.index('resumeindex');
  return index 
}
