// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSteamshipPackage } from '@steamship/steamship-nextjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { question } = req.body as any;

  if (!question) {
    return res.json({ error: "Please enter a message." })
  }

  try {
    // Fetch a stub to the Steamship-hosted backend.
    // Use a different workspace name per-user to provide data isolation.
    const packageHandle = process.env.STEAMSHIP_PACKAGE_HANDLE as string;
    const dbId = process.env.NEXT_PUBLIC_INDEX_NAME as string;
    const workspace = dbId;

    if (!process.env.STEAMSHIP_API_KEY) {
      return res.json({ error: "Please set the STEAMSHIP_API_KEY env variable." })
    }
    if (!packageHandle) {
      return res.json({ error: "Please set the STEAMSHIP_PACKAGE_HANDLE env variable." })
    }
    if (!dbId) {
      return res.json({ error: "Unknown index selected." })
    }

    const pkg = await getSteamshipPackage({
      workspace: workspace,
      pkg: packageHandle,
      config: {index_name: dbId} as Map<string, any>
    })

    // Invoke a method on the package defined in steamship/api.py. Full syntax: pkg.invoke("method", {args}, "POST" | "GET")
    // Since we use invokeAsync here, the result will be a task that we can poll. This guarantees the Vercel function
    // can return quickly without having the paid plan.
    const resp: Task<any> = await pkg.invokeAsync('answer', {
      question: question,
    })

    const taskId = resp.taskId;

    if (!taskId) {
      return res.json({ error: "No taskId was returned from Steamship"});
    } else {
      return res.json({taskId, workspace});
    }

  } catch (ex) {
    console.log(ex)
    const awaitedEx = (await ex) as any;

    if (awaitedEx?.response?.data?.status?.statusMessage) {
      return res.json({ error: awaitedEx?.response?.data?.status?.statusMessage })
    }

    console.log(typeof awaitedEx)
    console.log(awaitedEx)

    return res.json({ error: `There was an error responding to your message.` })
  }
}
