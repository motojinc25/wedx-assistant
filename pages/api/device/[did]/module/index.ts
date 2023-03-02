import type { NextApiRequest, NextApiResponse } from 'next';

const AzureRegistry = require('azure-iothub').Registry;
const iotHubConnectionString = process.env["IOTHUB_CONNECTION_STRING"];
const registry = AzureRegistry.fromConnectionString(iotHubConnectionString);

interface Module {
  key: any;
  deviceId: any;
  moduleId: any;
  status: any;
  lastStartTimeUtc: any;
  image: any;
  statusDescription?: any;
  settings?: any;
}

interface SystemModule {
  runtimeStatus: any;
  lastStartTimeUtc: any;
  settings: any;
}

async function getModuleList(deviceId: any) {
  return new Promise(function (resolve, reject) {
    const query = registry.createQuery('SELECT deviceId, moduleId, properties.reported.systemModules, properties.reported.modules FROM devices.modules WHERE deviceId=\'' + deviceId + '\' AND moduleId=\'$edgeAgent\'');
    query.nextAsTwin(null, function (err: any, results: any) {
      if (err) {
        reject(err)
      } else {
        let modules: Module[] = [];
        const properties = Object.assign({}, ...results);
        if (!properties.hasOwnProperty('systemModules')) {
          resolve(modules);
        } else {
          for (const [key, value] of Object.entries<SystemModule>(properties.systemModules)) {
            modules.push({
              key: key,
              deviceId: deviceId,
              moduleId: '$' + key,
              status: value.runtimeStatus,
              lastStartTimeUtc: value.lastStartTimeUtc,
              image: value.settings.image,
            });

          }
        }
        if (!properties.hasOwnProperty('modules')) {
          resolve(modules);
        } else {
          for (const [key, value] of Object.entries<Module>(properties.modules)) {
            modules.push({
              key: key,
              deviceId: deviceId,
              moduleId: key,
              status: value.status,
              lastStartTimeUtc: value.lastStartTimeUtc,
              image: value.settings.image,
            });
          }
          resolve(modules);
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
        const moduleList = await getModuleList(did);
        res.status(200).json(moduleList);
      } catch (_) {
        res.status(200).json([]);
      }
      break;
  }
}
