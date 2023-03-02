import type { NextApiRequest, NextApiResponse } from 'next';

const AzureRegistry = require('azure-iothub').Registry;
const iotHubConnectionString = process.env["IOTHUB_CONNECTION_STRING"];
const registry = AzureRegistry.fromConnectionString(iotHubConnectionString);
const ServiceConnectionString = require('azure-iothub').ConnectionString;

const getDevice = async (deviceId: any) => {
  const deviceInfo = await registry.get(deviceId);
  return new Promise(function (resolve, reject) {
    const query = registry.createQuery('SELECT * FROM devices WHERE deviceId=\'' + deviceId + '\'');
    const hostName = ServiceConnectionString.parse(iotHubConnectionString).HostName;
    query.nextAsTwin(null, function (err: any, results: any) {
      if (err) {
        reject(err)
      } else {
        let device: any = {};
        results.forEach(function (twin: any) {
          device = {
            deviceId: twin.deviceId,
            displayName: twin.tags.displayName ? twin.tags.displayName : '',
            connectionState: twin.connectionState,
            authenticationType: twin.authenticationType,
            modelId: twin.modelId,
            iotEdge: twin.capabilities.iotEdge,
            deviceScope: twin.deviceScope ? twin.deviceScope : '',
            parentScopes: twin.parentScopes ? twin.parentScopes[0] : '',
            primarySymmetricKey: deviceInfo.responseBody.authentication.symmetricKey.primaryKey,
            primaryConnectionString: 'HostName=' + hostName + ';DeviceId=' + deviceId + ';SharedAccessKey=' + deviceInfo.responseBody.authentication.symmetricKey.primaryKey,
          };
          device.primarySymmetricKey = "**********";
          device.primaryConnectionString = "**********";
        });
        if (!device) {
          reject({ message: 'device is not found.' });
        }
        else {
          resolve(device);
        }
      }
    })
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { did } = req.query;
  switch (req.method) {
    case 'GET':
      try {
        const device = await getDevice(did);
        res.status(200).json(device);
      } catch (error) {
        res.status(500).json({ error: 'device is not found.' });
      }
      break;
    case 'DELETE':
      try {
        await registry.delete(did);
        res.status(200).json({
          deviceId: did,
        });
      } catch (error) {
        res.status(500).json({ error: 'device is not found.' });
      }
      break;
    default:
      console.log(`Sorry, we are out of ${req.method}.`);
  }
}
