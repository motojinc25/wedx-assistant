import type { NextApiRequest, NextApiResponse } from 'next';

const AzureRegistry = require('azure-iothub').Registry;
const iotHubConnectionString = process.env['IOTHUB_CONNECTION_STRING'];
const registry = AzureRegistry.fromConnectionString(iotHubConnectionString);
const { v4: uuidv4 } = require('uuid');

const getDeviceList = async (whereQuery: any) => {
  return new Promise(function (resolve, reject) {
    const query = registry.createQuery('SELECT * FROM devices' + whereQuery);
    query.nextAsTwin(null, function (err: any, results: any) {
      if (err) {
        reject(err)
      } else {
        let devices: any = [];
        results.forEach(function (twin: any) {
          devices.push({
            key: twin.deviceId,
            deviceId: twin.deviceId,
            connectionState: twin.connectionState,
            authenticationType: twin.authenticationType,
            iotEdge: twin.capabilities.iotEdge.toString(),
            moduleList: [],
          });
        });
        resolve(devices);
      }
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      let whereQuery = '';
      if (req.query.isEdge) {
        whereQuery = ' WHERE capabilities.iotEdge=' + req.query.isEdge;
      }
      const deviceList = await getDeviceList(whereQuery);
      res.status(200).json(deviceList);
      break;
    case 'POST':
      if (!req.body) {
        res.status(400).json({ error: 'no exist body' });
      }
      const payload: any = req.body;
      const deviceInfo: any = {
        deviceId: 'agent-' + uuidv4(),
        capabilities: {
          iotEdge: false,
        }
      };
      if (payload.isEdge) {
        deviceInfo.deviceId = 'edge-' + uuidv4();
        deviceInfo.capabilities.iotEdge = true;
      }
      await registry.create(deviceInfo);
      res.status(200).json({
        key: deviceInfo.deviceId,
        deviceId: deviceInfo.deviceId,
        connectionState: 'Disconnected',
        authenticationType: 'sas',
        iotEdge: deviceInfo.capabilities.iotEdge.toString(),
        moduleList: [],
      });
      break;
    default:
      console.log(`Sorry, we are out of ${req.method}.`);
  }
}
