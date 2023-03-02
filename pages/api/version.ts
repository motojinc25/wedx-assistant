import type { NextApiRequest, NextApiResponse } from 'next';
import packageJson from '../../package.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      res.status(200).json(packageJson.version);
      break;
    default:
      console.log(`Sorry, we are out of ${req.method}.`);
  }
}
