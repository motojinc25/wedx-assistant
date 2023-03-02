import type { NextApiRequest, NextApiResponse } from 'next';

const CosmosClient = require("@azure/cosmos").CosmosClient;
const cosmosDbEndpoint = process.env['COSMOSDB_ENDPOINT'];
const cosmosDbPrimaryKey = process.env['COSMOSDB_PRIMARY_KEY'];
const { v4: uuidv4 } = require('uuid');

const config: any = {
  endpoint: cosmosDbEndpoint,
  key: cosmosDbPrimaryKey,
  databaseId: "wedx",
  containerId: "assistant",
};

interface DataType {
  key: string;
  moduleId: string;
  moduleName: string;
  moduleVersion: string;
  osPlatform: string[];
  nodeType: string;
  containerId: string;
  imageUri: string;
  iconUri: string;
  restartPolicy: string;
  desiredStatus: string;
  imagePullPolicy: string;
  startupOrder: string;
  environmentVariables: string;
  containerCreateOptions: string;
  moduleTwinSettings: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { endpoint, key, databaseId, containerId } = config;
  const client = new CosmosClient({ endpoint: endpoint, key: key });
  const database = client.database(databaseId);
  const container = database.container(containerId);

  switch (req.method) {
    case 'GET':
      const itemList: DataType[] = [];
      try {
        const querySpec: object = {
          query: "SELECT * from c"
        };
        const { resources: items } = await container.items.query(querySpec).fetchAll();
        items.forEach((item: any) => {
          itemList.push({
            key: item.id,
            moduleId: item.id,
            moduleName: item.moduleName,
            moduleVersion: item.moduleVersion,
            osPlatform: item.osPlatform,
            nodeType: item.nodeType,
            containerId: item.containerId,
            imageUri: item.imageUri,
            iconUri: item.iconUri,
            restartPolicy: item.restartPolicy,
            desiredStatus: item.desiredStatus,
            imagePullPolicy: item.imagePullPolicy,
            startupOrder: item.startupOrder,
            environmentVariables: item.environmentVariables,
            containerCreateOptions: item.containerCreateOptions,
            moduleTwinSettings: item.moduleTwinSettings,
          })
        });
      } catch (err: any) {
        console.log(err.message);
      }
      res.status(200).json(itemList);
      break;
    case 'POST':
      if (!req.body) {
        res.status(400).json({ error: 'no exist body' });
      }
      const payload: any = req.body;
      const moduleId: string = 'module-' + uuidv4();
      const itemInfo: any = {
        id: moduleId,
        schemaVersion: 1,
        partitionKey: 'module',
        ...payload
      };
      await container.items.create(itemInfo);
      res.status(200).json({
        key: moduleId,
        moduleId: moduleId,
        moduleName: itemInfo.moduleName,
        moduleVersion: itemInfo.moduleVersion,
        nodeType: itemInfo.nodeType,
      });
      break;
    default:
      console.log(`Sorry, we are out of ${req.method}.`);
  }
}
