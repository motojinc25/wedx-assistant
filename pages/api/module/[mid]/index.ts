import type { NextApiRequest, NextApiResponse } from 'next';
const CosmosClient = require("@azure/cosmos").CosmosClient;
const cosmosDbEndpoint = process.env['COSMOSDB_ENDPOINT'];
const cosmosDbPrimaryKey = process.env['COSMOSDB_PRIMARY_KEY'];

const config: any = {
  endpoint: cosmosDbEndpoint,
  key: cosmosDbPrimaryKey,
  databaseId: "wedx",
  containerId: "assistant",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mid } = req.query;
  const { endpoint, key, databaseId, containerId } = config;
  const client = new CosmosClient({endpoint: endpoint, key: key});
  const database = client.database(databaseId);
  const container = database.container(containerId);

  switch (req.method) {
    case 'GET':
      res.status(200).json({message: 'na'});
      break;
    case 'DELETE':
      try {
        await container.item(mid, 'module').delete();
        res.status(200).json({
          moduleId: mid,
        });
      } catch (err: any) {
        res.status(500).json({error: 'module is not found.'});
      }
      break;
    default:
      console.log(`Sorry, we are out of ${req.method}.`);
  }
}
