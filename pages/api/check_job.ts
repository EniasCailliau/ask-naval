import type { NextApiRequest, NextApiResponse } from 'next'
import {getTask} from '@steamship/steamship-nextjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { taskId, workspace } = req.body as any;
  return res.json(await getTask({taskId, workspace}))
}